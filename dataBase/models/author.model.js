import mongoose from "mongoose";
const authorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "name is required"],
      trim: true,
      required: true,
      minLength: [2, "too short author name"],
    },
    slug: { type: String, lowecase: true, required: true },
  },
  { timestamps: true }
);
export const authorModel = mongoose.model("author", authorSchema);
