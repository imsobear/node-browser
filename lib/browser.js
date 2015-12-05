/* eslint no-console:0 */
/**
 * browser
 *
 * Authors:
 *   大果 <liuxiong.lx@alibaba-inc.com>
 */

'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var exec = require('child_process').exec;
var Promise = require('bluebird');
var request = require('request');
var _ = require('lodash');
var debug = require('debug')('browser:browser');
var chalk = require('chalk');
var getPort = require('get-port');

var codes = require('./codes');

/**
 * Module exports
 */
module.exports = Browser;

function Browser(cfg) {

  this.cfg = cfg;
  this.name = cfg.name;
  this.port = cfg.port || Math.floor(Math.random() * (10000 - 1000) + 1000);
  // 执行 js 默认的等待时间
  this.timeout = cfg.timeout || 1 * 60 * 1000;
}

/**
 * 打开浏览器之前，获取端口号等
 */
Browser.prototype._prepare = function() {

  var self = this;
  var cfg = this.cfg;
  var getFreePort = cfg.port ? Promise.resolve(cfg.port) : getPort();

  return getFreePort.then(function(port) {
    self.port = port;
    self.hostname = '127.0.0.1';
    self.href = 'http://' + self.hostname + ':' + self.port;

    if (self.name === 'chrome') {
      self.options = ' --port=' + self.port;
      var cmds = {
        darwin: path.resolve(__dirname, '../driver/chromedriver-darwin'),
        win32: path.resolve(__dirname, '../driver/chromedriver.exe')
      };
    } else if (self.name === 'phantomjs') {
      self.options = ' --webdriver=' + self.port;
      var cmds = {
        darwin: path.resolve(__dirname, '../driver/phantomjs-darwin'),
        win32: path.resolve(__dirname, '../driver/phantomjs.exe'),
        linux: path.resolve(__dirname, '../driver/phantomjs-linux')
      };
    } else if (self.name === 'ie') {
      self.options = ' --port' + self.port;
      var cmds = {
        win32: path.resolve(__dirname, '../driver/IEDriverServer.exe')
      };
    } else if (self.name === 'firefox') {
      // 暂不支持
      self.options = ' --port=' + self.port;
      var cmds = {
        darwin: '/Applications/Firefox.app/Contents/MacOS/firefox-bin',
        win32: '%PROGRAMFILES%\Mozilla Firefox\firefox.exe',
        linux: 'fiefox'
      };

    } else {
      console.log(chalk.yellow('不支持 %s 浏览器', self.name));
    }

    self.cmd = cmds[process.platform];

    if (cfg.options) {
      self.options = self.options + ' ' + cfg.options;
    }
    return;
  });

};


/**
 * @private: Browser post method
 *
 * @param  {string}   path     request path
 * @param  {obj}      data     body data
 */
Browser.prototype._post = function(reqPath, data) {

  var self = this;

  debug(reqPath);

  var options = {
    url: self.href + reqPath,
    form: JSON.stringify(data),
    json: true,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(data), 'utf8')
    }
  };

  return new Promise(function(resolve, reject) {
    request.post(options, function(err, res, body) {
      if (err) {
        reject(err);
      } else {

        if (body.status == 0) {
          return resolve(body);
        } else {
          return reject(new Error(JSON.stringify(codes[body.status])));
        }
      }
    });
  });
};


/**
 * @private: create session
 */
Browser.prototype._getSessionId = function() {

  var self = this;
  var data = {};

  var desiredCapabilities = {
    browserName: self.name,
    version: '',
    platform: 'ANY',
    javascriptEnabled: true,
    acceptSslCerts: true,
    takesScreenshot: true
  };

  data.desiredCapabilities = _.defaults(self.cfg.desiredCapabilities || {}, desiredCapabilities);
  return self._post('/session', data);
};


/**
 * @private: open webdriver by shell
 */
Browser.prototype._create = function() {

  var self = this;

  var cmd = self.cmd;
  var options = self.options;
  var isCreated = false;

  debug('Open driver: ', cmd, options);

  return new Promise(function(resolve, reject) {

    function getSessionId() {
      self._getSessionId().then(function(data) {

        debug('get sessionId:', data);

        if (data.status != 0) {
          reject(new Error('创建 sessionId 出错：' + data.value.message));
        }

        resolve(data);
      }).catch(function(err) {
        reject(err);
      });
    }

    self.process = exec(cmd + options);
    var timer = setTimeout(function() {
      // 超时的情况，有可能是已经启动，则直接执行之
      console.error('启动 webdriver 超时，尝试请求');
      clearTimeout(timer);

      if (!isCreated) {
        getSessionId();
      }

    }, 6 * 1000);

    self.process.stderr.on('err', function(err) {
      console.error(chalk.red(err));
    });

    self.process.stdout.on('data', function(data) {
      debug('webdriver 启动日志：', data.toString());
      // 启动成功
      if (/on port/ig.test(data.toString())) {
        clearTimeout(timer);
        if (!isCreated) {
          getSessionId();
        }
      }
    });
  });
};

/**
 * open url with browser
 *
 * @param {string} url
 */
Browser.prototype.open = function(url) {

  var self = this;

  return self._prepare().then(function() {
    return self._create();
  }).then(function(data) {

    self.sessionId = data.sessionId;
    var data = {url: url};
    var reqPath = '/session/' + self.sessionId + '/url';

    return self._post(reqPath, data);
  });
};

/**
 * close webdriver
 */
Browser.prototype.close = function() {

  var self = this;
  var options = {
    url: self.href + '/session/' + self.sessionId,
    method: 'DELETE'
  };

  return new Promise(function(resolve, reject) {
    request(options, function(err, res, body) {
      self.process && self.process.kill();
      err ? reject(err) : resolve(body);
    });

  });
};

/**
 * @private: 设置执行 js 允许的等待时间
 */
Browser.prototype._setTimeout = function() {
  var reqPath = '/session/' + this.sessionId + '/timeouts/async_script';
  var data = {ms: this.timeout};
  return this._post(reqPath, data);
};


/**
 * 注入执行 js
 * @param  {string}   script  content
 */
Browser.prototype.injectJs = function(script) {

  var self = this;

  return self._setTimeout().then(function() {
    script = 'var endCallback = arguments[arguments.length - 1];' + script;
    var data = {script: script, args: []};
    var reqPath = '/session/' + self.sessionId + '/execute_async';
    return self._post(reqPath, data);
  });
};

/**
 * 自动登录
 *
 * @param  {string}   name     用户名
 * @param  {string}   pwd      密码
 */
Browser.prototype.login = function(name, pwd) {

  var self = this;
  // 参数需要双引号引起来
  var script = '(' + login.script.toString() + ')("' + name + '","' + pwd + '");';
  return self.injectJs(script);
};


/**
 * refresh page
 *
 * @param {string} url
 */
Browser.prototype.refresh = function() {
  var reqPath = '/session/' + this.sessionId + '/refresh';
  return this._post(reqPath, {});
};

/**
 * resize page
 *
 * @param {string} url
 */
Browser.prototype.resize = function(width, height) {

  var data = {width: width, height: height};
  var reqPath = '/session/' + this.sessionId + '/window/current/size';
  return this._post(reqPath, data);
};


/**
 * Take a screenshot of the current page.
 *
 * @return {string} The screenshot as a base64 encoded PNG
 */
Browser.prototype.screenshot = function() {
  var self = this;
  var url = self.href + '/session/' + this.sessionId + '/screenshot';

  return new Promise(function(resolve, reject) {
    request({
      uri: url,
      json: true
    }, function(err, res, body) {
      err ? reject(err) : resolve(body);
    });
  });
};
