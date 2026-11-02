#!/usr/bin/env bash
# 記事には載せない確認用。unshare -rn（ネットワークの無い名前空間）の中で実行する。
# logs/rag-hybrid-search-rrf/code/extra/offline-all.sh を写し、実行するコマンドをこの記事のものに替えたもの。
# モデルを一度ダウンロードしたあとの作業フォルダで、記事の node コマンドを全部実行し直す。
node -e 'fetch("https://huggingface.co").then(() => console.log("network: reachable")).catch((e) => console.log("network: " + (e.cause?.code ?? e.message)))'
for args in 'check-metrics.ts' 'eval.ts' 'eval.ts|1' 'eval.ts|5' 'eval.ts|3|0'; do
  IFS='|' read -r -a a <<< "$args"
  echo "\$ node ${a[*]}"
  node "${a[@]}"
  echo "exit=$?"
done
