require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Event = require("./models/Event");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 💥 CONNECT TO DB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 📸 GET route to load events
app.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 });
    console.log("📤 Sending event data:", events); // DEBUG LOG
    res.json(events);
  } catch (err) {
    console.error("❌ Failed to fetch events:", err);
    res.status(500).json({ error: "Could not fetch events" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
