var express = require('express');
var app = express()
  .use(express.bodyParser());
exports.app = app;

var settings = require('../settings');
var origin = settings.origin || "http://localhost:8888";

var request = require('request');

//SERVER SIDE TEMPLATES
GLOBAL.Handlebars = require('handlebars');
require('./templates/sandbox-templates');

app.get("/", index);
function index(req, res, next) {
  var template = Handlebars.templates.inlet;
  var html = template({
    origin: origin,
    fullscreen: false
  });
  res.send(html);
};
app.get("/s", share);
function share(req, res, next) {
  var template = Handlebars.templates.inlet;
  var html = template({
    origin: origin,
    fullscreen: true,
    share: true,
    embed: false
  });
  res.send(html);
};
app.get("/e", embed);
function embed(req, res, next) {
  var template = Handlebars.templates.inlet;
  var html = template({
    origin: origin,
    fullscreen: true,
    embed: true
  });
  res.send(html);
};

var mongoConf = {
  type: 'Mongo',
  host: 'localhost',
  port: 27017,
  db: 'tributary'
}

//MONGO SETUP
var mongo = require('mongoskin');
var db = mongo.db(mongoConf.host + ':' + mongoConf.port + '/' + mongoConf.db + '?auto_reconnect');

//collection to store a cache of gists (for faster loading)
var cache = require('../cache');
var $gistcache = db.collection("gists");

//API endpoint for fetching a gist from github
app.get("/gist/:gistid", getgist_endpoint);
function getgist_endpoint(req, res, next) {
  getgist(req.params.gistid, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.header("Content-Type", 'application/json');
      res.send(body);
    } else {
      res.send(response.statusCode);
    }
  })
}

function getgist(gistid, callback) {
  cache.get($gistcache, gistid, function(err, data) {
    // TODO: verify that this cached data is valid
    if(!data) {
      //console.log("data loaded from github")
      var url = 'https://api.github.com/gists/' + gistid
        + "?client_id=" + settings.GITHUB_CLIENT_ID
        + "&client_secret=" + settings.GITHUB_CLIENT_SECRET;
      request.get({
        url: url
      , headers: { 'User-Agent': 'tributary' }
      }, function (err, response, body){
        cache.add($gistcache, gistid, body);
        callback(err,response,body);
      });
    }
    else {
      //console.log("data loaded from cache")
      callback(null,{statusCode:200},data);
    }
  })
}



