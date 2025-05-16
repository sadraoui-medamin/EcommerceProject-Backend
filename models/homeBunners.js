import mongoose from "mongoose";

const homeBunnerSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  image: { type: String, required: true }, // Store the image URL
}, { timestamps: true });

export default mongoose.model("HomeBunner", homeBunnerSchema);
