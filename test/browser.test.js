require('should');
var fs = require('fs');

var Browser = require('../');

var browserName = 'chrome';

if (process.platform === 'linux') {
  browserName = 'phantomjs';
} else if (process.platform === 'win32') {
  browserName = 'ie';
} else {
  browserName = 'chrome';
}

var browser = new Browser({

  name: process.env.BROWSER || browserName,

  // port: 7054,

  // 执行 js 允许等待的毫秒数
  timeout: 5 * 1000,

  // 启动 driver 的参数
  options: '',

  // webdriver 配置
  desiredCapabilities: {
    chromeOptions: {
      args: ['--test-type']
    },

    // pac 方式
    // proxy: {
    // 	proxyType: 'pac',
    // 	proxyAutoconfigUrl: 'http://127.0.0.1/work/uitest/browserjs/static/proxy.pac'
    // }


    // proxy: {
    // 	proxyType: 'manual',
    // 	httpProxy: '127.0.0.1 g.tbcdn.cn'
    // }


  },

  // error, debug. info, warn
  logLevel: 'debug'

});

describe('lib/browser', function() {

  var url = 'http://baidu.com';

  after(function(done) {
    browser.close().then(function(data) {
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  // open browser
  it('browser.open', function(done) {
    browser.open(url).then(function(data) {
      console.log(data);
      data.status.should.equal(0);
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('browser.resize', function(done) {
    browser.resize(1000, 1000).then(function(data) {
      data.status.should.equal(0);
      done();
    }).catch(function(err) {
      done(err);
    });
  });


  it('browser.refresh', function(done) {
    browser.refresh().then(function(data) {
      data.status.should.equal(0);
      done();
    }).catch(function(err) {
      done(err);
    });
  });


  it('browser.inject', function(done) {

    var asyncFun = function() {
      setTimeout(function() {
        endCallback(200)
      }, 3 * 1000);
    };

    browser.injectJs('(' + asyncFun.toString() + ')();').then(function(data) {
      console.log(data);
      data.status.should.equal(0);
      data.value.should.equal(200);
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  // it('browser.login', function(done) {

  // 	browser.login('', '').then(function (data) {
  // 		// data.status.should.equal(1);
  // 		done();
  // 	}).catch(function (err) {
  // 		done(err);
  // 	});
  // });

  it('browser.screenshot', function(done) {

    browser.screenshot().then(function(data) {

      data.status.should.equal(0);

      var base64Data = data.value.replace(/^data:image\/png;base64,/, '');

      fs.writeFile('screenshot.png', base64Data, 'base64', function(err) {
        done();
      });
    }).catch(function(err) {
      done(err);
    });

  });
});
