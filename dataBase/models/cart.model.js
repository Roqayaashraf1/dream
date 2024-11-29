import mongoose from "mongoose";

const cartSchema = mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    cartItems: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "product" },
        quantity: Number,
        price: Number,
        priceAfterDiscount: Number,
        priceExchanged: Number,
      },
    ],
    totalPrice: Number,
    totalPriceExchanged: Number,
    totalPriceAfterDiscount: Number,
    totalPriceBeforeDiscount: Number, 
    discount: Number,
  },
  { timestamps: true }
);

export const cartModel = mongoose.model("cart", cartSchema);
