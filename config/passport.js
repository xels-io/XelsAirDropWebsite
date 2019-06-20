//we import passport packages required for authentication
var passport = require("passport");
var mysql = require('mysql');
var LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt'),
      flash = require("connect-flash");

var ab = loadModel('user');
console.log(ab);

const user = require('../model/user');
//ab.User.f
var mysql = require('mysql');

var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

const saltRounds = 10;
connection.query('USE ' + dbconfig.database);

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
		connection.query("select * from user where id = "+id,function(err,rows){	
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
  function(req , email, password, done) {
    var generateHash = function(password) {
 
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };
    
    //ab.findOne
    // When a user tries to sign in this code runs
    connection.query("select * from user where email = '"+email+"'", (err, dbUser) => {
      console.log(dbUser);
        if (err)
            return done(err);
        if (dbUser.length) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        }
        // If there's no user with the given email
        else {

            // if there is no user with that email
            // create the user
            let insertQuery = "INSERT INTO user (email , password ) values ('" + email +"','"+ generateHash(password) +"' )";
            //console.log(insertQuery);
            connection.query(insertQuery,function(err,rows) {
              console.log("rows");
                connection.query("select * from user where email = '"+email+"'",function(err,rows){
                    var newUserMysql = new Object();
                    newUserMysql.email    = email;
                    //newUserMysql.password = password; // use the generateHash function in our user model
                    newUserMysql.id = rows[0].id;
                    console.log(newUserMysql);
                    // add_new_notification_data("SU",rows[0].id,rows[0].name)
                    return done(null, newUserMysql);

                });

            });
        }
    });
  }
));

passport.use("local-login", new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true // allows us to pass back the entire request to the callback

  },(req , email, password, done) => {
    //bcrypt compare with hashed password
    var validPw = function(pw) {
      return bcrypt.compareSync(password, pw);
    };
  
    connection.query("SELECT * FROM user WHERE email = '" + email + "'", (err, rows) => {
       console.log(rows);
      if (err)
        return done(err);
      // if no user is found, return the message
      if (!rows.length) {
        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
      }
        // if password is wrong, return the message
      if (!validPw(rows[0].password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
      console.log("Ok");
      // all is well, return successful user
      return done(null, rows[0]);
    });
  }
  ));
   // }
// Exporting our configured passport
module.exports = passport;
//module.exports.handleDisconnect