var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var MongoClient = require("mongodb").MongoClient;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var registerRouter = require('./routes/register');
var startRouter = require('./routes/start');
var validateRouter = require('./routes/validate');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//app.use('/users', usersRouter);

var client = new MongoClient("mongodb://localhost:27017", {useUnifiedTopology:true});
client.connect(function(err) {
  console.log("Connected successfully to server");
  db = client.db("authentication");
  app.use('/login', loginRouter);
  app.use('/logout', logoutRouter);
  app.use('/register', registerRouter);
  app.use('/start', startRouter);
  app.use('/validate', validateRouter);
});

module.exports = app;
