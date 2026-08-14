import pool from "../config/db.js";

const getNotificationTableExists = async () => {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'notification_log'
    ) AS exists`
  );
  return result.rows[0]?.exists;
};

export const getNotifications = async (req, res) => {
  try {
    const businessId = req.user.id;
    const inventoryResult = await pool.query(
      `SELECT
        i.inventory_id,
        p.product_name,
        p.category,
        i.expiry_date,
        i.quantity, i.alert_days,
        pr.risk_score, pr.risk_tier, pr.reorder_recommendation, pr.predicted_at
      FROM inventory i
      JOIN product p ON p.product_id = i.product_id
      JOIN LATERAL (SELECT * FROM predictions WHERE inventory_id = i.inventory_id ORDER BY predicted_at DESC LIMIT 1) pr ON true
      WHERE p.business_id = $1 AND pr.risk_tier IN ('medium', 'high')
      ORDER BY pr.risk_score DESC, i.expiry_date ASC`,
      [businessId]
    );

    const alerts = inventoryResult.rows
      .map((item) => {
        const daysLeft = Math.ceil((new Date(item.expiry_date).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
        const highRisk = item.risk_tier === "high";
        return {
          id: `alert-${item.inventory_id}`,
          inventory_id: item.inventory_id,
          type: "ai_expiry_risk",
          title: `${item.product_name} has ${item.risk_tier} waste risk`,
          message: `${item.product_name} has an AI risk score of ${item.risk_score} and expires in ${daysLeft} days.`,
          daysLeft,
          category: item.category,
          priority: highRisk ? "high" : "medium",
          riskTier: item.risk_tier, riskScore: Number(item.risk_score),
          recommendedAction: highRisk ? "Prioritize redistribution or discounting." : "Monitor demand and prepare a redistribution plan.",
          thresholdExceeded: daysLeft <= Number(item.alert_days || 7),
          expiry: { daysRemaining: daysLeft },
        };
      });

    const summary = {
      total: alerts.length,
      critical: alerts.filter((alert) => alert.priority === "high").length,
      expiring: alerts.filter((alert) => alert.type === "expiring").length,
    };

    const tableExists = await getNotificationTableExists();
    if (tableExists) {
      const userNotifications = await pool.query(
        `SELECT * FROM notification_log WHERE user_id = $1 AND user_role = $2 ORDER BY created_at DESC LIMIT 10`,
        [req.user.id, req.user.role]
      );
      const combined = [...userNotifications.rows.map((n) => ({
        id: `db-${n.notification_id}`,
        inventory_id: null,
        type: n.type,
        title: n.title,
        message: n.message,
        daysLeft: null,
        category: "system",
        priority: n.priority,
        expiry: null,
      })), ...alerts];
      return res.json({ success: true, alerts: combined, summary: { total: combined.length, critical: combined.filter((a) => a.priority === "high").length, expiring: combined.filter((a) => a.type === "expiring").length } });
    }

    res.json({ success: true, alerts, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to load notifications." });
  }
};

export const createNotification = async (req, res) => {
  try {
    const tableExists = await getNotificationTableExists();
    if (!tableExists) {
      return res.status(200).json({ success: true, notification: null, message: "Notification log not enabled." });
    }

    const { user_id, user_role, title, message, type, priority = "medium" } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Notification payload incomplete." });
    }
    if (req.user.role !== "admin" && (Number(user_id) !== Number(req.user.id) || user_role !== req.user.role)) {
      return res.status(403).json({ success: false, message: "You can only create notifications for your own account." });
    }
    if (!["business", "ngo", "admin"].includes(user_role) || !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ success: false, message: "Notification role or priority is invalid." });
    }

    const result = await pool.query(
      `INSERT INTO notification_log (user_id, user_role, title, message, type, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, user_role, title, message, type || "system", priority]
    );

    res.status(201).json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to create notification." });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const tableExists = await getNotificationTableExists();
    if (!tableExists) {
      return res.json({ success: true, notifications: [] });
    }

    const result = await pool.query(
      `SELECT * FROM notification_log WHERE user_id = $1 AND user_role = $2 ORDER BY created_at DESC LIMIT 25`,
      [req.user.id, req.user.role]
    );

    res.json({ success: true, notifications: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Unable to load user notifications." });
  }
};
