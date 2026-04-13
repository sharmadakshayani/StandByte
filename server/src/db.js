// ═══════════════════════════════════════════════════
// MongoDB connection via Mongoose
// ═══════════════════════════════════════════════════
//
// Reads MONGODB_URI from the environment. Works with either:
//   - Local:  mongodb://localhost:27017/standbyte
//   - Atlas:  mongodb+srv://user:pass@cluster.mongodb.net/standbyte
//
// Default falls back to local on port 27017.

const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/standbyte";

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    const host = mongoose.connection.host;
    const name = mongoose.connection.name;
    console.log(`[db] MongoDB connected → ${host}/${name}`);
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);
    console.error(
      "[db] Make sure MongoDB is running (local) or MONGODB_URI is set (Atlas)"
    );
    process.exit(1);
  }
}

// Graceful shutdown — close the connection cleanly when the process exits
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("[db] MongoDB connection closed");
  process.exit(0);
});

module.exports = { connectDB, mongoose };
