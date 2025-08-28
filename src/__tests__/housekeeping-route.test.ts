/**
 * @jest-environment node
 */
import { GET, resetRateLimit } from "@/app/api/cron/housekeeping/route";
import { runHousekeeping } from "@/lib/housekeeping";

jest.mock("@/lib/housekeeping", () => ({
  runHousekeeping: jest.fn().mockResolvedValue(undefined),
}));

describe("/api/cron/housekeeping", () => {
  const secret = "test-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = secret;
    resetRateLimit();
    (runHousekeeping as jest.Mock).mockClear();
  });

  it("returns 401 when secret is missing or invalid", async () => {
    const req1 = new Request("http://localhost");
    const res1 = await GET(req1);
    expect(res1.status).toBe(401);

    const req2 = new Request("http://localhost", {
      headers: { "x-cron-secret": "wrong" },
    });
    const res2 = await GET(req2);
    expect(res2.status).toBe(401);
    expect(runHousekeeping).not.toHaveBeenCalled();
  });

  it("runs housekeeping with valid secret and enforces rate limit", async () => {
    const req = new Request("http://localhost", {
      headers: { "x-cron-secret": secret },
    });
    const res1 = await GET(req);
    expect(res1.status).toBe(200);
    expect(runHousekeeping).toHaveBeenCalledTimes(1);

    const res2 = await GET(req);
    expect(res2.status).toBe(429);
    expect(runHousekeeping).toHaveBeenCalledTimes(1);
  });
});
