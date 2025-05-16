import User from "../models/userModel.js";

const toggleFavoriteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId =  req.body.userId
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.favoritesProducts.indexOf(productId);

    if (index > -1) {
      user.favoritesProducts.splice(index, 1); // remove product
    } else {
      user.favoritesProducts.push(productId); // add product
    }

    await user.save();

    res.status(200).json({
      message: index > -1 ? "Removed from favorites" : "Added to favorites",
      favorites: user.favoritesProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error toggling favorite", error });
  }
};

const getFavoriteProducts = async (req, res) => {
  const userId   = req.body.userId;
  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, data: user.favoritesProducts });

  } catch (error) {
    res.status(500).json({ message: "Failed to get favorite products", error });
  }
};

export { toggleFavoriteProduct, getFavoriteProducts };
