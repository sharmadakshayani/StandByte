// ═══════════════════════════════════════════════════
// Analytics model — singleton cumulative stats
// ═══════════════════════════════════════════════════
//
// Only ONE document should ever exist in this collection.
// Use getOrCreate() below to fetch the singleton (creating it if missing).

const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    totalFocusTime: { type: Number, default: 0, min: 0 },
    totalDistractions: { type: Number, default: 0, min: 0 },
    totalTimeAway: { type: Number, default: 0, min: 0 },        // ms spent away from tab
    productiveFocusTime: { type: Number, default: 0, min: 0 },
    currentStreak: { type: Number, default: 0, min: 0 },
    bestStreak: { type: Number, default: 0, min: 0 },
    completedSessions: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);

// Singleton accessor — returns the one analytics doc, creating it if needed
async function getOrCreateAnalytics() {
  let doc = await Analytics.findOne();
  if (!doc) {
    doc = await Analytics.create({});
  }
  return doc;
}

// Shape the document into the JSON the client expects
// (strips MongoDB-specific fields like _id, __v, createdAt, updatedAt)
function serialize(doc) {
  if (!doc) return null;
  return {
    totalFocusTime: doc.totalFocusTime,
    totalDistractions: doc.totalDistractions,
    totalTimeAway: doc.totalTimeAway,
    productiveFocusTime: doc.productiveFocusTime,
    currentStreak: doc.currentStreak,
    bestStreak: doc.bestStreak,
    completedSessions: doc.completedSessions,
  };
}

module.exports = { Analytics, getOrCreateAnalytics, serialize };
