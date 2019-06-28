const env = require('../config/environment');
const query = require('./query');
const qs = require('qs');
let encryp = require('../system/encryption');
const connection = mysql.createConnection(dbconfig.connection);

function distributeXels(rddWalletDetails) {

    return new Promise((resolve, reject) => {
        query.RDDWalletWithRegisteredList(rddWalletDetails.walletId).then(walletDetails => {
            let balance = walletDetails[0].balance - 1;
            var finalList = walletDetails.map(function(obj) {
                return {
                    destinationAddress: obj.registered_address,
                    amount: balance
                }

            });

            if (finalList.length > 0) {
                estimateFee(walletDetails, finalList).then(fee => {
                    let estimatedfee = fee.InnerMsg / 100000000;
                    amountCal(estimatedfee, walletDetails[0].balance, finalList).then(addressAmount => {
                        // console.log(addressAmount);
                        BuildTransaction(addressAmount, walletDetails, estimatedfee).then(hexData => {
                            let hexString = hexData.InnerMsg.hex;
                            SendTransaction(hexString).then(success => {
                                let txid = success.InnerMsg.transactionId;
                                //equallyDitrib(order.id, txid);
                            }).catch(err => {
                                console.log(err);
                            });
                        }).catch(err => {
                            console.log(err);
                        });
                    }).catch(err => {
                        console.log(err);
                    });

                }).catch(err => {
                    console.log(err);
                });
            }
        })
    });
}


function getBalance(walletID) {
    return new Promise((resolve, reject) => {
        query.RDDWalletRow(walletID).then(wallet => {
            const prm = {
                    'URL': '/api/wallet/balance',
                    'walletName': wallet[0].walletName,
                    'accountName': env.accountName
                }
                // let url = env.baseXels + env.GetApiURL;
            axios.get(env.baseXels + env.GetApiURL, { params: prm }).then(response => {
                resolve(response.data.InnerMsg.balances);
            }).catch(error => {
                console.log('ERROR FROM getBalance()');
                console.log("getBalance" + error);
                reject(error);
            });
        }).catch(err => {
            console.log(err);
        });
    });
}

function amountCal(estimatedfee, balance, mappedAddress) {
    return new Promise((resolve, reject) => {
        let lengthOfArray = mappedAddress.length;
        let TotalBalance = balance - 1;
        let amountReceive = TotalBalance / lengthOfArray;
        const newAddress = mappedAddress.map(address => {
            return {
                destinationAddress: address.destinationAddress,
                amount: amountReceive
            };
        })

        // console.log(newAddress);
        resolve(newAddress);
    })
}

function estimateFee(walletDetails, xels_address) {
    //console.log(xels_address);
    return new Promise((resolve, reject) => {
        const prm = {
                'URL': '/api/wallet/estimate-txfee',
                'walletName': walletDetails[0].walletName,
                'accountName': env.accountName,
                'allowUnconfirmed': true,
                'feeType': 'medium',
                'allowUnconfirmed': true,
                'recipients': xels_address
            }
            // const prm = {
            //     'URL': '/api/wallet/estimate-txfee',
            //     'walletName': 'ServerR1',
            //     'accountName': env.accountName,
            //     'allowUnconfirmed': true,
            //     'feeType': 'medium',
            //     'allowUnconfirmed': true,
            //     'recipients': xels_address
            // }
            // console.log(prm);
            //console.log(env.localPort + env.GetApiURL);

        axios.get(env.baseXels + env.GetApiURL, {
            params: prm,
            paramsSerializer: function(params) {
                return qs.stringify(params, { encode: true });
            }
        }).then(response => {
            console.log(response.data);
            resolve(response.data);
        }).catch(error => {
            console.log('ERROR FROM estimateFee()');

            reject(error);
        });
    });
}

function BuildTransaction(xels_address, walletDetails, estimatedfee) {
    console.log(xels_address);

    return new Promise((resolve, reject) => {
        let pw = encryp.decryptPassword(walletDetails[0].password);
        console.log(encryp.decryptPassword(walletDetails[0].password));
        const param = {
            URL: '/api/wallet/build-transaction',
            accountName: env.accountName,
            allowUnconfirmed: true,
            recipients: xels_address,
            walletName: walletDetails[0].walletName,
            feeAmount: estimatedfee,
            password: pw,
            shuffleOutputs: false
        };

        // const param = {
        //     URL: '/api/wallet/build-transaction',
        //     accountName: env.accountName,
        //     allowUnconfirmed: true,
        //     recipients: xels_address,
        //     walletName: 'ServerR1',
        //     feeAmount: estimatedfee,
        //     password: '123',
        //     shuffleOutputs: false
        // };
        console.log(param);
        axios({ method: 'post', url: env.baseXels + env.PostAPIURl, data: param })
            .then(response => {
                console.log(response.data);
                resolve(response.data);
            }).catch(error => {
                console.log('ERROR FROM BuildTransaction()');
                console.log(error.response.data);
                //  reject(error);
            });
    })
}

function SendTransaction(hex) {
    return new Promise((resolve, reject) => {
        const prm = {
            URL: '/api/wallet/send-transaction',
            hex: hex
        };

        axios({ method: 'post', url: env.baseXels + env.PostAPIURl, data: prm })
            .then(response => {
                console.log(response.data);
                resolve(response.data);
            }).catch(error => {
                console.log('ERROR FROM SendTransaction()');
                console.log(error.response.data.InnerMsg);
                reject(error);
            });
    });

}
module.exports.distributeXels = distributeXels;

module.exports.getBalance = getBalance;