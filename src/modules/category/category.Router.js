import express from "express";
import {
  UpdateCategories,
  createCategory,
  deleteCategories,
  getAllCategories,
  getCategory,
} from "./category.Controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.Controller.js";

const categoryRouter = express.Router();
categoryRouter
  .route("/")
  .post(protectRoutes, allowedTo("admin"), 
    createCategory
  )
  .get(getAllCategories);

categoryRouter
  .route("/:id")
  .get(getCategory)
  .delete(protectRoutes, allowedTo("admin"),  deleteCategories)
  .put(protectRoutes, allowedTo("admin"),  UpdateCategories);

export { categoryRouter };
