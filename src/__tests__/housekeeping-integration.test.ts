/**
 * @jest-environment node
 */
import { GET, resetRateLimit } from "@/app/api/cron/housekeeping/route";
import { initFirebase } from "@/lib/firebase";
import { logger } from "@/lib/logger";

jest.mock("@/lib/firebase", () => ({ db: {}, initFirebase: jest.fn() }));

const listAll = jest.fn();
const getMetadata = jest.fn();
const deleteObject = jest.fn();

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
  ref: jest.fn((_storage) => ({ fullPath: "" })),
  listAll: (...args: unknown[]) => listAll(...args),
  getMetadata: (...args: unknown[]) => getMetadata(...args),
  deleteObject: (...args: unknown[]) => deleteObject(...args),
}));

jest.mock("firebase/auth", () => ({ getAuth: jest.fn() }));

jest.mock("firebase/firestore", () => {
  const store: { lastRun?: number } = {};
  interface Tx {
    get: () => Promise<{
      exists: () => boolean;
      data: () => { lastRun: number | undefined };
    }>;
    set: (ref: unknown, data: { lastRun: number }) => void;
  }
  return {
    doc: () => ({}),
    runTransaction: jest.fn(
      async (_db: unknown, updateFn: (tx: Tx) => Promise<unknown>) => {
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

jest.mock("@/lib/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

const secret = "test-secret";
const now = new Date("2024-02-02T00:00:00Z").getTime();
let dateSpy: jest.SpyInstance<number, []>;

describe("housekeeping integration", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test";
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test";
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test";
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "test";
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test";
    initFirebase();
  });

  beforeEach(async () => {
    process.env.CRON_SECRET = secret;
    process.env.NEXT_PUBLIC_ENABLE_HOUSEKEEPING_LOG = "true";
    process.env.RETENTION_DAYS = "1";
    dateSpy = jest.spyOn(Date, "now").mockReturnValue(now);
    listAll.mockResolvedValue({
      items: [{ fullPath: "old.txt" }, { fullPath: "new.txt" }],
    });
    getMetadata.mockImplementation(async (item: { fullPath: string }) => {
      if (item.fullPath === "old.txt") {
        return { timeCreated: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString() };
      }
      return { timeCreated: new Date(now - 12 * 60 * 60 * 1000).toISOString() };
    });
    deleteObject.mockClear();
    (logger.info as jest.Mock).mockClear();
    await resetRateLimit();
  });

  afterEach(() => {
    dateSpy.mockRestore();
  });

  it("deletes expired files and logs actions", async () => {
    const res = await GET(
      new Request("http://localhost", { headers: { "x-cron-secret": secret } })
    );
    expect(res.status).toBe(200);
    expect(deleteObject).toHaveBeenCalledTimes(1);
    expect((deleteObject.mock.calls[0][0] as { fullPath: string }).fullPath).toBe(
      "old.txt"
    );
    expect(logger.info).toHaveBeenCalledWith("Deleted expired file: old.txt");
    expect(logger.info).toHaveBeenCalledWith(
      "Housekeeping job executed: Firebase auth initialized; 1 file(s) deleted"
    );
  });
});
