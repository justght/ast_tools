


const types = require("@babel/types");
const traverse_express = {
    IfStatement(path) {
        fix(path)
    },
    SwitchStatement(path){
        fix(path)
    },
}

function convert_symbol(operator){
    let res;
    switch (operator){
        case "===":
        case "==":
        case "!==":
        case "&":
            res = operator;
            break;
        case "<":
            res = ">";
            break;
        case "<=":
            res = ">=";
            break;
        case ">":
            res = "<";
            break;
        case ">=":
            res = "<=";
            break;
        default:
            throw "符号调换有新情况" + operator;

    }
    return res;
}



function fix(path){
    const node = path.node;
    const scope = path.scope;

    if(types.isSwitchStatement(path) && types.isBinaryExpression(node.discriminant)){
        if(types.isBinaryExpression(node.discriminant)){
            if(types.isNumericLiteral(node.discriminant.left) && types.isIdentifier(node.discriminant.right)){
                //调换位置
                var temp = node.discriminant.left;
                node.discriminant.left = node.discriminant.right;
                node.discriminant.right = temp;
                //符号调换
                node.discriminant.operator = convert_symbol(node.discriminant.operator);
            }

        }
        

    }
    else if (types.isIfStatement(path) && types.isBinaryExpression(node.test)) {
        if (types.isNumericLiteral(node.test.left) && types.isIdentifier(node.test.right)) {
            // 调换位置
            let temp = node.test.left;
            node.test.left = node.test.right;
            node.test.right = temp;
            // 符号也要转
            node.test.operator = convert_symbol(node.test.operator);
        }
    }


}


exports.fix = traverse_express
