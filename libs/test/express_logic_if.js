


const generator = require("@babel/generator").default;
const types = require("@babel/types");
// const cfun_call = require("../createNode/funCall");

const express_logic_if = {
    ExpressionStatement(path) {
        fix(path)
    }

}


/**
 * St > 0 && (te = (bo &= 7) + (D = ot instanceof String), vt = bo * D, go = (te *= te) >= (vt *= 4), re.push(1), re = re.concat(m), Ct = go ? 6629 : 9027);
 *
 * Ei > 0 && (O = w.charCodeAt(T), L = 255 & O, Y.push(L), Si = 15552);
 *
 * @param path
 */



function fix(path) {
    const node = path.node;
    const exp = node.expression;

    if (!types.isLogicalExpression(exp) || !types.isBinaryExpression(exp.left)) {
        return
    }
    if (types.isSequenceExpression(exp.right) || types.isAssignmentExpression(exp.right)) {
        console.log("待处理的逻辑表达式：", generator(path.node).code);
        logic_left = exp.left;
        op = exp.operator;
        logic_right = exp.right;


        if (op == "&&") {
            expres_list = []
            if(types.isSequenceExpression(exp.right)){
                logic_right.expressions.forEach(function (block) {
                expres_list.push(types.expressionStatement(block));
                consequent_b = types.BlockStatement(expres_list);
                alternate_b = types.BlockStatement([]);
            })
            }else if(types.isAssignmentExpression(exp.right)){
                expres_list = types.expressionStatement(exp.right)
                consequent_b = types.BlockStatement([expres_list]);
                alternate_b = types.BlockStatement([]);
            }


            if_code = types.IfStatement(logic_left, consequent_b);
            console.log("处理后的逻辑表达式：", generator(if_code).code);
            path.replaceWith(if_code)
        }
    }




}


exports.fix = express_logic_if