import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";

// Function to create a JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "5d" }); // Set an expiration for security
};

// Login User Function
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }
    if (user.ban) {
      return res.status(409).json({ message: "Your account has been banned." });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Create and send token
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Error during login" });
  }
};

// Register User Function
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    // Check password strength
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

     await newUser.save();

    // Create and send token
    const token = createToken(userModel._id);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Error during registration" });
  }
};


// Update User Function
const updateUser = async (req, res) => {
  try {
    // Take everything from req.body except userId
    const { userId,name,prename, address, sexe, phone, birthday, email } = req?.body; 
    console.log("req.?body"  , req?.body);
    console.log("req.body"  , req.body);
    const oldUser = await userModel.findById(userId);

    if (!oldUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Check if email is already in use by another user
    const emailExists = await userModel.findOne({ email });
    if (emailExists && emailExists._id.toString() !== userId) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }
    console.log("new data from boddy",userId,name,prename, address, sexe, phone, birthday, email);
    let newUserData = oldUser.toObject();
    console.log("oldUser backend:", newUserData);

    // Update with new values or keep old    
     newUserData = {
       ...newUserData, // Spread the old user data
       // Update only the fields that are provided in the request body
       name: name ?? oldUser.name,
       prename: prename ?? oldUser.prename,
       address: address ?? oldUser.address,
       sexe: sexe ?? oldUser.sexe,
       phone: phone ?? oldUser.phone,
       birthday: birthday ?? oldUser.birthday,
       email: email ?? oldUser.email,
    };
    
    console.log("New User Data after update:", newUserData);
    // Handle profile image if uploaded
    const newImage = req.files?.find(file => file.fieldname === "profileImage");
    console.log("New Image:", newImage);
    if (newImage) {
      const result = await cloudinary.uploader.upload(newImage.path, {
        resource_type: "image",
      });
      newUserData.profileImage = result.secure_url;
    }
    console.log("New User Data after image upload:", newUserData.profileImage);

    const updatedUser = await userModel.findByIdAndUpdate(userId, newUserData, {
      new: true, // Return the updated document
    });

    res.json({
      success: true,
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Error updating user" });
  }
};


// Delete User Function
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

// Edit Password
 const editPassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }
  if (newPassword === oldPassword) {
    return res.status(400).json({ message: "New password cannot be the same as old password" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  const userId = req.body.userId; 
  const user = await userModel.findById(userId);

  if (!user) return res.status(404).json({ message: "User not found" });
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });
  if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords don't match" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword; // update password
  //save the new password
  await user.save();
  res.json({ message: "Password updated successfully" });
};

// Forget Password
const forgetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required" });
  }

  if (newPassword?.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "Email not found" });
  }

  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    return res.status(400).json({ message: "New password cannot be the same as old password" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password reset successful" });
};
// Get User
const getuser = async (req, res) => {
  const userId = req.body.userId; 
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

//Get user by id
const getUserById = async (req, res) => {
  const { id } = req.query; // Get product ID from query
  try {
    if (!id) {
      return res.status(400).json({ success: false, message: " ID is required" });
    }   
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};
//get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};
// PUT /api/user/banUser
const banUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "User ID is required." });

  try {
    const user = await userModel.findByIdAndUpdate(userId, { ban: true }, { new: true });

    if (!user) return res.status(404).json({ error: "User not found." });

    res.status(200).json({ message: "User banned successfully", user });
  } catch (err) {
    console.error("Ban user error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
// PUT /api/user/unbanUser
const unbanUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "User ID is required." });

  try {
    const user = await userModel.findByIdAndUpdate(userId, { ban: false }, { new: true });

    if (!user) return res.status(404).json({ error: "User not found." });

    res.status(200).json({ message: "User unbanned successfully", user });
  } catch (err) {
    console.error("Unban user error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
export { loginUser, registerUser,forgetPassword,editPassword, updateUser, deleteUser,getuser,getUserById,getAllUsers,banUser,unbanUser };
