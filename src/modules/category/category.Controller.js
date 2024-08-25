import {
  categoryModel
} from "../../../dataBase/models/category.model.js";
import slugify from "slugify";
import {
  AppError
} from "../../utilities/appError.js";
import * as factory from "../handlers/factor.handler.js";
import {
  APIFeatures
} from "../../utilities/APIFeatures.js";
import {
  catchAsyncError
} from "../../middleWare/catchAsyncError.js";
import {
  productModel
} from "../../../dataBase/models/product.model.js";
export const createCategory = catchAsyncError(async (req, res) => {
  try {
    const {
      englishname,
      arabicname
    } = req.body;

    let result = new categoryModel({
      englishname,
      arabicname,
      englishslug: slugify(englishname),
      arabicslug: slugify(arabicname)
    });

    await result.save();
    res.json({
      message: "success",
      result
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating category",
      error: error.message
    });
  }
});

export const getAllCategories = catchAsyncError(async (req, res, next) => {
  try {
    const languageHeader = req.headers['accept-language'] || 'arabic';
    const language = languageHeader.toLowerCase();
    const languageField = language === 'english' || language.startsWith('en') ? 'englishname' : 'arabicname';
    const slugField = language === 'english' || language.startsWith('en') ? 'englishslug' : 'arabicslug';

    let apiFeatures = new APIFeatures(categoryModel.find(), req.query)
      .paginate()
      .filter()
      .selectedFields(`${languageField} ${slugField}`)
      .search()
      .sort();
    
    let result = await apiFeatures.mongooseQuery;
    result = result.map(item => {
      const obj = item.toObject();
      return {
        _id: obj._id,
        name: obj[languageField], 
        slug: obj[slugField]     
      };
    });

    res.status(200).json({
      message: "success",
      page: apiFeatures.page,
      result
    });
  } catch (error) {
    next(error);
  }
});


export const getCategory = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;
    const language = (req.headers['accept-language'] || 'arabic').toLowerCase();
    const languageField = language.includes('english') ? 'englishname' : 'arabicname';
    
    console.log(`Using language field: ${languageField}`);
    
    const category = await categoryModel.findById(id).select(`${languageField} slug`);
    
    console.log('Category details:', category);
    
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    
    const products = await productModel.find({ category: id });
    
    console.log('Products under this category:', products);
    
    res.json({
      message: 'success',
      category,
      products
    });
  } catch (error) {
    next(error);
  }
});


export const UpdateCategories = catchAsyncError(async (req, res, next) => {
  const {
    id
  } = req.params;
  const {
    englishname,
    arabicname
  } = req.body;
  let result = await categoryModel.findByIdAndUpdate(id, {
    englishname,
    arabicname,
    englishslug: slugify(englishname),
    arabicslug: slugify(arabicname)
  }, {
    new: true
  });
  !result && next(new AppError("category not found", 404));
  result && res.json({
    message: "success",
    result
  });
});



export const deleteCategories = factory.deleteOne(categoryModel);