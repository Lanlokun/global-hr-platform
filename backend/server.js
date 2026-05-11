const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://global-hr-platform.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = allowedOrigins.includes(origin);

    const isVercelPreview =
      /^https:\/\/global-hr-platform-[a-z0-9-]+-maliks-projects-2534a7b4\.vercel\.app$/.test(
        origin
      );

    if (isExplicitlyAllowed || isVercelPreview) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Core middleware
app.use(cors(corsOptions));
app.use(express.json());

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const companyRoutes = require("./routes/companyRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");
const candidateManagementRoutes = require("./routes/candidateManagementRoutes");
const employerRoutes = require("./routes/employerRoutes");
const publicRoutes = require("./routes/publicRoutes");

const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Global HR Platform API running");
});

app.use("/api/public", publicRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", userProfileRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateManagementRoutes);
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin", adminRoutes);

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

const recommendationRoutes = require("./routes/recommendationRoutes");
app.use("/api/recommendations", recommendationRoutes);

const recruiterRoutes = require("./routes/recruiterRoutes");

app.use("/api/recruiter", recruiterRoutes);

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Allowed origins:", allowedOrigins);
});