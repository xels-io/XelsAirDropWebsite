'use strict';

module.exports = (sequelize, DataTypes) => {
  let userType = sequelize.define('usertype', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: DataTypes.STRING,
        description: DataTypes.STRING
    });
    return userType;
}