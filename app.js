
/**
 * Module dependencies.
 */
var express = require('express')
  , superagent = require('superagent')
  , conf = require('./config').config
  , routes = require('./routes').routes(express, conf, superagent);

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/logout', routes.logout);
app.get('/cas/verify/:ticket', routes.cas_verify);
app.get('/cas/login', routes.cas_login);
app.get('/rest/user', routes.rest_user);



app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
