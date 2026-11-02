# sources: mcp-server-streamable-http

アクセス日はすべて 2026-11-02。番号は原稿の出典の表（本文の「（出典n）」）と同じ。frontmatter の `sources` も同じ14件・同じ順。

github.com のページ（出典3〜9）は、このセッションのプロキシ経由では HTML が 403 を返したため、同じブランチの同じファイルを `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/v1.x/<パス>` から取得して読んだ（10ファイルとも HTTP 200）。記事には読者が開く github.com の URL を載せた。npm のページ（出典10）も 403 だったので、npm レジストリを `npm view @modelcontextprotocol/sdk version engines` で引いた（`run/33.log`）。

## 出典ごとの確認内容

| # | 題名 | URL | 確かめた事実 | 根拠にした原稿の文 |
|---|---|---|---|---|
| 1 | MCP Specification 2025-11-25 Transports | https://modelcontextprotocol.io/specification/2025-11-25/basic/transports | 標準のトランスポートは stdio と Streamable HTTP の2つ。サーバーは独立したプロセスで複数のクライアントの接続を扱える。POST と GET を受ける1つの MCP エンドポイントを用意する（MUST）。メッセージは1つずつ新しい POST で送る（MUST）。Security Warning: すべての接続で Origin を検証（MUST）、Origin があって不正なら 403（MUST）、手元では 127.0.0.1 だけに bind（SHOULD）、認証を実装（SHOULD）。これが無いと DNS リバインディングで外のウェブサイトから手元のサーバーを操作されうる。POST の Accept は application/json と text/event-stream の両方（MUST）。リクエストへの応答は text/event-stream か application/json（どちらでもよい）。GET には SSE を返すか 405（MUST）。セッション ID は割り当ててもよい（MAY） | 「Streamable HTTP は…2つの標準のトランスポートの1つ」「もう1つは stdio」「独立したプロセス…複数のクライアントの接続」「POST と GET を受ける1つの URL」「新しい POST で送ります」「セッション ID を割り当てるかどうかはサーバーが選べます」「127.0.0.1 だけで待ち受けることを勧めています」「すべての接続で Origin ヘッダーを確かめる」「不正な Origin には 403」「GET には SSE で応じるか、405」「SSE か application/json のどちらで返しても」「Accept には、2つの形式を両方書く決まり」「外のウェブサイトから手元のサーバーを操作される恐れ」「DNS リバインディングを挙げています」「Origin の検査も、仕様が同じ攻撃への対策として求めて」「すべての接続で認証を実装するよう勧めて」 |
| 2 | MCP Specification 2025-11-25 Lifecycle | https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle | 「The initialization phase MUST be the first interaction between client and server.」 | 「初期化をクライアントとサーバーの最初のやり取りにする決まり」 |
| 3 | typescript-sdk v1.x README | https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x | v1.x はメンテナンスの系列。MCP の仕様は 2025-11-25 まで実装。v2 のリリース（2026-07-27）から少なくとも6か月、バグ修正とセキュリティ更新を続ける | 「v1 系はメンテナンスを続ける系列」「2025-11-25 のものまで」「v2 系が出た 2026-07-27 から、少なくとも6か月」 |
| 4 | typescript-sdk v1.x docs/server.md | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/server.md | Streamable HTTP は「recommended for remote servers」。Stateless（セッションを追わない、simple API-style servers に向く）と Stateful の2通り。「Bearer token authentication」の節がある | 「リモートには Streamable HTTP を勧めます」「ステートレスとステートフルの2通り」「API のような単純なサーバーに向く」「Bearer トークンで認証する例」 |
| 5 | typescript-sdk v1.x src/server/express.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/express.ts | `createMcpExpressApp` は express のアプリを作り、host が既定の 127.0.0.1（または localhost、::1）なら `localhostHostValidation()` を入れ、`express.json()` を入れて返す。`listen` は呼ばない。`allowedHosts` を渡すとその一覧で Host を検査する。host が 0.0.0.0 か :: で allowedHosts が無ければ検査を入れず警告だけ出す | 「SDK が用意する Express のアプリの作り方」「`express.json()` を入れるので」「Host ヘッダーの検査も入ります」「待ち受けを始めません」「Host の名前は `allowedHosts` に渡します」 |
| 6 | typescript-sdk v1.x hostHeaderValidation.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/middleware/hostHeaderValidation.ts | `localhostHostValidation()` が許すのは `localhost`、`127.0.0.1`、`[::1]`。注記: DNS リバインディングは、ドメインの名前を localhost のアドレスに向けて同一オリジンポリシーを回避し、悪意のあるサイトに手元のサーバーを触らせる攻撃。このミドルウェアはその対策 | 「許す名前は…3つ」「攻撃者のドメインの名前を 127.0.0.1 に向け…手口」「SDK の Host の検査は、この手口を防ぐため」 |
| 7 | typescript-sdk v1.x src/server/webStandardStreamableHttp.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/server/webStandardStreamableHttp.ts | `enableJsonResponse` の既定は false（SSE を使う）。`allowedOrigins` は `@deprecated Use external middleware for origin validation instead.`。`sessionIdGenerator` が無く2回目の `handleRequest` なら `Stateless transport cannot be reused across requests. Create a new transport per request.` を投げる。注記「Reusing a stateless transport causes message ID collisions between clients.」 | 「指定しなければ SSE で返します」「`allowedOrigins`…非推奨で、外のミドルウェアを使う」「次の文言の例外を投げます」「メッセージ ID がぶつかるため」 |
| 8 | typescript-sdk v1.x simpleStatelessStreamableHttp.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/examples/server/simpleStatelessStreamableHttp.ts | POST ごとに `getServer()` と `new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })` を作り、`res.on('close')` で両方を閉じる。GET と DELETE には 405 を返す | 「SDK のステートレスの例も、同じ作り方」「`sessionIdGenerator: undefined` が、ステートレスにする指定」「GET と DELETE に 405 を返します」 |
| 9 | typescript-sdk v1.x src/client/streamableHttp.ts | https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/client/streamableHttp.ts | initialized の通知が 202 で受け付けられると GET で SSE を開く（`_startOrAuthSse`）。GET の応答が 405 なら黙って戻る（「server does not offer an SSE stream」）。それ以外の失敗は `Failed to open SSE stream: <statusText>` を投げる。`close()` は AbortController を abort する。SSE の読み込みの例外は `SSE stream disconnected: <error>` として onerror に渡す | 「初期化のあとに GET で SSE を開こうとします」「405 だけを…黙って受け入れます」「それ以外の失敗は `Failed to open SSE stream`」「`close()` は読みかけの通信を打ち切り…SSE の切断として報告」 |
| 10 | @modelcontextprotocol/sdk（npm） | https://www.npmjs.com/package/@modelcontextprotocol/sdk | `npm view` で latest が 1.32.2、`engines` が `node: '>=18'`（`run/33.log`） | 「SDK 1.32.2 は Node.js 18 以上を指定」 |
| 11 | Using server-sent events（MDN） | https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events | イベントストリームは `text/event-stream`。各メッセージは `event`、`data`、`id`、`retry` の欄を1行に1つずつ持つ | 「1つのメッセージを `event` と `data` のような欄の行に分けて送ります」 |
| 12 | Connect Claude Code to tools via MCP | https://code.claude.com/docs/en/mcp | リモートの HTTP サーバーは `claude mcp add --transport http <name> <url>` で足す。HTTP がリモートのサーバーに勧める方式 | 「`claude mcp add --transport http` で足します」「後ろに名前と URL を続けます」 |
| 13 | Claude Code Advanced setup | https://code.claude.com/docs/en/setup | 「Claude Code requires a Pro, Max, Ultra, Team, Enterprise, or Console account. The free claude.ai plan does not include Claude Code access.」 | 「有料のプランか Console のアカウントが要ります」「無料の claude.ai のプランには、Claude Code が含まれていません」、frontmatter の `cost_estimate` |
| 14 | Get started with custom connectors using remote MCP | https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp | Claude は Anthropic のクラウドからリモートの MCP サーバーにつなぐ（claude.ai、Desktop、モバイルのどれでも）。サーバーは Anthropic の IP 範囲からインターネット越しに届く必要がある。社内ネットワーク、VPN の内側、ファイアウォールで塞いだサーバーにはつながらない。カスタムコネクタは Free、Pro、Max、Ultra、Team、Enterprise で使え、Free は1つまで。URL は `11175166-getting-started-…` から `…-get-started-…` にリダイレクトされた | 「手元のサーバーにつながりません」「Anthropic のクラウドからリモートの MCP サーバーにつなぎます」「Anthropic の IP アドレスからインターネット越しに届く場所」「Anthropic の IP アドレスから届く場所にサーバーを置きます」「無料のプランでも1つまで」 |

## 出典ではなく実行ログを根拠にした文

| 原稿の文 | 根拠 |
|---|---|
| 書き写すコードは4ファイルで121行、`src/server.ts` は69行 | `wc -l`（package.json 20、tsconfig.json 13、server.ts 69、check.ts 19） |
| `npm install` は3秒 | `run/03.log`（`audited 109 packages in 3s`） |
| express が SDK の依存で、手元では 5.3.0 | `run/32.log`（`@modelcontextprotocol/sdk@1.32.2` の下に `express@5.3.0`） |
| `@types/express` を外すと `tsc` が7件のエラー | `run/37.log`（TS7006 が7件、`tsc_exit=1`）、戻すと0件 `run/38.log` |
| `tsconfig.json` は前の記事と同じ | `logs/mcp-server-typescript-stdio/code/tsconfig.json` と `diff` で差分なし |
| `createServer` の中身は前の記事のツールの登録と同じ | `logs/mcp-server-typescript-stdio/code/src/server.ts` の `registerTool` 呼び出しと、インデントのほか差分なし |
| `ok:` の行が前の記事と1文字も違わない | `run/06.log` と `content/articles/mcp-server-typescript-stdio.md` の `ok:` の行 |
| 30回中4回、AbortError の行が増える。30回とも `ok:` あり | `run/36.log` |
| curl の応答が `text/event-stream` で `event: message` と `data:` の行 | `run/07.log` |
| 初期化を飛ばしても結果が返った | `run/07.log`（`tools/call` だけを送って 200） |
| Accept が無いと 406、GET に 405、Origin と Host で 403 | `run/08.log`〜`11.log` |
| SDK のクライアントと curl は Origin を付けていない | `run/06.log` と `run/07.log` が成功（`ALLOWED_ORIGINS` が空なので、Origin が付けば 403 になる。`run/10.log`） |
| Claude Code での登録から削除まで、`√ Connected` | `run/12.log`〜`16.log` |
| 使い回すと `connect` の2回目の POST が 500、その後の curl も 500 と空の本文、サーバーには起動のログだけ | `run/17.log`〜`22.log`、`run/19.log`（終了まで起動の1行だけ） |
| 例外の文言 | `run/23.log`（`code/extra/reuse-cause.mjs`） |
| 405 の受け口を消すと Not Found の行が2つ | `run/24.log`〜`27.log` |
| 戻すと手順3と同じ出力 | `run/28.log`〜`31.log` |
| SDK 1.32.2 が npm の latest | `run/33.log` |
