import { z } from "zod";
import { Reservation } from "./cases.ts";
import { run } from "./common.ts";

export async function extractByOutputFormat(text: string) {
  const result = await run(text, {
    outputFormat: { type: "json_schema", schema: z.toJSONSchema(Reservation, { target: "draft-7" }) },
    maxTurns: 3,
  });
  if (result.subtype !== "success" || result.is_error || result.structured_output === undefined) {
    return { result, error: result.subtype };
  }
  return { result, value: result.structured_output };
}
