import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// 📌 **1. List All Products**
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find();
    res.json({ success: true, products: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch products", error: error.message });
  }
};

// 📌 **2. Find a Single Product by ID**
const findProduct = async (req, res) => {
  try {
    const { id } = req.query; // Get product ID from query
    if (!id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to find product", error: error.message });
  }
};


// 📌 **3. Update a Product**
const updateProduct = async (req, res) => {
  try {
    const { id ,name, info, price, discount, category, subCategory, subSubCategory, popular, brand, status } = req.body;
    let details = typeof req.body.details === 'string' 
      ? JSON.parse(req.body.details) 
      : req.body.details;

    // Validate required fields
    if (!id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (!info) {
      return res.status(400).json({ success: false, message: "info is required." });
    }
    if (!price) {
      return res.status(400).json({ success: false, message: "Price is required." });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required." });
    }
    if (!subCategory) {
      return res.status(400).json({ success: false, message: "Sub-category is required for selected category." });
    }
   
    if (!brand) {
      return res.status(400).json({ success: false, message: "Brand is required." });
    }

    // remove the olds of product  images and description section of product.details from the database
    // Prepare updated product data
    const updatedData = {
      name,
      info,
      price: Number(price),
      category,
      subCategory,
      subSubCategory,
      brand,
      status,
      discount: Number(discount),
      popular: popular,
      images: [],
      details: {
        ...details,
        DescriptionSection: [], // Ensure DescriptionSection is empty array
      },
      date: Date.now(),
    };
    // //store the empty images and details.descriptionsection    
    // let updatedProduct = await productModel.findByIdAndUpdate(id, updatedData, { new: true });
    // Store the new updated details.DescriptionSection
    
    // Parse details if it's a string
    if (typeof details === 'string') {
      details = JSON.parse(details);
    }
    const newDescription = [];
    details.DescriptionSection.forEach((item, index) => {
      // If the itemImage is a file (from req.files), upload it to Cloudinary
      if (req.body[`descriptionImage${index + 1}`]) {
        // If the image is in req.body (e.g., as a URL or base64 string)
        newDescription.push({
          ...item,
          itemImage: req.body[`descriptionImage${index + 1}`], // Use the value from req.body
          itemDescription: item.itemDescription,
        });
      } else
      if (req.files) {
        const file = req.files.find(file => file.fieldname === `descriptionImage${index + 1}`);
        newDescription.push({
          ...item,
          itemImage: file, // Use the found file or undefined if not found
          itemDescription: item.itemDescription,
        });
      }
      else {
        newDescription.push(item);
      }
    });



    // Upload images to Cloudinary and update the DescriptionSection
    updatedData.details.DescriptionSection = await Promise.all(
      newDescription.map(async (item) => {
          // If the itemImage is a file (from req.files), upload it to Cloudinary
          const filePath =item?.itemImage.path;
          let result = await cloudinary.uploader.upload(filePath, {
            resource_type: "image",
          });
          return {
            ...item,
            itemImage: result.secure_url, // Replace the file with the Cloudinary URL
          };
      })
    );
    console.log("Updated DescriptionSection : ", updatedData.details.DescriptionSection);


    //store the new updated images
    // Handle Image Uploads
    const imagesFiles = [];
    if (req.files) {
      for (const file of req.files) {
        if (file.fieldname.startsWith('image')) {
            imagesFiles.push(file);
           }
      }
    }else if (req.body.startsWith('image')) {
       const imagesbody = req.body.startsWith('image');
      for (const img of imagesbody) {
            imagesFiles.push(img);
          }
    }
    // Upload images to Cloudinary
    let imagesUrl = await Promise.all(
      imagesFiles.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );
    //store the new updated images
     updatedData.images = [...imagesUrl];




    // Remove undefined fields
    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key]
    );
    // Update product in the database
   const  updatedProduct = await productModel.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product update failed." });
    }

    res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Failed to update product", error: error.message });
  }
};

// 📌 **4. Remove a Product**
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body; // Extract product ID from the body
    if (!id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const deletedProduct = await productModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found or already removed" });
    }

    res.json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to remove product", error: error.message });
  }
};

// 📌 **5. Adding a product

const addProduct = async (req, res) => {
  try {
    const { name, info, price, discount, category, subCategory, subSubCategory, popular, brand, status, details } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (!info) {
      return res.status(400).json({ success: false, message: "Description is required." });
    }
    if (!price) {
      return res.status(400).json({ success: false, message: "Price is required." });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required." });
    }
    if (!subCategory) {
      return res.status(400).json({ success: false, message: "Sub-category is required for selected category." });
    }
    // if (!subSubCategory) {
    //   return res.status(400).json({ success: false, message: "Sub-sub-category is required for selected sub-category." });
    // }
    if (!brand) {
      return res.status(400).json({ success: false, message: "Brand is required." });
    }

    // Receive the new images
    const image1 = req.files?.find(file => file.fieldname === 'image1');
    const image2 = req.files?.find(file => file.fieldname === 'image2');
    const image3 = req.files?.find(file => file.fieldname === 'image3');
    const image4 = req.files?.find(file => file.fieldname === 'image4');

    const imagess = [image1, image2, image3, image4].filter((item) => item !== undefined);
    console.log("imagess : ", imagess);

    let imagesUrl = await Promise.all(
      imagess.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    // Process description section images
    const descriptionImages = req.files.filter(file => file.fieldname.startsWith('descriptionImage'));
    console.log(descriptionImages)
    let descriptionImagesUrl = await Promise.all(
      descriptionImages.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    // Parse details and add description images
    const parsedDetails = JSON.parse(details);
    if (parsedDetails.DescriptionSection) {
      parsedDetails.DescriptionSection = parsedDetails.DescriptionSection.map((item, index) => ({
        ...item,
        itemImage: descriptionImagesUrl[index] || null,
      }));
    }

    const productData = {
      name,
      info,
      price: Number(price),
      category,
      subCategory,
      subSubCategory,
      brand,
      status,
      popular: popular === "true",
      images: imagesUrl,
      discount: Number(discount),
      date: Date.now(),
      details: parsedDetails,
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "✅ Product successfully added!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "❌ Failed to add product.", error: error.message });
  }
};



export { addProduct, listProduct, findProduct, updateProduct, removeProduct };
