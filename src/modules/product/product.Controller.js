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
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "/uploads/product");

fs.mkdirSync(uploadDir, { recursive: true });

export const deleteproduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const product = await productModel.findById(id);
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  if (product.image) {
    const imagePath = path.join(uploadDir, product.image);
    try {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image file:", err);
        } else {
          console.log("Image deleted successfully.");
        }
      });
    } catch (error) {
      console.error("Error during image deletion:", error);
    }
  }

  await productModel.findByIdAndDelete(id);

  res.json({
    message: "Product and associated image deleted successfully",
  });
});



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
    ).filter()
    .search();
  const totalProducts = await productModel.countDocuments(apiFeatures.mongooseQuery.getFilter());

  const totalPages = Math.ceil(totalProducts / 20);
  apiFeatures.paginate().sort().selectedFields();

  let result = await apiFeatures.mongooseQuery;

  const {
    currency
  } = req.headers;

  try {
    const convertedProducts = await convertPrices(result, currency);
    res.json({
      message: "success",
      totalProducts,
      totalPages,
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

// export const UpdateProduct = catchAsyncError(async (req, res, next) => {
//   const {
//     id
//   } = req.params;

//   let result = await productModel.findByIdAndUpdate(
//     id,
//     req.body, {
//       new: true
//     }
//   );
//   if (!result) return next(new AppError("Product not found", 404));

//   const {
//     currency
//   } = req.headers;
//   const convertedProduct = await convertPrices([result], currency);

//   res.json({
//     message: "success",
//     result: convertedProduct[0]
//   });
// });
export const UpdateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
 console.log(req.params)
  // Find the product to update
  let product = await productModel.findById(id);
  if (!product) return next(new AppError("Product not found", 404));

  // Handle file upload
  if (req.file) {
    const newFileName = req.file.filename;

    // Delete old image if exists
    if (product.image) {
      const oldImagePath = path.join(uploadDir, product.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Delete the old image
      }
    }

    // Update the image field with the new file name
    req.body.image = newFileName;
  }
console.log(req.body)
  // Update the product details in the database
  let updatedProduct = await productModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  res.json({
    message: "success",
    updatedProduct,
  });
});

export const search = catchAsyncError(async (req, res) => {
  let apiFeatures = new APIFeatures(productModel.find(), req.query)
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