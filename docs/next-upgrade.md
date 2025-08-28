# Upgrading Next.js

This project pins the Next.js version to avoid unintended updates. To upgrade deliberately:

1. Review [Next.js release notes](https://nextjs.org/docs/changelog) and security advisories for relevant changes.
2. Edit `package.json` to set `next` to the desired version.
3. Run `npm update next@<version>` (or `npm install`) to update `package-lock.json`.
4. Execute `npm run lint` and `npm test` to verify the update.
5. Commit the changes with a clear message referencing the new version.

Repeat these steps whenever updating Next.js.
