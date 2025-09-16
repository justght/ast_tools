function randomWeirdName(length = 6) {
    // 挑选一些生僻的 Unicode 范围
    const ranges = [
        // [0x10A0, 0x10FF], // 格鲁吉亚字母
        // [0x13A0, 0x13FF], // 切罗基字母
        // [0x1400, 0x167F], // 加拿大原住民音节
        // [0x16A0, 0x16FF], // 古北欧文字
        // [0x1800, 0x18AF],  // 蒙古文
        [0x4E00, 0x9FFF],   // 基本汉字 (20992个) - 几乎所有常用汉字
        // [0x3400, 0x4DBF],   // 扩展A - 较生僻的汉字
        // [0x20000, 0x2A6DF], // 扩展B - 稀有汉字
        // [0x2A700, 0x2B73F], // 扩展C - 极少使用
        // [0x2B740, 0x2B81F], // 扩展D - 极少使用
        // [0x2B820, 0x2CEAF], // 扩展E - 极少使用
        // [0x2CEB0, 0x2EBEF], // 扩展F - 极少使用
        // [0x30000, 0x3134F], // 扩展G - Unicode 13 新增的极少使用汉字
    ];

    function randomChar() {
    // 从 ranges 数组里随机挑一个区间
    const range = ranges[Math.floor(Math.random() * ranges.length)];

    // 在这个区间内，随机生成一个 code（整数，表示字符的 Unicode 编码点）
    const code = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];

    // 把这个 Unicode 编码转成实际的字符
    return String.fromCharCode(code);
}

    // 变量名前加下划线（模仿常见混淆风格）
    return "_" + Array.from({ length }, randomChar).join("");
}

// 测试
for (let i = 0; i < 5; i++) {
    console.log(randomWeirdName());
}
