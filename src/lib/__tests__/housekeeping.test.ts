/** @jest-environment node */
import { runHousekeeping } from "@/lib/housekeeping";
import { getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(),
  cert: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock("firebase-admin/auth", () => ({
  getAuth: jest.fn(),
}));

describe("runHousekeeping", () => {
  it("executes in a Node environment", async () => {
    expect(typeof window).toBe("undefined");
    await expect(runHousekeeping()).resolves.not.toThrow();
    expect(getApps).toHaveBeenCalled();
    expect(getAuth).toHaveBeenCalled();
  });
});
