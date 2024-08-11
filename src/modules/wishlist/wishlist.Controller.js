import {
  catchAsyncError
} from "../../middleWare/catchAsyncError.js";
import {
  AppError
} from "../../utilities/appError.js";
import {
  userModel
} from "../../../dataBase/models/user.model.js";
import {
  getExchangeRate
} from "../../utilities/getExchangeRate.js";
import {
  productModel
} from "../../../dataBase/models/product.model.js"
import {
  wishlistModel
} from "../../../dataBase/models/wishlist.model.js"
export const addToWishlist = catchAsyncError(async (req, res, next) => {
  try {
    let productId = req.params.product;

    if (!productId) {
      return next(new AppError(`Product ID is required`, 400));
    }
    let product = await productModel.findById(productId)
    if (!product) return next(new AppError("Product not found", 401));
    const exchangeRate = await getExchangeRate(req.headers.currency)
    let wishlist = await wishlistModel.findOne({
      user: req.user._id
    })
    if (!wishlist) {
      wishlist = new wishlistModel({
        user: req.user._id,
        wishlistItems: [{
          ...product,
          priceExchanged: product.price * exchangeRate,

        }]
      })
    } else {
      const existingItem = wishlist.wishlistItems.find(
        (item) => item._id.toString() === productId
      );
      product.priceExchanged = product.price * exchangeRate;
      if (!existingItem)
        wishlist.wishlistItems.push(product);
    }

    await wishlist.save()

    res.json({
      message: "success",
      wishlist
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    next(error);
  }
});
export const getLoggedUserWishlist = catchAsyncError(async (req, res, next) => {
  
  let cart = await wishlistModel
    .findOne({ user: req.user._id })
    .populate('wishlistItems.product'
    );

  if (!cart) return next(new AppError("wishlist not found", 404));
  res.status(200).json({ message: "success", cart });
});


export const removeProductFromWishlist = catchAsyncError(async (req, res, next) => {

  let result = await wishlistModel.findOneAndUpdate(
    { user: req.user._id },
    { $pull: {wishlistItems : { _id: req.params.product } } },
    { new: true }
  );
  if (!result) return next(new AppError(`Item not found`, 401));
  await result.save();

  res.json({ message: "success", result });
});