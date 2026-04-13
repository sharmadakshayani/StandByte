// ═══════════════════════════════════════════════════
// Setting model — key/value store for user preferences
// ═══════════════════════════════════════════════════

const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);

const DEFAULTS = {
  focusLimit: "1500",
  breakLimit: "300",
  proctoredEnabled: "false",
  pomodoroEnabled: "false",
  pomodoroBlocks: "4",
  siteSettings: JSON.stringify({
    youtube: true,
    netflix: true,
    spotify: true,
    instagram: true,
    twitter: true,
    facebook: true,
    reddit: true,
    tiktok: true,
  }),
};

// Ensure every default key exists (idempotent — safe to call on every startup)
async function seedDefaults() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    await Setting.updateOne(
      { key },
      { $setOnInsert: { key, value } },
      { upsert: true }
    );
  }
}

// Read all settings and return them as a typed object the client expects
async function loadAll() {
  const rows = await Setting.find({});
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    focusLimit: Number(map.focusLimit) || 1500,
    breakLimit: Number(map.breakLimit) || 300,
    proctoredEnabled: map.proctoredEnabled === "true",
    pomodoroEnabled: map.pomodoroEnabled === "true",
    pomodoroBlocks: Math.max(2, Math.min(10, Number(map.pomodoroBlocks) || 4)),
    siteSettings: (() => {
      try {
        return JSON.parse(map.siteSettings || "{}");
      } catch {
        return {};
      }
    })(),
  };
}

// Upsert a single setting
async function setOne(key, value) {
  await Setting.updateOne(
    { key },
    { $set: { key, value: String(value) } },
    { upsert: true }
  );
}

module.exports = { Setting, seedDefaults, loadAll, setOne };
