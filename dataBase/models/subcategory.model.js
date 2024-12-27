import mongoose from "mongoose";

const SubcategorySchema = mongoose.Schema({
    englishname: {
        type: String,
        unique: [true, "name is required"],
        trim: true
    },
    arabicname: {
        type: String,
        unique: [true, "name is required"],
        trim: true
    },
    slug: {
        type: String,
        lowercase: true,
        required: true,
    },category: {
        type: mongoose.Types.ObjectId,
        ref: "category",
        required: [true, " subcategory required"],
      },
}, {
    timestamps: true,
});

export const SubcategoryModel = mongoose.model('Subcategory', SubcategorySchema);
