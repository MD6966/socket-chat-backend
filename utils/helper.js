const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { log } = require("console");

const verifyPassword = async (enteredPassword, storedHashedPassword) => {
  try {
    return await bcrypt.compare(enteredPassword, storedHashedPassword);
  } catch (error) {
    throw new Error("Password verification failed.");
  }
};

const generateAuthToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7D",
  });
  return token;
};

const getConfigFile = (fileName) => {
  const configPath = path.resolve(process.cwd(), "config", fileName);

  // Log the resolved path for debugging
  // console.log("Resolved Config Path:", configPath);

  // Check if the file exists

  try {
    // Dynamically require the file and return its exported value
    const config = require(configPath);
    return config;
  } catch (err) {
    return { error: `Error reading the file "${fileName}": ${err.message}` };
  }
};

module.exports = { verifyPassword, generateAuthToken, getConfigFile };
