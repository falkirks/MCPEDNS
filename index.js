var express = require('express'),
    hbs = require('hbs'),
    request = require('request'),
    dir = require('node-dir'),
    fs = require('fs'),
    bodyParser = require('body-parser');
var app = require('express')();
var http = require('http').Server(app);
var cloudflare = require('cloudflare').createClient({
    email: process.env.CLOUDFLARE_EMAIL,
    token: process.env.CLOUDFLARE_TOKEN
});

hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');
app.set('port', (process.env.PORT || 5000));
app.use(express.static("assets"));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.get('/', function (req, res) {
    res.render('index', {});
});
http.listen(app.get('port'), function () {
    console.log("started on " + app.get('port'))
});


