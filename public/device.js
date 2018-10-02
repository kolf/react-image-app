(function(m, n) {
  var o = navigator.userAgent,
    p = /android|adr/gi.test(o),
    j = /iphone|ipod|ipad/gi.test(o) && !p;
  var k = n.documentElement;
  var l = function() {
      var a = k.getBoundingClientRect().width || 320;
      var b = (a / 320) * 20;
      b = b > 40 ? 40 : b;
      k.style.fontSize = b + "px";
      window.fontSize = b;
    },
    i;
  m.addEventListener(
    "resize",
    function() {
      clearTimeout(i);
      i = setTimeout(l, 100);
    },
    false
  );
  m.addEventListener(
    "pageshow",
    function(a) {
      if (a.persisted) {
        clearTimeout(i);
        i = setTimeout(l, 100);
      }
    },
    false
  );
  l();
})(window, document);
