This is a NextJS starter in Firebase Studio.
This project uses npm as the canonical package manager. Use npm for all dependency management tasks.
To get started, take a look at src/app/page.tsx.

## Development
- `npm run dev` – start the development server.
- On Cloud Workstations, run `PORT=6000 npm run dev` to match the reserved domain.
- `npm run lint` – run ESLint for code quality.
- `npm test` – run unit tests with Jest.
- `npm run e2e` – run Playwright end-to-end tests. Run `npx playwright install-deps` first to install required system dependencies.
- Run `npm install` to install Husky pre-commit hooks that run tests and reject commits containing standalone '...' lines.
- `node scripts/update-cost-of-living.ts` – refresh cost of living dataset from BEA.

## Package manager

This project uses **npm** exclusively. Install dependencies with `npm ci` and
commit changes to `package-lock.json`. Yarn and pnpm are not supported—the
`preinstall` hook fails if another package manager is detected. The repository's
`.npmrc` enables `engine-strict=true` to enforce the Node version specified in
`package.json`.

## Color input
When supplying colors to chart configuration, only the following formats are allowed:

- Hex colors such as `#fff` or `#ffffff`
- HSL references to CSS variables like `hsl(var(--chart-1))`

Values outside these patterns are ignored to prevent unsafe CSS injection.

## Housekeeping service

The housekeeping service archives old transactions, removes settled debts, and
creates a backup snapshot of current data.

### Running locally
1. Install dependencies with `npm install`.
2. Provide the environment variables listed below.
3. Start the service with `npm run housekeeping` or `node scripts/housekeeping.ts`.
   - Pass `--cutoff=YYYY-MM-DD` to override the default archive cutoff date
     derived from `RETENTION_DAYS` (30 days by default).

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
| `RETENTION_DAYS` | Days to retain transactions before archiving (default: 30). |
| `CRON_SECRET` | Shared secret expected in the `X-CRON-SECRET` header for housekeeping runs. |
| `DEFAULT_TZ` | Optional IANA timezone used when synchronizing time with the network. Defaults to the system timezone. |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed request origins for CORS. Regex patterns may be wrapped in `/`. |
| `LOG_LEVEL` | Minimum log level to output (`info`, `warn`, or `error`). Defaults to `info`. |

Adjust the retention threshold by setting `RETENTION_DAYS` before running the service or updating the scheduled job configuration.

## Internet time helper

Use `fetchInternetTime(tz)` to query a trusted source for the current time and
cache the offset between the device clock and network time. Subsequent calls to
`getCurrentTime(tz?)` apply this offset and fall back to the local clock when
the API is unreachable. The optional `tz` parameter accepts any IANA timezone
string and defaults to `DEFAULT_TZ` or the runtime's resolved timezone.

## Currency utilities

`getFxRate(from, to)` retrieves foreign exchange rates and caches them in
memory for one hour to avoid unnecessary network requests. Use
`clearFxRateCache()` in tests or development to reset the cache. The helper
`convertCurrency(amount, from, to)` uses these rates to convert between
currencies.

## Upgrading Next.js

This project pins Next.js to a specific version. When upgrading, follow the steps in [docs/next-upgrade.md](docs/next-upgrade.md) to review releases, update the version, and verify the changes.

## Payroll utilities

The `getPayPeriodStart(date, anchor?)` helper returns the Sunday that starts a
two-week pay period. It is used by the `PayPeriodSummary` utilities to group
shifts into the correct pay cycle. A custom `anchor` date can be provided to
align the cycle with organization-specific schedules. When omitted, the anchor
defaults to the pay period beginning on January 7, 2024.

## Cost of Living Dataset

Annual expense benchmarks are sourced from the **BEA Regional Price Parities**
release. The data file `src/data/costOfLiving2024.ts` stores per-adult yearly
costs for housing, groceries, utilities, transportation, healthcare, and
miscellaneous categories. Use `calculateCostOfLiving` to scale values by
household composition. Run `node scripts/update-cost-of-living.ts` each year to
fetch new figures.
