const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  dob: { type: String, default: "" },
  phone: { type: String, default: "" },
  image: { type: String, default: "" },
  isAdmin: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

module.exports = mongoose.model("User2", UserSchema);
