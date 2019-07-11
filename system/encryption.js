// var generator = require('generate-password');
Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');

const PwdGenerator = require('strict-password-generator').default;

const pwordGenerator = new PwdGenerator();

const options = {
    number: true,
    specialCharacter: true,
    minimumLength: 8,
    maximumLength: 15
}

function passwordGenerator() {
    let newPassword = pwordGenerator.generatePassword(options);

    //console.log(newPassword);
    return newPassword;
}

function enCryptPassword(password) {
    let encryptedPassword = cryptr.encrypt(password);
    return encryptedPassword;
}

function decryptPassword(password) {
    const decryptedString = cryptr.decrypt(password);
    return decryptedString;
}

//module.exports.pw = pw;
module.exports.passwordGenerator = passwordGenerator;
module.exports.decryptPassword = decryptPassword;
module.exports.enCryptPassword = enCryptPassword;