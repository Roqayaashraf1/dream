import { catchAsyncError } from "../../middleWare/catchAsyncError.js";
import { AppError } from "../../utilities/appError.js";
import { userModel } from "../../../dataBase/models/user.model.js";
import { getExchangeRate } from "../../utilities/getExchangeRate.js";

export const addToWishlist = catchAsyncError(async (req, res, next) => {
  try {
    let { product } = req.params;

    if (!product) {
      return next(new AppError(`Product ID is required`, 400));
    }

    let result = await userModel.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: product } },
      { new: true }
    ).populate('wishlist'); 

    if (!result) return next(new AppError(`User not found`, 404));

    res.json({ message: "success", result });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    next(error);
  }
});



export const removeFromWishlist = catchAsyncError(async (req, res, next) => {
  try {
    const { product } = req.body;

    if (!product) {
      return next(new AppError('Product ID is required', 400));
    }

    const result = await userModel.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: product } },
      { new: true }
    ).populate('wishlist'); 

    if (!result) {
      return next(new AppError('User not found', 404));
    }

    res.json({ message: 'success', result: result.wishlist });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    next(error);
  }
});


export const getAllWishlist = catchAsyncError(async (req, res, next) => {
  const { currency } = req.headers;

  let user = await userModel.findOne({ _id: req.user._id }).populate('wishlist');
  if (!user) return next(new AppError(`User not found`, 404));

  if (currency && currency !== "KWD") {
    try {
      const exchangeRate = await getExchangeRate(currency);
      const wishlist = user.wishlist.map(item => ({
        ...item._doc,
        price: (item.price * exchangeRate).toFixed(2),
        currency,
      }));
      return res.json({ message: "success", result: wishlist });
    } catch (error) {
      return res.status(500).json({ message: "Error converting currency", error });
    }
  }

  res.json({ message: "success", result: user.wishlist });
});
