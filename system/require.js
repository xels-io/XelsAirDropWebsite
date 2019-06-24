//global.globalObj = require('../config/global');
//global.globalConst = require('../config/constants');
//global.globalConfig = require('../config/config');

path = require('path');
session = require('express-session');
//flash = require('express-flash');
//WebRoute = require('../routes/web');
//ApiRoute = require('../routes/api');
Sequelize = require('sequelize');
express = require('express');
bodyParser = require('body-parser');
mysql = require('mysql');
http = require('http');
fs = require('fs');
flash = require("connect-flash");
axios = require('axios');
Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');
dbconfig = require('../config/database');

admin = require('firebase-admin');

//app.use(flash());

//cookie = require('cookie-parser');

//passport = require('passport');


// app.locals.toUpperFirstAll =(str)=>{
//     return str.replace(/\w\S*/g, function(txt){
//         return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
//     });
// };