import pool from "../config/db.js";

export const requestDonation = async (req, res) => {
  try {
    const result = await pool.query(`INSERT INTO ngo_request (surplus_id, ngo_id, request_status) SELECT $1, $2, 'Pending' WHERE EXISTS (SELECT 1 FROM surplus_food WHERE surplus_id=$1 AND status='Available') RETURNING *`, [req.body.surplus_id, req.user.id]);
    if (!result.rows.length) return res.status(400).json({ success: false, message: "This surplus listing is no longer available." });
    res.status(201).json({ success: true, message: "Donation request submitted.", request: result.rows[0] });
  } catch (error) { if (error.code === "23505") return res.status(409).json({ success: false, message: "You already have an active request for this listing." }); console.error(error); res.status(500).json({ success: false, message: "Unable to submit donation request." }); }
};

export const approveDonation = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const request = await client.query(`UPDATE ngo_request r SET request_status='Approved' FROM surplus_food s JOIN inventory i ON i.inventory_id=s.inventory_id JOIN product p ON p.product_id=i.product_id WHERE r.surplus_id=s.surplus_id AND p.business_id=$1 AND r.request_id=$2 AND r.request_status='Pending' RETURNING r.*`, [req.user.id, req.params.id]);
    if (!request.rows.length) { await client.query("ROLLBACK"); return res.status(404).json({ success: false, message: "Pending request not found." }); }
    const donation = await client.query(`INSERT INTO donation (request_id, business_id, ngo_id, donation_status) VALUES ($1,$2,$3,'Approved') RETURNING *`, [request.rows[0].request_id, req.user.id, request.rows[0].ngo_id]);
    await client.query(`UPDATE surplus_food SET status='Claimed' WHERE surplus_id=$1`, [request.rows[0].surplus_id]);
    await client.query("COMMIT"); res.json({ success: true, donation: donation.rows[0] });
  } catch (error) { await client.query("ROLLBACK"); console.error(error); res.status(500).json({ success: false, message: "Unable to approve donation." }); } finally { client.release(); }
};

export const rejectDonation = async (req, res) => {
  try { const result = await pool.query(`UPDATE ngo_request r SET request_status='Rejected' FROM surplus_food s JOIN inventory i ON i.inventory_id=s.inventory_id JOIN product p ON p.product_id=i.product_id WHERE r.surplus_id=s.surplus_id AND p.business_id=$1 AND r.request_id=$2 AND r.request_status='Pending' RETURNING r.*`, [req.user.id, req.params.id]); if (!result.rows.length) return res.status(404).json({ success: false, message: "Pending request not found." }); res.json({ success: true, request: result.rows[0] }); } catch (error) { console.error(error); res.status(500).json({ success: false, message: "Unable to reject request." }); }
};

export const completeDonation = async (req, res) => { try { const result = await pool.query(`UPDATE donation SET donation_status='Completed' WHERE donation_id=$1 AND (business_id=$2 OR ngo_id=$2) RETURNING *`, [req.params.id, req.user.id]); if (!result.rows.length) return res.status(404).json({ success: false, message: "Donation not found." }); res.json({ success: true, donation: result.rows[0] }); } catch (error) { console.error(error); res.status(500).json({ success: false, message: "Unable to complete donation." }); } };

export const getDonations = async (req, res) => {
  const isBusiness = req.user.role === "business";
  try {
    const result = await pool.query(`SELECT r.request_id, r.request_status AS status, r.request_date, s.surplus_id, s.quantity_available AS quantity, s.pickup_address, p.product_name, p.category, n.ngo_name, n.phone AS ngo_phone, b.business_name, d.donation_id, d.donation_status FROM ngo_request r JOIN surplus_food s ON s.surplus_id=r.surplus_id JOIN inventory i ON i.inventory_id=s.inventory_id JOIN product p ON p.product_id=i.product_id JOIN food_business b ON b.business_id=p.business_id JOIN ngo n ON n.ngo_id=r.ngo_id LEFT JOIN donation d ON d.request_id=r.request_id WHERE ${isBusiness ? "b.business_id" : "r.ngo_id"}=$1 ORDER BY r.request_date DESC`, [req.user.id]);
    res.json({ success: true, donations: result.rows });
  } catch (error) { console.error(error); res.status(500).json({ success: false, message: "Unable to load donation requests." }); }
};
