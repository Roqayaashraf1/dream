import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    cartItems: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "product" },
        name:String,
        quantity: Number,
        price: Number,
        priceExchanged: Number
      },
    ],
    totalOrderPrice: Number,

    totalPriceExchanged: Number,
    currency: String,
    shippingAddress: {
      street: String,
      city: String,
      phone: String,
      country: String,
      building: String,
      area: String,
      floor: Number,       
      apartment: Number,      
    },
    PaymentMethod: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaied: {
      type: Boolean,
      default: false,
    },
    paiedAt: Date,
    deliveredAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    image: String,
  },
  { timestamps: true }
);

export const orderModel = mongoose.model("order", orderSchema);
