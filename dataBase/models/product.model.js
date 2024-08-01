import mongoose from "mongoose";
const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      unique: [true, "product title is unique"],
      trim: true,
      required: [true, "product title is required"],
      minLength: [2, "too short product name"],
    },
    slug: { type: String, lowecase: true, required: true },
    price: {
      type: Number,
      required: [true, "product price required"],
      min: 0
    },
    priceExchanged:Number
    ,
    currency:{
      type:String,
      default:"KWD"
    }
    ,
    priceAfterDiscount: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      minLength: [5, "too short product description"],
      maxLength: [300, "too long product description"],
      required: [true, "product description required"],
      trim: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
      required: [true, "product quantity required"],
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "category",
      required: [true, "product category required"],
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "author",
      required: [true, "product authorised required"],
    },
    Subcategory:{
      type:mongoose.Types.ObjectId,
      ref:'Subcategory',
      required:[true,'product subcategory reqired']
  },
    image: String,
  },
  { timestamps: true }
);
// productSchema.post("init", function (doc) {
//   doc.image = "http://localhost:3000/uploads/product/" + doc.image;
// });
export const productModel = mongoose.model("product", productSchema);
