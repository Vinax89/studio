/**
 * @jest-environment node
 */
import { GET, resetRateLimit } from "@/app/api/cron/housekeeping/route";
import { runHousekeeping } from "@/lib/housekeeping";
import { getCurrentTime } from "@/lib/internet-time";

jest.mock("@/lib/housekeeping", () => ({
  runHousekeeping: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/internet-time", () => ({
  getCurrentTime: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({ db: {} }));

jest.mock("firebase/firestore", () => {
  const store: { lastRun?: number } = {};
  return {
    doc: () => ({}),
    runTransaction: jest.fn(
      async (
        _db: unknown,
        updateFn: (
          tx: {
            get: () => Promise<{
              exists: () => boolean;
              data: () => { lastRun: number | undefined };
            }>;
            set: (_ref: unknown, data: { lastRun: number }) => void;
          }
        ) => Promise<unknown>
      ) => {
        for (;;) {
          let write: { lastRun: number } | undefined;
          const lastBefore = store.lastRun;
          const tx = {
            get: async () => ({
              exists: () => store.lastRun !== undefined,
              data: () => ({ lastRun: store.lastRun }),
            }),
            set: (_ref: unknown, data: { lastRun: number }) => {
              write = data;
            },
          };
          const result = await updateFn(tx);
          if (write && lastBefore !== store.lastRun) {
            // retry due to concurrent modification
            continue;
          }
          if (write) {
            store.lastRun = write.lastRun;
          }
          return result;
        }
      }
    ),
    setDoc: jest.fn(async (_ref: unknown, data: { lastRun: number }) => {
      store.lastRun = data.lastRun;
    }),
    __store: store,
  };
});

describe("/api/cron/housekeeping", () => {
  const secret = "test-secret";

  beforeEach(async () => {
    process.env.CRON_SECRET = secret;
    await resetRateLimit();
    (runHousekeeping as jest.Mock).mockClear();
    (getCurrentTime as jest.Mock).mockResolvedValue(new Date(61_000));
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

  it("prevents concurrent invocations", async () => {
    const req = new Request("http://localhost", {
      headers: { "x-cron-secret": secret },
    });

    const [res1, res2] = await Promise.all([GET(req), GET(req)]);
    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 429]);
    expect(runHousekeeping).toHaveBeenCalledTimes(1);
  });
});
