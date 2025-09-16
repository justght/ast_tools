const file = require('fs');
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const types = require("@babel/types");
const t = require("@babel/types");
const generator = require("@babel/generator").default;

//将源代码解析为AST
process.argv.length > 2 ? encodeFile = process.argv[2] : encodeFile = "./encode.js";

let sourceCode = file.readFileSync(encodeFile, { encoding: "utf-8" });
let ast = parser.parse(sourceCode);

let CallExpress = [];

const collectCall =
{
	CallExpression:
	{
		enter(path) {

			let sourceCode = path.toString();

			if (sourceCode.length < 13 || sourceCode.slice(2, 4) != "()") {
				return;
			}

			CallExpress.push(path.toString());
		}
	}
}


traverse(ast, collectCall);


file.writeFile("funcLists.js", JSON.stringify(CallExpress), (err) => { });








