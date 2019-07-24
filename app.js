require('./system/require');
require('./system/loader');
const https = require('https');
const { getHomePage } = require('./controller/index');
const { walletCreate, adminCreate, passwordChange, getUpdateAddress, getRddWalletAdminList } = require('./controller/rdd');
const { forgotPassword, passworddReset, getToken } = require('./controller/passwordReset');

const { getSignUpPage } = require('./controller/signup');
const { getRddDetails, addRegisteredAddress, updateRegisteredAddress, updateWalletType, deleteRegisteredAddress } = require('./controller/crudRddDetails');

//let encryption = require('./system/encryption');
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
const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, 'ssl_certificate', 'xels_io.crt')),
    ca: fs.readFileSync(path.join(__dirname, 'ssl_certificate', 'xels_io.ca-bundle')),
    key: fs.readFileSync(path.join(__dirname, 'ssl_certificate', 'xels_io_private_key.key'))
}


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

/**  get Index page Starts here
 *
 *
 */
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/rddList');
    } else {
        res.render('index.ejs', { message: req.flash('loginMessage') });
    }
});
/**  get Register page Starts here
 *
 *
 */
app.get('/register', getSignUpPage);
/**  get Dashborad page Starts here
 *
 *
 */
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
/** Logout starts here
 *
 *
 */
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
/** get rdd wallet details starts here
 *
 *
 */
app.get('/rddDetails', isLoggedIn, getRddDetails);
/**  rdd wallet distribution details starts here
 *
 *
 */
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

/**  Get rdd wallet balance details starts here
 *
 *
 */
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
/**  Create rdd wallet Page starts here
 *
 *
 */
app.get('/createRDD', isLoggedIn, (req, res) => {
    res.render('RDD.ejs', {
        userId: req.user.id,
        organizationId: req.user.organization_id,
        message: req.flash('rddMessage')
    });
});
/**  Create rdd wallet starts here
 *
 *
 */
app.post('/createRDDWallet', isLoggedIn, walletCreate);

/**  update rdd wallet address starts here
 *
 *
 */
app.post('/updateRDDWalletAddress', isLoggedIn, getUpdateAddress);

/**  delete Registered List address starts here
 *
 *
 */
app.post('/deleteRegisteredList', isLoggedIn, deleteRegisteredAddress);

/**  Update Registered List address starts here
 *
 *
 */
app.post('/updateRegisteredAddress', isLoggedIn, updateRegisteredAddress);

/**  Get RDD wallet list page with "RDD wallets and admins list" starts here
 *
 *
 */
app.get('/rddList', isLoggedIn, getRddWalletAdminList);
/**  Register Method starts here
 *
 *
 */
app.post('/register', passport.authenticate('local-signup', {
    successRedirect: '/rddList',
    failureRedirect: '/register'
}));

/**  Get Login Page starts here
 *
 *
 */
app.get('/login', (req, res) => {
    res.render('index.ejs', { message: req.flash('loginMessage') });
});
/** Login Page starts here
 *
 * 
 * 
 * 
 */
// process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/rddList', // redirect to the secure profile section
    failureRedirect: '/', // redirect back to the login page if there is an error
    failureFlash: true // allow flash messages
}));

/**  Register Address method starts here
 *
 *
 */
app.post('/registerAddress', isLoggedIn, addRegisteredAddress);

/**  Type of RDD wallet method starts here
 *
 *
 */
app.post('/typeWallet', isLoggedIn, updateWalletType);

/**  Add New Admin method starts here
 *
 *
 */
app.post('/rddList/admin', isLoggedIn, adminCreate);

/**  Update Password of current admin method starts here
 *
 *
 */
app.post('/rddList/updatePw', isLoggedIn, passwordChange);
/**  Get About Page starts here
 *
 *
 */
app.get('/about', isLoggedIn, (req, res) => {
    res.render('about.ejs', {});
});


/** User is loogen in or not starts here
 *
 *
 */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else {
        req['header']['Referrer'] = req.url;
        res.redirect("/");
    }
};
/**  Get Password forgot Page starts here
 *
 *
 */
app.get('/forgot', function(req, res) {
    console.log("hi");
    res.render('forgot.ejs', {
        // user: req.user
    });
});
/**  Password forgot Page method starts here
 *
 *
 */
app.post('/forgotPw', forgotPassword);
//});
/** Get Reset Token Page starts here
 *
 *
 */
app.get('/reset/:token', getToken);

/** Reset Token Page method starts here
 *
 *
 */

app.post('/reset/:token', passworddReset);


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