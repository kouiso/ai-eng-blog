# sources: ai-agent-safe-file-tool

アクセス日は、1〜8 が 2026-10-31、9〜10 が 2026-11-10。番号は記事末尾の出典の表と同じ。行番号は `content/articles/ai-agent-safe-file-tool.md`（588行の版。2026-11-10 に直した版で振り直した）。

Node.js の文書は、ページの HTML に加えて、同じ版の原文（`https://raw.githubusercontent.com/nodejs/node/v22.22.0/doc/api/path.md`、`fs.md`、`typescript.md`）を curl で取り、grep で該当の文を読んだ。記事の表の URL（`https://nodejs.org/docs/v22.22.0/api/...`）は HTTP 200 を返すことを curl で確かめた。

## 1. Node.js v22.22.0 Path

- URL: https://nodejs.org/docs/v22.22.0/api/path.html
- 確かめたこと:
  - `path.join()` は、区切り文字でつないだあとに結果を正規化する（"joins all given path segments together ... then normalizes the resulting path"）。例 `path.join('/foo', 'bar', 'baz/asdf', 'quux', '..')` が `'/foo/bar/baz/asdf'`。
  - `path.relative(from, to)` は from から to への相対パスを返し、同じパスに解決されるときは長さ0の文字列を返す。例 `path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')` が `'../../impl/bbb'`。
  - `path.isAbsolute()` は文字どおりのパスが絶対かを判定するだけで、"Therefore, it's not safe for mitigating path traversals."
  - `path.extname()` は、ドットが basename の1文字目にしか無いとき空の文字列を返す。例 `path.extname('.index')` が `''`。
- 根拠にした文: 231行目（path.join の正規化）、326行目（外なら `..` で始まる、同じなら空の文字列）、342行目（isAbsolute は Path Traversal の対策に安全でない）、416行目（`.index` のような名前に空の文字列）。

## 2. Node.js v22.22.0 File system

- URL: https://nodejs.org/docs/v22.22.0/api/fs.html
- 確かめたこと:
  - `fs.realpath`: "Asynchronously computes the canonical pathname by resolving `.`, `..`, and symbolic links." "A canonical pathname is not necessarily unique. Hard links and bind mounts can expose a file system entity through many pathnames." "A path that does not exist results in an ENOENT error. `error.path` is the absolute file path."（`fsPromises.realpath` は `fs.realpath.native()` と同じ意味で動く、とある）
  - File system flags: `'w'` は "The file is created (if it does not exist) or truncated (if it exists)."、`'wx'` は "Like `'w'` but fails if the path exists."
  - "The exclusive flag `'x'` (`O_EXCL` flag in open(2)) causes the operation to return an error if the path already exists. On POSIX, if the path is a symbolic link, using `O_EXCL` returns an error even if the link is to a path that does not exist."
  - `fsPromises.writeFile` の `flag` の既定は `'w'`。
- 根拠にした文: 340行目（realpath が `.`、`..`、リンクをたどった正規の絶対パスを返す）、412行目（ENOENT、error.path が絶対パス）、424行目（wx はあると失敗、POSIX ではリンクの先が無くても失敗）、445行目（writeFile の既定は w、無ければ作る）、543行目（ハードリンクで同じファイルが別のパスで見える）。

## 3. Node.js v22.22.0 Modules: TypeScript

- URL: https://nodejs.org/docs/v22.22.0/api/typescript.html
- 確かめたこと: 変更履歴に v22.18.0 "Type stripping is enabled by default."。"Node.js will replace inline type annotations with whitespace, and no type checking is performed."。`.ts` のモジュールの種類は `.js` と同じ決め方で、`import` を使うには `package.json` に `"type": "module"` を足す。
- 根拠にした文: 76行目（22.18.0 以上は型を取り除いて実行、型の検査はしない）、95行目（`"type": "module"`）。

## 4. Path Traversal（OWASP Foundation）

- URL: https://community.owasp.org/attacks/Path_Traversal（`https://owasp.org/www-community/attacks/Path_Traversal` からこの URL へ 308 で転送される。ページの title は「Path Traversal | OWASP Foundation」）
- 確かめたこと: "A path traversal attack (also known as directory traversal) aims to access files and directories that are stored outside the web root folder. By manipulating variables that reference files with “dot-dot-slash (../)” sequences and its variations or by using absolute file paths, it may be possible to access arbitrary files..." "It should be noted that access to files is limited by system operational access control..."
- 根拠にした文: 231行目（`..` で外を読むのは OWASP が Path Traversal と呼ぶ攻撃の形）、547行目（OS のアクセス権でも読めるファイルは制限される）。

## 5. LLM06:2025 Excessive Agency（OWASP Gen AI Security Project）

- URL: https://genai.owasp.org/llmrisk/llm062025-excessive-agency/
- 確かめたこと: "Excessive Agency is the vulnerability that enables damaging actions to be performed in response to unexpected, ambiguous or manipulated outputs from an LLM"。根本の原因は excessive functionality、excessive permissions、excessive autonomy のどれか。対策に "Minimize extension permissions"。
- 根拠にした文: 61行目（OWASP はこの種の弱点を Excessive Agency と呼ぶ。予想外の出力か操作された出力に従って害のある操作が実行される弱点）。原文の "ambiguous" は記事では省いた。

## 6. Handle tool calls（Claude のドキュメント）

- URL: https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls
- 確かめたこと:
  - `tool_use` ブロックは `id`、`name`、`input` を持つ。
  - `tool_result` は `tool_use_id`（"The `id` of the tool use request this is a result for."）、`content`（省略可）、`is_error`（省略可、"Set to `true` if the tool execution resulted in an error."）。
  - 警告: "Tool results often carry content from sources outside your control ... an attacker who can influence it might embed instructions that try to redirect Claude (indirect prompt injection)."
  - "Tool execution error" の節: エラーの文を `content` に入れ `"is_error": true` を付けて返せる。Tip "Write instructive error messages. Instead of generic errors such as "failed", include what went wrong and what Claude should try next"。
- 根拠にした文: 61行目（ツールの結果に入る外の文章の指示でモデルが誘導されることがある）、449行目（tool_use にはツールの名前と入力が入る）、537行目（tool_use_id に対応する id、失敗時は is_error を true、何が起きて次に何を試すかを書くのが公式の勧め）。

## 7. Define tools（Claude のドキュメント）

- URL: https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
- 確かめたこと: ツールの定義は `name`、`description`、`input_schema`。Best practices の1つ目 "Provide extremely detailed descriptions." の項目に "Any important caveats or limitations"。
- 根拠にした文: 539行目（公式の案内も、ツールの説明に制限と注意点まで書くよう求めている）。

## 8. Pricing（Claude のドキュメント）

- URL: https://platform.claude.com/docs/en/about-claude/pricing
- 確かめたこと:
  - Model pricing の表: "Claude Haiku 5.5 (for prompts up to 100,000 tokens)" は Base input $0.10 / MTok、Output $0.50 / MTok。
  - Tool use pricing: "The total number of input tokens sent to the model (including in the `tools` parameter)"。増えるトークンの出どころとして "The `tools` parameter in API requests"、"`tool_use` content blocks in API requests and responses"、"`tool_result` content blocks in API requests"。
- 根拠にした文: 418行目（ツールの結果の文字列は次のリクエストの入力トークンとして数えられる）、555行目（ツールの定義と tool_result はリクエストの入力トークン、Haiku 5.5 の単価、10万トークン以下の条件）。

## 9. Create symbolic links（Microsoft Learn）

- URL: https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/create-symbolic-links
- アクセス日: 2026-11-10
- 確かめたこと: "This user right determines if users can create a symbolic link from the device they're logged on to."、Constant は SeCreateSymbolicLinkPrivilege。Default values に "By default, members of the Administrators group have this right."、表の "Client Computer Effective Default Settings" は Administrators。Applies to は Windows 11 と Windows 10。
- 根拠にした文: 134行目（Windows では、リンクを作る権利を既定で持つのは Administrators グループ）。

## 10. CreateSymbolicLinkW function（Microsoft Learn）

- URL: https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-createsymboliclinkw
- アクセス日: 2026-11-10
- 確かめたこと: `dwFlags` の表の SYMBOLIC_LINK_FLAG_ALLOW_UNPRIVILEGED_CREATE（0x2）に "Specify this flag to allow creation of symbolic links when the process is not elevated. Developer Mode must first be enabled on the machine before this option will function."
- 根拠にした文: 134行目（昇格していないプロセスから作るには、開発者モードを有効にしておく必要がある）。同じ行の「管理者として開いたターミナルで実行してください」は、出典9（Administrators が権利を持つ）と出典10（昇格していないプロセスには別の条件が要る）から導いた案内で、Windows では実行していない。Node.js の `symlinkSync` がこのフラグを渡すかどうかは確かめていないので、記事には書いていない。

## 出典ではなく実行ログを根拠にした文

| 行 | 文 | 根拠 |
|---|---|---|
| 76 | Linux x86_64 の Node.js 22.22.0 と npm 10.9.4、tsc 7.0.2 で型を確かめた | `run/*.log` の見出し行、`run/12.log` |
| 146〜158 | 配置の図（big.md は 30,000 バイト、2つのリンク） | `code/setup.ts`、`run/09.log` |
| 231〜233 | readNaive は4つとも読んだ、readWithPrefixCheck は1つを断り2つを通した | `run/03.log` |
| 328 | `startsWith("..")` だと `..memo.md` も外と判定される | `run/11.log`（`"..memo.md" true false`） |
| 330 | 別のドライブを指すと path.relative は絶対パスを返す | `run/07.log` |
| 410 | 読み込みで通ったのは notes/todo.md の1つ | `run/04.log` |
| 445 | 外に outside/report.md ができ、書いた内容が入っていた | `run/05.log`、`run/09.log` |
| 495 | ふつうのオブジェクトだと toString でも関数が引ける | `run/08.log` |
| 545 | ハードリンクを置くと readTextFile は外の中身を返した | `run/10.log`（`code/extra/hard-link.ts`） |
| 134 | この記事のコードは Linux でしか動かしていない | `run/*.log` の見出し行（os: Linux x86_64）。Windows での実行ログは無い |
| 408 | 2回目の実行では、最初の書き込みも「既にあります」と断られる。setup.ts で作り直すと記事と同じ結果に戻る | `run/13.log`（1回目、setup.ts なしの2回目、setup.ts のあとの3回分） |
