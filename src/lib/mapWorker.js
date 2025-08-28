const { parentPort } = require("node:worker_threads")

function square(numbers) {
  return numbers.map(n => n * n)
}

parentPort?.on("message", numbers => {
  parentPort?.postMessage(square(numbers))
})
