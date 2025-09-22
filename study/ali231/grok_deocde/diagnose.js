// diagnose.js - 精确分析你的 for 循环结构
const fs = require('fs');
const babel = require('@babel/core');
const path = require('path');

function diagnoseForLoopStructure(inputPath) {
  console.log('🔍 开始分析你的 for 循环 AST 结构...');
  
  const inputCode = fs.readFileSync(inputPath, 'utf8');
  
  try {
    // 解析为 AST
    const ast = babel.parse(inputCode, {
      sourceType: 'script',
      filename: inputPath
    });
    
    console.log('✅ AST 解析成功');
    
    // 查找所有 for 循环
    const forLoops = [];
    let targetLoop = null;
    
    babel.traverse(ast, {
      ForStatement(path) {
        const { init, test, update, body } = path.node;
        
        forLoops.push({
          init: init ? JSON.stringify(init, null, 2) : null,
          test: test ? JSON.stringify(test, null, 2) : null,
          update: update ? JSON.stringify(update, null, 2) : null,
          bodyType: body.type,
          bodyDiscriminant: body.discriminant ? body.discriminant.name : null,
          casesCount: body.cases ? body.cases.length : 0,
          pathIndex: forLoops.length
        });
        
        // 检查是否是目标循环
        if (init && init.declarations && init.declarations[0]?.init?.value === 3997696) {
          targetLoop = {
            ...forLoops[forLoops.length - 1],
            fullPath: path,
            comments: extractComments(path)
          };
        }
      }
    });
    
    console.log('\n📊 发现的 for 循环数量:', forLoops.length);
    
    if (targetLoop) {
      console.log('\n🎯 找到目标循环 (l = 3997696):');
      console.log('=== INIT (初始化) ===');
      console.log(targetLoop.init);
      console.log('=== TEST (条件) ===');
      console.log(targetLoop.test);
      console.log('=== UPDATE (更新) ===');
      console.log(targetLoop.update || 'null');
      console.log('=== BODY (循环体) ===');
      console.log(`类型: ${targetLoop.bodyType}`);
      console.log(`discriminant: ${targetLoop.bodyDiscriminant}`);
      console.log(`cases 数量: ${targetLoop.casesCount}`);
      
      console.log('\n=== 注释信息 ===');
      console.log(targetLoop.comments);
      
      // 检查第一个 case
      if (targetLoop.fullPath && targetLoop.fullPath.node.body.cases[0]) {
        console.log('\n=== 第一个 case 详情 ===');
        const firstCase = targetLoop.fullPath.node.body.cases[0];
        console.log('case 值:', firstCase.test?.value);
        console.log('leadingComments:', firstCase.leadingComments?.map(c => c.value) || []);
        console.log('consequent 语句数:', firstCase.consequent.length);
      }
      
    } else {
      console.log('\n❌ 未找到 l = 3997696 的循环');
      console.log('\n所有 for 循环的 init 值:');
      forLoops.forEach((loop, i) => {
        const initValue = loop.init ? JSON.parse(loop.init).declarations?.[0]?.init?.value : 'unknown';
        console.log(`  循环 #${i + 1}: init = ${initValue}`);
      });
    }
    
  } catch (error) {
    console.error('❌ AST 解析失败:', error.message);
  }
}

function extractComments(path) {
  const comments = [];
  
  // 检查整个 for 循环的注释
  if (path.node.leadingComments) {
    comments.push(...path.node.leadingComments.map(c => c.value.trim()));
  }
  
  // 检查 switch 语句的注释
  if (path.node.body.leadingComments) {
    comments.push(...path.node.body.leadingComments.map(c => c.value.trim()));
  }
  
  return comments;
}

if (require.main === module) {
  const inputFile = process.argv[2] || 'decode_fireyejs_ouput.js';
  diagnoseForLoopStructure(inputFile);
}