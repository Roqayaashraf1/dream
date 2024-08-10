import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      unique: [true, "Product title must be unique"],
      trim: true,
      required: [true, "Product title is required"],
      minLength: [2, "Product title is too short"],
    },
    slug: {
      type: String,
      lowercase: true, 
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    priceExchanged: Number,
    currency: {
      type: String,
      default: "KWD",
    },
    papersnumber: Number,
    priceAfterDiscount: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      minLength: [5, "Product description is too short"],
      maxLength: [300, "Product description is too long"],
      required: [true, "Product description is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
      required: [true, "Product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "category", 
      required: [true, "Product category is required"],
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "author", 
      required: [true, "Product author is required"],
    },
    Subcategory: {
      type: mongoose.Types.ObjectId,
      ref: "Subcategory", 
      required: [true, "Product subcategory is required"],
    },
    image: String,
  },
  { timestamps: true }
);
export const productModel = mongoose.model("product", productSchema);
