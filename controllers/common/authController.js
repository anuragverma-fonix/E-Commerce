const User = require('../../models/users');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const { response } = require("../../utils/response");
require('dotenv').config();

const register = async(req,res) => {

    try{
        const {name,email,password,address,phone} = req.body;
        const file = req.file;
        // console.log(req.body);
        // console.log(file);

        const existUser = await User.findOne({email});
        // console.log(existUser);

        if(existUser){
            return response(res, 400, "User Exists!");
        }

        const schema = Joi.object({
            name: Joi.string().min(3).max(30).required().messages({
                'string.empty': 'Name is required',
                'string.min': 'Name should have at least 3 characters',
                'string.max': 'Name should not exceed 30 characters'
            }),
            email: Joi.string().email().required().messages({
                'string.empty': 'Email is required',
                'string.email': 'Invalid email format'
            }),
            password: Joi.string().min(6).max(30).required().messages({
                'string.empty': 'Password is required',
                'string.min': 'Password should be at least 6 characters',
                'string.max': 'Password should not exceed 30 characters'
            }),
        })

        const {error, value} = schema.validate(
            {name,email,password},
            { abortEarly: false }
        );

        if(error){
            return response(res, 400, "Bad Request");
        }

        let hashed_password = await bcrypt.hash(password, 10);
        // console.log(hashedpassword);

        const newUser = await User.create({
            name:name,
            email:email,
            password: hashed_password,
            profileImage: file ? file.path : null,
            role: "User",
            address: address || null,
            phone: phone || null,

        })
        // console.log(newUser);

        const payload = {
            id: newUser._id,
            email: newUser.email,
            role: newUser.role,
        }
        // console.log(payload);

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
        // console.log(token);
        
        newUser.token = token;
        newUser.tokenExpiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
        await newUser.save();
        newUser.password = undefined;

        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 days
            httpOnly: true
        }

        return res.cookie('token', token, options).status(200).json({
            success: true,
            token,
            message: "User registered Successfully"
        })

    }catch(error){
        console.log("register:",error)
        return response(res, 500, "Internal Server Error")

    }
}

const login = async(req,res) => {

    try{

        const {email, password} = req.body;
        // console.log(req.body);
        // console.log("Entered password:", password);

        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(30).required(),
        })

        const{error,value} = schema.validate(
            { email,password },
            { abortEarly: false }
        );

        if(error){
            console.log("validation error:",error)
            return response(res, 400, "Bad Request")
        }

        const existUser = await User.findOne({email});
        // console.log(existUser);

        if(!existUser){
            return response(res, 400, "User does not Exists!")
        }

        // console.log("Stored hash:", existUser.password);
        const vaildUser = await bcrypt.compare(password, existUser.password);
        // console.log(vaildUser);

        if(!vaildUser){
            return response(res, 400, "Incorrect password");
        }

        const payload = {
            id:existUser._id,
            email: existUser.email,
            role: existUser.role,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
        // console.log(token);

        existUser.token = token;
        await existUser.save();
        existUser.password = undefined;

        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 days
            httpOnly: true
        }

        return res.cookie('token', token, options).status(200).json({
            success: true,
            token,
        })
 
    }catch(error){
        console.log("login error:", error)
        response(res, 500, "Internal Server Error")

    }
}

const logout = async (req, res) => {

  try {

    const userId = req.user?.id;

    if (!userId) {
      return response(res, 401, "User not authenticated");
    }

    // Find user and clear the token field
    await User.findByIdAndUpdate(userId, { $unset: { token: "", tokenExpiresAt: "" } });

    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
    });

    return response(res, 200, "User logged out successfully");

  } catch (error) {
    console.log("logout error:", error);
    return response(res, 500, "Internal Server Error");
  }
};

module.exports = {
    register,
    login,
    logout
}