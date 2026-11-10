import { AutoTokenizer } from "@huggingface/transformers";
import { docs } from "./docs.ts";
import { embed } from "./embed.ts";

const tokenizer = await AutoTokenizer.from_pretrained("Xenova/multilingual-e5-small");
const count = (text: string) => tokenizer.encode(text).length;

for (const doc of docs) {
  console.log(count(`passage: ${doc.text}`), doc.id);
}

async function similarityWithExtra(text: string): Promise<string> {
  const [a, b] = await embed([text, `${text}返金は5営業日以内です。`]);
  return a.reduce((sum, x, i) => sum + x * b[i], 0).toFixed(4);
}

const short = `passage: ${docs[0].text}`;
const long = `passage: ${docs.map((doc) => doc.text).join("").repeat(5)}`;
console.log("短い文書", count(short), "トークン", await similarityWithExtra(short));
console.log("長い文書", count(long), "トークン", await similarityWithExtra(long));
