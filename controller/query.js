require('../system/require');
const connection = mysql.createConnection(dbconfig.connection);
const saltRounds = 10;

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

function validPassword(dbpassword, pw) {
    return bcrypt.compareSync(pw, dbpassword); //input password, database password
};

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

// function rddWalletDetails() {
//     return new Promise((resolve, reject) => {
//         let selectQuery = "select * from rdd_wallet where address IS NOT NULL";
//         connection.query(selectQuery, (err, rows) => {
//             if (err)
//                 reject(err);
//             resolve(rows);
//         })
//     })
// }

function userWalletMappingAddress(userId, orgId) {
    return new Promise((resolve, reject) => {
        let selectAdminWallet = "select  rdd_wallet.* , organization_details.name from rdd_wallet inner join organization_details on organization_details.id =" + orgId + " and organization_details.id = rdd_wallet.organization_id";
        connection.query(selectAdminWallet, (err, rows) => {
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
    return new Promise((resolve, reject) => {
        let selectRegisteredQuery = "select registered_list.* , rdd_wallet.walletName, rdd_wallet.id as walletId, rdd_wallet.balance from registered_list inner join rdd_wallet on registered_list.rdd_id = rdd_wallet.id and registered_list.rdd_id = " + temp_wallet_id;

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

function deleteRegisteredList(registeredId) {
    return new Promise((resolve, reject) => {
        const deleteRegisterList = "DELETE FROM registered_list WHERE id = " + registeredId;
        connection.query(deleteRegisterList, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });
    });

}

function insertionRegisterList(address, wallet_id) {
    return new Promise((resolve, reject) => {
        let insertRegisterList = "INSERT INTO registered_list (registered_address , rdd_id ) values ('" + address + "', " + wallet_id + " )";
        connection.query(insertRegisterList, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });
    });
}

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

function userOrganizationList(uId, OrgId) {
    return new Promise((resolve, reject) => {
        let selectUser = "select user.*, organization_details.name from user inner join organization_details on user.organization_id = organization_details.id and organization_details.id = " + OrgId + " and user.id != " + uId;
        connection.query(selectUser, (err, result) => {
            if (err)
                reject(err);
            resolve(result);
        });
    });

}

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

function updateRegisteredAddress(registeredId, address) {
    return new Promise((resolve, reject) => {
        let updateRegisterdAddress = "UPDATE registered_list SET registered_address ='" + address + "' WHERE id = " + registeredId;
        console.log(updateRegisterdAddress);
        connection.query(updateRegisterdAddress, (err, result) => {
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
module.exports.selectUser = selectUser;
module.exports.userWalletMapping = userWalletMapping;
module.exports.userWalletMappingAddress = userWalletMappingAddress;


module.exports.userOrganizationList = userOrganizationList;

module.exports.updateRegisteredAddress = updateRegisteredAddress