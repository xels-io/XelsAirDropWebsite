require('./system/require');
require('./system/loader');
const https = require('https');
const { getHomePage } = require('./controller/index');
const { walletCreate, adminCreate, passwordChange, getUpdateAddress } = require('./controller/rdd');
const { forgotPassword, passworddReset } = require('./controller/passwordReset');

const { getSignUpPage } = require('./controller/signup');
const { addRegisteredAddress, updateRegisteredAddress, updateWalletType, deleteRegisteredAddress } = require('./controller/crudRddDetails');

let encryption = require('./system/encryption');
const env = require('./config/environment');

const passport = require("./config/passport");
const dbconfig = require('./config/database');
const queryMethod = require('./controller/query');
const distribute = require('./controller/distribute');
const cors = require('cors');

//var connection = passport.connection;
const connection = mysql.createConnection(dbconfig.connection);

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});


app = express();
app.locals.userList;

//var connection = require("./config/passport");
//var models = require('./model');
// configure the app for post request data convert to json
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));



app.use(cors());

app.use(bodyParser.json({ type: 'application/json' })); // parse form data client
app.use(bodyParser.urlencoded({ extended: false }));
//ssl ce
let httpPort = 990;

let httpsPort = 1400;
// configure middleware
app.set('port', process.env.port || httpPort); // set express to use this port
app.set('views', path.join(__dirname, 'views')); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(express.static(path.join(__dirname, 'public/assets'))); // configure express to use public folder

/*  PASSPORT SETUP  */
// configure the app for passport initailization

app.use(session({
    secret: 'setAirdrop',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        sameSite: true
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


//import ssl certificate
//const httpsOptions = {
//    cert: fs.readFileSync(path.join(__dirname, 'ssl_certificate', 'xels_io.crt')),
//    ca: fs.readFileSync(path.join(__dirname, 'ssl_certificate', 'xels_io.ca-bundle')),
//    key: fs.readFileSync(path.join(__dirname, 'ssl_certificate', 'xels_io_private_key.key'))
//}


// set the app to listen on the port
const server = http.createServer(app);
//create httpsServer
// const httpsServer = https.createServer(httpsOptions, app);

// httpsServer.listen(httpsPort, () => {
//     console.log(`Listening on port: ${httpsPort}`);
// });
// var server = http.createServer((req, res) => {
//     res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
//     res.end();
// });

server.listen(990);

//app.get('/', getHomePage);
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/rddList');
    } else {
        res.render('index.ejs', { message: req.flash('loginMessage') });
    }
})

app.get('/register', getSignUpPage);
app.get('/dashboard', isLoggedIn, (req, res) => {
    queryMethod.userWalletMapping().then(rows => {
        res.render('dashboard.ejs', {
            userId: req.user.id,
            userName: req.user.email,
            admin: rows
        })
    }).catch(err => {
        console.log(err);
    });
});
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
app.get('/error', (req, res) => {
    console.log(req.session);
    res.render('error.ejs', {
        message: req.session.msg
    })
});

app.get('/rddDetails', isLoggedIn, (req, res) => {
    // console.log()
    let temp_wallet_id = req.query.id;
    queryMethod.typeOfWallet(temp_wallet_id).then(response => {

        queryMethod.registeredAddressList(temp_wallet_id).then(registeredList => {
            // console.log(registeredList);
            res.render('rddDetails.ejs', {
                walletId: temp_wallet_id,
                list: registeredList,
                walletType: response[0].typeName,
                walletName: response.length > 0 ? response[0].walletName : response[0].walletName,
                bAmount: response.length > 0 ? response[0].balance : 0
            })
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    });
});

app.post('/distributeXels', isLoggedIn, (req, res) => {
    let param = {
            walletId: req.body.wallet_id
        }
        //queryMethod.registeredAddressList(req.body.wallet_id).then(registeredList => {
    distribute.distributeXels(param)
        .then(response => {

            if (response.InnerMsg && response.InnerMsg.transactionId) {
                req.flash('message', "Distributed successfully");
                res.json({
                    message: req.flash('message')
                });
                res.end();
            } else {
                req.flash('message', "Registered address is not available");
                res.json({
                    errMessage: req.flash('message')
                });
                res.end();
            }
        }).catch(err => {
            req.flash('distributeErrMessage', err);
            res.json({
                errMessage: req.flash('distributeErrMessage')
            });
            res.end();
        });

});
app.post('/getbalance', isLoggedIn, (req, res) => {

    let walletId = req.body.wallet_id;
    distribute.getBalance(walletId).then(balance => {
        let amount = balance[0].amountConfirmed / 100000000;
        queryMethod.updateBalance(amount, walletId)
            .then(response => {
                //console.log(response);
                res.json({
                    bAmount: amount
                });
                res.end();
            }).catch(err => {
                return err;
            });

    }).catch(err => {
        console.log(err);
    });

});
app.get('/createRDD', isLoggedIn, (req, res) => {
    res.render('RDD.ejs', {
        userId: req.user.id,
        organizationId: req.user.organization_id,
        message: req.flash('rddMessage')
    });
});
app.post('/createRDDWallet', isLoggedIn, walletCreate);

app.post('/updateRDDWalletAddress', isLoggedIn, getUpdateAddress);

app.post('/deleteRegisteredList', isLoggedIn, deleteRegisteredAddress);

app.post('/updateRegisteredAddress', isLoggedIn, updateRegisteredAddress);

// app.post('/admin/delete/:id', isLoggedIn, (req, res) => {
//     const adminId = req.body.adminId;
//     //console.log(adminId);
//     queryMethod.deleteUserList(adminId).then(response => {
//         res.redirect('/rddList');
//     }).catch(err => {
//         return err;
//     });
// });

app.get('/rddList', isLoggedIn, (req, res) => {
    queryMethod.userOrganizationList(req.user.id, req.user.organization_id).then(userList => {
        app.locals.userList = userList;
        queryMethod.WalletMappingAddress(req.user.organization_id).then(response => {
            let rddArr = response;
            res.render('rddList.ejs', {
                list: rddArr,
                adminList: userList,
                userId: req.user.email,
                organizationId: req.user.organization_id
                    //message: req.flash('adminMessage'),
            });
        }).catch(err => {
            return err;
        });
    }).catch(err => {
        return err;
    });


});

app.post('/register', passport.authenticate('local-signup', {
    successRedirect: '/rddList',
    failureRedirect: '/register'
}));


app.get('/login', (req, res) => {
    res.render('index.ejs', { message: req.flash('loginMessage') });
})

// process the signup form
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/rddList', // redirect to the secure profile section
    failureRedirect: '/', // redirect back to the login page if there is an error
    failureFlash: true // allow flash messages
}));


app.post('/registerAddress', isLoggedIn, addRegisteredAddress);

app.post('/typeWallet', isLoggedIn, updateWalletType);



app.post('/rddList/admin', isLoggedIn, adminCreate);

app.post('/rddList/updatePw', isLoggedIn, passwordChange);

app.get('/about', isLoggedIn, (req, res) => {
    res.render('about.ejs', {});
});



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else {
        req['header']['Referrer'] = req.url;
        res.redirect("/");
    }
};
app.get('/forgot', function(req, res) {
    console.log("hi");
    res.render('forgot.ejs', {
        // user: req.user
    });
});

app.post('/forgotPw', forgotPassword);
//});

app.get('/reset/:token', function(req, res) {

    let time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    let userQuery = "select * from user where resetPasswordToken= '" + req.params.token + "'";
    //console.log(userQuery);
    //let userQuery = "select * from user where resetPasswordToken= '" + req.params.token + "' and DATE_FORMAT(resetPasswordExpires, 'YYYY-MM-DD HH:mm:ss') > " + time;
    connection.query(userQuery, (err, rows) => {
        if (rows.length === 0) {
            req.flash('error', 'Reset Token does not exist.');
            res.render('forgot.ejs', {
                errMessage: req.flash('error')
            });
        } else {
            let sqlTime = moment(rows[0].resetPasswordExpires).format('YYYY-MM-DD HH:mm:ss');
            if (sqlTime > time) {
                res.render('reset.ejs', {
                    token: rows
                });
            } else if (sqlTime < time) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                res.render('forgot.ejs', {
                    errMessage: req.flash('error')
                });

            }
        }

    });
});
app.post('/reset/:token', passworddReset);
// app.get('/success', (req, res) => res.send("Welcome "+req.query.username+"!!"));
// app.get('/error', (req, res) => res.send("error logging in"));


//Every route middleware
//Every route middleware
app.use(function(req, res, next) {

    // if (!req.secure) {
    //     res.redirect(301, `https://${req.headers.host}${req.url}`);
    // } 
    // else {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Assassin-RequestHash");
    global.Request = req;
    global.Response = res;
    next();
    //}

});

module.exports.isLoggedIn = isLoggedIn;
module.exports = connection;
module.exports = app;