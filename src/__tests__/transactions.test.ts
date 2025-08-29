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
    expect(() => validateTransactions(rows, ["misc"])).toThrow(
      /Invalid amount in row 1/
    );
  });

  it("accepts valid ISO date", () => {
    const rows = [{ ...baseRow, amount: "10.00", date: "2024-12-31" }];
    expect(() => validateTransactions(rows, ["misc"])).not.toThrow();
  });

  it.each(["2024/01/01", "2024-1-1", "01-01-2024"])(
    "throws for invalid date '%s'",
    (date) => {
      const rows = [{ ...baseRow, amount: "10.00", date }];
      expect(() => validateTransactions(rows, ["misc"])).toThrow(/Invalid row 1/);
    }
  );

  it("throws for unknown category", () => {
    const rows = [{ ...baseRow, amount: "10.00", category: "Unknown" }];
    expect(() => validateTransactions(rows, ["misc"])).toThrow(/Unknown category/);
  });

  it("accepts known category", () => {
    const rows = [{ ...baseRow, amount: "10.00" }];
    expect(() => validateTransactions(rows, ["misc"])).not.toThrow();
  });

  it("normalizes category casing and whitespace", () => {
    const rows = [{ ...baseRow, amount: "10.00", category: " misc " }];
    const result = validateTransactions(rows, ["misc"]);
    expect(result[0].category).toBe("misc");
  });
});
