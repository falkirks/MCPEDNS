var express = require('express'),
    hbs = require('hbs'),
    request = require('request'),
    dir = require('node-dir'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    assert = require('assert'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    Recaptcha = require('recaptcha').Recaptcha,
    herokuIp = require('heroku-ip'),
    MongoClient = require('mongodb').MongoClient,
    validator = require("email-validator");
var app = require('express')();
var http = require('http').Server(app);

assert.equal(typeof process.env.CLOUDFLARE_EMAIL, "string");
assert.equal(typeof process.env.CLOUDFLARE_TOKEN, "string");
assert.equal(typeof process.env.CLOUDFLARE_DOMAIN, "string");
assert.equal(typeof process.env.CAPTCHA_PUBLIC, "string");
assert.equal(typeof process.env.CAPTCHA_SECRET, "string");
MongoClient.connect(process.env.MONGOLAB_URI || "mongodb://127.0.0.1:27017/test", function (err, db) {
    if (err) throw err;
    var clients = db.collection('clients');
    var cloudflare = require('cloudflare').createClient({
        email: process.env.CLOUDFLARE_EMAIL,
        token: process.env.CLOUDFLARE_TOKEN
    });

    var usedNames = {};
    cloudflare.listDomainRecords(process.env.CLOUDFLARE_DOMAIN, (function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            usedNames[res[i].display_name] = res[i].display_name;
        }
        console.log("Used names ready.");
    }));

    hbs.registerPartials(__dirname + '/views/partials');
    app.set('view engine', 'hbs');
    app.set('port', (process.env.PORT || 5000));
    app.use(express.static("assets"));
    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));
    app.use(cookieParser());
    app.use(session({
        secret: 'keyboard cat'
    }));
    app.use(herokuIp(['production']));

    app.get('/', function (req, res) {
        var recaptcha = new Recaptcha(process.env.CAPTCHA_PUBLIC, process.env.CAPTCHA_SECRET);
        res.render('index', {captcha: recaptcha.toHTML(), domain: process.env.CLOUDFLARE_DOMAIN});
    });
    app.get('/api/isUsed/:name', function (req, res) {
        if (req.params.name != null) {
            res.end(JSON.stringify({isUsed: (usedNames[req.params.name] != null)}));
        }
        else {
            res.end("{error: true}");
        }
    });
    app.post('/api/claim', function (req, res) {
        var data = {
            remoteip: req.heroku.ip,
            challenge: req.body.challenge,
            response: req.body.response
        };
        var recaptcha = new Recaptcha(process.env.CAPTCHA_PUBLIC, process.env.CAPTCHA_SECRET, data);

        recaptcha.verify(function (success, error_code) {
            if (success) {
                var name = req.param("name");
                var ip = req.param("ip");
                var email = req.param("email");
                if (name && ip && email) {
                    if(validator.validate(email)) {
                        if (name.length >= 3) {
                            cloudflare.addDomainRecord(process.env.CLOUDFLARE_DOMAIN, {
                                type: "A",
                                name: name,
                                content: ip,
                                ttl: 1
                            }, function (err, dnsResult) {
                                if (err) {
                                    res.end(JSON.stringify({error: true, message: "Record already exists."}));
                                }
                                else {
                                    clients.update(
                                        {email: email},
                                        {$push: {records: {ip: ip, clientIp: req.heroku.ip, name: name}}},
                                        {upsert: true, safe: false},
                                        function (err, data) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log("added record.");
                                            }
                                        }
                                    );
                                    usedNames[name] = name;
                                    res.end(JSON.stringify(dnsResult));
                                }
                            });
                        }
                        else {
                            res.end(JSON.stringify({error: true, message: "Record already exists."}));
                        }
                    }
                    else{
                        res.end(JSON.stringify({error: true, message: "Bad email address."}));
                    }
                }
                else {
                    res.end(JSON.stringify({error: true, message: "All fields are required."}));
                }
            }
            else {
                res.end(JSON.stringify({error: true, message: "Bad CAPTCHA."}));
            }
        });
    });
    http.listen(app.get('port'), function () {
        console.log("started on " + app.get('port'))
    });
});

