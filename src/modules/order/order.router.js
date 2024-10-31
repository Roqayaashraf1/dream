import express from "express";
import {
  callback,
  createCashOrder,
  getAllOrders,
  getOrder,
  getSpecificOrder,
  pay
} from "./order.controller.js";
import {
  allowedTo,
  protectRoutes
} from "../auth/auth.Controller.js";
import {
  checkCurrency
} from "../country/country.controller.js";
import { error } from "console";

const orderRouter = express.Router();
orderRouter.route("/callback").get(callback);
orderRouter.route("/error").get(error);
orderRouter.route("/").get(protectRoutes, allowedTo("user"), getSpecificOrder);
orderRouter.route('/allorders').get(protectRoutes, allowedTo("admin"), getAllOrders);

orderRouter
  .route("/:id")
  .post(checkCurrency, protectRoutes, allowedTo("user"), createCashOrder)
  .get(protectRoutes, allowedTo("admin"), getOrder);

orderRouter.route("/pay/:id").post(protectRoutes, allowedTo("user"), pay);


export {
  orderRouter
};