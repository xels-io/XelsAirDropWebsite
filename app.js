require('./system/require');
require('./system/loader');
const https = require('https');
const { getHomePage } = require('./controller/index');
const { walletCreate } = require('./controller/rdd');
const { getSignUpPage } = require('./controller/signup');
let encryption = require('./system/encryption');

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

app.get('/', getHomePage);

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
    let temp_wallet_id = req.query.id;
    queryMethod.typeOfWallet(temp_wallet_id).then(response => {
        queryMethod.registeredAddressList(temp_wallet_id).then(registeredList => {

            res.render('rddDetails.ejs', {
                walletId: temp_wallet_id,
                list: registeredList,
                walletName: registeredList.length > 0 ? registeredList[0].walletName : '',
                bAmount: registeredList.length > 0 ? registeredList[0].balance : 0
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
    queryMethod.registeredAddressList(req.body.wallet_id).then(registeredList => {
        distribute.distributeXels(param).then(response => {
            console.log(response);
            if (response.InnerMsg.transactionId) {
                req.flash('message', "Distributed successfully");
                res.render('rddDetails.ejs', {
                    walletId: req.body.wallet_id,
                    message: req.flash('message'),
                    list: registeredList,
                    walletName: registeredList.length > 0 ? registeredList[0].walletName : '',
                    bAmount: registeredList.length > 0 ? registeredList[0].balance : 0
                });
            }

            //res.redirect('/rddDetails?id=' + req.body.wallet_id);
        }).catch(err => {
            req.flash('distributeErrMessage', err);
            res.render('rddDetails.ejs', {
                walletId: req.body.wallet_id,
                list: registeredList,
                errMessage: req.flash('distributeErrMessage'),
                walletName: registeredList.length > 0 ? registeredList[0].walletName : '',
                bAmount: registeredList.length > 0 ? registeredList[0].balance : 0
            });
        });
    }).catch(err => {
        console.log(err);
    });

});
app.post('/getbalance', isLoggedIn, (req, res) => {

    let walletId = req.body.wallet_id;
    distribute.getBalance(walletId).then(balance => {
        //console.log(balance);
        let amount = balance[0].amountConfirmed / 100000000;
        queryMethod.registeredAddressList(walletId).then(registeredList => {
            queryMethod.updateBalance(amount, walletId)
                .then(response => {
                    req.flash('balanceUpdate', 'Rdd wallet balance is ' + amount);
                    res.render('rddDetails.ejs', {
                            walletId: walletId,
                            list: registeredList,
                            walletName: registeredList.length > 0 ? registeredList[0].walletName : '',
                            message: req.flash('balanceUpdate'),
                            bAmount: amount
                                // typeW: responserows.length? responserows:emp;
                        })
                        // res.redirect('/rddDetails?id=' + req.body.wallet_id);
                }).catch(err => {
                    return err;
                });
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    });

});
app.get('/createRDD', isLoggedIn, (req, res) => {
    res.render('RDD.ejs', {
        userId: req.user.id,
        message: req.flash('rddMessage')
    });
});
app.post('/createRDD', walletCreate);


app.post('/registeredList/delete/:id', (req, res) => {
    const registeredId = req.body.registeredId;
    queryMethod.deleteRegisteredList(registeredId).then(response => {
        res.redirect('/rddDetails?id=' + req.body.walletId);
    }).catch(err => {
        return err;
    });
});
app.post('/updateRegisteredAddress/:id', (req, res) => {
    const registeredId = req.body.registeredId;
    let address = req.body.updateAddress;
    queryMethod.updateRegisteredAddress(registeredId, address).then(response => {
        res.redirect('/rddDetails?id=' + req.body.walletId);
    }).catch(err => {
        return err;
    });
});
app.post('/admin/delete/:id', (req, res) => {
    const adminId = req.body.adminId;
    //console.log(adminId);
    queryMethod.deleteUserList(adminId).then(response => {
        res.redirect('/rddList');
    }).catch(err => {
        return err;
    });
});

app.get('/rddList', isLoggedIn, (req, res) => {
    queryMethod.userOrganizationList(req.user.id, req.user.organization_id).then(userList => {
        app.locals.userList = userList;
        queryMethod.userWalletMappingAddress(req.user.id).then(response => {
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


app.post('/registerAddress', (req, res) => {
    let temp_wallet_id = req.body.wallet_id;
    queryMethod.typeOfWallet(temp_wallet_id).then(response => {
        queryMethod.insertionRegisterList(req.body.address, req.body.wallet_id).then(response => {
            req.flash('rddMessage', "Address registered successfully");
            queryMethod.registeredAddressList(temp_wallet_id).then(registeredList => {
                res.render('rddDetails.ejs', {
                    walletId: temp_wallet_id,
                    list: registeredList,
                    message: req.flash('message'),
                    walletName: registeredList.length > 0 ? registeredList[0].walletName : '',
                    bAmount: registeredList.length > 0 ? registeredList[0].balance : 0
                })

                //res.redirect('rddDetails?id=' + req.body.wallet_id);
            }).catch(err => {

            });

        }).catch(err => {
            console.log(err);
            req.flash('registerErrMsg', err);
            res.render('rddDetails.ejs', {
                walletId: req.body.wallet_id,
                list: registeredList,
                errMessage: req.flash('registerErrMsg'),
                walletName: registeredList.length > 0 ? registeredList[0].walletName : '',
                bAmount: registeredList.length > 0 ? registeredList[0].balance : 0
            });
        });
    }).catch(err => {
        console.log(err);
    });

    // queryMethod.insertionRegisterList(req.body.address, req.body.wallet_id).then(response => {
    //     req.flash('rddMessage', "Address registered successfully");
    //     res.redirect('rddDetails?id=' + req.body.wallet_id);
    // }).catch(err => {
    //     console.log(err);
    // });
});
app.post('/typeWallet', (req, res) => {
    queryMethod.updateTypeofWallet(req.body.type, req.body.wallet_id).then(response => {
        res.redirect('rddDetails?id=' + req.body.wallet_id);
    }).catch(err => {
        console.log(err);
    });
});



app.post('/rddList/admin', (req, res) => {

    queryMethod.selectUser(req.body.email).then(dbUser => {
        queryMethod.userWalletMappingAddress(req.user.id).then(response => {
            let rddArr = response;
            if (dbUser.length) {
                req.flash('adminMessage', 'That email is already taken.');
                res.render('rddList.ejs', {
                    list: rddArr,
                    adminList: app.locals.userList,
                    errMessage: req.flash('adminMessage'),
                    userId: req.body.email,
                    organizationId: req.body.organizationId
                });
            } else {
                queryMethod.insertionNewAdmin(req.body.email, req.body.organizationId, req.body.password).then(insertRow => {
                    req.flash('adminMessage', "New admin added successfully");
                    queryMethod.userOrganizationList(req.user.id, req.user.organization_id).then(userList => {
                        app.locals.userList = userList;
                        res.render('rddList.ejs', {
                            list: rddArr,
                            userId: req.body.email,
                            adminList: userList,
                            organizationId: req.body.organizationId,
                            message: req.flash('adminMessage')
                        });
                    }).catch(err => {
                        return err;
                    });

                }).catch(err => {
                    console.log(err);
                });
            }
        }).catch(err => {
            console.log(err);
        });

    }).catch(err => {
        return err;
    });


});
app.post('/rddList/updatePw', (req, res) => {
    let newPw = queryMethod.generateHash(req.body.newpPasswordchange);
    queryMethod.userWalletMappingAddress(req.user.id).then(walletRows => {
        let rddArr = walletRows;
        queryMethod.userPwMatch(req.body.userId, req.body.oldpPassword).then(response => {
            if (response.length) {
                let updateAdmin = "UPDATE user SET password='" + newPw + "' WHERE email='" + req.body.userId + "'";
                connection.query(updateAdmin, (err, rows) => {
                    if (err)
                        res.send(err);
                    else {
                        req.flash('pwMessage', "Password Changed successfully");
                        res.render('rddList.ejs', {
                            list: rddArr,
                            adminList: app.locals.userList,
                            userId: req.body.userId,
                            organizationId: req.body.organizationId,
                            message: req.flash('pwMessage')
                        });
                    }
                });
            } else {
                res.render('error.ejs', { message: response });
            }

        }).catch(err => {
            console.log(err);
            console.log("userPwMatch err");
            req.flash('pwMessage', err);
            res.render('rddList.ejs', {
                list: rddArr,
                errMessage: req.flash('pwMessage'),
                userId: req.body.userId,
                adminList: app.locals.userList,
                organizationId: req.body.organizationId
            });
        });
    }).catch(err => {
        console.log("userWalletMappingAddress err");
    });

});
app.get('/about', isLoggedIn, (req, res) => {
    res.render('about.ejs', {});
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
//Every route middleware
app.use(function(req, res, next) {

    if (!req.secure) {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
    } else {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Assassin-RequestHash");
        global.Request = req;
        global.Response = res;
        next();
    }

});

module.exports.isLoggedIn = isLoggedIn;
module.exports = connection;