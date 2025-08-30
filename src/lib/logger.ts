export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(message, ...args);
  },
};
