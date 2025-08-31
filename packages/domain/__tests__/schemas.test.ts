import {
  UserSchema,
  TransactionSchema,
  DebtAccountSchema,
  GoalSchema,
  ChartPointSchema,
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

  it("parses a valid goal", () => {
    const input = {
      id: "g1",
      name: "Save",
      targetAmount: 1000,
      currentAmount: 200,
      deadline: "2024-12-31",
      importance: 3,
    };
    const goal = GoalSchema.parse(input);
    expect(goal).toEqual(input);
    expect(JSON.parse(JSON.stringify(goal))).toEqual(input);
  });

  it("rejects an invalid goal", () => {
    const bad = {
      id: "g1",
      name: "Save",
      targetAmount: "1000",
      currentAmount: 200,
      deadline: "2024-12-31",
      importance: 3,
    } as unknown;
    expect(() => GoalSchema.parse(bad)).toThrow();
  });

  it("parses a valid chart point", () => {
    const input = { month: "2024-01", income: 5000, expenses: 3000 };
    const point = ChartPointSchema.parse(input);
    expect(point).toEqual(input);
    expect(JSON.parse(JSON.stringify(point))).toEqual(input);
  });

  it("rejects an invalid chart point", () => {
    const bad = { month: "2024-01", income: "5000", expenses: 3000 } as unknown;
    expect(() => ChartPointSchema.parse(bad)).toThrow();
  });
});
