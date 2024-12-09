import express from "express";
import {
  UpdateCategories,
  createCategory,
  deleteCategories,
  getAllCategories,
  getCategory,
  searchcategory,
} from "./category.Controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.Controller.js";
import { checkCurrency } from "../country/country.controller.js";

const categoryRouter = express.Router();
categoryRouter
  .route("/")
  .post(protectRoutes, allowedTo("admin"), 
    createCategory
  )
  .get(checkCurrency,getAllCategories);
  categoryRouter.route("/search-category")
  .get(searchcategory)
categoryRouter
  .route("/:id")
  .get(checkCurrency,getCategory)
  .delete(protectRoutes, allowedTo("admin"),  deleteCategories)
  .put(protectRoutes, allowedTo("admin"),  UpdateCategories);

export { categoryRouter };
