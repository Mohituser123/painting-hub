const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");

  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.render("notifications/index", { notifications });
});

module.exports = router;
