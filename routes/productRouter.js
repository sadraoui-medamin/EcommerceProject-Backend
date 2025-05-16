import express from "express";
import { addProduct, findProduct, listProduct, removeProduct,updateProduct } from "../controllers/productController.js";
import upload from "../middleware/multer.js";


// Set up Router
const productRouter = express.Router();

// Routes
// Routes
productRouter.post("/add", upload, addProduct);
productRouter.put("/update", upload, updateProduct);
productRouter.get("/findProduct", findProduct);
productRouter.get("/list", listProduct);
productRouter.delete("/remove", removeProduct);

export default productRouter;
