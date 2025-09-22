const fs = require('fs');
const babel = require('@babel/core');
const path = require('path');

function processObfuscatedCode(inputPath, outputPath) {
  console.log('🚀 开始处理 4 万行混淆代码...');

  try {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`输入文件不存在: ${inputPath}`);
    }

    const inputCode = fs.readFileSync(inputPath, 'utf8');
    console.log(`📄 原始代码大小: ${(inputCode.length / 1024).toFixed(2)} KB`);

    const startTime = Date.now();
    
    // 🔍 调试：直接使用插件，不依赖 babel.config.js
    const pluginPath = path.join(__dirname, 'control-flow-unflattener-nested.js');
    if (!fs.existsSync(pluginPath)) {
      throw new Error(`插件文件不存在: ${pluginPath}`);
    }

    console.log('🔍 加载插件...');
    const plugin = require(pluginPath)();
    console.log('✅ 插件加载成功:', plugin.name);

    const result = babel.transformSync(inputCode, {
      filename: path.basename(inputPath),
      compact: false,
      minified: false,
      retainLines: true,
      comments: true,
      sourceMaps: false,
      parserOpts: {
        sourceType: 'script',
        allowReturnOutsideFunction: true,
        plugins: []
      },
      plugins: [[plugin, { debug: true }]] // 🔍 直接使用插件
    });

    const outputCode = result.code;
    fs.writeFileSync(outputPath, outputCode, 'utf8');

    const duration = Date.now() - startTime;
    
    console.log(`✅ 处理完成！输出: ${outputPath}`);
    console.log(`📄 输出代码大小: ${(outputCode.length / 1024).toFixed(2)} KB`);
    console.log(`⏱️  处理耗时: ${duration}ms`);

    // 🔍 验证：检查是否还有 for-switch 结构
    const hasForLoop = outputCode.includes('for (var l = 3997696');
    const hasSwitchL = outputCode.includes('switch (l)');
    const hasVarD = outputCode.includes('var d = 255 & l');
    
    console.log('\n🔍 处理结果验证：');
    console.log(`❌ 原始 for 循环: ${hasForLoop ? '仍存在（插件未生效）' : '已移除（成功）'}`);
    console.log(`❌ switch(l): ${hasSwitchL ? '仍存在（插件未生效）' : '已移除（成功）'}`);
    console.log(`❌ var d: ${hasVarD ? '仍存在（插件未生效）' : '已移除（成功）'}`);
    
    // 显示前 20 行
    console.log('\n📄 输出前 20 行：');
    console.log(outputCode.split('\n').slice(0, 20).join('\n'));

  } catch (error) {
    console.error('❌ 处理失败:', error.message);
    console.error('错误详情:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  const inputFile = process.argv[2] || 'decode_fireyejs_ouput.js';
  const outputFile = process.argv[3] || 'unflattened.js';
  
  console.log(`📂 输入文件: ${inputFile}`);
  console.log(`📂 输出文件: ${outputFile}`);
  
  processObfuscatedCode(inputFile, outputFile);
}