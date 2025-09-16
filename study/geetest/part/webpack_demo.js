// webpack 打包后的运行时代码（简化版）
(function (e) {
  // 模块缓存对象（存放已经加载过的模块，避免重复执行）
  var t = {};

  // 定义一个函数 d，用来模拟 require
  function d(n) {
    // 1️⃣ 如果模块已经在缓存中，直接返回缓存的 exports
    if (t[n]) return t[n].exports;

    // 2️⃣ 否则，创建一个新的模块对象，并放到缓存里
    var r = t[n] = {
      i: n,       // 模块 id（索引号）
      l: !1,      // 是否已经加载（loaded 标志位）
      exports: {} // 导出对象
    };

    // 3️⃣ 执行模块函数
    // e[n] 是模块定义（一个函数）
    // call 的 this 指向 r.exports
    // 参数分别是：module, exports, require
    e[n].call(r.exports, r, r.exports, d);

    // 4️⃣ 标记该模块已经加载完成
    r.l = !0;

    // 5️⃣ 返回该模块的导出对象
    return r.exports;
  }

  // ⏩ 从入口模块开始执行（这里是模块 1）
  d(1);

})([
  // e[0] 模块函数
  function (module, exports, require) {
    console.log("我是模块1");
  },

  // e[1] 模块函数（入口）
  function (module, exports, require) {
    console.log("我是模块2");
  }
]);



// a.js
console.log("初始化 exports === module.exports ?", exports === module.exports);

exports.foo = 123;
module.exports.bar = 456;

console.log("exports:", exports);
console.log("module.exports:", module.exports);

// 改变 module.exports
module.exports = { baz: 789 };

console.log("修改后 exports:", exports);
console.log("修改后 module.exports:", module.exports);
