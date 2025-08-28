/**
 * @jest-environment node
 */

// Set required Firebase env vars before modules load
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "test";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test";

// Simple in-memory store to mimic Firestore document
const store = { lastInvocation: 0 };
let txChain = Promise.resolve();

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock("firebase/firestore", () => {
  const runTransaction = jest.fn((_db: unknown, updateFn: any) => {
    txChain = txChain.then(async () => {
      const tx = {
        async get() {
          return {
            exists: () => store.lastInvocation !== undefined,
            data: () => ({ lastInvocation: store.lastInvocation }),
          };
        },
        set(_ref: unknown, data: { lastInvocation: number }) {
          store.lastInvocation = data.lastInvocation;
        },
      };
      return updateFn(tx);
    });
    return txChain;
  });

  const setDoc = jest.fn(async (_ref: unknown, data: { lastInvocation: number }) => {
    store.lastInvocation = data.lastInvocation;
  });

  const doc = (_db: unknown, name: string, id: string) => ({ path: `${name}/${id}` });

  return {
    getFirestore: jest.fn(() => ({})),
    runTransaction,
    setDoc,
    doc,
    __store: store,
  };
});

jest.mock("@/lib/housekeeping", () => ({
  runHousekeeping: jest.fn().mockResolvedValue(undefined),
}));

const { GET, resetRateLimit } = require("@/app/api/cron/housekeeping/route");
const { runHousekeeping } = require("@/lib/housekeeping");

describe("/api/cron/housekeeping", () => {
  const secret = "test-secret";
  const firestore = require("firebase/firestore");

  beforeEach(async () => {
    process.env.CRON_SECRET = secret;
    firestore.__store.lastInvocation = 0;
    (runHousekeeping as jest.Mock).mockClear();
    await resetRateLimit();
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
    const req = () =>
      new Request("http://localhost", {
        headers: { "x-cron-secret": secret },
      });
    const res1 = await GET(req());
    expect(res1.status).toBe(200);
    expect(runHousekeeping).toHaveBeenCalledTimes(1);

    const res2 = await GET(req());
    expect(res2.status).toBe(429);
    expect(runHousekeeping).toHaveBeenCalledTimes(1);
  });

  it("allows only one concurrent invocation", async () => {
    const req = () =>
      new Request("http://localhost", {
        headers: { "x-cron-secret": secret },
      });

    const [res1, res2] = await Promise.all([GET(req()), GET(req())]);
    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 429]);
    expect(runHousekeeping).toHaveBeenCalledTimes(1);
  });
});

