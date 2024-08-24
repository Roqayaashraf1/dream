import {
    OfferModel
} from "../../../dataBase/models/offer.model.js";
import {
    productModel
} from "../../../dataBase/models/product.model.js";
import {
    catchAsyncError
} from "../../middleWare/catchAsyncError.js";
import { APIFeatures } from "../../utilities/APIFeatures.js";


export const createoffer = catchAsyncError(async (req, res, next) => {
    const {
         productId,
        discount,
        startDate
    } = req.body;
    console.log(req.body)
    const product = await productModel.findById(productId);
    if (!product) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }
    const discountedPrice = product.price - (product.price * discount) / 100;
    product.priceAfterDiscount = discountedPrice;
    await product.save();
    console.log(discountedPrice)
    const offer = new OfferModel({
        product: productId,
        discount,
        startDate
    });
    await offer.save();
   
      

    res.status(201).json({
        message: 'success',
        offer
    });
})
export const getAllOffers = catchAsyncError(async (req, res, next) => {

    let offers = await OfferModel.find()
      .populate('product' )

  
  
    res.status(200).json({ message: "success", offers });
  });
  export const deleteOffer = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const offer = await OfferModel.findByIdAndDelete(id);
    if (!offer) {
        return res.status(404).json({
            message: 'Offer not found',
        });
    }
    const product = await productModel.findById(offer.product);
    if (!product) {
        return res.status(404).json({
            message: 'Product not found',
        });
    }
    product.priceAfterDiscount = product.price;
    await product.save();

    res.status(200).json({
        message: 'Offer deleted successfully',
    });
});
