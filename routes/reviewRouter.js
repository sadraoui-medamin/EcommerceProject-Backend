import express from "express";
import {addReview, listAllReview, removeReview, updateReview } from "../controllers/reviewController.js";
import authMiddleware from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.delete("/remove", removeReview);
reviewRouter.get("/list", listAllReview);
reviewRouter.put("/update", updateReview);

export default reviewRouter;
