const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let clientSchema = new Schema({
  _id: { type: String },
  manutenção: { type: Boolean, default: false },
  reason: { type: String },
  blacklist: { type: Array, default: [] },
  staff: {
    type: Array,
    default: [],
  },
  botCount: { type: Number, default: 0 },
});

let Client = mongoose.model("Client", clientSchema);
module.exports = Client;
