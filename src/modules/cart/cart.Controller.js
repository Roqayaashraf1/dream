import { getExchangeRate } from '../../utilities/getExchangeRate.js';
import { catchAsyncError } from '../../middleWare/catchAsyncError.js';
import { AppError } from '../../utilities/AppError.js';
import { productModel } from '../../../dataBase/models/product.model.js';
import { cartModel } from '../../../dataBase/models/cart.model.js';

async function calcTotalPrice(cartItems, currency) {
  let totalPrice = 0;
  let totalPriceExchanged = 0;
  const exchangeRate = await getExchangeRate(currency);

  const newItems = cartItems.map((item) => {
    const itemTotalPrice = item.price * item.quantity;
    const itemTotalPriceExchanged = itemTotalPrice * exchangeRate;
    totalPrice += itemTotalPrice;
    totalPriceExchanged += itemTotalPriceExchanged;

    return {
      ...item,
      priceExchanged: item.price * exchangeRate,
    };
  });

  return { totalPrice, totalPriceExchanged, newItems };
}






export const addToCart = catchAsyncError(async (req, res, next) => {
  const { product: productId, quantity = 1 } = req.body;
  const currency = req.headers.currency;
  const product = await productModel.findById(productId);
  if (!product) return next(new AppError("Product not found", 401));

  if (product.quantity < quantity) {
    return next(new AppError("Insufficient product quantity", 400));
  }

  req.body.price = product.price;

  let cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    cart = new cartModel({
      user: req.user._id,
      cartItems: [{ ...req.body, quantity }],
    });
    const { totalPrice, totalPriceExchanged, newItems } = await calcTotalPrice(cart.cartItems, currency);
    cart.cartItems = newItems;
    cart.totalPrice = totalPrice;
    cart.totalPriceExchanged = totalPriceExchanged;
    await cart.save();
    return res.json({ message: "success", result: cart });
  }

  const existingItem = cart.cartItems.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    if (product.quantity < existingItem.quantity + quantity) {
      return next(new AppError("Insufficient product quantity", 400));
    }
    existingItem.quantity += quantity;
    existingItem.price = product.price; // Update the price
  } else {
    if (product.quantity < quantity) {
      return next(new AppError("Insufficient product quantity", 400));
    }
    cart.cartItems.push({ ...req.body, quantity });
  }

  const { totalPrice, totalPriceExchanged, newItems } = await calcTotalPrice(cart.cartItems, currency);
  cart.cartItems = newItems;
  cart.totalPrice = totalPrice;
  cart.totalPriceExchanged = totalPriceExchanged;
  await cart.save();

  res.json({ message: "success", cart });
});

export const removeProductFromCart = catchAsyncError(async (req, res, next) => {
  const currency = req.headers.currency;
  let result = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.id } } },
    { new: true }
  );
  if (!result) return next(new AppError(`Item not found`, 401));

  const { totalPrice, totalPriceExchanged, newItems } = await calcTotalPrice(result.cartItems, currency);
  result.cartItems = newItems;
  result.totalPrice = totalPrice;
  result.totalPriceExchanged = totalPriceExchanged;
  await result.save();

  res.json({ message: "success", result });
});

export const updateQuantity = catchAsyncError(async (req, res, next) => {
  const currency = req.headers.currency;
  let product = await productModel.findById(req.params.id).select("price");
  if (!product) return next(new AppError("Product not found", 401));

  let cart = await cartModel.findOne({ user: req.user._id });
  let item = cart.cartItems.find((elm) => elm.product.toString() === req.params.id);
  if (item) {
    item.quantity = req.body.quantity;
    item.price = product.price; // Update the price
  }

  const { totalPrice, totalPriceExchanged, newItems } = await calcTotalPrice(cart.cartItems, currency);
  cart.cartItems = newItems;
  cart.totalPrice = totalPrice;
  cart.totalPriceExchanged = totalPriceExchanged;
  await cart.save();

  res.json({ message: "success", cart });
});

export const getLoggedUserCart = catchAsyncError(async (req, res, next) => {
  const { currency } = req.headers;

  let cart = await cartModel
    .findOne({ user: req.user._id })
    .populate("cartItems.product");

  if (!cart) return next(new AppError("Cart not found", 404));

  const { totalPrice, totalPriceExchanged, newItems } = await calcTotalPrice(cart.cartItems, currency);
  cart.cartItems = newItems;
  cart.totalPrice = totalPrice;
  cart.totalPriceExchanged = totalPriceExchanged;

  res.status(201).json({ message: "success", cart });
});

