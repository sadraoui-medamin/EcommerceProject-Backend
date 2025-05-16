import HomeBunner from "../models/homeBunners.js";
import { v2 as cloudinary } from "cloudinary";

/**
 * @desc Add a new HomeBunner (product ID + image)
 * @route POST /api/homebunners
 */
export const addHomeBunner = async (req, res) => {
  try {
    const { productId } = req.body;

    // ✅ Use req.file instead of req.files
    const image =  req.files?.find(file => file.fieldname === 'image') || null;
    console.log("Received Image:", image);
    if (!image) return res.status(400).json({ message: "No image uploaded" });

    // ✅ Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image.path);
    const imageUrl = result.secure_url;

    // ✅ Correctly set the `image` field
    const newBunner = new HomeBunner({ productId, image: imageUrl });
    await newBunner.save();

    res.status(201).json({ message: "Banner added successfully", newBunner });
  } catch (error) {
    console.error("Error in Backend:", error);
    res.status(500).json({ message: "Error adding banner", error });
  }
};



/**
 * @desc Get all HomeBunners
 * @route GET /api/homebunners
 */
export const getHomeBunners = async (req, res) => {
  try {
    const bunners = await HomeBunner.find();
    res.status(200).json({success :true ,HomeBanners : bunners});
  } catch (error) {
    res.status(500).json({ message: "Error fetching banners", error });
  }
};

/**
 * @desc Delete a HomeBunner
 * @route DELETE /api/homebunners/:id
 */
export const deleteHomeBunner = async (req, res) => {
  try {
        const { id } = req.body; // Extract product ID from the body
        if (!id) {
          return res.status(400).json({ success: false, message: "Bunner ID is required" });
        }
        const deletedBunner =  await HomeBunner.findByIdAndDelete(id);
        if (!deletedBunner) {
          return res.status(404).json({ success: false, message: "Bunner not found or already removed" });
        }
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting banner", error });
  }
};

/**
 * @desc Update a HomeBunner
 * @route PUT /api/homebunners/:id
 */
export const updateHomeBunner = async (req, res) => {
    try {
        const { bannerId } = req.body; // Banner ID
        const { productId } = req.body; // New Product ID (if changed)

        // Find existing banner
        let banner = await HomeBunner.findById({ _id : bannerId });
        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }

        let imageUrl = banner.image; // Keep existing image if not updating

        // Check if a new image is uploaded
        const image =  req.files?.find(file => file.fieldname === 'image') || null;
        if (image) {
            // Upload new image to Cloudinary
            const uploadedImage = await cloudinary.uploader.upload(image.path);

            imageUrl = uploadedImage.secure_url; // Get new image URL

            // Optional: Delete old image from Cloudinary (if stored there)
            const oldImagePublicId = banner.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`home_banners/${oldImagePublicId}`);
        }

        // Update banner details
        banner.productId = productId || banner.productId;
        banner.image = imageUrl;
        await banner.save();

        res.status(200).json({ message: "Banner updated successfully", banner });
    } catch (error) {
        console.error("Error updating banner:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
