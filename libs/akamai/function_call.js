
const types = require("@babel/types");
const generator = require("@babel/generator").default;

const traverse_unicode = {
    FunctionDeclaration(path) {
        fix(path)
    },
    CallExpression(path){
        fix(path)
    }
}



function fix(path) {
    let node = path.node;
    // 外层共享变量
    let arr = null;
    if(types.isFunctionDeclaration(path) && (node.id.name=='S4V' || node.id.name == 'fxV')){
        console.log("类型验证ok:",node.id.name);
        node_code = generator(path.node).code;
        console.log('类型验证ok:',node_code);
        // 提取数组
          const body = path.node.body.body;
          for (const stmt of body) {
            if (types.isVariableDeclaration(stmt)) {
              const decl = stmt.declarations[0];
              if (types.isArrayExpression(decl.init)) {
                arr = decl.init.elements.map(el => el.value);
                // 用 const JTV = [...] 替换 fxV
                path.replaceWith(
                  types.variableDeclaration("const", [
                    types.variableDeclarator(types.identifier("JTV"), decl.init)
                  ])
                );
                break;
              }
            }
          }

    }else{
        console.log('类型验证fail',node.type,path.type);
    }


    if(types.isCallExpression(path)){
        if (types.isIdentifier(path.node.callee, { name: "zb" })) {
          const arg = path.node.arguments[0];
          console.log('函数值替换：',generator(path.node).code);
          if (types.isNumericLiteral(arg) && arr) {
            const val = arr[arg.value];
            if (typeof val === "string") {
              path.replaceWith(t.stringLiteral(val));
            }
          }
        }
      }

}

exports.fix = traverse_unicode