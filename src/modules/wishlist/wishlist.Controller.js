import { catchAsyncError } from "../../middleWare/catchAsyncError.js";
import { AppError } from "../../utilities/AppError.js";
import { userModel } from "../../../dataBase/models/user.model.js";

export const addToWishlist = catchAsyncError(async (req, res, next) => {
  let { product } = req.params;
  let result = await userModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: product } },
    req.body,
    { new: true }
  );
  !result && next(new AppError(`user not found`, 404));
  result && res.json({ message: "success", result });
});

export const removeFromWishlist = catchAsyncError(async (req, res, next) => {
  let { product } = req.body;
  let result = await userModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: product } },
    { new: true }
  );
  !result && next(new AppError(`product not found`, 404));
  result && res.json({ message: "success", result: result.wishlist });
});

export const getAllWishlist = catchAsyncError(async (req, res, next) => {
  let result = await userModel.findOne({ _id: req.user._id }).populate('wishlist');
  !result && next(new AppError(` not found`, 404));
  result && res.json({ message: "success", result: result.wishlist });
});
