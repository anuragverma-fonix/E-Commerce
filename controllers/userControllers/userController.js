const Product = require('../../models/product');
const { response } = require('../../utils/response');
const Joi = require("joi");
const RatingReview = require('../../models/ratingReviews');


const createReview = async (req, res) => {

  try {

    const { review } = req.body;
    const {id} = req.user;
    const pid = req.params.id;
    // console.log(review);
    // console.log(id);
    // console.log(pid);

    const productExists = await Product.findById(pid);

    if (!productExists) return response(res, 404, "Product not found");

    const alreadyReviewed = await RatingReview.findOne({user: id, product: pid});

    if(alreadyReviewed){
      return response(res, 400, "Already Reviewed!");
    }

    // Validate input
    const schema = Joi.object({

      pid: Joi.string().required(),
      review: Joi.string().max(500).required(),

    });

    const { error } = schema.validate({ pid, review });

    if (error) return response(res, 400, error.details[0].message);

    // Ensure product exists
    const product = await Product.findById(pid);
    // console.log(product);

    if (!product) return response(res, 404, "Product not found");

    // Create review
    const newReview = await RatingReview.create({
      user: id,
      product: pid,
      review,
    });

    // Push review reference into Product
    product.reviews.push(newReview._id);
    await product.save();

    return response(res, 201, "Review created successfully", newReview);

  } catch (err) {
    console.error("Create review error:", err);
    return response(res, 500, "Internal Server Error");
  }
};

const getProductReviews = async (req, res) => {

  try {

    const pid = req.params.id;

    const reviews = await RatingReview.find({ product: pid })
      .populate("user", "name email")
      .populate("product", "name description");

    return response(res, 200, "Product reviews fetched successfully", reviews);

  } catch (err) {

    console.error("Get reviews error:", err);
    return response(res, 500, "Internal Server Error");

  }
};

const updateReview = async (req, res) => {

  try {

    const reviewId = req.params.id;
    const { review } = req.body;
    const userId = req.user.id;

    // Validate
    const schema = Joi.object({
      review: Joi.string().max(500).required(),
    });

    const { error } = schema.validate({ review });

    if (error) return response(res, 400, error.details[0].message);

    const existingReview = await RatingReview.findOneAndUpdate(
      { _id: reviewId, user: userId }, // ensure user can only update their review
      { review },
      { new: true }
    );

    if (!existingReview) return response(res, 404, "Review not found or not authorized");

    return response(res, 200, "Review updated successfully", existingReview);

  } catch (err) {

    console.error("Update review error:", err);
    return response(res, 500, "Internal Server Error");

  }
};

const deleteReview = async (req, res) => {
    
  try {

    const reviewId = req.params.id;
    const userId = req.user.id;

    const review = await RatingReview.findOneAndDelete({
      _id: reviewId,
      user: userId, // ensure user can only delete their review
    });

    if (!review) return response(res, 404, "Review not found or not authorized");

    // Remove reference from Product
    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: reviewId },
    });

    return response(res, 200, "Review deleted successfully");
    
  } catch (err) {

    console.error("Delete review error:", err);
    return response(res, 500, "Internal Server Error");

  }
};

module.exports = {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview
}