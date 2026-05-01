const pool = require("../config/db");

async function createNotification({
  userId,
  title,
  message,
  type = "info",
  actionUrl = null,
}) {
  await pool.query(
    `
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [userId, title, message, type, actionUrl]
  );
}

async function notifyUsers({
  userIds,
  title,
  message,
  type = "info",
  actionUrl = null,
}) {
  if (!Array.isArray(userIds) || userIds.length === 0) return;

  const values = [];
  const placeholders = userIds
    .map((userId, index) => {
      const offset = index * 5;
      values.push(userId, title, message, type, actionUrl);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    })
    .join(", ");

  await pool.query(
    `
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES ${placeholders}
    `,
    values
  );
}

async function notifyAllCandidates({
  title,
  message,
  type = "info",
  actionUrl = null,
}) {
  const candidates = await pool.query(
    `
    SELECT id
    FROM users
    WHERE role = 'candidate'
    `
  );

  const userIds = candidates.rows.map((user) => user.id);

  await notifyUsers({
    userIds,
    title,
    message,
    type,
    actionUrl,
  });
}

module.exports = {
  createNotification,
  notifyUsers,
  notifyAllCandidates,
};