import * as z from "zod";
import { Ticket } from "./schema.ts";
import { samples } from "./samples.ts";

const Category = z
  .string()
  .toLowerCase()
  .pipe(z.enum(["bug", "billing", "other"]));

for (const value of ["Bug", "BILLING", "feature"]) {
  const result = Category.safeParse(value);
  console.log(value, "->", result.success ? result.data : result.error.issues[0]?.code);
}

const CaseInsensitiveTicket = Ticket.extend({ category: Category });
const ticket = CaseInsensitiveTicket.safeParse(JSON.parse(samples["bad-enum"]));
console.log("bad-enum:", ticket.success, ticket.data?.category);
