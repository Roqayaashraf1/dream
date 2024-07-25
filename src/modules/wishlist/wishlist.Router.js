import express from "express";
const wishlistrouter = express.Router()
import * as wishlist from "./wishlist.Controller.js";


wishlistrouter.route('/').patch(wishlist.addToWishlist).delete(wishlist.removeFromWishlist).get(wishlist.getAllWishlist)

export {wishlistrouter}