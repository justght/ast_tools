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
process.argv.length > 2 ? encodeFile = process.argv[2]: encodeFile ="study/ali231/part/Xr.js";
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

traverse(ast, del_void);

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
traverse(ast,if_block);
traverse(ast, IfWithExpressFix.fix)
traverse(ast, ForWithExpressFix.fix)
traverse(ast, ForWithForFix.fix)
traverse(ast, ReturnSeqFix.fix)





//三目赋值表达式 转if-else
traverse(ast, ConditionalFix.fix)

//逗号表达式还原
traverse(ast, VariableDeclaratorFix.fix) //逗号表达式

//逻辑表达式转if-else
traverse(ast, LogicalExpressionFix.fix)


//if跳转判断改为==判断
// 改if条件的判断，全部改为 == 形式
function getSwitchhNode(name,scope){
    let switchBolck = [];
    scope.traverse(scope.block,{

        IfStatement(path){
            let {test,consequent,alternate} = path.node;
			let testPath = path.get('test');
            let switchCaseNode = ''
            if (!testPath.isBinaryExpression()){
                return;
            }

            let {left,operator,right} = test;

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
    UnaryExpression(path)
    {
        let {scope,node} = path;
        // let {id,params,body} = node;
        // if (!types.isIdentifier(id,{name:"__V"}) ||
        //     params.length != 5)
        // {
        //     return;
        // }
        
        let name     = "L";
        let switchId = types.Identifier(name);
        let switchBolck = getSwitchhNode(name,scope);
        
        if (switchBolck.length > 0)
        {
            let switchNode = types.SwitchStatement(switchId,switchBolck);
            let retArray = [path.node.body.body[0]];
            retArray.push(path.node.body.body[3])
            retArray.push(switchNode);
            path.node.body = types.BlockStatement(retArray);
        }
    }
}
traverse(ast, ifToSwitch);
// if语句转switch语句
var nextIfToSwicth= {
    "SwitchCase"(path){
        let {parentPath,node,parent,scope} = path;
        let {consequent} = node;
        if(!parentPath.isSwitchStatement() || parent.discriminant.name != "Ci"){
            return;
        }
        if(consequent.length != 2 || !types.isIfStatement(consequent.at(0))){
            return;
        }

        let IfMap = new Map()

        path.traverse({     // 将 每个if的true板块提出来，放到map里
            IfStatement:{
                exit(_path){
                let ifTest= _path.node.test
                let ifConsequent = _path.node.consequent
                if(!types.isBinaryExpression(ifTest) || ifTest.operator != "=="){
                    return;
                }
                if(ifTest.right.name != "mi"){
                    return;
                }


                IfMap.set(ifTest.left.value,ifConsequent.body)
                // console.log(_path.toString())

            }}
        })

        let switchNode = undefined;
        let CaseNode = [];   // 定义为数组，存放case板块
        for (let i=0;i<IfMap.size;i++){
            let caseValueArry = IfMap.get(i)
            let CastTest = types.NumericLiteral(i)
            caseValueArry.push(types.BreakStatement())
            let switchCaseNode = types.SwitchCase(CastTest,caseValueArry)
            CaseNode.push(switchCaseNode)
        }
        switchNode = types.SwitchStatement(types.Identifier("mi"),CaseNode)
        path.node.consequent.shift() // 删除第一个
        path.node.consequent.unshift(switchNode)    //将一个或多个元素添加到数组的开头
        // path.stop()
    }
}

traverse(ast,nextIfToSwicth)//这个有问题


//逻辑表达式转if-else
traverse(ast, LogicalExpressionFix.fix)




let { code } = generator(ast, 
  opts = { 
    jsescOption: { "minimal": true }, 
    // compact: true 
}
);

fs.writeFile(decodeFile, code, (err) => {});