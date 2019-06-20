const env = require('./environment');

/*
 @Purpose: use driver name like mysql or false without database
*/

exports.dbdriver = 'mysql';
exports.host = (env.host)?env.host:'localhost';
exports.database = (env.database_name)?env.database_name:'';
exports.user = (env.database_user)?env.database_user:'';
exports.password = (env.database_password)?env.database_password:'';
exports.debug = false;


module.exports = {
    'connection': {
        host: 'localhost',
        user: 'root',
        password: '123',
        database: 'airdrop_xels'
    },
	'database': 'airdrop_xels',
    
};