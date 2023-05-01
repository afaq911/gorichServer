const mongoose = require("mongoose");

const BidSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true },
    productId: { type: mongoose.Types.ObjectId, required: true },
    profit: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    expiresIn: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bids", BidSchema);
