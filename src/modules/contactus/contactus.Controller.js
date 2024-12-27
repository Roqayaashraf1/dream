import {
  contactusModel
} from "../../../dataBase/models/contactus.model.js";

import {
  catchAsyncError
} from "../../middleWare/catchAsyncError.js";
import {
  APIFeatures
} from "../../utilities/APIFeatures.js";
import { AppError } from "../../utilities/appError.js";
import * as factory from "../handlers/factor.handler.js";
export const addcontactus = catchAsyncError(async (req, res) => {

  const {
    email,
    message,
    title
  } = req.body;

  let result = new contactusModel(req.body);

  await result.save();


  res.json({
    message: "success",
    result
  });
});
export const getAllContactus = catchAsyncError(async (req, res) => {

  try {
    let apiFeatures = new APIFeatures(
        contactusModel.find(), req.query)
      .filter()
      .selectedFields()
      .search()
      .sort();

    let result = await apiFeatures.mongooseQuery;
    res.json({
      message: "success",
      result
    });
  } catch (error) {
    res.status(500).json({
      message: "Error converting currency",
      error,
    });
  }
});
export const UpdateContactus = catchAsyncError(async (req, res, next) => {
  const {
    id
  } = req.params;
  let result = await contactusModel.findByIdAndUpdate(id, req.body, {
    new: true
  });
  !result && next(new AppError("contactus not found", 404));
  result && res.json({
    message: "success",
    result
  });
});

export const deletecontactus = factory.deleteOne(contactusModel);
export const getcontactus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await contactusModel.findById(id);
  !result && next(new AppError(`contactus not found`, 404));
  result && res.json({ message: "success", result });
});