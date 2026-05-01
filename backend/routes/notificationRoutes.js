const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

router.get("/", authMiddleware, notificationController.getMyNotifications);
router.patch("/read", authMiddleware, notificationController.markAsRead);
router.delete("/:id", authMiddleware, notificationController.deleteNotification);

module.exports = router;