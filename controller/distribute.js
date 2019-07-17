const env = require('../config/environment');
const query = require('./query');
const qs = require('qs');
let encryp = require('../system/encryption');

function distributeXels(rddWalletDetails) {

    return new Promise((resolve, reject) => {
        query.RDDWalletWithRegisteredList(rddWalletDetails.walletId).then(walletDetails => {
            //console.log(walletDetails[0].balance);
            let balance = walletDetails[0].balance - 1;
            //console.log(balance);
            let amount_divide_into_xels_addresses = balance / walletDetails.length;
            //console.log("divide = " + amount_divide_into_xels_addresses);
            var finalList = walletDetails.map(function(obj) {
                return {
                    destinationAddress: obj.registered_address,
                    amount: amount_divide_into_xels_addresses
                }

            });
           // console.log(finalList);
            // resolve(1);
            if (finalList.length > 0) {
                estimateFee(walletDetails, finalList).then(fee => {
                    let estimatedfee = fee.InnerMsg / 100000000;
                   // console.log(estimatedfee);
                    // amountCal(estimatedfee, walletDetails[0].balance, finalList).then(addressAmount => {
                    BuildTransaction(finalList, walletDetails, estimatedfee).then(hexData => {
                        let hexString = hexData.InnerMsg.hex;
                        SendTransaction(hexString).then(success => {
                            let txid = success.InnerMsg.transactionId;
                            resolve(success);
                        }).catch(err => {
                            reject(err);
                        });
                    }).catch(err => {
                        reject(err);
                    });
                    // }).catch(err => {
                    //     reject(err);
                    // });

                }).catch(err => {
                    reject(err);
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
            axios.get(env.baseXels + env.GetApiURL, { params: prm }).then(response => {
                resolve(response.data.InnerMsg.balances);
            }).catch(error => {
                reject(error.response.data);
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
        console.log(TotalBalance);
        let amountReceive = TotalBalance / lengthOfArray;
        const newAddress = mappedAddress.map(address => {
            return {
                destinationAddress: address.destinationAddress,
                amount: amountReceive
            };
        })
        resolve(newAddress);
    })
}

function estimateFee(walletDetails, xels_address) {
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
        axios.get(env.baseXels + env.GetApiURL, {
            params: prm,
            paramsSerializer: function(params) {
                return qs.stringify(params, { encode: true });
            }
        }).then(response => {
            // console.log(response.data);
            resolve(response.data);
        }).catch(error => {
            console.log('ERROR FROM estimateFee()');
            reject(error.response.data.InnerMsg[0].message);
        });
    });
}

function BuildTransaction(xels_address, walletDetails, estimatedfee) {
    return new Promise((resolve, reject) => {
        let pw = encryp.decryptPassword(walletDetails[0].password);
        // console.log(encryp.decryptPassword(walletDetails[0].password));
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
        axios({ method: 'post', url: env.baseXels + env.PostAPIURl, data: param })
            .then(response => {
                resolve(response.data);
            }).catch(error => {
                reject(error.response.data.InnerMsg[0].message);
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
                resolve(response.data);
            }).catch(error => {
                reject(error.response.data.InnerMsg[0].message);
            });
    });

}
module.exports.distributeXels = distributeXels;

module.exports.getBalance = getBalance;