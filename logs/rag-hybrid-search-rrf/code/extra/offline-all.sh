#!/usr/bin/env bash
# 記事には載せない確認用。unshare -rn（ネットワークの無い名前空間）の中で実行する。
# モデルを一度ダウンロードしたあとの作業フォルダで、記事の node コマンドを全部実行し直す。
node -e 'fetch("https://huggingface.co").then(() => console.log("network: reachable")).catch((e) => console.log("network: " + (e.cause?.code ?? e.message)))'
for args in 'hybrid.ts|利用限度額' 'hybrid.ts|5営業日' 'hybrid.ts|E1021 が出た' 'hybrid.ts|届くのが遅い' 'hybrid.ts|届くのが遅い|0.1|1' 'hybrid.ts|返金はいつ？' 'hybrid.ts|返金はいつ？|0'; do
  IFS='|' read -r -a a <<< "$args"
  echo "\$ node ${a[*]}"
  node "${a[@]}"
  echo "exit=$?"
done
