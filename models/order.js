const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_Users",
    },
    products: {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tbl_Product",
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
            min: [1, "Quantity must be at least 1"],
        },
        price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"],
        }
    },
    total_price: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },

    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    address: {
        type: String,
    },
    gst_charge: {
        type: Number,
    },
    shipping_charge: {
        type: Number,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tbl_Transaction",
    },
    payment_status: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending"
    }

},{timestamps: true})


const Order = mongoose.model("tbl_Order", orderSchema); //tbl_order
module.exports = Order; 