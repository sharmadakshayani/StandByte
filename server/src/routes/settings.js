// ═══════════════════════════════════════════════════
// /api/settings routes — MongoDB/Mongoose version
// ═══════════════════════════════════════════════════

const express = require("express");
const { loadAll, setOne } = require("../models/Setting");

const router = express.Router();

// GET /api/settings → all settings as a typed object
router.get("/", async (req, res, next) => {
  try {
    const settings = await loadAll();
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/settings  { focusLimit?, breakLimit?, proctoredEnabled?, pomodoroEnabled?, pomodoroBlocks?, siteSettings? }
router.patch("/", async (req, res, next) => {
  try {
    const body = req.body || {};

    if ("focusLimit" in body) {
      await setOne("focusLimit", String(Number(body.focusLimit) || 0));
    }
    if ("breakLimit" in body) {
      await setOne("breakLimit", String(Number(body.breakLimit) || 0));
    }
    if ("proctoredEnabled" in body) {
      await setOne("proctoredEnabled", body.proctoredEnabled ? "true" : "false");
    }
    if ("pomodoroEnabled" in body) {
      await setOne("pomodoroEnabled", body.pomodoroEnabled ? "true" : "false");
    }
    if ("pomodoroBlocks" in body) {
      const n = Math.max(2, Math.min(10, Number(body.pomodoroBlocks) || 4));
      await setOne("pomodoroBlocks", String(n));
    }
    if ("siteSettings" in body) {
      await setOne("siteSettings", JSON.stringify(body.siteSettings || {}));
    }

    const settings = await loadAll();
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
