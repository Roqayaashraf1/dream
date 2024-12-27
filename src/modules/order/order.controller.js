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
} from "../../utilities/appError.js";
import {
  orderModel
} from "../../../dataBase/models/order.model.js";
import sendEmail from "../../utilities/sendEmail.js";
import {
  userModel
} from "../../../dataBase/models/user.model.js";
import {
  FatoorahServices
} from "../../services/fatoorahServices.js";
import * as factory from "../handlers/factor.handler.js";
import { APIFeatures } from "../../utilities/APIFeatures.js";
const fatoorahServices = new FatoorahServices();
export const deletorder = factory.deleteOne(orderModel);
export const createCashOrder = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.id).populate("cartItems.product");
  if (!cart) return next(new AppError("Cart not found", 404));
  const user = await userModel.findById(req.user._id);
  if (!user) return next(new AppError("User not found", 404));

  const {
    currency
  } = req.headers;
  const {
    shippingAddress
  } = req.body;
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
    PaymentMethod: req.body.PaymentMethod || "cash", // Dynamically set from the request
    isPaid: "PENDING",
    isDelivered: false,
  });
  await order.save();

  if (order) {
    const options = cart.cartItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product._id
        },
        update: {
          $inc: {
            quantity: -item.quantity,
            sold: item.quantity
          }
        },
      },
    }));
    await productModel.bulkWrite(options);
    await cartModel.findByIdAndDelete(req.params.id);

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
    const emailSubject = "Your Order Details";
    const emailMessage = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order, ${user.name}</p>
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
      return res.status(500).json({
        message: "Failed to send order confirmation email",
        error
      });
    }
  }

  res.json({
    message: "Order created successfully",
    order
  });
});

export const getSpecificOrder = catchAsyncError(async (req, res, next) => {
  let orders = await orderModel
    .find({
      user: req.user._id
    })
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

  res.status(200).json({
    message: "success",
    orders: ordersWithExchange
  });
});

export const getAllOrders = catchAsyncError(async (req, res, next) => {
  try {
    let filter = { isPaid: 'SUCCESS' };  
    if (req.query.userId) {
      filter.user = req.query.userId; 
    }
    if (req.query.status) {
      filter.status = req.query.status; 
    }

    // Prepare the query without pagination
    let apiFeatures = new APIFeatures(orderModel.find(filter), req.query)
      .filter()
      .search()
      .sort()
      .selectedFields();

    let orders = await apiFeatures.mongooseQuery
      .populate({
        path: 'cartItems.product',  
      })
      .populate({
        path: 'user',  
        select: 'name email',
      });

    const ordersWithExchange = orders.map((order) => ({
      ...order._doc,
      user: {
        name: order.user.name,
        email: order.user.email,
      },
      cartItems: order.cartItems.map((item) => ({
        ...item._doc,
        priceExchanged: item.priceExchanged,  
      })),
    }));

    res.status(200).json({
      message: "success",
      orders: ordersWithExchange,
    });

  } catch (error) {
    next(error);
  }
});



export const getOrder = catchAsyncError(async (req, res, next) => {
  const {
    id
  } = req.params;
  let result = await orderModel.findById(id).populate({
    path: 'cartItems.product'
  }).populate({
    path: 'user',
    select: 'name email'
  });

  if (!result) return next(new AppError(`Order not found`, 404));
  res.json({
    message: "success",
    result
  });
});
export const pay = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new AppError("Cart not found", 404));

  const user = await userModel.findById(req.user._id);
  if (!user) return next(new AppError("User not found", 404));

  const { currency } = req.headers;
  const { shippingAddress } = req.body;
  const totalPrice = cart.totalPrice;
  const cartItemsWithExchange = cart.cartItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
    priceExchanged: item.priceExchanged,
   
  }));

  const pendingOrder = await orderModel.findOne({
    user: req.user._id,
    isPaid: 'PENDING',
  });

  if (pendingOrder) {
    await pendingOrder.deleteOne();
  }
  const paymentData = {
    CustomerName: user.name,
    NotificationOption: "LNK",
    InvoiceValue: totalPrice,
    CustomerEmail: user.email,
    CallBackUrl: "http://localhost:3500/api/v1/orders/callback",
    ErrorUrl: "http://localhost:3500/api/v1/orders/error",
    Language: "en",
    DisplayCurrencyIna: currency || "KWD",
  };

  try {
    const response = await fatoorahServices.sendPayment(paymentData);

    if (response && response.IsSuccess) {
      const { InvoiceURL, InvoiceId } = response.Data;

      const newOrder = new orderModel({
        user: req.user._id,
        cartItems: cartItemsWithExchange,
        totalPrice,
        totalPriceExchanged: cart.totalPriceExchanged, 
        currency: currency || "KWD",
        shippingAddress,
        invoiceId: InvoiceId,
        invoiceURL: InvoiceURL,
        isPaid: 'PENDING',
      });

      await newOrder.save();

      return res.json({
        message: "Payment initiated successfully",
        redirectUrl: InvoiceURL,
        orderId: newOrder._id,
      });
    } else {
      return res.status(500).json({ error: "Payment initiation failed." });
    }
  } catch (error) {
    return res.status(500).json({ error: "Error initiating payment." });
  }
});


export const callback = catchAsyncError(async (req, res) => {
  console.log("Incoming Callback Request:", req.headers);
  const {
    paymentId
  } = req.query;

  if (!paymentId) {
    return res.status(400).json({
      error: "Payment ID is missing."
    });
  }

  try {
    // Prepare the request to get the payment status
    const data = {
      Key: paymentId,
      KeyType: "PaymentId"
    };
    console.log("Request Data:", data);

    const response = await fatoorahServices.getPaymentStatus(data);
    console.log("Payment Status Response:", response);

    if (!response || !response.IsSuccess) {
      console.error("Failed to retrieve payment status:", response);
      return res.status(500).json({
        error: "Failed to retrieve payment status."
      });
    }

    const {
      InvoiceId,
      InvoiceStatus,
      InvoiceValue
    } = response.Data;
    console.log("Invoice Status:", InvoiceStatus);
    console.log("Invoice Value:", InvoiceValue);

    // Retrieve the order using InvoiceId or paymentId
    const order = await orderModel.findOne({
      invoiceId: InvoiceId
    });
    console.log("Retrieved Order:", order);

    if (!order) {
      return res.status(404).json({
        error: "Order not found."
      });
    }

    if (InvoiceStatus === "Paid") {
      // Verify the InvoiceValue matches the order's total price
      if (InvoiceValue === order.totalPrice) {
     
        order.isPaid = "SUCCESS"; 
        order.paidAt = new Date();  
        await order.save();
        console.log("Order updated successfully:", order);

        const options = order.cartItems.map((item) => ({
          updateOne: {
            filter: {
              _id: item.product
            },
            update: {
              $inc: {
                quantity: -item.quantity,
                sold: item.quantity
              }
            },
          },
        }));

        await productModel.bulkWrite(options);
        console.log("Product stock updated successfully.");

        // Delete the cart after successful payment
        await cartModel.findOneAndDelete({
          user: order.user
        });
        console.log("Cart deleted successfully.");

        // Redirect to success page
        return res.redirect("http://localhost:3000/success");
      } else {
        // Amount mismatch
        console.error("Amount mismatch: Expected", order.totalPriceExchanged, "but got", InvoiceValue);
        return res.redirect(`http://localhost:3000/error?message=amountMismatch`);
      }
    } else {
      // Handle other invoice statuses (e.g., Pending, Canceled)
      console.error("Invoice Status:", InvoiceStatus);
      return res.redirect(`http://localhost:3000/error?message=${InvoiceStatus.toLowerCase()}`);
    }
  } catch (error) {
    console.error("Error handling callback:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});




export const error = catchAsyncError(async (req, res, next) => {
  const {
    paymentId
  } = req.query;
  if (!paymentId) {
    return res.status(400).json({
      error: "Payment ID is missing."
    });
  }
  console.log("Handling error with paymentId:", paymentId); // Debugging log


  try {
    // Prepare the request to get the payment status
    const data = {
      Key: paymentId,
      KeyType: "PaymentId",
    };

    // Call the MyFatoorah API to check the payment status
    const response = await fatoorahServices.getPaymentStatus(data);
    const {
      InvoiceId
    } = response.Data;
    const order = await orderModel.findOne({
      invoiceId: InvoiceId
    });
    console.log("Retrieved Order:", order);

    if (!order) {
      return res.status(404).json({
        error: "Order not found."
      });
    }
    order.isPaid = "PENDING"; // Mark the order as paid
    order.paidAt = new Date();

    order.save();

    console.log("Error route payment status response:", response); // Debugging log
    console.log(
      "Error route transaction status response:",
      response.Data.InvoiceTransactions[0]
    ); // Debugging log
    console.log(
      "Error route transaction status response:",
      response.Data.InvoiceTransactions[0].TransactionStatus
    ); // Debugging log

    if (!response || !response.IsSuccess) {
      return res
        .status(500)
        .json({
          error: "Failed to retrieve payment status.",
          status: false
        });
    }

    const {
      InvoiceStatus
    } = response.Data;

    // Validate the payment response and handle different cases
    if (InvoiceStatus === "Pending") {
      return res.redirect(`http://localhost:3000/error?message=pending`);
    }
    if (InvoiceStatus === "Canceled") {
      return res.redirect(`http://localhost:3000/error?message=canceled`);
    }
    // Additional error handling
  } catch (error) {
    console.error("Error handling error route:", error.message);
    return res.status(500).json({
      error: "Internal Server Error"
    });
  }
})