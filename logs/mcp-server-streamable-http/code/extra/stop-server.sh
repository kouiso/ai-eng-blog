#!/usr/bin/env bash
# 記事には載せない。バックグラウンドの run.sh で動かしている `npm start` のサーバーに、
# ターミナルで Ctrl+C を押したときと同じ SIGINT を送って止める。
# コマンド行がちょうど "node dist/server.js" のプロセスだけを選ぶ（シェル自身のコマンド行には当たらない）。
set -u
pid="$(ps -eo pid=,args= | awk '$2 == "node" && $3 == "dist/server.js" && NF == 3 { print $1 }')"
echo "pid=${pid}"
kill -INT ${pid}
