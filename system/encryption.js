

var generator = require('generate-password');
Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');



 let pw = generator.generate({
    length: 10,
    numbers: true
});

function passwordGenerator()
{
  let newPassword = pw;
  let encryptedPassword = cryptr.encrypt(newPassword);
 // console.log(encryptedPassword);
  return encryptedPassword;
}

module.exports.pw = pw; 
module.exports.passwordGenerator = passwordGenerator;