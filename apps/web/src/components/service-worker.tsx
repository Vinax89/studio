'use client';

import { useEffect } from 'react';
import { getQueuedTransactions } from '@/lib/offline';
import * as logger from '@/lib/logger';

export default function ServiceWorker() {
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const queued = await getQueuedTransactions();
        if (!queued.length) return;
        await fetch('/api/transactions/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(queued),
        });
      } catch (e) {
        logger.error('Failed to sync queued transactions', e);
      }
    }, 5000);
    return () => clearInterval(id);
  }, []);
  return null;
}
