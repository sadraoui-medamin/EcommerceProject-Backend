import express from "express";
import { createAdmin, listAdmins, editAdmin, deleteAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/create", createAdmin);
router.get("/list", listAdmins);
router.put("/edit", editAdmin);
router.delete("/delete/:id", deleteAdmin);

export default router;
