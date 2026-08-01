import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

  try {
    const result = await pool.query(
      `SELECT business_id AS id, business_name AS name, email, password, 'business' AS role FROM food_business WHERE LOWER(email)=LOWER($1)
       UNION ALL
       SELECT ngo_id AS id, ngo_name AS name, email, password, 'ngo' AS role FROM ngo WHERE LOWER(email)=LOWER($1)`,
      [email]
    );
    const account = result.rows[0];
    if (!account) return res.status(401).json({ success: false, message: "Invalid email or password." });

    const isBcryptHash = account.password.startsWith("$2");
    const validPassword = isBcryptHash
      ? await bcrypt.compare(password, account.password)
      : password === account.password;
    if (!validPassword) return res.status(401).json({ success: false, message: "Invalid email or password." });

    // Upgrade legacy seeded plain-text passwords after a successful login.
    if (!isBcryptHash) {
      const table = account.role === "business" ? "food_business" : "ngo";
      const idColumn = account.role === "business" ? "business_id" : "ngo_id";
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(`UPDATE ${table} SET password=$1 WHERE ${idColumn}=$2`, [hashedPassword, account.id]);
    }

    const token = jwt.sign({ id: account.id, role: account.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ success: true, token, user: { id: account.id, name: account.name, email: account.email, role: account.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to sign in." });
  }
};
