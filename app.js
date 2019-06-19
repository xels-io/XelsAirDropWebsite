require('./system/require');
require('./system/loader');

const {getHomePage} = require('./controller/index');
const {getRDDCreation, walletCreate} = require('./controller/rdd');
const {getSignUpPage} = require('./controller/signup');
let encryption = require('./system/encryption');


const dbDetails = require('./config/database');
const apiEnv = require ('./config/environment');
var passport = require("./config/passport");
var dbconfig = require('./config/database');

const cors = require('cors');
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

app.use(bodyParser.json({type: 'application/json'}));// parse form data client
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
          maxAge: 1000*60*60*2,
          sameSite:true
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
  
   
  
  server.listen(httpPort,()=>{
      console.log(`Listening on port: ${httpPort}`);
  });
//   req.flash()
app.get('/', getHomePage);

app.get('/register', getSignUpPage);

// app.get('/rdd_type',  (req,res)=> {
  
// });
app.post('/dashboard/admin'  , (req,res)=> {
  
  let insertAdmin = "INSERT INTO user_role (name , description ) values ('" + req.body.adminName +"','"+ req.body.description +"' )";
  console.log(insertAdmin);
  connection.query(insertAdmin , (err,rows) => {
    console.log(rows);
    res.send(200)
  })
});
app.get('/dashboard' , (req,res) => {
 
  let adminUser = connection.query("select * from user_role ",function(err,rows){	
    //console.log(rows);
    if(err)
      return err;
    else
    {
        res.render('dashboard.ejs', {
          user :  req.user,
          admin: rows
      })
    }
    });
   
    
});

app.post('/register', passport.authenticate('local-signup', {
    successRedirect: '/dashboard',
    failureRedirect: '/register'
}
));

function createWallet()
{

}
app.post('/getmnemonics', walletCreate);
// 


 // process the signup form
 app.post('/login', passport.authenticate('local-login', {
  successRedirect : '/dashboard', // redirect to the secure profile section
  failureRedirect : '/', // redirect back to the login page if there is an error
  failureFlash : true // allow flash messages
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/createRDD', (req, res) => {

  let selectQuery = "select * from rdd_type";
  connection.query(selectQuery , (err,rows) => {
    res.render('RDD.ejs', {
      type :  rows
     });
  })
  
});
//getRDDCreation


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) 
    return next();
  res.redirect("/");
};




app.post('/PostAPIResponse',  (req, res) => { 

  console.log(req.query);
  console.log(req.url);
  if(common.isEmpty(req.query)){
    req.query = req.body;
      let URL = req.query.URL;
        axios({ method: 'post', url: xelsAPI + URL, data: req.query })
        .then(response => {
          let successObj = {
              "statusCode" : response.status,
              "statusText" : response.statusText,
              "InnerMsg" : response.data
          }
            res.status(response.status).json(successObj);
        }).catch(error => {
          let errObj ={ 
              "statusCode" : error.response.status,
              "statusText" : error.response.statusText,
              "InnerMsg" : error.response.data.errors ? error.response.data.errors : ""
            }
            res.status(error.response.status).json(errObj);
          });
  }
  else{
    let URL = req.query.URL;
    axios({ method: 'post', url: xelsAPI + URL, data: req.query })
    .then(response => {
      let successObj = {
        "statusCode" : response.status,
          "statusText" : response.statusText,
          "InnerMsg" : response.data
      }
        res.status(response.status).json(successObj);
    }).catch(error => {
      let errObj ={ 
        "statusCode" : error.response.status,
          "statusText" : error.response.statusText,
          "InnerMsg" : error.response.data.errors ? error.response.data.errors : ""
        }
        res.status(error.response.status).json(errObj);
    });   
  }
   
});

// app.get('/success', (req, res) => res.send("Welcome "+req.query.username+"!!"));
// app.get('/error', (req, res) => res.send("error logging in"));


//Every route middleware
app.use(function (req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Assassin-RequestHash");
     global.Request = req;
     global.Response = res;
     next();

});

module.exports.isLoggedIn = isLoggedIn;
module.exports = connection;