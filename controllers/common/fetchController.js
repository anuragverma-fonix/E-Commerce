const Product = require("../../models/product");
const User = require("../../models/users");
const { response } = require("../../utils/response");
const Joi = require("joi");
const path = require('path');
const fs =  require("fs");
require('dotenv').config();
const bcrypt = require('bcrypt');

const fetchProfile = async(req,res) => {

    try{

        const {id} = req.user;
        // console.log(id)

        const profile = await User.findById(id);
        // console.log(profile);

        const profileData = profile.toObject();

        if (profileData.profileImage) {
            profileData.profileImage = `${process.env.BASE_URL}${profileData.profileImage.replace(/\\/g, '/')}`;
        }

        profileData.password = undefined;

        return response(res, 200, "Profile fetched Successfully", profileData);

    }catch(error){
        console.log(error);
        response(res, 500, "Internal Server Error");
    }
}

const updateProfile = async(req,res) => {

    try{

        const {name,email,address,phone,password} = req.body;
        const {id} = req.user;
        const file = req.file;
        // console.log(req.body);
        // console.log(id);
        // console.log(file);
        
        const user = await User.findById(id);

        if (!user) {
            return response(res, 404, "User not found");
        }

        let updated = false;

        if (name) {
            // if (name === user.name) {
            //     return response(res, 400, "You already made this name change");
            // }
            user.name = name;
            // updated = true;
        }

        if (email) {

            // if (email === user.email) {
            //     return response(res, 400, "You already made this email change");
            // }

            const emailExists = await User.findOne({ email });

            if (emailExists) {
                return response(res, 400, "Email already in use");
            }

            user.email = email;
            // updated = true;
        }

        if (address) {

            // if (address === user.address) {
            //     return response(res, 400, "You already made this address change");
            // }

            user.address = address;
            // updated = true;
        }

        if (phone) {

            const phoneExists = await User.findOne({ phone });

            if (phoneExists) {
                return response(res, 400, "Phone already in use");
            }

            // if (phone === user.phone) {
            //     return response(res, 400, "You already made this phone change");
            // }

            user.phone = phone;
            // updated = true;
        }


        if (password) {

            const isSamePassword = await bcrypt.compare(password, user.password);

            if (isSamePassword) {
                return response(res, 400, "You already made this password change");
            }

            const hashed_password = await bcrypt.hash(password, 10);
            user.password = hashed_password;

            updated = true;
        }

        if (file) {

            if (user.profileImage && user.profileImage === file.path) {
                return response(res, 400, "You already made this profile image change");
            }

            if (user.profileImage) {

                const oldImagePath = path.resolve(user.profileImage);
                
                await fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Failed to delete old image:", err);
                });
            }

            user.profileImage = file.path;
            updated = true;

        }

        if (!updated) {
            return response(res, 400, "No changes detected");
        }

        const updatedUser = await user.save();
        // console.log(updatedUser);

        const profileData = updatedUser.toObject();

        if (profileData.profileImage) {
            profileData.profileImage = `${process.env.BASE_URL}${profileData.profileImage.replace(/\\/g, '/')}`;
        }

        profileData.password = undefined;

        return response(res, 200, "Profile updated successfully", profileData);

    }catch(error){
        console.error("Error updating profile:", error);
        response(res, 500, "Internal Server Error");
    }
}

const changePassword = async(req,res) => {

    try{

        const {password} = req.body;
        const {id} = req.user;
        // console.log(password);
        // console.log(id);
        
        const schema = Joi.object({
            password: Joi.string().min(6).max(30).required(),
        })

        const{error,value} = schema.validate(
            { password },
            { abortEarly: false }
        );

        if(error){
            return response(res, 400, "Bad Request")
        }

        const user = await User.findById(id);

        if (!user) {
            return response(res, 404, "User not found");
        }

        const hashed_password = await bcrypt.hash(password,10);

        user.password = hashed_password;
        await user.save();

        user.password = undefined;

        return response(res, 200, "Password updated successfully", user);

    }catch(error){
        console.error("Error updating profile:", error);
        return response(res, 500, "Internal Server Error");
    }
}

module.exports = {
    fetchProfile,
    updateProfile,
    changePassword
}