// 記事には載せない確認用。z.toJSONSchema に target を渡さずに outputFormat へ入れると何が起きるかを見る。
import { z } from "zod";
import { cases, Reservation } from "../cases.ts";
import { run } from "../common.ts";

const schema = z.toJSONSchema(Reservation);
console.log(`$schema: ${schema.$schema}`);
try {
  const result = await run(cases[0].text, { outputFormat: { type: "json_schema", schema }, maxTurns: 3 });
  console.log(`subtype=${result.subtype}`);
} catch (e) {
  console.log(`error: ${String((e as Error).message).split("\n")[0]}`);
}
console.log(`draft-7: ${z.toJSONSchema(Reservation, { target: "draft-7" }).$schema}`);
