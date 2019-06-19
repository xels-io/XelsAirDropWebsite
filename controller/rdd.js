
let encryp = require('../system/encryption');
require('../system/require');
const apiEnv = require ('../config/environment');
const appMethod = require('../app');
const connection = mysql.createConnection(dbconfig.connection);


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
                    insertWallet(walletParam);
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
function insertWallet(walletParam)
{
    console.log(walletParam);
  //let insertAdmin = 'select * from rdd_wallet';
    let insertRdd = "INSERT INTO rdd_wallet (walletName , password , mnemonics, passphrase  ) values ('" + walletParam.name +"','"+ walletParam.password+"','"+ walletParam.mnemonic+"', "+ walletParam.passphrase+" )";
    console.log(insertRdd);

    connection.query(insertRdd , (err,rows) => {
            console.log(rows);
            if(err)
                return err;
            else
            {
                return rows;
            }
            
        });
}


module.exports.getMnemonicsApi = getMnemonicsApi;

module.exports.apiWallet = apiWallet;


module.exports.insertWallet = insertWallet;