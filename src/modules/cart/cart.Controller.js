import { getExchangeRate } from '../../utilities/getExchangeRate.js';
import { catchAsyncError } from '../../middleWare/catchAsyncError.js';
import { AppError } from '../../utilities/AppError.js';
import { productModel } from '../../../dataBase/models/product.model.js';
import { cartModel } from '../../../dataBase/models/cart.model.js';

function calcTotalPrice(cart, exchangeRate = 1) {
  let totalprice = 0;
  cart.cartItems.forEach((item) => {
    totalprice += item.quantity * item.price * exchangeRate;
  });
  cart.totalPrice = totalprice.toFixed(2);
}

export const addToCart = catchAsyncError(async (req, res, next) => {
  const { product: productId, quantity = 1 } = req.body;

  const product = await productModel.findById(productId);
  if (!product) return next(new AppError("Product not found", 401));

  if (product.quantity < quantity) {
    return next(new AppError("Insufficient product quantity", 400));
  }

  req.body.price = product.price;

  let cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    const newCart = new cartModel({
      user: req.user._id,
      cartItems: [{ ...req.body, quantity }],
    });
    calcTotalPrice(newCart);
    await newCart.save();
    return res.json({ message: "success", result: newCart });
  }

  const existingItem = cart.cartItems.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    if (product.quantity < existingItem.quantity + quantity) {
      return next(new AppError("Insufficient product quantity", 400));
    }
    existingItem.quantity += quantity;
  } else {
    if (product.quantity < quantity) {
      return next(new AppError("Insufficient product quantity", 400));
    }
    cart.cartItems.push({ ...req.body, quantity });
  }

  calcTotalPrice(cart);
  await cart.save();

  res.json({ message: "success", cart });
});

export const removeProductFromCart = catchAsyncError(async (req, res, next) => {
  let result = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.itemId } } },
    { new: true }
  );
  if (!result) return next(new AppError(`item not found`, 401));
  calcTotalPrice(result);
  await result.save();
  res.json({ message: "success", result });
});

export const updateQuantity = catchAsyncError(async (req, res, next) => {
  let product = await productModel.findById(req.params.id).select("price");
  if (!product) return next(new AppError("product not found", 401));
  let cart = await cartModel.findOne({ user: req.user._id });
  let item = cart.cartItems.find((elm) => elm.product == req.params.id);
  if (item) {
    item.quantity = req.body.quantity;
  }
  calcTotalPrice(cart);
  await cart.save();
  res.json({ message: "success", cart });
});

export const getloggedusercart = catchAsyncError(async (req, res, next) => {
  const { currency } = req.headers;
  const exchangeRate = await getExchangeRate(currency) || 1; // Fetch exchange rate based on currency header

  let cartItems = await cartModel
    .findOne({ user: req.user._id })
    .populate("cartItems.product");

  if (!cartItems) return next(new AppError("Cart not found", 404));

  calcTotalPrice(cartItems, exchangeRate); // Apply exchange rate

  res.status(201).json({ message: "success", cart: cartItems });
});
