import Admin from "../models/adminModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
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

export {createAdmin , listAdmins ,editAdmin ,deleteAdmin}
