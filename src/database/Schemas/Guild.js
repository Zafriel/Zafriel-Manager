const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let guildSchema = new Schema({
  _id: { type: String, required: true },
  prefix: { type: String, default: "z!" },
  addBot: {
    lastUser: { type: String, default: "null" },
    time: { type: Number, default: 0 },
  },
  staff: {
    type: Array,
    default: [],
  },
  cmd: {
    type: Array,
    default: [
      {
        name: "null",
        author: "null",
        date: "null",
        key: "null",
        url: "null",
        verifiy: false,
      },
    ],
  },
  ticket: {
    size: { type: Number, default: 1 },
    msg: { type: String, default: "null" },
    channel: { type: String, default: "null" },
    guild: { type: String, default: "null" },
  },
});

let Guild = mongoose.model("Guilds", guildSchema);
module.exports = Guild;
