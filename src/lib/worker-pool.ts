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

      let finalized = false
      const finalize = (w: Worker) => {
        if (finalized) return
        finalized = true
        worker.off("exit", onExit)
        this.idle.push(w)
        this.process()
      }

      const onExit = (code: number) => {
        let w: Worker = worker
        if (code !== 0) {
          console.warn(`Worker exited with code ${code}. Restarting.`)
          const index = this.workers.indexOf(worker)
          w = new Worker(this.file)
          this.workers[index] = w
        }
        finalize(w)
      }

      worker.once("message", (result: R) => {
        task.resolve(result)
        finalize(worker)
      })

      worker.once("error", err => {
        task.reject(err)
        finalize(worker)
      })

      worker.once("exit", onExit)

      worker.postMessage(task.data)
    }
  }

  async destroy(): Promise<void> {
    await Promise.all(this.workers.map(worker => worker.terminate()))
    this.queue = []
    this.idle.length = 0
  }
}

