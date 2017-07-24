var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('./bin/www');

var expect = chai.expect;

chai.use(chaiHttp);

describe('Portugol-Webstudio', function() {
  describe('#1', function() {
    it('Testando se / responde com 200', function(done) {
      chai.request(app)
        .get('/')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });
  });
  describe('#2', function() {
    it('Testando se IDE responde com 200', function(done) {
      chai.request(app)
        .get('/ide')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });
  });
});
