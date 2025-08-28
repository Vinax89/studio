import { addWeeks, addMonths, isAfter } from 'date-fns';
import type { Transaction, Recurrence } from './types';

function getNextDate(date: Date, recurrence: Recurrence): Date {
  switch (recurrence) {
    case 'weekly':
      return addWeeks(date, 1);
    case 'biweekly':
      return addWeeks(date, 2);
    case 'monthly':
      return addMonths(date, 1);
    default:
      return date;
  }
}

export function generateUpcomingRecurringTransactions(
  transactions: Transaction[],
  occurrencesPerTransaction = 3
): Transaction[] {
  const upcoming: Transaction[] = [];
  const today = new Date();

  transactions.forEach((tx) => {
    if (!tx.isRecurring || !tx.recurrence || tx.recurrence === 'none') return;

    let next = new Date(tx.date);
    while (!isAfter(next, today)) {
      next = getNextDate(next, tx.recurrence);
    }

    for (let i = 0; i < occurrencesPerTransaction; i++) {
      const occurrenceDate = i === 0 ? next : (next = getNextDate(next, tx.recurrence));
      upcoming.push({
        ...tx,
        id: `${tx.id}-${occurrenceDate.toISOString().split('T')[0]}`,
        date: occurrenceDate.toISOString().split('T')[0],
      });
    }
  });

  return upcoming.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export { getNextDate };
