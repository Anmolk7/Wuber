var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var bcrypt = require("bcrypt");

router.post('/', function(req, res, next) {
  //Request contains: [sessionID, E([email, token)])]
  console.log(req.body);
  
  var sessionKey, iv;
  db.collection("session").findOne({"sessionID":req.body.sessionID}).then((session) => {
    sessionKey = Buffer.from(session.sessionKey, "hex");
    iv = Buffer.from(session.iv, "hex");
  });
  decipher = crypto.createDecipheriv("aes-128-cbc", sessionKey, iv);
  decrypted = decipher.update(req.body.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  email = JSON.parse(decrypted).email;
  token = JSON.parse(decrypted).token;
  
  exists = false;
  valid = false;
  db.collection("users").countDocuments({"email":email}).then((count) => {exists = count>0;});
  if (exists) {
    db.collection("users").findOne({"email":email}).then((user) => {
      if (token == user.token && user.token.length > 0) {
        valid = true;
      }
    });
  }
  
  json = JSON.stringify({
    "email": email,
    "token": token,
    "valid": valid.toString()
  });
  cipher = crypto.createCipheriv("aes-128-cbc", sessionKey, iv);
  encryptedJson = cipher.update(json, "utf8", "hex");
  encryptedJson += cipher.final("hex");
  res.send(encryptedJson);
  
});

module.exports = router;
