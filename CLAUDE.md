# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run build` — compile TypeScript from `src/` to `dist/` (uses `tsc`; emits ES2022 / NodeNext modules)
- `npm run start` — run the entrypoint directly via `tsx src/index.ts` (no build needed)
- `node dist/index.js` — run the compiled bundle (used by CI)
- `npx tsx test-pipeline.ts` — integration test of the full pipeline against a hardcoded `['typescript', 'gemini']` topic set. Gracefully stubs the Gemini call and skips Slack post if the corresponding env var is missing/template — useful for offline RSS-only smoke tests.

There is no test framework, lint, or formatter configured. `test-pipeline.ts` is the only test harness.

## Architecture

TrendSeeker is a single-shot batch job, not a long-running service. `src/index.ts` runs a fixed 4-stage pipeline and exits:

1. **`config.ts` → `loadConfig()`** — reads `GEMINI_API_KEY` and `SLACK_WEBHOOK_URL` from env (via `dotenv`), and `topics: string[]` from `config.json` at `process.cwd()`. Missing env vars throw; missing/malformed `config.json` only warns and continues with empty topics.
2. **`rss.ts` → `fetchAllArticles(topics, hoursAgo)`** — for each topic, fetches Zenn (`https://zenn.dev/topics/<topic>/feed`) and Qiita (`https://qiita.com/tags/<topic>/feed.atom`) in parallel via `rss-parser`, filters to articles newer than `hoursAgo`, and deduplicates across topics using a `Map` keyed by article URL. When the same article matches multiple topics, the topic tags are merged onto a single `Article`.
3. **`report.ts` → `generateReport()`** — serializes articles (snippets truncated to 300 chars) into a Japanese prompt for `gemini-3.5-flash` via `@google/genai`. The prompt enforces **Slack mrkdwn** specifically — links MUST be `<URL|text>`, never `[text](URL)`. Empty-articles path returns a hardcoded "no articles found" message without calling Gemini.
4. **`slack.ts` → `sendToSlack()`** — single `fetch` POST of `{ text }` to the incoming webhook.

Key design constraints to preserve:

- **ESM-only** (`"type": "module"`, `module: NodeNext`). Internal imports must use `.js` extensions even when importing `.ts` source (e.g. `from './rss.js'`).
- `config.json` is resolved from `process.cwd()`, not relative to the source file — running from a different directory will silently lose topics.
- Slack message format is `mrkdwn` via the `text` field of an incoming webhook (no Block Kit). The Gemini prompt is the single source of truth for output formatting rules.

## Deployment

Runs on GitHub Actions (`.github/workflows/trend-seeker.yml`) on cron `0 0 * * *` (09:00 JST daily) plus `workflow_dispatch`. CI does `npm ci` → `npm run build` → `node dist/index.js`, with `GEMINI_API_KEY` and `SLACK_WEBHOOK_URL` from repo secrets. To change the schedule, edit the cron expression; to change watched topics, edit `config.json` (committed to the repo, no secret).
