import mongoose from "mongoose";
const countrySchema  = mongoose.Schema(
    {
        name: String,
        code: String,
      });
      
 
export const countryModel = mongoose.model("country", countrySchema );
