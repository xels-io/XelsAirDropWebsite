module.exports = {
    getSignUpPage: (req, res) => {

        res.render('signup.ejs', { message: req.flash('signupMessage') });
    }
};