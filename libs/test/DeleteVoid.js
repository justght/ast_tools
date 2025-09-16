



const PrintCode = require('../tools/PrintCode');//PrintCode.PrintCode(path);
const types = require("@babel/types");
const traverse_express = {
    ExpressionStatement(path) {
        fix(path)
    }
}



function fix(path){
    const node = path.node;
    const scope = path.scope;
    PrintCode.PrintCode(path);
    if(types.isExpressionStatement(path) && types.isUnaryExpression(node.expression) && types.isConditionalExpression(node.expression.argument)){
        node.expression = node.expression.argument;
    }

}

exports.fix = traverse_express
