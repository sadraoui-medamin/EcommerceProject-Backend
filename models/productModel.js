import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Product name
  info: { type: String, required: true }, // Product name
  details: { type: Object, required: true }, // Flexible details for each product type
  price: { type: Number, required: true }, // Product price
  images: { type: [String], required: true }, // Array of image URLs
  category: { type: String, required: true }, // Main category (e.g., Computer, Phones & Tablets)
  subCategory: { type: String }, // Subcategory (e.g., Pc normal, Phone accessories)
  subSubCategory: { type: String }, // Sub-subcategory (e.g., Portable Gamer PC, Charger)
  popular: { type: Boolean, default: false }, // Is the product popular?
  brand: { type: String, required: true }, // Brand name
  discount: { type: Number, default: 0 }, // Discount percentage
  status: { type: String, required: true }, // Product status
  createdAt: { type: Date, default: Date.now } // Product creation date
});

// Create the Product model
const productModel = mongoose.models.Product || mongoose.model("Product", productSchema);
export default productModel;
