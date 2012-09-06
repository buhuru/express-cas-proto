routes = function(express, conf, superagent) {
    var routes = {};
    var https = require('https');

    function getCasLoginUrl() {
        return (conf.cas.protocol + '://' + '%h%:' + conf.cas.port + '/cas/login?service=%s%').replace('%h%', conf.cas.host).replace('%s%', conf.cas.service);
    }

    function getCasLogoutUrl() {
        return (conf.cas.protocol + '://' + '%h%:' + conf.cas.port + '/cas/logout').replace('%h%', conf.cas.host);
    }

    function lcarry(f) {
        var largs = Array.prototype.slice.call(arguments, 1);
        return function() {
            var args = Array.prototype.slice.call(arguments)
            return f.apply(null, largs.concat(args));
        }
    }

    function checkCASTicket(casurl, serviceurl, ticket, callback) {
        var options = {
            host: conf.cas.host,
            port: conf.cas.port,
            method: 'GET',
            path: '/cas/serviceValidate?service=%s%&ticket=%t%'.replace('%s%', serviceurl).replace('%t%', ticket)
        };

        console.log('CAS check:', options.path)

        var req = https.request(options, function(res) {
            if (res.statusCode !== 200) {
                return callback(res.statusCode)
            }

            res.on('data', function(data) {
                data = data.toString('utf-8');
                callback(data.indexOf('INVALID_TICKET') !== -1 ? 'INVALID_TICKET' : null, data);
            });
        });

        req.on('error', function(e) {
            callback(e);
        });

        req.end();
    }

    var checkCASTicket = lcarry(checkCASTicket, conf.cas.url, conf.cas.service);

    routes.index = function(req, res) {
        var caslogin = getCasLoginUrl();
        var caslogout = getCasLogoutUrl();
        //console.log(req.session)
        return res.render('index', {
            title: 'Express CAS login',
            username: req.session.username,
            cas_login_url: caslogin,
            cas_logout_url: caslogout,
            partyurl: conf.resturl
        })
    };

    routes.logout = function(req, res) {
        req.session.username = null;
        res.send('ok');
    };

    routes.cas_login = function(req, res) {
        return res.render('caslogin', {
            title: 'catching CAS ticket',
            ticket: req.query.ticket,
            layout: 'smooth-layout'
        });

    };

    routes.cas_verify = function(req, res) {
        checkCASTicket(req.params.ticket, function(err, casres) {
            var uname;
            try {
                uname = casres.split('cas:user')[1].replace(/[^a-z0-9]+/g, '');
            } catch (err) {}
            if (err || !uname) {
                return res.json({
                    error: err,
                    raw: casres
                })
            }

            req.session.username = uname;
            return res.json({
                success: true,
                raw: casres
            })
        });
    }

    routes.rest_user = function(req, res) {

        if (!req.session.username) {
            return res.json({
                error: 'ANUTHORISED',
                raw: 'Anauthorosied users cannot get rest info'
            });
        }

        superagent.get(conf.resturl, function(rest) {

            if (rest.statusCode !== 200) {
                return res.json({
                    error: rest.statusCode,
                    raw: rest.text
                });
            }

            return res.json({
                success: rest.statusCode,
                data: rest.text

            });
            //console.log(rest)
            //res.json(rest);
        });
    }



    routes.autologin = function(req, res) {
        var caslogin = getCasLoginUrl();

        if (!req.session.autologedin) req.session.autologedin = 0;

        req.session.autologedin += 1;

        if (req.session.autologedin > 1) {
            req.session.username = null;
            req.session.autologedin = 0;
        } 
        console.log('loggedin', req.session.autologedin)

        return res.render('autologin', {
            title: 'Express CAS auto login',
            username: req.session.username,
            cas_login_url: caslogin,
            layout : 'autologin-layout'
        });
    }

    return routes;
}

exports.routes = routes