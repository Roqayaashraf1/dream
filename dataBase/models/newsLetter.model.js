import mongoose from "mongoose";
const newsLetterSchema = mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: [true, "email required"],
        minLength: 1,
        unique: [true, "email must be required"],
    }
}, {
    timestamps: true
});
export const newsLetterModel = mongoose.model("newsLetter", newsLetterSchema);