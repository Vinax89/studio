import React from "react";
import { renderToString } from "react-dom/server";
import { useDebtOccurrences, DEFAULT_MAX_OCCURRENCES } from "../hooks/use-debt-occurrences";
import { Debt } from "../lib/types";
import { logger } from "../lib/logger";

type HookReturn = ReturnType<typeof useDebtOccurrences>;

// A helper to render the hook in a Node.js test environment
function renderUseDebtOccurrences(
  debts: Debt[],
  from: Date,
  to: Date,
  query = "",
  maxOccurrences = DEFAULT_MAX_OCCURRENCES,
  opts?: { returnTruncated?: boolean }
): HookReturn {
  let result: HookReturn = { occurrences: [], grouped: new Map() } as HookReturn;
  function TestComponent() {
    result = useDebtOccurrences(debts, from, to, query, maxOccurrences, opts);
    return null;
  }
  renderToString(React.createElement(TestComponent));
  return result;
}

const baseDebt: Omit<Debt, 'id' | 'name' | 'dueDate' | 'recurrence'> = {
    initialAmount: 1000,
    currentAmount: 500,
    interestRate: 5,
    minimumPayment: 100,
    autopay: false,
};

describe("useDebtOccurrences", () => {
  it("handles weekly debts", () => {
    const debt: Debt = {
      ...baseDebt,
      id: "w1",
      name: "Weekly",
      dueDate: "2024-01-01",
      recurrence: "weekly",
    };
    const { occurrences } = renderUseDebtOccurrences(
      [debt],
      new Date("2024-01-01"),
      new Date("2024-01-31")
    );
    expect(occurrences.map((o) => o.date)).toEqual([
      "2024-01-01",
      "2024-01-08",
      "2024-01-15",
      "2024-01-22",
      "2024-01-29",
    ]);
  });

  it("handles biweekly debts", () => {
    const debt: Debt = {
      ...baseDebt,
      id: "b1",
      name: "Biweekly",
      dueDate: "2024-01-01",
      recurrence: "biweekly",
    };
    const { occurrences } = renderUseDebtOccurrences(
      [debt],
      new Date("2024-01-01"),
      new Date("2024-02-01")
    );
    expect(occurrences.map((o) => o.date)).toEqual([
      "2024-01-01",
      "2024-01-15",
      "2024-01-29",
    ]);
  });

  it("handles monthly debts", () => {
    const debt: Debt = {
      ...baseDebt,
      id: "m1",
      name: "Monthly",
      dueDate: "2024-01-15",
      recurrence: "monthly",
    };
    const { occurrences } = renderUseDebtOccurrences(
      [debt],
      new Date("2024-01-01"),
      new Date("2024-04-30")
    );
    expect(occurrences.map((o) => o.date)).toEqual([
      "2024-01-15",
      "2024-02-15",
      "2024-03-15",
      "2024-04-15",
    ]);
  });

  it("handles non-recurring debts", () => {
    const debt: Debt = {
      ...baseDebt,
      id: "n1",
      name: "One-time",
      dueDate: "2024-01-10",
      recurrence: "none",
    };
    const { occurrences } = renderUseDebtOccurrences(
      [debt],
      new Date("2024-01-01"),
      new Date("2024-01-31")
    );
    expect(occurrences.map((o) => o.date)).toEqual(["2024-01-10"]);
  });

  it("warns and truncates when exceeding max occurrences", () => {
    const debt: Debt = {
      ...baseDebt,
      id: "w2",
      name: "Weekly", // many occurrences
      dueDate: "2024-01-01",
      recurrence: "weekly",
    };
    const warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => {});
    const { occurrences } = renderUseDebtOccurrences(
      [debt],
      new Date("2024-01-01"),
      new Date("2024-03-01"),
      "",
      3
    );
    expect(occurrences.map((o) => o.date)).toEqual([
      "2024-01-01",
      "2024-01-08",
      "2024-01-15",
    ]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("returns truncation flag when option enabled", () => {
    const debt: Debt = {
      ...baseDebt,
      id: "w3",
      name: "Weekly", // many occurrences
      dueDate: "2024-01-01",
      recurrence: "weekly",
    };
    const warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => {});
    const { occurrences, truncated } = renderUseDebtOccurrences(
      [debt],
      new Date("2024-01-01"),
      new Date("2024-03-01"),
      "",
      3,
      { returnTruncated: true }
    ) as ReturnType<typeof useDebtOccurrences> & { truncated: boolean };
    expect(occurrences.map((o) => o.date)).toEqual([
      "2024-01-01",
      "2024-01-08",
      "2024-01-15",
    ]);
    expect(truncated).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
