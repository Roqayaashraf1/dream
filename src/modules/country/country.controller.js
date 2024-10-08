import {
  countryModel
} from "../../../dataBase/models/country.model.js";
import {
  catchAsyncError
} from "../../middleWare/catchAsyncError.js";

export const getAllCountries = catchAsyncError(async (req, res) => {
  const countries = await countryModel.find({});
  res.json(countries);
});
export const checkCurrency = catchAsyncError(async (req, res, next) => {
  try {

      // Ensure guest has currency set in the request
      const { currency } = req.headers;
      if (!currency) {
        return res.status(400).json({
          message: 'Currency required for guest'
        });
      }
      req.currency = currency;
    

    next();
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});




export const addcountry = catchAsyncError(async (req, res) => {
  const {
    name,
    code
  } = req.body;

  // Check if both name and code are provided
  if (!name || !code) {
    return res.status(400).json({
      err: 'Name and code are required'
    });
  }

  try {
    const newCountry = new countryModel({
      name,
      code
    });
    await newCountry.save();
    res.status(201).json({
      message: 'Country added successfully',
      country: newCountry
    });
  } catch (error) {
    res.status(500).json({
      err: 'Error adding country',
      error
    });
  }
});