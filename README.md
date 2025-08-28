This is a NextJS starter in Firebase Studio.
To get started, take a look at src/app/page.tsx.

## Development
- `npm run lint` – run ESLint for code quality.
- `npm test` – run unit tests with Jest.

## Housekeeping service

The housekeeping service removes outdated files from Cloud Storage to manage costs and data retention.

### Running locally
1. Install dependencies with `npm install`.
2. Provide the environment variables listed below.
3. Start the service with `npm run housekeeping` or `node scripts/housekeeping.ts`.

### Scheduled deployment
- Deploy the service with `firebase deploy --only run.housekeeping`.
- A Cloud Scheduler job triggers the service nightly at 03:00 UTC.
- Update the schedule in the Firebase console if a different cadence is required.

## Environment variables

Create a `.env.local` file by copying `.env.example` and populate it with the required values. The `.env.local` file is excluded from version control to keep sensitive information local.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project containing the storage bucket. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Default Cloud Storage bucket for uploads. |
| `RETENTION_DAYS` | Number of days to retain files before deletion (default: 30). |

Adjust the retention threshold by setting `RETENTION_DAYS` before running the service or updating the scheduled job configuration.
