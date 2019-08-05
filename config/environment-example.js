exports.app_name = 'AirDropXels';
exports.environment = 'development'; //production,testing,development


exports.host = 'localhost';
exports.database_name = '';
exports.database_user = '';
exports.database_password = '';
//When use those feature then use true for socket,https,debug
exports.socket = false;
exports.https = false;
exports.debug = true;


exports.httpsPort = 443;
exports.httpPort = 80;


//Xels api configuration
exports.baseXels = 'https://api.xels.io:2332'; 

exports.PostAPIURl = '/PostAPIResponse';
exports.GetApiURL = '/GetAPIResponse';

exports.accountName = '';
exports.feeType = 'medium';
exports.allowUnconfirmed = true;
exports.Send_APi_key = '';//sendgrid api key for email sending