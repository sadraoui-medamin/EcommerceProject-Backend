import express from "express";
import { getWebsiteInfo, updateWebsiteInfo }  from "../controllers/aboutUsController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/getInfo",getWebsiteInfo);
router.post("/update", upload ,updateWebsiteInfo);

export default router;

