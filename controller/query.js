require('../system/require');
const apiEnv = require('../config/environment');
const connection = mysql.createConnection(dbconfig.connection);
const bcrypt = require('bcrypt');
const saltRounds = 10;

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

function validPassword(dbpassword, pw) {
    return bcrypt.compareSync(pw, dbpassword); //input password, database password
};

function RDDWalletWithRegisteredList(walletId) {
    return new Promise((resolve, reject) => {
        let selectQuery = "select rdd_wallet.*, registered_list.registered_address from rdd_wallet inner join registered_list on rdd_wallet.id = registered_list.rdd_id and registered_list.rdd_id = " + walletId;
        connection.query(selectQuery, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);
        })
    })
}

function RDDWalletRow(walletId) {
    return new Promise((resolve, reject) => {
        let selectQuery = "select * from rdd_wallet where id = " + walletId;
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
        let selectQuery = "select rdd_wallet.walletName, rdd_wallet.rdd_type, rdd_type.* from rdd_wallet inner join rdd_type ON rdd_wallet.rdd_type=rdd_type.id and rdd_wallet.id= " + temp_wallet_id;
        connection.query(selectQuery, (err, rows) => {
            if (err)
                reject(err);

            resolve(rows);

        })
    });

}

function registeredAddressList(temp_wallet_id) {
    console.log(temp_wallet_id)
    return new Promise((resolve, reject) => {
        let selectRegisteredQuery = "select registered_list.* , rdd_wallet.walletName, rdd_wallet.id as walletId from registered_list inner join rdd_wallet on registered_list.rdd_id = rdd_wallet.id and registered_list.rdd_id = " + temp_wallet_id;

        connection.query(selectRegisteredQuery, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);

        });
    });
}

function userPwMatch(userId, pw) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM user WHERE email = '" + userId + "'", (err, rows) => {
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

function updateBalance() {
    let updateWallet = "UPDATE rdd_wallet SET balance=" + amount + " WHERE id='" + req.body.wallet_id + "'";
    connection.query(updateWallet, (err, result) => {
        res.redirect('/rddDetails?id=' + req.body.wallet_id);
    });
}
module.exports.generateHash = generateHash;
module.exports.RDDWalletWithRegisteredList = RDDWalletWithRegisteredList;
module.exports.validPassword = validPassword;
module.exports.userPwMatch = userPwMatch;
module.exports.typeOfWallet = typeOfWallet;
module.exports.registeredAddressList = registeredAddressList;
module.exports.rddWalletDetails = rddWalletDetails;

module.exports.RDDWalletRow = RDDWalletRow