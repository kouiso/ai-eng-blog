#!/usr/bin/env python3
"""記事に載せない確認用。記事の server.ts から、1か所だけ変えた3つの版を作る。
使い方: python3 make-variants.py <server.ts のあるフォルダ>
- server-plain-error.ts: 見つからない用語で McpError のかわりに普通の Error を投げる
- server-object.ts: 用語の表を Map のかわりに普通のオブジェクトにする
- server-no-list.ts: ResourceTemplate の list を undefined にする
置き換える文字列が見つからなければ止まる（記事のコードが変わったのに古い置き換えで作らないため）。
"""
import sys
from pathlib import Path

d = Path(sys.argv[1])
src = (d / "server.ts").read_text(encoding="utf-8")

def sub(text, old, new):
    if old not in text:
        sys.exit(f"not found: {old!r}")
    return text.replace(old, new)

plain = sub(src, 'throw new McpError(-32002, "Resource not found", { uri: uri.href });',
            'throw new Error("Resource not found");')
(d / "server-plain-error.ts").write_text(plain, encoding="utf-8")

obj = sub(src, '''const glossary = new Map([
  ["resource", "クライアントが URI を指定して読み取るデータ。"],
  ["prompt", "ユーザーが選んで使う、メッセージのひな形。"],
  ["tool", "モデルが自分で選んで呼び出す関数。"],
]);''', '''const glossary: Record<string, string> = {
  resource: "クライアントが URI を指定して読み取るデータ。",
  prompt: "ユーザーが選んで使う、メッセージのひな形。",
  tool: "モデルが自分で選んで呼び出す関数。",
};''')
obj = sub(obj, "[...glossary.keys()]", "Object.keys(glossary)")
obj = sub(obj, "glossary.get(String(term))", "glossary[String(term)]")
(d / "server-object.ts").write_text(obj, encoding="utf-8")

nolist = sub(src, '''new ResourceTemplate("guide://glossary/{term}", {
    list: async () => ({
      resources: [...glossary.keys()].map((term) => ({ uri: `guide://glossary/${term}`, name: term })),
    }),
  }),''', '''new ResourceTemplate("guide://glossary/{term}", { list: undefined }),''')
(d / "server-no-list.ts").write_text(nolist, encoding="utf-8")
print("variants: server-plain-error.ts server-object.ts server-no-list.ts")
