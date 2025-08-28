import { calculatePayoffSchedule, estimatePayoffDate } from "../lib/debt-utils";

describe("calculatePayoffSchedule", () => {
  it("computes amortization schedule and payoff date", () => {
    const start = new Date("2024-01-01");
    const schedule = calculatePayoffSchedule(1000, 0, 100, start);
    expect(schedule.payoffDate).toBe("2024-11-01");
    expect(schedule.points[0]).toEqual({ date: "2024-01-01", balance: 1000 });
    expect(schedule.points[schedule.points.length - 1]).toEqual({ date: "2024-11-01", balance: 0 });
  });

  it("returns null payoff date for interest-only payments", () => {
    const start = new Date("2024-01-01");
    const schedule = calculatePayoffSchedule(1000, 12, 10, start);
    expect(schedule.payoffDate).toBeNull();
  });
});

describe("estimatePayoffDate", () => {
  it("matches payoff date from schedule", () => {
    const payoffDate = estimatePayoffDate(1000, 0, 100, new Date("2024-01-01"));
    expect(payoffDate).toBe("2024-11-01");
  });
});
