/**
 * @vitest-environment node
 */
import { z } from "zod";
import { DATA_URI_REGEX } from "@/lib/data-uri";

describe("DATA_URI_REGEX", () => {
  const schema = z.string().regex(DATA_URI_REGEX);

  it("accepts valid data URIs", () => {
    const valid = "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==";
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid data URIs", () => {
    const missingMeta = "data:text/plain,SGVsbG8sIFdvcmxkIQ==";
    const badBase64 = "data:text/plain;base64,@@@";
    expect(schema.safeParse(missingMeta).success).toBe(false);
    expect(schema.safeParse(badBase64).success).toBe(false);
  });
});
