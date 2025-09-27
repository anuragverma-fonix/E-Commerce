const Joi = require("joi");
const Order = require('../../models/order');
const { response } = require('../../utils/response')

const viewOrder = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        const schema = Joi.object({
            id: Joi.string().length(24).hex().required(), // MongoDB ObjectId validation
        });

        const { error } = schema.validate({ id });
        
        if (error) {
            return response(res, 400, "Invalid Order ID");
        }

        // Fetch the order
        const order = await Order.findById(id)
            .populate("user", "name email")
            .populate("products.product", "name price"); // populate products if needed

        if (!order) {
            return response(res, 404, "Order not found");
        }

        return response(res, 200, "Order fetched successfully", order);

    } catch (error) {
        console.error("View order by ID error:", error);
        return response(res, 500, "Internal Server Error");
    }
}

const getOrdersByUserId = async (req, res) => {

  try {

    const userId = req.user.id;

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Validate userId as MongoDB ObjectId
    const schema = Joi.object({
      userId: Joi.string().length(24).hex().required(),
    });

    const { error } = schema.validate({ userId });

    if (error) {
      return response(res, 400, "Invalid User ID");
    }

    // Fetch orders of this user
    const orders = await Order.find({ user: userId })
      .populate("user", "name email")
      .populate("products.product", "name price")
      .skip(skip)
      .limit(limit);

    if (!orders || orders.length === 0) {
      return response(res, 404, "No orders found for this user");
    }

    return response(res, 200, "Orders fetched successfully", {
      orders,
      pagination: {
        limit,
        page,
      }
    });

  } catch (error) {

    console.error("Get orders by userId error:", error);
    return response(res, 500, "Internal Server Error");
    
  }
};

module.exports = {
    viewOrder,
    getOrdersByUserId
}