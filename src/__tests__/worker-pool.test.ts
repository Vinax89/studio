/**
 * @jest-environment node
 */

jest.mock("node:worker_threads", () => {
  const { EventEmitter } = require("events")
  return {
    Worker: class MockWorker extends EventEmitter {
      postMessage(data: unknown) {
        if (data === "crash") {
          this.emit("error", new Error("boom"))
        } else if (data === "exit") {
          this.emit("exit", 0)
        } else {
          this.emit("message", (data as number) * 2)
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

  it("does not reject when a worker exits normally", async () => {
    const pool = new WorkerPool<number | string, number>("fake", 1)

    const promise = pool.run("exit" as any)
    const timeout = new Promise(resolve => setTimeout(resolve, 10))

    await expect(Promise.race([promise, timeout])).resolves.toBeUndefined()

    await pool.destroy()
  })
})
