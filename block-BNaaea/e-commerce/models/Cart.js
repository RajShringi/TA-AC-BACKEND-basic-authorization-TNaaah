const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  products: [{ type: Schema.Types.ObjectId, required: true, ref: "Product" }],
});

module.exports = mongoose.model("Cart", cartSchema);
