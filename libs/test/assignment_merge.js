
const generator = require("@babel/generator").default;
const types = require("@babel/types");
const cfun_call = require("../createNode/funCall");
const assigmentMerge = {
    BlockStatement(path){
        fix(path,'block')
    },
    SwitchCase(path){
        fix(path,'switchcase')
    }

}


/**
 * G = "h", G += "eig", Q = Ye[G += "ht"] / 2
 * = >
 * G = "heig",
 * @param path
 */



function fix(path,tp){
    const node = path.node;

    if (tp == 'block') {
        const bodys = node.body;
        for (var i = 0; i < bodys.length; i++) {
            /**
             * if (0 == St) {
             *     G = Ye[Q] + be, be = 0 | G, G = "h", G += "eig", Q = Ye[G += "ht"] / 2, G = "\u028c", R = "", oe = 0, F = 0, Ct = 11012;
             * } else {
             *     St > 0 && (Ct = (B = 42 === o) ? 25313 : 11745);
             * }
             */

            body_em = bodys[i]
            if (types.isExpressionStatement(body_em) & types.isSequenceExpression(body_em.expression)) {//sequence 序列表达式
                assignments = body_em.expression.expressions;
                code_lines = [];
                var left_em = '';
                var flage = 0;
                var op = '='
                for (var j = 0; j < assignments.length; j++) {
                    assigment_em = assignments[j]

                    if (types.isIdentifier(assigment_em.left) & types.isStringLiteral(assigment_em.right)) {
                        if (code_lines.length == 0) {
                            code_lines.push(assigment_em.left.name)
                            left_em = assigment_em.left
                            op = assigment_em.operator;
                        }
                        if (assigment_em.left.name == code_lines[0]) {
                            code_lines.push(assigment_em.right.value);
                        } else {
                            break

                        }

                    } else {
                        if (code_lines.length > 0) {
                            flage = assignments.indexOf(assigment_em)
                            break
                        } else {
                            continue
                        }
                    }

                }
                if (code_lines.length > 0) {
                    right_v = code_lines.slice(1).join('');
                    assigments_re = types.assignmentExpression(op, left_em, types.stringLiteral(right_v))
                    assignments.splice(flage - (code_lines.length - 1), code_lines.length - 1, assigments_re)
                    test_result = []
                    assignments.forEach(function (block) {
                        test_result.push(generator(block).code);
                    })
                    console.log("处理后的coding", test_result);
                }


            }
        }
    }else if(tp=='switchcase'){
        /**
         * case 4:
         *           var S = "dnib";
         *           S = S.split("").reverse().join(""), C[m] = t[S](0, 42);
         *           var k = "cr";
         *           k += "eat", k += "e", k += "Dat", k += "aCh", C[k += "annel"]("");
         *           var j = "se";
         *           j += "tLoc", j += "alD", j += "escri";
         *           var x,
         *               O = "dn";
         *           O += "ib";
         *           var w = C[j += "ption"][O = O.split("").reverse().join("")](C),
         *               y = "\x88\xfa\x9f\xfe\x8a\xef\xa0\xc6\xa0\xc5\xb7",
         *               E = "",
         *               R = 0,
         *               _ = 0;
         *           r = 448;
         *           break;
         */

        const conseqs = node.consequent;
        for(var i=0;i<conseqs.length;i++){
            conseqs_em = conseqs[i]
            if(!types.isExpressionStatement(conseqs_em) || !types.isSequenceExpression(conseqs_em.expression)){
                continue
            }

            if(types.isExpressionStatement(conseqs_em) & conseqs_em.expression.expressions.length > 1){
                assignments = conseqs_em.expression.expressions;
                code_lines = [];
                var left_em = '';
                var flage = 0;
                var op = '='
                for (var j = 0; j < assignments.length; j++) {
                    assigment_em = assignments[j]

                    if (types.isIdentifier(assigment_em.left) & types.isStringLiteral(assigment_em.right)) {
                        if (code_lines.length == 0) {
                            code_lines.push(assigment_em.left.name)
                            left_em = assigment_em.left
                            op = assigment_em.operator;
                        }
                        if (assigment_em.left.name == code_lines[0]) {
                            code_lines.push(assigment_em.right.value);
                        } else {
                            break

                        }

                    } else {
                        if (code_lines.length > 0) {
                            flage = assignments.indexOf(assigment_em)
                            break
                        } else {
                            continue
                        }
                    }

                }
                if (code_lines.length > 0) {
                    right_v = code_lines.slice(1).join('');
                    assigments_re = types.assignmentExpression(op, left_em, types.stringLiteral(right_v))
                    assignments.splice(flage - (code_lines.length - 1), code_lines.length - 1, assigments_re)
                    test_result = []
                    assignments.forEach(function (block) {
                        test_result.push(generator(block).code);
                    })
                    console.log("处理后的coding", test_result);
                }
            }
        }
    }


}



exports.fix = assigmentMerge