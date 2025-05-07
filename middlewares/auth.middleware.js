const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const { db } = require("../db/index");

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // decode the JWT token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Assuming the decoded token contains user ID (_id)
    const [userResult] = await db
      .promise()
      .query("SELECT id,name,email,role FROM users WHERE id = ?", [
        decodedToken._id,
      ]);

    if (!userResult.length === 0) {
      throw new ApiError(401, "Invalid Access Token");
    }
    const user = userResult[0];
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

module.exports = { verifyJWT };
