import pool from "../config/db.js";

// ======================================
// NGO Requests Donation
// ======================================

export const requestDonation = async (req, res) => {
  try {
    const ngo_id = req.user.id;
    const { surplus_id } = req.body;

    if (!surplus_id) {
      return res.status(400).json({
        success: false,
        message: "Surplus ID is required.",
      });
    }

    const result = await pool.query(
      `INSERT INTO DONATED
      (surplus_id, ngo_id, status)
      VALUES ($1, $2, 'Pending')
      RETURNING *`,
      [surplus_id, ngo_id]
    );

    res.status(201).json({
      success: true,
      message: "Donation request submitted successfully.",
      donation: result.rows[0],
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
// Business Approves Donation
// ======================================

export const approveDonation = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `UPDATE DONATED
       SET status = 'Approved'
       WHERE donation_id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donation request not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation approved successfully.",
      donation: result.rows[0],
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
// Business Rejects Donation
// ======================================

export const rejectDonation = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `UPDATE DONATED
       SET status = 'Rejected'
       WHERE donation_id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donation request not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation rejected successfully.",
      donation: result.rows[0],
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
// Donation Completed
// ======================================

export const completeDonation = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `UPDATE DONATED
       SET status = 'Completed'
       WHERE donation_id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation marked as completed.",
      donation: result.rows[0],
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
// Get Donations
// ======================================

export const getDonations = async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT *
       FROM DONATED
       ORDER BY donation_id DESC`
    );

    res.status(200).json({
      success: true,
      total: result.rows.length,
      donations: result.rows,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};