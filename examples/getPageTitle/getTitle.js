var Browser = require('../../');

var browser = new Browser({
  name: 'chrome'
});


browser.open('http://taobao.com').then(function() {

  var getTitle = function() {
    // 浏览器内部执行
    var title = document.title;
    endCallback(title);
  };

  return browser.injectJs('(' + getTitle.toString() + ')();');

}).then(function(data) {
  console.log(data.value);
  return browser.close();
});
