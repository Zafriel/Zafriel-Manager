const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  _id: { type: String },
  ticket: {
    have: { type: Boolean, default: false },
    channel: { type: String, default: "null" },
    created: { type: String, default: "null" },
  },
});

const User = mongoose.model("Users", userSchema);
module.exports = User;
