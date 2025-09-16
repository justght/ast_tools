const generator = require("@babel/generator").default;
const types = require("@babel/types");
// const cfun_call = require("../createNode/funCall");
const three_to_if = {
    ExpressionStatement(path) {//直接用isConditionalExpression 会导致死循环，replacewith替换是失败的，具体原因未知
        fix(path)
    },

}


/**
 *操作之前先还原逗号表达式
 * @param path
 */



function fix(path) {
    const node = path.node;
    const exp = node.expression;
    // console.log("赋值结构的三元表达式111", generator(path.node).code);

    //三元表达式条件为判断语句时 13==St?a=1:a=2
    if (types.isConditionalExpression(exp)) {
        if (!types.isBinaryExpression(exp.test)) {
            return
        }
        // console.log("获取到的test", generator(node).code);
        testc = exp.test;
        consequent_c = exp.consequent;
        alternate_c = exp.alternate;

        consequent_b = types.BlockStatement([
            types.expressionStatement(consequent_c)

        ]);
        alternate_b = types.BlockStatement([
            types.expressionStatement(alternate_c)
        ])

        if_code = types.IfStatement(testc, consequent_b, alternate_b);

        path.replaceWith(if_code)
        // console.log("处理后的coding", generator(path.node).code);

    }
    //三元表达式条件为赋值语句 Ct=k<_.length?20966:5125
    // if (types.isAssignmentExpression(exp)) {
    //     if (!types.isIdentifier(exp.left) || !types.isConditionalExpression(exp.right) || !types.isLiteral(exp.right.consequent) || !types.isLiteral(exp.right.alternate)) {
    //         return
    //     }
    //     // console.log("赋值结构的三元表达式", generator(path.node).code);
    //     conditional_em = exp.right;
    //
    //     testc = conditional_em.test;
    //     consequent_c = conditional_em.consequent;
    //     alternate_c = conditional_em.alternate;
    //     consequent_b = types.BlockStatement([
    //         types.expressionStatement(types.AssignmentExpression('=', exp.left, consequent_c))
    //
    //     ]);
    //     alternate_b = types.BlockStatement([
    //         types.expressionStatement(types.AssignmentExpression('=', exp.left, alternate_c))
    //     ]);
    //     if_code = types.IfStatement(testc, consequent_b, alternate_b);
    //     path.replaceWith(if_code)
    //     // console.log("处理后的coding", generator(path.node).code);
    // }
    if (types.isAssignmentExpression(exp)) {
        if (!types.isIdentifier(exp.left)) {
            return
        }
        /**
         * case 2:
                    var b = A;
                    r = b ? 10 : 3;
                    break;
         outupt:
         * var b = A;
         *
         *           if (b) {
         *             r = 10;
         *           } else {
         *             r = 3;
         *           }
         */
        console.log("赋值结构的三元表达式", generator(path.node).code);
        if (types.isConditionalExpression(exp.right) && types.isLiteral(exp.right.consequent) && types.isLiteral(exp.right.alternate)) {
            // console.log("赋值结构的三元表达式", generator(path.node).code);
            conditional_em = exp.right;

            testc = conditional_em.test;
            consequent_c = conditional_em.consequent;
            alternate_c = conditional_em.alternate;
            consequent_b = types.BlockStatement([
                types.expressionStatement(types.AssignmentExpression('=', exp.left, consequent_c))

            ]);
            alternate_b = types.BlockStatement([
                types.expressionStatement(types.AssignmentExpression('=', exp.left, alternate_c))
            ]);
            if_code = types.IfStatement(testc, consequent_b, alternate_b);
            path.replaceWith(if_code)
            // console.log("处理后的coding", generator(path.node).code);
        }
        else if (types.isConditionalExpression(exp.right) && types.isConditionalExpression(exp.right.consequent) && types.isConditionalExpression(exp.right.alternate)) {
            assigment_left = exp.left;
            right_test = exp.right.test;
            consequent_bt = exp.right.consequent;
            alternate_bt = exp.right.alternate;

            consequent_bt_test = consequent_bt.test;
            consequent_bt_con = consequent_bt.consequent;
            consequent_bt_alt = consequent_bt.alternate;
            consequent_b = types.BlockStatement([
                types.expressionStatement(types.AssignmentExpression('=', assigment_left, consequent_bt_con))

            ]);
            alternate_b = types.BlockStatement([
                types.expressionStatement(types.AssignmentExpression('=', assigment_left, consequent_bt_alt))
            ]);
            consequent_if_code = types.IfStatement(consequent_bt_test, consequent_b, alternate_b);
            // path.replaceWith(if_code)
            console.log("处理后的coding", generator(consequent_if_code).code);


            alternate_bt_test = alternate_bt.test;
            alternate_bt_con = alternate_bt.consequent;
            alternate_bt_alt = alternate_bt.alternate;
            consequent_bt_b = types.BlockStatement([
                types.expressionStatement(types.AssignmentExpression('=', assigment_left, alternate_bt_con))

            ]);
            alternate_bt_b = types.BlockStatement([
                types.expressionStatement(types.AssignmentExpression('=', assigment_left, alternate_bt_alt))
            ]);
            alternate_bt_if_code = types.IfStatement(alternate_bt_test, consequent_bt_b, alternate_bt_b);
            // path.replaceWith(if_code)
            console.log("处理后的coding", generator(alternate_bt_if_code).code);

            consequent_bt_b_res = types.BlockStatement([consequent_if_code]);
            alternate_bt_b_res = types.BlockStatement([alternate_bt_if_code]);

            result_if_code = types.IfStatement(right_test, consequent_bt_b_res, alternate_bt_b_res);
            console.log("处理后的coding", generator(result_if_code).code);
            path.replaceWith(result_if_code)


        }
        else if(types.isConditionalExpression(exp.right) && types.isBinaryExpression(exp.right.test) && types.isNumericLiteral(exp.right.consequent)){
            /**
             * Si = Ei < 12 ? 12771 : Ae ? 3521 : 21761;
             * Si = Ei < 4 ? 193 : (E = x) ? 3170 : 16771;
             * @type {number|*|((string: string) => boolean)}
             */
            var test = exp.right.test;
            var leftNum = exp.right.consequent;
            // var rightNum = exp.right.alternate;

            if(types.isConditionalExpression(exp.right.alternate)){
                var if_code_mid = types.IfStatement(exp.right.alternate.test,
                    types.blockStatement(
                        [types.expressionStatement(
                            types.AssignmentExpression('=', exp.left, exp.right.alternate.consequent)
                            )]),
                    types.blockStatement(
                        [types.expressionStatement(
                            types.AssignmentExpression('=', exp.left, exp.right.alternate.alternate)
                        )])
                    );
            }

            var consequent_b = types.BlockStatement([
                types.expressionStatement(types.AssignmentExpression('=', exp.left, leftNum))

            ]);
            // var alternate_b = types.BlockStatement([
            //     types.expressionStatement(types.AssignmentExpression('=', exp.left, rightNum))
            // ]);
            var if_code = types.IfStatement(test, consequent_b, types.blockStatement([if_code_mid]));
            path.replaceWith(if_code)

        }
        else if(types.isConditionalExpression(exp.right) && types.isBinaryExpression(exp.right.test) && types.isNumericLiteral(exp.right.alternate)){
            /**
             * Si = Ei < 19 ? m.indexOf ? 12357 : 27808 : 11461;
             * @type {number|*|((string: string) => boolean)}
             */
            var test = exp.right.test;
            var leftNum = exp.right.alternate;
            // var rightNum = exp.right.alternate;

            if(types.isConditionalExpression(exp.right.consequent)){
                var if_code_mid = types.IfStatement(exp.right.consequent.test,
                    types.blockStatement(
                        [types.expressionStatement(
                            types.AssignmentExpression('=', exp.left, exp.right.consequent.consequent)
                            )]),
                    types.blockStatement(
                        [types.expressionStatement(
                            types.AssignmentExpression('=', exp.left, exp.right.consequent.alternate)
                        )])
                    );
            }

            var consequent_b = types.BlockStatement([
                types.expressionStatement(types.AssignmentExpression('=', exp.left, leftNum))

            ]);
            // var alternate_b = types.BlockStatement([
            //     types.expressionStatement(types.AssignmentExpression('=', exp.left, rightNum))
            // ]);
            var if_code = types.IfStatement(test,types.blockStatement([if_code_mid]),consequent_b);
            path.replaceWith(if_code)

        }

    }


}


exports.fix = three_to_if