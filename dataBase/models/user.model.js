import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "user name required"],
      minLength: [2, "too short user name"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "email required"],
      minLength: 1,
      unique: [true, "email must be required"],
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "minimum length 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    code: {
      type: Number,
      default: null,
    },
    wishlist: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "product",
      },
    ],
    passwordChangedAt: Date,
    loggedOutAt: Date,
  },
  { timestamps: true }
);
userSchema.pre("save", function () {
  this.password = bcrypt.hashSync(this.password, 7);
});
userSchema.pre("findOneAndUpdate", function () {
  if (this._update.password)
    this._update.password = bcrypt.hashSync(this._update.password, 7);
});

export const userModel = mongoose.model("user", userSchema);
