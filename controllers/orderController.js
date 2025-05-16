import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing user   or frontend
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5174";
  try {
    const userId= req.body.userId;
    // Create a new order
    const newOrder = new orderModel({
      user: userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      paymentMethode: req.body.paymentMethode, // Add this line to include the payment method
    });
    await newOrder.save();
    // Clear user cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Prepare line items for Stripe
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd", // Adjust currency as needed
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // Stripe expects the amount in cents
      },
      quantity: item.quantity,
    }));

    // Add delivery charges to line items
    line_items.push({
      price_data: {
        currency: "usd", // Adjust currency as needed
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 10 * 100, // Example delivery charge
      },
      quantity: 1,
    });

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error placing the order" });
  }
};

// Verify order
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error verifying the order" });
  }
};
// User orders for frontend
const userOrders = async (req, res) => {
  const userId= req.body.userId;
  try {
    // Fetch orders for the specific user
    const orders = await orderModel.find({ userId: userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error); // Log the error for debugging
    res.json({ success: false, message: "Error fetching user orders" });
  }
};

// Listing orders for admin panel
const listOrders = async (req, res) => {
  try {
    // Fetch all orders for admin panel
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error); // Log the error for debugging
    res.json({ success: false, message: "Error fetching orders for admin" });
  }
};

// API for updating order status
const updateStatus = async (req, res) => {
  try {
    // Update the order status using the order ID
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error); // Log the error for debugging
    res.json({ success: false, message: "Error updating status" });
  }
};



export { verifyOrder, placeOrder ,userOrders ,listOrders , updateStatus};
