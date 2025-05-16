import mongoose from "mongoose";

const websiteInfoSchema = new mongoose.Schema({
  siteName: { type: String, required: true },
  logo: { type: String, required: false },
  favicon: { type: String, required: false },
  contactEmail: { type: String, required: false },
  contactPhone: { type: String, required: false },
  address: { type: String, required: false }
}, { timestamps: true });

export default  mongoose.model("WebsiteInfoSetting", websiteInfoSchema);
