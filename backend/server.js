const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // your stable production URL
].filter(Boolean);

app.use(
  cors({
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

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Global HR Platform API running");
});

const userProfileRoutes = require("./routes/userProfileRoutes");
app.use("/api/users", userProfileRoutes);

const companyRoutes = require("./routes/companyRoutes");
app.use("/api/companies", companyRoutes);

const jobRoutes = require("./routes/jobRoutes");
app.use("/api/jobs", jobRoutes);

const applicationRoutes = require("./routes/applicationRoutes");
app.use("/api/applications", applicationRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const candidateManagementRoutes = require("./routes/candidateManagementRoutes");
app.use("/api/candidates", candidateManagementRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});