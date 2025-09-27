const User = require("../../models/users");
const Product = require("../../models/product");

// Helper: Validate ObjectId
// const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getCart = async (req, res) => {

    const userId = req.user.id;

    // if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid user ID" });

    try {

        const user = await User.findById(userId).populate("cart.product_Id");

        if (!user) return res.status(404).json({ message: "User not found" });

        const cartWithSubtotal = user.cart.map(item => ({
            ...item.toObject(),
            subtotal: item.quantity * (item.product_Id.price || 0)
        }));

        const total = cartWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);

        res.json({ cart: cartWithSubtotal, total });

    } catch (err) {
        console.log("getCart error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const addToCart = async (req, res) => {

    const userId = req.user.id;
    const { product_Id, quantity } = req.body;

    // if (!isValidObjectId(userId) || !isValidObjectId(product_Id))
    //     return res.status(400).json({ message: "Invalid ID" });

    try {

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const product = await Product.findById(product_Id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const itemIndex = user.cart.findIndex(item => item.product_Id.toString() === product_Id);

        if (itemIndex > -1) {

            user.cart[itemIndex].quantity += quantity || 1;

        } else {
            user.cart.push({ product_Id, quantity: quantity || 1 });
        }

        await user.save();

        res.json({ message: "Product added to cart", cart: user.cart });

    } catch (err) {

        console.log("addToCart error:", err);
        res.status(500).json({ message: "Internal Server Error" });

    }
};

const updateCartItem = async (req, res) => {

    const userId = req.user.id;
    const {product_Id, quantity} = req.body;

    // if (!isValidObjectId(userId) || !isValidObjectId(product_Id))
    //     return res.status(400).json({ message: "Invalid ID" });

    if (!quantity || quantity < 1)
        return res.status(400).json({ message: "Quantity must be >= 1" });

    try {

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        const itemIndex = user.cart.findIndex(item => item.product_Id.toString() === product_Id);

        if (itemIndex === -1) return res.status(404).json({ message: "Product not in cart" });

        user.cart[itemIndex].quantity = quantity;

        await user.save();

        res.json({ message: "Cart updated successfully", cart: user.cart });

    } catch (err) {

        console.log("update-cart error:", err);
        res.status(500).json({ message: "Internal Server Error" });

    }
};

const removeCartItem = async (req, res) => {  //eeeee

    const productId = req.params.id;
    const userId = req.user.id;

    // if (!isValidObjectId(userId) || !isValidObjectId(productId))
    //     return res.status(400).json({ message: "Invalid ID" });

    try {

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.cart = user.cart.filter(item => item.product_Id.toString() !== productId);
        await user.save();

        res.json({ message: "Product removed from cart", cart: user.cart });

    } catch (err) {
        console.log("remove-form-cart error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const clearCart = async (req, res) => {

    const userId = req.user.id;

    // if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid user ID" });

    try {

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.cart = [];

        await user.save();

        res.json({ message: "Cart cleared successfully" });

    } catch (err) {

        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
}