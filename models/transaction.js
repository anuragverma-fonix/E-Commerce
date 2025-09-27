const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tbl_Order",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tbl_Users",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending"
  },
  transactionId: {
    type: String
  },
  failureReason: {
    type: String
  },
},
{ timestamps: {
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
});

const Transaction = mongoose.model('tbl_Transaction', transactionSchema);

module.exports = Transaction;
