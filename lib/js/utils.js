// convert RGB to Luminance
function rgbToLuma(color) {
  rgb = parseInt(color, 16);
  r = (rgb >> 16) & 0xff
  g = (rgb >>  8) & 0xff
  b = (rgb >>  0) & 0xff
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// return 'white' or 'black' base on luma
function textColorBaseOnLuma(color) {
  return rgbToLuma(color) < 128 ? 'white' : 'black';
}

function trimHtmlTags(str) {
  return str.replace(/<{1}[^<>]{1,}>{1}/g," ");
}

function ellipsisBy(str, length) {
  let strlen = str.length
  return length > strlen ? str : str.substring(0, length) + '...'
}

function IntervalTimer(callback, interval) {
  var timerId, startTime, remaining = 0;
  var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

  this.pause = function () {
    if (state != 1) return;

    remaining = interval - (new Date() - startTime);
    window.clearInterval(timerId);
    state = 2;
  };

  this.resume = function () {
    if (state != 2) return;

    state = 3;
    window.setTimeout(this.timeoutCallback, remaining);
  };

  this.timeoutCallback = function () {
    if (state != 3) return;

    callback();

    startTime = new Date();
    timerId = window.setInterval(callback, interval);
    state = 1;
  };

  this.clearInterval = function() {
    window.clearInterval(timerId);
    remaining = interval;
    startTime = new Date();
    state = 1;
  }

  startTime = new Date();
  timerId = window.setInterval(callback, interval);
  state = 1;
}
