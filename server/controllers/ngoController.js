import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// Register NGO
export const registerNGO = async (req, res) => {
  try {
    const {
      ngo_name,
      registration_number,
      email,
      password,
      phone,
      address,
    } = req.body;

    if (
      !ngo_name ||
      !registration_number ||
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

    const existingNGO = await pool.query(
      "SELECT * FROM NGO WHERE email = $1",
      [email]
    );

    if (existingNGO.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "NGO already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO NGO
      (ngo_name, registration_number, email, password, phone, address)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING ngo_id, ngo_name, registration_number, email`,
      [
        ngo_name,
        registration_number,
        email,
        hashedPassword,
        phone,
        address,
      ]
    );

    res.status(201).json({
      success: true,
      message: "NGO registered successfully.",
      ngo: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Login NGO
export const loginNGO = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM NGO WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const ngo = result.rows[0];

    const isMatch = await bcrypt.compare(password, ngo.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: ngo.ngo_id,
        role: "ngo",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      token,
      ngo: {
        ngo_id: ngo.ngo_id,
        ngo_name: ngo.ngo_name,
        registration_number: ngo.registration_number,
        email: ngo.email,
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

// Get NGO Profile
export const getNGOProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        ngo_id,
        ngo_name,
        registration_number,
        email,
        phone,
        address,
        latitude,
        longitude,
        service_radius_km,
        created_at
       FROM NGO
       WHERE ngo_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "NGO not found.",
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

// Update NGO Profile
export const updateNGOProfile = async (req, res) => {
  try {
    const {
      ngo_name,
      registration_number,
      phone,
      address,
      latitude,
      longitude,
      service_radius_km,
    } = req.body;

    const result = await pool.query(
      `UPDATE NGO
       SET
       ngo_name = $1,
       registration_number = $2,
       phone = $3,
       address = $4,
       latitude = $5,
       longitude = $6,
       service_radius_km = $7
       WHERE ngo_id = $8
       RETURNING
       ngo_id,
       ngo_name,
       registration_number,
       email,
       phone,
       address,
       latitude,
       longitude,
       service_radius_km`,
      [
        ngo_name,
        registration_number,
        phone,
        address,
        latitude || null,
        longitude || null,
        service_radius_km || 20,
        req.user.id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      ngo: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
