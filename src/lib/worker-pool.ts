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

      const finalize = () => {
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

      worker.once("exit", code => {
        if (code !== 0) {
          task.reject(new Error(`Worker stopped with exit code ${code}`))
        }
      })

      worker.postMessage(task.data)
    }
  }

  async destroy(): Promise<void> {
    await Promise.all(this.workers.map(worker => worker.terminate()))
    this.queue = []
    this.idle.length = 0
  }
}

