import React from "react";
import { renderToString } from "react-dom/server";
import { useDebtOccurrences } from "../hooks/use-debt-occurrences";
import { CalendarDebt } from "../lib/types";

type HookReturn = ReturnType<typeof useDebtOccurrences>;

function renderUseDebtOccurrences(
  debts: CalendarDebt[],
  from: Date,
  to: Date,
  query = ""
): HookReturn {
  let result: HookReturn = { occurrences: [], grouped: new Map() } as HookReturn;
  function TestComponent() {
    result = useDebtOccurrences(debts, from, to, query);
    return null;
  }
  renderToString(React.createElement(TestComponent));
  return result;
}

describe("useDebtOccurrences", () => {
  it("handles weekly debts", () => {
    const debt: CalendarDebt = {
      id: "w1",
      name: "Weekly",
      amount: 100,
      dueDate: "2024-01-01",
      recurrence: "weekly",
      autopay: false,
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
    const debt: CalendarDebt = {
      id: "b1",
      name: "Biweekly",
      amount: 100,
      dueDate: "2024-01-01",
      recurrence: "biweekly",
      autopay: false,
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
    const debt: CalendarDebt = {
      id: "m1",
      name: "Monthly",
      amount: 100,
      dueDate: "2024-01-15",
      recurrence: "monthly",
      autopay: false,
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
    const debt: CalendarDebt = {
      id: "n1",
      name: "One-time",
      amount: 100,
      dueDate: "2024-01-10",
      recurrence: "none",
      autopay: false,
    };
    const { occurrences } = renderUseDebtOccurrences(
      [debt],
      new Date("2024-01-01"),
      new Date("2024-01-31")
    );
    expect(occurrences.map((o) => o.date)).toEqual(["2024-01-10"]);
  });
});

