import pool from "../config/db.js";

// ======================================
// Business Analytics
// ======================================

export const getBusinessAnalytics = async (req, res) => {
  try {

    const business_id = req.user.id;

    const inventory = await pool.query(
      `SELECT COUNT(*) FROM INVENTORY i
       JOIN PRODUCT p ON p.product_id = i.product_id
       WHERE p.business_id = $1`,
      [business_id]
    );

    const surplus = await pool.query(
      `SELECT COUNT(*) FROM surplus_food s
       JOIN inventory i ON i.inventory_id=s.inventory_id
       JOIN product p ON p.product_id=i.product_id
       WHERE p.business_id = $1`,
      [business_id]
    );

    const donated = await pool.query(
      `SELECT COUNT(*)
       FROM donation d
       WHERE d.business_id = $1
       AND d.donation_status = 'Completed'`,
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
       FROM ngo_request
       WHERE ngo_id = $1`,
      [ngo_id]
    );

    const approved = await pool.query(
      `SELECT COUNT(*)
       FROM ngo_request
       WHERE ngo_id = $1
       AND request_status='Approved'`,
      [ngo_id]
    );

    const completed = await pool.query(
      `SELECT COUNT(*)
       FROM donation
       WHERE ngo_id = $1
       AND donation_status='Completed'`,
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
      "SELECT COUNT(*) FROM surplus_food"
    );

    const donations = await pool.query(
      "SELECT COUNT(*) FROM donation"
    );

    const completed = await pool.query(
      `SELECT COUNT(*)
       FROM donation
       WHERE donation_status='Completed'`
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
