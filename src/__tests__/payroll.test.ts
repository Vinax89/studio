import {
  getPayPeriodStart,
  calculateOvertimeDates,
  calculatePayPeriodSummary,
  getNextPayDay,
  type Shift,
} from "../lib/payroll";
import type { DateRange } from "react-day-picker";

describe("payroll utilities", () => {
  test("getPayPeriodStart returns beginning Sunday of pay period", () => {
    const date = new Date("2024-01-15T12:00:00Z"); // Monday in second week
    const start = getPayPeriodStart(date);
    expect(start.toISOString().slice(0, 10)).toBe("2024-01-07");
  });

  test("getPayPeriodStart accepts a custom anchor", () => {
    const date = new Date("2024-01-15T12:00:00Z");
    const anchor = new Date("2024-01-14T00:00:00Z");
    const start = getPayPeriodStart(date, anchor);
    expect(start.toISOString().slice(0, 10)).toBe("2024-01-14");
  });

  test("getPayPeriodStart handles dates before the anchor", () => {
    const date = new Date("2023-12-31T12:00:00Z");
    const start = getPayPeriodStart(date);
    expect(start.toISOString().slice(0, 10)).toBe("2023-12-24");
  });

  test("getNextPayDay returns start when given a pay period date in UTC", () => {
    const date = new Date("2024-01-07T00:00:00Z");
    const next = getNextPayDay(date);
    expect(next.toISOString().slice(0, 10)).toBe("2024-01-07");
  });

  test("getNextPayDay compares dates in consistent timezones", () => {
    const date = new Date("2024-01-07T00:00:00-08:00");
    const next = getNextPayDay(date);
    expect(next.toISOString().slice(0, 10)).toBe("2024-01-07");
  });

  test("calculateOvertimeDates identifies shifts after 40 hours", () => {
    const shifts: Shift[] = [
      { date: new Date("2024-01-08"), hours: 8, rate: 10 },
      { date: new Date("2024-01-09"), hours: 8, rate: 10 },
      { date: new Date("2024-01-10"), hours: 8, rate: 10 },
      { date: new Date("2024-01-11"), hours: 8, rate: 10 },
      { date: new Date("2024-01-12"), hours: 10, rate: 10 },
      { date: new Date("2024-01-13"), hours: 8, rate: 10 },
    ];
    const ot = calculateOvertimeDates(shifts);
    expect(ot.map((d) => d.toISOString().slice(0, 10))).toEqual([
      "2024-01-12",
      "2024-01-13",
    ]);
  });

  test("calculatePayPeriodSummary ignores shifts outside the range", () => {
    const shifts: Shift[] = [
      { date: new Date("2024-01-08"), hours: 10, rate: 10 },
      { date: new Date("2024-01-09"), hours: 10, rate: 10 },
      { date: new Date("2024-01-10"), hours: 10, rate: 10 },
      { date: new Date("2024-01-11"), hours: 10, rate: 10 },
      { date: new Date("2024-01-12"), hours: 10, rate: 10 }, // week1: 50h
      { date: new Date("2024-01-15"), hours: 8, rate: 10 },
      { date: new Date("2024-01-16"), hours: 8, rate: 10 },
      { date: new Date("2024-01-17"), hours: 8, rate: 10 },
      { date: new Date("2024-01-18"), hours: 8, rate: 10 },
      { date: new Date("2024-01-19"), hours: 8, rate: 10 }, // week2: 40h
      { date: new Date("2024-01-21"), hours: 8, rate: 10 }, // outside period
    ];
    const period: DateRange = {
      from: new Date("2024-01-07"),
      to: new Date("2024-01-20"),
    };
    const summary = calculatePayPeriodSummary(shifts, period);
    expect(summary).toEqual({
      totalIncome: 950,
      regularHours: 80,
      overtimeHours: 10,
      totalHours: 90,
    });
  });

  test("getNextPayDay returns next period after the pay day ends", () => {
    const date = new Date("2024-01-08T00:00:00Z");
    const next = getNextPayDay(date);
    expect(next.toISOString().slice(0, 10)).toBe("2024-01-21");
  });

  test("getNextPayDay keeps the current pay day within 24 hours of start", () => {
    const date = new Date("2024-01-07T12:00:00Z");
    const current = getNextPayDay(date);
    expect(current.toISOString().slice(0, 10)).toBe("2024-01-07");
  });
});
