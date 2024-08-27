import { authorModel } from "../../../dataBase/models/author.model.js";
import slugify from "slugify";
import { AppError } from "../../utilities/appError.js";
import * as factory from "../handlers/factor.handler.js";
import { APIFeatures } from "../../utilities/APIFeatures.js";
import { catchAsyncError } from "../../middleWare/catchAsyncError.js";

export const createauthor = catchAsyncError(async (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return next(new AppError('Name is required and must be a string', 400));
  }

  const slug = slugify(name, { lower: true });

  let result = new authorModel({ name, slug });
  await result.save();

  res.status(201).json({
    status: 'success',
    message: 'Author created successfully',
    data: {
      author: result,
    },
  });
});
export const getAllAuthor = catchAsyncError(async (req, res, next) => {
    try {
      let apiFeatures = new APIFeatures(authorModel.find(), req.query)
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
export const getauthor = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await authorModel.findById(id);
  !result && next(new AppError(`author not found`, 404));
  result && res.json({ message: "success", result });
});

export const UpdatAuthor = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  let result = await authorModel.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    { new: true }
  );
  !result && next(new AppError(`author not found`, 404));
  result && res.json({ message: "success", result });
});

export const deleteAuthor = factory.deleteOne(authorModel);
