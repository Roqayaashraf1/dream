import slugify from "slugify";
import {
    productModel
  } from "../../../dataBase/models/product.model.js";
import {
    catchAsyncError
} from "../../middleWare/catchAsyncError.js";
import {
    AppError
} from "../../utilities/appError.js";
import {
    SubcategoryModel
} from "../../../dataBase/models/subcategory.model.js";


export const createSubCategory = catchAsyncError(async (req, res) => {
    const {
        englishname,
        arabicname,
        category
    } = req.body;
    let result = new SubcategoryModel({
        englishname,
        arabicname,
        category,
        slug: slugify(englishname)
    });
    await result.save();
    res.json({
        message: "success " ,result
    });
});


export const getAllSubCategories = catchAsyncError(async (req, res) => {
    let filter = {};
    if (req.params.categoryId) {
        filter = {
            category: req.params.categoryId
        };
    }
    let result = await SubcategoryModel.find(filter)
    .populate('category')

    const language = req.headers.language || 'arabic';
    result = result.map(subcategory => ({
        name: language === 'english' ? subcategory.englishname : subcategory.arabicname,
        ...subcategory._doc
    }));

    res.json({
        message: "success",
        result
    });
});


export const getSubCategory = catchAsyncError(async (req, res, next) => {
    const {
        id
    } = req.params;
    let result = await SubcategoryModel.findById(id)
    .populate('category');
    const products = await productModel.find({ Subcategory: id });
    
    if (!result) return next(new AppError(`Subcategory not found`, 404));

    const language = req.headers.language || 'arabic';
   const  name= language === 'english' ? result.englishname : result.arabicname
    result = {
      
        ...result._doc,
        name
    };

    res.json({
        message: "success",
        result,
        products
    });
});


export const updateSubCategory = catchAsyncError(async (req, res, next) => {
    const {
        id
    } = req.params;
    const {
        englishname,
        arabicname
    } = req.body;
    let updateData = {
        englishname,
        arabicname,
        slug: slugify(englishname)
    };
    let result = await SubcategoryModel.findByIdAndUpdate(id, updateData, {
        new: true
    });
    if (!result) return next(new AppError(`Subcategory not found`, 404));

    res.json({
        message: "success",
        result
    });
});


export const deleteSubCategory = catchAsyncError(async (req, res, next) => {
    const {
        id
    } = req.params;
    let result = await SubcategoryModel.findByIdAndDelete(id);
    if (!result) return next(new AppError(`Subcategory not found`, 404));

    res.json({
        message: "success",
        result
    });
});