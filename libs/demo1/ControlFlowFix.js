/*****************************************************
 *
 *
 * Author:  sml2h3
 * Date:    2021-06-09
 * File:    ControlFlowFix
 * Project: ast_tools
 *****************************************************/

const md5 = require('md5-node');
const types = require("@babel/types");
const generator = require("@babel/generator").default;
const traverse_express = {
    ForStatement(path) {
        fix(path)
    }
}

function fix(path) {
    const node = path.node;
    const scope = path.scope;
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
            let args = types.isIdentifier(first_line.declarations[0].init.left) ? first_line.declarations[0].init.left : types.isIdentifier(first_line.declarations[0].init.right) ? first_line.declarations[0].init.right : null;

            if (args !== null) {


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
                if (control_param.length === 1) {
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
                    //get_control_struct 是 ControlFlowFix 中负责收集控制流结构的核心函数
                    var get_control_struct = function (ast) {
                        if (types.isSwitchStatement(ast)) {
                            let control_struct_obj = {};
                            if (_prop_names.indexOf(ast.discriminant.name) >= 0) {
                                control_struct_obj.test_name = ast.discriminant.name;
                                control_struct_obj.block = {}
                                let codes = [];
                                for (var idx = 0; idx < ast.cases.length; idx++) {
                                    var _control_struct = get_control_struct(ast.cases[idx])

                                    if (_control_struct.length === 2 && typeof _control_struct[1] === "object" && 'test_name' in _control_struct[1]) {
                                        if (_control_struct[1].test_name === control_struct_obj.test_name) {
                                            // 合并
                                            for (var key in _control_struct[1].block) {
                                                control_struct_obj.block[key] = _control_struct[1].block[key]
                                            }
                                        } else {
                                            // 父子
                                            control_struct_obj.block[ast.cases[idx].test.value] = _control_struct[1]
                                        }
                                    } else {
                                        control_struct_obj.block[ast.cases[idx].test.value] = _control_struct.slice(1)
                                    }


                                    // control_struct_obj.block[ast.cases[idx].test.value] = _control_struct[1]
                                }

                                // codes.push(true)


                                return [true, control_struct_obj]//一个SwitchStatement 跑完了
                            } else {
                                // switch结构但并不是控制流
                                //debugger
                            }

                        } else if (types.isIfStatement(ast)) {
                            let control_struct_obj = {};
                            if (types.isBinaryExpression(ast.test) && 
                            (
                                (types.isIdentifier(ast.test.left) && _prop_names.indexOf(ast.test.left.name) >= 0) || 
                                (types.isIdentifier(ast.test.right) && _prop_names.indexOf(ast.test.right.name) >= 0)
                            )
                            ) {
                                let test_name = (
                                    types.isIdentifier(ast.test.left) && _prop_names.indexOf(ast.test.left.name) >= 0)
                                     ? ast.test.left.name : ast.test.right.name;
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
                                    if (types.isIdentifier(ast.test.right) && _prop_names.indexOf(ast.test.right.name) >= 0) {
                                        var consequent_value = consequent_value_node.value - 1
                                        var alternate_value = consequent_value_node.value + 1
                                    } else {
                                        var consequent_value = consequent_value_node.value + 1
                                        var alternate_value = consequent_value_node.value - 1
                                    }
                                }
                                let consequent_control_struct = get_control_struct(ast.consequent);
                                if (consequent_control_struct[0]) {
                                    codes.push(true)
                                    if (consequent_control_struct.length === 2 && typeof consequent_control_struct[1] === "object" && 'test_name' in consequent_control_struct[1]) {
                                        if (consequent_control_struct[1].test_name === test_name) {
                                            // 合并
                                            for (var key in consequent_control_struct[1].block) {
                                                control_struct_obj.block[key] = consequent_control_struct[1].block[key]
                                            }
                                        } else {
                                            // 父子
                                            control_struct_obj.block[consequent_value] = consequent_control_struct[1]
                                        }
                                    } else {
                                        control_struct_obj.block[consequent_value] = consequent_control_struct.slice(1)
                                    }
                                } else {
                                    codes.push(false)
                                    // //debugger
                                }
                                if (ast.alternate !== null) {
                                    let alternate_control_struct = get_control_struct(ast.alternate);
                                    if (alternate_control_struct[0]) {
                                        codes[0] = true
                                        if (alternate_control_struct.length === 2 && typeof alternate_control_struct[1] === "object" && 'test_name' in alternate_control_struct[1]) {
                                            if (alternate_control_struct[1].test_name === test_name) {
                                                // 合并
                                                for (var key in alternate_control_struct[1].block) {

                                                    control_struct_obj.block[key] = alternate_control_struct[1].block[key]
                                                }
                                            } else {
                                                // 父子
                                                control_struct_obj.block[alternate_value] = alternate_control_struct[1]
                                            }
                                        } else {
                                            control_struct_obj.block[alternate_value] = alternate_control_struct.slice(1)
                                        }

                                    } else {
                                        //debugger
                                    }
                                }

                                // //debugger
                                codes.push(control_struct_obj)
                                return codes
                            } else {
                                return [true, ast]
                            }
                        } else {
                            // SwitchCase
                            // //debugger
                            if (types.isSwitchCase(ast)) {
                                let codes = []
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
                                    } else if (types.isIfStatement(ast.consequent[idx])) {
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
                                    } else {
                                        if (idx === 0) {
                                            codes.push(true)
                                        }
                                        codes.push(ast.consequent[idx])
                                    }
                                }
                                return codes;
                            } else if (types.isBlockStatement(ast)) {
                                let codes = []
                                for (var idx = 0; idx < ast.body.length; idx++) {
                                    if (types.isBreakStatement(ast.body[idx])) {
                                        break;
                                    }
                                    if (types.isSwitchStatement(ast.body[idx])) {
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
                                    } else if (types.isIfStatement(ast.body[idx])) {
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

                                    } else {
                                        if (idx === 0) {
                                            codes.push(true)
                                        }
                                        codes.push(ast.body[idx])
                                    }
                                }
                                return codes
                            }
                        }
                    }
                    let steps_hash_list = []
                    let bodys = []
                    const get_next_control_param = function (ast_list) {
                        let next_node = ast_list[ast_list.length - 1]
                        let res = []
                        if (types.isIfStatement(next_node)) {
                            res.push('if')
                            if (next_node.consequent !== null) {
                                if (next_node.consequent.body.length > 1) {
                                    //debugger
                                }
                                res.push(next_node.consequent.body[0].expression.right.value)
                            }
                            if (next_node.alternate !== null) {
                                if (next_node.alternate.body.length > 1) {
                                    //debugger
                                }
                                res.push(next_node.alternate.body[0].expression.right.value)
                            }
                        } else if (types.isExpressionStatement(next_node) && types.isAssignmentExpression(next_node.expression)) {
                            res.push('common')
                            if (types.isUnaryExpression(next_node.expression.right)) {
                                res.push(void next_node.expression.right.argument.value)
                            } else {
                                res.push(next_node.expression.right.value)
                            }

                        } else if (types.isReturnStatement(next_node)) {
                            res.push('return')
                        } else {
                            //debugger
                        }
                        return res
                    }
                    let control_struct = get_control_struct(control_struct_main)
                    control_struct = control_struct[1]

                    //get_code 是 ControlFlowFix 中负责推平控制流的核心函数。它通过动态执行模拟，分析控制流图（由 get_control_struct 生成），将复杂的 switch 或 if 分支还原为标准控制结构（如顺序语句、if-else 或 while 循环）。
                    const get_code = function (
                        control_struct,//整个的代码字典
                        control_param_value,//初始的一个值
                        last_res_list = [],//历史执行过的代码数组
                        is_alter = false,//是否执行false分支
                        alternate_node = null,//fasle节点
                        stack = [],//执行true时收集的false堆栈，有对应的true节点
                        res_list = [],//当前true执行的代码数组
                        get_first = false,
                        next_node = null,
                        while_break_next_node = null) {
                            while (true) {
        // 内层循环：处理当前控制参数值的执行路径
        while (control_param_value !== undefined) {
            // 根据上次的控制参数计算出本次控制参数，并取到对应block
            var control_param_value_bak = null;//表示当前状态机的控制参数值（如 i 或 param.state），驱动状态跳转，决定执行哪个分支。
            let param = get_param_func(control_param_value)
            let control_struct_step = control_struct;
            let test_name_step = control_struct_step.test_name;
            while (true) {
                // 递归查找分支，直到找到具体语句列表
                control_struct_step = control_struct_step.block[param[test_name_step]]
                if (typeof control_struct_step.length === "undefined") {
                    test_name_step = control_struct_step.test_name;
                } else {
                    break
                }
            }
            //提取下一控制参数和分支类型
            let control_param_value_list = get_next_control_param(control_struct_step)//[if,11490,13829]
            let type = control_param_value_list[0]
            if (type === 'common') {
                if (!is_alter) {
                    for (let idx = 0; idx < control_struct_step.length - 1; idx++) {
                        res_list.push(control_struct_step[idx])
                    }
                    control_param_value = control_param_value_list[1]
                } else {
                    var start_idx = last_res_list.lastIndexOf(alternate_node)
                    var tem_flag = false
                    for (let idx = 0; idx < control_struct_step.length - 1; idx++) {
                        if (last_res_list.lastIndexOf(control_struct_step[idx]) >= 0 &&
                            last_res_list.lastIndexOf(control_struct_step[idx]) > start_idx) {
                            res_list.push(control_struct_step[idx])
                            tem_flag = true//是否合并代码的一个标签
                            break
                        }
                        else if (while_break_next_node) {
                            if (control_struct_step[idx] === while_break_next_node[0][0] ||
                                control_struct_step[idx] === while_break_next_node[1][0]) {
                                // res_list.push(control_struct_step[idx])
                                tem_flag = true
                                break
                            } else {
                                res_list.push(control_struct_step[idx])
                            }
                        }
                        else if (next_node) {
                            if (control_struct_step[idx] === next_node[0]) {
                                // res_list.push(control_struct_step[idx])
                                tem_flag = true
                                break
                            } else {
                                res_list.push(control_struct_step[idx])
                            }
                        }
                        else {
                            res_list.push(control_struct_step[idx])
                        }


                    }
                    if (tem_flag) {
                        control_param_value_bak = control_param_value_list[1]//获取到true的值
                        control_param_value = undefined
                    } else {
                        control_param_value = control_param_value_list[1]
                    }

                }

            }
            else if (type === "if") {
                if (!is_alter) {
                    let consequent_value = control_param_value_list[1]
                    let alternate_value = control_param_value_list[2]
                    for (let idx = 0; idx < control_struct_step.length - 1; idx++) {
                        res_list.push(control_struct_step[idx])
                    }
                    let index = res_list.lastIndexOf(control_struct_step[control_struct_step.length - 1])
                    let index2 = last_res_list.lastIndexOf(control_struct_step[control_struct_step.length - 1])
                    if (index > -1 || index2 > -1) {
                        if (index > -1) {//当前res_list中是否已经执行过，就不再继续执行true的分支初始值，转而执行false分支初始值
                            res_list.push(control_struct_step[control_struct_step.length - 1])
                            control_param_value = alternate_value
                        }
                        if (index2 > -1) {
                            res_list.push(control_struct_step[control_struct_step.length - 1])
                            break
                        }

                    }
                    else {
                        // if
                        if (next_node && control_struct_step[control_struct_step.length - 1] === next_node[0]) {
                            control_param_value = undefined
                        } else {//如果当前和历史都没有执行过，（添加到res_list中）说明这个分支没有遍历完全，在stack中加入这个if-else
                            res_list.push(control_struct_step[control_struct_step.length - 1])
                            stack.push([control_struct_step[control_struct_step.length - 1], alternate_value])//stack=[if_node,alternate_value=]
                            control_param_value = consequent_value
                        }
                    }
                }
                else {
                    var start_idx = last_res_list.lastIndexOf(alternate_node)//历史执行结果中是否存在
                    var tem_flag = false
                    let consequent_value = control_param_value_list[1]//8964 下一个true分支
                    let alternate_value = control_param_value_list[2]//22 下一个false分支
                    for (let idx = 0; idx < control_struct_step.length - 1; idx++) {//control_struct_step 的每一行代码 在 start_idx 后执行有没有重复的
                        if (last_res_list.lastIndexOf(control_struct_step[idx]) >= 0 &&
                            last_res_list.lastIndexOf(control_struct_step[idx]) > start_idx) {
                            res_list.push(control_struct_step[idx])
                            tem_flag = true
                            break
                        }
                        else if (while_break_next_node) {
                            if (control_struct_step[idx] === while_break_next_node[0][0] ||
                                control_struct_step[idx] === while_break_next_node[1][0])
                            {
                                // res_list.push(control_struct_step[idx])
                                if (control_struct_step[idx] === while_break_next_node[1][0] &&
                                    control_struct_step[idx] !== next_node[0])
                                {
                                    res_list.push(types.breakStatement(null))
                                }
                                tem_flag = true
                                break
                            }
                            else {
                                res_list.push(control_struct_step[idx])
                            }
                        }
                        else if (next_node) {
                            if (control_struct_step[idx] === next_node[0]) {
                                // res_list.push(control_struct_step[idx])
                                tem_flag = true
                                break
                            } else {
                                res_list.push(control_struct_step[idx])
                            }
                        }
                        else {
                            res_list.push(control_struct_step[idx])
                        }
                    }
                    if (tem_flag) {
                        control_param_value_bak = control_param_value_list[1]
                        control_param_value = undefined
                    } else {//存在没有覆盖的情况，继续
                        var tests = control_struct_step[control_struct_step.length - 1].test;
                        for (var for_idx = 0; for_idx < last_res_list.length; for_idx++) {//
                            if (last_res_list[for_idx].type === "IfStatement") {
                                if (tests.start === last_res_list[for_idx].test.start &&
                                    tests.end === last_res_list[for_idx].test.end && for_idx > start_idx) {
                                    res_list.push(control_struct_step[control_struct_step.length - 1])
                                    tem_flag = true
                                    break
                                }
                            }
                            if (last_res_list[for_idx].type === "WhileStatement") {
                                if (tests.start === last_res_list[for_idx].test.start && tests.end === last_res_list[for_idx].test.end && last_res_list[for_idx - 1].test === alternate_node.test) {
                                    res_list.push(control_struct_step[control_struct_step.length - 1])
                                    tem_flag = true
                                    break
                                }
                            }
                        }
                        if (tem_flag) {
                            control_param_value_bak = control_param_value_list[1]
                            control_param_value = undefined//强制退出循环
                        } else {
                            let index = res_list.lastIndexOf(control_struct_step[control_struct_step.length - 1])
                            let index2 = last_res_list.lastIndexOf(control_struct_step[control_struct_step.length - 1])
                            if (index > -1 || index2 > -1) {
                                if (index > -1) {
                                    res_list.push(control_struct_step[control_struct_step.length - 1])
                                    control_param_value = alternate_value
                                }
                                if (index2 > -1) {
                                    res_list.push(control_struct_step[control_struct_step.length - 1])
                                    break
                                }

                            } else {
                                // if 当前和历史都没有执行过

                                if (next_node && control_struct_step[control_struct_step.length - 1] === next_node[0]) {
                                    control_param_value = undefined
                                    res_list.push(control_struct_step[control_struct_step.length - 1])
                                } else {
                                    res_list.push(control_struct_step[control_struct_step.length - 1])
                                    stack.push([control_struct_step[control_struct_step.length - 1], alternate_value])
                                    control_param_value = consequent_value
                                }


                            }
                        }
                    }


                }

            }
            else if (type === 'return') {//正常执行，然后退出循环
                for (let idx = 0; idx < control_struct_step.length; idx++) {
                    res_list.push(control_struct_step[idx])
                }
                break
            }
            if (!check_end(control_param_value)) {
                break
            }
            if (get_first) {
                control_param_value = undefined
                stack = []
                break
            }
        }

        control_param_value = undefined

        if (stack.length > 0) {
            let alternate_node = stack.pop()
            let alternate_node_bak = alternate_node
            let alternate_value = alternate_node[1]
            //control_param_value_bak 有优化的怀疑
            if (control_param_value_bak) {
                // debugger   "if (ve[Ne]) {\n  li = 1380;\n} else {\n  li = 21730;\n}",//<==21730
                var next_node2 = get_code(
                    control_struct,
                    control_param_value_bak, //特殊情况的一个值23107,在true的流程里已经存在，就只记录next的紧挨着的代码
                    res_list,
                    is_alter,
                    null,
                    [],
                    [],
                    true)//优化的部分，在res_list中存在，就在执行一次，只获取第一个执行的代码行
            }
            else {
                var next_node2 = null
            }

            if (next_node2 &&
                next_node2.length > 0 && types.isIfStatement(next_node2[0]) &&
                last_res_list.lastIndexOf(next_node2[0]) >= 0 &&
                last_res_list.lastIndexOf(next_node2[0],last_res_list.lastIndexOf(next_node2[0]) - 1) >= 0) {
                debugger;//  "if (I < M.length) {\n  li = 12067;\n} else {\n  li = 21986;\n}",
                var while_break_next_node2 = [
                    get_code(
                        control_struct,
                        next_node2[0].consequent.body[0].expression.right.value,//true的真值
                        res_list, is_alter,
                        null,
                        [],
                        [],
                        true),//如果last_res_list里存在，就只看第一行代码
                    get_code(
                        control_struct,
                        next_node2[0].alternate.body[0].expression.right.value,//false的假值
                        res_list,
                        is_alter,
                        null,
                        [],
                        [],
                        true)]
            }
            else {
                var while_break_next_node2 = null;
            }


            alternate_node = alternate_node[0]
            if(alternate_value==21730){debugger}
            let alternate_list = get_code(
                control_struct,
                alternate_value, //false分支的一个值
                res_list,
                true,
                alternate_node,
                [],
                [],
                false,
                next_node2 ?
                    types.isIfStatement(next_node2[0]) ?
                        next_node2 : next_node : next_node,
                while_break_next_node2 ?
                    while_break_next_node2 : while_break_next_node)


            let alternate_block = []//false_block
            for (var idx = 0; idx < alternate_list.length; idx++) {
                alternate_block.push(alternate_list[idx])
            }


            let consequent_block = []
            //执行过2次
            if (res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1) >= 0 &&//前面有多个相同的if-else
                res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1) !== res_list.lastIndexOf(alternate_node)//感觉这个判断有点多余
            ) {//while
                var last2whilestart = res_list[res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1) + 1]
                if (res_list.lastIndexOf(res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1),
                    res_list.lastIndexOf(last2whilestart) - 1) > -1) {
                    // do while 上面的判断目前感觉有些问题
                    // 先处理内部stack
                    if (stack.length > 0) {
                        // 先处理
                        stack = [alternate_node_bak].concat(stack)
                        res_list.splice(res_list.lastIndexOf(last2whilestart) + 1, res_list.lastIndexOf(alternate_node) - res_list.lastIndexOf(last2whilestart) - 1)
                    } else {
                        for (var idx2 = res_list.lastIndexOf(last2whilestart, res_list.lastIndexOf(last2whilestart) - 1); idx2 < res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1); idx2++) {
                            consequent_block.push(res_list[idx2])
                        }
                        res_list.splice(res_list.lastIndexOf(last2whilestart, res_list.lastIndexOf(last2whilestart) - 1), 0, types.doWhileStatement(alternate_node.test, types.blockStatement(consequent_block)))
                        res_list.splice(res_list.lastIndexOf(last2whilestart, res_list.lastIndexOf(last2whilestart) - 1), res_list.lastIndexOf(last2whilestart) + 2 - res_list.lastIndexOf(last2whilestart, res_list.lastIndexOf(last2whilestart) - 1))
                    }

                }
                else {
                    /**
                     *while(true){
                     *     xxxx
                     *     if(xxx){
                     *
                     *     }else{
                     *         break
                     *     }
                     *}
                     *
                     */
                    var is_other_while = false
                    var diff_idx = 0;
                    var top_idx = 0
                    let new_idx = res_list.lastIndexOf(alternate_node)
                    let old_idx = res_list.lastIndexOf(alternate_node, new_idx - 1)
                    if (old_idx > 2) {//判断false执行的每一行代码在之前的之前有没有出现过，有则存在别的while
                        for (var up_count = 0; up_count < (new_idx - old_idx); up_count++) {
                            if (res_list.lastIndexOf(res_list[new_idx - up_count - 1], old_idx - 1) > -1) {//有一个===判断在里面
                                is_other_while = true
                                diff_idx = up_count + 1
                                top_idx = res_list.lastIndexOf(res_list[new_idx - up_count - 1], old_idx - 1)
                            }
                        }
                    }

                    if (is_other_while) {//存在别的while
                        // debugger;
                        for (var idx2 = 0; idx2 < (old_idx - top_idx); idx2++) {
                            consequent_block.push(res_list[top_idx + idx2])
                        }
                        let consequent2_block = []
                        for (var idx2 = 0; idx2 < (res_list.lastIndexOf(res_list[top_idx]) - old_idx) - 1; idx2++) {
                            consequent2_block.push(res_list[old_idx + idx2 + 1])
                        }
                        if (stack.length > 0) {
                            var tmp_stack = []
                            for (var stack_idx = stack.length - 1; stack_idx >= 0; stack_idx--) {
                                if (consequent2_block.indexOf(stack[stack_idx][0]) >= 0) {
                                    tmp_stack.push(stack.pop())
                                }
                            }
                            if (tmp_stack.length > 0) {
                                debugger;
                                tmp_stack.reverse()
                                consequent2_block = get_code(
                                    control_struct,
                                    control_param_value,
                                    res_list,//历史执行路径的AST节点列表
                                    is_alter,
                                    null,
                                    tmp_stack,
                                    consequent2_block//相当于true执行的结果
                                )
                            }

                            var tmp_stack = []
                            for (var stack_idx = stack.length - 1; stack_idx >= 0; stack_idx--) {
                                if (consequent_block.indexOf(stack[stack_idx][0]) >= 0) {
                                    tmp_stack.push(stack.pop())
                                } else {
                                    break
                                }
                            }
                            if (tmp_stack.length > 0) {
                                // debugger
                                tmp_stack.reverse()
                                consequent_block = get_code(
                                    control_struct,
                                    control_param_value,
                                    res_list,
                                    is_alter,
                                    null,
                                    tmp_stack,
                                    consequent_block)
                            }
                        }

                        consequent_block.push(types.ifStatement(
                            alternate_node.test,
                            types.blockStatement(consequent2_block),
                            types.blockStatement([types.breakStatement()])
                        ))
                        res_list.splice(top_idx, 0, types.whileStatement(types.booleanLiteral(true), types.blockStatement(consequent_block)))
                        res_list.splice(top_idx + 1, new_idx - top_idx + 1)
                    }
                    else {//过
                        // while 普通的while循环 过 "if (In > 0) {\n  li = 17664;\n} else {\n  li = 22561;\n}",
                        for (var idx2 = res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1) + 1;
                             idx2 < res_list.length; idx2++) {
                            if (res_list[idx2] === alternate_node) {
                                break
                            }
                            consequent_block.push(res_list[idx2])
                        }
                        res_list.splice(res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1),
                            0, types.whileStatement(alternate_node.test, types.blockStatement(consequent_block)))
                        res_list.splice(res_list.indexOf(alternate_node),
                            res_list.lastIndexOf(alternate_node) - res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1) + 1)
                    }


                }


            }
            else {//if-else
                //过 划分出 true和false的代码块
                for (var idx2 = res_list.lastIndexOf(alternate_node) + 1; idx2 < res_list.length; idx2++) {
                    if (res_list[idx2] === alternate_node) {
                        break
                    }
                    consequent_block.push(res_list[idx2])
                }
                let flag = false;
                res_list.splice(res_list.lastIndexOf(alternate_node), res_list.length - res_list.lastIndexOf(alternate_node) + 1)
                for (var consequent_id = 0; consequent_id < consequent_block.length; consequent_id++) {
                    let tmp = consequent_block[consequent_id]
                    if (types.isWhileStatement(tmp)) {
                        for (var alternate_id = 0; alternate_id < alternate_block.length; alternate_id++) {
                            if (types.isWhileStatement(alternate_block[alternate_id])) {
                                if (tmp.test.start == alternate_block[alternate_id].test.start && tmp.test.end == alternate_block[alternate_id].test.end) {
                                    flag = true
                                    break
                                }
                            }
                        }
                        if (flag) {
                            break
                        }
                    }
                    else if (types.isIfStatement(tmp)) {
                        for (var alternate_id = 0; alternate_id < alternate_block.length; alternate_id++) {
                            if (types.isIfStatement(alternate_block[alternate_id])) {
                                if (tmp.test.start == alternate_block[alternate_id].test.start && tmp.test.end == alternate_block[alternate_id].test.end) {
                                    flag = true
                                    break
                                }
                            }
                        }
                        if (flag) {
                            break
                        }
                    }
                    else {//common
                        for (var alternate_id = 0; alternate_id < alternate_block.length; alternate_id++) {
                            if (alternate_block[alternate_id] === tmp) {
                                flag = true
                                break
                            }
                        }
                        if (flag) {
                            break
                        }
                    }
                }
                //存在重叠
                if (flag) {
                    // if分支合并 过
                    let body = []
                    if (consequent_id === 0) {

                    } else {
                        for (let id = 0; id < consequent_id; id++) {
                            body.push(consequent_block[id])
                        }

                    }
                    let consequent = types.blockStatement(body)
                    body = []
                    if (alternate_id === 0) {

                    } else {
                        for (let id = 0; id < alternate_id; id++) {
                            body.push(alternate_block[id])
                        }

                    }
                    let alternate = types.blockStatement(body)
                    res_list.push(
                        types.ifStatement(
                            alternate_node.test,//false作为
                            consequent,
                            alternate
                        )
                    )
                    for (let id = consequent_id; id < consequent_block.length; id++) {
                        res_list.push(consequent_block[id])//因为true和false走到了一起，所以依据true为基准进行执行
                    }
                }
                else {
                    /*$$$
                    * 需要判断consequent_block 和 alternate_block 最后一行代码是否是if-else,是否需要继续执行
                    *
                    * */
                    var is_break = true
                    if (types.isIfStatement(consequent_block[consequent_block.length - 1])) {
                        is_break = false
                    }
                    if (is_break && types.isIfStatement(alternate_block[alternate_block.length - 1]) &&
                        res_list.lastIndexOf(alternate_block[alternate_block.length - 1]) >= 0)//是否在res_list中存在
                    {
                        debugger;
                        //consequent_block 与 alternate_block 不存在重叠，但是alternate_block.length -1 的if-else又在res_list中
                        let while_alternate = get_code(
                            control_struct,
                            alternate_block[alternate_block.length - 1].alternate.body[0].expression.right.value,
                            consequent_block,//作为历史执行路径的ast节点列表
                            is_alter,
                            null,
                            [],
                            [],
                            true)//get_first有点优化的意思
                        if (while_alternate[0] !== consequent_block[0]) {
                            let body = []
                            for (let id = 0; id < consequent_block.length; id++) {
                                if (while_alternate[0] === consequent_block[id]) {
                                    break
                                }
                                if (types.isIfStatement(while_alternate[0]) &&
                                    while_alternate[0].test === consequent_block[id].test) {
                                    break
                                }
                                if (types.isWhileStatement(while_alternate[0]) &&
                                    while_alternate[0].test === consequent_block[id].test) {
                                    break
                                }
                                body.push(consequent_block[id])
                            }
                            body.push(types.breakStatement(null))
                            var consequent_s = types.blockStatement(body)

                        }
                        else {
                            var consequent_s = types.blockStatement([types.breakStatement(null)])
                        }

                        var alternate_s = types.blockStatement([])
                        res_list.push(
                            types.ifStatement(
                                alternate_node.test,
                                consequent_s,
                                alternate_s
                            )
                        )
                        for (let id = 0; id < alternate_block.length; id++) {
                            res_list.push(alternate_block[id])
                        }
                        if (while_alternate[0] !== consequent_block[0]) {
                            //有一个break 所以 -2
                            for (let id = consequent_block.lastIndexOf(consequent_s.body[consequent_s.body.length - 2]) + 1;
                                 id < consequent_block.length; id++) {
                                res_list.push(consequent_block[id])
                            }

                        }
                        else {
                            for (let id = 0; id < consequent_block.length; id++) {
                                res_list.push(consequent_block[id])
                            }
                        }

                    }
                    else {
                        let body = []
                        for (let id = 0; id < consequent_block.length; id++) {
                            body.push(consequent_block[id])
                        }
                        var consequent_s = types.blockStatement(body)

                        var is_break = true
                        if (types.isIfStatement(alternate_block[alternate_block.length - 1])) {
                            is_break = false
                        }
                        if (is_break &&
                            types.isIfStatement(consequent_block[consequent_block.length - 1]) &&
                            res_list.lastIndexOf(consequent_block[consequent_block.length - 1],
                                res_list.lastIndexOf(consequent_block[consequent_block.length - 1]) - 1) >= 0)
                        {
                            debugger;
                            let while_alternate = get_code(
                                control_struct,
                                consequent_block[consequent_block.length - 1].alternate.body[0].expression.right.value,
                                alternate_block,
                                is_alter,
                                null,
                                [],
                                [],
                                true)
                            if (while_alternate[0] !== alternate_block[0]) {
                                let body = []
                                for (let id = 0; id < alternate_block.length; id++) {
                                    body.push(alternate_block[id])
                                }
                                body.push(types.breakStatement(null))
                                var alternate_s = types.blockStatement(body)
                            } else {
                                var alternate_s = types.blockStatement([types.breakStatement(null)])
                            }
                            var consequent_s = types.blockStatement([])
                            // res_list.splice(res_list.lastIndexOf(alternate_node))
                            res_list.push(
                                types.ifStatement(
                                    alternate_node.test,
                                    consequent_s,
                                    alternate_s
                                )
                            )
                            for (let id = 0; id < consequent_block.length; id++) {
                                res_list.push(consequent_block[id])
                            }
                            if (while_alternate[0] !== alternate_block[0]) {
                                for (let id = alternate_block.lastIndexOf(alternate_s.body[alternate_s.body.length - 2]) + 1; id < alternate_block.length; id++) {
                                    res_list.push(alternate_block[id])
                                }

                            } else {
                                for (let id = 0; id < alternate_block.length; id++) {
                                    res_list.push(alternate_block[id])
                                }
                            }
                        }
                        else {//过
                            let body = []

                            for (let id = 0; id < alternate_block.length; id++) {
                                body.push(alternate_block[id])
                            }
                            let alternate_s = types.blockStatement(body)

                            if (types.isBreakStatement(consequent_s.body[consequent_s.body.length - 1])) {
                                // consequent最后一条是break
                                res_list.push(
                                    types.ifStatement(
                                        alternate_node.test,
                                        consequent_s,
                                        types.blockStatement([])
                                    )
                                )
                                for (let id_tmp = 0; id_tmp < alternate_s.body.length; id_tmp++) {
                                    res_list.push(alternate_s.body[id_tmp])
                                }
                            }
                            else if (types.isBreakStatement(alternate_s.body[alternate_s.body.length - 1])) {
                                // consequent最后一条是break
                                res_list.push(
                                    types.ifStatement(
                                        alternate_node.test,
                                        types.blockStatement([]),
                                        alternate_s
                                    )
                                )
                                for (let id_tmp = 0; id_tmp < consequent_s.body.length; id_tmp++) {
                                    res_list.push(consequent_s.body[id_tmp])
                                }
                            }
                            else if (types.isReturnStatement(consequent_s.body[consequent_s.body.length - 1])) {
                                // consequent最后一条是break
                                res_list.push(
                                    types.ifStatement(
                                        alternate_node.test,
                                        consequent_s,
                                        types.blockStatement([])
                                    )
                                )
                                for (let id_tmp = 0; id_tmp < alternate_s.body.length; id_tmp++) {
                                    res_list.push(alternate_s.body[id_tmp])
                                }
                            }
                            else if (types.isReturnStatement(alternate_s.body[alternate_s.body.length - 1])) {
                                // consequent最后一条是break
                                res_list.push(
                                    types.ifStatement(
                                        alternate_node.test,
                                        types.blockStatement([]),
                                        alternate_s
                                    )
                                )
                                for (let id_tmp = 0; id_tmp < consequent_s.body.length; id_tmp++) {
                                    res_list.push(consequent_s.body[id_tmp])
                                }
                            }
                            else {
                                res_list.push(
                                    types.ifStatement(
                                        alternate_node.test,
                                        consequent_s,
                                        alternate_s
                                    )
                                )
                            }

                        }
                    }
                }
            }
        }
        else {
            break
        }
                            }

                            return res_list
                        }
                    var ast_new = get_code(control_struct, control_param_value)
                    switch (path.parentPath.type) {
                        case 'Program':
                        case 'BlockStatement':
                            let _body = path.parentPath.node.body;
                            for (var ids = 0; ids < ast_new.length; ids++) {
                                _body.splice(_body.indexOf(node), 0, ast_new[ids])
                            }
                            _body.splice(_body.indexOf(node), 1)
                            break;
                    }
                } else {
                    //debugger
                }

            }


        } else {
            // 未发现存在控制流混淆的代码片段，不做任何处理
        }

    }
    console.log('------------------------')

}

exports.fix = traverse_express