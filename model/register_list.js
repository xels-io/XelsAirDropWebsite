'use strict';

module.exports = (sequelize, DataTypes) => {
  let registered = sequelize.define('list', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        registered_address: DataTypes.STRING,
        rdd_id: DataTypes.INTEGER
    });
    return rddType;
}