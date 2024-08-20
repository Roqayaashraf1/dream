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
  const image = req.file ? req.file.filename : null;
  const {
    productId,
    title
  } = req.body;
  console.log(req.body)
  let result = new popupModel({
    user: req.user._id,
    title,
    product: productId,
    image
    
  });
  await result.save();
  res.json({
    message: "success",
    result
  });
});

export const removePopup = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const result = await popupModel.findByIdAndDelete(id);

  if (!result) {
    return res.status(404).json({
      message: "Popup not found",
    });
  }

  res.json({
    message: "popup deleted "
  });
});

export const updatePopup = catchAsyncError(async (req, res, next) => {
  const {
    id
  } = req.params;
  const {
    product,
    title
  } = req.body;
  let result = await popupModel.findByIdAndUpdate(
    id, 
      req.body, {
      new: true
    }
  );
  if (!result) return next(new AppError("Popup not found", 404));
  res.json({
    message: "success",
    result
  });
});

export const getAllPopups = catchAsyncError(async(req,res,next)=>{

  const popups = await popupModel.find().populate('product'); 

  res.json({
    message: "success",
    result: popups
  });
});
