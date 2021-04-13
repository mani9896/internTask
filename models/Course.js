const mongoose = require("mongoose");
const { model } = require("./User");
const courseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  heading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
    required: true,
  },
  publish: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    default: 0,
  },
  noSubscribers: {
    type: Number,
    default: 0,
  },
  modules: [
    { module: { type: mongoose.Schema.Types.ObjectId, ref: "module" } },
  ],
});
module.exports = course = mongoose.model("course", courseSchema, "course");
