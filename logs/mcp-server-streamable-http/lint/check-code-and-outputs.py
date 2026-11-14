# G04 の確認: 記事のコードブロックが code/ のファイルと1文字も違わないこと、
# 記事のコマンドが run/ のログの command: と同じこと、記事に載せた実行結果が run/ のログから
# 機械的に取り出したものと一致することを調べる。
# logs/rag-hybrid-search-rrf/lint/check-code-and-outputs.py を、この記事のファイル名と
# ログの書式（code/extra/run.sh の出力。コマンドは1つの文字列のまま記録）に合わせて書き換えたもの。
# 使い方: python3 logs/mcp-server-streamable-http/lint/check-code-and-outputs.py [run のフォルダ]（リポジトリのルートで）
# run のフォルダを渡すと、run/ の代わりにそこのログを読む（2026-11-10 は、run/ へ写す前の同じログを作業場所で読んだ）。
import re, sys

L = "logs/mcp-server-streamable-http/"
article = open("content/articles/mcp-server-streamable-http.md", encoding="utf-8").read()
blocks = re.findall(r"```(\w+)\n(.*?)\n```", article, re.S)
fences = [b for _, b in blocks]

RUN = (sys.argv[1].rstrip("/") + "/") if len(sys.argv) > 1 else L + "run/"

def run(n):
    t = open(RUN + f"{n:02d}.log", encoding="utf-8").read()
    head, out = t.split("--- stdout+stderr ---\n", 1)
    cmd = re.search(r"^command: (.*?)\nexit: ", head, re.M | re.S).group(1)
    code = re.search(r"^exit: (\d+)$", head, re.M).group(1)
    return cmd, out.strip("\n"), code

ok = True
def check(label, cond):
    global ok
    ok &= bool(cond)
    print(f"{label}: {bool(cond)}")

files = ["package.json", "tsconfig.json", "src/server.ts", "src/check.ts", "extra/reuse-snippet.ts"]
codes = {}
for f in files:
    codes[f] = open(L + "code/" + f, encoding="utf-8").read().rstrip("\n")
    check(f"code {f} in article", codes[f] in fences)

# 記事の ts/json のコードブロックは、すべて code/ のどれかと一致する（記事にだけあるコードが無い）
for lang, body in blocks:
    if lang in ("ts", "json"):
        check(f"fence {lang} {body.splitlines()[0][:40]!r} in code/", body in codes.values())

# 悪い例の書き換えが、code/ の変種と一致する（server.reuse.ts = server.ts の app.post を reuse-snippet.ts に置き換えたもの）
srv = codes["src/server.ts"]
reuse = open(L + "code/extra/server.reuse.ts", encoding="utf-8").read().rstrip("\n")
good_post = srv[srv.index('app.post("/mcp"'):srv.index('app.all("/mcp"')].rstrip("\n")
check("server.reuse.ts == server.ts with app.post replaced by reuse-snippet.ts", srv.replace(good_post, codes["extra/reuse-snippet.ts"]) == reuse)
no405 = open(L + "code/extra/server.no-405.ts", encoding="utf-8").read().rstrip("\n")
all_block = srv[srv.index('app.all("/mcp"'):srv.index("const PORT")]
check("server.no-405.ts == server.ts without the app.all block", srv.replace(all_block, "") == no405)

# コマンド: 記事のコードブロックにあり、ログの command: と同じ
check("article has 'mkdir -p char-count-http/src\\ncd char-count-http'", "mkdir -p char-count-http/src\ncd char-count-http" in fences)
check("run/01 command is mkdir", run(1)[0] == "mkdir -p char-count-http/src")
check("article has 'npm run build\\nnpm start'", "npm run build\nnpm start" in fences)
for n, cmd in {3: "npm install", 4: "npm run build", 5: "npm start", 6: "npm run check"}.items():
    check(f"run/{n:02d} command == {cmd!r}", run(n)[0] == cmd)
check("article has 'npm install'", "npm install" in fences)
check("article has 'npm run check'", "npm run check" in fences)
for n in [7, 8, 9, 10, 11]:
    check(f"run/{n:02d} curl command in article", run(n)[0] in fences)
claude_block = next(b for b in fences if b.startswith("$ claude mcp add"))
for n in [13, 14, 15, 16]:
    cmd, out, _ = run(n)
    check(f"run/{n:02d} '$ {cmd}' + output in Claude Code block", f"$ {cmd}\n{out}" in claude_block)

# 実行結果: ログから取り出したものが記事のコードブロックと一致
for n in [3, 5, 6, 7, 8, 9, 10, 11, 20, 27]:
    check(f"output run/{n:02d} in article", run(n)[1] in fences)
check("run/31 (restored) output == run/06 output", run(31)[1] == run(6)[1])
check("run/23 exception text in article", run(23)[1].split("2nd threw: ", 1)[1] in fences)
abort_line = "client error: SSE stream disconnected: AbortError: This operation was aborted"
check("AbortError line in article", abort_line in fences)
r36 = run(36)[1]
check("run/36: 30 runs, all ok=1, abort=1 in 3", r36.count("ok=1") == 30 and r36.count("abort=1") == 3)
r42 = run(42)[1]
check("run/42 (no 405): 30 runs, all ok=1, notfound=2 in 30, abort=1 in 0", r42.count("ok=1") == 30 and r42.count("notfound=2") == 30 and r42.count("abort=1") == 0)
check("run/38: tsc_exit=0 with @types/express", run(38)[1].endswith("tsc_exit=0"))
# ブラウザのプリフライト: 記事の curl がログの command: と同じで、出力も記事のとおり。405 で Access-Control-* が無い
check("run/47 curl OPTIONS command in article", run(47)[0] in fences)
check("output run/47 in article", run(47)[1] in fences)
check("run/47: 405 and no Access-Control-Allow header", run(47)[1].startswith("HTTP/1.1 405") and "access-control-allow" not in run(47)[1].lower())
check("run/48: POST with allowed Origin is 200 without Access-Control-Allow-Origin", run(48)[1].startswith("HTTP/1.1 200") and "access-control-allow-origin" not in run(48)[1].lower())
cors = open(L + "code/extra/server.cors-check.ts", encoding="utf-8").read().rstrip("\n")
check("server.cors-check.ts == server.ts with ALLOWED_ORIGINS = [\"http://localhost:5173\"]", srv.replace("const ALLOWED_ORIGINS: string[] = [];", 'const ALLOWED_ORIGINS: string[] = ["http://localhost:5173"];') == cors)
check("article names http://localhost:5173 as the ALLOWED_ORIGINS value", '`"http://localhost:5173"`' in article)
check("run/21, 22: 500 with 0 bytes", all("status: 500  0 bytes" == run(n)[1] for n in (21, 22)))
check("run/19: server printed only the start line", run(19)[1].splitlines()[-1].startswith("char-count MCP server:") and "Error" not in run(19)[1])
check("run/37: 7 TS7006 errors without @types/express", run(37)[1].count("error TS7006") == 7)
check("run/52: claude mcp list shows Connected while server runs", "√ Connected" in run(52)[1])
check("run/53: claude mcp list shows Failed to connect after server stopped", "× Failed to connect" in run(53)[1] and "√ Connected" not in run(53)[1])
for n in range(1, 55):
    print(f"run {n:02d} exit={run(n)[2]}")
print("ALL OK" if ok else "MISMATCH")
