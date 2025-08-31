import {
  fetchInternetTime,
  getCurrentTime,
  __resetInternetTimeOffset,
} from "@/lib/internet-time";
import { vi, type Mock } from "vitest";

describe("internet time", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __resetInternetTimeOffset();
    (globalThis as { fetch: Mock }).fetch = vi.fn();
    delete process.env.DEFAULT_TZ;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("calculates offset and adjusts current time", async () => {
    const deviceNow = new Date("2024-01-01T00:00:00Z").getTime();
    vi.setSystemTime(deviceNow);
    const networkTime = new Date(deviceNow + 5000).toISOString();
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ datetime: networkTime }),
    });

    const fetched = await fetchInternetTime("Etc/UTC");
    expect(fetched.toISOString()).toBe(networkTime);

    vi.setSystemTime(deviceNow + 1000);
    const current = await getCurrentTime("Etc/UTC");
    expect(current.getTime()).toBe(deviceNow + 1000 + 5000);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("falls back to device time when fetch fails", async () => {
    const deviceNow = 123456;
    vi.setSystemTime(deviceNow);
    (fetch as Mock).mockRejectedValue(new Error("fail"));

    const current = await getCurrentTime("Etc/UTC");
    expect(current.getTime()).toBe(deviceNow);
    expect(fetch).toHaveBeenCalled();
  });

  it("uses environment timezone by default", async () => {
    process.env.DEFAULT_TZ = "Etc/UTC";
    const deviceNow = 0;
    vi.setSystemTime(deviceNow);
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ datetime: new Date(deviceNow).toISOString() }),
    });

    await getCurrentTime();
    expect((fetch as Mock).mock.calls[0][0]).toContain("/Etc/UTC");
  });

  it("allows overriding timezone", async () => {
    const deviceNow = 0;
    vi.setSystemTime(deviceNow);
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ datetime: new Date(deviceNow).toISOString() }),
    });

    await getCurrentTime("Asia/Tokyo");
    expect((fetch as Mock).mock.calls[0][0]).toContain("/Asia/Tokyo");
  });

  it("times out after 5s", async () => {
    (fetch as Mock).mockImplementation(
      (_url: string, opts: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          opts.signal.addEventListener("abort", () => {
            const err = new Error("aborted");
            (err as Error).name = "AbortError";
            reject(err);
          });
        })
    );

    const promise = fetchInternetTime("Etc/UTC");
    vi.advanceTimersByTime(5000);
    await expect(promise).rejects.toThrow("timed out");
  });

  it("throws detailed error for non-200 responses", async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Error",
      text: async () => "bad",
    });
    await expect(fetchInternetTime("Etc/UTC")).rejects.toThrow(
      "500 Internal Error bad"
    );
  });
});
