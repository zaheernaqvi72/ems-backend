import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const secretKey1 = process.env.JWT_SECRET 

const authenticateJWT = async (req, res, next) => {
  try {
    // Extract the token from cookies or headers
    const token = req.cookies.access_token || (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

    // If no token is found, respond with Unauthorized
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token required" });
    }

    // Verify the token
    const decodedToken = jwt.verify(token, secretKey1);

    // Find the user by ID, excluding password and refresh_token fields
    const user = await User.findOne({
      where: { id: decodedToken.id },
      attributes: { exclude: ["password", "refresh_token"] }
    });

    // If no user is found, respond with Unauthorized
    if (!user) {
      return res.status(401).json({ message: "Unauthorized, user not found" });
    }

    // Attach user to the request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error authenticating user:", error);

    // If token verification fails, send a 401 status
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export default authenticateJWT;
