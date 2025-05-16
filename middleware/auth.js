import jwt from "jsonwebtoken";

/**
 * Authentication middleware to verify the user's token.
 * Ensures the request is authorized and attaches the user ID to the request body.
 */
const authMiddleware = async (req, res, next) => {
    const { token } = req.headers; // Extract token from headers
      // Check if token is provided
      if (!token) {
        return res.json({
          success: false,
          message: "Not authorized. Please log in again.",
        });
      }
      try {
        // Verify the token using JWT
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user ID from the decoded token to the request body
        req.body.userId = decodedToken.id;
        // Proceed to the next middleware or route handler
        next();
      } catch (error) {
        console.error("Error during token verification:", error.message);
        res.json({
          success: false,
          message: "Authorization error",
        });
      }
};

export default authMiddleware;
