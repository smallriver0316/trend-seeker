# TrendSeeker

TrendSeeker is an automated technology trend aggregator and reporter. It automatically collects the latest technical articles from Zenn and Qiita, filters and summarizes them using the Gemini API, and sends the compiled daily report to your Slack channel. The application runs entirely on GitHub Actions on a daily schedule.

## Key Features

- **Automated RSS Feed Collection**: Automatically fetches recent articles published within the last 24 hours from Zenn topic feeds and Qiita tag feeds, and deduplicates them.
- **AI-Powered Summary & Filtering**: Uses the `gemini-3.5-flash` model to filter out irrelevant posts and create a structured daily tech digest.
- **Slack Notification**: Formats reports in Slack-compatible markdown (`mrkdwn`) with clean formatting and embeds correct Slack-style hyperlinks.
- **GitHub Actions Scheduled Runs**: Runs on a daily cron schedule (default: 9:00 AM JST / 0:00 UTC) with manual trigger support.

## Project Structure

```text
.
├── .github/workflows/
│   └── trend-seeker.yml  # GitHub Actions workflow definition
├── src/
│   ├── config.ts         # Environment and settings loader
│   ├── rss.ts            # RSS feed fetching and parsing
│   ├── report.ts         # Report generation using Gemini API
│   ├── slack.ts          # Slack webhook integration
│   └── index.ts          # Application entrypoint
├── config.json           # Watchlist configuration (topics)
├── tsconfig.json         # TypeScript configuration
├── package.json          # Node dependencies and scripts
└── README.md             # This file
```

## Setup Instructions

### Prerequisites

You will need the following API keys and tokens:

1. **Gemini API Key**: Obtain it from [Google AI Studio](https://aistudio.google.com/).
2. **Slack Incoming Webhook URL**: Create a Webhook URL for your target Slack channel.

---

### A. Local Development

#### 1. Install Dependencies

Run the following command at the root of the project:

```bash
npm install
```

#### 2. Configure Environment Variables

Create a local `.env` file (you can copy `.env.example` as a template):

```bash
cp .env.example .env
```

Open the `.env` file and set your actual keys:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
SLACK_WEBHOOK_URL=your_actual_slack_webhook_url
```

#### 3. Customize Monitored Topics

Edit the `topics` array in [config.json](file:///Users/ogawamasahiro/Workspace/github.com/trend-seeker/config.json) to add or remove the technology keywords/tags you want to watch:

```json
{
  "topics": ["typescript", "nextjs", "gemini", "ai", "github-actions"]
}
```

#### 4. Run Integration Tests

Use the test pipeline script to run the full flow locally (fetching articles, generating the summary, and posting to Slack):

```bash
npx tsx test-pipeline.ts
```

#### 5. Build and Run Production Bundle

To build and execute the compiled JavaScript:

Use the test pipeline script to run the full flow locally (fetching articles, generating the summary, and posting to Slack):

```bash
npx tsx test-pipeline.ts
```

#### 6. Build and Run Production Bundle

To build and execute the compiled JavaScript:

```bash
# Build
npm run build

# Start
npm run start
```

---

### B. Deployment & Automated Runs (GitHub Actions)

To set up the automated daily execution, register the API keys in your GitHub repository secrets:

1. Go to your GitHub repository's **Settings** page.
2. Select **Secrets and variables** > **Actions** from the left sidebar.
3. Click **New repository secret** and register:
   - Secret Name: `GEMINI_API_KEY` / Value: Your Gemini API Key
   - Secret Name: `SLACK_WEBHOOK_URL` / Value: Your Slack Incoming Webhook URL
4. Once saved, the scheduled workflow defined in [.github/workflows/trend-seeker.yml](file:///Users/ogawamasahiro/Workspace/github.com/trend-seeker/.github/workflows/trend-seeker.yml) will run automatically every day at 9:00 AM JST (0:00 UTC). You can also run it manually from the **Actions** tab in GitHub by selecting the workflow and clicking `Run workflow`.
