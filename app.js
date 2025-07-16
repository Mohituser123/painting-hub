if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
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

// ✅ MongoDB connection
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/paintstore";
console.log("✅ DB URL:", dbUrl);

main()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.log("❌ MongoDB connection error:");
    console.error(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// ✅ View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Middleware
app.use(express.json()); // for AI JSON
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// ✅ Session store using MongoDB Atlas
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET || "devsecretkey" },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("❌ Session store error!");
});

const sessionOptions = {
  store,
  secret: process.env.SECRET || "devsecretkey",
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

// ✅ Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ GLOBAL middleware for flash + notifications
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

// ✅ Routes
app.use("/ai", aiRoutes);
app.use("/profile", profileRoutes);
app.use("/notifications", notificationRoutes);
app.use("/paintings", paintingRouter);
app.use("/paintings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", adminRoutes);

// ✅ Home route
app.get("/", (req, res) => {
  res.redirect("/paintings");
});

// ✅ 404 route (🛠️ FIXED 🛠️)
app.all("*", (req, res, next) => {
  console.log("❌ Route not found:", req.originalUrl);
  next(new ExpressError(404, "Page Not Found"));
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.log("🔥🔥🔥 ERROR CAUGHT 🔥🔥🔥");
  console.error(err.stack || err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send(`<pre>${err.stack || err.message}</pre>`);
});

// ✅ Start server
app.listen(8080, () => {
  console.log("🚀 Server running on port 8080");
});
