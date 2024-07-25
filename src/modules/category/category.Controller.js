import { categoryModel } from "../../../dataBase/models/category.model.js";
import slugify from "slugify";
import { AppError } from "../../utilities/AppError.js";
import * as factory from "../handlers/factor.handler.js";
import { APIFeatures } from "../../utilities/APIFeatures.js";
import { catchAsyncError } from "../../middleWare/catchAsyncError.js";

export const createCategory = catchAsyncError(async (req, res) => {
  const { name } = req.body;
  let result = new categoryModel({ name, slug: slugify(name) });
  await result.save();
  res.json({ message: "success" });
});

export const getAllCategories = catchAsyncError(async (req, res, next) => {
    try {
      let apiFeatures = new APIFeatures(categoryModel.find(), req.query)
        .paginate()
        .filter()
        .selectedFields()
        .search()
        .sort();
  
      let result = await apiFeatures.mongooseQuery;
      res.status(200).json({ message: "success", page: apiFeatures.page, result });
    } catch (error) {
      next(error);
    }
  });
export const getCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await categoryModel.findById(id);
  !result && next(new AppError(`category not found`, 404));
  result && res.json({ message: "success", result });
});

export const UpdateCategories = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  let result = await categoryModel.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    { new: true }
  );
  !result && next(new AppError(`category not found`, 404));
  result && res.json({ message: "success", result });
});

export const deleteCategories = factory.deleteOne(categoryModel);
