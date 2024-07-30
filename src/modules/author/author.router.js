import express from "express";
import {
  UpdatAuthor,
  createauthor,
  deleteAuthor,
  getAllAuthor,
  getauthor,
} from "./author.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.Controller.js";
import { checkCurrency } from "../country/country.controller.js";
const authorRouter = express.Router();
authorRouter
  .route("/")
  .post(protectRoutes,allowedTo("admin"), createauthor)
  .get(checkCurrency,getAllAuthor);

authorRouter
  .route("/:id")
  .get(checkCurrency,getauthor)
  .delete(protectRoutes,allowedTo("admin") ,deleteAuthor)
  .put(protectRoutes,allowedTo("admin"), UpdatAuthor);

export { authorRouter };
