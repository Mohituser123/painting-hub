const Painting = require("../models/painting");
const Review = require("../models/review");
const Notification = require("../models/notification");
const User = require("../models/user");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const painting = await Painting.findById(id).populate("owner");

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    painting.reviews.push(newReview);

    await newReview.save();
    await painting.save();

    // ✅ Send notification to the owner
    if (painting.owner && painting.owner._id.toString() !== req.user._id.toString()) {
        const notif = new Notification({
            message: `${req.user.username} reviewed your painting "${painting.title}"`,
            user: painting.owner._id,
            link: `/paintings/${painting._id}`
        });
        await notif.save();
    }

    req.flash("success", "Review added successfully!");
    res.redirect(`/paintings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    await Painting.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully!");
    res.redirect(`/paintings/${id}`);
};
