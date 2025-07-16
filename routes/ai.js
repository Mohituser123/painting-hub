const express = require("express");
const router = express.Router();
const Painting = require("../models/painting");

router.post("/ask", async (req, res) => {
  const { question, paintingId } = req.body;

  try {
    const painting = await Painting.findById(paintingId).populate("owner");
    if (!painting) {
      return res.status(404).json({ error: "Painting not found" });
    }

    const q = question.toLowerCase();
    let response = "";

    if (q.includes("artist")) {
      response = `🎨 The artist is <b>${painting.artist}</b>.`;
    } else if (q.includes("price") || q.includes("cost")) {
      response = `💰 Price is <b>₹${painting.price.toLocaleString("en-IN")}</b>.`;
    } else if (q.includes("medium")) {
      response = `🖌️ Medium used: <b>${painting.medium}</b>.`;
    } else if (q.includes("genre") || q.includes("type")) {
      response = `🖼️ Genre: <b>${painting.genre}</b>.`;
    } else if (q.includes("title") || q.includes("name")) {
      response = `🖼️ This painting is titled <b>${painting.title}</b>.`;
    } else if (q.includes("description") || q.includes("about")) {
      response = `✨ Description: ${painting.description}`;
    } else if (q.includes("owner") || q.includes("user") || q.includes("seller")) {
      response = `👤 Owner's username is <b>${painting.owner?.username || "Unknown"}</b>.`;
    } else {
      response = "🤔 I didn't quite get that. You can ask about the artist, price, medium, genre, owner, or description.";
    }

    res.json({ response });
  } catch (err) {
    console.error("🔥 Dummy AI Error:", err);
    res.status(500).json({ error: "Something went wrong with PaintBot." });
  }
});

module.exports = router;
