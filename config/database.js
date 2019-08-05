const env = require('./environment');

/*
 @Purpose: use driver name like mysql or false without database
*/
module.exports = {
    'connection': {
        host: (env.host)?env.host:'localhost',
        user: (env.database_user)?env.database_user:'',
        password: (env.database_password)?env.database_password:'',
        database: (env.database_name)?env.database_name:''
    },
	'database': (env.database_name)?env.database_name:'',
    
};