import { getExchangeRate } from '../../utilities/getExchangeRate.js';
import { catchAsyncError } from '../../middleWare/catchAsyncError.js';
import { AppError } from '../../utilities/appError.js';
import { productModel } from '../../../dataBase/models/product.model.js';
import { cartModel } from '../../../dataBase/models/cart.model.js';

async function calcTotalPrice(cartItems, currency) {
  let totalPrice = 0;
  let totalPriceExchanged = 0;
  let totalPriceBeforeDiscount = 0; 
  let totalItems = 0;
  const exchangeRate = await getExchangeRate(currency);

  const sortedItems = cartItems.sort((a, b) => a.priceAfterDiscount - b.priceAfterDiscount);

  let discountedItemsCount = 0;
  const numOfDiscountedItems = Math.floor(sortedItems.reduce((sum, item) => sum + item.quantity, 0) / 3);

  const newItems = sortedItems.map((item) => {
    totalItems += item.quantity;
    const itemTotalPriceBeforeDiscount = item.price * item.quantity;
    totalPriceBeforeDiscount += itemTotalPriceBeforeDiscount * exchangeRate;

    let paidQuantity = item.quantity;

    if (discountedItemsCount < numOfDiscountedItems) {
      const itemsToDiscount = Math.min(item.quantity, numOfDiscountedItems - discountedItemsCount);
      paidQuantity -= itemsToDiscount;
      discountedItemsCount += itemsToDiscount;
    }

    const itemTotalPrice = item.priceAfterDiscount * paidQuantity;
    const itemTotalPriceExchanged = itemTotalPrice * exchangeRate;

    totalPrice += itemTotalPrice;
    totalPriceExchanged += itemTotalPriceExchanged;

    return {
      ...item,
      priceExchanged: item.priceAfterDiscount * exchangeRate,
    };
  });

  return {
    totalPrice,
    totalPriceExchanged,
    totalPriceBeforeDiscount,
    newItems,
  };
}






export const addToCart = catchAsyncError(async (req, res, next) => {
  const { product: productId, quantity = 1 } = req.body;
  const currency = req.headers.currency;
  const product = await productModel.findById(productId);
  if (!product) return next(new AppError("Product not found", 401));

  if (product.quantity < quantity) {
    return next(new AppError("Insufficient product quantity", 400));
  }

  req.body.priceAfterDiscount = product.priceAfterDiscount;
  req.body.price = product.price;

  let cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    cart = new cartModel({
      user: req.user._id,
      cartItems: [{ ...req.body, quantity }],
    });
    const { totalPrice, totalPriceExchanged, totalPriceBeforeDiscount, newItems } = await calcTotalPrice(cart.cartItems, currency);
    cart.cartItems = newItems;
    cart.totalPrice = totalPrice;
    cart.totalPriceExchanged = totalPriceExchanged;
    cart.totalPriceBeforeDiscount = totalPriceBeforeDiscount; // Save the total price before discount
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
    existingItem.priceAfterDiscount = product.priceAfterDiscount;
    existingItem.price = product.price; // Update price
  } else {
    if (product.quantity < quantity) {
      return next(new AppError("Insufficient product quantity", 400));
    }
    cart.cartItems.push({ ...req.body, quantity });
  }

  const { totalPrice, totalPriceExchanged, totalPriceBeforeDiscount, newItems } = await calcTotalPrice(cart.cartItems, currency);
  cart.cartItems = newItems;
  cart.totalPrice = totalPrice;
  cart.totalPriceExchanged = totalPriceExchanged;
  cart.totalPriceBeforeDiscount = totalPriceBeforeDiscount; // Save the total price before discount
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

  const { totalPrice, totalPriceExchanged, totalPriceBeforeDiscount, newItems } = await calcTotalPrice(result.cartItems, currency);
  result.cartItems = newItems;
  result.totalPrice = totalPrice;
  result.totalPriceExchanged = totalPriceExchanged;
  result.totalPriceBeforeDiscount = totalPriceBeforeDiscount;

  await result.save();

  res.json({ message: "success", result });
});


export const updateQuantity = catchAsyncError(async (req, res, next) => {
  const currency = req.headers.currency;

  let product = await productModel.findById(req.params.id).select("price priceAfterDiscount");
  if (!product) return next(new AppError("Product not found", 401));

  let cart = await cartModel.findOne({ user: req.user._id });

  let item = cart.cartItems.find((elm) => elm.product.toString() === req.params.id);
  if (item) {
    item.quantity = req.body.quantity;
    item.priceAfterDiscount = product.priceAfterDiscount;
    item.price = product.price; 
  }

  const { totalPrice, totalPriceExchanged, totalPriceBeforeDiscount, newItems } = await calcTotalPrice(cart.cartItems, currency);
  cart.cartItems = newItems;
  cart.totalPrice = totalPrice;
  cart.totalPriceExchanged = totalPriceExchanged;
  cart.totalPriceBeforeDiscount = totalPriceBeforeDiscount; 

  await cart.save();

  res.json({ message: "success", cart });
});


export const getLoggedUserCart = catchAsyncError(async (req, res, next) => {
  const { currency } = req.headers;

  let cart = await cartModel
    .findOne({ user: req.user._id })
    .populate('cartItems.product'
    );

  if (!cart) return next(new AppError("Cart not found", 404));

  const { totalPrice, totalPriceExchanged, newItems } = await calcTotalPrice(cart.cartItems, currency);
  cart.cartItems = newItems;
  cart.totalPrice = totalPrice;
  cart.totalPriceExchanged = totalPriceExchanged;

  res.status(200).json({ message: "success", cart });
});