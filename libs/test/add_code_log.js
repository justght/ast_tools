

const generator = require("@babel/generator").default;
const types = require("@babel/types");
const cfun_call = require("../createNode/funCall");
const addcode = {
    BlockStatement(path){
        fix(path)
    }
}


function fix(path) {
    const node = path.node;
    var switch_array = ['zbj_Si', 'wi', 'Ei'];
    var test_var = '';
    if (node.body.length == 1 && types.isExpressionStatement(node.body[0]) && types.isAssignmentExpression(node.body[0].expression)) {
        if (node.body[0].expression.left.name == "Si") {
            const parentPath_node = path.parent;
            // const parentPath_node = parentPath.node;
            if (types.isAssignmentExpression(parentPath_node.test)) {
                test_var = parentPath_node.test.left.name;

            }
            else if(types.isIdentifier(parentPath_node.test)){
                test_var = parentPath_node.test.name;
            }
            else{
                console.log("未知结构:............");
                return
            }
            if (switch_array.indexOf(test_var) <= -1) {
                const call_cbbll = types.callExpression(
                    types.identifier('cbbll'),
                    [types.identifier(test_var),node.body[0].expression.right,types.NumericLiteral(node.start),types.NumericLiteral(node.end)]
                );
                node.body.unshift(call_cbbll);
            }

        }
    }
}


exports.fix = addcode