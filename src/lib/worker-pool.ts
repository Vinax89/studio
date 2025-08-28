import { Worker } from "node:worker_threads";

interface Task<T, R> {
  data: T;
  resolve: (value: R) => void;
  reject: (reason: unknown) => void;
}

export class WorkerPool<T = unknown, R = unknown> {
  private readonly file: string;
  private readonly size: number;
  private queue: Task<T, R>[] = [];
  private active = 0;

  constructor(file: string, size: number) {
    this.file = file;
    this.size = size;
  }

  run(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.process();
    });
  }

  private process() {
    while (this.active < this.size && this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.active++;
      const worker = new Worker(this.file, { workerData: task.data });

      const finalize = () => {
        worker.terminate().finally(() => {
          this.active--;
          this.process();
        });
      };

      worker.once("message", (result: R) => {
        task.resolve(result);
        finalize();
      });

      worker.once("error", err => {
        task.reject(err);
        finalize();
      });

      worker.once("exit", code => {
        if (code !== 0) {
          task.reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    }
  }
}

