const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  _id: { type: String },
  addBot: {
    haveSoli: { type: Boolean, default: false },
    idBot: { type: String, default: "null" },
    haveBot: { type: Boolean, default: false },
    acceptBy: { type: String, default: "null" },
    votes: { type: Number, default: 0 },
    acceptIn: {type: Number, default: 0}
  },
});

const User = mongoose.model("Users", userSchema);
module.exports = User;
