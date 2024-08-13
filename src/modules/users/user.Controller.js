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

import bcrypt from "bcrypt";

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

  const {
    oldPassword,
    newPassword
  } = req.body;
  let user = await userModel
    .findById(
      req.user._id
    )
    console.log(user)
  if (!user) {
    return next(new AppError(`User not found`, 404));
  }
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return next(new AppError("Old password is incorrect", 401));
  }
  const result = await userModel.findByIdAndUpdate(
    user._id, {
      password: newPassword,
      passwordChangedAt: Date.now(),
    }, {
      new: true
    }
  );

  res.json({
    message: "Password updated successfully",
    result,
  });
});