
import mongoose from "mongoose";
const popupSchema = mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user"
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "product"
  },
  image: String,
  title: {
    type:String,
    required:[true,"title is required"]
  }
}, {
  timestamps: true
});

export const popupModel = mongoose.model("popup", popupSchema);