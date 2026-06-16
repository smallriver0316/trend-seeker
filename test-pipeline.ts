import { fetchAllArticles } from './src/rss.js';
import { generateReport } from './src/report.js';
import { sendToSlack } from './src/slack.js';
import 'dotenv/config';

async function main() {
  console.log('=== Running Workspace Integration Test ===');
  const topics = ['typescript', 'gemini'];
  
  // 1. Fetch RSS
  console.log('Fetching articles for topics:', topics);
  const articles = await fetchAllArticles(topics, 24);
  console.log(`Fetched ${articles.length} articles.`);

  // 2. Gemini Report
  const apiKey = process.env.GEMINI_API_KEY;
  let reportText = '';
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    console.log('GEMINI_API_KEY is configured. Calling Gemini API...');
    reportText = await generateReport(apiKey, articles, topics);
  } else {
    console.log('GEMINI_API_KEY is missing or template. Stubbing report generation.');
    reportText = `*【技術トレンド日報 (TEST STUB)】*\nトピック: ${topics.join(', ')}\n\n`;
    reportText += `収集された記事数: ${articles.length}\n`;
    articles.slice(0, 3).forEach((a, i) => {
      reportText += `- <${a.link}|${a.title}> (${a.source})\n`;
    });
  }

  console.log('\n--- Output Report Content ---');
  console.log(reportText);
  console.log('-----------------------------\n');

  // 3. Slack Webhook
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  if (slackUrl && slackUrl !== 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL') {
    console.log('SLACK_WEBHOOK_URL is configured. Sending to Slack...');
    await sendToSlack(slackUrl, reportText);
    console.log('Sent successfully!');
  } else {
    console.log('SLACK_WEBHOOK_URL is missing or template. Skipping Slack post.');
  }

  console.log('=== Integration Test Done ===');
}

main().catch(console.error);
