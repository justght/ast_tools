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
    name: 'control-flow-unflattener-nested',
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
          
          // 1️⃣ 新增：支持嵌套 switch 的匹配
          const matchResult = matchForLoopStructureNested(path, log);
          if (!matchResult.isMatch) {
            log(`非目标结构，跳过: ${matchResult.reason}`, 'debug');
            return;
          }

          log(`🎯 匹配成功！发现嵌套控制流平坦化结构 #${++cffState.processedLoops}`);
          log(`匹配详情: ${JSON.stringify(matchResult.details)}`, 'debug');
          
          const startTime = Date.now();

          try {
            // 2️⃣ 构建跳转图（从嵌套 switch 中提取）
            buildJumpGraphNested(path, cffState, log);
            
            if (cffState.jumpGraph.size === 0) {
              log('未找到有效的 case，跳过', 'warn');
              return;
            }

            // 3️⃣ 重构顺序代码
            const sequentialCode = reconstructSequentialCodeNested(path, cffState, log);
            
            if (sequentialCode.length === 0) {
              log('生成的代码为空，跳过', 'warn');
              return;
            }

            // 4️⃣ 替换整个 for 循环
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

// 🔥 新增：支持嵌套结构的匹配
const matchForLoopStructureNested = (path, log) => {
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
  
  // 🔥 新增：检查嵌套 switch
  details.hasNestedSwitchL = false;
  details.nestedSwitchCases = 0;
  details.switchDepth = 0;
  
  if (t.isBlockStatement(body)) {
    // 循环体是 BlockStatement，查找嵌套的 switch
    let foundSwitch = false;
    let depth = 0;
    
    const findSwitch = (node) => {
      depth++;
      if (t.isSwitchStatement(node)) {
        if (node.discriminant?.name === 'l') {
          details.hasNestedSwitchL = true;
          details.nestedSwitchCases = node.cases?.length || 0;
          details.switchDepth = depth;
          foundSwitch = true;
        }
      } else if (node.body) {
        // 递归查找
        if (Array.isArray(node.body)) {
          for (const child of node.body) {
            if (foundSwitch) break;
            findSwitch(child);
          }
        } else {
          findSwitch(node.body);
        }
      }
      depth--;
    };
    
    findSwitch(body);
  } else if (t.isSwitchStatement(body)) {
    // 直接的 switch（向后兼容）
    details.hasNestedSwitchL = body.discriminant?.name === 'l';
    details.nestedSwitchCases = body.cases?.length || 0;
    details.switchDepth = 1;
  }
  
  details.updateIsNull = update === null;
  
  // 🔥 放宽匹配条件：只要有 l 初始化 + l 测试 + 嵌套 switch(l)
  const isMatch = 
    details.hasLInit && 
    details.initValue === 3997696 &&
    details.hasLTest &&
    details.hasNestedSwitchL &&
    details.nestedSwitchCases > 0 &&
    details.updateIsNull;
  
  log(`嵌套匹配检查: initL=${details.hasLInit}(${details.initValue}), testL=${details.hasLTest}, nestedSwitchL=${details.hasNestedSwitchL}, cases=${details.nestedSwitchCases}, depth=${details.switchDepth}`, 'debug');
  
  return {
    isMatch,
    reason: !isMatch ? `initL=${details.hasLInit}, testL=${details.hasLTest}, nestedSwitchL=${details.hasNestedSwitchL}, cases=${details.nestedSwitchCases}` : '',
    details
  };
};

// 🔥 新增：从嵌套结构中构建跳转图
const buildJumpGraphNested = (path, state, log) => {
  state.jumpGraph.clear();
  state.startingL = 3997696;

  // 查找嵌套的 switch 语句
  const switchStatement = findNestedSwitch(path.node.body, log);
  if (!switchStatement) {
    log('未找到嵌套的 switch 语句', 'error');
    return;
  }

  log(`✅ 找到嵌套 switch，包含 ${switchStatement.cases.length} 个 case`);

  // 分析每个 case
  switchStatement.cases.forEach((caseNode, index) => {
    const caseValue = caseNode.test?.value;
    if (caseValue == null) {
      log(`跳过 default case #${index}`, 'debug');
      return;
    }

    log(`分析嵌套 case ${caseValue} #${index}`, 'debug');

    const caseInfo = {
      caseValue,
      nextTargets: new Set(),
      statements: caseNode.consequent,
      comment: extractCommentFromCase(caseNode),
      hasBreak: hasBreakStatement(caseNode.consequent),
      caseIndex: index
    };

    // 分析 l 赋值
    analyzeAllLAssignments(caseNode, caseInfo.nextTargets, log);

    // 使用注释或 caseValue 作为索引
    const lValues = getPossibleLValues(caseInfo, caseValue);
    
    lValues.forEach(lValue => {
      if (lValue != null && !state.jumpGraph.has(lValue)) {
        state.jumpGraph.set(lValue, caseInfo);
        log(`添加状态 ${lValue} -> case ${caseValue} #${index}`, 'debug');
      }
    });
  });
  
  log(`📊 嵌套跳转图构建完成: ${state.jumpGraph.size} 个状态`);
};

// 🔥 新增：递归查找嵌套 switch
const findNestedSwitch = (node, log, depth = 0) => {
  if (depth > 10) { // 防止无限递归
    log(`深度 ${depth} 过深，停止查找`, 'warn');
    return null;
  }
  
  if (t.isSwitchStatement(node)) {
    if (node.discriminant?.name === 'l') {
      log(`在深度 ${depth} 找到 switch(l)`);
      return node;
    }
  }
  
  if (node.body) {
    if (Array.isArray(node.body)) {
      for (const child of node.body) {
        const found = findNestedSwitch(child, log, depth + 1);
        if (found) return found;
      }
    } else {
      return findNestedSwitch(node.body, log, depth + 1);
    }
  }
  
  return null;
};

// 🔥 新增：从 case 节点提取注释
const extractCommentFromCase = (caseNode) => {
  // 检查 case 自身的注释
  if (caseNode.leadingComments) {
    for (const comment of caseNode.leadingComments) {
      const text = comment.value.trim();
      if (text.includes('case') && text.includes('l=')) {
        return text;
      }
    }
  }
  
  // 检查 case 内第一个语句的注释
  if (caseNode.consequent.length > 0) {
    const firstStmt = caseNode.consequent[0];
    if (firstStmt.leadingComments) {
      for (const comment of firstStmt.leadingComments) {
        const text = comment.value.trim();
        if (text.includes('case') && text.includes('l=')) {
          return text;
        }
      }
    }
  }
  
  return null;
};

// 保留原有的分析函数
const analyzeAllLAssignments = (caseNode, nextTargets, log) => {
  // 创建临时 path 对象进行遍历
  const tempPath = {
    node: caseNode,
    traverse: (visitor) => {
      traverseNode(caseNode, visitor, log);
    }
  };
  
  tempPath.traverse({
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
        analyzeBlockForLAssignments(ifPath.node.consequent, nextTargets);
        if (ifPath.node.alternate) {
          if (t.isBlockStatement(ifPath.node.alternate)) {
            analyzeBlockForLAssignments(ifPath.node.alternate.body, nextTargets);
          } else {
            analyzeBlockForLAssignments([ifPath.node.alternate], nextTargets);
          }
        }
      }
    }
  });
};

const traverseNode = (node, visitor, log) => {
  // 简化版的节点遍历
  if (visitor[node.type]) {
    visitor[node.type]({ node });
  }
  
  // 递归子节点
  Object.values(node).forEach(value => {
    if (Array.isArray(value)) {
      value.forEach(child => {
        if (t.isNode(child)) {
          traverseNode(child, visitor, log);
        }
      });
    } else if (t.isNode(value)) {
      traverseNode(value, visitor, log);
    }
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

const getPossibleLValues = (caseInfo, caseValue) => {
  const lValues = [];
  
  // 从注释获取
  if (caseInfo.comment) {
    const commentL = parseLFromComment(caseInfo.comment);
    if (commentL) lValues.push(commentL);
  }
  
  // 使用 caseValue 作为备选
  lValues.push(caseValue);
  
  return lValues;
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

// 🔥 新增：支持嵌套结构的顺序重构
const reconstructSequentialCodeNested = (path, state, log) => {
  const sequentialCode = [];
  const visited = new Set();
  let currentL = state.startingL;
  let step = 0;
  const maxSteps = 5000;

  log(`开始嵌套重构，从状态 ${currentL} 开始`);

  // 1️⃣ 提取嵌套 switch 的所有 case 语句
  const allCaseStatements = extractAllCaseStatements(path.node.body, log);
  
  // 2️⃣ 按状态顺序排列
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
    const cleanStatements = extractCleanStatementsNested(currentState.statements, log);
    sequentialCode.push(...cleanStatements);

    // 选择下一个状态
    currentL = selectNextStateNested(currentState, log);
  }

  // 3️⃣ 添加其他非 switch 语句（如 var d, t, x, c, L）
  const nonSwitchStatements = extractNonSwitchStatements(path.node.body, log);
  sequentialCode.unshift(...nonSwitchStatements);

  log(`嵌套重构完成：${step} 步，${sequentialCode.length} 条语句，访问 ${visited.size} 个状态`);
  return sequentialCode;
};

// 🔥 新增：提取所有 case 语句
const extractAllCaseStatements = (body, log) => {
  const allStatements = [];
  
  const extractFromNode = (node) => {
    if (t.isSwitchStatement(node)) {
      node.cases.forEach(caseNode => {
        allStatements.push(...caseNode.consequent);
      });
    } else if (node.body) {
      if (Array.isArray(node.body)) {
        node.body.forEach(child => extractFromNode(child));
      } else {
        extractFromNode(node.body);
      }
    }
  };
  
  extractFromNode(body);
  log(`提取到 ${allStatements.length} 个 case 语句`);
  return allStatements;
};

// 🔥 新增：提取非 switch 语句（如 var d, t, x, c, L）
const extractNonSwitchStatements = (body, log) => {
  const nonSwitchStmts = [];
  
  const extractFromNode = (node) => {
    if (t.isSwitchStatement(node)) {
      // 跳过 switch
      return;
    }
    
    if (t.isExpressionStatement(node) || t.isVariableDeclaration(node)) {
      nonSwitchStmts.push(node);
    }
    
    if (node.body) {
      if (Array.isArray(node.body)) {
        node.body.forEach(child => extractFromNode(child));
      } else {
        extractFromNode(node.body);
      }
    }
  };
  
  extractFromNode(body);
  log(`提取到 ${nonSwitchStmts.length} 个非 switch 语句`);
  return nonSwitchStmts;
};

// 🔥 新增：嵌套结构的语句清理
const extractCleanStatementsNested = (statements, log) => {
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
    
    // 移除 break 语句
    if (t.isBreakStatement(stmt)) {
      log(`移除 break 语句 #${index}`, 'debug');
      keepStatement = false;
    }
    
    if (keepStatement) {
      cleanStatements.push(stmt);
    }
  });
  
  return cleanStatements;
};

const selectNextStateNested = (currentState, log) => {
  const targets = Array.from(currentState.nextTargets);
  if (targets.length === 0) {
    log('没有下一个目标，结束');
    return null;
  }
  
  // 策略：选择最小的目标值
  const nextL = Math.min(...targets);
  log(`选择下一个状态: ${nextL} (从 ${targets.join(', ')})`);
  return nextL;
};

module.exports = () => controlFlowUnflattenerPlugin();