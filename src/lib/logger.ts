export const logger = {
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },
  info: (...args: unknown[]): void => {
    console.info(...args);
  },
};

export default logger;
