# G04 の確認: 記事のコードブロックが code/ のファイルと1文字も違わないこと、
# 記事に載せた実行結果が run/ のログから機械的に取り出したものと一致することを調べる。
# logs/rag-bm25-search-typescript/lint/check-code-and-outputs.py を、この記事のファイル名、コマンド、ログの番号に合わせて書き換えたもの。
# 2026-11-10 に、記事の直し（依存の入れ直しの手順、count-tokens.ts の追加）に合わせ、その日に記事の手順をやり直したログ run/26〜56 を見る形に書き換えた。
# 2026-10-31 のログ run/01〜25 は経緯として残してあり、このスクリプトでは見ない。
# 使い方: python3 logs/rag-local-embeddings-transformers-js/lint/check-code-and-outputs.py（リポジトリのルートで）
import re

L = "logs/rag-local-embeddings-transformers-js/"
article = open("content/articles/rag-local-embeddings-transformers-js.md", encoding="utf-8").read()
fences = [b for _, b in re.findall(r"```(\w+)\n(.*?)\n```", article, re.S)]


def log(n):
    return open(L + f"run/{n:02d}.log", encoding="utf-8").read()


def run(n):
    t = log(n)
    cmd = re.search(r"^command: (.*)$", t, re.M).group(1)
    code = re.search(r"^exit: (\d+)$", t, re.M).group(1)
    out = t.split("--- stdout+stderr ---\n", 1)[1].rstrip("\n")
    return cmd, out, code


ok = True
for f in ["package.json", "embed.ts", "show-vector.ts", "docs.ts", "vector-search.ts", "search.ts", "count-tokens.ts"]:
    code = open(L + "code/" + f, encoding="utf-8").read().rstrip("\n")
    hit = code in fences
    ok &= hit
    print(f"code {f}: {hit}")

cmds = ["mkdir local-embeddings\ncd local-embeddings",
        "npm install\ndu -sh node_modules",
        "rm -rf node_modules\nONNXRUNTIME_NODE_INSTALL=skip npm install\ndu -sh node_modules",
        'node show-vector.ts "返金はいつ？"',
        "du -sh node_modules/@huggingface/transformers/.cache",
        'node search.ts "返金はいつ？"', 'node search.ts "家に届くまで何日？"', 'node search.ts "宿題を手伝って" 8',
        "node count-tokens.ts"]
for cmd in cmds:
    hit = cmd in fences
    ok &= hit
    print(f"command '{cmd.splitlines()[0]}': {hit}")

# 記事のコマンド（引用符つき）とログのコマンド（シェルが引用符を外したもの）が同じ引数か
pairs = [(26, "mkdir local-embeddings"), (28, "npm install"), (29, "du -sh node_modules"),
         (30, "rm -rf node_modules"), (31, "bash -c ONNXRUNTIME_NODE_INSTALL=skip npm install"),
         (32, "du -sh node_modules"),
         (34, 'node show-vector.ts "返金はいつ？"'), (35, "du -sh node_modules/@huggingface/transformers/.cache"),
         (36, 'node show-vector.ts "返金はいつ？"'),
         (38, 'node search.ts "返金はいつ？"'), (39, 'node search.ts "家に届くまで何日？"'),
         (40, 'node search.ts "宿題を手伝って" 8'), (42, "node count-tokens.ts")]
for n, cmd in pairs:
    logged = run(n)[0]
    same = cmd.replace('"', "") == logged
    ok &= same
    print(f"run/{n:02d}.log command matches article: {same} ({logged})")

# 記事に載せた実行結果（コードブロック）がログの出力と一致するか
for n in [29, 32, 34, 35, 38, 39, 40, 42]:
    hit = run(n)[1] in fences
    ok &= hit
    print(f"output run/{n:02d}.log in article: {hit}")
# 冒頭の完成形（「返金はいつ？」の結果）は run/38 と同じブロックが2回出る
twice = fences.count(run(38)[1]) == 2
ok &= twice
print("run/38 output appears twice:", twice)

# 同じ結果になったログ（2回目の実行、ネットワークなし、CUDA のライブラリを入れたフォルダ）
same36 = run(36)[1] == run(34)[1]
off = run(43)[1]
same43 = all(run(n)[1] in off for n in [34, 38, 39, 40, 42]) and off.count("exit=0") == 5 and "network: EAI_AGAIN" in off
full = run(51)[1]
same51 = all(run(n)[1] in full for n in [34, 38, 39, 40, 42]) and full.count("exit=0") == 5
ok &= same36 and same43 and same51
print(f"run/36 == run/34: {same36}; run/43 offline has 34/38/39/40/42 outputs, 5x exit=0, EAI_AGAIN: {same43}; run/51 (CUDA folder) has the same outputs: {same51}")

# 本文の数値の根拠
r48 = run(48)[1]
skip_part = r48.split("local-embeddings/node_modules")[1]
full_part = r48.split("local-embeddings-full/node_modules")[1].split("local-embeddings/node_modules")[0]
elapsed = {n: int(re.search(r"^elapsed: (\d+) ms$", log(n), re.M).group(1)) for n in range(26, 57)}
tsc_err = [l for l in run(55)[1].splitlines() if "error TS" in l]
checks = {
    "run/28 added 46 packages": "added 46 packages" in run(28)[1],
    "run/48 cuda 272054000 only in the plain install": "272054000 " in full_part and "libonnxruntime_providers_cuda.so" in full_part and "cuda" not in skip_part,
    "run/50 cuda remains after skip install without rm": "272054000 " in run(50)[1] and "libonnxruntime_providers_cuda.so" in run(50)[1],
    "run/44 4 files incl. model_quantized 118308185": len(run(44)[1].splitlines()) == 4 and "118308185 Xenova/multilingual-e5-small/onnx/model_quantized.onnx" in run(44)[1],
    "run/52 onnxruntime-node largest": run(52)[1].splitlines()[-1].endswith("node_modules/onnxruntime-node"),
    "run/53 versions": "@huggingface/transformers@4.3.2" in run(53)[1] and "onnxruntime-node@1.30.0" in run(53)[1] and "Linux x86_64" in run(53)[1],
    "run/55 tsc errors only in node_modules": len(tsc_err) > 0 and all(l.startswith("node_modules/") for l in tsc_err),
    "run/56 tsc_exit=0": "tsc_exit=0" in run(56)[1],
    "article 3.3s/1.7s from run/34, run/36": f"{elapsed[34] / 1000:.1f}秒" == "3.3秒" and f"{elapsed[36] / 1000:.1f}秒" == "1.7秒" and "初回の実行が3.3秒、2回目が1.7秒" in article,
}
for k, v in checks.items():
    ok &= v
    print(f"{k}: {v}")
for n in range(26, 57):
    print(f"run {n:02d} exit={run(n)[2]} elapsed={elapsed[n]}ms command={run(n)[0][:70]}")
print("ALL OK" if ok else "MISMATCH")
