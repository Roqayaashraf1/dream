import express from "express";
import {
    allowedTo,
    protectRoutes
} from "../auth/auth.Controller.js";
import {
    addToPopup,
    removeProductFromPopup
} from "./popup.controller.js";

const popupRouter = express.Router();


popupRouter.route("/")
    .post(protectRoutes, allowedTo("admin"), addToPopup)
popupRouter.route("/:id")
    .delete(protectRoutes, allowedTo("admin"), removeProductFromPopup)


export {
    popupRouter
};