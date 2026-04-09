const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Global HR Platform API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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