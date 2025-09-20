const fs = require('fs');
const parser    = require("@babel/parser");
const traverse  = require("@babel/traverse").default;
const types     = require("@babel/types");
const TNT     = require("@babel/types");
const template = require("@babel/template").default;
const generator = require("@babel/generator").default;

//格式化相关
const three_to_if = require("../../libs/test/three_to_if");
const IfWithExpressFix = require('../../libs/common/IfWithExpressFix')
const ForWithExpressFix = require('../../libs/common/ForWithExpressFix')
const ForWithForFix = require('../../libs/common/ForWithForFix')
const ReturnSeqFix = require('../../libs/common/ReturnSeqFix')
const PrintCode = require('../../libs/tools/PrintCode')
const VariableDeclaratorFix = require('../../libs/common/VariableDeclaratorFix')//逗号表达式
const ConditionalFix = require('../../libs/common/ConditionalFix')
const LogicalExpressionFix = require('../../libs/common/LogicalExpressionFix')


//将源代码解析为AST
process.argv.length > 2 ? encodeFile = process.argv[2]: encodeFile ="study/ali231/part/mid.js";
// process.argv.length > 2 ? encodeFile = process.argv[2]: encodeFile ="study/ali231/fireyejs.js";
process.argv.length > 3 ? decodeFile = process.argv[3]: decodeFile ="study/ali231/part/decode_fireyejs_ouput.js";


let sourceCode = fs.readFileSync(encodeFile, {encoding: "utf-8"});
let ast = parser.parse(sourceCode);

//删除void
const del_void = {
    "UnaryExpression"(path) {
        var node = path.node;
        var parentNode = path.parentPath;
        if (node.operator === "void" && parentNode.type === "ExpressionStatement") {
            parentNode.node.expression = node.argument;
        }
    },
}

// traverse(ast, del_void);

// 格式修复 给代码块加{}

const if_block={
    /*
    if (76 == L) l = (vi = mi = pi) ? 2361600 : 7274752;
    转==>
    if (76 == L) {
  if (vi = mi = pi) {
    l = 2361600;
  } else {
    l = 7274752;
  }
}
    */
    "IfStatement"(path) {
        const { node } = path;

        // 包装 if 的 body
        if (!types.isBlockStatement(node.consequent)) {
          node.consequent = types.blockStatement([node.consequent]);
        }

        // 包装 else 的 body
        if (
          node.alternate &&
          !types.isBlockStatement(node.alternate) &&
          !types.isIfStatement(node.alternate) // 保留 else if 结构
        ) {
          node.alternate = types.blockStatement([node.alternate]);
        }
      },
}
// traverse(ast,if_block);
// traverse(ast, IfWithExpressFix.fix)
// traverse(ast, ForWithExpressFix.fix)
// traverse(ast, ForWithForFix.fix)
// traverse(ast, ReturnSeqFix.fix)





// //三目赋值表达式 转if-else
// traverse(ast, ConditionalFix.fix)

// //逗号表达式还原
// traverse(ast, VariableDeclaratorFix.fix) //逗号表达式

// //逻辑表达式转if-else
// traverse(ast, LogicalExpressionFix.fix)




//if跳转判断改为==判断
// 改if条件的判断，全部改为 == 形式
function getSwitchhNode(name,path){
    let switchBolck = [];
    path.traverse({
        IfStatement(path){
            let {test,consequent,alternate} = path.node;
			let testPath = path.get('test');
            let switchCaseNode = ''
            if (!testPath.isBinaryExpression()){
                return;
            }

            let {left,operator,right} = test;
            console.log("test_value:",test.right.name);
            if(test.right.name != name){return};
            if (operator == '==' && test.right.name == name) {
                switchCaseNode = types.SwitchCase(left, consequent.body)
            } else if (operator == '>' && test.left.name == name) {
                types.NumericLiteral(right.value + 1);
                switchCaseNode = types.SwitchCase(left, consequent.body)
             }
            else if (operator == '<') {

                if(types.isIfStatement(consequent.body[0]) && 
                types.isBinaryExpression(consequent.body[0].test) && 
                consequent.body[0].test.operator == '==' &&
                types.isIdentifier(consequent.body[0].test.right) && consequent.body[0].test.right.name == name
            ){
                return;
            };
            if(types.isIfStatement(consequent.body[0]) && 
                types.isBinaryExpression(consequent.body[0].test) && 
                (consequent.body[0].test.operator == '>' || consequent.body[0].test.operator == '<')&&
                types.isIdentifier(consequent.body[0].test.left) && consequent.body[0].test.left.name == name
            ){
                return;
            };
                types.NumericLiteral(right.value - 1);
                switchCaseNode = types.SwitchCase(left, consequent.body)
            }
            else {
                // PrintCode.PrintCode(consequent);
                if(alternate && !types.isIfStatement(alternate.body[0])){
                    types.NumericLiteral(right.value - 1);
                    switchCaseNode = types.SwitchCase(right, alternate.body)
                }
            }

            switchBolck.push(switchCaseNode);

        }
    });

    return switchBolck;

}

const ifToSwitch = 
{
    "ExpressionStatement"(path)
    {
         // 只在第一次时调用
        // 如果已经处理过就直接返回
        if (path.node._processed) return;
        path.node._processed = true;
        let {scope,node} = path;
        if(!types.isUnaryExpression(node.expression)){
            return;
        }
        let name = "L";
        let switchId = types.Identifier(name);
        let switchBolck = getSwitchhNode(name,path);
        if (switchBolck.length > 0)
        {
            let switchNode = types.SwitchStatement(switchId,switchBolck);
            // let retArray = [path.node.body.body[0]];
            // retArray.push(path.node.body.body[3])
            // retArray.push(switchNode);
            // path.node.body = types.BlockStatement([switchNode]);

            // node.consequent[0] = switchNode;//可能存在重复
            // path.skip();
            // return;

            // const firstStmtPath = path.get('consequent.0');
            // firstStmtPath.replaceWith(switchNode);
            
            
            
            path.replaceWith(switchNode);
            return;
        }
    }
}
// if语句转switch语句
// traverse(ast, ifToSwitch);

//3层switch转为一层switch
function reconstructL(L, x, d, high = 0) {
  // high 是高 8 位（第 24–31 位），如果不知道可以默认 0
  return (high << 24) | (L << 16) | (x << 8) | d;
}
function reconstructFromD(d, x = 0, L = 0, H = 0) {
  return (H << 24) | (L << 16) | (x << 8) | d;
}


function get_switchs_node(path) {
    var switchCaseNode_blocks_l = []
    path.traverse({
        "SwitchCase"(path) {
            //结构判断，是否为3层switch
            const topSwitch = path.findParent(p => p.isSwitchCase());
            if (topSwitch) {
                console.log("找到了顶层 switch");
                let toptopSwitch = topSwitch.findParent(p => p.isSwitchCase());
                if (toptopSwitch) {

                    const hasTryCatch = path.node.consequent.some(stmt => types.isTryStatement(stmt));
                    if (hasTryCatch) {
                        // 跳过这个 case
                        // return; // 直接 return 不做任何操作
                        path.skip(); // 不对当前节点的子节点进行遍历，只处理当前节点,相当于将符合条件的子节点当作了最底层的节点
                    }

                    // 这里写你的处理逻辑
                    console.log('处理不含 try 的 case：', path.node.test?.name);

                    let L = path.node.test.value;
                    let x = topSwitch.node.test.value;
                    let d = toptopSwitch.node.test.value;

                    let l = reconstructL(L, x, d);
                    console.log("l,L,x,d:", l, L, x, d);

                    path.node.test.value = l;
                    // 给每个 case 添加一个注释
                    types.addComment(path.node,"leading",`l=${l},L=${L},x=${x},d=${d} case ${path.node.test ? path.node.test.value : 'default'} 开始\n`);
                    switchCaseNode_blocks_l.push(path.node);
                }
                
            } else {
                console.log("没有找到 switch，topSwitch 为 null");
                let path_switch = path.parentPath;
                if(types.isSwitchStatement(path_switch) && 
                path_switch.node.discriminant.name == 'd' &&
                path.node.test.value != 0
            ){
                    const hasTryCatch = path.node.consequent.some(stmt => types.isTryStatement(stmt));
                    if (hasTryCatch) {
                        // 跳过这个 case
                        // return; // 直接 return 不做任何操作
                        path.skip(); // 如果你还会往下递归遍历就用 skip()
                    }

                    // 这里写你的处理逻辑
                    console.log('处理不含 try 的 case：', path.node.test?.name);

                    let d = path.node.test.value;
                    let l = reconstructFromD(d);
                    console.log("l,d:", l,d);
                    path.node.test.value = l;
                    types.addComment(path.node,"leading",` l,d = ${l},${d} case ${path.node.test ? path.node.test.value : 'default'} 开始\n`);
                    switchCaseNode_blocks_l.push(path.node);
                }
            }


        }
    });

    return switchCaseNode_blocks_l;
}

const switchs_toswitch = {
    "ForStatement"(path){
        let {node,scope} = path;
        let {init,test} = node;

        if(init && test && types.isVariableDeclaration(init) &&
        init.declarations.length == 1 && types.isVariableDeclarator(init.declarations[0]) &&
        init.declarations[0].id.name == 'l'){
            let switchCaseNode_blocks_l = get_switchs_node(path);
            let switchId = node.init.declarations[0].id;
            let switchNode = types.SwitchStatement(switchId,switchCaseNode_blocks_l);

            let forbodys = node.body.body;
            forbodys[forbodys.length-1] = switchNode;//types.BlockStatement([switchNode]);


        }
    }
}

traverse(ast,switchs_toswitch)//这个有问题







const { code } = generator(ast, {
  jsescOption: { minimal: true },
  comments: true
});
fs.writeFile(decodeFile, code, (err) => {});