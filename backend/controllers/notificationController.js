const pool = require("../config/db");

exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to load notifications" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
      `,
      [userId]
    );

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM notifications
      WHERE id = $1 AND user_id = $2
      `,
      [id, userId]
    );

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};