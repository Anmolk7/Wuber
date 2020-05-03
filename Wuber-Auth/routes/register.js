var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var bcrypt = require("bcrypt");

router.post('/', function(req, res, next) {
  //Request contains: sessionID, E(email), E(password)
  console.log(req.body);
  
  var sessionKey, iv;
  db.collection("session").findOne({"sessionID":req.body.sessionID}).then((session) => {
    sessionKey = Buffer.from(session.sessionKey, "hex");
    iv = Buffer.from(session.iv, "hex");
  });
  decipher = crypto.createDecipheriv("aes-128-cbc", sessionKey, iv);
  email = decipher.update(req.body.email, "hex", "utf8");
  email += decipher.final("utf8");
  decipher = crypto.createDecipheriv("aes-128-cbc", sessionKey, iv);
  password = decipher.update(req.body.password, "hex", "utf8");
  password += decipher.final("utf8");
  
  var message = "", success = false;
  emailRegex = new RegExp(/[a-zA-Z0-9._-]+@[a-z]+\.+[a-z]+/, 'i');
  passwordRegex = new RegExp(/(?=.*[A-Z]+)(?=.*[0-9]+)(?=.*[\W_]+)/, 'i');
  if (emailRegex.test(email)) {
    if (passwordRegex.test(password) && password.length >= 8) {
    exists = false;
    db.collection("users").countDocuments({"email":email}).then((count) => {exists = count>0;});
      if (!exists) {
        message = "You have successfully registered";
        success = true;
      } else {
        message = "An account with that email already exists";
      }
    } else {
      message = "That is not a valid password";
    }
  } else {
    message = email+" is not a valid email address";
  }
  
  encryptedToken="";
  if (success) {
    const saltRounds = 10;
    hash = bcrypt.hashSync(password, saltRounds);
    token = crypto.randomBytes(16);
    cipher = crypto.createCipheriv("aes-128-cbc", sessionKey, iv);
    encryptedToken = cipher.update(token.toString("base64"), "utf8", "hex");
    encryptedToken += cipher.final("hex");
    
    db.collection("users").insertOne({
      "email": email,
      "hash": hash,
      "token": token.toString("base64")
    });
  }
  
  res.json({
    "message": message,
    "token": encryptedToken
  });
});

module.exports = router;
