function a() {
  for (var l = 3997696; void 0 !== l;) {
    var d = 255 & l;
    var t = l >> 8;
    var x = 255 & t;
    var c = t >> 8;
    var L = 255 & c;

    switch (l) {
      case 4526592:
        l = ($i = (vi = $i) < 64) ? 7605760 : 4196096;
        break;
      case 4196096:
        ni = 64 * xi;
        _i = vi % 128;
        ii = [];
        Bi = _i + 128;
        Si = vi - _i;
        _i = Si / 128;
        Si = 63 & _i;
        _i = Si + ni;
        ii.push(Bi, _i);
        Ci = ii;
        l = 9374208;
        break;
    }
  }
}