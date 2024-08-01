import {
  productModel
} from "../../../dataBase/models/product.model.js";
import {
  cartModel
} from "../../../dataBase/models/cart.model.js";

import {
  catchAsyncError
} from "../../middleWare/catchAsyncError.js";
import {
  AppError
} from "../../utilities/AppError.js";
import {
  orderModel
} from "../../../dataBase/models/order.model.js";
import sendEmail from "../../utilities/sendEmail.js";
export const createCashOrder = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.id).populate("cartItems.product");
  if (!cart) return next(new AppError("Cart not found", 404));

  const { currency } = req.headers;
  const shippingAddress = req.body.shippingAddress;
  const totalPriceExchanged = cart.totalPriceExchanged;
  const cartItemsWithExchange = cart.cartItems.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.price,
    priceExchanged: item.priceExchanged,
  }));

  const order = new orderModel({
    user: req.user._id,
    cartItems: cartItemsWithExchange,
    totalPrice: cart.totalPrice,
    totalPriceExchanged: totalPriceExchanged,
    currency: currency || "KWD",
    shippingAddress,
    PaymentMethod: "cash",
    isPaied: false,
    isDelivered: false,
  });

  await order.save();

  if (order) {
    const options = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
      },
    }));
    await productModel.bulkWrite(options);
    await cartModel.findByIdAndDelete(req.params.id);

    const { street, building, area, floor, apartment, city, phone, country } = shippingAddress;
    const emailSubject = "Your Order Details";
    const emailMessage = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p><strong>Total Price </strong> ${totalPriceExchanged.toFixed(2)} ${currency}</p>
      <p><strong>Shipping Address:</strong><br>
        Street: ${street}<br>
        Building: ${building}<br>
        Area: ${area}<br>
        Floor: ${floor}<br>
        Apartment: ${apartment}<br>
        City: ${city}<br>
        Phone: ${phone}<br>
        Country: ${country}
      </p>
    `;
    try {
      const emailSent = await sendEmail({
        to: req.user.email,
        subject: emailSubject,
        message: emailMessage,
      });

      if (!emailSent) {
        console.error("Failed to send order confirmation email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ message: "Failed to send order confirmation email", error });
    }
  }

  res.json({ message: "Order created successfully", order });
});

export const getSpecificOrder = catchAsyncError(async (req, res, next) => {
  let orders = await orderModel
    .find({ user: req.user._id })
    .populate("cartItems.product");

  const ordersWithExchange = orders.map((order) => {
    const cartItemsWithExchange = order.cartItems.map((item) => ({
      ...item._doc,
      priceExchanged: item.priceExchanged,
    }));

    return {
      ...order._doc,
      cartItems: cartItemsWithExchange,
      totalPriceExchanged: order.totalPriceExchanged, 
    };
  });

  res.status(200).json({ message: "success", orders: ordersWithExchange });
});

export const getAllOrders = catchAsyncError(async (req, res, next) => {
  let orders = await orderModel.find().populate("cartItems.product");

  const ordersWithExchange = orders.map((order) => ({
    ...order._doc,
    cartItems: order.cartItems.map((item) => ({
      ...item._doc,
      priceExchanged: item.priceExchanged,
    })),
  }));

  res.status(200).json({ message: "success", orders: ordersWithExchange });
});
