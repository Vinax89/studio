import {
  fetchInternetTime,
  getCurrentTime,
  __resetInternetTimeOffset,
} from "@/lib/internet-time";

describe("internet time", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    __resetInternetTimeOffset();
    (global as any).fetch = jest.fn();
    delete process.env.DEFAULT_TZ;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("calculates offset and adjusts current time", async () => {
    const deviceNow = new Date("2024-01-01T00:00:00Z").getTime();
    jest.setSystemTime(deviceNow);
    const networkTime = new Date(deviceNow + 5000).toISOString();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ datetime: networkTime }),
    });

    const fetched = await fetchInternetTime("Etc/UTC");
    expect(fetched.toISOString()).toBe(networkTime);

    jest.setSystemTime(deviceNow + 1000);
    const current = await getCurrentTime("Etc/UTC");
    expect(current.getTime()).toBe(deviceNow + 1000 + 5000);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("falls back to device time when fetch fails", async () => {
    const deviceNow = 123456;
    jest.setSystemTime(deviceNow);
    (fetch as jest.Mock).mockRejectedValue(new Error("fail"));

    const current = await getCurrentTime("Etc/UTC");
    expect(current.getTime()).toBe(deviceNow);
    expect(fetch).toHaveBeenCalled();
  });

  it("uses environment timezone by default", async () => {
    process.env.DEFAULT_TZ = "Etc/UTC";
    const deviceNow = 0;
    jest.setSystemTime(deviceNow);
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ datetime: new Date(deviceNow).toISOString() }),
    });

    await getCurrentTime();
    expect((fetch as jest.Mock).mock.calls[0][0]).toContain("/Etc/UTC");
  });

  it("allows overriding timezone", async () => {
    const deviceNow = 0;
    jest.setSystemTime(deviceNow);
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ datetime: new Date(deviceNow).toISOString() }),
    });

    await getCurrentTime("Asia/Tokyo");
    expect((fetch as jest.Mock).mock.calls[0][0]).toContain("/Asia/Tokyo");
  });
});
