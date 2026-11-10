// 記事に載せない確認（run/19）。環境変数 FOO が無ければ起動の時点で投げ、あれば other.ts を起動する。
if (!process.env.FOO) throw new Error("FOO is missing");
await import("./other.ts");
