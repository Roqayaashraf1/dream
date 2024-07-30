import {
  categoryModel
} from "../../../dataBase/models/category.model.js";
import slugify from "slugify";
import {
  AppError
} from "../../utilities/AppError.js";
import * as factory from "../handlers/factor.handler.js";
import {
  APIFeatures
} from "../../utilities/APIFeatures.js";
import {
  catchAsyncError
} from "../../middleWare/catchAsyncError.js";
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
    // Determine language from header or default to 'arabic'
    const languageHeader = req.headers['accept-language'] || 'arabic';
    const language = languageHeader.toLowerCase();
    const languageField = language === 'english' || language.startsWith('en') ? 'englishname' : 'arabicname';
    const slugField = language === 'english' || language.startsWith('en') ? 'englishslug' : 'arabicslug';

    console.log(`Using language field: ${languageField}`); // Debugging

    // Build the query with the appropriate fields
    let apiFeatures = new APIFeatures(categoryModel.find(), req.query)
      .paginate()
      .filter()
      .selectedFields(`${languageField} ${slugField}`)
      .search()
      .sort();
    console.log('Query:', apiFeatures.mongooseQuery.getQuery()); // Log the query being executed

    // Execute the query
    let result = await apiFeatures.mongooseQuery;

    // Transform the result to include only the relevant name and slug fields
    result = result.map(item => {
      const obj = item.toObject();
      return {
        _id: obj._id,
        name: obj[languageField], // Include the relevant name field
        slug: obj[slugField]     // Include the relevant slug field
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
    const {
      id
    } = req.params;
    const language = (req.headers['accept-language'] || 'arabic').toLowerCase();
    const languageField = language.includes('english') ? 'englishname' : 'arabicname';
    console.log(`Using language field: ${languageField}`);
    const query = categoryModel.findById(id).select(`${languageField} slug`);

    console.log('Query details:', query.getQuery ? query.getQuery() : query);

    let result = await query;
    console.log('Query result:', result);

    if (!result) {
      return next(new AppError('Category not found', 404));
    }

    res.json({
      message: 'success',
      result
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