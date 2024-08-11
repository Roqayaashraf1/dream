import mongoose from "mongoose";

const wishlistSchema = mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: [true, "User required"],
  },
  wishlistItems: [{
    product: {
      type: mongoose.Types.ObjectId,
      ref: "product"
    },
    title: String,
    price: Number,
    image: String,
    priceExchanged:Number
  }, ],
});

export const wishlistModel = mongoose.model("wishlist", wishlistSchema);