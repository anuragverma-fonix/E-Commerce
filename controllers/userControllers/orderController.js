const Order = require('../../models/order');
const Product = require('../../models/product');
const Joi = require("joi");
const { response } = require('../../utils/response');
const sendNotification = require("../../utils/notify");

const placeOrder = async(req,res) => {

    try{

        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");

        const {id} = req.user;
        const { productId, quantity = 1, address } = req.body;
        // console.log("User:", id);
        // console.log("Products:", products);

        if (!productId) {
            return response(res, 400, "Product ID is required");
        }

        const product = await Product.findById(productId);

        if (!product) {
            return response(res, 404, "Product not found");
        }

        if (product.quantity < quantity) {
            return response(res, 400, "Insufficient stock available");
        }

        const itemPrice = Number(product.price);
        const subTotal = itemPrice * Number(quantity);
        const gst_charge = +(subTotal * 0.18).toFixed(2);
        const shipping_charge = 40;
        const totalPrice = subTotal + Number(gst_charge) + Number(shipping_charge);

        product.quantity -= quantity;
        await product.save();

        const newOrder = await Order.create({
            user: id,
            products: {
                product: product._id,
                quantity,
                price: itemPrice
            },
            total_price: totalPrice,
            status: "Processing",
            address,
            gst_charge,
            shipping_charge
        });
        // console.log(newOrder);

        await sendNotification({
            userId: id,
            type: "OrderPlaced",
            title: "Order Placed",
            message: "Your order has been successfully placed!"
        }, io, onlineUsers);

        // return response
        return response(res, 201, "Order placed successfully", newOrder);

    }catch(error){
        console.log("error:", error)
        return response(res, 500, "Internal Server Error");
    }
}

const cancelOrder = async (req, res) => {
    try {
        const { id } = req.user; // logged in user
        const orderId = req.params.id;

        const order = await Order.findOne({ _id: orderId, user: id }).populate("products.product");

        if (!order) {
            return response(res, 404, "Order not found");
        }

        if (order.status === "Cancelled") {
            return response(res, 400, "Order is already cancelled");
        }

        if (order.status === "Delivered") {
            return response(res, 400, "Delivered orders cannot be cancelled");
        }

        // Restore stock
        const product = await Product.findById(order.products.product);

        if (product) {
            product.quantity += order.products.quantity;
            await product.save();
        }

        // Update order status
        order.status = "Cancelled";
        await order.save();

        const resultOrder = await Order.findOne({orderId}).populate().select('user ')

        return response(res, 200, "Order cancelled successfully", order);

    } catch (error) {
        console.error("Cancel order error:", error);
        return response(res, 500, "Internal Server Error");
    }
};

module.exports = {
    placeOrder,
    cancelOrder,
}