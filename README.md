# Firebase Studio Next.js Starter

This project provides a Next.js starter configured for Firebase Studio and AI-driven financial tools. To get started, take a look at src/app/page.tsx.

## Major Modules

### Dashboard
Central hub that summarizes your financial activity and key metrics at a glance.

![Dashboard](docs/images/dashboard.png)

### Debts
Track outstanding balances, payment schedules, and strategies to become debt-free.

![Debts](docs/images/debts.png)

### Goals
Define and monitor financial goals with progress tracking and intelligent suggestions.

![Goals workflow](docs/images/goals.gif)

### Insights
AI-powered analysis that surfaces personalized recommendations and trends.

![Insights](docs/images/insights.png)

## Environment Setup

1. **Prerequisites:** Node.js 20+, npm, and a Google AI API key.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:** Copy `.env.example` to `.env.local` and fill in Firebase credentials. Export your Google AI API key and optional Genkit model:
   ```bash
   export GOOGLE_AI_API_KEY="your-key"
   export GENKIT_MODEL="googleai/gemini-2.5-flash"
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Running AI Flows

1. **Start the Genkit development runtime:**
   ```bash
   npx genkit start src/ai/dev.ts
   ```
2. **Run a specific flow:**
   ```bash
   npx genkit flow:run src/ai/flows/analyze-spending-habits.ts analyzeSpendingHabitsFlow --data '{"financialDocuments":[],"userDescription":"","goals":[]}'
   ```
   Replace the `--data` JSON with appropriate input for the flow you want to test.

## Development

- `npm run lint` – run ESLint for code quality.
- `npm test` – run unit tests with Jest.

## Color input
When supplying colors to chart configuration, only the following formats are allowed:

- Hex colors such as `#fff` or `#ffffff`
- HSL references to CSS variables like `hsl(var(--chart-1))`

Values outside these patterns are ignored to prevent unsafe CSS injection.

## Housekeeping service

The housekeeping service removes outdated files from Cloud Storage to manage costs and data retention.

### Running locally
1. Install dependencies with `npm install`.
2. Provide the environment variables listed below.
3. Start the service with `npm run housekeeping` or `node scripts/housekeeping.ts`.

### Scheduled deployment
- Deploy the service with `firebase deploy --only run.housekeeping`.
- A Cloud Scheduler job triggers the service nightly at 03:00 UTC.
- Include an `X-CRON-SECRET` header in the job using the `CRON_SECRET` value to authenticate requests.
- Update the schedule in the Firebase console if a different cadence is required.
- The endpoint enforces a rate limit and rejects rapid repeated calls with HTTP 429.

## Environment variables

Create a `.env.local` file by copying `.env.example` and populate it with the required values. The `.env.local` file is excluded from version control to keep sensitive information local.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project containing the storage bucket. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Default Cloud Storage bucket for uploads. |
| `RETENTION_DAYS` | Number of days to retain files before deletion (default: 30). |
| `CRON_SECRET` | Shared secret expected in the `X-CRON-SECRET` header for housekeeping runs. |
| `DEFAULT_TZ` | Optional IANA timezone used when synchronizing time with the network. Defaults to the system timezone. |

Adjust the retention threshold by setting `RETENTION_DAYS` before running the service or updating the scheduled job configuration.

## Internet time helper

Use `fetchInternetTime(tz)` to query a trusted source for the current time and cache the offset between the device clock and network time. Subsequent calls to `getCurrentTime(tz?)` apply this offset and fall back to the local clock when the API is unreachable. The optional `tz` parameter accepts any IANA timezone string and defaults to `DEFAULT_TZ` or the runtime's resolved timezone.

## Upgrading Next.js

This project pins Next.js to a specific version. When upgrading, follow the steps in [docs/next-upgrade.md](docs/next-upgrade.md) to review releases, update the version, and verify the changes.

## Payroll utilities

The `getPayPeriodStart(date, anchor?)` helper returns the Sunday that starts a two-week pay period. It is used by the `PayPeriodSummary` utilities to group shifts into the correct pay cycle. A custom `anchor` date can be provided to align the cycle with organization-specific schedules. When omitted, the anchor defaults to the pay period beginning on January 7, 2024.

