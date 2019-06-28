require('../system/require');
const apiEnv = require('../config/environment');
const connection = mysql.createConnection(dbconfig.connection);
const bcrypt = require('bcrypt');
const saltRounds = 10;

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

function validPassword(dbpassword, pw) {
    //  console.log("hi");
    return bcrypt.compareSync(pw, dbpassword); //input password, database password
};

function RDDWalletWithRegisteredList() {
    return new Promise((resolve, reject) => {
        let selectQuery = "select rdd_wallet.walletName, rdd_wallet.id, registered_list.registered_address from rdd_wallet left outer join registered_list on rdd_wallet.id = registered_list.rdd_id ";
        // console.log(selectQuery);
        connection.query(selectQuery, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);
        })
    })

}

function rddWalletDetails() {
    return new Promise((resolve, reject) => {
        let selectQuery = "select * from rdd_wallet where address IS NOT NULL";
        connection.query(selectQuery, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);
        })
    })
}

function typeOfWallet(temp_wallet_id) {
    return new Promise((resolve, reject) => {
        let selectQuery = "select rdd_wallet.walletName, rdd_wallet.rdd_type, rdd_type.* from rdd_wallet inner join rdd_type where rdd_wallet.rdd_type=rdd_type.id and rdd_wallet.id= " + temp_wallet_id;
        console.log(y);
        connection.query(selectQuery, (err, rows) => {
            console.log(rows);
            if (err)
                reject(err);

            resolve(rows);

        })
    });

}

function registeredAddressList(temp_wallet_id) {
    return new Promise((resolve, reject) => {
        let selectRegisteredQuery = "select registered_list.* , rdd_wallet.walletName, rdd_wallet.id as walletId from registered_list inner join rdd_wallet where registered_list.rdd_id = rdd_wallet.id and registered_list.rdd_id = " + temp_wallet_id;

        connection.query(selectRegisteredQuery, (err, rows) => {
            console.log(rows);
            if (err)
                reject(err);
            resolve(rows);

        });
    });
}

function userPwMatch(userId, pw) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM user WHERE email = '" + userId + "'", (err, rows) => {
            console.log(rows);
            if (err)
                reject(err);
            // if no user is found, return the message
            if (!validPassword(rows[0].password, pw)) {
                // req.flash('changePw', 'Oops! Wrong password.');
                reject('Oops! Wrong password.');
            }
            resolve(rows);
        });

    });
}


module.exports.generateHash = generateHash;
module.exports.RDDWalletWithRegisteredList = RDDWalletWithRegisteredList;
module.exports.validPassword = validPassword;
module.exports.userPwMatch = userPwMatch;
module.exports.typeOfWallet = typeOfWallet;
module.exports.registeredAddressList = registeredAddressList;
module.exports.rddWalletDetails = rddWalletDetails;