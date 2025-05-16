import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    profileImage: { type: String, required: false },
    name: { type: String, required: true },
    prename: { type: String, required: false },
    address : { type: String, required: false },
    sexe: { type: String, required: false },
    phone: { type: String, required: false },
    birthday: { type: Date, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
     // ✅ Add default false ban field
    ban: { type: Boolean, default: false },

    // Shopping cart data for the user (optional, defaults to an empty object)
    cartData: { type: Object, default: {} },
    // favoriteProductsList
    favoritesProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // CompareProductsList
    compareProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,   // ← add this
    // Prevent removal of empty objects from the database
    minimize: false,
  }
);

// Check if the model already exists; if not, create it
const userModel = mongoose.models.user || mongoose.model("User", userSchema);

export default userModel;
