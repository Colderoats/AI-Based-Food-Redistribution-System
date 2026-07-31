import pool from "../config/db.js";

// ======================================
// Business Analytics
// ======================================

export const getBusinessAnalytics = async (req, res) => {
  try {

    const business_id = req.user.id;

    const inventory = await pool.query(
      `SELECT COUNT(*) FROM INVENTORY
       WHERE business_id = $1`,
      [business_id]
    );

    const surplus = await pool.query(
      `SELECT COUNT(*) FROM SURPLUS
       WHERE business_id = $1`,
      [business_id]
    );

    const donated = await pool.query(
      `SELECT COUNT(*)
       FROM DONATED d
       JOIN SURPLUS s
       ON d.surplus_id = s.surplus_id
       WHERE s.business_id = $1
       AND d.status = 'Completed'`,
      [business_id]
    );

    res.status(200).json({
      success: true,
      analytics: {
        totalInventory: Number(inventory.rows[0].count),
        surplusListings: Number(surplus.rows[0].count),
        completedDonations: Number(donated.rows[0].count),
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

// ======================================
// NGO Analytics
// ======================================

export const getNGOAnalytics = async (req, res) => {

  try {

    const ngo_id = req.user.id;

    const requests = await pool.query(
      `SELECT COUNT(*)
       FROM DONATED
       WHERE ngo_id = $1`,
      [ngo_id]
    );

    const approved = await pool.query(
      `SELECT COUNT(*)
       FROM DONATED
       WHERE ngo_id = $1
       AND status='Approved'`,
      [ngo_id]
    );

    const completed = await pool.query(
      `SELECT COUNT(*)
       FROM DONATED
       WHERE ngo_id = $1
       AND status='Completed'`,
      [ngo_id]
    );

    res.status(200).json({
      success: true,
      analytics: {
        requests: Number(requests.rows[0].count),
        approved: Number(approved.rows[0].count),
        completed: Number(completed.rows[0].count),
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

// ======================================
// Admin Analytics
// ======================================

export const getAdminAnalytics = async (req, res) => {

  try {

    const businesses = await pool.query(
      "SELECT COUNT(*) FROM FOOD_BUSINESS"
    );

    const ngos = await pool.query(
      "SELECT COUNT(*) FROM NGO"
    );

    const inventory = await pool.query(
      "SELECT COUNT(*) FROM INVENTORY"
    );

    const surplus = await pool.query(
      "SELECT COUNT(*) FROM SURPLUS"
    );

    const donations = await pool.query(
      "SELECT COUNT(*) FROM DONATED"
    );

    const completed = await pool.query(
      `SELECT COUNT(*)
       FROM DONATED
       WHERE status='Completed'`
    );

    res.status(200).json({
      success: true,
      analytics: {
        totalBusinesses: Number(businesses.rows[0].count),
        totalNGOs: Number(ngos.rows[0].count),
        totalInventory: Number(inventory.rows[0].count),
        totalSurplus: Number(surplus.rows[0].count),
        totalDonations: Number(donations.rows[0].count),
        completedDonations: Number(completed.rows[0].count),
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