import { z } from "zod";

export const Reservation = z.object({
  name: z.string().describe("予約者の名前"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("来店日。YYYY-MM-DD"),
  people: z.number().int().min(1).describe("人数の合計"),
  course: z.enum(["lunch", "dinner"]).describe("昼なら lunch、夜なら dinner"),
});
export type Reservation = z.infer<typeof Reservation>;

export const SYSTEM_PROMPT =
  "問い合わせの文から予約の情報を取り出します。年が書かれていなければ2026年とします。";

export const cases: { text: string; expected: Reservation }[] = [
  { text: "11月20日の夜、4名で予約したいです。山田です。", expected: { name: "山田", date: "2026-11-20", people: 4, course: "dinner" } },
  { text: "佐藤と申します。12/3 のランチを2人でお願いします。", expected: { name: "佐藤", date: "2026-12-03", people: 2, course: "lunch" } },
  { text: "2026年12月5日、大人2名と子ども1名でディナーを予約できますか。鈴木", expected: { name: "鈴木", date: "2026-12-05", people: 3, course: "dinner" } },
  { text: "高橋です！11月28日のお昼に五名で伺いたいです。", expected: { name: "高橋", date: "2026-11-28", people: 5, course: "lunch" } },
  { text: "予約希望: 田中 / 2026-12-10 / 夜 / 6人", expected: { name: "田中", date: "2026-12-10", people: 6, course: "dinner" } },
  { text: "伊藤です。十二月一日の夜に1人で行きます。カウンター席が希望です。", expected: { name: "伊藤", date: "2026-12-01", people: 1, course: "dinner" } },
  { text: "12月24日、ランチで8名。幹事は渡辺です。アレルギーは無しです。", expected: { name: "渡辺", date: "2026-12-24", people: 8, course: "lunch" } },
  { text: "中村です。11月22日の18時から、3名でお願いします。", expected: { name: "中村", date: "2026-11-22", people: 3, course: "dinner" } },
  { text: "小林といいます。12月15日12時、夫婦2人と友人2人の計4人です。", expected: { name: "小林", date: "2026-12-15", people: 4, course: "lunch" } },
  { text: "加藤です。12月8日の夜、2名で予約したいのですが、9日に変更になるかもしれません。ひとまず8日で。", expected: { name: "加藤", date: "2026-12-08", people: 2, course: "dinner" } },
];
