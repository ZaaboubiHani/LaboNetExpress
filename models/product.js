const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseAutopopulate = require("mongoose-autopopulate");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      autopopulate: true,
    },
  },
  { timestamps: true, versionKey: false }
);
productSchema.plugin(mongoosePaginate);
productSchema.plugin(mongooseAutopopulate);
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
