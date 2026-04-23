const mongoose = require('mongoose');
require('dotenv').config();

const mongURL_local =
  process.env.DB_URL_LOCAL || process.env.DB_URL || 'mongodb://127.0.0.1:27017/seo';

mongoose.connect(mongURL_local, {});



const db=mongoose.connection;
db.on('connected',()=>{
    console.log("server got connected");
});
db.on('disconnected',()=>{
    console.log("server got disconnected");
});
db.on('error',(err)=>{
    console.error("server got disconnected",err);
});
module.exports = db;
