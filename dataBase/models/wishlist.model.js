import mongoose from "mongoose";


const wishlistSchema = mongoose.Schema(
{
    product: {
        type: mongoose.Types.ObjectId,
        ref: "product",
        required: [true, " product required"],
      }

})

export const wishlistModel = mongoose.model("wishlist", wishlistSchema);
