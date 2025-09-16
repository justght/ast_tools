
const generator = require("@babel/generator").default;
const types = require("@babel/types");
const cfun_call = require("../createNode/funCall");
const void_to_func = {
    ExpressionStatement(path){
        fix(path)
    }
}


/**
 * void(**) => !function(){**}()
 * @param path
 */

function fix(path){
    const node = path.node;
    const expression = node.expression;
    if(expression.operator == "void"){

        const argument = expression.argument;
        const argument_type = argument.type;
        if(argument_type == "ConditionalExpression"){
            // console.log("对应的整体的三元表达式",generator(argument).code)

            fun_call_node = cfun_call(types.ExpressionStatement(argument));
            path.replaceWith(fun_call_node);
            // path.replaceWith(argument);
            // path.replaceWith(types.create_if(types.create_number(0), argument, types.create_number(0)));
        }
    }
}



exports.fix = void_to_func