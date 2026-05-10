const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getConversations,
  getConversationMessages,
  startConversation,
  sendMessage,
  markConversationRead,
  getMessageContacts,
} = require("../controllers/messageController");

router.get("/conversations", authMiddleware, getConversations);
router.get("/conversations/:conversationId", authMiddleware, getConversationMessages);
router.post("/conversations", authMiddleware, startConversation);
router.post("/conversations/:conversationId", authMiddleware, sendMessage);
router.patch("/conversations/:conversationId/read", authMiddleware, markConversationRead);
router.get("/contacts", authMiddleware, getMessageContacts);
module.exports = router;