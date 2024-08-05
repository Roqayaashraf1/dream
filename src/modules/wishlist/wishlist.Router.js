import express from "express";
const wishlistrouter = express.Router();
import * as wishlist from "./wishlist.Controller.js";
import { protectRoutes, allowedTo } from "../auth/auth.Controller.js";
import { checkCurrency } from "../country/country.controller.js";

wishlistrouter.use(protectRoutes, allowedTo("user"), checkCurrency);

wishlistrouter.route('/')
  .post(wishlist.addToWishlist)
  .delete(wishlist.removeFromWishlist)
  .get(wishlist.getAllWishlist);

export { wishlistrouter };
