const { response } = require('../utils/response');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

require('dotenv').config();

const auth = async(req,res,next) => {

    try{

        const token = req.cookies?.token || (req.header('Authorization')?.replace('Bearer ','').trim());
        // console.log(token);

        if(!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

        let decode;
        
        try {
            decode = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {

        if (err.name === "TokenExpiredError") {
            return response(res, 401, "Session expired, please login again");
        }

        return response(res, 401, "Unauthorized: Invalid token");

        }

        const user = await User.findById(decode.id);

        if (!user || user.token !== token) {
            return response(res, 401, "Unauthorized: Token is invalid or revoked");
        }

        if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
            return response(res, 401, "Session expired, please login again");
        }

        req.user = decode;

        next();

    }catch(error){
        console.log("auth middleware error:", error);
        return response(res, 500, "Internal Server Error")

    }
}

const isAdmin = async(req,res,next) => {

    try{

        const role = req.user.role;

        if(!role){
            return response(res, 404, 'Please authenticate to access this resource');
        }
        
        if(!role === "Admin"){
            return response(res, 400, 'This route is protected by Admin')
        }

        next();    

    }
    catch(e){

        // return res.status(500).json({
        //     success: false,
        //     message: 'Internal Server Error'
        // })
        console.log("isAdmin Middleware error:",e)
        return response(res, 500, 'Internal Server Error');
    }
}

module.exports = {
    auth,
    isAdmin,
    
}