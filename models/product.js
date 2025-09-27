const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [30, "Name can be at most 30 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
    },
    status : {
      type: String,
      enum: ["active", "inactive"],
    },
    is_featured: {
      type: Boolean
    },
    video_url: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_Category",
      required: [true, "Category is required"],
    },
    rating: {
      type: Number,
      default: 5,
      min: [0, "Ratings cannot be negative"],
      max: [5, "Ratings cannot exceed 5"],
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_RatingReview",
      },
    ],
    image: {
      type: String
    }
  },
  { timestamps: {
      createdAt:"created_at",
      updatedAt:"updated_at"
    } 
  }
);

productSchema.virtual('averageRating').get(function() {
    if (this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    return sum / this.ratings.length;
});

const Product = mongoose.model("tbl_Product", productSchema);

module.exports = Product;