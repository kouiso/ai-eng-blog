import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { it } from "node:test";
import { fileURLToPath } from "node:url";
import { answerWithClaude, NotLoggedInError, type QueryFn } from "../src/answer.ts";
import { chunkMarkdown } from "../src/chunk.ts";

const [chunk] = chunkMarkdown("02-retrieval.md", "# トークン化\n\n文字 bigram を使います。");
assert.ok(chunk);
const hits = [{ chunk, score: 1 }];

// モデルの呼び出し（Agent SDK の query()）を差し替える。ログインもネットワークも要らない。
function fakeQuery(messages: unknown[], seen: { params?: Parameters<QueryFn>[0] } = {}): QueryFn {
  return (params) => {
    seen.params = params;
    return (async function* () {
      yield* messages;
    })();
  };
}

it("答えの段は Agent SDK のラッパー経由で呼ばれ、資料とモデル名が渡り、result の本文を返す", async () => {
  const seen: { params?: Parameters<QueryFn>[0] } = {};
  const run = fakeQuery(
    [
      { type: "system", subtype: "init" },
      { type: "result", subtype: "success", is_error: false, result: "文字 bigram を使います。(02-retrieval.md#1)", num_turns: 1, total_cost_usd: 0.01 },
    ],
    seen,
  );
  const result = await answerWithClaude(run, "claude-sonnet-5-5", "どう検索する？", hits);

  assert.equal(seen.params?.options.model, "claude-sonnet-5-5");
  assert.deepEqual(seen.params?.options.tools, []);
  assert.deepEqual(seen.params?.options.settingSources, []);
  assert.match(seen.params?.prompt ?? "", /文字 bigram を使います/);
  assert.equal(result.text, "文字 bigram を使います。(02-retrieval.md#1)");
  assert.equal(result.numTurns, 1);
  assert.equal(result.totalCostUsd, 0.01);
});

it("答えの段は ANTHROPIC_API_KEY を読まない（キーが空でも、入っていても同じに動く）", async () => {
  const saved = process.env.ANTHROPIC_API_KEY;
  const originalEnv = process.env;
  const reads: string[] = [];
  process.env = new Proxy(process.env, {
    get(target, key, receiver) {
      if (key === "ANTHROPIC_API_KEY") reads.push(String(key));
      return Reflect.get(target, key, receiver);
    },
  });
  try {
    delete process.env.ANTHROPIC_API_KEY;
    const run = fakeQuery([{ type: "result", subtype: "success", is_error: false, result: "ok" }]);
    const result = await answerWithClaude(run, "claude-sonnet-5-5", "q", hits);
    assert.equal(result.text, "ok");
    assert.deepEqual(reads, []);
  } finally {
    process.env = originalEnv;
    if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved;
  }
});

it("src にはキーの変数名も @anthropic-ai/sdk（Messages API）の import も無い", () => {
  const dir = fileURLToPath(new URL("../src/", import.meta.url));
  for (const name of readdirSync(dir)) {
    const body = readFileSync(dir + name, "utf8");
    assert.doesNotMatch(body, /ANTHROPIC_API_KEY/, `${name} がキーを参照している`);
    assert.doesNotMatch(body, /@anthropic-ai\/sdk/, `${name} が Messages API の SDK を使っている`);
  }
  const pkg = readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8");
  assert.doesNotMatch(pkg, /"@anthropic-ai\/sdk"/);
});

it("ログインが無い（authentication_failed）ときは NotLoggedInError を投げる", async () => {
  const run = fakeQuery([
    { type: "assistant", error: "authentication_failed" },
    { type: "result", subtype: "success", is_error: true, result: "Not logged in" },
  ]);
  await assert.rejects(() => answerWithClaude(run, "claude-sonnet-5-5", "q", hits), NotLoggedInError);
});

it("is_error の result は、本文（message.result）をエラーに含める", async () => {
  const run = fakeQuery([{ type: "result", subtype: "success", is_error: true, result: "rate limited" }]);
  await assert.rejects(() => answerWithClaude(run, "claude-sonnet-5-5", "q", hits), /rate limited/);
});

it("起動メッセージの claude_code_version と apiKeySource を結果に載せる", async () => {
  const run = fakeQuery([
    { type: "system", subtype: "init", claude_code_version: "9.9.9", apiKeySource: "none" },
    { type: "result", subtype: "success", is_error: false, result: "ok" },
  ]);
  const result = await answerWithClaude(run, "claude-sonnet-5-5", "q", hits);
  assert.equal(result.claudeCodeVersion, "9.9.9");
  assert.equal(result.apiKeySource, "none");
});

it("ログイン以外の失敗は NotLoggedInError にせず、そのままエラーにする", async () => {
  const run = fakeQuery([{ type: "result", subtype: "error_max_turns", is_error: true }]);
  await assert.rejects(
    () => answerWithClaude(run, "claude-sonnet-5-5", "q", hits),
    (e: unknown) => e instanceof Error && !(e instanceof NotLoggedInError),
  );
});
