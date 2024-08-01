import express from "express";
import * as cart from "./cart.Controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.Controller.js";
import { checkCurrency } from "../country/country.controller.js";

const cartRouter = express.Router();

cartRouter.use(checkCurrency);

cartRouter.route("/")
  .post(protectRoutes, allowedTo("user"), cart.addToCart);

cartRouter.route("/:id")
  .delete(protectRoutes, allowedTo("user"), cart.removeProductFromCart)
  .put(protectRoutes, allowedTo("user"), cart.updateQuantity)
  .get(protectRoutes, allowedTo("user"), cart.getLoggedUserCart);

export { cartRouter };
