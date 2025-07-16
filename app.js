if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError.js");

const profileRoutes = require("./routes/profile");
const notificationRoutes = require("./routes/notifications");
const paintingRouter = require("./routes/paintings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");
const adminRoutes = require("./routes/admin.js");
const aiRoutes = require("./routes/ai");

const User = require("./models/user.js");
const Notification = require("./models/notification.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/paintstore";

main().then(() => console.log("✅ Connected to DB")).catch((err) => console.log("DB Error:", err));
async function main() {
  await mongoose.connect(MONGO_URL);
}

// ✅ View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ✅ Middleware (Correct Order!)
app.use(express.json()); // 🔥 Must come before aiRoutes
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
  secret: "supersecretpaintkey",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ GLOBAL MIDDLEWARE FOR CURRENT USER + NOTIFICATIONS
app.use(async (req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;

  if (req.user) {
    try {
      const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.locals.notifications = notifications;
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
      res.locals.notifications = [];
    }
  } else {
    res.locals.notifications = [];
  }

  next();
});

// ✅ Routes (Now ai route is in right position)
app.use("/ai", aiRoutes);
app.use("/profile", profileRoutes);
app.use("/notifications", notificationRoutes);
app.use("/paintings", paintingRouter);
app.use("/paintings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", adminRoutes);

// ✅ Home redirect
app.get("/", (req, res) => {
  res.redirect("/paintings");
});

// ✅ 404 Error Handler
app.all('*', (req, res, next) => {
    console.log("❌ Route not found:", req.originalUrl);
    next(new ExpressError("Page Not Found", 404));
});


// ✅ Final Error Handler
app.use((err, req, res, next) => {
  console.log("🔥🔥🔥 ERROR CAUGHT 🔥🔥🔥");
  console.error(err.stack || err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send(`<pre>${err.stack}</pre>`);
});

// ✅ Start Server
app.listen(8080, () => {
  console.log("🚀 Server running on port 8080");
});
