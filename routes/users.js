const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Painting = require("../models/painting");
const { isLoggedIn } = require("../middleware");

// =======================
// 🔐 AUTH ROUTES
// =======================

// GET signup form
router.get("/signup", (req, res) => {
  res.render("users/signup");
});

// POST signup
router.post("/signup", async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to PaintStore!");
      res.redirect("/paintings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
});

// GET login form
router.get("/login", (req, res) => {
  res.render("users/login");
});

// POST login
router.post("/login", passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true
}), (req, res) => {
  req.flash("success", `Welcome back, ${req.user.username}!`);
  res.redirect("/paintings");
});

// LOGOUT
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Goodbye!");
    res.redirect("/paintings");
  });
});

// =======================
// 👤 USER PROFILE & FAVORITES
// =======================

// ✅ Corrected: /profile/:id
router.get("/profile/:id", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.id).populate("favorites");
  const paintings = await Painting.find({ owner: user._id });
  res.render("users/profile", { user, paintings });
});

// ✅ Corrected: /profile/:id/favorites
router.get("/profile/:id/favorites", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.id).populate("favorites");
  res.render("users/favorites", { user });
});

// ✅ Toggle favorite
router.post("/profile/:id/favorites/:paintingId", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.params.id);
  const { paintingId } = req.params;
  const index = user.favorites.indexOf(paintingId);

  if (index === -1) {
    user.favorites.push(paintingId);
  } else {
    user.favorites.splice(index, 1);
  }

  await user.save();
  res.json({ success: true });
});

module.exports = router;
