//we import passport packages required for authentication

require('../system/require');

var ab = loadModel('user');

const user = require('../model/user');
//var connection = mysql.createConnection(dbconfig.connection);


function handleDisconnect() {
    connection = mysql.createConnection(dbconfig.connection); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function(err) { // The server is either down
        if (err) { // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        } // to avoid a hot loop, and to allow our node script to
    }); // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect(); // lost due to either server restart, or a
        } else { // connnection idle timeout (the wait_timeout
            throw err; // server variable configures this)
        }
    });
}

handleDisconnect();

const saltRounds = 10;
connection.query('USE ' + dbconfig.database);

const queryMethod = require('../controller/query');

// =========================================================================
// passport session setup ==================================================
// =========================================================================
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session

// used to serialize the user for the session

//module.exports = function(passport) {
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    connection.query("select * from user where id = " + id, function(err, rows) {
        done(err, rows[0]);
    });
});

passport.use('local-signup', new LocalStrategy(
    // Our user will sign in using an email, rather than a "username"
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback

    },
    function(req, email, password, done) {

        var generateHash = function(password) {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        };
        // When a user tries to sign in this code runs
        queryMethod.selectUser(req.body.email).then(dbUser => {
            if (dbUser.length) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            }
            // If there's no user with the given email
            else {

                queryMethod.registerAdmin(email, req.body.organization_name, password).then(response => {
                    connection.query("select * from user where email = '" + email + "'", function(err, rows) {
                        var newUserMysql = new Object();
                        newUserMysql.email = email;
                        //newUserMysql.password = password; // use the generateHash function in our user model
                        newUserMysql.id = rows[0].id;
                        // console.log(newUserMysql);
                        // add_new_notification_data("SU",rows[0].id,rows[0].name)
                        return done(null, newUserMysql);

                    });
                })
            }

        }).catch(err => {
            return done(err);
        });
    }
));

passport.use("local-login", new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback

}, (req, email, password, done) => {
    //bcrypt compare with hashed password
    var validPw = function(pw) {
        return bcrypt.compareSync(password, pw);
    };
    queryMethod.selectUser(req.body.email).then(rows => {
        if (!rows.length) {
            return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
        }
        // if password is wrong, return the message
        if (!validPw(rows[0].password))
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
        console.log(rows[0]);
        // all is well, return successful user
        return done(null, rows[0]);
    }).catch(err => {
        return done(err);
    });
}));
// }
// Exporting our configured passport
module.exports = passport;
module.exports.handleDisconnect;