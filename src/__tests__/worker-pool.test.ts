/**
 * @jest-environment node
 */

jest.mock("node:worker_threads", () => {
  const { EventEmitter } = require("events")
  return {
    Worker: class MockWorker extends EventEmitter {
      postMessage(data: any) {
        if (data === "crash") {
          this.emit("error", new Error("boom"))
        } else if (data && typeof data === "object" && data.exitOnce && !data.exited) {
          data.exited = true
          this.emit("exit", 1)
        } else {
          const value = typeof data === "number" ? data : data.n
          this.emit("message", value * 2)
        }
      }
      terminate() {
        return Promise.resolve()
      }
    },
  }
})

import { WorkerPool } from "../lib/worker-pool"

describe("WorkerPool", () => {
  it("continues processing after a worker crash", async () => {
    const pool = new WorkerPool<number | string, number>("fake", 1)

    const fail = pool.run("crash" as any)
    const success = pool.run(5)

    await expect(fail).rejects.toThrow("boom")
    await expect(success).resolves.toBe(10)

    await pool.destroy()
  })

  it("recovers when a worker exits unexpectedly", async () => {
    const pool = new WorkerPool<any, number>("fake", 1)

    const first = pool.run({ n: 2, exitOnce: true })
    const second = pool.run(3)

    await expect(first).resolves.toBe(4)
    await expect(second).resolves.toBe(6)

    await pool.destroy()
  })
})
