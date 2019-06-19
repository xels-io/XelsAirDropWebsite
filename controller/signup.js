module.exports = {
    getSignUpPage: (req, res) => {
       
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    },
    
    isLoggedIn : (req, res, next) => {
 
        if (req.isAuthenticated())
         
            return next();
             
        res.redirect('/login');
     
    },
    getdashboard: (req, res) => {
       
        res.render('dashboard.ejs');
    },
    logout: (req, res) => {
        req.session.destroy(function(err) {
            res.redirect('/');
        });
    },
   
};

