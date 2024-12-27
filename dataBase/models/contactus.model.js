import mongoose from "mongoose";
const contactusSchema = mongoose.Schema({
    email: {
        type: String,
    },
    message: {
        type: String,
    },
    title: {
        type: String
    }
}, {
    timestamps: true
});

export const contactusModel = mongoose.model("contactus", contactusSchema);