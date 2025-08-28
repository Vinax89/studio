import { Worker } from "node:worker_threads"

interface Task<T, R> {
  data: T
  resolve: (value: R) => void
  reject: (reason: unknown) => void
}

export class WorkerPool<T = unknown, R = unknown> {
  private readonly workers: Worker[] = []
  private readonly idle: Worker[] = []
  private queue: Task<T, R>[] = []

  constructor(private readonly file: string, size: number) {
    for (let i = 0; i < size; i++) {
      const worker = new Worker(file)
      this.workers.push(worker)
      this.idle.push(worker)
    }
  }

  run(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject })
      this.process()
    })
  }

  private process() {
    while (this.queue.length > 0 && this.idle.length > 0) {
      const worker = this.idle.shift()!
      const task = this.queue.shift()!

      let settled = false

      const handleExit = (code: number) => {
        this.workers.splice(this.workers.indexOf(worker), 1)
        const idleIndex = this.idle.indexOf(worker)
        if (idleIndex !== -1) this.idle.splice(idleIndex, 1)

        if (code !== 0) {
          const replacement = new Worker(this.file)
          this.workers.push(replacement)
          this.idle.push(replacement)
        }

        this.process()

        if (!settled && code !== 0) {
          task.reject(new Error(`Worker stopped with exit code ${code}`))
        }
      }

      const finalize = () => {
        worker.off("exit", handleExit)
        this.idle.push(worker)
        this.process()
      }

      worker.once("message", (result: R) => {
        settled = true
        task.resolve(result)
        finalize()
      })

      worker.once("error", err => {
        settled = true
        task.reject(err)
        finalize()
      })

      worker.on("exit", handleExit)

      worker.postMessage(task.data)
    }
  }

  async destroy(): Promise<void> {
    await Promise.all(this.workers.map(worker => worker.terminate()))
    this.queue = []
    this.idle.length = 0
  }
}

