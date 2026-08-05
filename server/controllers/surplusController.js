import pool from "../config/db.js";

export const createSurplus = async (req, res) => {
  const { inventory_id, quantity, expiry_date, pickup_address, available_until } = req.body;

  if (!inventory_id || !quantity || !expiry_date || !pickup_address || !available_until) {
    return res.status(400).json({
      success: false,
      message: "All surplus fields are required."
    });
  }

  if (
    !Number.isFinite(Number(quantity)) ||
    Number(quantity) <= 0 ||
    new Date(available_until) > new Date(expiry_date)
  ) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be positive and availability must end on or before expiry."
    });
  }

  try {
    const ownership = await pool.query(
      `SELECT i.inventory_id, i.quantity
       FROM inventory i
       JOIN product p ON p.product_id = i.product_id
       WHERE i.inventory_id = $1
       AND p.business_id = $2`,
      [inventory_id, req.user.id]
    );

    if (!ownership.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found."
      });
    }

    if (Number(quantity) > Number(ownership.rows[0].quantity)) {
      return res.status(400).json({
        success: false,
        message: "Surplus quantity cannot exceed available inventory."
      });
    }

    const result = await pool.query(
      `INSERT INTO surplus_food
      (inventory_id, quantity_available, expiry_time, pickup_address, available_until, status)
      VALUES ($1,$2,$3,$4,$5,'Available')
      RETURNING *`,
      [
        inventory_id,
        quantity,
        expiry_date,
        pickup_address,
        available_until
      ]
    );

    res.status(201).json({
      success: true,
      message: "Surplus listing published.",
      surplus: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to publish surplus."
    });
  }
};

export const getAllSurplus = async (req, res) => {
  try {
    const isBusiness = req.user.role === "business";

    const result = await pool.query(
      `SELECT
          s.surplus_id,
          s.inventory_id,
          s.quantity_available AS quantity,
          s.expiry_time AS expiry_date,
          s.pickup_address,
          s.available_until,
          s.status,
          s.listed_time,
          p.product_name,
          p.category,
          b.business_id,
          b.business_name
       FROM surplus_food s
       JOIN inventory i ON i.inventory_id = s.inventory_id
       JOIN product p ON p.product_id = i.product_id
       JOIN food_business b ON b.business_id = p.business_id
       WHERE
       ($1 <> 'business' OR b.business_id = $2)
       AND
       ($1 <> 'ngo' OR s.status = 'Available')
       ORDER BY s.listed_time DESC`,
      [req.user.role, req.user.id]
    );

    res.json({
      success: true,
      total: result.rows.length,
      surplus: result.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to load surplus listings."
    });
  }
};

export const getSurplusById = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT
          s.*,
          p.product_name,
          p.category,
          b.business_name
       FROM surplus_food s
       JOIN inventory i ON i.inventory_id = s.inventory_id
       JOIN product p ON p.product_id = i.product_id
       JOIN food_business b ON b.business_id = p.business_id
       WHERE
       s.surplus_id = $1
       AND ($2 <> 'business' OR b.business_id = $3)
       AND ($2 <> 'ngo' OR s.status='Available')`,
      [req.params.id, req.user.role, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Surplus listing not found."
      });
    }

    res.json({
      success: true,
      surplus: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to load surplus listing."
    });
  }
};

export const updateSurplus = async (req, res) => {

  const {
    quantity,
    expiry_date,
    pickup_address,
    available_until,
    status
  } = req.body;

  const allowedStatuses = [
    "Available",
    "Unavailable",
    "Cancelled"
  ];

  if (
    !Number.isFinite(Number(quantity)) ||
    Number(quantity) <= 0 ||
    !allowedStatuses.includes(status) ||
    new Date(available_until) > new Date(expiry_date)
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide a positive quantity, a valid status, and an availability window before expiry."
    });
  }

  try {

    const result = await pool.query(
      `UPDATE surplus_food s
       SET
         quantity_available = $1,
         expiry_time = $2,
         pickup_address = $3,
         available_until = $4,
         status = $5
       FROM inventory i
       JOIN product p
       ON p.product_id = i.product_id
       WHERE
       s.inventory_id = i.inventory_id
       AND p.business_id = $6
       AND s.surplus_id = $7
       AND $1 <= i.quantity
       RETURNING s.*`,
      [
        quantity,
        expiry_date,
        pickup_address,
        available_until,
        status,
        req.user.id,
        req.params.id
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Surplus listing not found."
      });
    }

    res.json({
      success: true,
      surplus: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to update surplus."
    });
  }
};

export const deleteSurplus = async (req, res) => {
  try {

    const result = await pool.query(
      `DELETE FROM surplus_food s
       USING inventory i, product p
       WHERE
       s.inventory_id = i.inventory_id
       AND i.product_id = p.product_id
       AND p.business_id = $1
       AND s.surplus_id = $2
       RETURNING s.*`,
      [req.user.id, req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Surplus listing not found."
      });
    }

    res.json({
      success: true,
      message: "Surplus listing deleted."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to delete surplus."
    });
  }
};