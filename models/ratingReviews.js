const mongoose = require('mongoose');

const ratingReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tbl_Users",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tbl_Product",
    required: true
  },
  review: {
    type: String
  },
},
{timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
}});

const RatingReview = mongoose.model('tbl_RatingReview', ratingReviewSchema);

module.exports = RatingReview;