// The api_routes.js will be used to route GET and POST from and to the database
// Requiring our models and passport as we've configured it


//
module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  
//
  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  
//
  // Route for logging user out
  
  // Route for getting some data about our user to be used client side
  
};