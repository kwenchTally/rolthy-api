const cluster = require("cluster");
const os = require("os");

const numCPUs = os.cpus().length;
const runCluster = (start) => {
  if (cluster.isPrimary) {
    console.log(`numCPUs... ${numCPUs} Core`);
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
      console.log(`${worker.process.pid} worker process died...`);
    });
  } else {
    start();
  }
};

module.exports = {
  runCluster,
};
