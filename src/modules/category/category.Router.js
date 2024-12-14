import express from "express";
import {
  UpdateCategories,
  createCategory,
  deleteCategories,
  getAllCategories,
  getCategory,
  getCategoryadmin
} from "./category.Controller.js";
import {
  allowedTo,
  protectRoutes
} from "../auth/auth.Controller.js";
import {
  checkCurrency
} from "../country/country.controller.js";

const categoryRouter = express.Router();
categoryRouter.route("/getallcategories-admin")
  .get(protectRoutes, allowedTo("admin"), getAllCategories)
categoryRouter
  .route("/")
  .post(protectRoutes, allowedTo("admin"),
    createCategory
  )
  .get(checkCurrency, getAllCategories)
  categoryRouter
  .route("/category-admin/:id").get(protectRoutes, allowedTo("admin"),getCategoryadmin)
categoryRouter
  .route("/:id")
  .get(checkCurrency, getCategory)
  .delete(protectRoutes, allowedTo("admin"), deleteCategories)
  .put(protectRoutes, allowedTo("admin"), UpdateCategories);
  
export {
  categoryRouter
};