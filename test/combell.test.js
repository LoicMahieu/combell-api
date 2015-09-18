
var Combell = require('../src/combell');
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var nock = require('nock');
var fs = require('fs');

var credentials = {
  valid: ['loic', 'Larz1420'],
  invalid: ['aa', 'bb']
};

// nock.recorder.rec();

describe('Combell', function () {
describe('Combell::login()', function () {
  it('Can successfully login with valid credentials', function () {
    var mock = nock('https://my.combell.com:443')
      .post('/fr', "loginform=1&login="+ credentials.valid[0] +"&pass="+ credentials.valid[1])
      .reply(200, {"state":"ok","result":{"some user removed for test": true},"message":"Actie succesvol verwerkt"}, { date: 'Tue, 08 Sep 2015 21:57:50 GMT',
      server: 'Apache',
      'set-cookie':
       [ 'PHPSESSID=9bb7r9i0u5k868kdah6e5r6dl1; path=/; secure; HttpOnly',
         'PHPSESSID=5vm91da5bdmg6qpbbm34bk9v96; path=/; secure; HttpOnly' ],
      expires: 'Thu, 19 Nov 1981 08:52:00 GMT',
      'cache-control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
      pragma: 'no-cache',
      'content-length': '975',
      connection: 'close',
      'content-type': 'application/json' });

    var client = new Combell(credentials.valid[0], credentials.valid[1]);
    return client.login()
      .then(function (user) {
        expect(user).to.be.an('object');
        expect(client.logged).to.be.equals(true);
        // must be the latest PHPSESSID
        expect(client._cookie).to.be.equals('5vm91da5bdmg6qpbbm34bk9v96');
        mock.done();
      });
  });
  it('Can successfully login with valid credentials', function () {
    var mock = nock('https://my.combell.com:443')
      .post('/fr', "loginform=1&login=aa&pass=bb")
      .reply(200, {"state":"error","message":"Er is een fout opgetreden","info":{"IsEmpty":true,"IsSuccessfull":false,"FaultType":"UAC_InvalidUserCredentialsFault","FaultMessage":"Met de ingegeven gebruikersnaam aa kan op dit moment niet ingelogd worden. Ofwel is deze gebruiker onbestaande of inactief, ofwel is het ingegeven wachtwoord foutief."}}, { date: 'Tue, 08 Sep 2015 21:59:24 GMT',
      server: 'Apache',
      'set-cookie': [ 'PHPSESSID=f13bo6aif17hl4en9llbckhi45; path=/; secure; HttpOnly' ],
      expires: 'Thu, 19 Nov 1981 08:52:00 GMT',
      'cache-control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
      pragma: 'no-cache',
      'content-length': '331',
      connection: 'close',
      'content-type': 'application/json' });

    var client = new Combell(credentials.invalid[0], credentials.invalid[1]);
    var login = client.login();
    expect(login).to.be.rejectedWith('Invalid login');
    return login.catch(function () {}).then(function () {
      expect(client.logged).to.be.equals(false);
      mock.done();
    });
  });
});

describe('Combell::listDomains()', function () {
  it('Can successfully login with valid credentials', function () {
    this.timeout(10000);
    var mockLogin = nock('https://my.combell.com:443')
      .post('/fr', "loginform=1&login="+ credentials.valid[0] +"&pass="+ credentials.valid[1])
      .reply(200, {"state":"ok","result":{"some user removed for test": true},"message":"Actie succesvol verwerkt"}, { date: 'Tue, 08 Sep 2015 21:57:50 GMT',
      server: 'Apache',
      'set-cookie':
       [ 'PHPSESSID=9bb7r9i0u5k868kdah6e5r6dl1; path=/; secure; HttpOnly',
         'PHPSESSID=5vm91da5bdmg6qpbbm34bk9v96; path=/; secure; HttpOnly' ],
      expires: 'Thu, 19 Nov 1981 08:52:00 GMT',
      'cache-control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
      pragma: 'no-cache',
      'content-length': '975',
      connection: 'close',
      'content-type': 'application/json' });

    var mock = nock('https://my.combell.com:443')
      .get('/fr/product/dns/0///10000')
      .reply(200, fs.readFileSync(__dirname + '/fixtures/list-domains.html').toString(), { date: 'Tue, 08 Sep 2015 22:11:27 GMT',
      server: 'Apache',
      expires: 'Thu, 19 Nov 1981 08:52:00 GMT',
      'cache-control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
      pragma: 'no-cache',
      connection: 'close',
      'transfer-encoding': 'chunked',
      'content-type': 'text/html; charset=UTF-8' });

    var client = new Combell(credentials.valid[0], credentials.valid[1]);
    var listDomains = client.login().then(client.listDomains.bind(client, 0));

    return listDomains
      .then(function (domains) {
        expect(domains).be.an('array').and.be.deep.equals([
          {
            "id": "some_domain_com",
            "name": "some-domain.com"
          }
        ]);
        mockLogin.done();
        mock.done();
      });
  });
});

describe('Combell::listCNAME()', function () {
  it('Can successfully login with valid credentials', function () {
    this.timeout(10000);
    var mockLogin = nock('https://my.combell.com:443')
      .post('/fr', "loginform=1&login="+ credentials.valid[0] +"&pass="+ credentials.valid[1])
      .reply(200, {"state":"ok","result":{"some user removed for test": true},"message":"Actie succesvol verwerkt"}, { date: 'Tue, 08 Sep 2015 21:57:50 GMT',
      server: 'Apache',
      'set-cookie':
       [ 'PHPSESSID=9bb7r9i0u5k868kdah6e5r6dl1; path=/; secure; HttpOnly',
         'PHPSESSID=5vm91da5bdmg6qpbbm34bk9v96; path=/; secure; HttpOnly' ],
      expires: 'Thu, 19 Nov 1981 08:52:00 GMT',
      'cache-control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
      pragma: 'no-cache',
      'content-length': '975',
      connection: 'close',
      'content-type': 'application/json' });

    var mock = nock('https://my.combell.com:443')
      .get('/fr/product/dns/record/cname/igloo_be/1///1000')
      .reply(200, fs.readFileSync(__dirname + '/fixtures/list-cnames.html').toString(), { date: 'Tue, 08 Sep 2015 22:11:27 GMT',
      server: 'Apache',
      expires: 'Thu, 19 Nov 1981 08:52:00 GMT',
      'cache-control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
      pragma: 'no-cache',
      connection: 'close',
      'transfer-encoding': 'chunked',
      'content-type': 'text/html; charset=UTF-8' });

    var client = new Combell(credentials.valid[0], credentials.valid[1]);
    var listCNAME = client.login().then(client.listCNAME.bind(client, 'igloo_be'));

    return listCNAME
      .then(function (cnames) {
        expect(cnames).be.an('array').and.be.deep.equals([
          {
            "dest": "some-domain.com",
            "record": "*.some-domain.com",
            "ttl": 3600
          }
        ]);
        mockLogin.done();
        mock.done();
      });
  });
});
});
