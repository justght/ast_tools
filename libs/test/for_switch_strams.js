const fs = require('fs');
const parser    = require("@babel/parser");
const traverse  = require("@babel/traverse").default;
const t     = require("@babel/types");
const TNT     = require("@babel/types");
const template = require("@babel/template").default;
const generator = require("@babel/generator").default;



//将源代码解析为AST
process.argv.length > 2 ? encodeFile = process.argv[2]: encodeFile ="demos/test/for_switch_strams_input.js";
process.argv.length > 3 ? decodeFile = process.argv[3]: decodeFile ="demos/test/for_switch_strams_output.js";

let sourceCode = fs.readFileSync(encodeFile, {encoding: "utf-8"});
let ast    = parser.parse(sourceCode);

const for_to_streams = {
    "ForStatement"(path) {
        const { node } = path;

        // 确认是 "for (; var_3 !== 4;)" 这种
        if (
          t.isBinaryExpression(node.test) &&
          node.test.operator === "!==" &&
        //   t.isNumericLiteral(node.test.right, { value: 4 }) &&
        //   t.isSwitchStatement(node.body.body[0]) // for里只有一个switch
          t.isNumericLiteral(node.test.right) // 只检查是数字
        ) {
          const switchStmt = node.body.body[0];
          const cases = switchStmt.cases;

          // 按 case 顺序展开语句
          let body = [];
          for (let c of cases) {
            // 只保留 case 里的语句，不要 break;
            for (let stmt of c.consequent) {
              if (!t.isBreakStatement(stmt)) {
                body.push(stmt);
              }
            }
          }

          // 用 BlockStatement 替换整个 for
        //   path.replaceWith(t.blockStatement(body));
        //   path.replaceWith(body);
          if (body.length === 1) {
            path.replaceWith(body[0]);
          } else {
            // path.replaceWithMultiple(body);
          }
          
        // 4️⃣ 尝试删除无用循环变量
          const loopVarName = node.init?.declarations?.[0]?.id?.name;
          if (loopVarName) {
            let binding = path.scope.getBinding(loopVarName);
            if (binding && !binding.referenced) {
              binding.path.remove();
            }
          }

        }
      },
}

// traverse(ast, for_to_streams);

let { code } = generator(ast, 
  opts = { 
    jsescOption: { "minimal": true }, 
    // compact: true 
}
);

fs.writeFile(decodeFile, code, (err) => {});