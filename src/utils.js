export function getQueryString(name) {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, "i");
  const r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

export const uid = {
  index: 0,
  get(prefix) {
    return prefix + Date.now() + this.index++;
  }
};

export function isWindow() {
  return navigator.platform.indexOf("Win");
}
