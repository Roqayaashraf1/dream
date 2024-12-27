import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "user name required"]
  },
  email: {
    type: String,
    trim: true,
    required: [true, "email required"],
    unique: [true, "email must be required"],
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  passwordChangedAt: Date
}, {
  timestamps: true
});
userSchema.pre("save", function () {
  this.password = bcrypt.hashSync(this.password, 7);
});
userSchema.pre("findOneAndUpdate", function () {
  if (this._update.password)
    this._update.password = bcrypt.hashSync(this._update.password, 7);
});

export const userModel = mongoose.model("user", userSchema);