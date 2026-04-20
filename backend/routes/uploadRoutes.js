const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post(
  "/profile-image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const baseUrl = process.env.REACT_APP_API_URL || `${req.protocol}://${req.get("host")}`;
      const url = `${baseUrl}/uploads/profile-images/${req.file.filename}`;

      return res.json({
        message: "Image uploaded successfully",
        url,
      });
    } catch (error) {
      return res.status(500).json({ error: "Image upload failed" });
    }
  }
);

module.exports = router;