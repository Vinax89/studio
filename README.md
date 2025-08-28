
This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Development

- `npm run lint` – run ESLint for code quality.
- `npm test` – run unit tests with Jest.

## Rate Limits

API routes are protected with a simple in-memory rate limiter.

- **Per IP**: 5 requests per minute
- **Per User**: 10 requests per minute (identified by the `x-user-id` header)

Exceeding these thresholds results in an HTTP 429 response.
