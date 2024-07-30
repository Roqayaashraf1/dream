import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  UpdateProduct,
  createproduct,
  deleteproduct,
  getAllproducts,
  getproduct,
} from "./product.Controller.js";
import { protectRoutes, allowedTo } from "../auth/auth.Controller.js";
import { AppError } from "../../utilities/AppError.js";
import { checkCurrency } from "../country/country.controller.js";

// Convert module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, "/uploads/product");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Images only", 400), false);
  }
};

const upload = multer({ storage, fileFilter });

const productRouter = express.Router();

productRouter.route("/")
  .post(
    upload.single("image"),
    protectRoutes,
    allowedTo("admin"),
    createproduct
  )
  .get(checkCurrency, getAllproducts);

productRouter.route("/:id")
  .get(checkCurrency, getproduct)
  .delete(
    protectRoutes,
    allowedTo("admin"),
    deleteproduct
  )
  .put(
    protectRoutes,
    allowedTo("admin"),
    upload.single("image"),
    UpdateProduct
  );

export { productRouter };
