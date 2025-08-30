const LOG_LEVEL =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === "production" ? "error" : "info");

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (LOG_LEVEL === "info") {
      console.info(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (LOG_LEVEL === "info" || LOG_LEVEL === "error") {
      console.error(message, ...args);
    }
  },
};
