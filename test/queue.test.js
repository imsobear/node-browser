require('should');
var Browser = require('../');

describe('queue', function() {

  var COUNT = 4;
  var browsers = [];

  after(function(done) {
    var count = 0;
    browsers.forEach(function(browser) {
      browser.close().then(function() {
        count ++;
        if (count === COUNT) {
          done();
        }
      });
    });
  });

  it('test queue', function(done) {

    var count = 0;

    for (var i = COUNT; i > 0; i--) {

      var browser = new Browser({
        name: 'phantomjs',
        // 执行 js 允许等待的毫秒数
        timeout: 5 * 1000
      });

      browsers.push(browser);

      browser.open('http://baidu.com').then(function(data) {
        data.status.should.equal(0);
        return browser.resize(100, 100);
      }).then(function(data) {
        count ++;
        data.status.should.equal(0);
        if (count === COUNT) {
          done();
        }
      });
    }
  });

});
