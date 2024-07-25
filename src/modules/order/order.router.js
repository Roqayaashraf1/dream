import express from "express";
import { createCashOrder } from "./order.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.Controller.js";
const orderRouter = express.Router();

orderRouter
  .route("/:id")
  .post(protectRoutes,
    allowedTo("admin","user"),createCashOrder)
export { orderRouter };
