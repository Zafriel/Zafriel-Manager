const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  _id: { type: String },
  ticket: {
    have: { type: Boolean, default: false },
    channel: { type: String, default: "null" },
    created: { type: String, default: "null" },
  },
  bots: [
    {
      idBot: { type: String, default: "null" },
      acceptBy: { type: String, default: "null" },
      acceptIn: { type: Number, default: 0 },
      author: { type: String, default: "null" },
      status: { type: Boolean, default: false },
      votes: { type: Number, default: 0 },
      verified: { type: Boolean, default: false },
    },
  ],
  hasBot: { type: Number, default: 0 },
  lastVote: { type: Number, default: 0 },
});

const User = mongoose.model("Users", userSchema);
module.exports = User;
