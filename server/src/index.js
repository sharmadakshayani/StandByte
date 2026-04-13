// ═══════════════════════════════════════════════════
// StandByte API server — Express + MongoDB (Mongoose)
// ═══════════════════════════════════════════════════

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./db");
const { seedDefaults } = require("./models/Setting");

const analyticsRouter = require("./routes/analytics");
const sessionsRouter = require("./routes/sessions");
const settingsRouter = require("./routes/settings");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───
app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Routes ───
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "standbyte-api", db: "mongodb" });
});

app.use("/api/analytics", analyticsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/settings", settingsRouter);

// ─── 404 + error handlers ───
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("[server error]", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ─── Async startup: connect to MongoDB, then start listening ───
async function start() {
  await connectDB();
  await seedDefaults();
  console.log("[db] Default settings seeded");

  app.listen(PORT, () => {
    console.log(`[server] StandByte API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[server] Startup failed:", err);
  process.exit(1);
});
