//Environment variable MKZENSE_ENABLE_SSL
//if set will start SSL server, use only for deployment
//on mkzense.com
//Do not set for local testing.

//****************************************************
const MQTT_BROKER = 'mqtt://mkzense.com';
var   PORT  = 3001;
if (process.env.MKZENSE_ENABLE_SSL) {
  PORT=80;
}
const SECURE_PORT = 443;
//****************************************************

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//var oauthserver = require('express-oauth-server');
var oauthserver = require('oauth2-server');
//var oauthError = require('oauth2-server/lib/error');

var mongoose = require('mongoose');
var swig = require('swig');

const mqtt = require('mqtt')
const mqttClient = mqtt.connect(MQTT_BROKER)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var mongodbUri = "mongodb://mkzense:mkzensemongo@localhost/test";

var app = express();

//Define async function
var mongooseConnectAsync = async function (uri) {
  try {
    await mongoose.connect(uri);
    console.log(`Mongoose Connected to ${uri}`);
  }
  catch (err) {
    console.log(new Error(err));
    process.exit();
  }
}

//Wrap async function to call at top level
var mongooseConnect = function(uri) {
  mongooseConnectAsync(uri);
}

//Call for connection
mongooseConnect(mongodbUri);

//https setup
var https;
var options;
if (process.env.MKZENSE_ENABLE_SSL) {
  https = require("https"),
        fs = require("fs");
  options = {
      cert: fs.readFileSync("/etc/letsencrypt/live/mkzense.com/fullchain.pem"),
      key: fs.readFileSync("/etc/letsencrypt/live/mkzense.com/privkey.pem")
  };
}

mqttClient.on('connect', () => {
  console.log("connected to MQTT broker");
})

app.mqttClient = mqttClient;

app.oauth = new oauthserver( {
  debug: true,
  model:require('./model'),
  grants:['password'],
  continueMiddleware: false,
  accessTokenLifetime: 2000000000
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');

app.set('view engine', 'html')
app.engine('html', swig.renderFile);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.MKZENSE_ENABLE_SSL) {
  app.use(function(req, res, next) {
      if (req.secure) {
          console.log("secure request");
          next();
      } else {
          console.log("non-secure request, redirect to secure");
          res.redirect('https://' + req.headers.host + req.url);
      }
  });
}

app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

app.use('/auth', indexRouter);

var grantToken = function( req, res ) {

  let oauthReq = new oauthserver.Request(req);
  let oauthRes = new oauthserver.Response(res);

    app.oauth.token(oauthReq,oauthRes)
    .then( token => {
      console.log(JSON.stringify(token));
      res.status = 302;
      var location = req.body.redirect_uri
                    + "#access_token=" + token.accessToken + "&token_type=bearer"
                    + "&state=" + req.body.state ;

      console.log("Redirect location = " + location);
      res.set({location});
      res.redirect(location);
    })
    .catch( err => {
      console.log(new Error(err));
      res.json({"error": err});
    })
}

//TODO:cleanup should be moved to router.
app.post('/auth/login', grantToken );

var authenticate = function( req, res, next ) {

  let oauthReq = new oauthserver.Request(req);
  let oauthRes = new oauthserver.Response(res);

    app.oauth.authenticate(oauthReq,oauthRes)
    .then( token => {
      console.log(JSON.stringify(token.userId));
      res.locals.userId = token.userId;
      next();
    })
    .catch( err => {
      console.log(new Error(err));
      res.json({"error": err});
    })
}

function injectMQTTClient(req,res,next) {
  res.locals.mqttClient = app.mqttClient;
  next();
}

app.use('/smarthome', authenticate, injectMQTTClient, usersRouter);

/*
app.use(function (err, req, res, next) {
  console.log("OAuth authorization error");
  //If oauth authorization error
  if (err instanceof oauthError) {
    //logger.log('info', err); // pass only oauth errors to winston
    return res.redirect('/auth/login');
  }
  next(err); // pass on to
});
*/

//app.use(app.oauth.errorHandler()); // Send back oauth compliant response

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//http listener
app.listen(PORT, () => {
    console.log(`listening (non-secure:http) on port ${PORT}`)
})

if (process.env.MKZENSE_ENABLE_SSL) {
  //https listener
  https.createServer(options, app).listen(SECURE_PORT, () =>{
      console.log(`listening (secure:https) on port ${SECURE_PORT}`)
  });
}

//module.exports = app;
