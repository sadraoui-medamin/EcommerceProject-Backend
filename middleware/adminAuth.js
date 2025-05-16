import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    console.log(token)
    // Check if token exists
    if (token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized for Login Retry",
      });
    }

    // Verify the token
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the decoded token matches admin credentials
    if (
      token_decode.email !== process.env.ADMIN_EMAIL ||
      token_decode.password !== process.env.ADMIN_PASS
    ) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized for Login Retry",
      });
    }

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
