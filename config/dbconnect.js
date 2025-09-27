const mongoose = require('mongoose');
require('dotenv').config();

const dbconnect = async(req,res) => {

    mongoose.connect(process.env.MONGO_URL)
    .then( () => {
        console.log("MongoDB Connected!");
    })
    .catch( (e) => {
        console.log("Connection failed");
        process.exit(1);
    })
}

module.exports = dbconnect;