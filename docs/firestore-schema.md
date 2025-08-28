# Firestore Schema

## Collections

### transactions
- `id`: string
- `date`: string (ISO)
- `description`: string
- `amount`: number
- `currency`: string (ISO currency code)
- `type`: "Income" | "Expense"
- `category`: string
- `isRecurring?`: boolean
- `createdAt`: string (ISO timestamp)

### debts
- `id`: string
- `name`: string
- `initialAmount`: number
- `currentAmount`: number
- `interestRate`: number
- `minimumPayment`: number
- `dueDate`: string
- `recurrence`: "none" | "weekly" | "biweekly" | "monthly"
- `autopay`: boolean
- `notes?`: string
- `color?`: string
- `paidDates?`: string[]
- `createdAt`: string (ISO timestamp)

### goals
- `id`: string
- `name`: string
- `targetAmount`: number
- `currentAmount`: number
- `deadline`: string
- `importance`: number
- `createdAt`: string (ISO timestamp)

### backups
- `transactions`: Transaction[]
- `debts`: Debt[]
- `goals`: Goal[]
- `createdAt`: string (ISO timestamp)

## Indexes

Each collection is queried by the `createdAt` field during backups.
Ensure a single-field index on `createdAt` exists for `transactions`, `debts`, and `goals`.
Firestore creates these automatically, but include them in `firestore.indexes.json` if deploying via Firebase CLI:

```json
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [{ "fieldPath": "createdAt", "order": "ASCENDING" }]
    },
    {
      "collectionGroup": "debts",
      "queryScope": "COLLECTION",
      "fields": [{ "fieldPath": "createdAt", "order": "ASCENDING" }]
    },
    {
      "collectionGroup": "goals",
      "queryScope": "COLLECTION",
      "fields": [{ "fieldPath": "createdAt", "order": "ASCENDING" }]
    }
  ],
  "fieldOverrides": []
}
```
