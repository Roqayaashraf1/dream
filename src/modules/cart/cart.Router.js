import express from "express";
import * as cart from "./cart.Controller.js";
import {
  allowedTo,
  protectRoutes
} from "../auth/auth.Controller.js";
import {
  checkCurrency
} from "../country/country.controller.js";

const cartRouter = express.Router();

cartRouter.use(checkCurrency);

cartRouter.route("/")
  .post(protectRoutes, allowedTo("user"), cart.addToCart)
  .get(protectRoutes, allowedTo("user"), cart.getLoggedUserCart);

cartRouter.route("/:id")
  .delete(protectRoutes, allowedTo("user"), cart.removeProductFromCart)
  .put(protectRoutes, allowedTo("user"), cart.updateQuantity)

export {
  cartRouter
};