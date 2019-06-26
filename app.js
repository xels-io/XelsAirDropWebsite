require('./system/require');
require('./system/loader');

const { getHomePage } = require('./controller/index');
const { getRDDCreation, walletCreate } = require('./controller/rdd');
const { getSignUpPage } = require('./controller/signup');
let encryption = require('./system/encryption');


const dbDetails = require('./config/database');
const apiEnv = require('./config/environment');
const passport = require("./config/passport");
const dbconfig = require('./config/database');
const queryMethod = require('./controller/query');
const distirbute = require('./controller/distribute');
const cors = require('cors');

//const firebaseApp = require('./config/firebaseConfig');
//const fireDb = require('./config/push-notification');
//var connection = passport.connection;
const connection = mysql.createConnection(dbconfig.connection);

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});


app = express();


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
//Sync Database
// models.sequelize.sync().then(function() {

//     console.log('Nice! Database looks fine')

// }).catch(function(err) {

//     console.log(err, "Something went wrong with the Database Update!")

// });

// set the app to listen on the port
const server = http.createServer(app);
//create httpsServer
//const httpsServer = https.createServer(httpsOptions,app);


server.listen(httpPort, () => {
    console.log(`Listening on port: ${httpPort}`);
});

//app.get('/firebase', function(req, res) {
//
//    console.log("HTTP Get Request");
//    res.send("HTTP GET Request");
//    fireDb.initializeFirebase(); // = initializeFirebase
//
//    //fireDb.database();
//    //Insert key,value pair
//    // firebaseApp.database().ref('/TestMessages').set({ TestMessage: 'GET Request' });
//
//});
//   req.flash()
app.get('/', getHomePage);

app.get('/register', getSignUpPage);
app.get('/dashboard', isLoggedIn, (req, res) => {
    let rddWallet = "select * from rdd_wallet"
    connection.query(rddWallet, function(err, walletRows) {
        let adminU = "select user_wallet_mapping.* , rdd_wallet.walletName ,user.email from user_wallet_mapping inner join rdd_wallet inner join user where user_wallet_mapping.wallet_id = rdd_wallet.id and user_wallet_mapping.user_id = user.id";
        connection.query(adminU, function(err, rows) {
            if (err)
                return err;
            else {
                res.render('dashboard.ejs', {
                    userId: req.user.id,
                    userName: req.user.email,
                    admin: rows,
                    walletList: walletRows
                })
            }
        });
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

// function typeWallet()
// {
//     return new Promise((resolve, reject) => {
//         let selectQuery = "select rdd_type.* , rdd_wallet.walletName from rdd_type inner join rdd_wallet where rdd_type.id = " +rdd_wallet.rdd_type;connection.query(selectQuery, (err, rows) => {
//             if (err)
//                 reject(err);
//             resolve(rows);
//         })
//     })
//     let selectQuery = "select rdd_type.* , rdd_wallet.walletName from rdd_type inner join rdd_wallet where rdd_type.id = " +rdd_wallet.rdd_type;
//     connection.query(selectQuery, (err, rows) => {
//         if(rows.lenght > 0 )
//         {

//         }

//     })
// }


app.get('/rddDetails', isLoggedIn, (req, res) => {
    let temp_wallet_id = req.query.id;

    let typeWallet = "select rdd_wallet.walletName, rdd_wallet.rdd_type, rdd_type.* from rdd_wallet inner join rdd_type where rdd_wallet.rdd_type=rdd_type.id and rdd_wallet.id= " + temp_wallet_id;
    connection.query(typeWallet, (err, typeWallet) => {
        queryMethod.registeredAddressList(temp_wallet_id).then(registeredList => {
            res.render('rddDetails.ejs', {
                walletId: temp_wallet_id,
                list: registeredList
                    // typeW: responserows.length? responserows:emp;
            })
        }).catch(err => {
            console.log(err);
        })

    })

});

app.post('/distributeXels', isLoggedIn, (req, res) => {
    // console.log(req.body.wallet_id)
    let param = {
        walletId: req.body.wallet_id,
        addressList: req.body.addressList
    }
    distirbute.distributeXels(param);
});
app.get('/createRDD', isLoggedIn, (req, res) => {
    let selectQuery = "select * from rdd_type";

    connection.query(selectQuery, (err, rows) => {
        res.render('RDD.ejs', {
            type: rows,
            userId: req.user.id,
            message: req.flash('rddMessage')
        });
    })

});
// app.post('/rddWallet/delete/:id', (req, res) => {

//     const { id_rddList } = req.body;
//     const deleteQuery = "DELETE FROM registered_list WHERE id = " + req.body.rddListId;
//     console.log(deleteQuery);
//     connection.query(deleteQuery, (err, result) => {
//         res.redirect('/rddList');
//     });
// });

app.post('/registeredList/delete/:id', (req, res) => {
    const registeredId = req.body.registeredId;
    const deleteQuery = "DELETE FROM registered_list WHERE id = " + registeredId;
    //console.log(deleteQuery);
    connection.query(deleteQuery, (err, result) => {
        res.redirect('/rddDetails?id=' + req.body.walletId);
    });
});
app.get('/rddList', isLoggedIn, (req, res) => {

    queryMethod.rddWalletDetails().then(response => {
        let rddArr = response;
        res.render('rddList.ejs', {
            list: rddArr,
            userId: req.user.email,
            message: req.flash('adminMessage'),
        });
    }).catch(err => {
        return err;
    });

});

app.post('/register', passport.authenticate('local-signup', {
    successRedirect: '/dashboard',
    failureRedirect: '/register'
}));

app.post('/getmnemonics', walletCreate);


// process the signup form
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/dashboard', // redirect to the secure profile section
    failureRedirect: '/', // redirect back to the login page if there is an error
    failureFlash: true // allow flash messages
}));


app.post('/dashboard/admin', (req, res) => {
    //console.log(req.body);
    connection.query("select * from user where email = '" + req.body.email + "'", (err, dbUser) => {
        if (err)
            return err;
        if (dbUser.length) {
            req.flash('adminMessage', 'That email is already taken.');
            res.render('error.ejs', { message: req.flash('adminMessage') });
        } else {
            let insertAdmin = "INSERT INTO user (email , organization_name, password ) values ('" + req.body.email + "','" + req.body.organization_name + "','" + queryMethod.generateHash(req.body.password) + "' )";
            //console.log(insertAdmin);
            connection.query(insertAdmin, (err, rows) => {
                res.redirect('/rddList');
            })
        }

    });
});

app.post('/registerAddress', (req, res) => {

    let insertAdmin = "INSERT INTO registered_list (registered_address , rdd_id ) values ('" + req.body.address + "', " + req.body.wallet_id + " )";
    connection.query(insertAdmin, (err, rows) => {
        if (err)
            res.send(err);
        res.redirect('rddDetails?id=' + req.body.wallet_id);
    })
});
app.post('/typeWallet', (req, res) => {
    console.log(req.body);
    let updateWallet = "UPDATE rdd_wallet SET rdd_type=" + req.body.type1 + " WHERE id='" + req.body.wallet_id + "'";
    //console.log(updateWallet);
    connection.query(updateWallet, (err, rows) => {
        if (err)
            res.send(err);
        res.redirect('rddDetails?id=' + req.body.wallet_id);
    })
});
app.post('/dashboard/updatePw', (req, res) => {

    let newPw = queryMethod.generateHash(req.body.newpPasswordchange);
    queryMethod.userPwMatch(req.body.userId, req.body.oldpPassword).then(response => {

        if (response.length) {
            let updateAdmin = "UPDATE user SET password='" + newPw + "' WHERE email='" + req.body.userId + "'";

            connection.query(updateAdmin, (err, rows) => {
                if (err)
                    res.send(err);
                res.redirect('/rddList');
            })
        } else {
            res.render('error.ejs', { message: response });
        }

    }).catch(err => {
        console.log(err);
    });

});
app.get('/about', isLoggedIn, (req, res) => {

    res.render('about.ejs', {

    });
});



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else {
        req['header']['Referrer'] = req.url;
        console.log(req['header']['Referrer']);
        res.redirect("/");
    }
};

// app.get('/success', (req, res) => res.send("Welcome "+req.query.username+"!!"));
// app.get('/error', (req, res) => res.send("error logging in"));


//Every route middleware
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Assassin-RequestHash");
    global.Request = req;
    global.Response = res;
    next();

});

module.exports.isLoggedIn = isLoggedIn;
module.exports = connection;