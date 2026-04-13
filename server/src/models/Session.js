// ═══════════════════════════════════════════════════
// Session model — one document per focus session
// ═══════════════════════════════════════════════════

const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    focusTime:    { type: Number, required: true, min: 0 },
    distractions: { type: Number, default: 0, min: 0 },
    timeAway:     { type: Number, default: 0, min: 0 },    // ms spent away from tab
    proctored:    { type: Boolean, default: false },
    completed:    { type: Boolean, default: false },
    pomodoro:     { type: Boolean, default: false },        // was this a pomodoro session
    blocksCompleted: { type: Number, default: 1, min: 0 }, // for pomodoro: how many focus blocks finished
    timestamp:    { type: Number, required: true },         // unix ms
  },
  { timestamps: true }
);

sessionSchema.index({ timestamp: 1 });

const Session = mongoose.model("Session", sessionSchema);

function serialize(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    focusTime: doc.focusTime,
    distractions: doc.distractions,
    timeAway: doc.timeAway || 0,
    proctored: doc.proctored,
    completed: doc.completed,
    pomodoro: doc.pomodoro || false,
    blocksCompleted: doc.blocksCompleted || 1,
    timestamp: doc.timestamp,
  };
}

module.exports = { Session, serialize };
