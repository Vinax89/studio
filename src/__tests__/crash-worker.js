const { parentPort } = require("node:worker_threads");
const fs = require("node:fs");
const path = require("node:path");

const flag = path.join(__dirname, "crash-flag");

parentPort.on("message", numbers => {
  if (fs.existsSync(flag)) {
    fs.unlinkSync(flag);
    process.exit(1);
  }
  parentPort.postMessage(numbers.map(n => n * n));
});
