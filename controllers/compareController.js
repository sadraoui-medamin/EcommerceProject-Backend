import User from "../models/userModel.js";

const toggleCompareProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId =  req.body.userId
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.compareProducts.indexOf(productId);

    if (index > -1) {
      user.compareProducts.splice(index, 1); // remove product
    } else {
      user.compareProducts.push(productId); // add product
    }

    await user.save();

    res.status(200).json({
      message: index > -1 ? "Removed from compares" : "Added to compares",
      favorites: user.compareProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error toggling compares", error });
  }
};

const getCompareProducts = async (req, res) => {
  const userId   = req.body?.userId;
  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, data: user.compareProducts });
  } catch (error) {
    res.status(500).json({ message: "Failed to get compares products", error });
  }
};

export { toggleCompareProduct, getCompareProducts };
