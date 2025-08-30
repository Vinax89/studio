/**
 * @jest-environment node
 */

import { EventEmitter } from "events"

jest.mock("node:worker_threads", () => {
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
  it("respawns a worker after a crash", async () => {
    const pool = new WorkerPool<number | string, number>("fake", 1)

    const firstWorker = (pool as unknown as { workers: unknown[] }).workers[0]
    const fail = pool.run("crash")
    const success = pool.run(5)

    await expect(fail).rejects.toThrow("boom")
    await expect(success).resolves.toBe(10)
    const secondWorker = (pool as unknown as { workers: unknown[] }).workers[0]
    expect(secondWorker).not.toBe(firstWorker)

    await pool.destroy()
  })

  it("does not reject when a worker exits normally", async () => {
    const pool = new WorkerPool<number | string, number>("fake", 1)

    const promise = pool.run("exit")
    const timeout = new Promise(resolve => setTimeout(resolve, 10))

    await expect(Promise.race([promise, timeout])).resolves.toBeUndefined()

    await pool.destroy()
  })

  it("does not accumulate exit listeners", async () => {
    const pool = new WorkerPool<number, number>("fake", 1)

    for (let i = 0; i < 50; i++) {
      await pool.run(i)
      const worker = (
        pool as unknown as {
          workers: Array<{ listenerCount: (event: string) => number }>
        }
      ).workers[0]
      expect(worker.listenerCount("exit")).toBe(1)
    }

    await pool.destroy()
  })

  it("rejects queued tasks when destroyed", async () => {
    const pool = new WorkerPool<number, number>("fake", 0)

    const first = pool.run(1)
    const second = pool.run(2)

    const destroyPromise = pool.destroy()

    await expect(first).rejects.toThrow("Worker pool destroyed")
    await expect(second).rejects.toThrow("Worker pool destroyed")

    await destroyPromise
  })
})
