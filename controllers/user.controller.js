const {
  findUserByEmail,
  createUser,
  deleteUser,
  updateUser,
  getAllUsers,
  getUserById,
  findUserByUniqueKey,
} = require("../models/user.model");
const { validateRegistration, validateLogin } = require("../utils/validators");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { verifyPassword, generateAuthToken } = require("../utils/helper");

const userRegistration = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Validate input data
  const validationError = validateRegistration(name, email, password, role);
  if (validationError) {
    return next(new ApiError(400, validationError));
  }

  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser.length > 0) {
    return next(new ApiError(400, "Email is already in use."));
  }

  // Create the user
  const data = await createUser(name, email, password, role);

  return res
    .status(201)
    .json(new ApiResponse(201, data, "User registered successfully!"));
});

const userLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input data
  const validationError = validateLogin(email, password);
  if (validationError) {
    return next(new ApiError(400, validationError));
  }

  // Check if user exists
  const user = await findUserByEmail(email);
  if (user.length === 0) {
    return next(new ApiError(400, "Invalid email or password."));
  }

  // Verify password
  const isPasswordCorrect = await verifyPassword(password, user[0].password);
  if (!isPasswordCorrect) {
    return next(new ApiError(400, "Invalid email or password."));
  }

  // Remove password from the user object before sending it in the response
  const { password: _, ...userWithoutPassword } = user[0];

  // Generate authentication token
  const token = generateAuthToken(userWithoutPassword);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: userWithoutPassword, token },
        "Login successful!"
      )
    );
});

const userDeletion = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const existingUser = await getUserById(id);

  if (!existingUser) {
    return next(new ApiError(404, "User not found."));
  }

  await deleteUser(id);
  return res
    .status(200)
    .json(new ApiResponse(200, existingUser, "User deleted successfully!"));
});

const userModification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  const data = await updateUser(id, name, email, password, role);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "User updated successfully!"));
});

const usersList = asyncHandler(async (req, res, next) => {
  const users = await getAllUsers();
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const userById = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const user = await getUserById(userId);
  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});
const userByUniqueKey = asyncHandler(async (req, res, next) => {
  const { unique_key } = req.body;

  // Validate input
  if (!unique_key) {
    return next(new ApiError(400, "Unique key is required."));
  }

  // Find user using service layer
  const user = await findUserByUniqueKey(unique_key);

  // Check if user exists
  if (!user || user.length === 0) {
    return next(new ApiError(404, "No user found with this unique key."));
  }

  // Remove sensitive information from response
  const { password, refreshToken, ...userWithoutSensitiveInfo } = user[0];

  // Return successful response
  return res
    .status(200)
    .json(
      new ApiResponse(200, userWithoutSensitiveInfo, "User found successfully.")
    );
});

module.exports = {
  userRegistration,
  userLogin,
  userDeletion,
  userModification,
  usersList,
  userById,
  userByUniqueKey,
};
