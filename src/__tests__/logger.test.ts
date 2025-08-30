describe("logger", () => {
  const originalEnv = process.env;
  let infoSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    infoSpy.mockRestore();
    errorSpy.mockRestore();
    process.env = originalEnv;
  });

  it("logs only errors by default in production", async () => {
    process.env.NODE_ENV = "production";
    const { logger } = await import("../lib/logger");
    logger.info("test");
    logger.error("error");
    expect(infoSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("logs info when LOG_LEVEL=info", async () => {
    process.env.NODE_ENV = "production";
    process.env.LOG_LEVEL = "info";
    const { logger } = await import("../lib/logger");
    logger.info("info");
    logger.error("error");
    expect(infoSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("logs nothing when LOG_LEVEL=silent", async () => {
    process.env.NODE_ENV = "production";
    process.env.LOG_LEVEL = "silent";
    const { logger } = await import("../lib/logger");
    logger.info("info");
    logger.error("error");
    expect(infoSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

