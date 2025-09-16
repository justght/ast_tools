function var_12(var_1, var_2) {
  var var_3 = 6;
  for (; var_3 !== 4;) {
    switch (var_3) {
      case 6:
        var s = [],
          n = var_2;
        var_1 = var_1["slice"]();
        var_3 = 5;
        break;
      case 5:
        for (var i = 0; i < var_1["length"]; i++) {
          var o = i + 1 > var_1["length"] - 1 ? (i + 1) % var_1["length"] : i + 1,
            r = i + 2 > var_1["length"] - 1 ? (i + 2) % var_1["length"] : i + 2,
            a = var_1[i],
            _ = var_1[o],
            o = var_1[r];
          if (2 <= i) break;
          r = Math["sqrt"](Math["pow"](a["x"] - _["x"], 2) + Math["pow"](a["y"] - _["y"], 2)), r = (r - n) / r, a = [((1 - r) * a["x"] + r * _["x"])["toFixed"](1), ((1 - r) * a["y"] + r * _["y"])["toFixed"](1)], r = n / Math["sqrt"](Math["pow"](_["x"] - o["x"], 2) + Math["pow"](_["y"] - o["y"], 2)), o = [((1 - r) * _["x"] + r * o["x"])["toFixed"](1), ((1 - r) * _["y"] + r * o["y"])["toFixed"](1)];
          i === var_1["length"] - 1 && s["unshift"]("M" + o["join"](",")), s["push"]("L" + a["join"](",")), s["push"]("Q" + _["x"] + "," + _["y"] + "," + o["join"](","));
        }
        return s["unshift"]("M" + var_1[0]["x"] + "," + var_1[0]["y"]), s["push"]("L" + var_1[3]["x"] + "," + var_1[3]["y"]), s["join"](" ");
        break;
    }
  }
}
function l() {
  var var_1 = 6;
  for (; var_1 !== 5;) {
    switch (var_1) {
      case 6:
        return (65536 * (1 + Math["random"]()) | 0)["toString"](16)["substring"](1);
        break;
    }
  }
}