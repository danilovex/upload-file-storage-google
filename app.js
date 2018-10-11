
/**
 * Module dependencies.
 */

var express = require('express');
var services = require('./services');
var http = require('http');
var path = require('path');

var app = express();

//criamos instancia do body-parser, usado nos handlers
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Links controllers
app.get('/', services.index);
app.post('/api/files', services.uploadFile);
app.get('/api/files', services.listFiles);
app.delete('/api/files', services.deleteFile);
app.get('/api/files/link-download/:name', services.generateSignedUrl);

app.use(app.router);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
