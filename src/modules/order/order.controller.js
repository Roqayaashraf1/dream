import axios from "axios";
import { cartModel } from "./models/Cart.js";
import { orderModel } from "./models/Order.js";
import { productModel } from "./models/Product.js";
import { catchAsyncError } from "./utils/catchAsyncError.js";
import { AppError } from "./utils/appError.js";

const getExchangeRate = async (currency) => {
  const response = await axios.get(
    "https://api.exchangerate-api.com/v4/latest/KWD"
  );
  return response.data.rates[currency];
};

export const createCashOrder = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new AppError("Cart not found", 404));

  const { currency } = req.headers;
  let totalOrderPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;

  if (currency && currency !== "KWD") {
    try {
      const exchangeRate = await getExchangeRate(currency);
      totalOrderPrice = (totalOrderPrice * exchangeRate).toFixed(2);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error converting currency", error });
    }
  }

  const order = new orderModel({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice,
    currency: currency || "KWD",
    shippingAddress: req.body.shippingAddress,
  });

  await order.save();
  if (order) {
    const options = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
      },
    }));
    await productModel.bulkWrite(options);
    await cartModel.findByIdAndDelete(req.params.id);
  }

  res.json({ message: "Order created successfully", order });
});
