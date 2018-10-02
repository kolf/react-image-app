export function fromURI(str, fn) {
  var img = new Image();
  if (/^http/g.test(str)) {
    img.crossOrigin = "anonymous";
  }
  img.onerror = fn;
  img.onload = function(e) {
    fn(null, img, str);
  };
  img.src = str;
}

export function loadImage(src, crossOrigin) {
  return new Promise(function(resolve, reject) {
    const img = new Image();
    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }
    img.onload = function() {
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function resizeImage(imageWidth, imageHeight, maxWidth, maxHeight) {
  const imageRadio = imageWidth / imageHeight; // 1/2

  if (imageRadio >= 1) {
    return {
      width: maxWidth,
      height: Number.parseInt(maxWidth / imageRadio)
    };
  }
  return {
    height: maxHeight,
    width: Number.parseInt(maxHeight * imageRadio)
  };
}

export function getOverlap(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
  if (ax2 < bx1 || ay2 < by1 || ax1 > bx2 || ay1 > by2) return [0, 0, 0, 0];

  const left = Math.max(ax1, bx1);
  const top = Math.max(ay1, by1);
  const right = Math.min(ax2, bx2);
  const bottom = Math.min(ay2, by2);
  return [left, top, right - left, bottom - top];
}

export function calculateRect(node, rectWidth, rectHeight) {
  const cr = node.getBoundingClientRect();
  const c_left = window.innerWidth / 2 - rectWidth / 2;
  const c_top = window.innerHeight / 2 - rectHeight / 2;
  const cover_rect = [c_left, c_top, rectWidth + c_left, rectHeight + c_top];
  const img_rect = [cr.left, cr.top, cr.width + cr.left, cr.height + cr.top];
  const intersect_rect = this.getOverlap(cover_rect.concat(img_rect));
  let left = (intersect_rect[0] - img_rect[0]) / node.scaleX;
  let top = (intersect_rect[1] - img_rect[1]) / node.scaleY;
  let width = intersect_rect[2] / node.scaleX;
  let height = intersect_rect[3] / node.scaleY;

  if (left < 0) left = 0;
  if (top < 0) top = 0;
  if (left + width > this.img_width) width = this.img_width - left;
  if (top + height > this.img_height) height = this.img_height - top;

  return { left, top, width, height };
}

export function stage2Image(stage, callback) {
  const url = stage.getStage().toDataURL("image/png", 1);
  callback(url);
}
