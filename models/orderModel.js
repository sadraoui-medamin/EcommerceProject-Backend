import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Product Loading" }, // Fixed misplaced bracket
  date: { type: Date, default: Date.now }, // date of create order
  payment: { type: Boolean, default: false },
  payementDate: {type: Date, require :false},// date of payment  order
  paymentMethode:  { type: String, required: true },
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
