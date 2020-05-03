var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var NodeRSA = require("node-rsa");

router.post('/', function(req, res, next) {
  //Request contains: [E(publicKey, [sessionKey, iv, nonce])]
  //sessionKey and iv are 128-bit hex strings
  
  const privateKey = new NodeRSA("-----BEGIN RSA PRIVATE KEY-----\n"+
  "MIIEpQIBAAKCAQEA4NS+Nd3SuBX6spIX/8BZ1zdrOFq9kAjj6FVx/oLh3ipFcn/l\n"+
  "FSoAgjQYPgQC+whapTtGzI/FLDckfo6eO1xNHrM5y4cOR/sU0aqfjTXft/tv8Cf2\n"+
  "tmEtNcxvxn+oMGTzvtzmpdbHiOSQkS5zKbJczSuNwN0l6cf/aBL50meg00QNn/Mw\n"+
  "bWBBMCjCT6H3CCPA5HA1n8IebbDOdVsGba8HWgCJoxK8kShGzNdoD/Deh572HEMH\n"+
  "+bTdeFVrmr0JRBz4nB+VqAMf/MH9RqAfAW7mrCY5makECk5sIjj1A+HS59CYt5Z4\n"+
  "WZDvK4mV5JNWM3pd4oOFuuv1atoWpX7Cjhd24QIDAQABAoIBABvobH/1O/3bxJW7\n"+
  "6ry1XLGJUIbbRKKHZ/rj+FV2W6EfMCWpWH9LCmsfGk9AYjpU7COMexpTUk9NvPr0\n"+
  "qxGFQJFp/+eSqSQoN4pbGpkFsfJ9hISUAVzcLSd7a/iAyhjPvy3W785wHa6RaJyM\n"+
  "3oCzgi95k4v4J4egasS5bkc+08jFcyxtuVJC4ZsnuoBtsla55xyP1xGJo3sXP4eH\n"+
  "9RnyjH311h3zv1epWcu5UxCR9+d8d+a7AjY4AcIDniRzVNuq+ZBAF1RgKUzLx7qW\n"+
  "atYQjn6nicFABwaW5wJSZOnp47MqFLfO1YJzJ3a8fAQkR8Oc/VqXgL+jmtAEITOu\n"+
  "sYWEawECgYEA+XzwYiyNLy94T2vHJSdGuW8e98+Kz5SZvoijoIRoWRiEiXJKKB+l\n"+
  "EInaI690+S13rRmcRwgObGy619UDMxCKV4+VbFEEwqarMNrq4RPqOxtNtWr7Ql5X\n"+
  "vKRRM7gFZGdvCqXADb0roqdt/AXxylLoee5oyRaW3pkRpPT84Mv+3JECgYEA5rMM\n"+
  "MPjJIVu/+Un/LH7kljfkNpBHxAP1l1eyD1fWasUz/1Dq5zmyPmDZfliVj0Uu85Dc\n"+
  "yadYVhtzzXPsVa6nM9g3udywlWJD2HY2yUnmFJpBAwpWxIQYPnrPA1cJ6p0GVIQ1\n"+
  "uddA1D7AeYgE5Zk8zKXwpvSRLj6KodfIrjyjXVECgYEApaCgJUzWXeDxyigPCUdN\n"+
  "2IVA1dtel/hbKPalSkcczylLs8PAH2sCtjwOKWquCU56CNzbtvxONwTn9algemIc\n"+
  "tYyI8mPG+UKUm9Z53/rMoXi62hmvvJvNO1sK3X7pdYKFYVgwa+6OLWlhxtJbdqob\n"+
  "0/bGcdkhR53u7MgHqWVESUECgYEA4JBVQ65IinI3MsB25ac3d4o8WWikkwePnpw8\n"+
  "tXa5PwFrFhJ8NkwRV2sLC1PLccTUaT8PzDNbZ6YdWVaILPdvxqWnyQIr2Z3nkOOx\n"+
  "fMq0bkWhFwaPY4d52gfNTuEAxCHJsadobNg9QN08mpBuw9ggOM0mrj3OvIcgh132\n"+
  "+LQKCaECgYEAzmKhXrUrVD9tNj6TeR52ty2lQBDoeBVsym01NFVuI8LNSLux1l1R\n"+
  "eBT0iNUWFsN3N8aBVv1s5C+bgTk98A/0weLI4OOfLOVrqlCf6bgn1IG1Bn7vUVlZ\n"+
  "y5eRDpbsdblHKfOCHLEGmk4iKZt1bVq95bAp413NQpT/KDVqV5Uqe1Q=\n"+
  "-----END RSA PRIVATE KEY-----");

  body = privateKey.decrypt(req.body);
  sessionKey = Buffer.from(body.sessionKey, "hex");
  iv = Buffer.from(body.sessionKey, "hex");
  nonce = Number(body.nonce);
  sessionID = crypto.randomBytes(4);
  console.log(sessionKey.toString("hex"));
  
  db.collection("session").insertOne({
    "sessionID": sessionID.toString("hex"),
  	"sessionKey": sessionKey.toString("hex"),
  	"iv": iv.toString("hex")
  });
  
  json = JSON.stringify({
  	"sessionID": sessionID.toString("hex"),
  	"nonce": nonce+1
  });
  signature = privateKey.sign(json, "hex");
  res.json({
    "signedJSON": json,
    "signature": signature
  });
});

module.exports = router;
