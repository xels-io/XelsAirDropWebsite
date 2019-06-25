const env = require('../config/environment');
const query = require('./query');

const connection = mysql.createConnection(dbconfig.connection);

function distributeXels(rddWalletDetails) {
    console.log(rddWalletDetails);
    console.log(JSON.stringify(rddWalletDetails.addressList));
    return new Promise((resolve, reject) => {
        query.RDDWalletWithRegisteredList(rddWalletDetails.walletId).then(walletDetails => {
            console.log(walletDetails);
            var finalList = walletDetails.map(function(obj) {
                return obj.registered_address;
            });
            if (finalList.length > 0) {
                estimateFee(finalList).then(fee => {
                    let estimatedfee = fee.InnerMsg / 100000000;
                    BuildTransaction(finalList, walletDetails[0].balance, estimatedfee).then(hexData => {
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
            }

        })
    });
    // return new Promise((resolve, reject) => {


    // });
}

function rddWallet(walletId) {
    return new Promise((resolve, reject) => {
        let walletDetails = "select * from rdd_wallet where id =" + walletId;
        connection.query(walletDetails, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);
        })
    });
}


function estimateFee(xels_address) {

    return new Promise((resolve, reject) => {
        const prm = {
            'URL': '/api/wallet/estimate-txfee',
            'walletName': env.walletName,
            'accountName': env.account,
            'allowUnconfirmed': true,
            'feeType': feeType,
            'allowUnconfirmed': true,
            'recipients[0][destinationAddress]': xels_address,
            'recipients[0][amount]': 200
        }
        axios.get(env.baseXels + env.GetApiURL, { params: prm }).then(response => {
            resolve(response.data);
        }).catch(error => {
            console.log('ERROR FROM estimateFee()');
            console.log("estimateFee" + error);
            reject(error);
        });
    });
}

function BuildTransaction(xels_address, amount, estimatedfee) {
    return new Promise((resolve, reject) => {
        const pram = {
            URL: '/api/wallet/build-transaction',
            accountName: env.account,
            allowUnconfirmed: true,
            recipients: [{
                amount: amount,
                destinationAddress: xels_address
            }],
            walletName: env.walletName,
            feeAmount: estimatedfee,
            password: env.walletPw,
            shuffleOutputs: false
        };
        axios({ method: 'post', url: env.baseXels + env.PostAPIURl, data: pram })
            .then(response => {
                resolve(response.data);
            }).catch(error => {
                console.log('ERROR FROM BuildTransaction()');
                reject(error);
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
                //console.log(response.data);
                resolve(response.data);
            }).catch(error => {
                console.log('ERROR FROM SendTransaction()');
                reject(error);
            });
    });

}
module.exports.distributeXels = distributeXels;