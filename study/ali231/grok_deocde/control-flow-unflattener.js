const { types: t } = require('@babel/core');

function controlFlowUnflattenerPlugin(options = {}) {
  const { debug = false } = options;
  
  const log = (message, level = 'info') => {
    if (debug || level === 'error') {
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🔍';
      console.log(`${prefix} [CFF] ${message}`);
    }
  };

  return {
    name: 'control-flow-unflattener',
    visitor: {
      Program: {
        enter(path, state) {
          state.cffState = {
            jumpGraph: new Map(),
            startingL: null,
            visited: new Set(),
            processedLoops: 0,
            debug
          };
          log('插件初始化完成', 'info');
        },
        exit() {
          // 清理
        }
      },

      ForStatement: {
        enter(path, state) {
          const cffState = state.cffState;
          
          log(`检查 for 循环: ${path.node.init?.declarations?.[0]?.init?.value || 'unknown'}`, 'debug');
          
          // 1️⃣ 识别目标结构
          if (!isTargetForLoop(path, log)) {
            log('非目标 for 循环，跳过', 'debug');
            return;
          }

          log(`🎯 匹配成功！发现控制流平坦化结构 #${++cffState.processedLoops}`);
          const startTime = Date.now();

          try {
            // 2️⃣ 构建跳转图
            buildJumpGraph(path, cffState, log);
            
            if (cffState.jumpGraph.size === 0) {
              log('未找到有效的 case，跳过', 'warn');
              return;
            }

            log(`📊 构建跳转图: ${cffState.jumpGraph.size} 个状态`);

            // 3️⃣ 重构顺序代码
            const sequentialCode = reconstructSequentialCode(path, cffState, log);
            
            if (sequentialCode.length === 0) {
              log('生成的代码为空，跳过', 'warn');
              return;
            }

            // 4️⃣ 替换
            path.replaceWithMultiple(sequentialCode);
            
            const duration = Date.now() - startTime;
            log(`✅ 成功还原 #${cffState.processedLoops}！${cffState.jumpGraph.size} case，${duration}ms`);
            
          } catch (error) {
            log(`处理失败: ${error.message}`, 'error');
            log(error.stack, 'error');
          }
        }
      }
    }
  };
}

// 辅助函数
const isTargetForLoop = (path, log) => {
  const { init, test, update, body } = path.node;
  
  const initMatch = t.isVariableDeclaration(init) &&
    init.declarations.some(decl => 
      decl.id.name === 'l' && 
      t.isNumericLiteral(decl.init) && 
      decl.init.value === 3997696
    );
  
  const testMatch = t.isBinaryExpression(test, { 
    operator: '!==', 
    left: { name: 'l' }, 
    right: { value: void 0 } 
  });
  
  const bodyMatch = t.isSwitchStatement(body) &&
    body.discriminant.name === 'l' &&
    body.cases.length > 0;
  
  const match = initMatch && testMatch && bodyMatch && update === null;
  
  if (match) {
    log(`结构匹配成功: init=${initMatch}, test=${testMatch}, body=${bodyMatch}`, 'debug');
  }
  
  return match;
};

const buildJumpGraph = (path, state, log) => {
  state.jumpGraph.clear();
  state.startingL = 3997696;

  // 遍历所有 case
  path.get('body').traverse({
    SwitchCase: {
      enter(casePath) {
        const caseValue = casePath.node.test?.value;
        if (caseValue == null) {
          log('跳过 default case', 'debug');
          return;
        }

        log(`分析 case ${caseValue}`, 'debug');

        const caseInfo = {
          caseValue,
          nextTargets: new Set(),
          statements: casePath.node.consequent,
          comment: extractComment(casePath),
          hasBreak: hasBreakStatement(casePath.node.consequent)
        };

        // 分析 l 赋值
        analyzeLAssignments(casePath, caseInfo.nextTargets, log);

        // 使用注释中的 l 值作为索引
        const lValue = caseInfo.comment 
          ? parseLFromComment(caseInfo.comment) 
          : caseValue;

        if (lValue != null) {
          state.jumpGraph.set(lValue, caseInfo);
          log(`添加状态 ${lValue} -> case ${caseValue}，目标: ${Array.from(caseInfo.nextTargets).join(', ')}`, 'debug');
        } else {
          log(`case ${caseValue} 缺少有效 l 值，跳过`, 'warn');
        }
      }
    },
    noScope: true
  });
};

const extractComment = (casePath) => {
  const comments = casePath.node.leadingComments || [];
  for (const comment of comments) {
    const text = comment.value.trim();
    if (text.includes('case') && text.includes('l=')) {
      return text;
    }
  }
  return null;
};

const parseLFromComment = (comment) => {
  const match = comment.match(/l=(\d+)/);
  return match ? parseInt(match[1]) : null;
};

const analyzeLAssignments = (casePath, nextTargets, log) => {
  casePath.traverse({
    AssignmentExpression(path) {
      if (
        t.isIdentifier(path.node.left, { name: 'l' }) &&
        t.isNumericLiteral(path.node.right)
      ) {
        nextTargets.add(path.node.right.value);
        log(`发现 l 赋值: l = ${path.node.right.value}`, 'debug');
      }
    },
    IfStatement: {
      enter(ifPath) {
        log('分析 if-else 分支', 'debug');
        // 分析 if 分支
        analyzeBlockForLAssignments(
          ifPath.node.consequent.body || [ifPath.node.consequent], 
          nextTargets
        );
        // 分析 else 分支
        if (ifPath.node.alternate) {
          if (t.isBlockStatement(ifPath.node.alternate)) {
            analyzeBlockForLAssignments(ifPath.node.alternate.body, nextTargets);
          } else {
            analyzeBlockForLAssignments([ifPath.node.alternate], nextTargets);
          }
        }
      }
    },
    noScope: true
  });
};

const analyzeBlockForLAssignments = (block, nextTargets) => {
  block.forEach(stmt => {
    if (t.isExpressionStatement(stmt)) {
      const expr = stmt.expression;
      if (
        t.isAssignmentExpression(expr) &&
        t.isIdentifier(expr.left, { name: 'l' }) &&
        t.isNumericLiteral(expr.right)
      ) {
        nextTargets.add(expr.right.value);
      }
    }
  });
};

const hasBreakStatement = (statements) => {
  for (const stmt of statements) {
    if (t.isBreakStatement(stmt)) {
      return true;
    }
  }
  return false;
};

const reconstructSequentialCode = (path, state, log) => {
  const sequentialCode = [];
  const visited = new Set();
  let currentL = state.startingL;
  let step = 0;
  const maxSteps = 5000;

  log(`开始重构，从状态 ${currentL} 开始`);

  // 1️⃣ 添加 l 声明
  const lDecl = t.variableDeclaration('var', [
    t.variableDeclarator(t.identifier('l'), t.numericLiteral(state.startingL))
  ]);
  sequentialCode.push(lDecl);

  // 2️⃣ 按顺序执行 case
  while (currentL != null && !visited.has(currentL) && step < maxSteps) {
    visited.add(currentL);
    step++;

    const currentState = state.jumpGraph.get(currentL);
    if (!currentState) {
      log(`状态 ${currentL} 未找到`);
      break;
    }

    log(`处理状态 ${currentL} -> case ${currentState.caseValue}`);

    // 提取干净的语句
    const cleanStatements = extractCleanStatements(currentState.statements, log);
    sequentialCode.push(...cleanStatements);

    // 选择下一个状态
    currentL = selectNextState(currentState, log);
  }

  log(`重构完成：${step} 步，${sequentialCode.length} 条语句`);
  return sequentialCode;
};

const extractCleanStatements = (statements, log) => {
  const cleanStatements = [];
  
  statements.forEach((stmt, index) => {
    // 保留核心逻辑
    if (t.isExpressionStatement(stmt)) {
      const expr = stmt.expression;
      
      // 移除 l 赋值
      if (
        t.isAssignmentExpression(expr) &&
        t.isIdentifier(expr.left, { name: 'l' })
      ) {
        log(`移除 l 赋值语句 #${index}`, 'debug');
        return;
      }
      
      // 移除辅助变量声明
      if (
        t.isVariableDeclaration(expr) &&
        expr.declarations.some(decl => 
          ['d', 't', 'x', 'c', 'L'].includes(decl.id.name)
        )
      ) {
        log(`移除辅助变量声明 #${index}`, 'debug');
        return;
      }
    }
    
    cleanStatements.push(stmt);
  });
  
  return cleanStatements;
};

const selectNextState = (currentState, log) => {
  const targets = Array.from(currentState.nextTargets);
  if (targets.length === 0) {
    log('没有下一个目标，结束');
    return null;
  }
  
  const nextL = targets[0];
  log(`选择下一个状态: ${nextL}`);
  return nextL;
};

module.exports = () => controlFlowUnflattenerPlugin();