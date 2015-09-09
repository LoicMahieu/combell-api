
var querystring = require('querystring');
var fetch = require('node-fetch');
var cookie = require('cookie');
var cheerio = require('cheerio');
var debug = require('debug')('combell-api');

SESS_COOKIE_NAME = 'PHPSESSID';

module.exports = Client;

function Client (login, password) {
  this._login = login;
  this._password = password;
  this.logged = false;
  this._user = null;
  this._cookie = null;
}

Client.prototype.login = function () {
  debug('Begin login request');
  return fetch('https://my.combell.com', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: querystring.stringify({
      loginform: '1',
      login: this._login,
      pass: this._password
    })
  })
    .then(function (res) {
      debug('Login request end');
      if (res.status !== 200) throw new Error('Invalid login');
      return res;
    })
    .then(function (res) {
      var cookies = res.headers.raw()['set-cookie'];

      cookies.forEach(function (str) {
        var c = cookie.parse(str);
        if (c[SESS_COOKIE_NAME]) {
          this._cookie = c[SESS_COOKIE_NAME];
        }
      }.bind(this));

      return res;
    }.bind(this))
    .then(function (res) {
      return res.json();
    })
    .then(function (user) {
      if (user.state == 'error') {
        throw new Error('Invalid login');
      }

      this._user = user;
      this.logged = true;

      return this._user;
    }.bind(this));
};

Client.prototype.listDomains = function (page) {
  if (!page) {
    page = 0;
  }
  return fetch('https://my.combell.com/fr/product/dns/0///10000', {
    headers: {
      'Cookie': cookie.serialize(SESS_COOKIE_NAME, this._cookie)
    }
  })
    .then(function (res) {
      return res.text();
    })
    .then(function (body) {
      var $ = cheerio.load(body);
      return {
        data: $('.dnsrecords').parents('li').map(function () {
          var $domain = $(this);
          var domain = {
            name: $domain.find('div.data.title > p').text().trim(),
          };
          return domain;
        }).toArray(),
        next: this.listDomains.bind(this, page + 1)
      };
    }.bind(this));
};
