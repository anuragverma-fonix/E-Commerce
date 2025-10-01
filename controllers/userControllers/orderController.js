const Order = require('../../models/order');
const Product = require('../../models/product');
const Joi = require("joi");
const { response } = require('../../utils/response');
const Notification = require('../../models/notification');

const placeOrder = async(req,res) => {

    try{

        const io = req.app.get("io");
        const activeUsers = req.app.get("onlineUsers");
        // console.log("Online Users Map:", Array.from(onlineUsers.entries()));

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

        const newOrder = await Order.create({ //userId
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

        await Notification.create({
            user: id,
            type: "OrderPlaced",
            title: "Order Placed",
            message: `Your order for "${product.name}" has been successfully placed!`,
        });

        const userSocketId = activeUsers.get(id.toString());

        if (userSocketId) {

            io.to(userSocketId).emit("orderPlaced", { order: newOrder });
            console.log("Order notification sent to user:", userSocketId);

        } else {
            console.log("User is not connected via socket:", id);
        }

        // const adminSocketId = onlineUsers.get("adminId");
        
        // if (adminSocketId) {
        //     io.to(adminSocketId).emit("orderNotification", { userId, orderId: newOrder._id, item: product.name });
        // }
        
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