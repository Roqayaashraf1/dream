import { productModel } from "../../../dataBase/models/product.model.js";
import { cartModel } from "../../../dataBase/models/cart.model.js";
import { getExchangeRate } from "../../utilities/getExchangeRate.js";
import { catchAsyncError } from "../../middleWare/catchAsyncError.js";
import { AppError } from "../../utilities/AppError.js";
import { orderModel } from "../../../dataBase/models/order.model.js";
import sendEmail from "../../utilities/sendEmail.js";

export const createCashOrder = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.id).populate("cartItems.product");
  if (!cart) return next(new AppError("Cart not found", 404));

  const { currency } = req.headers;
  const shippingAddress = req.body.shippingAddress;
  const totalPrice = cart.totalPrice; // Ensure `totalPrice` is a field in your cart schema

  const order = new orderModel({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice: totalPrice,
    currency: currency || "KWD",
    shippingAddress,
    PaymentMethod: "cash",
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

    // Extract address details
    const {
      street,
      building,
      area,
      floor,
      apartment,
      city,
      phone,
      country
    } = shippingAddress;

    // Prepare order details for the email
    const emailSubject = "Your Order Details";
    const emailMessage = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p><strong>Total Price:</strong> ${totalPrice} ${currency || "KWD"}</p>
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

    // Send email
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
  let order = await orderModel
    .find({ user: req.user._id })
    .populate("cartItems.product");
  res.status(200).json({ message: "success", order });
});

export const getAllOrders = catchAsyncError(async (req, res, next) => {
  let orders = await orderModel.find().populate("cartItems.product");
  res.status(200).json({ message: "success", orders });
});
