const levels = { error: 0, warn: 1, info: 2 } as const;
type Level = keyof typeof levels;

const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase();
const currentLevel = levels[envLevel as Level] ?? levels.info;

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (currentLevel >= levels.info) {
      console.info(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (currentLevel >= levels.warn) {
      console.warn(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (currentLevel >= levels.error) {
      console.error(message, ...args);
    }
  },
};
