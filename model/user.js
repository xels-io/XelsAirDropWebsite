// const Sequelize = require('sequelize');
// const serverDB = require('../app');
// const sequelize = serverDB.sequelize;
module.exports = (sequelize, DataTypes ) => {

    var User = sequelize.define("userInfo", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
      // The email cannot be null, and must be a proper email before creation
      email: {
        type: DataTypes.STRING,
        unique: true,
        
      },
      // The password cannot be null
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rdd_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
    });
    return User;
    // Creating a custom method for our User model. 
    //This will check if an unhashed password entered by the 
    //user can be compared to the hashed password stored in our database
    // User.prototype.validPassword = function(password) {
    //   return bcrypt.compareSync(password, this.password);
    // };
    // Hooks are automatic methods that run during various phases of the User Model lifecycle
    // In this case, before a User is created, we will automatically hash their password
  
    // User.beforeCreate( user => {
    //   user.password = bcrypt.hashSync(
    //       user.password, 
    //       bcrypt.genSaltSync(10),
    //       null
    //     );
    // });
    // return User;
  };
  
