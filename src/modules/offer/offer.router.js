import express from "express";
import { createoffer } from "./offer.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.Controller.js";

const offerRouter = express.Router();
offerRouter.route("/").post(protectRoutes, allowedTo("admin"), createoffer);


export { offerRouter };
