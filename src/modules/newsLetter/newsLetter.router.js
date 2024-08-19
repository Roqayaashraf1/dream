import express from "express";
import { emailsForNewsLetter, getAllEmails } from "./newsLetter.controller.js";

const newsLetterRouter = express.Router();
newsLetterRouter.route("/").get( getAllEmails).post(emailsForNewsLetter);
export { newsLetterRouter };
