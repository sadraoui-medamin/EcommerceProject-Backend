import Admin from "../models/adminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Admin Login 
const adminLogin = async (req, res) => {
  try {
    console.log(" :: /"+req.body);
    const { email, password } = req.body;
  

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Check if email and password of the (Grand Master)
    if (email === process.env.GrandMaster_EMAIL && password === process.env.GrandMaster_PASS) {
      const token = jwt.sign(
        { email }, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: '5d' } // Token expiration (5 day)
      );
      return res.status(200).json({ success: true, token, role: "Grand Master", name: "Grand Master" });
    }
    // Check if the admin exists in the database
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, admin.password);
    if (isMatch) {
      // Generate a JWT token for the admin
      const token = jwt.sign(
        { email}, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: '5d' } // Token expiration (5 days)
      );
      // Return the token and admin details
      return res.status(200).json({ success: true, token, role: admin.role, name: `${admin.name} ${admin.lastName}` });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Create Admin
 const createAdmin = async (req, res) => {
  try {
    const { name, lastName,phone, email, password, role } = req.body;

    if (!name || !lastName || !phone || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already exists" });
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

    const newAdmin = new Admin({ name, lastName, email,phone , password :hashedPassword, role });
    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// List All Admins
 const listAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Edit Admin
const editAdmin = async (req, res) => {
  try {
    const { id, name, lastName, email, phone, password, role } = req.body;

    // Basic validation
    if (!name || !lastName || !phone || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    const updateData = { name, lastName, email, phone, role };

    // If password is provided and non-empty, validate and hash it
    if (password && password.trim() !== "") {
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
      console.log("Password changed");
    } else {
      console.log("Password not changed");
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Delete Admin
 const deleteAdmin = async (req, res) => {
  try { 
    const { id } = req.params;
      console.log(id);
    const deletedAdmin = await Admin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get admin  by token from the request header
const getAdmin = async (req, res) => {
  try {
    const email = req.body.email; // Assuming Id is set by auth middleware
    
    // Check if email of the (Grand Master) return info of the grand Master
    if (email === process.env.GrandMaster_EMAIL){
      res.status(200).json({ name : "Grand Master" , role:'Grand Master'});
    }
    // if  the admin of the type  (Master/admin)
    else {
      const admin = await Admin.findOne({email}).select("-password");
      if (!email || !admin)  {
        return res.status(404).json({ message: "Admin not found" });
      }
      res.status(200).json(admin);
    }
  } catch (error) {
    console.error("Error fetching admin info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};  

export {adminLogin,createAdmin , listAdmins ,editAdmin ,deleteAdmin , getAdmin}
