export interface PayoffPoint {
  date: string;
  balance: number;
}

export interface PayoffSchedule {
  points: PayoffPoint[];
  payoffDate: string | null;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Calculate an amortization schedule for a debt using the
 * current balance, annual interest rate and fixed monthly payment.
 * Returns the remaining balance for each month until payoff and the
 * estimated payoff date.
 */
export function calculatePayoffSchedule(
  currentBalance: number,
  annualInterestRate: number,
  monthlyPayment: number,
  startDate: Date = new Date()
): PayoffSchedule {
  const monthlyRate = annualInterestRate / 100 / 12;
  const points: PayoffPoint[] = [];
  let balance = currentBalance;
  let date = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  points.push({ date: iso(date), balance: parseFloat(balance.toFixed(2)) });

  // Prevent infinite loops for interest-only payments
  const maxMonths = 600; // 50 years
  let prevBalance = balance + 1;

  for (let i = 0; i < maxMonths && balance > 0; i++) {
    // accrue interest then apply payment
    balance += balance * monthlyRate;
    balance -= monthlyPayment;
    if (balance < 0) balance = 0;

    date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    points.push({ date: iso(date), balance: parseFloat(balance.toFixed(2)) });

    // if we are no longer reducing principal, break
    if (balance >= prevBalance) {
      return { points, payoffDate: null };
    }
    prevBalance = balance;
  }

  const payoffDate = balance <= 0 ? points[points.length - 1].date : null;
  return { points, payoffDate };
}

/**
 * Convenience function to get only the payoff date.
 */
export function estimatePayoffDate(
  currentBalance: number,
  annualInterestRate: number,
  monthlyPayment: number,
  startDate: Date = new Date()
): string | null {
  return calculatePayoffSchedule(currentBalance, annualInterestRate, monthlyPayment, startDate).payoffDate;
}
