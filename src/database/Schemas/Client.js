const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let clientSchema = new Schema({
  _id: { type: String, required: true },
  bots: { type: Array },
  channel_log: { type: String, default: "null" },
});

let Client = mongoose.model("Clients", clientSchema);
module.exports = Client;
