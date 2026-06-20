import { loadConfig } from './config.js';
import { fetchAllArticles } from './rss.js';
import { generateReport } from './report.js';
import { sendToSlack } from './slack.js';

async function main() {
  console.log('--- TrendSeeker Start ---');
  const now = new Date();
  console.log(`Current Time: ${now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} JST`);

  try {
    // 1. 設定のロード
    console.log('Loading configuration...');
    const config = loadConfig();
    console.log(`Configured topics: ${config.topics.join(', ')}`);

    // 2. RSS フィードからの記事取得 (過去24時間)
    console.log('Fetching articles from Qiita and Zenn...');
    const articles = await fetchAllArticles(config.topics, 24);
    console.log(`Total unique articles found: ${articles.length}`);

    // 3. レポートの生成
    console.log('Generating technical trend report with Gemini...');
    const reportText = await generateReport(config.geminiApiKey, articles, config.topics);

    // 4. Slack への送信
    console.log('Sending report to Slack...');
    await sendToSlack(config.slackWebhookUrl, reportText);

    console.log('Report successfully sent to Slack!');
    console.log('--- TrendSeeker End ---');
  } catch (error) {
    console.error('Fatal Error during execution:', error);
    await notifyFailure(error);
    process.exit(1);
  }
}

async function notifyFailure(error: unknown): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL is not set; skipping Slack error notification.');
    return;
  }

  const detail = error instanceof Error
    ? `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`
    : String(error);
  const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const text = `*【TrendSeeker エラー通知】*\n実行中にエラーが発生しました (${timestamp} JST)\n\n\`\`\`\n${detail}\n\`\`\``;

  try {
    await sendToSlack(webhookUrl, text);
  } catch (slackError) {
    console.error('Failed to send error notification to Slack:', slackError);
  }
}

main();
