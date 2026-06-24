import { GoogleGenAI } from "@google/genai";
import { Article } from "./rss.js";

export async function generateReport(
  apiKey: string,
  articles: Article[],
  topics: string[],
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  if (articles.length === 0) {
    return `*【技術トレンド日報】*\n収集対象トピック: ${topics.map((t) => `\`${t}\``).join(", ")}\n\n過去24時間以内に新しい記事は見つかりませんでした。`;
  }

  const articlesJson = JSON.stringify(
    articles.map((a) => ({
      title: a.title,
      link: a.link,
      source: a.source,
      snippet: a.snippet.substring(0, 300),
      topics: a.topics,
    })),
    null,
    2,
  );

  const prompt = `
あなたは優秀な技術リサーチャー兼AIアシスタントです。
QiitaとZennから収集された、過去24時間以内の技術記事リストを読み込み、指定されたトピックに関連する重要な情報をまとめた【技術トレンド日報】を作成してください。

# 収集トピック
${topics.map((t) => `- ${t}`).join("\n")}

# 記事データ (JSON)
\`\`\`json
${articlesJson}
\`\`\`

# レポート作成指示
1. 送信先はSlackチャネルです。Slack特有のマークダウン形式（「mrkdwn」）で出力してください。
   - 太字は \`*テキスト*\`
   - 箇条書きは \`•\` または \`-\`
   - **重要**: リンクは必ず \`<URL|テキスト>\` の形式に変換してください。（例: \`<https://zenn.dev/xxx|記事タイトル>\`）一般的なマークダウン形式 \`[テキスト](URL)\` はSlackでは機能しないため、絶対に使用しないでください。
2. 構成案:
   - *【技術トレンド日報】* (太字タイトル)
   - *日付*: 本日の日付 (JST)
   - *トピック別のまとめ*:
     - トピックごとに、重要と思われる記事をピックアップして、なぜ重要なのか、何が紹介されているのかを2〜3文で簡潔に要約してください。
     - 各記事の参照リンクをタイトルに埋め込んでください (例: \`<https://zenn.dev/xxx|記事タイトル>\` (Zenn))。
   - *今日の注目トレンド / 総括*:
     - 本日の収集データから読み取れる最新の動向や所感を1〜2文で記述してください。
3. ノイズ（無関係な記事、内容が極めて薄い記事など）は除外してください。

日本語で簡潔かつ読みやすく記述してください。余計な前置きや「承知いたしました」といった返答は不要です。レポート本文のみを出力してください。
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    return response.text || "Error: Report generation returned empty response.";
  } catch (error) {
    console.error("Error generating report with Gemini:", error);
    throw error;
  }
}
