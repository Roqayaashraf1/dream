import express from "express";
import {
  dbConnection
} from "./dataBase/dbConnection.js";
import morgan from "morgan";
import cors from "cors";
import {
  userRouter
} from "./src/modules/users/user.Router.js";
import {
  authRouter
} from "./src/modules/auth/auth.Router.js";
import {
  globalErrorMiddleware
} from "./src/middleWare/globalErrorMiddleware.js";
import {
  categoryRouter
} from "./src/modules/category/category.Router.js";
import {
  productRouter
} from "./src/modules/product/product.Router.js";
import {
  authorRouter
} from "./src/modules/author/author.router.js";
import {
  orderRouter
} from "./src/modules/order/order.router.js";
import {
  cartRouter
} from "./src/modules/cart/cart.Router.js";
import {
  wishlistrouter
} from "./src/modules/wishlist/wishlist.Router.js";
import {
  countryrouter
} from "./src/modules/country/country.router.js";
import {
  SubcategoryRouter
} from "./src/modules/subcategory/subcategory.router.js";
import {
  AppError
} from "./src/utilities/appError.js";
import {
  newsLetterRouter
} from "./src/modules/newsLetter/newsLetter.router.js";
import {
  offerRouter
} from "./src/modules/offer/offer.router.js";
import { popupRouter } from "./src/modules/popup/popup.router.js";
const app = express();
const port = 3500;
app.use(express.json());
app.use(cors());



app.use(morgan("dev"));
app.use(express.static("uploads"));
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/authors", authorRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/wishlist", wishlistrouter);
app.use("/api/v1/country", countryrouter);
app.use("/api/v1/subcategory", SubcategoryRouter);
app.use("/api/v1/newsletter", newsLetterRouter);
app.use("/api/v1/offers", offerRouter);
app.use("/api/v1/popup", popupRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`can't find this route: ${req.originalUrl}`, 404));
});
app.use(globalErrorMiddleware);
dbConnection();
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection", err);
});