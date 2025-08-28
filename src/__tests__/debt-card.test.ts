import { shouldDelay } from "../lib/mock-delay";

describe("shouldDelay", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterAll(() => {
    process.env = env;
  });

  it("bypasses delay in production", () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_ENABLE_MOCK_DELAY = "true";
    expect(shouldDelay()).toBe(false);
  });

  it("allows delay in development when flag set", () => {
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_ENABLE_MOCK_DELAY = "true";
    expect(shouldDelay()).toBe(true);
  });
});
