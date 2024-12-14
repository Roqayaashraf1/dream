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
import fs from 'fs';  
import path from 'path';    
import { fileURLToPath } from 'url';  // Import fileURLToPath from 'url'
import { dirname } from 'path';  // Import dirname from 'path'

// Compute __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);  // Get the directory of the current file

export const removePopup = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Find the popup by ID
  const popup = await popupModel.findById(id);

  // If the popup is not found, return a 404 response
  if (!popup) {
    return res.status(404).json({
      message: "Popup not found",
    });
  }

  // Define the path for the image to delete
  const imagePath = path.join(__dirname, 'uploads', 'popup', popup.image);

  try {
    // Delete the popup from the database
    await popupModel.findByIdAndDelete(id);

    // Attempt to delete the image file
    fs.unlink(imagePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error("Error deleting image file:", err);
      }
    });

    // Return a success message if everything went well
    res.json({
      message: "Popup and associated image deleted successfully",
    });

  } catch (error) {
    console.error("Error during popup deletion:", error);
    // Return a 500 error if something goes wrong
    return res.status(500).json({
      message: "Internal Server Error during popup deletion. Please try again later.",
    });
  }
});

export default removePopup;

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
