var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var bcrypt = require("bcrypt");

router.post('/', function(req, res, next) {
  //Request contains: [sessionID, E([email, password])]
  console.log(req.body);
  
  var sessionKey, iv;
  db.collection("session").findOne({"sessionID":req.body.sessionID}).then((session) => {
    sessionKey = Buffer.from(session.sessionKey, "hex");
    iv = Buffer.from(session.iv, "hex");
  });
  decipher = crypto.createDecipheriv("aes-128-cbc", sessionKey, iv);
  decrypted = decipher.update(req.body.email, "hex", "utf8");
  decrypted += decipher.final("utf8");
  email = JSON.parse(decrypted).email;
  password = JSON.parse(decrypted).password;
  
  message = "";
  exists = false;
  success = false;
  db.collection("users").countDocuments({"email":email}).then((count) => {exists = count>0;});
  if (exists) {
    hash="";
    db.collection("users").findOne({"email":email}).then((user) => {hash=user.hash;});
    if (bcrypt.compareSync(password, user.hash)) {
      message = "Logged in successfully";
      success = true;
    } else {
      message = "Incorrect password";
    }
  } else {
    message = "Unknown user";
  }
  
  token = "";
  if (success) {
    token = crypto.randomBytes(16).toString("base64");
    db.collection("users").findOneAndUpdate({"email":email},{"token":token});
  }
  
  json = JSON.stringify({
    "message": message,
    "token": token
  });
  cipher = crypto.createCipheriv("aes-128-cbc", sessionKey, iv);
  encryptedJson = cipher.update(json, "utf8", "hex");
  encryptedJson += cipher.final("hex");
  res.send(encryptedJson);
});

module.exports = router;
