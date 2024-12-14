import express from "express";
import {
    createoffer,
    deleteOffer,
    getAllOffers
} from "./offer.controller.js";
import {
    allowedTo,
    protectRoutes
} from "../auth/auth.Controller.js";

const offerRouter = express.Router();
offerRouter.route("/").post(protectRoutes, allowedTo("admin"), createoffer)
    .get(getAllOffers);
offerRouter.route("/:id").delete(protectRoutes, allowedTo("admin"), deleteOffer);
offerRouter.route("/getalloffers-admin")
    .get(protectRoutes, allowedTo("admin"), getAllOffers)
export {
    offerRouter
};