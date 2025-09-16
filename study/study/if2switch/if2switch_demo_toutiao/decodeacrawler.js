const fs = require('fs');
const parser    = require("@babel/parser");
const traverse  = require("@babel/traverse").default;
const types     = require("@babel/types");
const TNT     = require("@babel/types");
const template = require("@babel/template").default;
const generator = require("@babel/generator").default;


//将源代码解析为AST
process.argv.length > 2 ? encodeFile = process.argv[2]: encodeFile ="./acrawler.js";
process.argv.length > 3 ? decodeFile = process.argv[3]: decodeFile ="./decode_result.js";


let sourceCode = fs.readFileSync(encodeFile, {encoding: "utf-8"});
let ast    = parser.parse(sourceCode);


console.time("处理完毕，耗时");

//格式化
const standardLoop = 
{
	"ForStatement|WhileStatement"({node})
	{
		if(!types.isBlockStatement(node.body))
    {
    	node.body = types.BlockStatement([node.body]);
    }
  },
}

traverse(ast, standardLoop);


const SimplifyIfStatement = {
    "IfStatement"(path) {
        const consequent = path.get("consequent");
        const alternate = path.get("alternate");
        const test = path.get("test");
        const evaluateTest = test.evaluateTruthy();//在 AST 插件里用来做静态条件求值的工具

        if (!consequent.isBlockStatement()) {
            consequent.replaceWith(types.BlockStatement([consequent.node]));
        }
        if (alternate.node !== null && !alternate.isBlockStatement()) {
            alternate.replaceWith(types.BlockStatement([alternate.node]));
        }

        if (consequent.node.body.length == 0) {
            if (alternate.node == null) {
                path.replaceWith(test.node);
            } else {
                consequent.replaceWith(alternate.node);
                alternate.remove();
                path.node.alternate = null;
                test.replaceWith(types.unaryExpression("!", test.node, true));
            }
        }

        if (alternate.isBlockStatement() && alternate.node.body.length == 0) {
            alternate.remove();
            path.node.alternate = null;
        }

        if (evaluateTest === true) {
            path.replaceWithMultiple(consequent.node.body);
        } else if (evaluateTest === false) {
            alternate.node === null ? path.remove() : path.replaceWithMultiple(alternate.node.body);
        }
    },
}

traverse(ast, SimplifyIfStatement);


function ConditionToIf(path) {
   /*
   *
   * m ? a = 11 : a = 22;

   if (m) {
    a = 11;
   } else {
    a = 22;
   }
   *
   *
   * */
   let {expression} = path.node;
   if(!types.isConditionalExpression(expression)) return;
   let {test, consequent, alternate} = expression;
   path.replaceWith(types.ifStatement(
       test,
       types.blockStatement([types.expressionStatement(consequent),]),
       types.blockStatement([types.expressionStatement(alternate),])
   ));
}

traverse(ast, {ExpressionStatement: ConditionToIf,});


/****************************
A > 5 && (S[R] = h(S[R])); 

==>

if (A > 5) 
{
  S[R] = h(S[R]);
}
****************************/

const LogicalToIF = 
{
	LogicalExpression(path)
	{
		let {node,parentPath} = path;
		if (!parentPath.isExpressionStatement({expression:node}))
		{
			return;
		}
		let { left, operator, right } = node;
		if (operator == "&&")
		{
			let ifNode = types.IfStatement(left,types.BlockStatement([types.ExpressionStatement(right)]));
			parentPath.replaceWith(ifNode);
		}
	}
}

traverse(ast, LogicalToIF);



let arr  =[
    [
        "mxt_5448_36",
        2
    ],
    [
        "mxt_5448_11",
        37
    ],
    [
        "mxt_5448_3",
        38
    ],
    [
        "mxt_5448_28",
        17
    ],
    [
        "mxt_5448_46",
        10
    ],
    [
        "mxt_5448_12",
        16
    ],
    [
        "mxt_5448_1",
        33
    ],
    [
        "mxt_5448_34",
        27
    ],
    [
        "mxt_5448_53",
        11
    ],
    [
        "mxt_5448_7",
        67
    ],
    [
        "mxt_5448_63",
        62
    ],
    [
        "mxt_5448_27",
        34
    ],
    [
        "mxt_5448_37",
        23
    ],
    [
        "mxt_5448_59",
        24
    ],
    [
        "mxt_5448_32",
        1
    ],
    [
        "mxt_5448_47",
        31
    ],
    [
        "mxt_5448_41",
        19
    ],
    [
        "mxt_5448_22",
        30
    ],
    [
        "mxt_5448_18",
        26
    ],
    [
        "mxt_5448_5",
        29
    ],
    [
        "mxt_5448_24",
        39
    ],
    [
        "mxt_5448_10",
        4
    ],
    [
        "mxt_5448_29",
        64
    ],
    [
        "mxt_5448_20",
        72
    ],
    [
        "mxt_5448_40",
        18
    ],
    [
        "mxt_5448_65",
        20
    ],
    [
        "mxt_5448_57",
        28
    ],
    [
        "mxt_5448_39",
        65
    ],
    [
        "mxt_5448_62",
        36
    ],
    [
        "mxt_5448_55",
        70
    ],
    [
        "mxt_5448_35",
        6
    ],
    [
        "mxt_5448_19",
        5
    ],
    [
        "mxt_5448_42",
        40
    ],
    [
        "mxt_5448_54",
        58
    ],
    [
        "mxt_5448_9",
        25
    ],
    [
        "mxt_5448_60",
        45
    ],
    [
        "mxt_5448_31",
        22
    ],
    [
        "mxt_16749_59",
        24
    ],
    [
        "mxt_16749_26",
        30
    ],
    [
        "mxt_16749_53",
        58
    ],
    [
        "mxt_16749_42",
        23
    ],
    [
        "mxt_16749_7",
        25
    ],
    [
        "mxt_16749_34",
        31
    ],
    [
        "mxt_16749_24",
        34
    ],
    [
        "mxt_16749_64",
        36
    ],
    [
        "mxt_16749_28",
        72
    ],
    [
        "mxt_16749_33",
        10
    ],
    [
        "mxt_16749_2",
        16
    ],
    [
        "mxt_16749_41",
        2
    ],
    [
        "mxt_16749_63",
        62
    ],
    [
        "mxt_16749_19",
        22
    ],
    [
        "mxt_16749_58",
        45
    ],
    [
        "mxt_16749_5",
        0
    ],
    [
        "mxt_5448_15",
        0
    ],
    [
        "mxt_5448_43",
        61
    ],
    [
        "mxt_5448_52",
        32
    ],
    [
        "mxt_5448_13",
        63
    ],
    [
        "mxt_5448_6",
        8
    ],
    [
        "mxt_5448_58",
        3
    ],
    [
        "mxt_16749_15",
        33
    ],
    [
        "mxt_16749_6",
        4
    ],
    [
        "mxt_16749_47",
        27
    ],
    [
        "mxt_16749_52",
        11
    ],
    [
        "mxt_16749_56",
        28
    ],
    [
        "mxt_5448_49",
        73
    ],
    [
        "mxt_5448_14",
        42
    ],
    [
        "mxt_5448_26",
        13
    ],
    [
        "mxt_5448_45",
        57
    ],
    [
        "mxt_16749_17",
        64
    ],
    [
        "mxt_16749_13",
        38
    ],
    [
        "mxt_16749_11",
        29
    ],
    [
        "mxt_16749_9",
        67
    ],
    [
        "mxt_16749_20",
        1
    ],
    [
        "mxt_5448_50",
        74
    ],
    [
        "mxt_5448_38",
        44
    ],
    [
        "mxt_5448_51",
        53
    ],
    [
        "mxt_16749_49",
        74
    ],
    [
        "mxt_16749_4",
        42
    ],
    [
        "mxt_16749_43",
        44
    ],
    [
        "mxt_16749_38",
        40
    ],
    [
        "mxt_16749_50",
        53
    ],
    [
        "mxt_16749_37",
        19
    ],
    [
        "mxt_5448_61",
        66
    ],
    [
        "mxt_5448_64",
        41
    ],
    [
        "mxt_16749_23",
        13
    ],
    [
        "mxt_16749_21",
        39
    ],
    [
        "mxt_16749_60",
        3
    ],
    [
        "mxt_16749_27",
        51
    ],
    [
        "mxt_16749_46",
        48
    ],
    [
        "mxt_16749_54",
        70
    ],
    [
        "mxt_16749_48",
        6
    ],
    [
        "mxt_16749_29",
        5
    ],
    [
        "mxt_16749_36",
        73
    ],
    [
        "mxt_16749_1",
        37
    ],
    [
        "mxt_16749_32",
        57
    ],
    [
        "mxt_16749_62",
        41
    ],
    [
        "mxt_16749_22",
        60
    ],
    [
        "mxt_16749_57",
        66
    ],
    [
        "mxt_16749_39",
        61
    ],
    [
        "mxt_16749_45",
        18
    ],
    [
        "mxt_16749_51",
        32
    ],
    [
        "mxt_16749_16",
        17
    ],
    [
        "mxt_16749_30",
        26
    ],
    [
        "mxt_16749_44",
        65
    ],
    [
        "mxt_5448_30",
        43
    ],
    [
        "mxt_5448_56",
        49
    ],
    [
        "mxt_16749_55",
        49
    ],
    [
        "mxt_5448_21",
        51
    ],
    [
        "mxt_5448_33",
        48
    ],
    [
        "mxt_5448_17",
        47
    ],
    [
        "mxt_16749_3",
        63
    ],
    [
        "mxt_16749_31",
        47
    ],
    [
        "mxt_5448_48",
        52
    ],
    [
        "mxt_5448_44",
        35
    ],
    [
        "mxt_16749_35",
        52
    ],
    [
        "mxt_16749_40",
        35
    ],
    [
        "mxt_16749_61",
        20
    ],
    [
        "mxt_5448_8",
        46
    ],
    [
        "mxt_16749_8",
        46
    ],
    [
        "mxt_5448_2",
        59
    ],
    [
        "mxt_16749_12",
        8
    ],
    [
        "mxt_16749_14",
        59
    ],
    [
        "mxt_16749_18",
        43
    ],
    [
        "mxt_5448_25",
        60
    ],
    [
        "mxt_16749_25",
        9
    ],
    [
        "mxt_5448_23",
        9
    ]
]
// let arr = []
let case_node_map = new Map(arr);


let injection = false;//值为false，还原成while - switch语句，为true则进行注入，获取arr的值


/**
 *
 *  for (; O < E;) {...  -> while
 */

const if2Switch =
    {
        IfStatement(path) {
            let {node, parentPath} = path;
            let {test, start} = node;
            if (!parentPath.parentPath.isForStatement() || !types.isSequenceExpression(test)) return;

            let num = 1;
            let sign = "mxt";
            let caseNodes = [];
            let FUNC_NODE = template(`mxt_(SIGN,LEFT)`);

            path.traverse({
                IfStatement(_path) {
                    let {node, scope} = _path;
                    if (TNT.isBinaryExpression(node.test) && TNT.isAssignmentExpression(node.test.left)) {
                        scope.traverse(scope.block, {
                            IfStatement(ppath) {

                                let {test, consequent, alternate} = ppath.node;
                                if (TNT.isBinaryExpression(test) && ['>', '<'].includes(test.operator) && (TNT.isIdentifier(test.left) ||
                                    (TNT.isAssignmentExpression(test.left) && TNT.isIdentifier(test.left.left, {name: "A"})))) {
                                    let tmp = `${sign}_${start}_${num}`;
                                    if (injection) {

                                        consequent.body.unshift(FUNC_NODE({
                                            SIGN: TNT.StringLiteral(tmp),
                                            left: TNT.Identifier('j'),
                                        }))
                                    } else {

                                        if (case_node_map.has(tmp)) {
                                            let i = case_node_map.get(tmp);
                                            if (!types.isReturnStatement(consequent.body[consequent.body.length - 1])) {
                                                consequent.body.push(types.BreakStatement());
                                            }

                                            caseNodes[i] = types.SwitchCase(types.NumericLiteral(i), consequent.body);
                                        } else {
                                            console.log(tmp)
                                        }
                                    }
                                    num += 1;
                                }
                            }
                        })
                    }
                }
            })

            if (!injection && caseNodes.length > 0) {
                // IF_NODE.remove();
                let newArr = caseNodes.filter(item => item); // 去掉数组空字符串、undefined、null
                newArr.push(TNT.SwitchCase(null, [TNT.ReturnStatement()]))//这个就是 在 switch 的 cases 里新增一个 default 分支，里面只有一句 return;
                path.replaceWith(TNT.SwitchStatement(TNT.Identifier('j'), newArr))
                path.insertBefore(template.ast("x >>= 4;"))
                path.insertBefore(template.ast("A = x;"))
            }
        }
    }

traverse(ast,if2Switch);


console.timeEnd("处理完毕，耗时");


let {code} = generator(ast,opts = {jsescOption:{"minimal":true}});

fs.writeFile(decodeFile, code, (err) => {});