import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

export interface AppConfig {
  geminiApiKey: string;
  slackWebhookUrl: string;
  topics: string[];
}

export function loadConfig(): AppConfig {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!geminiApiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.');
  }

  if (!slackWebhookUrl) {
    throw new Error('Missing SLACK_WEBHOOK_URL environment variable.');
  }

  const configPath = path.resolve(process.cwd(), 'config.json');
  let topics: string[] = [];

  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.topics)) {
        topics = parsed.topics;
      }
    } catch (error) {
      console.warn(`Warning: Failed to parse config.json. Using empty topics list. Error: ${error}`);
    }
  } else {
    console.warn('Warning: config.json not found. Using empty topics list.');
  }

  return {
    geminiApiKey,
    slackWebhookUrl,
    topics,
  };
}
