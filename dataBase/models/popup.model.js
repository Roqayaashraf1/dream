import mongoose from "mongoose";
const popupSchema = mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    popupitems: [
        {
          product: { type: mongoose.Types.ObjectId, ref: "product" },
          title:String,
          image:String
        },
    ]
  },
  { timestamps: true }
);
export const popupModel = mongoose.model("popup", popupSchema);
