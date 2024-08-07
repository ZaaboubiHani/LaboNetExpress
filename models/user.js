const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseAutopopulate = require("mongoose-autopopulate");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    phoneNumber1: {
      type: String,
      required: true,
    },
    phoneNumber2: {
      type: String,
      required: false,
      default: null,
    },
    wilaya: {
      type: String,
      required: true,
    },
    commune: {
      type: String,
      required: true,
    },
    isValidated: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    deviceToken: {
      type: String,
      required: false,
      default: null,
    },
    coordinates: {
      type: String,
      required: false,
      default: null,
    },
    type: {
      type: String,
      enum: ["laboratory", "supplier"],
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: false,
      default: null,
      autopopulate: true,
    },
  },
  { timestamps: true, versionKey: false }
);
userSchema.plugin(mongoosePaginate);
userSchema.plugin(mongooseAutopopulate);
const User = mongoose.model("User", userSchema);

module.exports = User;
