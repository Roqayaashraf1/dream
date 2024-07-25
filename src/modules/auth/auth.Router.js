import express from "express";

import * as auth from "./auth.Controller.js";

const authRouter = express.Router();

authRouter.post("/signup", auth.signup);
authRouter.post("/signin", auth.signin);
authRouter.patch("/forgetpassword",auth.forgetPassword)
authRouter.patch('/resetpassword/:token',auth.resetPasword)

export { authRouter };
