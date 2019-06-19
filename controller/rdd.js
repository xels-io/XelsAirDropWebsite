
let encryp = require('../system/encryption');
require('../system/require');
const apiEnv = require ('../config/environment');

module.exports = {
    getRDDCreation: (req, res) => {
        res.render('RDD.ejs');
    },
    walletCreate: (req,res) => {
        let passwordEnc =  encryp.passwordGenerator();
         getMnemonicsApi().then(mnemonic => {
            let walletParam = {
                    'URL' : '/api/wallet/create',
                    'folderPath':  null,
                    'mnemonic': mnemonic,
                    'name': req.body.walletName,
                    'passphrase': 1234,
                    'password': passwordEnc
                }
                apiWallet(walletParam).then(success => {
                   console.log(success);
                }).catch(err => {
                    console.log(err);
                });
         });
    },
}

function apiWallet(walletParam)
{
    return new Promise((resolve,reject)=>{
        axios({ method: 'post', url: apiEnv.baseXels + apiEnv.PostAPIURl, data: walletParam})
                .then(response => {
                    console.log(response.data);
                    console.log("wallet.data");
                    resolve(response.data);
                }).catch(error => {
                    console.log('ERROR FROM BuildTransaction()');
                    reject(error);
            });
    });
}



function getMnemonicsApi()
{
    return new Promise((resolve,reject) => {
        const mnemonicsParam = {
            'URL' : '/api/wallet/mnemonic',
            'language' : 'English',
            'wordCount': 12
          }
        let url = apiEnv.baseXels + apiEnv.GetApiURL;
        axios.get(url , {params: mnemonicsParam}
            ).then(response => {    
                resolve(response.data.InnerMsg);
            }).catch(err => {
                console.log("error of getting mnemonics" + err);
                reject(error);
            });
    })
    
}

function insertWallet()
{
   // let insertAdmin = "INSERT INTO rdd_wallet (walletName , password , mnemonics, passphrase , rdd_type ) values ('" + name +"','"+ password+"','"+ mnemonic+"', ,'"+ passphrase+"', ,'"+ type+"' )";
}

module.exports.getMnemonicsApi = getMnemonicsApi;

module.exports.apiWallet = apiWallet;
