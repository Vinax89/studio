import {
  UserSchema,
  TransactionSchema,
  DebtAccountSchema,
  RecurrenceValues,
} from "../src";

describe("domain schemas", () => {
  it("parses a valid user", () => {
    const input = { uid: "u1", email: "test@example.com", displayName: "Test" };
    const user = UserSchema.parse(input);
    expect(user).toEqual(input);
    expect(JSON.parse(JSON.stringify(user))).toEqual(input);
  });

  it("rejects an invalid user", () => {
    expect(() => UserSchema.parse({ uid: "u1", email: "not-an-email" })).toThrow();
  });

  it("parses a valid transaction", () => {
    const input = {
      id: "t1",
      date: "2024-01-01",
      description: "Test",
      amount: 100,
      currency: "USD",
      type: "Income" as const,
      category: "General",
      isRecurring: true,
    };
    const tx = TransactionSchema.parse(input);
    expect(tx).toEqual(input);
    expect(JSON.parse(JSON.stringify(tx))).toEqual(input);
  });

  it("rejects an invalid transaction", () => {
    const bad = {
      id: "t1",
      date: "2024-01-01",
      description: "Test",
      amount: "100",
      currency: "USD",
      type: "Income",
      category: "General",
    } as unknown;
    expect(() => TransactionSchema.parse(bad)).toThrow();
  });

  it("parses a valid debt account", () => {
    const input = {
      id: "d1",
      name: "Loan",
      initialAmount: 1000,
      currentAmount: 900,
      interestRate: 5,
      minimumPayment: 50,
      dueDate: "2024-01-01",
      recurrence: RecurrenceValues[1],
      autopay: false,
    };
    const debt = DebtAccountSchema.parse(input);
    expect(debt).toEqual(input);
    expect(JSON.parse(JSON.stringify(debt))).toEqual(input);
  });

  it("rejects an invalid debt account", () => {
    const bad = {
      id: "d1",
      name: "Loan",
      initialAmount: 1000,
      currentAmount: 900,
      interestRate: 5,
      minimumPayment: 50,
      dueDate: "2024-01-01",
      recurrence: "yearly",
      autopay: false,
    } as unknown;
    expect(() => DebtAccountSchema.parse(bad)).toThrow();
  });
});
