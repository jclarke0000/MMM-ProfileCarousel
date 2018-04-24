const NodeHelper = require("node_helper");
const lirc = require("lirc-client")({
  // host: "127.0.0.1",
  // port: 8765
  path: "/var/run/lirc/lircd"
});

module.exports = NodeHelper.create({

  start: function() {
    console.log("Starting node_helper for module [" + this.name + "]");

    console.log("[" + this.name + "] Connecting to LIRC Daemon...");
    lirc.on("connect", () => {
      console.log("[" + this.name + "] Connected to LIRC Daemon");
    });

    lirc.on("receive", function (remote, button, repeat) {
      console.log("button " + button + " on remote " + remote + " was pressed!");
    });


  },




});