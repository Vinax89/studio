import { validateTransactions } from "../lib/transactions";

const baseRow = {
  date: "2024-01-01",
  description: "Test",
  type: "Income" as const,
  category: "Misc",
};

describe("validateTransactions", () => {
  it.each(["abc", "", "NaN"])("throws for invalid amount '%s'", (amount) => {
    const rows = [{ ...baseRow, amount }];
    expect(() => validateTransactions(rows, ["Misc"])).toThrow(
      /Invalid amount in row 1/
    );
  });

  it("accepts valid ISO date", () => {
    const rows = [{ ...baseRow, amount: "10.00", date: "2024-12-31" }];
    expect(() => validateTransactions(rows, ["Misc"])).not.toThrow();
  });

  it.each(["2024/01/01", "2024-1-1", "01-01-2024"])(
    "throws for invalid date '%s'",
    (date) => {
      const rows = [{ ...baseRow, amount: "10.00", date }];
      expect(() => validateTransactions(rows, ["Misc"])).toThrow(/Invalid row 1/);
    }
  );

  it("throws for unknown category", () => {
    const rows = [{ ...baseRow, amount: "10.00", category: "Unknown" }];
    expect(() => validateTransactions(rows, ["Misc"])).toThrow(/Unknown category/);
  });

  it("accepts known category", () => {
    const rows = [{ ...baseRow, amount: "10.00" }];
    expect(() => validateTransactions(rows, ["Misc"])).not.toThrow();
  });

  it("accepts boolean isRecurring", () => {
    const rows = [{ ...baseRow, amount: "10.00", isRecurring: true }];
    const [tx] = validateTransactions(rows, ["Misc"]);
    expect(tx.isRecurring).toBe(true);
  });

  it("parses isRecurring string values", () => {
    const rows = [
      { ...baseRow, amount: "10.00", isRecurring: "true" },
      { ...baseRow, amount: "10.00", isRecurring: "false" },
    ];
    const [first, second] = validateTransactions(rows, ["Misc"]);
    expect(first.isRecurring).toBe(true);
    expect(second.isRecurring).toBe(false);
  });

  it("throws for invalid isRecurring string", () => {
    const rows = [{ ...baseRow, amount: "10.00", isRecurring: "yes" }];
    expect(() => validateTransactions(rows, ["Misc"])).toThrow(/Invalid row 1/);
  });
});
