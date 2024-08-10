import express from "express";
import * as user from "./user.Controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.Controller.js";

const userRouter = express.Router();

userRouter
  .route("/:id")
  .get(protectRoutes,
    allowedTo("user"),user.getuser)
  .delete(protectRoutes,
    allowedTo("admin","user"),user.deleteusers)
  .put(protectRoutes,
    allowedTo("admin","user"),user.Updateuser);

userRouter.patch("/changeuserpassword/:id",protectRoutes,
  allowedTo("user"), user.changeUserPassword);

export { userRouter };
