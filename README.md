This is a NextJS starter in Firebase Studio.
To get started, take a look at src/app/page.tsx.

## Development
- `npm run lint` – run ESLint for code quality.
- `npm test` – run unit tests with Jest.

## Housekeeping service

The housekeeping service removes outdated files from Cloud Storage to manage costs and data retention.

### Running locally
1. Install dependencies with `npm install`.
2. Authenticate with Google Cloud so the service can access your storage
   bucket, e.g. run `gcloud auth application-default login` or set the
   `GOOGLE_APPLICATION_CREDENTIALS` environment variable.
3. Provide the environment variables listed below.
4. Start the service with `npm run housekeeping` or `node scripts/housekeeping.ts`.

### Scheduled deployment
- Deploy the service with `firebase deploy --only run.housekeeping`.
- A Cloud Scheduler job triggers the service nightly at 03:00 UTC.
- Update the schedule in the Firebase console if a different cadence is required.

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project containing the storage bucket. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Default Cloud Storage bucket for uploads. |
| `RETENTION_DAYS` | Number of days to retain files before deletion. Must be a non‑negative integer. Defaults to 30. |

Adjust the retention threshold by setting `RETENTION_DAYS` before running the service or updating the scheduled job configuration.
