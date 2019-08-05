const env = require('../config/environment');
const queryMethod = require('./query');

module.exports = {
    getRddDetails: (req, res) => {
        let temp_wallet_id = req.query.id;
        queryMethod.typeOfWallet(temp_wallet_id).then(response => {

            queryMethod.registeredAddressList(temp_wallet_id).then(registeredList => {
                // console.log(registeredList);
                res.render('rddDetails.ejs', {
                    walletId: temp_wallet_id,
                    list: registeredList,
                    walletType: response[0].typeName,
                    walletName: response.length > 0 ? response[0].walletName : response[0].walletName,
                    bAmount: response.length > 0 ? response[0].balance : 0
                })
            }).catch(err => {
                console.log(err);
            });
        }).catch(err => {
            console.log(err);
        });
    },
    addRegisteredAddress: (req, res) => {
        let temp_wallet_id = req.body.wallet_id;
        queryMethod.typeOfWallet(temp_wallet_id).then(response => {
            queryMethod.insertionRegisterList(req.body.address, req.body.wallet_id).then(response => {

                if (response.insertId || response.affectedRows > 0) {
                    req.flash('registerMessage', "Address registered successfully");
                    queryMethod.registeredAddressList(temp_wallet_id)
                        .then(registeredList => {
                            res.json({
                                // list: rddArr,
                                walletId: temp_wallet_id,
                                list: registeredList,
                                message: req.flash('registerMessage'),
                                walletName: registeredList.length > 0 ? registeredList[0].walletName : '',
                                bAmount: registeredList.length > 0 ? registeredList[0].balance : 0
                            });
                            res.end();
                        }).catch(err => {

                        });
                } else {
                    req.flash('registerErrorMessage', "Address already registered. Please insert different one");
                    // queryMethod.registeredAddressList(temp_wallet_id)
                    //     .then(registeredList => {
                    res.json({
                        errMessage: req.flash('registerErrorMessage')
                    });
                    res.end();
                    // }).catch(err => {

                    // });
                }
            }).catch(err => {
                console.log(err);
                req.flash('registerErrMsg', err.InnerMsg);
                res.render('rddDetails.ejs', {
                    walletId: req.body.wallet_id,
                    list: registeredList,
                    errMessage: req.flash('registerErrMsg'),
                    walletName: registeredList.length > 0 ? registeredList[0].walletName : '',
                    bAmount: registeredList.length > 0 ? registeredList[0].balance : 0
                });
            });
        }).catch(err => {
            console.log(err);
        });
    },
    updateRegisteredAddress: (req, res) => {
        const registeredId = req.body.reg_id;
        let address = req.body.updateAddress;
        console.log(address);
        queryMethod.updateRegisteredAddress(registeredId, address)
            .then(response => {
                //console.log(response);
                if (response.changedRows) {
                    queryMethod.registeredAddressList(req.body.wallet_id)
                        .then(registeredList => {
                            res.json({
                                list: registeredList,
                                message: "Address updated successfully"
                            });
                            res.end();
                        })
                } else {
                    req.flash('updateErrorAddress', "Address already registered. Please insert different one");
                    res.json({
                        errMessage: "This address already exists. Please update with different one"
                    });
                    res.end();
                }

                //res.redirect('/rddDetails?id=' + req.body.wallet_id);
            }).catch(err => {
                req.flash('updateErrorAddress', "Address already registered. Please insert different one");
                res.json({
                    errMessage: "This address already exists. Please insert different one"
                });
                res.end();
                // return err;
            });
    },
    updateWalletType: (req, res) => {
        queryMethod.updateTypeofWallet(req.body.type, req.body.wallet_id).then(response => {
            let temp_wallet_id = req.body.wallet_id;
            if (response.affectedRows > 0) {
                queryMethod.typeOfWallet(temp_wallet_id).then(response => {
                    req.flash('message', "Type of wallet updated");
                    res.json({
                        message: req.flash('message'),
                        walletType: response[0].typeName,
                    });
                    res.end();

                })

            }
        }).catch(err => {
            console.log(err);
            req.flash('errMessage', err);
            res.json({ errMessage: req.flash('errMessage') });
            res.end();
        });
    },
    deleteRegisteredAddress: (req, res) => {
        const registeredId = req.body.registeredId;
        queryMethod.deleteRegisteredList(registeredId).then(response => {
            queryMethod.registeredAddressList(req.body.walletId)
                .then(registeredList => {
                    res.json({
                        list: registeredList,
                        message: "Address Deleted successfully"
                    });
                    res.end();
                }).catch(err => {
                    return err;
                });
        }).catch(err => {
            return err;
        });
    }
}