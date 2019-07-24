require('../system/require');

const env = require('../config/environment');
const queryMethod = require('./query')


module.exports = {

    forgotPassword: (req, res, next) => {

        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                console.log(req.body);
                queryMethod.selectUser(req.body.email).then((rows) => {
                    // console.log(rows);
                    if (!rows.length) {
                        req.flash('error', 'No account with that email address exists.');

                        res.render('forgot.ejs', {
                            errMessage: req.flash('error')
                        });
                    }
                    let resetPasswordExpires = moment(Date.now() + 3600000).format('YYYY-MM-DD HH:mm:ss');; // 1 hour
                    let updateRegisterdAddress = "UPDATE user SET resetPasswordToken ='" + token + "' , resetPasswordExpires='" + resetPasswordExpires + "' WHERE email = '" + req.body.email + "'";
                    //  console.log(updateRegisterdAddress);
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
                // console.log(user);
                if (user.length > 0) {
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

            }
        ], function(err) {

            if (err) {
                console.log("waterfall err");
                return next(err);
            }
            res.redirect('/forgot');
        });
    },
    passworddReset: (req, res) => {
        let userQuery = "select * from user where resetPasswordToken= '" + req.params.token + "'";
        console.log("post Token");
        console.log(req.body);
        connection.query(userQuery, (err, rows) => {
            if (rows.length === 0) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                res.render('forgot.ejs', {
                    errMessage: req.flash('error')
                });
            }
            let user = new Object();
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

                } else {
                    req.flash('err', err.InnerMsg);

                    res.render('reset.ejs', {
                        token: rows,
                        errMessage: req.flash('err')
                    });
                }

            });

        });
    },
    getToken: (req, res) => {
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
    }
}