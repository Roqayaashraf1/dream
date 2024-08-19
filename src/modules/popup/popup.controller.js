import {
  popupModel
} from "../../../dataBase/models/popup.model.js";
import {
  productModel
} from "../../../dataBase/models/product.model.js";
import {
  catchAsyncError
} from "../../middleWare/catchAsyncError.js";
import {
  AppError
} from "../../utilities/appError.js";

export const addToPopup = catchAsyncError(async (req, res, next) => {
  const {
    product: productId
  } = req.body;

  const product = await productModel.findById(productId);
  if (!product) return next(new AppError("Product not found", 401));
  let popup = await popupModel.findOne({
    user: req.user._id
  });
  if (!popup) {
    popup = new popupModel({
      user: req.user._id,
      popupitems: [{
        ...req.body
      }]
    });
    await popup.save();
  } else {
    const existingItem = popup.popupitems.find(
      (item) => item.product.toString() === productId.toString()
    );
    if (existingItem) {
      return next(new AppError("Product already exists in popup", 400));
    }

    popup.popupitems.push({
      ...req.body,
    });
    await popup.save();
  }

  return res.json({
    message: "success",
    result: popup,
  });
});
export const removeProductFromPopup = catchAsyncError(async (req, res, next) => {

  let result = await popupModel.findOneAndUpdate({
    user: req.user._id
  }, {
    $pull: {
      popupitems: {
        _id: req.params.id
      }
    }
  }, {
    new: true
  });
  if (!result) return next(new AppError(`Item not found`, 401));
  await result.save();

  res.json({
    message: "success",
    result
  });
});


export const getRandomProductFromPopup = catchAsyncError(async (req, res, next) => {

})