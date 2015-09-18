
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
  this._apiBase = 'https://my.combell.com/fr';
}

Client.prototype.login = function () {
  debug('Begin login request');
  return fetch(this._apiBase, {
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

Client.prototype.listDomains = function () {
  return fetch(this._apiBase + '/product/dns/0///10000', {
    headers: {
      'Cookie': cookie.serialize(SESS_COOKIE_NAME, this._cookie)
    }
  })
    .then(function (res) {
      return res.text();
    })
    .then(function (body) {
      var $ = cheerio.load(body);
      return $('.dnsrecords').parents('li').map(function () {
        var $domain = $(this);
        var id = $domain
          .find('a[href^="/fr/product/dns/record/fwd"]')
          .attr('href')
          .match(/\/([a-zA-Z0-9%_-]+)$/);
        var domain = {
          id: id ? id[1] : '',
          name: $domain.find('div.data.title > p').text().trim()
        };
        return domain;
      }).toArray();
    }.bind(this));
};

Client.prototype.listCNAME = function (domain) {
  var url = this._apiBase + '/product/dns/record/cname/' + domain + '/1///1000';

  return fetch(url, {
    headers: {
      'Cookie': cookie.serialize(SESS_COOKIE_NAME, this._cookie)
    }
  })
    .then(function (res) {
      return res.text();
    })
    .then(function (body) {
      return parseRecordList(cheerio.load(body));
    }.bind(this));
};

Client.prototype.listA = function (domain) {
  var url = this._apiBase + '/product/dns/record/a/' + domain + '/1///1000';

  return fetch(url, {
    headers: {
      'Cookie': cookie.serialize(SESS_COOKIE_NAME, this._cookie)
    }
  })
    .then(function (res) {
      return res.text();
    })
    .then(function (body) {
      return parseRecordList(cheerio.load(body));
    }.bind(this));
};

function parseRecordList ($) {
  return $('ul.settings > li:not(.edit_row.table_form, .add_row, .dataheader)').map(function () {
    var $row = $(this);
    var row = {
      record: $row.find('div.data').eq(0).text().trim(),
      dest: $row.find('div.data').eq(1).text().trim(),
      ttl: parseInt($row.find('div.data').eq(2).text())
    };
    return row;
  }).toArray();
}
