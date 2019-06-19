'use strict';

module.exports = (sequelize, DataTypes) => {
  let rddType = sequelize.define('rddtype', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        typeName: DataTypes.STRING
    });
    return rddType;
}