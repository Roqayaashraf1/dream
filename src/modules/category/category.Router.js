import express from "express";
import {
  UpdateCategories,
  createCategory,
  deleteCategories,
  getAllCategories,
  getCategory,
} from "./category.Controller.js";
import { validation } from "../../middleWare/validation.js";
import { createCategorySchema } from "./category.validation.js";
import { allowedTo, protectRoutes } from "../auth/auth.Controller.js";
const categoryRouter = express.Router();
categoryRouter
  .route("/")
  .post(
    validation(createCategorySchema),
    createCategory
  )
  .get(getAllCategories);

categoryRouter
  .route("/:id")
  .get(getCategory)
  .delete( deleteCategories)
  .put( UpdateCategories);

export { categoryRouter };
