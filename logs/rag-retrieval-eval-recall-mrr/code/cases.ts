// 手で書いた評価用の質問と、答えが書いてある文書の id です。
export type EvalCase = { query: string; relevant: string[] };

export const cases: EvalCase[] = [
  { query: "返品は何日以内ならできますか", relevant: ["returns"] },
  { query: "返金はいつ？", relevant: ["cancel"] },
  { query: "キャンセルしたらお金は戻る？", relevant: ["cancel"] },
  { query: "支払いに使えるものは？", relevant: ["payment"] },
  { query: "PayPay で払える？", relevant: ["payment"] },
  { query: "送料はいくら？", relevant: ["shipping-fee"] },
  { query: "注文してから何日で発送される？", relevant: ["delivery"] },
  { query: "離島に届くまで何日かかる？", relevant: ["delivery"] },
  { query: "パスワードを忘れた", relevant: ["password"] },
  { query: "ログインできない", relevant: ["login", "password"] },
  { query: "E1021 が出た", relevant: ["error-e1021"] },
  { query: "カードの期限切れで決済できない", relevant: ["error-e1020"] },
  { query: "カードが使えない", relevant: ["error-e1020", "error-e1021"] },
  { query: "返品した注文のポイントはどうなる？", relevant: ["points"] },
  { query: "ポイントの有効期限は？", relevant: ["points"] },
];
