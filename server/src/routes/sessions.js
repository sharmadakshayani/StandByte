// ═══════════════════════════════════════════════════
// /api/sessions routes — MongoDB/Mongoose version
// ═══════════════════════════════════════════════════

const express = require("express");
const { Session, serialize } = require("../models/Session");

const router = express.Router();

// GET /api/sessions → all sessions, oldest first
router.get("/", async (req, res, next) => {
  try {
    const rows = await Session.find({}).sort({ timestamp: 1 });
    res.json(rows.map(serialize));
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions  { focusTime, distractions, timeAway, proctored, completed, pomodoro, blocksCompleted, timestamp }
router.post("/", async (req, res, next) => {
  try {
    const {
      focusTime,
      distractions = 0,
      timeAway = 0,
      proctored = false,
      completed = false,
      pomodoro = false,
      blocksCompleted = 1,
      timestamp,
    } = req.body || {};

    if (!Number.isFinite(Number(focusTime)) || Number(focusTime) <= 0) {
      return res.status(400).json({ error: "focusTime must be a positive number" });
    }

    const doc = await Session.create({
      focusTime: Number(focusTime),
      distractions: Number(distractions) || 0,
      timeAway: Number(timeAway) || 0,
      proctored: !!proctored,
      completed: !!completed,
      pomodoro: !!pomodoro,
      blocksCompleted: Number(blocksCompleted) || 1,
      timestamp: Number(timestamp) || Date.now(),
    });

    res.status(201).json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sessions → wipe all sessions
router.delete("/", async (req, res, next) => {
  try {
    await Session.deleteMany({});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
