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
        } else if (data === "hang") {
          // Intentionally do nothing to simulate a long-running task
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
  it.each([0, -1, 1.5])(
    "throws an error when size is %p",
    size => {
      expect(() => new WorkerPool("fake", size)).toThrow(
        "Worker pool size must be a positive integer"
      )
    }
  )

  it("continues processing after a worker crash", async () => {
    const pool = new WorkerPool<number | string, number>("fake", 1)

    const fail = pool.run("crash")
    const success = pool.run(5)

    await expect(fail).rejects.toThrow("boom")
    await expect(success).resolves.toBe(10)

    await pool.destroy()
  })

  it("does not reject when a worker exits normally", async () => {
    const pool = new WorkerPool<number | string, number>("fake", 1)

    const promise = pool.run("exit")
    const timeout = new Promise(resolve => setTimeout(resolve, 10))

    await expect(Promise.race([promise, timeout])).resolves.toBeUndefined()

    await pool.destroy()
  })

  it("ignores exit for a worker missing from the pool", async () => {
    const pool = new WorkerPool<number, number>("fake", 2)

    const state = pool as unknown as {
      workers: Array<EventEmitter>
      idle: Array<EventEmitter>
      destroyed: boolean
    }

    const [orphan, remaining] = state.workers

    // Simulate the worker already being removed
    state.workers.shift()
    state.idle.shift()

    // Prevent spawn on exit
    state.destroyed = true

    orphan.emit("exit", 0)

    expect(state.workers).toHaveLength(1)
    expect(state.workers[0]).toBe(remaining)
    expect(state.idle).toHaveLength(1)
    expect(state.idle[0]).toBe(remaining)

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
    const pool = new WorkerPool<number | string, number>("fake", 1)

    // Occupy the single worker so subsequent tasks remain queued
    pool.run("hang").catch(() => {})
    const first = pool.run(1)
    const second = pool.run(2)

    const destroyPromise = pool.destroy()

    await expect(first).rejects.toThrow("Worker pool destroyed")
    await expect(second).rejects.toThrow("Worker pool destroyed")

    await destroyPromise
  })

  it("rejects active tasks when destroyed", async () => {
    const pool = new WorkerPool<number | string, number>("fake", 1)

    const active = pool.run("hang")

    const destroyPromise = pool.destroy()

    await expect(active).rejects.toThrow("Worker pool destroyed")

    await destroyPromise
  })
})
