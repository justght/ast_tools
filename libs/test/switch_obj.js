const generator = require("@babel/generator").default;
const types = require("@babel/types");
const cfun_call = require("../createNode/funCall");
const switch_obj = {
    ForStatement(path) {
        fix(path)
    }
}

/**
 *
 * @param path
 */

function fix(path) {
    const node = path.node;
    if (types.isBlockStatement(node.body)) {
        // 检测判断是否未for后var + switch的代码形式
        let flag = true;
        let _body = node.body.body
        let _cal_list = []
        for (var idx = 0; idx < _body.length; idx++) {
            if (types.isVariableDeclaration(_body[idx])) {
                _cal_list.push(_body[idx])
            } else {
                if (types.isSwitchStatement(_body[idx])) {
                    break
                } else {
                    flag = false
                    break
                }
            }
        }
        if (flag) {
            console.log("发现存在控制流混淆的代码片段")

            /**
             * 封装控制流控制器func
             *
             */

            let first_line = _cal_list[0]

            let args = null
            try {
                _cal_list.forEach(function (block) {
                    if (block.declarations[0].init !== null) {
                        if (types.isLiteral(block.declarations[0].init.right)) {
                            args = block.declarations[0].init.left;
                            throw new Error("ending");
                        } else if (types.isBinaryExpression(block.declarations[0].init.right)) {
                            args = block.declarations[0].init.right.left;
                            throw new Error("ending");
                        }

                    }
                })
            } catch (e) {
                if (e.message == "ending") {
                    console.log("结束了");
                } else {
                    console.log(e.message)
                }
            }

            if(args !== null){
                let _prop = []
                let _prop_names = []
                for (var ids = 0; ids < _cal_list.length; ids++) {
                    var _prop_name = _cal_list[ids].declarations[0].id.name;
                    _prop.push(types.objectProperty(types.stringLiteral(_prop_name), types.identifier(_prop_name)))
                    _prop_names.push(_prop_name)
                }
                let _ret = types.returnStatement(types.objectExpression(_prop));
                _cal_list.push(_ret)
                var get_param_func = types.expressionStatement(
                    types.callExpression(
                        types.functionExpression(
                            null,
                            [],
                            types.blockStatement(
                                [
                                    types.functionDeclaration(
                                        types.identifier('getparam'),
                                        [args],
                                        types.blockStatement(
                                            _cal_list
                                        )
                                    ),
                                    types.returnStatement(
                                        types.identifier('getparam')
                                    )
                                ]
                            )
                        ),
                        []
                    )
                )
                get_param_func = generator(get_param_func).code
                console.log(get_param_func);
                get_param_func = eval(get_param_func)
                let control_param = node.init.declarations;

                    let control_param_value = control_param[0].init.value;
                    console.log("控制器参数为 " + args.name + ", 且初始值为" + control_param_value);
                    var check_end = types.expressionStatement(
                        types.callExpression(
                            types.functionExpression(
                                null,
                                [],
                                types.blockStatement(
                                    [
                                        types.functionDeclaration(
                                            types.identifier('check_end'),
                                            [args],
                                            types.blockStatement(
                                                [types.returnStatement(node.test)]
                                            )
                                        ),
                                        types.returnStatement(
                                            types.identifier('check_end')
                                        )
                                    ]
                                )
                            ),
                            []
                        )
                    )
                    check_end = generator(check_end).code
                    console.log(check_end);
                    check_end = eval(check_end)
                    let control_struct_main = node.body.body[_cal_list.length - 1]


                var get_control_struct = function(ast){//这个是照着解析的流程分析得出的逻辑
                        if(types.isSwitchStatement(ast)){
                            let control_struct_obj = {};
                            if(_prop_names.indexOf(ast.discriminant.name) >= 0){
                                control_struct_obj.test_name = ast.discriminant.name;
                                control_struct_obj.block = {}

                                for (var idx = 0; idx < ast.cases.length; idx++) {
                                    var _control_struct = get_control_struct(ast.cases[idx])

                                    if (_control_struct.length === 2 && typeof _control_struct[1] === "object" && 'test_name' in _control_struct[1]) {
                                        if (_control_struct[1].test_name === control_struct_obj.test_name) {
                                            // 合并
                                            for (var key in _control_struct[1].block) {
                                                control_struct_obj.block[key] = _control_struct[1].block[key]
                                            }
                                        } else {
                                            // 父子 case的合并 {mi[0]:{"test_name":"A","block":["1":"coding"]}}
                                            control_struct_obj.block[ast.cases[idx].test.value] = _control_struct[1]
                                        }
                                    } else {
                                        control_struct_obj.block[ast.cases[idx].test.value] = _control_struct.slice(1)
                                    }
                                    // control_struct_obj.block[ast.cases[idx].test.value] = _control_struct[1]
                                }
                                return [true,control_struct_obj]//true感觉是一个合并的标记
                            }else{
                                // switch结构但并不是控制流
                                debugger
                            }

                        }
                        else if(types.isIfStatement(ast)){
                            let control_struct_obj = {};
                            if (types.isBinaryExpression(ast.test) && ((types.isIdentifier(ast.test.left) && _prop_names.indexOf(ast.test.left.name) >= 0) || (types.isIdentifier(ast.test.right) && _prop_names.indexOf(ast.test.right.name) >= 0))) {
                                let test_name = (types.isIdentifier(ast.test.left) && _prop_names.indexOf(ast.test.left.name) >= 0) ? ast.test.left.name : ast.test.right.name;
                                let codes = [];
                                control_struct_obj.test_name = test_name;
                                control_struct_obj.block = {}
                                let consequent_value_node = (types.isIdentifier(ast.test.left) && _prop_names.indexOf(ast.test.left.name) >= 0) ? ast.test.right : ast.test.left;
                                let consequent_value_op = ast.test.operator
                                if (consequent_value_op === "==") {
                                    var consequent_value = consequent_value_node.value
                                    var alternate_value = null;
                                } else if (consequent_value_op === ">") {
                                    if (types.isIdentifier(ast.test.left) && _prop_names.indexOf(ast.test.left.name) >= 0) {
                                        var consequent_value = consequent_value_node.value + 1
                                        var alternate_value = consequent_value_node.value - 1
                                    } else {
                                        var consequent_value = consequent_value_node.value - 1
                                        var alternate_value = consequent_value_node.value + 1
                                    }
                                } else {
                                    // if (types.isIdentifier(ast.test.right) && _prop_names.indexOf(ast.test.right.name) >= 0) {
                                    //     var consequent_value = consequent_value_node.value - 1
                                    //     var alternate_value = consequent_value_node.value + 1
                                    // } else {
                                    //     var consequent_value = consequent_value_node.value + 1
                                    //     var alternate_value = consequent_value_node.value - 1
                                    // }

                                    if (types.isIdentifier(ast.test.left) && _prop_names.indexOf(ast.test.left.name) >= 0) {
                                        var consequent_value = consequent_value_node.value - 1
                                        var alternate_value = consequent_value_node.value + 1
                                    } else {
                                        var consequent_value = consequent_value_node.value + 1
                                        var alternate_value = consequent_value_node.value - 1
                                    }
                                }
                                let consequent_control_struct = get_control_struct(ast.consequent);
                                if (consequent_control_struct[0]) {
                                    codes.push(true)//if的true和False的合并
                                    if (consequent_control_struct.length === 2 && typeof consequent_control_struct[1] === "object" && 'test_name' in consequent_control_struct[1]) {
                                        if (consequent_control_struct[1].test_name === test_name) {
                                            // 合并
                                            for (var key in consequent_control_struct[1].block) {
                                                control_struct_obj.block[key] = consequent_control_struct[1].block[key]
                                            }
                                        } else {
                                            // 父子 目前这个没用到
                                            control_struct_obj.block[consequent_value] = consequent_control_struct[1]
                                        }
                                    } else {//最底层代码locak
                                        control_struct_obj.block[consequent_value] = consequent_control_struct.slice(1)
                                    }
                                } else {
                                    codes.push(false)
                                    // debugger
                                }
                                if (ast.alternate !== null) {
                                    let alternate_control_struct = get_control_struct(ast.alternate);
                                    if (alternate_control_struct[0]) {
                                        codes[0] = true
                                        if (alternate_control_struct.length === 2 && typeof alternate_control_struct[1] === "object" && 'test_name' in alternate_control_struct[1]) {
                                            if (alternate_control_struct[1].test_name === test_name) {
                                                // 合并 if的true和else的结果合并
                                                for (var key in alternate_control_struct[1].block) {

                                                    control_struct_obj.block[key] = alternate_control_struct[1].block[key]
                                                }
                                            } else {
                                                // 父子 目前这个没用到
                                                control_struct_obj.block[alternate_value] = alternate_control_struct[1]
                                            }
                                        } else {//block的代码
                                            control_struct_obj.block[alternate_value] = alternate_control_struct.slice(1)
                                        }

                                    } else {
                                        debugger
                                    }
                                }

                                // debugger
                                codes.push(control_struct_obj)
                                return codes



                            }else{
                                return [true,ast]
                            }
                        }
                        else{
                            if(types.isSwitchCase(ast)){
                                let codes = [];
                                for (var idx = 0; idx < ast.consequent.length; idx++) {
                                    if (types.isBreakStatement(ast.consequent[idx])) {
                                        break;
                                    }
                                    if (types.isSwitchStatement(ast.consequent[idx])) {
                                        var _control_struct = get_control_struct(ast.consequent[idx])
                                        if (_control_struct[0]) {
                                            if (idx === 0) {
                                                codes.push(true)
                                            }
                                            for (var ids = 1; ids < _control_struct.length; ids++) {
                                                codes.push(_control_struct[ids])
                                            }
                                        } else {
                                            if (idx === 0) {
                                                codes.push(false)
                                            }
                                        }

                                    }else if(types.isIfStatement(ast.consequent[idx])){
                                        var _control_struct = get_control_struct(ast.consequent[idx])
                                        if (_control_struct[0]) {
                                            if (idx === 0) {
                                                codes.push(true)
                                            }
                                            for (var ids = 1; ids < _control_struct.length; ids++) {
                                                codes.push(_control_struct[ids])
                                            }
                                        } else {
                                            if (idx === 0) {
                                                codes.push(false)
                                            }
                                        }
                                    }else{
                                        if (idx === 0) {
                                            codes.push(true)
                                        }
                                        codes.push(ast.consequent[idx])
                                    }
                                }
                                return codes;

                            }
                            else if(types.isBlockStatement(ast)){
                                let codes = [];
                                for(var idx = 0;idx < ast.body.length;idx++){

                                    if (types.isBreakStatement(ast.body[idx])) {
                                        break;
                                    }
                                    if (types.isSwitchStatement(ast.body[idx])) {
                                        if (_control_struct[0]) {
                                            if (idx === 0) {
                                                codes.push(true)
                                            }
                                            for (var ids = 1; ids < _control_struct.length; ids++) {
                                                codes.push(_control_struct[ids])
                                            }

                                        } else {
                                            if (idx === 0) {
                                                codes.push(false)
                                            }
                                        }
                                    }
                                    else if(types.isIfStatement(ast.body[idx])){
                                        var _control_struct = get_control_struct(ast.body[idx])
                                        if (_control_struct[0]) {
                                            if (idx === 0) {
                                                codes.push(true)
                                            }
                                            for (var ids = 1; ids < _control_struct.length; ids++) {
                                                codes.push(_control_struct[ids])
                                            }
                                        } else {
                                            if (idx === 0) {
                                                codes.push(false)
                                            }
                                        }

                                    }else{
                                        if(idx === 0){
                                            codes.push(true);
                                        }
                                        codes.push(ast.body[idx])
                                    }

                                }
                                return codes;
                            }
                        }

                }


                let steps_hash_list = [];
                let bodys = [];
                let control_struct = get_control_struct(control_struct_main)
                control_struct = control_struct[1]
            }

        }
    }
}




exports.fix = switch_obj