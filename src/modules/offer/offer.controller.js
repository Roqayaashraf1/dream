import {
    OfferModel
} from "../../../dataBase/models/offer.model.js";
import {
    productModel
} from "../../../dataBase/models/product.model.js";
import {
    catchAsyncError
} from "../../middleWare/catchAsyncError.js";


export const createoffer = catchAsyncError(async (req, res, next) => {
    const {
        productId,
        discount,
        startDate,
        endDate
    } = req.body;

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
        startDate,
        endDate,
    });
    await offer.save();
   
      

    res.status(201).json({
        message: 'success',
        offer
    });
})