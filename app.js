require('./system/require');
require('./system/loader');
const https = require('https');
const { getHomePage } = require('./controller/index');
const { walletCreate } = require('./controller/rdd');
const { getSignUpPage } = require('./controller/signup');
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
        organizationId: req.user.organization_id,
        message: req.flash('rddMessage')
    });
});
app.post('/createRDD', isLoggedIn, walletCreate);


app.post('/registeredList/delete/:id', isLoggedIn, (req, res) => {
    const registeredId = req.body.registeredId;
    queryMethod.deleteRegisteredList(registeredId).then(response => {
        res.redirect('/rddDetails?id=' + req.body.walletId);
    }).catch(err => {
        return err;
    });
});
app.post('/updateRegisteredAddress', isLoggedIn, (req, res) => {

    const registeredId = req.body.reg_id;
    let address = req.body.updateAddress;
    queryMethod.updateRegisteredAddress(registeredId, address).then(response => {
        res.redirect('/rddDetails?id=' + req.body.wallet_id);
    }).catch(err => {
        return err;
    });
});
app.post('/admin/delete/:id', isLoggedIn, (req, res) => {
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
        queryMethod.userWalletMappingAddress(req.user.id, req.user.organization_id).then(response => {
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
        queryMethod.userWalletMappingAddress(req.user.id, req.user.organization_id).then(response => {
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
    queryMethod.userWalletMappingAddress(req.user.id, req.user.organization_id).then(walletRows => {
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
        res.redirect("/");
    }
};
app.get('/forgot', function(req, res) {
    console.log("hi");
    res.render('forgot.ejs', {
       // user: req.user
    });
});

app.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            queryMethod.selectUser(req.body.email).then((rows) => {
                console.log(rows);
                if (!rows.length) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                let resetPasswordExpires = moment(Date.now() + 3600000).format('YYYY-MM-DD HH:mm:ss');; // 1 hour
                let updateRegisterdAddress = "UPDATE user SET resetPasswordToken ='" + token + "' , resetPasswordExpires='" + resetPasswordExpires + "' WHERE email = '" + req.body.email + "'";
                console.log(updateRegisterdAddress);
                connection.query(updateRegisterdAddress, (err, result) => {
                    if (err)
                        done(err);
                    done(err, token, rows);
                });
            }).catch(err => {
                done(err);
            });
        },
        function(token, user, done) {

            sgMail.setApiKey(env.Send_APi_key);
            const mailOptions = {
                to: user[0].email,
                from: 'passwordreset@xels.io.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            sgMail.send(mailOptions).then(() => {
                    req.flash('info', 'An e-mail has been sent to ' + user[0].email + ' with further instructions.');
                    res.render('forgot.ejs', {
                        message: req.flash('info')
                    });
                })
                .catch(error => {
                    req.flash('info', 'Mail not sent');
                    res.render('forgot.ejs', {
                        errMessage: req.flash('info')
                    });
                    //console.log("mailsend err");
                });
        }
    ], function(err) {

        if (err) {
            console.log("waterfall err");
            return next(err);
        }
        res.redirect('/forgot');
    });
});

app.get('/reset/:token', function(req, res) {
    console.log("token");
    console.log(req.params.token);
    //console.log(req.user);
    let userQuery = "select * from user where resetPasswordToken= '"+ req.params.token +"' and resetPasswordExpires > " + Date.now();
    console.log(userQuery);
    connection.query(userQuery, (err, rows) => {
        console.log(rows);
        if (!rows) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        console.log(rows);
        res.render('reset.ejs', {
            token: rows
        });
    });
});
app.post('/reset/:token', function(req, res) {
    let userQuery = "select * from user where resetPasswordToken= '"+ req.params.token +"' and resetPasswordExpires > " + Date.now();

    connection.query(userQuery, (err, rows) => {

        if (rows.length === 0) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
        }
        let user =new Object();
        user.password = queryMethod.generateHash(req.body.newpPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        let updateAdmin = "UPDATE user SET password='" + user.password + "', resetPasswordToken ='" + user.resetPasswordToken + "' , resetPasswordExpires='" + user.resetPasswordExpires + "' WHERE email='" + req.body.email + "'";
       // console.log(updateAdmin);
        connection.query(updateAdmin, (err, updatedRows) => {

            if (updatedRows) {
               
                req.flash('success', 'Success! Your password has been changed.');
                res.render('reset.ejs', {
                    token: rows, 
                    message: req.flash('success')
                });
                
            }
            else
            {
                req.flash('err', 'error');
                res.render('reset.ejs', {
                    token: rows, 
                    errMessage: req.flash('err')
                });
            }
        
        });         
       
    });
});
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