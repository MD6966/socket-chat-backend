const bcrypt = require("bcrypt");
const { db } = require("../db/index");
const { ApiError } = require("../utils/ApiError");

const findUserByEmail = async (email) => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);
    return rows;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw new ApiError(500, "Database error occurred while retrieving user.");
  }
};
const findUserByUniqueKey = async (uniqueKey) => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM users WHERE unique_key = ?", [uniqueKey]);
    return rows;
  } catch (error) {
    console.error("Error finding user by unique key:", error);
    throw new ApiError(500, "Database error occurred while retrieving user.");
  }
};
const createUser = async (name, email, password, role) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role]
      );
    // Return the inserted user's information, including the new `id`

    return {
      id: result.insertId,
      name,
      email,
      role,
    };
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const user = await db
      .promise()
      .query("DELETE FROM users WHERE id = ?", [userId]);

    if (user.affectedRows === 0) {
      throw new Error("User not found or already deleted.");
    }

    return userId;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, name, email, password, role) => {
  try {
    let query = "UPDATE users SET ";
    let values = [];

    // Build the query dynamically based on the provided fields
    if (name) {
      query += "name = ?, ";
      values.push(name);
    }
    if (email) {
      query += "email = ?, ";
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += "password = ?, ";
      values.push(hashedPassword);
    }
    if (role) {
      query += "role = ?, ";
      values.push(role);
    }

    // Remove the trailing comma and space
    query = query.slice(0, -2);
    query += " WHERE id = ?";

    values.push(id);

    // Execute the query
    const [result] = await db.promise().query(query, values);

    if (result.affectedRows === 0) {
      throw new Error("User not found or no changes made.");
    }

    // Return the updated user information
    return { id, name, email, role };
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT id,name,email,role FROM users");
    return rows;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT id,name,email,role FROM users WHERE id = ?", [userId]); // Fetch user by ID
    return rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findUserByEmail,
  createUser,
  deleteUser,
  updateUser,
  getAllUsers,
  getUserById,
  findUserByUniqueKey,
};
