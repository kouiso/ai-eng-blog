"""mcp__shop__ 以外の MCP ツール名を消して、init 行には件数だけを残す。

strictMcpConfig を外した確認（run/09.log）では、ログイン中のアカウントで claude.ai に
つないでいるコネクタのツール名が並ぶ。アカウントの情報なので、名前は残さず件数だけにする。
init 行以外にコネクタのツール名が出た場合も、mcp__<hidden> に置き換える。
"""
import re
import sys

OTHER_MCP = re.compile(r"mcp__(?!shop__)[A-Za-z0-9_\-.]+")

for line in sys.stdin:
    line = line.rstrip("\n")
    if line.startswith("[system/init]") and " tools=" in line:
        head, tools = line.split(" tools=", 1)
        names = tools.split(",") if tools else []
        kept = [n for n in names if not OTHER_MCP.fullmatch(n)]
        hidden = len(names) - len(kept)
        print(f"{head} tools_total={len(names)} other_mcp_tools_hidden={hidden} tools={','.join(kept)}")
    else:
        print(OTHER_MCP.sub("mcp__<hidden>", line))
