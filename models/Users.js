const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    profilePic: { type: String },
    fullname: { type: String, required: true },
    accountno: { type: String },
    mobileno: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String, required: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UserSchema);
