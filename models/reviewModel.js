// MongoDB Review Schema
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    id_product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Products" },
    idUser: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Users" },
    rate: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now },
  });
  
  const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
  export default Review