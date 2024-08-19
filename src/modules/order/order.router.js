import express from "express";
import { createCashOrder, getAllOrders, getOrder, getSpecificOrder } from "./order.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.Controller.js";
import { checkCurrency } from "../country/country.controller.js";
const orderRouter = express.Router();
orderRouter.route("/").get(protectRoutes, allowedTo("user"), getSpecificOrder);
orderRouter.route('/allorders').get(protectRoutes, allowedTo("admin"),getAllOrders)
orderRouter
  .route("/:id")
  .post(checkCurrency ,protectRoutes, allowedTo("user"), createCashOrder)
  .get(protectRoutes, allowedTo("admin"),getOrder)

export { orderRouter };
