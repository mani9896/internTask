const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user_type: {
    type: String,
    enum: ["student", "mentor"],
    default: "student",
    required: true,
  },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "course" }],
});

module.exports = User = mongoose.model("user", UserSchema);
