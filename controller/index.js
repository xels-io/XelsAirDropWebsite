module.exports = {
    getHomePage: (req, res) => {
        
        res.render('index.ejs', { message: req.flash('loginMessage') });
    },
    
};