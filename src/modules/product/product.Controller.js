import axios from 'axios';
import slugify from 'slugify';
import { productModel } from '../../../dataBase/models/product.model.js';
import { catchAsyncError } from '../../middleWare/catchAsyncError.js';
import { APIFeatures } from '../../utilities/APIFeatures.js';
import { AppError } from '../../utilities/AppError.js';


const getExchangeRate = async (currency) => {
  const response = await axios.get('https://api.exchangerate-api.com/v4/latest/KWD');
  return response.data.rates[currency];
};

export const createproduct = catchAsyncError(async (req, res) => {
  req.body.slug = slugify(req.body.title);
  req.body.image = req.file.filename;
  const { description, price, quantity, author, category } = req.body;
  let result = new productModel(req.body);
  await result.save();
  res.json({ message: 'success', result });
});

export const getAllproducts = catchAsyncError(async (req, res) => {
  let apiFeatures = new APIFeatures(productModel.find(), req.query)
    .paginate()
    .filter()
    .selectedFields()
    .search()
    .sort();

  let result = await apiFeatures.mongooseQuery;
  console.log(result);
  const { currency } = req.headers;

  if (!currency || currency === 'KWD') {
    return res.json({ message: 'success', page: apiFeatures.page, result });
  }

  try {
    const exchangeRate = await getExchangeRate(currency);
    const convertedProducts = result.map(item => ({
      ...item._doc,
      price: (item.price * exchangeRate).toFixed(2),
      currency,
      createdAt: new Date(item.createdAt).toLocaleString(),
    }));

    res.json({ message: 'success', page: apiFeatures.page, result: convertedProducts });
  } catch (error) {
    res.status(500).json({ message: 'Error converting currency', error });
  }
});

export const getproduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let result = await productModel.findById(id);
  if (!result) return next(new AppError('Product not found', 404));
  res.json({ message: 'success', result });
});

export const UpdateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  let result = await productModel.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    { new: true }
  );
  if (!result) return next(new AppError("Product not found", 404));
  res.json({ message: "success", result });
});

export const deleteproduct = factory.deleteOne(productModel);
