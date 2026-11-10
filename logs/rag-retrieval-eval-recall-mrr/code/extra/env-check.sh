#!/usr/bin/env bash
# 記事には載せない確認用。Hugging Face のトークンを設定していないことを、値を出さずに set / unset だけで記録する。
for v in HF_TOKEN HUGGING_FACE_HUB_TOKEN; do
  if [ -n "${!v:-}" ]; then echo "$v set"; else echo "$v unset"; fi
done
