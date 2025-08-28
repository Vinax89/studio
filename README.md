# Firebase Studio Next.js Starter

This project provides a Next.js starter configured for Firebase Studio and AI-driven financial tools.

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

