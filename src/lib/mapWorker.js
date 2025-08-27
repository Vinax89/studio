const { parentPort, workerData } = require("node:worker_threads")

function square(numbers) {
  return numbers.map(n => n * n)
}

parentPort.postMessage(square(workerData))
