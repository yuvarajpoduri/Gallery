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
    // Sort by timestamp in descending order (-1 = newest first)
    const events = await Event.find().sort({ timestamp: -1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add this route to your Express.js server file

// Route to handle like/unlike
app.post("/events/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { increment } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Initialize likes if it doesn't exist
    if (event.likes === undefined) {
      event.likes = 0;
    }

    // Increment or decrement likes
    if (increment) {
      event.likes += 1;
    } else {
      event.likes = Math.max(0, event.likes - 1); // Prevent negative likes
    }

    await event.save();

    res.json({
      success: true,
      likes: event.likes,
    });
  } catch (error) {
    console.error("Error updating likes:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
