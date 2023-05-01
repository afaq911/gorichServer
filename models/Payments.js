const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    accountno: { type: String, required: true },
    reciever: { type: String },
    userId: { type: mongoose.Types.ObjectId, required: true },
    amount: { type: String, required: true },
    screenshot: { type: String, default: true },
    status: { type: Number, default: 1 },
    type: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payments", PaymentSchema);
