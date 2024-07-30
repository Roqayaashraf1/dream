import mongoose from "mongoose";

const SubcategorySchema = mongoose.Schema({
    englishname: {
        type: String,
        unique: [true, "name is required"],
        trim: true,
        minLength: [2, "too short category name"],
    },
    arabicname: {
        type: String,
        unique: [true, "name is required"],
        trim: true,
        minLength: [2, "too short category name"],
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
