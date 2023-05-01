const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    profilePic: { type: String },
    username: { type: String, required: true },
    email: { type: String, required: true },
    mobileno: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admins", AdminSchema);
