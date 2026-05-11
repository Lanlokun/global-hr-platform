const db = require("../config/db");
const { createNotification } = require("../services/notificationService");

// =======================
// GET CONVERSATIONS
// =======================
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
      SELECT
        c.id,
        c.sender_id,
        c.receiver_id,
        c.candidate_id,
        c.employer_id,
        c.job_id,
        c.created_at,
        c.updated_at,

        sender.name AS sender_name,
        sender.email AS sender_email,
        sender.profile_image AS sender_image,
        sender.role AS sender_role,

        receiver.name AS receiver_name,
        receiver.email AS receiver_email,
        receiver.profile_image AS receiver_image,
        receiver.role AS receiver_role,

        CASE
          WHEN c.sender_id = $1 THEN receiver.id
          ELSE sender.id
        END AS other_user_id,

        CASE
          WHEN c.sender_id = $1 THEN receiver.name
          ELSE sender.name
        END AS other_user_name,

        CASE
          WHEN c.sender_id = $1 THEN receiver.email
          ELSE sender.email
        END AS other_user_email,

        CASE
          WHEN c.sender_id = $1 THEN receiver.profile_image
          ELSE sender.profile_image
        END AS other_user_image,

        jobs.title AS job_title,

        latest.body AS last_message,
        latest.created_at AS last_message_at,

        COALESCE(unread.unread_count, 0) AS unread_count

      FROM conversations c

      LEFT JOIN users sender
        ON sender.id = c.sender_id

      LEFT JOIN users receiver
        ON receiver.id = c.receiver_id

      LEFT JOIN jobs
        ON jobs.id = c.job_id

      LEFT JOIN LATERAL (
        SELECT body, created_at
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) latest ON true

      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS unread_count
        FROM messages
        WHERE conversation_id = c.id
          AND receiver_id = $1
          AND is_read = false
      ) unread ON true

      WHERE c.sender_id = $1
         OR c.receiver_id = $1
         OR c.candidate_id = $1
         OR c.employer_id = $1

      ORDER BY COALESCE(latest.created_at, c.updated_at, c.created_at) DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to load conversations:", err);
    res.status(500).json({ error: "Failed to load conversations" });
  }
};


// =======================
// GET CONVERSATION MESSAGES
// =======================
const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const accessCheck = await db.query(
      `
      SELECT *
      FROM conversations
      WHERE id = $1
        AND (
          sender_id = $2
          OR receiver_id = $2
          OR candidate_id = $2
          OR employer_id = $2
        )
      `,
      [conversationId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await db.query(
      `
      SELECT 
        m.*,
        sender.name AS sender_name,
        sender.role AS sender_role,
        sender.profile_image AS sender_image
      FROM messages m
      JOIN users sender ON sender.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      `,
      [conversationId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// =======================
// START CONVERSATION
// =======================
const startConversation = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, job_id } = req.body;

    if (!receiver_id) {
      return res.status(400).json({
        error: "receiver_id is required",
      });
    }

    if (Number(receiver_id) === Number(senderId)) {
      return res.status(400).json({
        error: "You cannot message yourself",
      });
    }

    const senderResult = await db.query(
      `
      SELECT id, role, name
      FROM users
      WHERE id = $1
      `,
      [senderId]
    );

    const receiverResult = await db.query(
      `
      SELECT id, role, name
      FROM users
      WHERE id = $1
      `,
      [receiver_id]
    );

    if (senderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Sender not found",
      });
    }

    if (receiverResult.rows.length === 0) {
      return res.status(404).json({
        error: "Receiver not found",
      });
    }

    const sender = senderResult.rows[0];
    const receiver = receiverResult.rows[0];

    const existingConversation = await db.query(
      `
      SELECT *
      FROM conversations
      WHERE (
        sender_id = $1 AND receiver_id = $2
      ) OR (
        sender_id = $2 AND receiver_id = $1
      )
      LIMIT 1
      `,
      [senderId, receiver_id]
    );

    if (existingConversation.rows.length > 0) {
      return res.json({
        success: true,
        conversation: existingConversation.rows[0],
      });
    }

    const result = await db.query(
      `
      INSERT INTO conversations (
        sender_id,
        receiver_id,
        job_id,
        created_at
      )
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [
        senderId,
        receiver_id,
        job_id || null,
      ]
    );

    res.json({
      success: true,
      conversation: result.rows[0],
    });
  } catch (err) {
    console.error("Failed to start conversation:", err);

    res.status(500).json({
      error: "Failed to start conversation",
    });
  }
};

// =======================
// SEND MESSAGE
// =======================
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({
        error: "Message body is required",
      });
    }

    const conversationResult = await db.query(
      `
      SELECT *
      FROM conversations
      WHERE id = $1
        AND (
          sender_id = $2
          OR receiver_id = $2
          OR candidate_id = $2
          OR employer_id = $2
        )
      `,
      [conversationId, userId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        error: "Conversation not found",
      });
    }

    const conversation = conversationResult.rows[0];

    let receiverId = null;

    // NEW flexible messaging logic
    if (conversation.sender_id && conversation.receiver_id) {
      receiverId =
        Number(conversation.sender_id) === Number(userId)
          ? conversation.receiver_id
          : conversation.sender_id;
    }
    // fallback for legacy conversations
    else if (conversation.candidate_id && conversation.employer_id) {
      receiverId =
        Number(conversation.candidate_id) === Number(userId)
          ? conversation.employer_id
          : conversation.candidate_id;
    }

    if (!receiverId) {
      return res.status(400).json({
        error: "Receiver not found",
      });
    }

    const messageResult = await db.query(
      `
      INSERT INTO messages (
        conversation_id,
        sender_id,
        receiver_id,
        body,
        is_read,
        created_at
      )
      VALUES ($1, $2, $3, $4, false, CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [
        conversationId,
        userId,
        receiverId,
        body.trim(),
      ]
    );

    await db.query(
      `
      UPDATE conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [conversationId]
    );

    await createNotification({
      userId: receiverId,
      title: "New message",
      message: `${req.user.name || "Someone"} sent you a new message.`,
      type: "info",
      actionUrl: "/dashboard/messages",
    });

    res.json(messageResult.rows[0]);
  } catch (err) {
    console.error("Send message error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// =======================
// MARK CONVERSATION READ
// =======================
const markConversationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    await db.query(
      `
      UPDATE messages
      SET is_read = true
      WHERE conversation_id = $1
        AND receiver_id = $2
      `,
      [conversationId, userId]
    );

    res.json({ message: "Conversation marked as read" });
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};

const getMessageContacts = async (req, res) => {
  try {
    const role = req.user.role;

    let roles = [];

    if (role === "recruiter") {
      roles = ["employer", "candidate", "recruiter"];
    } else if (role === "employer") {
      roles = ["candidate", "recruiter"];
    } else if (role === "candidate") {
      roles = ["employer", "recruiter"];
    } else if (role === "admin") {
      roles = ["employer", "candidate", "recruiter", "admin"];
    }

    const result = await db.query(
      `
      SELECT
        users.id,
        users.name,
        users.email,
        users.role,
        users.profile_image,
        users.professional_title,
        users.country,
        users.city,
        companies.name AS company_name,
        companies.logo AS company_logo
      FROM users
      LEFT JOIN companies
        ON companies.id = users.company_id
      WHERE users.id != $1
        AND users.role = ANY($2)
      ORDER BY users.role ASC, users.name ASC
      `,
      [req.user.id, roles]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to load message contacts:", err);
    res.status(500).json({ error: "Failed to load contacts" });
  }
};

module.exports = {
  getConversations,
  getConversationMessages,
  startConversation,
  sendMessage,
  markConversationRead,
  getMessageContacts,
};