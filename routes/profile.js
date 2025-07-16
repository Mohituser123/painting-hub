const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Painting = require("../models/painting");
const { isLoggedIn } = require("../middleware");

// GET: User Dashboard
router.get("/:userId/dashboard", isLoggedIn, async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).populate("favorites");
  const userPaintings = await Painting.find({ owner: userId });

  if (!user) {
    req.flash("error", "User not found!");
    return res.redirect("/paintings");
  }

  res.render("users/dashboard", { user, userPaintings });
});

// POST: Toggle Favorite
router.post("/:userId/favorites/:paintingId", isLoggedIn, async (req, res) => {
  const { userId, paintingId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const index = user.favorites.indexOf(paintingId);
  if (index === -1) {
    user.favorites.push(paintingId); // Add to favorites
  } else {
    user.favorites.splice(index, 1); // Remove from favorites
  }

  await user.save();
  res.status(200).json({ success: true });
});

module.exports = router;
