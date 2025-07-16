// routes/admin.js

const express = require("express");
const router = express.Router();
const Painting = require("../models/painting");
const User = require("../models/user");
const Review = require("../models/review");
const { isAdmin } = require("../middleware");

// Admin Dashboard
router.get("/dashboard", isAdmin, async (req, res) => {
  const totalPaintings = await Painting.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalReviews = await Review.countDocuments();
  const latestPaintings = await Painting.find({}).sort({ createdAt: -1 }).limit(5);

  res.render("admin/dashboard", {
    totalPaintings,
    totalUsers,
    totalReviews,
    latestPaintings,
  });
});

module.exports = router;
