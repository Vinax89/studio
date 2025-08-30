# Transaction sync API

The `/api/transactions/sync` endpoint accepts an array of transactions that
have already been gathered from an external source. Each item must match the
`TransactionPayloadSchema` (id, date, description, amount, currency, type, and
category).

The server validates the payload and persists accepted transactions to
Firestore. A successful response reports how many records were saved:

```http
POST /api/transactions/sync
{
  "transactions": [/* ... */]
}

HTTP/1.1 200 OK
{
  "received": 3
}
```

If validation fails, the endpoint responds with `400` and error details.
Failures during persistence return an appropriate status code and error
message.
