import { Worker } from "node:worker_threads"

interface Task<T, R> {
  data: T
  resolve: (value: R) => void
  reject: (reason: unknown) => void
}

/**
 * Manages a fixed set of Node.js {@link Worker} threads and schedules tasks
 * across them.
 *
 * Tasks submitted to the pool are enqueued and dispatched to the next available
 * idle worker in the order they were received. Once a worker completes a task
 * it is returned to the idle pool for reuse, and any worker that exits
 * unexpectedly is replaced to maintain pool capacity.
 */
export class WorkerPool<T = unknown, R = unknown> {
  private readonly workers: Worker[] = []
  private readonly idle: Worker[] = []
  private readonly tasks = new Map<Worker, Task<T, R>>()
  private queue: Task<T, R>[] = []
  private destroyed = false

  constructor(private readonly file: string, size: number) {
    for (let i = 0; i < size; i++) {
      this.spawn()
    }
  }

  private spawn() {
    const worker = new Worker(this.file)
    worker.once("exit", code => {
      this.workers.splice(this.workers.indexOf(worker), 1)
      const idleIndex = this.idle.indexOf(worker)
      if (idleIndex !== -1) this.idle.splice(idleIndex, 1)

      const task = this.tasks.get(worker)
      this.tasks.delete(worker)

      if (!this.destroyed) {
        this.spawn()
        this.process()
      }

      if (code !== 0 && task) {
        task.reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })

    this.workers.push(worker)
    this.idle.push(worker)
    return worker
  }

  /**
   * Enqueue a unit of work to be processed by the pool.
   *
   * The task is queued until a worker becomes available. The returned promise
   * resolves with the result posted by the worker or rejects if the worker
   * emits an error or terminates with a non-zero exit code.
   */
  run(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject })
      this.process()
    })
  }

  /**
   * Assign queued tasks to idle workers.
   *
   * Workers are recycled by pushing them back onto the idle list once they
   * finish processing. Errors emitted by a worker reject the associated task.
   * If a worker exits unexpectedly, it is removed from the pool and immediately
   * replaced with a new worker to keep the pool at capacity.
   */
  private process() {
    while (this.queue.length > 0 && this.idle.length > 0) {
      const worker = this.idle.shift()!
      const task = this.queue.shift()!

      this.tasks.set(worker, task)

      const finalize = () => {
        this.tasks.delete(worker)
        this.idle.push(worker)
        this.process()
      }

      worker.once("message", (result: R) => {
        task.resolve(result)
        finalize()
      })

      worker.once("error", err => {
        task.reject(err)
        finalize()
      })

      worker.postMessage(task.data)
    }
  }

  /**
   * Shut down all workers and reject pending tasks.
   *
   * Any work still waiting in the queue is rejected with a
   * `Worker pool destroyed` error <em>before</em> the queue is cleared so that
   * callers receive a rejection instead of hanging indefinitely. All workers
   * are terminated and removed from the pool afterwards.
   */
  async destroy(): Promise<void> {
    this.destroyed = true

    for (const [, task] of this.tasks) {
      task.reject(new Error("Worker pool destroyed"))
    }
    this.tasks.clear()

    for (const task of this.queue) {
      task.reject(new Error("Worker pool destroyed"))
    }
    this.queue.length = 0

    await Promise.all(this.workers.map(worker => worker.terminate()))

    this.idle.length = 0
  }
}

