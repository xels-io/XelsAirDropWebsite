let encryp = require('../system/encryption');
require('../system/require');
const apiEnv = require('../config/environment');
const appMethod = require('../app');
const connection = mysql.createConnection(dbconfig.connection);


module.exports = {
    // getRDDCreation: (req, res) => {
    //     res.render('RDD.ejs');
    // },
    getBalance: (req, res) => {
        let walletParam = {
            'URL': '/api/wallet/unusedaddress',
            'walletName': req.body.walletName,
            'accountName': 'account 0'
        }
        getAddress(walletParam)
            .then(address => {})
            .catch(err => {
                console.log(err);
            });
    },
    walletCreate: (req, res) => {
        let getPassword = encryp.passwordGenerator();
        getMnemonicsApi().then(mnemonic => {
            let walletParam = {
                'URL': '/api/wallet/create',
                'folderPath': null,
                'mnemonic': mnemonic,
                'name': req.body.walletName,
                'passphrase': 1234,
                'password': getPassword
            }
            apiWallet(walletParam).then(success => {

                walletAddress(req.body.walletName)
                    .then(address => {
                        const walletDetails = {
                            ...walletParam,
                            'address': address
                        };
                        insertWallet(walletDetails).then(rowsInserted => {
                            let waletUser = {
                                userId: req.user.id,
                                name: req.user.email,
                                wid: rowsInserted.insertId,
                                wname: req.body.walletName
                            }
                            insertWalletUserMapping(waletUser);
                            if (rowsInserted.insertId) {
                                req.flash('rddMessage', "Wallet Created Successfully");
                                res.render('RDD.ejs', { rddMessage: req.flash('rddMessage') });
                            }
                        }).catch(err => {
                            console.log(err);
                        });

                    }).catch(err => {
                        console.log(err);
                    });

            }).catch(err => {
                console.log("wallet");
                req.flash('rddErrMessage', err.InnerMsg);
                res.render('RDD.ejs', { rddErrMessage: req.flash('rddErrMessage') });

            });
        });
    },
}

function getAddress(walletParam) {
    return new Promise((resolve, reject) => {
        const addressParam = {
            'URL': '/api/wallet/addresses',
            'walletName': walletName,
            'accountName': 'account 0'
        }
        let url = apiEnv.baseXels + apiEnv.GetApiURL;
        axios.get(url, { params: addressParam }).then(response => {
            let resAddress = response.data.InnerMsg.addresses[0].address;
            resolve(resAddress);
        }).catch(err => {
            reject(error);
        });
    })
}

function walletAddress(walletName) {
    return new Promise((resolve, reject) => {
        const addressParam = {
            'URL': '/api/wallet/addresses',
            'walletName': walletName,
            'accountName': 'account 0'
        }
        let url = apiEnv.baseXels + apiEnv.GetApiURL;
        axios.get(url, { params: addressParam }).then(response => {
            let resAddress = response.data.InnerMsg.addresses[0].address;
            resolve(resAddress);
        }).catch(err => {
            reject(error);
        });
    })
}

function apiWallet(walletParam) {

    return new Promise((resolve, reject) => {
        axios({ method: 'post', url: apiEnv.baseXels + apiEnv.PostAPIURl, data: walletParam })
            .then(response => {
                resolve(response.data);
            }).catch(error => {
                let errObj = {
                    "statusCode": error.response.status,
                    "statusText": error.response.statusText,
                    "InnerMsg": error.response.data.InnerMsg[0].message
                }
                reject(errObj);
            });
    });
}



function getMnemonicsApi() {
    return new Promise((resolve, reject) => {
        const mnemonicsParam = {
            'URL': '/api/wallet/mnemonic',
            'language': 'English',
            'wordCount': 12
        }
        let url = apiEnv.baseXels + apiEnv.GetApiURL;
        axios.get(url, { params: mnemonicsParam }).then(response => {
            resolve(response.data.InnerMsg);
        }).catch(err => {
            reject(error);
        });
    })

}

function insertWallet(walletParam) {

    return new Promise((resolve, reject) => {

        let insertRdd = "INSERT INTO rdd_wallet (walletName , password , address, mnemonics, passphrase  ) values ('" + walletParam.name + "','" + encryp.enCryptPassword(walletParam.password) + "','" + walletParam.address + "', '" + walletParam.mnemonic + "', " + walletParam.passphrase + " )";
        connection.query(insertRdd, (err, rows) => {
            if (err)
                reject(err);
            else {
                resolve(rows);
            }
        });
    });

}

function insertWalletUserMapping(param) {
    let insertUserRdd = "INSERT INTO user_wallet_mapping (user_id  , wallet_id) values (" + param.userId + ", " + param.wid + " )";
    connection.query(insertUserRdd, (err, rows) => {
        if (err)
            return err;
        else {
            return rows;
        }
    });
}

module.exports.getMnemonicsApi = getMnemonicsApi;
module.exports.apiWallet = apiWallet;
module.exports.insertWallet = insertWallet;