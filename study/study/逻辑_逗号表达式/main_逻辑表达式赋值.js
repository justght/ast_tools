const fs = require('fs');
const types = require("@babel/types");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const template = require("@babel/template").default;

//js混淆代码读取
process.argv.length > 2 ? encodeFile = process.argv[2] : encodeFile = "./input.js";
process.argv.length > 3 ? decodeFile = process.argv[3] : decodeFile = "./output.js";

//将源代码解析为AST
let sourceCode = fs.readFileSync(encodeFile, { encoding: "utf-8" });

let ast = parser.parse(sourceCode);


console.time("处理完毕，耗时");


function isRetTrueOrFalse(expression) {
	if (!types.isLogicalExpression(expression)) {
		return undefined;
	}

	let { left, operator, right } = expression;

	if (types.isLiteral(right)) {
		if (operator == "||" && right.value) {
			return true;
		}

		if (operator == "&&" && !right.value) {
			return false;
		}
	}

	if (types.isLogicalExpression(right))
	{

		if (types.isLogicalExpression(left) && operator == "&&")
		{
			if ( isRetTrueOrFalse(left) == true && isRetTrueOrFalse(right) == true)
			{
				return true;
			}
		}

		if (types.isLogicalExpression(left) && operator == "||")
		{
			if ( isRetTrueOrFalse(left) == true || isRetTrueOrFalse(right) == true)
			{
				return true;
			}
		}


		if (operator == "||" && isRetTrueOrFalse(right) == true) {
			return true;
		}
		if (operator == "&&" && isRetTrueOrFalse(right) == false) {
			
			return false;
		}
	}


	return undefined;
}


const takeOffLogicalExpression =
{
	LogicalExpression(path) {
		let { parentPath, node } = path;
		if (!parentPath.isExpressionStatement()) {
			return;
		}

		let { left, operator, right } = node;

		if (!types.isLogicalExpression(left)) {
			return;
		}
		
		if (isRetTrueOrFalse(left) == true && operator == "&&") {
			parentPath.insertAfter(types.ExpressionStatement(right));
			path.replaceWith(left);
			return;
		}
		if (isRetTrueOrFalse(left) == false && operator == "||") {
			parentPath.insertAfter(types.ExpressionStatement(right));
			path.replaceWith(left);
			return;
		}
	}
}

const simplifyLogicalExpression = 
{
	LogicalExpression(path)
	{
		let { parentPath, node } = path;
		if (!parentPath.isExpressionStatement()) {
			return;
		}
		let { left, operator, right } = node;
		if (types.isLiteral(right))
		{
			path.replaceWith(left);
		}

	},
	AssignmentExpression(path)
	{
		let { parentPath, node } = path;
		if (!parentPath.isExpressionStatement()) {
			return;
		}
		let rightPath = path.get('right');

		if (!rightPath.isLogicalExpression())
		{
			return;
		}

		let { left, operator, right } = rightPath.node;


		if(isRetTrueOrFalse(left) == true && operator == "&&")
		{
			parentPath.insertBefore(types.ExpressionStatement(left));
			rightPath.replaceWith(right);
			return;
		}
		if(isRetTrueOrFalse(left) == true && operator == "||")
		{
			parentPath.insertAfter(types.ExpressionStatement(right));
			rightPath.replaceWith(left);
			
			return;
		}
		if(isRetTrueOrFalse(left) == false && operator == "&&")
		{
			parentPath.insertAfter(types.ExpressionStatement(right));
			rightPath.replaceWith(left);
			return;
		}
		if(isRetTrueOrFalse(left) == false && operator == "||")
		{
			parentPath.insertBefore(types.ExpressionStatement(left));
			rightPath.replaceWith(right);
			return;
		}		
	},
}

// for (let i = 0; i < 10; i++) {
// 	traverse(ast, takeOffLogicalExpression);
// 	traverse(ast, simplifyLogicalExpression);
// }



// const template      = require("@babel/template").default;

let ifNODETEP = template(`if(A){B;}`);
const LogicalToIfStatement =
{
	LogicalExpression(path) {
		let { node, parentPath } = path;
		if (!parentPath.isExpressionStatement({ "expression": node }))
		{
			return;
		}
		let { left, operator, right } = node;
		let ifNode = "";
		if (operator == "||") {
			let UnaryNode = types.UnaryExpression(operator = "!",argument = left);
			ifNode = ifNODETEP({"A":UnaryNode,"B":right});
		}
		else if (operator == "&&") {
			ifNode = ifNODETEP({"A":left,"B":right});
		}
		else {
			return;
		}

		parentPath.replaceWith(ifNode);
	},

}

traverse(ast,LogicalToIfStatement);//逻辑表达式转if语句



// 去除逗号表达式，之前的插件大家弃用吧。

const resolveSequence =
{
	SequenceExpression(path)
	{
		let {scope,parentPath,node} = path;
		let expressions = node.expressions;
		if (parentPath.isReturnStatement({"argument":node}))
		{
			let lastExpression = expressions.pop();
			for (let expression of expressions)
			{
				parentPath.insertBefore(types.ExpressionStatement(expression=expression));
			}

			path.replaceInline(lastExpression);
		}
		else if (parentPath.isExpressionStatement({"expression":node}))
		{
			let body = [];
			expressions.forEach(express=>{body.push(types.ExpressionStatement(express));});
            path.replaceWithMultiple(body);
		}
		else
		{
			return;
		}

		scope.crawl();
	}
}

traverse(ast, resolveSequence);//逗号表达式


console.timeEnd("处理完毕，耗时");


let { code } = generator(ast, opts = { jsescOption: { "minimal": true } });

fs.writeFile(decodeFile, code, (err) => { });