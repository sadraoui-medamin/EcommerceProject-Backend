import express from "express";
import authMiddleware from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { 
        adminLogin, loginUser, registerUser,forgetPassword,editPassword,
        updateUser, deleteUser,getuser,getUserById,getAllUsers,
        unbanUser,banUser
    } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/admin", adminLogin); // Admin login
userRouter.post("/register", registerUser); // Register user
userRouter.post("/login", loginUser); // Login user
userRouter.post("/delete",authMiddleware, deleteUser);  // Delete user
userRouter.put("/update",upload, updateUser); // Update user
userRouter.post("/editPassword",authMiddleware,editPassword); // Edit password
userRouter.post("/forgetPassword", forgetPassword); // Reset password
userRouter.get("/getuser", authMiddleware, getuser); // Get user by token
userRouter.get("/getuserById", getUserById); // Get user by ID
userRouter.get("/getallusers", getAllUsers); // Get all users
userRouter.put("/banUser", banUser); // ban user
userRouter.put("/unbanUser", unbanUser); // unban user

export default userRouter;
