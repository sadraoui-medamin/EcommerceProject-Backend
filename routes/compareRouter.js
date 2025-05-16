// routes/userRoutes.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import { toggleCompareProduct, getCompareProducts } from "../controllers/compareController.js";

const router = express.Router();

router.post("/toggle", authMiddleware, toggleCompareProduct);
router.get("/getAll", authMiddleware, getCompareProducts);

export default router;
