// Add a review
import Review from "../models/reviewModel.js";

const addReview =  async (req, res) => {
    const { id_product, rate, comment } = req.body;
    const userId = req.body.userId;
    if (rate == null ,!id_product || !userId || !comment) {
      return res.status(400).json({ error: "id_product, userId, rate ,and comment are required." });
    }
  
    try {
      const newReview = new Review({ id_product, idUser: userId, rate, comment,date: Date.now() });
      await newReview.save();
      res.status(201).json({ message: "Review added successfully", review: newReview });
    } catch (error) {
      res.status(500).json({ error: "Failed to add review", details: error.message });
    }
  };
  
  // Remove a review
  const removeReview =  async (req, res) => {
    const { id } = req.body; // Extract product ID from the body
    console.log(req.body);
    console.log(id);
    if (!id) {
      return res.status(400).json({ success: false, message: "Review ID is required" });
    }
  
    try {
      const deletedReview = await Review.findByIdAndDelete(id);
      if (!deletedReview) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.status(200).json({ message: "Review removed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove review", details: error.message });
    }
  };
  
  // List all reviews
  const listAllReview = async (req, res) => {
    try {
      const reviews = await Review.find();
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews", details: error.message });
    }
  };
  
  // Update a review
  const updateReview = async (req, res) => {
    const { id } = req.body;
    const { rate, comment } = req.body;
    try {
      const updatedReview = await Review.findByIdAndUpdate(
        id,
        { rate, comment },
        { new: true, runValidators: true }
      );
  
      if (!updatedReview) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.status(200).json({ message: "Review updated successfully", review: updatedReview });
    } catch (error) {
      res.status(500).json({ error: "Failed to update review", details: error.message });
    }
  };

export { addReview, removeReview ,listAllReview ,updateReview};
