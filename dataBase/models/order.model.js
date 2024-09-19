import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    cartItems: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "product" },
        name: String,
        quantity: Number,
        price: Number,
        priceExchanged: Number,
      },
    ],
    totalPrice: Number,
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
      enum: ["CASH", "ONLINE"],
      default: "ONLINE",
    },
    isPaid: {
      type: String,
      enum:["PENDING","SUCCESS"],
      default:"PENDING"
    },
    paidAt: Date,
    deliveredAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    invoiceId: String, // This stores the Invoice ID from MyFatoorah
    invoiceURL:String,
    paymentId: { type: String },  // This stores the Payment ID from MyFatoorah
  },
  { timestamps: true }
);

export const orderModel = mongoose.model("order", orderSchema);
