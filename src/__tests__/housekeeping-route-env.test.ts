/**
 * @jest-environment node
 */

describe("housekeeping route environment", () => {
  it("throws if CRON_SECRET is not set", async () => {
    const original = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    jest.resetModules();

    await expect(
      import("@/app/api/cron/housekeeping/route")
    ).rejects.toThrow("CRON_SECRET environment variable is not set");

    if (original === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = original;
    }
    jest.resetModules();
  });
});
