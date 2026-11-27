# gate: a2-diff

> 2026-11-20 追記: 直しの差分を下に貼った。

- ```diff
  - 古い行
  + 新しい行
  ```

| 項目 | 条件 | 確かめ方 | 判定 | 根拠 |
|---|---|---|---|---|
| G01 | FATAL 0 | `lint/ai-smell.txt` | OK | 0件 |
| G03 | 一次情報の URL | 本文 | NG | 2か所に日付が無い |

```text
FATAL: 0
```

## 機械で読む合否

gate: G01=OK G02=OK G03=OK G04=OK G05=OK G06=OK G07=OK G08=OK G09=OK G10=OK G11=OK
