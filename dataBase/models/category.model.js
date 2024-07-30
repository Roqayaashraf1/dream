import mongoose from "mongoose";
const categorySchema = mongoose.Schema(
  {
    englishname: { type: String, required: true },
  arabicname: { type: String, required: true },
  englishslug: { type: String },
  arabicslug: { type: String }
  },
  { timestamps: true }
);
export const categoryModel = mongoose.model("category", categorySchema);
