import { formatISO } from "date-fns";
import { monthMatrix, allOccurrencesInRange } from "../lib/calendar";
import { Debt } from "../lib/types";

describe("monthMatrix", () => {
  it("creates a 42-day grid starting on Sunday", () => {
    const grid = monthMatrix(2024, 0, 0);
    expect(grid).toHaveLength(42);
    expect(formatISO(grid[0], { representation: "date" })).toBe("2023-12-31");
    expect(formatISO(grid[41], { representation: "date" })).toBe("2024-02-10");
  });

  it("supports Monday as the first day of week", () => {
    const grid = monthMatrix(2024, 0, 1);
    expect(formatISO(grid[0], { representation: "date" })).toBe("2024-01-01");
    expect(formatISO(grid[41], { representation: "date" })).toBe("2024-02-11");
  });
});

const baseDebt: Omit<Debt, "id" | "name" | "dueDate" | "recurrence"> = {
  initialAmount: 0,
  currentAmount: 0,
  interestRate: 0,
  minimumPayment: 0,
  autopay: false,
};

describe("allOccurrencesInRange", () => {
  it("handles weekly debts", () => {
    const debt: Debt = { ...baseDebt, id: "w1", name: "Weekly", dueDate: "2024-01-01", recurrence: "weekly" };
    const dates = allOccurrencesInRange(debt, new Date("2024-01-01"), new Date("2024-01-31"));
    expect(dates.map(d => formatISO(d, { representation: "date" }))).toEqual([
      "2024-01-01",
      "2024-01-08",
      "2024-01-15",
      "2024-01-22",
      "2024-01-29",
    ]);
  });

  it("handles monthly debts", () => {
    const debt: Debt = { ...baseDebt, id: "m1", name: "Monthly", dueDate: "2024-01-15", recurrence: "monthly" };
    const dates = allOccurrencesInRange(debt, new Date("2024-01-01"), new Date("2024-04-30"));
    expect(dates.map(d => formatISO(d, { representation: "date" }))).toEqual([
      "2024-01-15",
      "2024-02-15",
      "2024-03-15",
      "2024-04-15",
    ]);
  });
});

