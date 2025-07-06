import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
   const { token } = req.headers; // Extract token from headers
      // Check if token is provided
      if (!token) {
        return res.json({
          success: false,
          message: "Not authorized. Please log in again.",
        });
      }

    // Verify the token
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    // return unique email from the token 
    req.body.email = token_decode.email;

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error in adminAuth middleware:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default adminAuth;
