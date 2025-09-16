

## w生成的地方
```javascript
var_1 = '{"setLeft":171,"passtime":2062,"userresponse":171.9891312992074,"device_id":"","lot_number":"9ab16b9dd3514332a4f684397c058b7f","pow_msg":"1|0|md5|2025-08-29T20:29:49.693154+08:00|517df78b31ff1b8f841cd86fc0db9f3e|9ab16b9dd3514332a4f684397c058b7f||509f180e01d6901e","pow_sign":"44131f0f052639a3d36d11aebe8a19e7","geetest":"captcha","lang":"zh","ep":"123","biht":"1426265548","gee_guard":{"roe":{"aup":"3","sep":"3","egp":"3","auh":"3","rew":"3","snh":"3","res":"3","cdc":"3"}},"wP92":"eeHd","b16b9dd3":{"0564":"f684397c"},"em":{"ph":0,"cp":0,"ek":"11","wd":1,"nt":0,"si":0,"sc":0}}'



var_1 = (0, var_23["default"])(var_20["default"]["stringify"](var_1), var_7);//w生成的地方

//var_23["default"]:
var_3 = function (var_1, var_2) {
        var var_3 = var_0.$_CJ,
          var_4 = ["$_DABJT"].concat(var_3),
          var_5 = var_4[1];
        var_4.shift();
        var var_6 = var_4[0];
        if (!(var_7 = var_2["options"])["pt"] || "0" === var_7["pt"]) {
          return var_9["default"]["urlsafe_encode"](var_1);
        }
        var var_8 = (0, var_14["guid"])(),
          var_15 = new var_14["$_HN"](["1", "2"]),
          //symmetrical（对称）和asymmetric（非对称）
          var_2 = {
            1: {
              symmetrical: var_10["default"],
              asymmetric: new var_11["default"]()
            },
            2: {
              symmetrical: new var_12["default"]({
                key: var_8,
                mode: "cbc",
                iv: "0000000000000000"
              }),
              asymmetric: var_13["default"]
            }
          };
        if (var_15["$_CCR"](var_7["pt"])) {
          var i = "1" === var_7["pt"],
            var_7 = var_7["pt"],
            r = var_2[var_7]["asymmetric"]["encrypt"](var_8);
          while (i && (!r || 256 !== r["length"])) {
            var_8 = (0, var_14["guid"])();
            r = new var_11["default"]()["encrypt"](var_8);
          }
          var_1 = var_2[var_7]["symmetrical"]["encrypt"](var_1, var_8);
          return (0, var_14["arrayToHex"])(var_1) + r;
        }
      };



//滑块
////轨迹添加的地方
$_BGEj: function (var_1) {
          var var_2 = var_0.$_CJ,
            var_3 = ["$_FEJJt"].concat(var_2),
            var_4 = var_3[1];
          var_3.shift();
          var var_5 = var_3[0];
          var var_6 = this,
            var_7 = var_6["$"],
            var_9 = var_6["options"]["hash"];
          if ("init" !== var_6["$_BGDe"]) {
            return !1;
          }
          var_6["$_BFJA"] = (0, var_14["now"])();
          var_7(".subitem_" + var_9)["$_DCt"]("btn_move");
          var_6["$_BGDe"] = "move";
          var_6["$_BHFR"] = var_1["$_CGP"]();
          var_6["$_BHGC"]["$_HGI"]();
          var_6["$_BHHW"] = var_1["$_CHa"]();
          var var_8,
            var_10 = var_7(".bg_" + var_9)["$_EAn"](),
            var_9 = var_7(".btn_" + var_9)["$_EAn"](),
            var_10 = "geetest_btn" === var_1["$_CFb"]["$_CFb"]["className"] ? (var_8 = var_9["top"], var_9["left"]) : (var_8 = var_10["top"] + var_6["options"]["ypos"], var_10["left"]);
          var_6["$_BHII"] = new var_15["default"]([Math["round"]((var_10 - var_6["$_BHFR"]) / var_6["$_BHDe"]), Math["round"]((var_8 - var_6["$_BHHW"]) / var_6["$_BHDe"]), 0])["$_JEk"]([0, 0, 0]);
          var_6["$_JGB"] = var_6["$_BGAm"];
          var_6["$_BGJR"]["$_HGI"]();
          var_6["lastPoint"] = {
            x: 0,
            y: 0
          };
          return !0;
        },

//w生成所需参数的地方
 var var_8 = var_1["$_CGP"]() - var_6["$_BHFR"],//var_6["$_BHFR"]滑块刚开始点击的ClientX,var_1["$_CGP"]() 点击滑动结束时候 ClientX
var_10 = var_6["passtime"] = (0, var_14["now"])() - var_6["$_BFJA"];
var_6["$_BHGC"]["$_GEs"]();
var_1 = var_6["$_BHHW"] - var_1["$_CHa"]();
//var_6["$_BHII"] 这个是轨迹， var_6["$_BHDe"]是一个写死的值
var_6["$_BHII"]["$_JEk"]([Math["round"](var_8 / var_6["$_BHDe"]), Math["round"](var_1 / var_6["$_BHDe"]), var_6["passtime"]]);
var_8 = parseInt(var_8, 10);
var_7(".subitem_" + var_9)["$_DDt"]("btn_move");
var_8 = {
    setLeft: var_8,
    passtime: var_10,
    userresponse: var_8 / var_6["$_BHDe"] + 2
};


var_6["$_BHDe"] 这种修正系数往往来源于：

  像素与物理距离换算（比如 canvas 绘制时的缩放比，设备 DPR (devicePixelRatio) 影响）；

  采集轨迹数据时的缩放误差（前端采集时可能取的是 CSS 坐标，后端校验时用的是实际 canvas 坐标）。


//文字点选
//'{"x":804.09375,"y":322.71875,"width":301.8125,"height":201.296875,"top":322.71875,"right":1105.90625,"bottom":524.015625,"left":804.09375}'
var_15 = var_1["$_CFb"]["$_EAn"](), //背景框相对于视口 (viewport) 的位置和尺寸信息
var_12 = var_1["$_CGP"](), //鼠标点击的clientX
var_11 = var_1["$_CHa"](), //鼠标点击的clientY
var_12 = (var_12 - var_15["left"]) / var_15["width"] * 100, //x 落在背景框中的一个比例
var_15 = (var_11 - var_15["top"]) / var_15["height"] * 100, //y 落在背景框中的一个比例
var_6(".submit_" + var_7)["$_DDt"]("disable"), 
var_9["$_JEk"](new var_13["default"]("div")["$_DCt"]("square_mark")["$_DHc"]({ left: var_12 + "%", top: var_15 + "%" })["$_EJe"](var_1["$_CFb"])["$_FGO"]("click", function (var_1) { var var_2 = var_0.$_CJ, var_3 = ["$_FGHJW"].concat(var_2), var_4 = var_3[1]; var_3.shift(); var var_5 = var_3[0]; var_9["$_DFY"](var_1["$_CFb"]); if (var_9["$_JCe"]() <= 0) { var_6(".submit_" + var_7)["$_DCt"]("disable"); } var_1["$_CJY"](); }), Math["round"](100 * var_12), Math["round"](100 * var_15)); }


var_1 = {
              passtime: var_5["passtime"] = (0, var_14["now"])() - var_5["$_BFJA"],//验证的一个时间差
              userresponse: var_5["Marks"]["$_BEF"]()
            };
```