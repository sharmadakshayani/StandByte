// ═══════════════════════════════════════════════════
// /api/analytics routes — MongoDB/Mongoose version
// ═══════════════════════════════════════════════════

const express = require("express");
const { Analytics, getOrCreateAnalytics, serialize } = require("../models/Analytics");

const router = express.Router();

// GET /api/analytics → current stats
router.get("/", async (req, res, next) => {
  try {
    const doc = await getOrCreateAnalytics();
    res.json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

// POST /api/analytics/distraction → atomic +1
router.post("/distraction", async (req, res, next) => {
  try {
    await getOrCreateAnalytics(); // ensure it exists
    const doc = await Analytics.findOneAndUpdate(
      {},
      { $inc: { totalDistractions: 1 } },
      { new: true }
    );
    res.json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

// POST /api/analytics/focus-time  { seconds }
router.post("/focus-time", async (req, res, next) => {
  try {
    const seconds = Number(req.body?.seconds);
    if (!Number.isFinite(seconds) || seconds < 0) {
      return res.status(400).json({ error: "Invalid seconds value" });
    }
    await getOrCreateAnalytics();
    const doc = await Analytics.findOneAndUpdate(
      {},
      { $inc: { totalFocusTime: seconds } },
      { new: true }
    );
    res.json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

// POST /api/analytics/time-away  { ms }
// Atomically adds to the cumulative time-away counter.
router.post("/time-away", async (req, res, next) => {
  try {
    const ms = Number(req.body?.ms);
    if (!Number.isFinite(ms) || ms < 0) {
      return res.status(400).json({ error: "Invalid ms value" });
    }
    await getOrCreateAnalytics();
    const doc = await Analytics.findOneAndUpdate(
      {},
      { $inc: { totalTimeAway: ms } },
      { new: true }
    );
    res.json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

// POST /api/analytics/complete  { seconds }
// Atomically bumps productive time + streak + completed count,
// then updates bestStreak if currentStreak just surpassed it.
router.post("/complete", async (req, res, next) => {
  try {
    const seconds = Number(req.body?.seconds);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return res.status(400).json({ error: "Invalid seconds value" });
    }

    await getOrCreateAnalytics();

    // Step 1: atomic increments
    let doc = await Analytics.findOneAndUpdate(
      {},
      {
        $inc: {
          productiveFocusTime: seconds,
          currentStreak: 1,
          completedSessions: 1,
        },
      },
      { new: true }
    );

    // Step 2: if currentStreak is now greater than bestStreak, update bestStreak
    if (doc.currentStreak > doc.bestStreak) {
      doc = await Analytics.findOneAndUpdate(
        {},
        { $set: { bestStreak: doc.currentStreak } },
        { new: true }
      );
    }

    res.json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

// POST /api/analytics/break-streak → currentStreak = 0
router.post("/break-streak", async (req, res, next) => {
  try {
    await getOrCreateAnalytics();
    const doc = await Analytics.findOneAndUpdate(
      {},
      { $set: { currentStreak: 0 } },
      { new: true }
    );
    res.json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

// POST /api/analytics/reset → wipe all stats to zero
router.post("/reset", async (req, res, next) => {
  try {
    await getOrCreateAnalytics();
    const doc = await Analytics.findOneAndUpdate(
      {},
      {
        $set: {
          totalFocusTime: 0,
          totalDistractions: 0,
          totalTimeAway: 0,
          productiveFocusTime: 0,
          currentStreak: 0,
          bestStreak: 0,
          completedSessions: 0,
        },
      },
      { new: true }
    );
    res.json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
