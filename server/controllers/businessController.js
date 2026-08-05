import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

// Register Business
export const registerBusiness = async (req, res) => {
  try {
    const {
      business_name,
      business_type,
      email,
      password,
      phone,
      address,
    } = req.body;

    if (
      !business_name ||
      !business_type ||
      !email ||
      !password ||
      !phone ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const existingBusiness = await pool.query(
      `SELECT email FROM FOOD_BUSINESS WHERE LOWER(email) = LOWER($1)
       UNION ALL SELECT email FROM NGO WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (existingBusiness.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Business already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO FOOD_BUSINESS
      (business_name, business_type, email, password, phone, address)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING business_id, business_name, business_type, email`,
      [
        business_name,
        business_type,
        email,
        hashedPassword,
        phone,
        address,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Business registered successfully.",
      business: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Login Business
export const loginBusiness = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM FOOD_BUSINESS WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const business = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      business.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: business.business_id,
        role: "business",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      token,
      business: {
        business_id: business.business_id,
        business_name: business.business_name,
        business_type: business.business_type,
        email: business.email,
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

// Get Business Profile
export const getBusinessProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        business_id,
        business_name,
        business_type,
        email,
        phone,
        address,
        latitude,
        longitude,
        service_radius_km,
        created_at
       FROM FOOD_BUSINESS
       WHERE business_id=$1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Business Profile
export const updateBusinessProfile = async (req, res) => {
  try {
    const {
      business_name,
      business_type,
      phone,
      address,
      latitude,
      longitude,
      service_radius_km,
    } = req.body;

    const result = await pool.query(
      `UPDATE FOOD_BUSINESS
       SET
       business_name=$1,
       business_type=$2,
       phone=$3,
       address=$4,
       latitude=$5,
       longitude=$6,
       service_radius_km=$7
       WHERE business_id=$8
       RETURNING
       business_id,
       business_name,
       business_type,
       email,
       phone,
       address,
       latitude,
       longitude,
       service_radius_km`,
      [
        business_name,
        business_type,
        phone,
        address,
        latitude || null,
        longitude || null,
        service_radius_km || 20,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Business not found." });
    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      business: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
