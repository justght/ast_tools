const fs            = require('fs');
const types         = require("@babel/types");
const parser        = require("@babel/parser");
const traverse      = require("@babel/traverse").default;
const generator     = require("@babel/generator").default;

//样本: https://wx.zsxq.com/dweb2/index/topic_detail/814251225845222
//js混淆代码读取
process.argv.length > 2 ? encodeFile = process.argv[2]: encodeFile ="./test.js";
process.argv.length > 3 ? decodeFile = process.argv[3]: decodeFile ="./decodeResult.js";

//将源代码解析为AST
let sourceCode = fs.readFileSync(encodeFile, {encoding: "utf-8"});

let ast    = parser.parse(sourceCode);


console.time("处理完毕，耗时");


//深度优先遍历，注意会一步一步覆盖原有的分支
function collectSwitchCase(WhilePath,name)
{
	let ifNodes = [];
	
	WhilePath.traverse({
			"IfStatement"(path)
			{//遍历所有的ifStatement;
				let {test,consequent,alternate} = path.node; //获取子节点
				
				let {left,operator,right} = test; // 必定是BinaryExpression
				
				if (!types.isIdentifier(left,{name:name}) || operator != '<' || !types.isNumericLiteral(right)) 
				{//条件过滤
					return;
				}

				let value      = right.value;
				//包含了一个替换的操作
				ifNodes[right.value-1] = consequent.body;   //保存整个body，记得生成switchCase节点的时候加上break节点。
				
				if (!types.isIfStatement(alternate))
				{
					ifNodes[right.value] = alternate.body;  //最后一个else，其实就是上一个else-if 的 test.right的值
				}				
			},
		})
	
	return ifNodes;
} 




const IfToSwitchNode = {
	"WhileStatement"(path)
	{
		let {test,body} = path.node;
		
		if (!types.isNumericLiteral(test,{value:1}) || body.body.length != 2) 
		{//条件过滤
			return;
		}
		
		let blockBody = body.body;
		
		if (!types.isExpressionStatement(blockBody[0]) || !types.isIfStatement(blockBody[1]))
		{//条件过滤
			return;
		}
		
		let {left,right} = blockBody[0].expression; //或者左右节点  _$nE = _$Lc[_$nI++];
		
		let name = left.name;   //变量名
		
		let ifNodes = collectSwitchCase(path,name);   //收集case
		
		if (ifNodes.length == 0) return;   //无case，直接返回。
		
		let len = ifNodes.length;
		
		for (let i=0; i < len; i++)
		{
			ifNodes[i].push(types.BreakStatement());  //每一个case最后都加break
			ifNodes[i] = types.SwitchCase(test = types.valueToNode(i),consequent = ifNodes[i]);  //生成SwitchCase节点
		}
		
		let switchNode = types.SwitchStatement(right,ifNodes);   //生成SwitchCase节点
		
		path.node.body.body = [switchNode]; //最后的while节点只有一个Switch Node;
		
	},
}


traverse(ast, IfToSwitchNode);

console.timeEnd("处理完毕，耗时");


let {code} = generator(ast,opts = {jsescOption:{"minimal":true}});

fs.writeFile(decodeFile, code, (err) => {});