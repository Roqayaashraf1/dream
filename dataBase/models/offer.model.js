
import mongoose from "mongoose";
const offerSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

export const OfferModel = mongoose.model('offer', offerSchema);

