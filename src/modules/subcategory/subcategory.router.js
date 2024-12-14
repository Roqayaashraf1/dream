import express from "express";
import * as Subcategory from "./subcategory.controller.js"
import {
    allowedTo,
    protectRoutes
} from "../auth/auth.Controller.js";
import {
    checkCurrency
} from "../country/country.controller.js";
const SubcategoryRouter = express.Router()

SubcategoryRouter.route("/getallsubcategory-admin")
  .get(protectRoutes, allowedTo("admin"),Subcategory.getAllSubCategories)


SubcategoryRouter.route('/').post(protectRoutes,
        allowedTo("admin"), Subcategory.createSubCategory)
    .get(checkCurrency, Subcategory.getAllSubCategories)

SubcategoryRouter.route('/:id')
    .get(checkCurrency, Subcategory.getSubCategory)
    .put(protectRoutes,
        allowedTo("admin"), Subcategory.updateSubCategory)
    .delete(protectRoutes,
        allowedTo("admin"), Subcategory.deleteSubCategory)
SubcategoryRouter.route('/admin/:id').get(protectRoutes, allowedTo("admin"), Subcategory.getSubCategoryadmin)

export {
    SubcategoryRouter
}