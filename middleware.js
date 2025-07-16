const Painting = require("./models/painting");
const Review = require("./models/review");
const { paintingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to perform this action!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let painting = await Painting.findById(id);

    if (!painting) {
        req.flash("error", "Painting not found.");
        return res.redirect("/paintings");
    }

    if (!painting.owner || !req.user || !req.user._id || !painting.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that.");
        return res.redirect(`/paintings/${id}`);
    }

    next();
};

module.exports.validatePainting = (req, res, next) => {
    let { error } = paintingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/paintings/${id}`);
  }

  // ✅ FIX: Check if req.user exists first!
  if (!req.user || !review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/paintings/${id}`);
  }

  next();
};

// middleware.js

module.exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  req.flash("error", "You are not authorized to access admin panel.");
  return res.redirect("/");
};
