import Jwt from "jsonwebtoken";
import {
  catchAsyncError
} from "../../middleWare/catchAsyncError.js";
import {
  userModel
} from "../../../dataBase/models/user.model.js";
import {
  AppError
} from "../../utilities/appError.js";
import bcrypt from "bcrypt";
import sendEmail from "../../utilities/sendEmail.js";
const tokenBlacklist = new Set();
export const signup = catchAsyncError(async (req, res, next) => {
  let isFound = await userModel.findOne({
    email: req.body.email
  });
  if (isFound) return next(new AppError("email already exists", 409));
  let user = new userModel(req.body);
  await user.save();
  res.json({
    message: "success",
    user
  });
});

export const signin = catchAsyncError(async (req, res, next) => {
  const {
    email,
    password
  } = req.body;
  let isFound = await userModel.findOne({
    email
  });
  if (!isFound) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const match = await bcrypt.compare(password, isFound.password);
  if (  match) {
    let token = Jwt.sign({
        name: isFound.name,
        userId: isFound._id,
        role: isFound.role
      },
      "mynameisRoqaya", {
        expiresIn: "1d"
      }
    );
    return res.json({
      message: "success",
      token
    });
  }
  next(new AppError("incorrect email or password", 401));
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const {
    email
  } = req.body;
  const user = await userModel.findOne({
    email
  });

  if (!user) {
    return next(new AppError("Invalid email", 401));
  }

  let token = Jwt.sign({
      name: user.name,
      userId: user._id,
      role: user.role
    },
    "mynameisRoqaya"
  );

  const resetLink = `http://localhost:3000/api/v1/users/resetpassword/${token}`;
  const message = `<a href="${resetLink}">Click to reset password</a>`;

  const emailIsSent = await sendEmail({
    to: email,
    message,
    subject: "Reset Your Password",
  });

  if (!emailIsSent) {
    return next(new AppError("Sending email failed", 500));
  }

  res.json({
    message: "Please check Link your email"
  });
});

export const allowedTo = (...roles) => {
  return catchAsyncError(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          "you are not autorized to access this route" + req.user.role,
          401
        )
      );
    next();
  });
};

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const token = req.query.token;  
  const { password } = req.body;  

  if (!token) {
    return next(new AppError("Token must be provided", 400));
  }

  let decoded;
  try {
    decoded = Jwt.verify(token, "mynameisRoqaya");
    console.log("Token decoded successfully:", decoded);
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return next(new AppError("Invalid or expired token", 400));
  }

  const user = await userModel.findById(decoded.userId);
  if (!user) {
    console.error("User not found for ID:", decoded.userId);
    return next(new AppError("User not found", 404));
  }
  user.password = password;
  user.passwordChangedAt = Date.now();
  await user.save();

  res.json({
    message: "Password has been reset successfully"
  });
});
export const protectRoutes = catchAsyncError(async (req, res, next) => {
  let {
    token
  } = req.headers;

 if(req._parsedOriginalUrl?.pathname =="/api/v1/orders/callback"){
  console.log(req.body)
  return next()
 }
  if (!token) return next(new AppError("Token not provided", 401));
  const authHeader = token.split('.')[1];
  if (tokenBlacklist.has(authHeader)) {
    return next(new AppError("Token has been invalidated", 401));
  }
  let decoded = Jwt.verify(token, "mynameisRoqaya");

  let user = await userModel.findById(decoded.userId);
  if (!user) return next(new AppError("User not found"));
  if (user.passwordChangedAt) {
    let changePasswordDate = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (changePasswordDate > decoded.iat)
      return next(new AppError("Password changed", 404));
  }
  req.user = user;
  next();
});
export const logout = catchAsyncError(async (req, res, next) => {
  let {
    token
  } = req.headers;
  if (!token) {
    return next(new AppError("Token not provided", 401));
  }

  const authHeader = token.split('.')[1];
  tokenBlacklist.add(authHeader);

  res.json({
    message: "Logged out successfully"
  });
});