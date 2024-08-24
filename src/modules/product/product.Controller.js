import axios from "axios";
import slugify from "slugify";
import {
  productModel
} from "../../../dataBase/models/product.model.js";
import {
  catchAsyncError
} from "../../middleWare/catchAsyncError.js";
import {
  APIFeatures
} from "../../utilities/APIFeatures.js";
import {
  AppError
} from "../../utilities/appError.js";
import {
  getExchangeRate
} from "../../utilities/getExchangeRate.js";
import * as factory from "../handlers/factor.handler.js";


const convertPrices = async (products, currency) => {
  if (!currency || currency === "KWD") {
    return products;
  }

  try {
    const exchangeRate = await getExchangeRate(currency);
    return products.map((item) => ({
      ...item._doc,
      price: (item.price * exchangeRate).toFixed(2),
      priceAfterDiscount: (item.priceAfterDiscount * exchangeRate).toFixed(2),
      currency,
      createdAt: new Date(item.createdAt).toLocaleString()
    }));
    
   
  } catch (error) {
    throw new Error("Error converting currency");
  }
};

export const createproduct = catchAsyncError(async (req, res) => {

  req.body.image = req.file.filename;
  const {
    title,
    description,
    price,
    quantity,
    author,
    category,
    papersnumber,
    Subcategory
  } = req.body;

  req.body.slug = slugify(title);
  req.body.priceAfterDiscount = price;
  let result = new productModel(req.body);
  console.log(result)

  await result.save();

  const {
    currency
  } = req.headers;
  const convertedProduct = await convertPrices([result], currency);

  res.json({
    message: "success",
    result: convertedProduct[0]
  });
});

export const getAllproducts = catchAsyncError(async (req, res) => {
  let apiFeatures = new APIFeatures(
      productModel.find()
      .populate('category')
      .populate('Subcategory')
      .populate('author'),
      req.query
    )
    .paginate()
    .filter()
    .selectedFields()
    .search()
    .sort();

  let result = await apiFeatures.mongooseQuery;
  const {
    currency
  } = req.headers;

  try {
    const convertedProducts = await convertPrices(result, currency);
    res.json({
      message: "success",
      page: apiFeatures.page,
      result: convertedProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error converting currency",
      error,
    });
  }
});


export const getproduct = catchAsyncError(async (req, res, next) => {
  const {
    id
  } = req.params;
  let result = await productModel.findById(id)
    .populate('category')
    .populate('Subcategory')
    .populate('author');
  if (!result) return next(new AppError("Product not found", 404));

  const {
    currency
  } = req.headers;
  const convertedProduct = await convertPrices([result], currency);

  res.json({
    message: "success",
    result: convertedProduct[0],
    category: result.category,
    subcategory: result.Subcategory,
    author: result.author
  });
});

export const UpdateProduct = catchAsyncError(async (req, res, next) => {
  const {
    id
  } = req.params;
  const {
    title,
    price,
    quantity,
    description
  } = req.body;
  let result = await productModel.findByIdAndUpdate(
    id, 
      req.body, {
      new: true
    }
  );
  if (!result) return next(new AppError("Product not found", 404));

  const {
    currency
  } = req.headers;
  const convertedProduct = await convertPrices([result], currency);

  res.json({
    message: "success",
    result: convertedProduct[0]
  });
});

export const deleteproduct = factory.deleteOne(productModel);
export const search = catchAsyncError(async (req, res) => {
  let apiFeatures = new APIFeatures(productModel.find(), req.query)
    .paginate()
    .filter()
    .selectedFields()
    .search()
    .sort();

  let result = await apiFeatures.mongooseQuery;
  const {
    currency
  } = req.headers;

  try {
    const convertedProducts = await convertPrices(result, currency);
    res.json({
      message: "success",
      page: apiFeatures.page,
      result: convertedProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error converting currency",
      error
    });
  }
});




