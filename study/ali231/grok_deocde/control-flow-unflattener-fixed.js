const { types: t } = require('@babel/core');

function controlFlowUnflattenerPlugin(options = {}) {
  const { debug = true } = options;
  
  const log = (message, level = 'info') => {
    if (debug) {
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🔍';
      console.log(`${prefix} [CFF] ${message}`);
    }
  };

  return {
    name: 'control-flow-unflattener-fixed',
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
        }
      },

      ForStatement: {
        enter(path, state) {
          const cffState = state.cffState;
          
          // 1️⃣ 多重匹配策略
          const matchResult = matchForLoopStructure(path, log);
          if (!matchResult.isMatch) {
            log(`非目标结构，跳过: ${matchResult.reason}`, 'debug');
            return;
          }

          log(`🎯 匹配成功！发现控制流平坦化结构 #${++cffState.processedLoops}`);
          log(`匹配详情: ${JSON.stringify(matchResult.details)}`, 'debug');
          
          const startTime = Date.now();

          try {
            // 2️⃣ 构建跳转图
            buildJumpGraphFixed(path, cffState, log);
            
            if (cffState.jumpGraph.size === 0) {
              log('未找到有效的 case，跳过', 'warn');
              return;
            }

            // 3️⃣ 重构顺序代码
            const sequentialCode = reconstructSequentialCodeFixed(path, cffState, log);
            
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
          }
        }
      }
    }
  };
}

// 多重匹配策略
const matchForLoopStructure = (path, log) => {
  const { init, test, update, body } = path.node;
  const details = {};
  
  // 检查 init
  details.hasLInit = false;
  details.initValue = null;
  if (t.isVariableDeclaration(init)) {
    const lDecl = init.declarations.find(decl => decl.id.name === 'l');
    if (lDecl && t.isNumericLiteral(lDecl.init)) {
      details.hasLInit = true;
      details.initValue = lDecl.init.value;
    }
  }
  
  // 检查 test
  details.hasLTest = false;
  details.testOperator = null;
  if (t.isBinaryExpression(test)) {
    details.hasLTest = test.left?.name === 'l';
    details.testOperator = test.operator;
    details.testRightValue = test.right?.value;
    details.testRightType = test.right?.type;
  }
  
  // 检查 body
  details.hasSwitchL = false;
  details.casesCount = 0;
  if (t.isSwitchStatement(body)) {
    details.hasSwitchL = body.discriminant?.name === 'l';
    details.casesCount = body.cases?.length || 0;
  }
  
  details.updateIsNull = update === null;
  
  // 匹配条件（放宽要求）
  const isMatch = 
    details.hasLInit && 
    details.initValue === 3997696 &&
    details.hasLTest &&
    details.testOperator === '!==' &&
    (details.testRightValue === undefined || details.testRightType === 'Identifier') && // void 0 或其他
    details.hasSwitchL &&
    details.casesCount > 0 &&
    details.updateIsNull;
  
  log(`匹配检查: initL=${details.hasLInit}(${details.initValue}), testL=${details.hasLTest}(${details.testOperator}), switchL=${details.hasSwitchL}, cases=${details.casesCount}, updateNull=${details.updateIsNull}`, 'debug');
  
  return {
    isMatch,
    reason: !isMatch ? `initL=${details.hasLInit}, testL=${details.hasLTest}, switchL=${details.hasSwitchL}, cases=${details.casesCount}` : '',
    details
  };
};

const buildJumpGraphFixed = (path, state, log) => {
  state.jumpGraph.clear();
  state.startingL = 3997696;

  // 更宽松的 case 分析
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

        // 分析所有可能的 l 赋值
        analyzeAllLAssignments(casePath, caseInfo.nextTargets, log);

        // 尝试多种索引方式
        const lValues = getPossibleLValues(caseInfo, caseValue);
        
        lValues.forEach(lValue => {
          if (lValue != null) {
            state.jumpGraph.set(lValue, caseInfo);
            log(`添加状态 ${lValue} -> case ${caseValue}`, 'debug');
          }
        });
      }
    },
    noScope: true
  });
  
  log(`📊 构建跳转图完成: ${state.jumpGraph.size} 个状态`);
};

const getPossibleLValues = (caseInfo, caseValue) => {
  const lValues = [];
  
  // 1. 从注释获取
  if (caseInfo.comment) {
    const commentL = parseLFromComment(caseInfo.comment);
    if (commentL) lValues.push(commentL);
  }
  
  // 2. 使用 caseValue 作为备选
  lValues.push(caseValue);
  
  // 3. 从 nextTargets 中选择一个作为索引
  if (caseInfo.nextTargets.size > 0) {
    lValues.push(...Array.from(caseInfo.nextTargets).slice(0, 1));
  }
  
  return lValues;
};

const analyzeAllLAssignments = (casePath, nextTargets, log) => {
  casePath.traverse({
    AssignmentExpression(path) {
      if (
        t.isIdentifier(path.node.left, { name: 'l' }) &&
        t.isNumericLiteral(path.node.right)
      ) {
        nextTargets.add(path.node.right.value);
        log(`发现直接 l 赋值: l = ${path.node.right.value}`, 'debug');
      }
    },
    
    // 处理 if-else 中的 l 赋值
    IfStatement: {
      enter(ifPath) {
        log('发现 if-else，分析分支', 'debug');
        analyzeBlockForLAssignments(ifPath.node.consequent, nextTargets);
        if (ifPath.node.alternate) {
          if (t.isBlockStatement(ifPath.node.alternate)) {
            analyzeBlockForLAssignments(ifPath.node.alternate.body, nextTargets);
          } else {
            analyzeBlockForLAssignments([ifPath.node.alternate], nextTargets);
          }
        }
      }
    },
    
    // 处理三元运算符
    ConditionalExpression(path) {
      if (t.isNumericLiteral(path.node.consequent)) {
        nextTargets.add(path.node.consequent.value);
      }
      if (t.isNumericLiteral(path.node.alternate)) {
        nextTargets.add(path.node.alternate.value);
      }
    },
    
    noScope: true
  });
};

const analyzeBlockForLAssignments = (block, nextTargets) => {
  if (!Array.isArray(block)) {
    block = [block];
  }
  
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

const extractComment = (casePath) => {
  const comments = casePath.node.leadingComments || [];
  for (const comment of comments) {
    const text = comment.value.trim();
    if (text.includes('case')) {
      return text;
    }
  }
  return null;
};

const parseLFromComment = (comment) => {
  const match = comment.match(/l=(\d+)/);
  return match ? parseInt(match[1]) : null;
};

const hasBreakStatement = (statements) => {
  for (const stmt of statements) {
    if (t.isBreakStatement(stmt)) {
      return true;
    }
  }
  return false;
};

const reconstructSequentialCodeFixed = (path, state, log) => {
  const sequentialCode = [];
  const visited = new Set();
  let currentL = state.startingL;
  let step = 0;
  const maxSteps = 5000;

  log(`开始重构，从状态 ${currentL} 开始`);

  // 1️⃣ 添加 l 声明（可选保留）
  // sequentialCode.push(createLDeclaration(state.startingL));

  // 2️⃣ 按顺序执行 case
  while (currentL != null && !visited.has(currentL) && step < maxSteps) {
    visited.add(currentL);
    step++;

    const currentState = state.jumpGraph.get(currentL);
    if (!currentState) {
      log(`状态 ${currentL} 未找到`);
      break;
    }

    log(`处理状态 ${currentL} -> case ${currentState.caseValue} (${step}/${maxSteps})`);

    // 提取干净的语句
    const cleanStatements = extractCleanStatementsFixed(currentState.statements, log);
    sequentialCode.push(...cleanStatements);

    // 选择下一个状态
    currentL = selectNextStateFixed(currentState, log);
  }

  log(`重构完成：${step} 步，${sequentialCode.length} 条语句，访问 ${visited.size} 个状态`);
  return sequentialCode;
};

const createLDeclaration = (value) => {
  return t.variableDeclaration('var', [
    t.variableDeclarator(t.identifier('l'), t.numericLiteral(value))
  ]);
};

const extractCleanStatementsFixed = (statements, log) => {
  const cleanStatements = [];
  
  statements.forEach((stmt, index) => {
    let keepStatement = true;
    
    // 移除 l 赋值
    if (t.isExpressionStatement(stmt)) {
      const expr = stmt.expression;
      if (
        t.isAssignmentExpression(expr) &&
        t.isIdentifier(expr.left, { name: 'l' })
      ) {
        log(`移除 l 赋值 #${index}`, 'debug');
        keepStatement = false;
      }
    }
    
    // 移除辅助变量声明
    if (t.isVariableDeclaration(stmt)) {
      const isAuxVar = stmt.declarations.some(decl => 
        ['d', 't', 'x', 'c', 'L'].includes(decl.id.name)
      );
      if (isAuxVar) {
        log(`移除辅助变量声明 #${index}`, 'debug');
        keepStatement = false;
      }
    }
    
    if (keepStatement) {
      cleanStatements.push(stmt);
    }
  });
  
  return cleanStatements;
};

const selectNextStateFixed = (currentState, log) => {
  const targets = Array.from(currentState.nextTargets);
  if (targets.length === 0) {
    log('没有下一个目标，结束');
    return null;
  }
  
  // 策略：选择最小的目标值（假设是顺序执行）
  const nextL = Math.min(...targets);
  log(`选择下一个状态: ${nextL} (从 ${targets.join(', ')})`);
  return nextL;
};

module.exports = () => controlFlowUnflattenerPlugin();