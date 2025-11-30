import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
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
  role: {
    type: String,
    default: "user" // by default the role will be user
  },
  mainrole: {
    type: String,
    default: "user"
  },
  subscription: [{ // it will be list of subscriptions
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
],
  resetPasswordExpire: Date,
}, {
  timestamps: true,
})

export const User = mongoose.model("User", schema)