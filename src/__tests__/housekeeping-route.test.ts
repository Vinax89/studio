/**
 * @vitest-environment node
 */
import { runHousekeeping } from "@/lib/housekeeping";
import { getCurrentTime } from "@/lib/internet-time";
import type { Mock } from 'vitest'

vi.mock("@/lib/housekeeping", () => ({
  runHousekeeping: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/internet-time", () => ({
  getCurrentTime: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: {}, initFirebase: vi.fn() }));
import { initFirebase } from "@/lib/firebase";

const secret = "test-secret";
let GET: typeof import("@/app/api/cron/housekeeping/route").GET;
let resetRateLimit: typeof import("@/app/api/cron/housekeeping/route").resetRateLimit;

beforeAll(async () => {
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test";
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test";
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test";
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test";
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "test";
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test";
  process.env.CRON_SECRET = secret;
  initFirebase();
  const mod = await import("@/app/api/cron/housekeeping/route");
  GET = mod.GET;
  resetRateLimit = mod.resetRateLimit;
});

vi.mock("firebase/firestore", () => {
  const store: { lastRun?: number } = {};
  interface Tx {
    get: () => Promise<{
      exists: () => boolean;
      data: () => { lastRun: number | undefined };
    }>;
    set: (ref: unknown, data: { lastRun: number }) => void;
  }
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    doc: (_db: unknown, _col: string, _id: string) => ({}),
    runTransaction: vi.fn(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (_db: unknown, updateFn: (tx: Tx) => Promise<unknown>) => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          let write: { lastRun: number } | undefined;
          const lastBefore = store.lastRun;
          const tx: Tx = {
            get: async () => ({
              exists: () => store.lastRun !== undefined,
              data: () => ({ lastRun: store.lastRun }),
            }),
            set: (_ref, data) => {
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
    setDoc: vi.fn(async (_ref: unknown, data: { lastRun: number }) => {
      store.lastRun = data.lastRun;
    }),
    __store: store,
  };
});

describe("/api/cron/housekeeping", () => {
  beforeEach(async () => {
    process.env.CRON_SECRET = secret;
    await resetRateLimit();
    (runHousekeeping as Mock).mockClear();
    (getCurrentTime as Mock).mockResolvedValue(new Date(61_000));
  });

  it("returns 401 when secret is missing or invalid", async () => {
    const req1 = new Request("http://localhost");
    const res1 = await GET(req1);
    expect(res1.status).toBe(401);

    const req2 = new Request("http://localhost", {
      headers: { "X-CRON-SECRET": "wrong" },
    });
    const res2 = await GET(req2);
    expect(res2.status).toBe(401);
    expect(runHousekeeping).not.toHaveBeenCalled();
  });

  it("runs housekeeping with valid secret and enforces rate limit", async () => {
    const req = new Request("http://localhost", {
      headers: { "X-CRON-SECRET": secret },
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
      headers: { "X-CRON-SECRET": secret },
    });

    const [res1, res2] = await Promise.all([GET(req), GET(req)]);
    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 429]);
    expect(runHousekeeping).toHaveBeenCalledTimes(1);
  });
});
