require('../system/require');
const apiEnv = require('../config/environment');
const connection = mysql.createConnection(dbconfig.connection);
const bcrypt = require('bcrypt');
const saltRounds = 10;

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

function validPw(dbpassword, pw) {
    //  console.log("hi");
    return bcrypt.compareSync(pw, dbpassword); //input password, database password
};

function RDDList() {
    return new Promise((resolve, reject) => {
        let selectQuery = "select rdd_wallet.walletName, rdd_wallet.id, registered_list.registered_address from rdd_wallet inner join registered_list where rdd_wallet.id = registered_list.rdd_id ";
        connection.query(selectQuery, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);
        })
    })

}

function rddWalletDetails() {
    return new Promise((resolve, reject) => {
        let selectQuery = "select * from rdd_wallet";
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


function userPwMatch(userId, pw) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM user WHERE email = '" + userId + "'", (err, rows) => {
            console.log(rows);
            if (err)
                reject(err);
            // if no user is found, return the message
            if (!validPw(rows[0].password, pw)) {
                // req.flash('changePw', 'Oops! Wrong password.');
                reject('Oops! Wrong password.');
            }
            resolve(rows);
        });

    });
}


module.exports.generateHash = generateHash;
module.exports.RDDList = RDDList;
module.exports.validPw = validPw;
module.exports.userPwMatch = userPwMatch;
module.exports.typeOfWallet = typeOfWallet;