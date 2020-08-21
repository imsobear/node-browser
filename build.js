/**
 * download webdriver
 */

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var Download = require('download');
var Decompress = require('decompress');
var fse = require('fs-extra');
var debug = require('debug')('browser');

var chromeVersion = '2.20';
var phantomVersion = '1.9.7';
var basePath = 'https://npm.taobao.org/mirrors/';
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

    debug('download', item);

    download
      .get(basePath + item.url)
      // .rename(item.name)
      .dest(path.resolve(__dirname, './driver/'))
      .run(function(err, files) {

        if (err) {
          throw new Error('Download drivers error, please reinstall ' + err.message);
        }

        var downloadFilePath = files[0].path;
        var compressDir = path.resolve(driversDest, './' + item.name + '-dir');
        debug('下载完一个文件：', downloadFilePath, '开始压缩：');

        new Decompress({mode: '777'})
          .src(downloadFilePath)
          .dest(compressDir)
          .use(Decompress.zip({strip: 1}))
          .run(function(err) {

            if (err) {
              throw err;
            }

            debug('压缩完一个文件');

            var type = /phantom/.test(item.name) ? 'phantomjs' : 'chromedriver';
            reworkDest(downloadFilePath, compressDir, type);

            debug('更改文件权限');
            fs.chmodSync(path.resolve(driversDest, item.name), '777');

            count ++;
            if (count >= driverConfig.length) {
              console.log('Download drivers successfully.');
            }

          });
      });
  });
}

/**
 * 解压之后对文件夹重新整理
 */
function reworkDest(downloadFilePath, compressDir, type) {

  // 清理下载的压缩文件
  fse.removeSync(downloadFilePath);

  var binName = type + (process.platform === 'win32' ? '.exe' : '-' + process.platform);
  var binSrcPath = path.resolve(compressDir, type === 'phantomjs' ? './bin/phantomjs' : './chromedriver');
  var binDestPath = path.resolve(driversDest, binName);

  debug('复制 bin 文件：', binSrcPath, binDestPath);
  fse.copySync(binSrcPath, binDestPath);

  debug('移除源的文件夹');
  fse.removeSync(compressDir);

}

downloadDrivers();