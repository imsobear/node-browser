# node-browser [![Build Status](https://travis-ci.org/imsobear/node-browser.svg?branch=master)](https://travis-ci.org/imsobear/node-browser) [![Coverage Status](https://coveralls.io/repos/imsobear/node-browser/badge.svg?branch=master)](https://coveralls.io/r/imsobear/node-browser?branch=master)


> wrap webdriver by nodejs promise API, support chrome and phantomjs.

## Usage:

```
tnpm i node-browser --save

var Browser = require('@ali/browser');
var browser = new Browser(option);
```

## option:

- `option.name`: default chrome, values: chrome, phantomjs
- ... // TODO

## Example:

```
// get taobao.com page title
var Browser = require('../../');

var browser = new Browser({
  name: 'chrome'
});

browser.open('http://taobao.com').then(function () {

  var getTitle = function () {
    var title = document.title;
    endCallback(title);
  };
  return browser.injectJs('(' + getTitle.toString() + ')();');
}).then(function (data) {
  console.log(data.value);
  return browser.close();
});
```

![](//gtms01.alicdn.com/tps/i1/TB1oGUgGFXXXXaVaXXXuYiFYVXX-600-46.png)

## API:

#### browser.open(url).then();

open a url

#### browser.close().then();

close browser

#### browser.injectJs(script).then();

inject some javascript

#### browser.refresh().then();

refresh the page

#### browser.resize(width, height).then();

resize

#### browser.screenshot().then();

screenshot，return {string} The screenshot as a base64 encoded PNG.

## Test:

```
npm run test
```

## License

MIT &copy; 2015 sobear