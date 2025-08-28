jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status ?? 200,
      json: async () => data,
    })),
  },
}));

jest.mock("@/lib/housekeeping", () => ({
  runHousekeeping: jest.fn(),
}));

import { GET } from "@/app/api/cron/housekeeping/route";
import { runHousekeeping } from "@/lib/housekeeping";

describe("housekeeping route", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns ok when housekeeping succeeds", async () => {
    (runHousekeeping as jest.Mock).mockResolvedValue(undefined);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("returns error status when housekeeping fails", async () => {
    (runHousekeeping as jest.Mock).mockRejectedValue(new Error("boom"));
    const res = await GET();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "boom" });
  });
});
