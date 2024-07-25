import express from "express";
import {
  UpdatAuthor,
  createauthor,
  deleteAuthor,
  getAllAuthor,
  getauthor,
} from "./author.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.Controller.js";
const authorRouter = express.Router();
authorRouter
  .route("/")
  .post( createauthor)
  .get(getAllAuthor);

authorRouter
  .route("/:id")
  .get(getauthor)
  .delete( deleteAuthor)
  .put( UpdatAuthor);

export { authorRouter };
