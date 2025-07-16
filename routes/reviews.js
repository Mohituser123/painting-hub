const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");
const Painting = require("../models/painting.js");

// Show all reviews (optional route)
router.get("/", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const painting = await Painting.findById(id).populate({
        path: "reviews",
        populate: { path: "author" }
    });

    if (!painting) {
        req.flash("error", "Painting not found.");
        return res.redirect("/paintings");
    }

    res.render("reviews/index", { painting });
}));

// Create a new review
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
);

// Delete a review
router.delete(
    "/:reviewId",
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;
