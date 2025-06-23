const path = require("path");

module.exports = {
    apps: [{
      name: "TMS",
      script: path.join(__dirname, "server.js"),
      watch: true,
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      }
    }]
  }