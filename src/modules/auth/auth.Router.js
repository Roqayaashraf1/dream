import express from "express";

import * as auth from "./auth.Controller.js";
import { checkCurrency } from "../country/country.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", checkCurrency, auth.signup);
authRouter.post("/signin",checkCurrency, auth.signin);
authRouter.post("/logout",checkCurrency,auth.logout);
authRouter.patch("/forgetpassword",auth.forgetPassword)
authRouter.patch('/resetpassword',auth.resetPassword)

export { authRouter };
