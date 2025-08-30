# Service Worker Notes

When connectivity is restored, the application waits for the service worker to be ready before attempting to sync queued transactions.

To avoid hanging indefinitely in case the service worker never becomes ready, this wait is limited to **5 seconds**.

If the timeout is reached, a warning is logged and syncing proceeds anyway.
