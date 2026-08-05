import pool from "../config/db.js";
import { getExpiryStatus } from "../utils/inventoryEngine.js";

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
        i.quantity,
        p.business_id
      FROM inventory i
      JOIN product p ON p.product_id = i.product_id
      WHERE p.business_id = $1
      ORDER BY i.expiry_date ASC`,
      [businessId]
    );

    const alerts = inventoryResult.rows
      .map((item) => {
        const status = getExpiryStatus(item.expiry_date, 7);
        const isExpired = status.level === "expired";
        const isToday = status.level === "today";
        const isNearExpiry = status.level === "near_expiry";
        return {
          id: `alert-${item.inventory_id}`,
          inventory_id: item.inventory_id,
          type: isExpired ? "expired" : isToday || isNearExpiry ? "expiring" : "monitoring",
          title: isExpired ? `${item.product_name} expired` : `${item.product_name} is nearing expiry`,
          message: `${item.product_name} expires in ${status.daysRemaining ?? "unknown"} days and needs action.`,
          daysLeft: status.daysRemaining,
          category: item.category,
          priority: isExpired || isToday ? "high" : isNearExpiry ? "medium" : "low",
          expiry: status,
        };
      })
      .filter((alert) => alert.daysLeft !== null && alert.daysLeft <= 14);

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
