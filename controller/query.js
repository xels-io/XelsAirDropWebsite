require('../system/require');
const connection = mysql.createConnection(dbconfig.connection);
const saltRounds = 10;
/**  Password Hash generation starts here
 *
 *
 */
function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
/**  Password validation starts here
 *
 *
 */
function validPassword(dbpassword, pw) {
    return bcrypt.compareSync(pw, dbpassword); //input password, database password
};
/**  user wallet mapping starts here
 *
 *
 */
function userWalletMapping(walletId) {
    return new Promise((resolve, reject) => {
        let selectAdminWallet = "select user_wallet_mapping.* , rdd_wallet.walletName ,user.email from user_wallet_mapping inner join rdd_wallet inner join user on user_wallet_mapping.wallet_id = rdd_wallet.id and user_wallet_mapping.user_id = user.id";
        connection.query(selectAdminWallet, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);
        })
    })
}

/**  rdd wallet mapping with registered list starts here
 *
 *
 */
function RDDWalletWithRegisteredList(walletId) {
    return new Promise((resolve, reject) => {
        let selectQuery = "select rdd_wallet.*, registered_list.registered_address from rdd_wallet inner join registered_list on rdd_wallet.id = registered_list.rdd_id and registered_list.deleted = 0 and registered_list.rdd_id = " + walletId;
        // console.log(selectQuery);
        connection.query(selectQuery, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);
        })
    })
}
/**  rdd wallet mapping with organization starts here
 *
 *
 */
function WalletMappingAddress(orgId) {
    return new Promise((resolve, reject) => {
        let selectWallet = "select  rdd_wallet.* from rdd_wallet where organization_id =" + orgId;
        connection.query(selectWallet, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);
        })
    })
}

/**  rdd wallet details starts here
 *
 *
 */
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

/**  rdd wallet mapping with type starts here
 *
 *
 */

function typeOfWallet(temp_wallet_id) {

    return new Promise((resolve, reject) => {
        let selectQuery = "select rdd_wallet.walletName, rdd_wallet.balance, rdd_wallet.rdd_type, rdd_type.* from rdd_wallet inner join rdd_type ON rdd_wallet.rdd_type = rdd_type.id and rdd_wallet.id= " + temp_wallet_id;
        connection.query(selectQuery, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);
        })
    });

}
/**  rdd wallet mapping with registered address starts here
 *
 *
 */

function registeredAddressList(temp_wallet_id) {
    return new Promise((resolve, reject) => {
        // let selectRegisteredQuery = "select registered_list.* , rdd_wallet.walletName, rdd_wallet.id as walletId, rdd_wallet.balance from registered_list inner join rdd_wallet on registered_list.rdd_id = rdd_wallet.id and registered_list.rdd_id = " + temp_wallet_id;
        let selectRegisteredQuery = "select registered_list.*  from registered_list where rdd_id = " + temp_wallet_id + " and deleted = 0";
        connection.query(selectRegisteredQuery, (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);

        });
    });
}
/** User password match starts here
 *
 *
 */
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
/** Balance update of a rdd Wallet starts here
 *
 *
 */
function updateBalance(amount, wallet_id) {

    return new Promise((resolve, reject) => {
        let updateWalletBalance = "UPDATE rdd_wallet SET balance=" + amount + " WHERE id='" + wallet_id + "'";
        connection.query(updateWalletBalance, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });
    });
}
/** Type update of a rdd Wallet starts here
 *
 *
 */
function updateTypeofWallet(type, wallet_id) {
    return new Promise((resolve, reject) => {
        let updateWallet = "UPDATE rdd_wallet SET rdd_type=" + type + " WHERE id='" + wallet_id + "'";
        connection.query(updateWallet, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });
    });

}
/** address update of a rdd Wallet starts here
 *
 *
 */
function updateAddress(walletId, address) {

    return new Promise((resolve, reject) => {

        let checkAddress = "select * from rdd_wallet where address='" + address + "'";
        connection.query(checkAddress, (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length) {
                resolve(rows);
            } else {
                let updateWalletAddress = "UPDATE rdd_wallet SET address='" + address + "' WHERE id=" + walletId;
                connection.query(updateWalletAddress, (err, result) => {
                    if (err)
                        reject(err);
                    resolve(result);
                });
            }
        });
    });
}
/** Delete registered address of a rdd Wallet starts here
 *
 *
 */

function deleteRegisteredList(registeredId) {
    return new Promise((resolve, reject) => {
        let updateDeletion = "update registered_list SET deleted = 1 WHERE id = " + registeredId;
        console.log(updateDeletion);
        //const deleteRegisterList = "DELETE FROM registered_list WHERE id = " + registeredId;
        connection.query(updateDeletion, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });
    });

}
/** Insert registered address of a rdd Wallet starts here
 *
 *
 */
function insertionRegisterList(address, wallet_id) {
    return new Promise((resolve, reject) => {
        let checkDuplicate = "select * from registered_list where registered_address= '" + address + "'and rdd_id =" + wallet_id;
        connection.query(checkDuplicate, (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length) {
                if (rows[0].deleted === 1) {
                    let updateRegisterList = "Update registered_list SET deleted = 0 where registered_address='" + address + "' and rdd_id=" + wallet_id;
                    //console.log(updateRegisterList);
                    connection.query(updateRegisterList, (err, Updatedresult) => {
                        //console.log("result");
                        if (err)
                            reject(err);
                        resolve(Updatedresult);
                    });
                } else {
                    resolve(rows);
                }

            } else {
                let insertRegisterList = "INSERT INTO registered_list (registered_address , rdd_id ) values ('" + address + "', " + wallet_id + " )";
                connection.query(insertRegisterList, (err, result) => {
                    if (err)
                        reject(err);
                    resolve(result);
                });
            }

        });

    });
}
/** Update Registered address starts here
 *
 *
 */
function updateRegisteredAddress(registeredId, address) {
    return new Promise((resolve, reject) => {
        let checkDuplicate = "select * from registered_list where registered_address= '" + address + "'";
        connection.query(checkDuplicate, (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length) {
                resolve(rows);
            } else {
                let updateRegisterdAddress = "UPDATE registered_list SET registered_address ='" + address + "' WHERE id = " + registeredId;
                // console.log(updateRegisterdAddress);
                connection.query(updateRegisterdAddress, (err, result) => {
                    //console.log(result);
                    if (err)
                        reject(err);
                    resolve(result);
                });
            }
        });

    });
}
/** Insert Admin of an organization starts here
 *
 *
 */
function insertionNewAdmin(email, organizationId, password) {

    return new Promise((resolve, reject) => {
        let insertAdmin = "INSERT INTO user (email , organization_id, password ) values ('" + email + "','" + organizationId + "','" + generateHash(password) + "' )";
        connection.query(insertAdmin, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });

    });
}
/** Regiser new Admin of an existing organization starts here
 *
 *
 */

function registerAdmin(email, organization_name, password) {

    return new Promise((resolve, reject) => {
        let insertOrg = "INSERT INTO organization_details (name  ) values ('" + organization_name + "') ";
        connection.query(insertOrg, function(err, org_rows) {
            let insertAdmin = "INSERT INTO user (email , organization_id, password ) values ('" + email + "','" + org_rows.insertId + "','" + generateHash(password) + "' )";
            connection.query(insertAdmin, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    });
}
/** check if user exists or not starts here
 *
 *
 */
function selectUser(email) {
    return new Promise((resolve, reject) => {
        let selectUser = "select * from user where email = '" + email + "'";
        connection.query(selectUser, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });
    });
}
/** user mapping with organization starts here
 *
 *
 */
function userOrganizationList(uId, OrgId) {
    return new Promise((resolve, reject) => {
        let selectUser = "select user.*, organization_details.name from user inner join organization_details on user.organization_id = organization_details.id and organization_details.id = " + OrgId; //+ " and user.id != " + uId;
        connection.query(selectUser, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });
    });

}
/** Delete User starts here
 *
 *
 */
function deleteUserList(userId) {
    return new Promise((resolve, reject) => {
        const deleteUserList = "DELETE FROM user WHERE id = " + userId;
        //const deleteuserWalletMap = "DELETE user_wallet_mapping , user FROM user_wallet_mapping INNER JOIN user ON  user_wallet_mapping.user_id =  user.id and user.id = " + userId;
        connection.query(deleteUserList, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });
    });
}


module.exports.generateHash = generateHash;
module.exports.RDDWalletWithRegisteredList = RDDWalletWithRegisteredList;
module.exports.validPassword = validPassword;
module.exports.userPwMatch = userPwMatch;
module.exports.typeOfWallet = typeOfWallet;
module.exports.registeredAddressList = registeredAddressList;
//module.exports.rddWalletDetails = rddWalletDetails;

module.exports.RDDWalletRow = RDDWalletRow;

module.exports.deleteRegisteredList = deleteRegisteredList;
module.exports.deleteUserList = deleteUserList;

module.exports.insertionRegisterList = insertionRegisterList;
module.exports.insertionNewAdmin = insertionNewAdmin;
module.exports.registerAdmin = registerAdmin;

module.exports.updateTypeofWallet = updateTypeofWallet;
module.exports.updateBalance = updateBalance;
module.exports.updateAddress = updateAddress;

module.exports.selectUser = selectUser;
module.exports.userWalletMapping = userWalletMapping;


module.exports.userOrganizationList = userOrganizationList;

module.exports.updateRegisteredAddress = updateRegisteredAddress;

module.exports.WalletMappingAddress = WalletMappingAddress;