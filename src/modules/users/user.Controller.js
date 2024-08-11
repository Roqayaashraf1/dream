import {
  catchAsyncError
} from "../../middleWare/catchAsyncError.js";
import {
  AppError
} from "../../utilities/appError.js";
import {
  userModel
} from "../../../dataBase/models/user.model.js";
import * as factory from "../handlers/factor.handler.js";


export const getuser = catchAsyncError(async (req, res, next) => {
  const {
    id
  } = req.params;
  let result = await userModel.findById(id);
  !result && next(new AppError(`user not found`, 404));
  result && res.json({
    message: "success",
    result
  });
});

export const Updateuser = catchAsyncError(async (req, res, next) => {
  let {
    id
  } = req.params;
  let result = await userModel.findByIdAndUpdate(id, req.body, {
    new: true
  });
  !result && next(new AppError(`user not found`, 404));
  result && res.json({
    message: "success",
    result
  });
});

export const deleteusers = factory.deleteOne(userModel);
// change password by the new password
export const changeUserPassword = catchAsyncError(async (req, res, next) => {
  let {
    id
  } = req.params;
  const {  password } = req.body;
  let result = await userModel.findByIdAndUpdate(id, req.body, {
    new: true
  });
  req.body.passwordChangedAt = Date.now();
  !result && next(new AppError(`user not found`, 404));
  result && res.json({
    message: "success",
    result
  });
});