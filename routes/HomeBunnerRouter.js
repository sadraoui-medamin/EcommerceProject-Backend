import express from "express";
import { addHomeBunner, getHomeBunners, deleteHomeBunner, updateHomeBunner } from "../controllers/homeBunnersController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/add", upload, addHomeBunner);
router.get("/list", getHomeBunners);
router.delete("/delete", deleteHomeBunner);
router.put("/update", upload, updateHomeBunner);

export default router;
