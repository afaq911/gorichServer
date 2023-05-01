const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: String, required: true },
    duration: { type: String, required: true },
    comession: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", ProductSchema);
