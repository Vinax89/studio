# Firestore Security Rules

Transactions are scoped to the authenticated user. Each transaction document must include a `userId` field. Firestore rules ensure that a user can only read or write documents where the `userId` matches their authenticated `uid`.

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{id} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

These rules prevent users from accessing or modifying transactions belonging to other accounts.
