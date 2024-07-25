import express from "express";

import * as cart from "./cart.Controller.js";
// import { protectRoutes, allowedTo } from "../auth/auth.Controller.js";
const cartRouter = express.Router();

cartRouter.route("/").post(cart.addToCart);
cartRouter
  .route("/:id")
  .delete(cart.removeProductFromCart)
  .put(cart.updateQuantity)
  .get(cart.getloggedusercart);
export { cartRouter };
