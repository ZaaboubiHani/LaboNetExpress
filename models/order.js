const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseAutopopulate = require("mongoose-autopopulate");

const orderSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["sent", "accepted","rejected","canceled"],
      required: true,
      default: "sent",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      autopopulate: true,
    },
  },
  { timestamps: true, versionKey: false }
);
orderSchema.plugin(mongoosePaginate);
orderSchema.plugin(mongooseAutopopulate);
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
