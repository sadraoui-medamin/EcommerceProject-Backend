// routes/userRoutes.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import { toggleFavoriteProduct, getFavoriteProducts } from "../controllers/favoriteProductsController.js";

const router = express.Router();

router.post("/toggle", authMiddleware, toggleFavoriteProduct);
router.get("/getAll", authMiddleware, getFavoriteProducts);

export default router;
