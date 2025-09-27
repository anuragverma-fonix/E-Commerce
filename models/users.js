const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: [true, "Name is required"],
        trim: true,
        minlength: 2,
        maxlength: 30,
    },
    email:{
        type:String,
        required: [true, "Email is required"],
        unique:true,
        trim: true,
    },
    password:{
        type:String,
        required: [true, "Password is required"],
        minlength: 6,
        trim:true,
    },
    address: {
        type: String,
    },
    phone: {
        type: String
    },
    profileImage:{ //profile_image
        type:String,
        //Could be required
        default: null
    },
    role:{
        type:String,
        enum:["Admin","User"],
        default: "User",
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    cart: [
        {
            product_Id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "tbl_Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1,
            },
        }
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tbl_Wishlist",  // references Wishlist table
            required: true
        }
    ],
    token: {
      type: String,
    },
},
{
    timestamps: {
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
});

userSchema.pre('save', function(next) {
    
    if (this.cart && this.cart.length > 0){

        this.cart.forEach(item => {
            item.subtotal = item.quantity * item.unitprice;
        });
    }
    next();
});

const User = mongoose.model("tbl_Users", userSchema);
module.exports = User;