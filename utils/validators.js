const { ApiError } = require("./ApiError");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_ORDERS_KEYS = [
  "ship_from",
  "ship_to",
  "category",
  "quantity",
  "markup",
  "price",
];

const validateRegistration = (username, email, password, role) => {
  if (!username || !email || !password || !role) {
    return "All fields are required.";
  }

  if (!emailRegex.test(email)) {
    return "Invalid email format.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null;
};

const validateLogin = (email, password) => {
  if (!email || !password) {
    return "Email and password are required.";
  }

  if (!emailRegex.test(email)) {
    return "Invalid email format.";
  }

  return null;
};

const validateOrderItems = (orders) => {
  const errors = {};

  // Iterate over orders and check for missing keys
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    for (const key of REQUIRED_ORDERS_KEYS) {
      if (!order[key]) {
        // If the key is missing, track it in the errors object
        if (!errors[key]) {
          errors[key] = 0;
        }
        errors[key]++;
      }
    }
  }

  // If errors exist, return a string with all the missing keys
  if (Object.keys(errors).length > 0) {
    const missingFields = Object.keys(errors).join(", ");
    return `Validation error: The ${missingFields} fields are required.`;
  }

  return null;
};

module.exports = { validateRegistration, validateLogin, validateOrderItems };
