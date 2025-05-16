import WebsiteInfo from "../models/aboutUsModel.js";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";

const getWebsiteInfo = async (req, res) => {
  try {
    const info = await WebsiteInfo.findOne(); // only one document
    res.json({message:"sucess" ,data:info});
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const updateWebsiteInfo = async (req, res) => {
  try {
    const { siteName, contactEmail, contactPhone, address } = req.body;

    // Multer gives files as an object with keys matching field names
    const logoFile = req.files?.find(file => file.fieldname === "logo");
    const faviconFile = req.files?.find(file => file.fieldname === "favicon");

    //exxtrat old data
    let oldData = await WebsiteInfo.findOne();

    if (oldData) {
      // Update existing record
      const updatedData = {
        siteName: siteName ?? oldData.siteName,
        contactEmail: contactEmail ?? oldData.contactEmail,
        contactPhone: contactPhone ?? oldData.contactPhone,
        address: address ?? oldData.address,
        logo: oldData.logo,
        favicon: oldData.favicon,
      };
      // upload files  to cloudinary
      if (logoFile) { 
        const result = await cloudinary.uploader.upload(logoFile.path, {
          resource_type: "image",
        });
        updatedData.logo = result.secure_url;
      }
      if (faviconFile) {
        const result = await cloudinary.uploader.upload(faviconFile.path, {
          resource_type: "image",
        });
        updatedData.favicon = result.secure_url;
      }

      const updated = await WebsiteInfo.findByIdAndUpdate(oldData._id, updatedData, { new: true });
      return res.json({ message: "Successfully updated", data: updated });
    } else {
      // Create new record
      let logoUrl = "";
      let faviconUrl = "";

      if (logoFile) {
        const result = await cloudinary.uploader.upload(logoFile.path, {
          resource_type: "image",
        });
        logoUrl = result.secure_url;
      }

      if (faviconFile) {
        const result = await cloudinary.uploader.upload(faviconFile.path, {
          resource_type: "image",
        });
        faviconUrl = result.secure_url;
      }

      const created = await WebsiteInfo.create({
        siteName,
        logo: logoUrl,
        favicon: faviconUrl,
        contactEmail,
        contactPhone,
        address,
      });

      return res.json({ message: "Successfully created", data: created });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Update failed" });
  }
};


export  { getWebsiteInfo, updateWebsiteInfo };
