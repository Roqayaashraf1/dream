
import { catchAsyncError } from "../../middleWare/catchAsyncError.js";
import { AppError } from "../../utilities/appError.js";
import { userModel } from "../../../dataBase/models/user.model.js";
import * as factory from "../handlers/factor.handler.js";
import { APIFeatures } from "../../utilities/APIFeatures.js";

export const createuser = catchAsyncError(async (req, res, next) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (user) return next(new AppError("account already exist", 409));
  let result = new userModel(req.body);
  await result.save();
  res.json({ message: "success" });
});

export const getAlluser = catchAsyncError(async (req, res) => {
  let apiFeatures = new APIFeatures(userModel.find(), req.query)
    .paginate()
    .filter()
    .selectedFields()
    .search()
    .sort();

  let result = await apiFeatures.mongooseQuery;
  res.json({ message: "success", page: apiFeatures.page, result });
});
export const getuser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await userModel.findById(id);
  !result && next(new AppError(`user not found`, 404));
  result && res.json({ message: "success", result });
});

export const Updateuser = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let result = await userModel.findByIdAndUpdate(id, req.body, { new: true });
  !result && next(new AppError(`user not found`, 404));
  result && res.json({ message: "success", result });
});

export const deleteusers = factory.deleteOne(userModel);
// change password by the new password
export const changeUserPassword = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  req.body.passwordChangedAt = Date.now();
  let result = await userModel.findByIdAndUpdate(id, req.body, { new: true });
  !result && next(new AppError(`user not found`, 404));
  result && res.json({ message: "success", result });
});
