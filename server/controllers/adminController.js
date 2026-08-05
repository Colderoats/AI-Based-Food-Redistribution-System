import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// ===========================
// Admin Login
// ===========================

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM ADMIN WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: admin.admin_id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      token,
      admin: {
        admin_id: admin.admin_id,
        admin_name: admin.admin_name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===========================
// Dashboard Statistics
// ===========================

export const getDashboard = async (req, res) => {
  try {
    const businessCount = await pool.query(
      "SELECT COUNT(*) FROM FOOD_BUSINESS"
    );

    const ngoCount = await pool.query(
      "SELECT COUNT(*) FROM NGO"
    );

    const surplusCount = await pool.query(
      "SELECT COUNT(*) FROM surplus_food"
    );

    const donationCount = await pool.query(
      "SELECT COUNT(*) FROM donation"
    );

    res.status(200).json({
      success: true,
      dashboard: {
        businesses: Number(businessCount.rows[0].count),
        ngos: Number(ngoCount.rows[0].count),
        surplusListings: Number(surplusCount.rows[0].count),
        donations: Number(donationCount.rows[0].count),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===========================
// Get All Businesses
// ===========================

export const getAllBusinesses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        business_id,
        business_name,
        business_type,
        email,
        phone,
        address,
        created_at
       FROM FOOD_BUSINESS
       ORDER BY business_name`
    );

    res.status(200).json({
      success: true,
      total: result.rows.length,
      businesses: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===========================
// Get All NGOs
// ===========================

export const getAllNGOs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        ngo_id,
        ngo_name,
        registration_number,
        email,
        phone,
        address,
        created_at
       FROM NGO
       ORDER BY ngo_name`
    );

    res.status(200).json({
      success: true,
      total: result.rows.length,
      ngos: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
