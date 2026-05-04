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
        c.*,
        j.title AS job_title,

        candidate.id AS candidate_id,
        candidate.name AS candidate_name,
        candidate.email AS candidate_email,
        candidate.profile_image AS candidate_image,

        employer.id AS employer_id,
        employer.name AS employer_name,
        employer.email AS employer_email,
        employer.profile_image AS employer_image,

        last_msg.body AS last_message,
        last_msg.created_at AS last_message_at,

        COALESCE(unread.unread_count, 0) AS unread_count

      FROM conversations c

      JOIN users candidate ON candidate.id = c.candidate_id
      JOIN users employer ON employer.id = c.employer_id
      LEFT JOIN jobs j ON j.id = c.job_id

      LEFT JOIN LATERAL (
        SELECT body, created_at
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) last_msg ON true

      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS unread_count
        FROM messages m
        WHERE m.conversation_id = c.id
          AND m.receiver_id = $1
          AND m.is_read = false
      ) unread ON true

      WHERE c.candidate_id = $1 OR c.employer_id = $1
      ORDER BY COALESCE(last_msg.created_at, c.updated_at) DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
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
        AND (candidate_id = $2 OR employer_id = $2)
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
    const userId = req.user.id;
    const userRole = req.user.role;

    const { candidateId, employerId, jobId, body } = req.body;

    let finalCandidateId = candidateId;
    let finalEmployerId = employerId;

    if (userRole === "candidate") {
      finalCandidateId = userId;
    }

    if (userRole === "employer") {
      finalEmployerId = userId;
    }

    if (!finalCandidateId || !finalEmployerId) {
      return res.status(400).json({
        error: "Candidate and employer are required",
      });
    }

    let conversationResult = await db.query(
      `
      SELECT *
      FROM conversations
      WHERE candidate_id = $1
        AND employer_id = $2
        AND (
          job_id = $3 OR (job_id IS NULL AND $3::int IS NULL)
        )
      LIMIT 1
      `,
      [finalCandidateId, finalEmployerId, jobId || null]
    );

    let conversation = conversationResult.rows[0];

    if (!conversation) {
      const insertResult = await db.query(
        `
        INSERT INTO conversations (
          candidate_id,
          employer_id,
          job_id
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [finalCandidateId, finalEmployerId, jobId || null]
      );

      conversation = insertResult.rows[0];
    }

    if (body && body.trim()) {
      const receiverId =
        Number(userId) === Number(finalCandidateId)
          ? finalEmployerId
          : finalCandidateId;

      if (!receiverId) {
        return res.status(400).json({ error: "Receiver not found" });
      }

      await db.query(
        `
        INSERT INTO messages (
          conversation_id,
          sender_id,
          receiver_id,
          body
        )
        VALUES ($1, $2, $3, $4)
        `,
        [conversation.id, userId, receiverId, body.trim()]
      );

      await createNotification({
        userId: receiverId,
        title: "New message",
        message: `${req.user.name || "Someone"} sent you a message about a job.`,
        type: "info",
        actionUrl: "/dashboard/messages",
      });

      await db.query(
        `
        UPDATE conversations
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [conversation.id]
      );
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Failed to start conversation:", error);
    res.status(500).json({ error: "Failed to start conversation" });
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
      return res.status(400).json({ error: "Message body is required" });
    }

    const receiverResult = await db.query(
      `
      SELECT 
        CASE 
          WHEN candidate_id = $1 THEN employer_id
          WHEN employer_id = $1 THEN candidate_id
          ELSE NULL
        END AS receiver_id
      FROM conversations
      WHERE id = $2
        AND (candidate_id = $1 OR employer_id = $1)
      `,
      [userId, conversationId]
    );

    const receiverId = receiverResult.rows[0]?.receiver_id;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver not found" });
    }

    const messageResult = await db.query(
      `
      INSERT INTO messages (
        conversation_id,
        sender_id,
        receiver_id,
        body
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [conversationId, userId, receiverId, body.trim()]
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
    res.status(500).json({ error: err.message });
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

module.exports = {
  getConversations,
  getConversationMessages,
  startConversation,
  sendMessage,
  markConversationRead,
};