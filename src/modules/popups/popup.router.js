import express from "express";
import {
    allowedTo,
    protectRoutes
} from "../auth/auth.Controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  fileURLToPath
} from "url";
import {
    addToPopup,
    getAllPopups,
    removePopup,
    updatePopup
} from "./popup.controller.js";

const popupRouter = express.Router();

const __filename = fileURLToPath(
    import.meta.url);
  const __dirname = path.dirname(__filename);
  const uploadDir = path.join(__dirname, "/uploads/popup");
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`);
    },
  });
  
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new AppError("Images only", 400), false);
    }
  };
  
  const upload = multer({
    storage,
    fileFilter
  });
  
popupRouter.route("/")
    .post(upload.single("image"),protectRoutes, allowedTo("admin"), addToPopup)
    .get(getAllPopups)
popupRouter.route("/:id")
    .delete(protectRoutes, allowedTo("admin"), removePopup)
    .put(protectRoutes, allowedTo("admin"), updatePopup)


export {
    popupRouter
};