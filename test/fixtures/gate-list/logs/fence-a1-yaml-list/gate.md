# gate: a1-yaml-list

> 2026-11-20 追記: G05 を OK に変えた。下の表の G05 の行はその前の判定。
> 2026-11-21 追記: `target_query` を決めた。

- 原稿の frontmatter: 
- ```yaml
  tags:
  - llm-api
  ```

## 公開前ゲート（A）

| 項目 | 条件 | 確かめ方 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | FATAL 0 | `lint/ai-smell.txt` | OK | 0件 |
| G03 | 一次情報の URL | 本文 | NG | 2か所に日付が無い |

## 実行ログ

```bash
python3 scripts/ai-smell-lint.py content/articles/a1.md
```

## 機械で読む合否

gate: G01=OK G02=OK G03=OK G04=OK G05=OK G06=OK G07=OK G08=OK G09=OK G10=OK G11=OK
