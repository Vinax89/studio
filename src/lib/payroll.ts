import type { DateRange } from 'react-day-picker';

export interface Shift {
  date: Date;
  hours: number;
  rate: number;
  premiumPay?: number;
  differentials?: string;
}

export interface PayPeriodSummary {
  totalIncome: number;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
}

/**
 * Find the Sunday that starts the biweekly pay period containing `date`.
 *
 * The optional `anchor` lets organizations align pay periods to their own
 * reference Sunday. By default, January 7, 2024 (UTC) is used as the anchor
 * date.
 *
 * Both `date` and `anchor` are normalized to midnight UTC using `Date.UTC` to
 * ensure consistent calculations across timezones. The returned `Date` is also
 * at midnight UTC.
 *
 * @param date - Any date within the pay period.
 * @param anchor - Reference Sunday used to align pay periods.
 * @returns The start date (Sunday) of the pay period in UTC.
 */
export const getPayPeriodStart = (
  date: Date,
  anchor: Date = new Date(Date.UTC(2024, 0, 7))
): Date => {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const a = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate())
  );

  const dayOfWeek = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - dayOfWeek);

  const diffWeeks = Math.floor(
    (d.getTime() - a.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  const parity = Math.abs(diffWeeks) % 2;

  if (parity !== 0) {
    // It's in the second week of a pay period, so the start was the *previous* Sunday
    d.setUTCDate(d.getUTCDate() - 7);
  }

  return d;
};

// Determine the next pay day for a biweekly schedule. If the provided date is
// already the start of a pay period, that date is considered the pay day.
export const getNextPayDay = (date: Date = new Date()): Date => {
  const payDayStart = getPayPeriodStart(date);
  const payDayEnd = new Date(payDayStart);
  payDayEnd.setUTCDate(payDayEnd.getUTCDate() + 1);

  if (date >= payDayEnd) {
    const next = new Date(payDayStart);
    next.setUTCDate(payDayStart.getUTCDate() + 14);
    return next;
  }

  return payDayStart;
};

export const calculateOvertimeDates = (shifts: Shift[]): Date[] => {
  const weeklyShifts: Record<string, Shift[]> = {};

  // Group shifts by week
  shifts.forEach(shift => {
    const shiftDay = shift.date.getDay(); // Sunday = 0
    const weekStart = new Date(shift.date);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - shiftDay);
    const weekStartStr = weekStart.toISOString();

    if (!weeklyShifts[weekStartStr]) {
      weeklyShifts[weekStartStr] = [];
    }
    weeklyShifts[weekStartStr].push(shift);
  });

  const overtimeDates: Date[] = [];
  for (const weekStartStr in weeklyShifts) {
    const week = weeklyShifts[weekStartStr].sort((a, b) => a.date.getTime() - b.date.getTime());

    let weeklyHours = 0;
    for (const shift of week) {
      const previousHours = weeklyHours;
      weeklyHours += shift.hours;
      // If the hours *before* this shift were already over 40, this is an extra shift.
      // Or, if this shift is the one that *crosses* the 40-hour threshold.
      if (previousHours >= 40 || (previousHours < 40 && weeklyHours > 40)) {
        overtimeDates.push(shift.date);
      }
    }
  }
  return overtimeDates;
};

export const calculatePayPeriodSummary = (
  shifts: Shift[],
  payPeriod: DateRange | undefined
): PayPeriodSummary => {
  if (!payPeriod || !payPeriod.from || !payPeriod.to) {
    return { totalIncome: 0, regularHours: 0, overtimeHours: 0, totalHours: 0 };
  }

  const week1Start = new Date(payPeriod.from);
  week1Start.setHours(0, 0, 0, 0);
  const week1End = new Date(week1Start);
  week1End.setDate(week1End.getDate() + 6);
  week1End.setHours(23, 59, 59, 999);

  const week2Start = new Date(week1Start);
  week2Start.setDate(week1Start.getDate() + 7);
  const week2End = new Date(payPeriod.to);
  week2End.setHours(23, 59, 59, 999);

  let totalIncome = 0;
  let totalRegularHours = 0;
  let totalOvertimeHours = 0;

  const calculateWeekPay = (start: Date, end: Date) => {
    const weekShifts = shifts.filter(s => s.date >= start && s.date <= end);
    if (weekShifts.length === 0) return 0;

    let weeklyHours = 0;
    let weeklyIncome = 0;
    let weeklyPremiumPay = 0;

    // First pass: Calculate total hours and sum premium pay
    weekShifts.forEach(shift => {
      weeklyHours += shift.hours;
      weeklyPremiumPay += shift.premiumPay || 0;
    });

    const regularHours = Math.min(weeklyHours, 40);
    const overtimeHours = Math.max(0, weeklyHours - 40);

    totalRegularHours += regularHours;
    totalOvertimeHours += overtimeHours;

    if (weeklyHours === 0) {
      return weeklyPremiumPay;
    }

    const avgRate = weekShifts.reduce((acc, s) => acc + s.rate * s.hours, 0) / weeklyHours;
    const regularPay = regularHours * avgRate;
    const overtimePay = overtimeHours * avgRate * 1.5;
    weeklyIncome = regularPay + overtimePay + weeklyPremiumPay;

    return weeklyIncome;
  };

  const week1Pay = calculateWeekPay(week1Start, week1End);
  const week2Pay = calculateWeekPay(week2Start, week2End);

  totalIncome = week1Pay + week2Pay;

  return {
    totalIncome,
    regularHours: totalRegularHours,
    overtimeHours: totalOvertimeHours,
    totalHours: totalRegularHours + totalOvertimeHours,
  };
};

export const getShiftsInPayPeriod = (
  shifts: Shift[],
  payPeriod: DateRange | undefined
): Shift[] => {
  if (!payPeriod || !payPeriod.from || !payPeriod.to) return [];
  return shifts
    .filter(shift => shift.date >= payPeriod.from && shift.date <= payPeriod.to)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

