# Permission Model

All database utilities are protected by Firebase Authentication and require specific custom claims.

| Claim   | Description                             |
| ------- | --------------------------------------- |
| `read`  | Allows reading documents.               |
| `write` | Allows creating or updating documents.  |
| `delete`| Allows deleting documents.              |

Every operation checks that the caller is authenticated and possesses the required claim before performing any Firestore action.
