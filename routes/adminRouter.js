import express from "express";
import { adminLogin,createAdmin, listAdmins, editAdmin, deleteAdmin ,getAdmin } from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/login", adminLogin); // Admin login
router.post("/create", createAdmin);
router.get("/list", listAdmins);
router.put("/edit", editAdmin);
router.delete("/delete/:id", deleteAdmin);
router.get("/getAdmin", adminAuth,getAdmin);

export default router;
