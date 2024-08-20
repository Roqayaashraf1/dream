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
  title: String
}, {
  timestamps: true
});
popupSchema.pre('save', function (next) {
  if (this.image) {
    this.image = "http://localhost:3500/popup/" + this.image;
  }
  next();
});
export const popupModel = mongoose.model("popup", popupSchema);