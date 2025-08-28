This is a NextJS starter in Firebase Studio.
To get started, take a look at src/app/page.tsx.

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
| `NEXT_PUBLIC_FIREBASE_API_KEY` | API key for the Firebase project. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain for the Firebase project. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project containing the storage bucket. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Default Cloud Storage bucket for uploads. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID. |
| `OPENAI_API_KEY` | API key from the OpenAI dashboard. |
| `RETENTION_DAYS` | Number of days to retain files before deletion (default: 30). |
| `CRON_SECRET` | Shared secret expected in the `X-CRON-SECRET` header for housekeeping runs. |

The Firebase variables are available in the Firebase console under **Project settings → General → Your apps**. Obtain
`OPENAI_API_KEY` from the [OpenAI dashboard](https://platform.openai.com/). `RETENTION_DAYS` defaults to `30` when unset.

Adjust the retention threshold by setting `RETENTION_DAYS` before running the service or updating the scheduled job configuration.

## Upgrading Next.js

This project pins Next.js to a specific version. When upgrading, follow the steps in [docs/next-upgrade.md](docs/next-upgrade.md) to review releases, update the version, and verify the changes.
