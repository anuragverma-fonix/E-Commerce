const {response} = require('../../utils/response');
const Order = require('../../models/order');
const Joi = require("joi");
const User = require('../../models/users');
const Product = require('../../models/product')
const sendNotification = require('../../utils/notify')

const viewOrders = async(req,res) => {

    try{

        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        const { status } = req.query;
        // console.log(page, limit);
        // console.log(status);

        const schema = Joi.object({
            page: Joi.number().min(1).required(),
            status: Joi.string().valid("Processing", "Shipped", "Delivered", "Cancelled").optional()
        })

        const {error, value} = schema.validate({page,status}, {abortEarly: false});

        if(error){
            return response(res, 400, "Provide minimum of 1 page number");
        }

        let skip = (page - 1) * limit;

        let filter = {};

        if (status) {
            filter.status = status;
        }
        // console.log(filter);

        const order = await Order.find(filter)
        .populate().skip(skip).limit(limit);
        // .populate("products.product", "name price");
        
        return response(res, 200, "Order Data fetched Successfully", order);

    }catch(error){
        console.log("error viewOrders:", error);
        return response(res, 500, "Internal Server Error");
    }
}

const orderStatus = async(req,res) => {

    try{

        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");

        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        const oid = req.params.id;
        const { status } = req.body;
        // console.log(oid);
        // console.log(req.body);

        const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

        if (!validStatuses.includes(status)) {
            return response(res, 400, "Invalid status value");
        }

        const order = await Order.findById(oid);

        if (!order) return response(res, 404, "Order not found");

        const updatedOrder = await Order.findByIdAndUpdate(
            oid,
            { status },
            {new : true}
        ).populate("user", "name email");
        // .populate("products.product", "name price");

        if (!updatedOrder) {
            return response(res, 404, "Order not found");
        }

        // order.status = status;
        // await order.save();

        let notificationData = null;

        if (status === "Shipped") {

        notificationData = {

            userId: order.user._id,
            type: "OrderShipped",
            title: "Order Shipped",
            message: "Your order has been shipped. It will arrive soon!",

        };
        } else if (status === "Delivered") {

            notificationData = {

                userId: order.user._id,
                type: "OrderDelivered",
                title: "Order Delivered",
                message: "Your order has been delivered successfully!",

            };
        } else if (status === "Cancelled") {

            notificationData = {
                userId: order.user._id,
                type: "OrderCancelled",
                title: "Order Cancelled",
                message: "Your order has been cancelled.",
                
            };
        }

        if (notificationData) {
            await sendNotification(notificationData, io, onlineUsers);
        }

        // const skip = (page - 1) * limit;
        // const filter = { user: order.user._id };
        // console.log(order);
        // console.log(filter);
        // const totalItems = await Order.countDocuments(filter);
        // console.log(totalItems);
        // const totalPages = Math.ceil(totalItems / limit);

        // const userOrders = await Order.find(filter)
        //     .populate("user", "name email")
        //     .skip(skip)
        //     .limit(limit)
        //     .sort({ createdAt: -1 });
        
        return response(res, 200, "Order Data Updated Successfully", {
            updatedOrder,
            // orders: userOrders,
            pagination: {
                limit: limitNum,
                page: pageNum,
                total: totalItems,
                totalPages
            }
        });

    }catch(error){
        console.log("order-status", error);
        return response(res, 500, "Internal Server Error");
    }
}

const deleteOrder = async (req, res) => {
    try {

        const { id } = req.params;

        // Validate MongoDB ObjectId
        const schema = Joi.object({
            id: Joi.string().length(24).hex().required(),
        });

        const { error } = schema.validate({ id });

        if (error) return response(res, 400, "Invalid Order ID");

        const order = await Order.findById(id);
        if (!order) return response(res, 404, "Order not found");

        await Order.deleteOne({ _id: id });

        return response(res, 200, "Order deleted successfully");

    } catch (error) {
        
        console.error("Delete order error:", error);
        return response(res, 500, "Internal Server Error");
    }
};

const dashboardStats = async (req, res) => {

    try {

        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // Aggregate orders for total sales, total orders, total products sold
        const orderStats = await Order.aggregate([
            { $unwind: "$products" }, // flatten products array
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total_price" },
                    totalOrders: { $sum: 1 },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSales: 1,
                    totalOrders: 1,
                }
            }
        ]);

        // Total registered users
        const totalCustomers = await User.countDocuments();

        //Total Products
        const totalProducts = await Product.countDocuments();

        const recentProducts = await Product.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("name price createdAt");

        const recentUsers = await User.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("name email createdAt");

        const recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("orderNumber total_price status createdAt");
        

        return response(res, 200, "Dashboard statistics fetched successfully", {
            totalSales: orderStats[0]?.totalSales || 0,
            totalOrders: orderStats[0]?.totalOrders || 0,
            totalProducts,
            totalCustomers,
            recentProducts,
            recentUsers,
            recentOrders,
            pagination: {
                page,
                limit,
            },
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        return response(res, 500, "Internal Server Error");
    }
};

module.exports = {
    viewOrders,
    deleteOrder,
    orderStatus,
    dashboardStats
}