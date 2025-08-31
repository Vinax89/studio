'use client';
import { useEffect } from 'react';
import { getQueuedTransactions } from '@/lib/offline';
import { logger } from '@/lib/logger';

export default function ServiceWorker() {
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const queued = await getQueuedTransactions();
        if (queued.length) {
          await fetch('/api/transactions/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queued),
          });
        }
      } catch (err) {
        logger.error('Failed to sync queued transactions', err);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return null;
}

