/**
 * download webdriver
 */

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var Download = require('download');
var targz = require('tar.gz');
var unzip = require('unzip');
var fse = require('fs-extra');
var debug = require('debug')('browser');

var chromeVersion = '2.20';
var phantomVersion = '1.9.8';
var basePath = 'http://npm.taobao.org/mirrors/';
var driversDest = path.resolve(__dirname, './driver');

/**
 * 下载对应平台的 driver
 */
function downloadDrivers() {

  var driversConfig = {
    darwin: [
      {name: 'phantomjs-darwin', url: 'phantomjs/phantomjs-' + phantomVersion + '-macosx.zip'},
      {name: 'chromedriver-darwin', url: 'chromedriver/' + chromeVersion + '/chromedriver_mac32.zip'}
    ],
    win32: [
      {name: 'chromedriver.exe', url: 'chromedriver/' + chromeVersion + '/chromedriver_win32.zip'},
      {name: 'phantomjs.exe', url: 'phantomjs/phantomjs-' + phantomVersion + '-windows.zip'}
    ],
    linux: [
      {name: 'phantomjs-linux', url: 'phantomjs/phantomjs-' + phantomVersion + '-linux-x86_64.tar.bz2'}
    ]
  };

  var driverConfig = driversConfig[process.platform];
  var count = 0;

  console.log('load: download webDrivers...');

  if (fs.existsSync(driversDest)) {
    rimraf.sync(driversDest);
  }
  fs.mkdirSync(driversDest);

  driverConfig.forEach(function(item) {

    var download = new Download({
      mode: '777'
      // 取不出 tar
      // extract: true
    });

    debug('download', item)

    download
      .get(basePath + item.url)
      // .rename(item.name)
      .dest(path.resolve(__dirname, './driver/'))
      .run(function(err, files) {

        if (err) {
          throw new Error('Download drivers error, please reinstall ' + err.message);
        }

        var downloadFilePath = files[0].path;
        var filename = path.basename(files[0].path);

        debug('下载完一个文件：', downloadFilePath, '开始压缩：');

        uncompressed(downloadFilePath, driversDest, function(err) {

          if (err) {
            throw err;
          }

          debug('压缩完一个文件');

          try {
            reworkDest(downloadFilePath, filename);
          } catch (err) {
            throw err;
          }

          debug('更改文件权限');
          fs.chmodSync(path.resolve(driversDest, './' + item.name), '777');

          count ++;

          if (count >= driverConfig.length) {
            console.log('Download drivers successfully.');
          }

        });
      });
  });
}


/**
 * 解压 zip 或者 tar
 */
function uncompressed(filePath, destDir, callback) {

  if (/\.zip$/.test(filePath)) {

    var rs = fs.createReadStream(filePath).pipe(unzip.Extract({
      path: destDir
    }));

    setTimeout(function() {
      callback(null);
    }, 5 * 1000);

    // rs.on('end', function() {
    //   debug('readStream end', filePath);
    //   callback(null);
    // });

  } else {
    // tar
    targz().extract(filePath, destDir, function(err) {

      if (err) {
        return callback(err);
      }
      callback(null);
    });
  }
}

/**
 * 解压之后对文件夹重新整理
 */
function reworkDest(uncompressedPath, filename) {

  var realName = filename.replace(/(\..[^\.]*)$/, '');
  var postfix = process.platform === 'win32' ? '.exe' : '-' + process.platform;

  // 清理下载的压缩文件
  fse.removeSync(uncompressedPath);

  // 把 phantomjs 移动出来
  if (/phantomjs/.test(filename)) {

    // 去除后缀
    var phantomDir = uncompressedPath.replace(/(\..[^\.]*)$/, '');

    debug('复制 bin/phantomjs: ', realName, phantomDir);
    fse.copySync(path.resolve(phantomDir, './bin/phantomjs'), path.resolve(driversDest, './phantomjs' + postfix));

    debug('移除 phantomjs 的文件夹');
    fse.removeSync(phantomDir);

  } else {
    fs.renameSync(path.resolve(driversDest, './chromedriver'), path.resolve(driversDest, './chromedriver' + postfix));
  }

}

downloadDrivers();