const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tbl_Users",
    required: true
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_Product",
      required: true
    }
  ],
},
{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});


const Wishlist = mongoose.model('tbl_Wishlist', wishlistSchema);

module.exports = Wishlist;
