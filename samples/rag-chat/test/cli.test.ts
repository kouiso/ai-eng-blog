import assert from "node:assert/strict";
import { it } from "node:test";
import type { QueryFn } from "../src/answer.ts";
import { main } from "../src/cli.ts";

function fakeQuery(messages: unknown[]): QueryFn {
  return () =>
    (async function* () {
      yield* messages;
    })();
}

it("ログインが無いとき、検索結果とコンテキストとログインの案内を出して正常に終わる（exit 0 相当）", async () => {
  const lines: string[] = [];
  const run = fakeQuery([
    { type: "assistant", error: "authentication_failed" },
    { type: "result", subtype: "success", is_error: true, result: "Not logged in" },
  ]);
  await main(run, ["日本語の文章はどうやって検索していますか？"], (l) => lines.push(l));
  const out = lines.join("\n");

  assert.match(out, /\[1\] 02-retrieval\.md#1/);
  assert.match(out, /--- Claude に渡す予定のコンテキスト ---/);
  assert.match(out, /<chunk index="1"/);
  assert.match(out, /\/login/);
  assert.doesNotMatch(out, /--- 回答/);
});

it("ログインしているとき、回答と起動メッセージの値を出す", async () => {
  const lines: string[] = [];
  const run = fakeQuery([
    { type: "system", subtype: "init", claude_code_version: "9.9.9", apiKeySource: "none" },
    { type: "result", subtype: "success", is_error: false, result: "文字 bigram です。", num_turns: 1, total_cost_usd: 0.01 },
  ]);
  await main(run, ["検索"], (l) => lines.push(l));
  const out = lines.join("\n");
  assert.match(out, /--- 回答/);
  assert.match(out, /文字 bigram です。/);
  assert.match(out, /claude_code_version=9\.9\.9 apiKeySource=none/);
});
