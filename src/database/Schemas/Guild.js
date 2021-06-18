const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let guildSchema = new Schema({
  _id: { type: String },
  prefix: { type: String, default: "!" },
});

let Guild = mongoose.model("Guilds", guildSchema);
module.exports = Guild;
