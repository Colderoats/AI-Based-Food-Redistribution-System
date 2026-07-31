import pool from "../config/db.js";

// ======================================
// Create Surplus Listing
// ======================================

export const createSurplus = async (req, res) => {
  try {
    const {
      inventory_id,
      quantity,
      expiry_date,
      pickup_address,
      available_until,
    } = req.body;

    const business_id = req.user.id;

    if (
      !inventory_id ||
      !quantity ||
      !expiry_date ||
      !pickup_address ||
      !available_until
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const result = await pool.query(
      `INSERT INTO SURPLUS
      (
        business_id,
        inventory_id,
        quantity,
        expiry_date,
        pickup_address,
        available_until,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,'Available')
      RETURNING *`,
      [
        business_id,
        inventory_id,
        quantity,
        expiry_date,
        pickup_address,
        available_until,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Surplus listing created successfully.",
      surplus: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================
// Get All Surplus Listings
// ======================================

export const getAllSurplus = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT *
       FROM SURPLUS
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      total: result.rows.length,
      surplus: result.rows,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// ======================================
// Get Surplus By ID
// ======================================

export const getSurplusById = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM SURPLUS
       WHERE surplus_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Surplus listing not found.",
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

// ======================================
// Update Surplus Listing
// ======================================

export const updateSurplus = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      quantity,
      expiry_date,
      pickup_address,
      available_until,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE SURPLUS
       SET
       quantity = $1,
       expiry_date = $2,
       pickup_address = $3,
       available_until = $4,
       status = $5
       WHERE surplus_id = $6
       RETURNING *`,
      [
        quantity,
        expiry_date,
        pickup_address,
        available_until,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Surplus listing not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Surplus listing updated successfully.",
      surplus: result.rows[0],
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// ======================================
// Delete Surplus Listing
// ======================================

export const deleteSurplus = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM SURPLUS
       WHERE surplus_id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Surplus listing not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Surplus listing deleted successfully.",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};