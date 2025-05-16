import userModel from "../models/userModel.js";

// 📌 **1. Add items to the user's cart
const addToCart = async (req, res) => {
  const userId = req.body.userId;
  try {
    let userData = await userModel.findById(userId);
    let cartData = userData.cartData;
    if (!cartData[req.body.itemId]) {
      // If not, add it to the cart with a quantity of 1
      cartData[req.body.itemId] = 1;
    } else {
      // If the item is already in the cart, increase its quantity by 1
      cartData[req.body.itemId] += 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Added to Cart" });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// 📌 **2. Remove items from the user's cart
const removeFromCart = async (req, res) => {
  const userId = req.body.userId;
  try {
    let userData = await userModel.findById(userId);
    let cartData = userData.cartData;

    // Check if the item exists in the cart
    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId] -= 1;

      // If the item quantity reaches 0, remove it from the cart
      if (cartData[req.body.itemId] === 0) {
        delete cartData[req.body.itemId]; // Remove item from cart
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Removed From Cart" });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};
// 📌 **3. Update items from the user's cart

const updateQuantity = async (req, res) => {
  try {
    // req.body.userId is set by your auth middleware
    const { itemId, quantity } = req.body;
    let userData = await userModel.findById(req.body.userId);
    let cartData = userData.cartData;

    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }

    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.json({ success: false, message: "Error updating cart" });
  }
};

// 📌 **4. Fetch the user's cart data
const getCart = async (req, res) => {
  const userId = req.body.userId;

  try {
    let userData = await userModel.findById(userId);
    let cartData = userData?.cartData;
      console.log("cartData",cartData);
    res.json({ success: true, cartData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

export { addToCart, removeFromCart, getCart,updateQuantity };
