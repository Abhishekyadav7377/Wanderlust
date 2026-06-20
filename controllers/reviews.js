const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async(req, res) => {
   req.body.review.rating = Number(req.body.review.rating);
   let listing = await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);
   newReview.author = req.user._id;
   listing.reviews.push(newReview);
   await newReview.save();
   await listing.save();
   req.flash("success", "Review Added!");
   res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => { // ✅ isReviewAuthor add kiya
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};