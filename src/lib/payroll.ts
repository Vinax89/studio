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

// Helper to find the start of a 2-week pay period (a Sunday) for any given date.
// The optional `anchor` parameter lets different organizations align pay periods
// to their own reference Sunday. By default, January 7, 2024 is used as the anchor
// date for calculations.
export const getPayPeriodStart = (
  date: Date,
  anchor: Date = new Date('2024-01-07T00:00:00.000Z')
): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay();
  d.setDate(d.getDate() - dayOfWeek);

  const diffWeeks = Math.floor((d.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24 * 7));

  if (diffWeeks % 2 !== 0) {
    // It's in the second week of a pay period, so the start was the *previous* Sunday
    d.setDate(d.getDate() - 7);
  }

  return d;
};

// Determine the next pay day for a biweekly schedule. If the provided date is
// already the start of a pay period, that date is considered the pay day.
export const getNextPayDay = (date: Date = new Date()): Date => {
  const start = getPayPeriodStart(date)
  const today = new Date(date)
  today.setHours(0, 0, 0, 0)

  if (today > start) {
    const next = new Date(start)
    next.setDate(start.getDate() + 14)
    return next
  }

  return start
}

export const calculateOvertimeDates = (shifts: Shift[]): Date[] => {
  const weeklyShifts: Record<string, Shift[]> = {};

  // Group shifts by week
  shifts.forEach(shift => {
    const shiftDay = shift.date.getDay(); // Sunday = 0
    const weekStart = new Date(shift.date);
    weekStart.setDate(shift.date.getDate() - shiftDay);
    weekStart.setHours(0, 0, 0, 0);
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

  const week1Start = payPeriod.from;
  const week1End = new Date(week1Start);
  week1End.setDate(week1End.getDate() + 6);

  const week2Start = new Date(week1Start);
  week2Start.setDate(week1Start.getDate() + 7);
  const week2End = payPeriod.to;

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

