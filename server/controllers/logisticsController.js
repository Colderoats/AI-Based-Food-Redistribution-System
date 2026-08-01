import pool from "../config/db.js";

export const createAvailability = async (req, res) => {
  const { vehicle_type, capacity_kg, available_from, available_until, service_area, contact_phone, notes } = req.body;

  if (!vehicle_type || !capacity_kg || !available_from || !available_until || !service_area) {
    return res.status(400).json({ success: false, message: "Vehicle, capacity, availability window, and service area are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO LOGISTICS_AVAILABILITY
       (owner_role, owner_id, vehicle_type, capacity_kg, available_from, available_until, service_area, contact_phone, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [req.user.role, req.user.id, vehicle_type, capacity_kg, available_from, available_until, service_area, contact_phone || null, notes || null]
    );
    res.status(201).json({ success: true, availability: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to save logistics availability." });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM LOGISTICS_AVAILABILITY
       WHERE owner_role = $1 AND owner_id = $2
       ORDER BY available_from ASC`,
      [req.user.role, req.user.id]
    );
    res.json({ success: true, availability: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to load logistics availability." });
  }
};
