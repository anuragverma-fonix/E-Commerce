const { response } = require('../utils/response');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const auth = async(req,res,next) => {

    try{

        const token = req.cookies.token || req.header('Authorization').replace('Bearer ','').trim();
        // console.log(token);

        if(!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decode;

        next();

    }catch(error){

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
        return response(res, 500, 'Internal Server Error');
    }
}

module.exports = {
    auth,
    isAdmin,
    
}