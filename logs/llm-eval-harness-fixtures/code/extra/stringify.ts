// 記事には載せない確認用。run-eval.ts と同じ書き方で、改行を含む回答が引用符でくくられ、改行が \n と1行に表示されることを確かめる。
const answer = "neutral です。\n以上です。";
console.log(`     回答: ${JSON.stringify(answer)}`);
