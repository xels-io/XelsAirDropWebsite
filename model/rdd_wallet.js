'use strict';

module.exports = (sequelize, DataTypes) => {
  let rddWallet = sequelize.define('rddwallet', {
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    walletName: DataTypes.STRING,
      // The password cannot be null
    password: {
        type: DataTypes.STRING,
        allowNull: false
      },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mnemonics: {
        type: DataTypes.STRING,
        allowNull: false
    },
    passphrase: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rdd_type : {
        type: DataTypes.INTEGER,
        primaryKey: false 
    },
    balance: DataTypes.FLOAT,
    
  });

  return rddWallet;
};