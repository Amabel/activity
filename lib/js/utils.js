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
