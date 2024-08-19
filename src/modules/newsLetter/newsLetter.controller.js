import {
    newsLetterModel
} from "../../../dataBase/models/newsLetter.model.js";
import {
    catchAsyncError
} from "../../middleWare/catchAsyncError.js";
import {
    APIFeatures
} from "../../utilities/APIFeatures.js";

export const emailsForNewsLetter = catchAsyncError(async (req, res) => {

    const {
        email
    } = req.body;

    let result = new newsLetterModel(req.body);

    await result.save();


    res.json({
        message: "success",
        result
    });
});
export const getAllEmails = catchAsyncError(async (req, res) => {

    try {
        let apiFeatures = new APIFeatures(
                newsLetterModel.find(), req.query)
            .paginate()
            .filter()
            .selectedFields()
            .search()
            .sort();

        let result = await apiFeatures.mongooseQuery;
        res.json({
            message: "success",
            result
        });
    } catch (error) {
        res.status(500).json({
            message: "Error converting currency",
            error,
        });
    }
});