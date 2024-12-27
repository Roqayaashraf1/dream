import express from "express";
import {
  addcontactus,
  deletecontactus,
  getAllContactus,
  getcontactus,
  UpdateContactus,
} from "./contactus.Controller.js";
import {
  allowedTo,
  protectRoutes
} from "../auth/auth.Controller.js";

const contactusRouter = express.Router();
contactusRouter.route("/getallcontactus-admin")
  .get(protectRoutes, allowedTo("admin"), getAllContactus)
contactusRouter
  .route("/")
  .post(protectRoutes, allowedTo("admin"),
    addcontactus
  )
  .get(getAllContactus)
contactusRouter
  .route("/:id")
    .get(getcontactus)
  .delete(protectRoutes, allowedTo("admin"), deletecontactus)
  .put(protectRoutes, allowedTo("admin"), UpdateContactus);

export {
  contactusRouter
};