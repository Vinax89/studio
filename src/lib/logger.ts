export const logger = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(...args)
    }
  },
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.info(...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(...args)
    }
  },
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(...args)
    }
  }
}
