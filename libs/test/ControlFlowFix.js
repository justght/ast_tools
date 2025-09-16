const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const PrintCode = require('../tools/PrintCode');//PrintCode.PrintCode(path);
const types = require("@babel/types");
const traverse_express = {
    ForStatement(path) {
        fix(path)
    }
}



function fix(path){
    const node = path.node;
    const scope = path.scope;
    // PrintCode.PrintCode(path);
    if (types.isBlockStatement(node.body)){
        // 检测判断是否未for后var + switch的代码形式
        let flag = true;
        let _body = node.body.body
        let _cal_list = []
        for (var idx = 0; idx < _body.length; idx++) {
            if (types.isVariableDeclaration(_body[idx])) {
                _cal_list.push(_body[idx])
            } else {
                if (types.isSwitchStatement(_body[idx])) {
                    console.log("body is isSwitchStatement");
                    // _cal_list.push(_body[idx].discriminant);
                    break
                } else {
                    flag = false

                    break
                }
            }
        }

        if(flag){
            console.log("发现存在控制流混淆的代码片段");

            //
            let args = null
            try{
                _cal_list.forEach(function(block){
                if(block.declarations[0].init !== null){
                    if(types.isLiteral(block.declarations[0].init.right)){
                        args = block.declarations[0].init.left;
                        throw new Error("ending");
                    }else if(types.isBinaryExpression(block.declarations[0].init.right)){
                        args = block.declarations[0].init.right.left;
                        throw new Error("ending");
                    }

                }
            })
            }catch(e){

                if(e.message=="ending"){

                    console.log("结束了");

                }else{

                    console.log("error:",e.message);
                }

            }

            if(args !== null){
                let _prop = []
                let _prop_names = []
                _prop_names.push(node.init.declarations[0].id.name)

                for (var ids = 0; ids < _cal_list.length; ids++) {
                    //switch的条件和for的初始值一样
                    if(types.isBinaryExpression(_cal_list[ids])){
                        var _prop_name = _cal_list[ids].left.name;
                    }else{
                        var _prop_name = _cal_list[ids].declarations[0].id.name;
                    }

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
                console.log("xunhuanzhuangtai:",get_param_func);
                get_param_func = eval(get_param_func)

                let control_param = node.init.declarations;//流程控制的初始值的数量
                if(control_param.length === 1){
                    let control_param_value = control_param[0].init.value;
                    console.log("控制器参数为 " + args.name + ", 且初始值为" + control_param_value);

                    //封装一个判断是否结束的条件
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

                    //switch控制流
                    let control_struct_main = node.body.body[_cal_list.length - 1]


                    //封装一个while的起始判断条件，修改了源代码,是二元的判断变为变量的判断
                    // let node_test = control_struct_main.discriminant
                    // var get_first_fun = types.expressionStatement(
                    //     types.callExpression(
                    //         types.functionExpression(
                    //             null,//id
                    //             [],//params
                    //             types.blockStatement(
                    //                 [
                    //                     types.functionDeclaration(
                    //                         types.identifier('get_first_fun'),//id
                    //                         [args],
                    //                         types.blockStatement(
                    //                             [types.returnStatement(node_test)]
                    //                         )
                    //                     ),
                    //                     types.returnStatement(
                    //                         types.identifier('get_first_fun')
                    //                     )
                    //                 ]
                    //             )
                    //         ),
                    //         []//arguments
                    //     )
                    // )
                    // get_first_fun = generator(get_first_fun).code
                    // console.log(get_first_fun);
                    // get_first_fun = eval(get_first_fun)

                    //switch-if 转为一个obj对象 .......
                    var get_control_struct = function(ast){
                        //控制流中ast可能存在的结构,SwitchStatement,SwitchCase,ifStatement,BlockStatement,代码在前面的每一种类型中都存在
                        //结构相关
                        if(types.isSwitchStatement(ast)){
                            let control_struct_obj = {};
                            //switch 参数的两种格式
                            if(types.isIdentifier(ast.discriminant)){
                                var switch_case_con = ast.discriminant.name
                            }
                            else if(types.isBinaryExpression(ast.discriminant)){
                                var switch_case_con = ast.discriminant.left.name
                            }
                            else{
                                console.log("switch case 条件格式未知...")
                            }

                            if(_prop_names.indexOf(switch_case_con) >= 0){
                                control_struct_obj.test_name = switch_case_con;
                                control_struct_obj.block = {}//case_block
                                let codes = [];
                                for(var idx=0;idx < ast.cases.length;idx++){

                                    var _crontrol_struct = get_control_struct(ast.cases[idx]);

                                    if(_crontrol_struct.length === 2 && typeof _crontrol_struct[1] === "object" && 'test_name' in _crontrol_struct[1]){
                                        if (_crontrol_struct[1].test_name === control_struct_obj.test_name) {
                                            // 合并最里层case中的if-else
                                            for (var key in _crontrol_struct[1].block) {
                                                control_struct_obj.block[key] = _crontrol_struct[1].block[key]
                                            }
                                        } else {
                                            // 父子 switch case 合并
                                            control_struct_obj.block[ast.cases[idx].test.value] = _crontrol_struct[1]
                                        }
                                    }else{
                                        // case为代码的情况合并
                                        control_struct_obj.block[ast.cases[idx].test.value] = _crontrol_struct.slice(1)
                                    }


                                }
                                return [true,control_struct_obj]
                            }else{
                                // switch结构但并不是控制流
                                debugger
                            }
                        }
                        else if(types.isIfStatement(ast)){
                            let control_struct_obj = {};
                            if(types.isBinaryExpression(ast.test) && ((types.isIdentifier(ast.test.left) && _prop_names.indexOf(ast.test.left.name) >= 0))){
                                let test_name = ast.test.left.name;
                                let codes = [];
                                control_struct_obj.test_name = test_name;
                                control_struct_obj.block = {}
                                let consequent_value_node = ast.test.right;
                                let consequent_value_op = ast.test.operator;


                                if(consequent_value_op === "=="){
                                    var consequent_value = consequent_value_node.value
                                    var alternate_value = null;
                                    if (types.isExpressionStatement(ast.consequent.body[ast.consequent.body.length - 1])) {
                                    if (ast.consequent.body[ast.consequent.body.length - 1].expression.right.value == 26048) {
                                        debugger;
                                    }
                                }

                                }else if(consequent_value_op === "<"){



                                    //变量在左，数字在有
                                    var consequent_value = consequent_value_node.value - 1;
                                    var alternate_value = consequent_value_node.value + 1;
                                }else if(consequent_value_op === ">"){
                                    //变量在左，数字在有
                                    var consequent_value = consequent_value_node.value + 1;
                                    var alternate_value = consequent_value_node.value - 1;
                                }

                                try {
                                    var consequent_control_struct = get_control_struct(ast.consequent);
                                    // console.log(generator(ast.consequent).code);
                                    var ttt = consequent_control_struct[0];
                                }catch (e){
                                    debugger;
                                    let consequent_control_structs = get_control_struct(ast.consequent);
                                }


                                if(consequent_control_struct[0]){
                                    codes.push(true);
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
                                    } else {//if-else 最底层代码locak
                                        control_struct_obj.block[consequent_value] = consequent_control_struct.slice(1)
                                    }
                                }
                                else{
                                    codes.push(false);
                                    debugger;
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

                                //debugger
                                codes.push(control_struct_obj)
                                return codes

                            }
                            else{
                                return [true,ast]//是code，直接返回
                            }

                        }
                        //代码相关,或者是递归的出口
                        else{
                            if(types.isSwitchCase(ast)){
                                //switchcase下有if-else,switchcase,expressionStatement*
                                let codes = [];
                                for(var idx=0;idx<ast.consequent.length;idx++){
                                    if (types.isBreakStatement(ast.consequent[idx])) {
                                        break;
                                    }
                                    if (types.isSwitchStatement(ast.consequent[idx])){
                                        var _control_struct = get_control_struct(ast.consequent[idx])
                                        //返回的状态
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

                                        //返回的状态
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
                                        // expressionStatement
                                        if (idx === 0) {
                                            codes.push(true)
                                        }
                                        codes.push(ast.consequent[idx])
                                    }

                                }
                                return codes
                            }
                            else if (types.isBlockStatement(ast)) {
                                let codes = [];

                                for (var idx = 0; idx < ast.body.length; idx++) {
                                    if (types.isBreakStatement(ast.body[idx])) {
                                        break;
                                    }
                                    //blockstatement里面套switch，感觉不会走
                                    if (types.isSwitchStatement(ast.body[idx])) {

                                        var _control_struct = get_control_struct(ast.body[idx]);
                                        if (_control_struct[0]) {
                                            if (idx === 0) {
                                                codes.push(true);
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
                                        var _control_struct = get_control_struct(ast.body[idx]);
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

                    //获取下一个的初始变量的值
                    const get_next_control_param = function (ast_list) {
                        let next_node = ast_list[ast_list.length - 1]
                        let res = []

                        if (types.isIfStatement(next_node)) {
                            res.push('if')
                            if (next_node.consequent !== null) {//真
                                if (next_node.consequent.body.length > 1) {//改变r的值的if-else只有一条语句
                                    debugger
                                }
                                res.push(next_node.consequent.body[0].expression.right.value)
                            }
                            if (next_node.alternate !== null) {//假
                                if (next_node.alternate.body.length > 1) {
                                    debugger
                                }
                                res.push(next_node.alternate.body[0].expression.right.value)
                            }
                        }
                        else if (types.isExpressionStatement(next_node) && types.isAssignmentExpression(next_node.expression)) {
                            res.push('common')
                            if (types.isUnaryExpression(next_node.expression.right)) {
                                res.push(void next_node.expression.right.argument.value)
                            } else {
                                res.push(next_node.expression.right.value)
                            }

                        }
                        else if (types.isReturnStatement(next_node)) {
                            res.push('return')
                        }
                        // else if(types.isIfStatement(next_node) && next_node.test.name == "te"){
                        //     debugger;
                        //     res.push('common')
                        //     if (next_node.consequent !== null) {//真
                        //         if (next_node.consequent.body.length > 1) {//改变r的值的if-else只有一条语句
                        //             debugger
                        //         }
                        //         res.push(next_node.consequent.body[0].expression.right.value)
                        //     }
                        //
                        // }
                        else {
                            debugger//如果存在别的赋值类型的语句,在这儿补充
                        }
                        return res
                    };
                    let control_struct = get_control_struct(control_struct_main)
                    control_struct = control_struct[1]
                    trace_code = []

                    //对代码中的死循环做处理
                    // const get_d_loop = function (control_struct){
                    //
                    //     if("block" in control_struct){
                    //         for(var i=0;i<Object.keys(control_struct["block"]).length;i++){
                    //             console.log(i);
                    //             try{
                    //                 get_d_loop(control_struct.block[i])
                    //             }catch{
                    //                 debugger;
                    //             }
                    //
                    //         }
                    //
                    //     }else{
                    //         con_last_node = control_struct[control_struct.length-1]
                    //         if (types.isIfStatement(con_last_node)) {
                    //             console.log(con_last_node.test.name);
                    //             if (con_last_node.test.name == "te") {
                    //                 if (con_last_node.consequent !== null) {//真
                    //                     if (con_last_node.consequent.body.length > 1) {//改变r的值的if-else只有一条语句
                    //                         debugger
                    //                     }
                    //                     control_struct[control_struct.length-1] = con_last_node.consequent.body[0];
                    //                 }
                    //             }
                    //         }
                    //     }
                    //     // return control_struct;
                    // }
                    //
                    // get_d_loop(control_struct);



                    //控制流推平

                    const get_code = function (control_struct, //switch-case object对象
                                               control_param_value, //初始条件值
                                               last_res_list = [],
                                               is_alter = false, alternate_node = null, stack = [], res_list = [],
                                               get_first = false, next_node = null, while_break_next_node = null) {

                       // let control_param_value_v = get_first_fun(control_param_value);
                       // control_param_value = control_param_value_v;
    while (true) {
        //所有if执行的结果
        console.log("control_param_value start:==================",control_param_value);
        while (control_param_value !== undefined) {


            // 根据上次的控制参数计算出本次控制参数，
            var control_param_value_bak = null;
            let param = get_param_func(control_param_value)
            let control_struct_step = control_struct;
            let test_name_step = control_struct_step.test_name;
            //并取到对应block
            while (true) {
                var control_struct_step_test = control_struct_step;
                control_struct_step = control_struct_step.block[param[test_name_step]]
                try{
                    var test_len = control_struct_step.length;
                }catch(e){
                    console.log(e);
                    debugger;
                }
                if (typeof control_struct_step.length === "undefined") {
                    test_name_step = control_struct_step.test_name;
                } else {
                    break
                }
            }

            res_list_str_zbj = ''
            control_struct_step.forEach(function (element) {
                //console.log(generator(ast).code);
                var x = generator(element, {retainLines: false, comments: false, compact: true, minified: true}).code
                res_list_str_zbj += x;
                // res_list_values.push(x);
            })

            console.log("for_si:",control_param_value,res_list_str_zbj);
            //获取下一次控制流的初始条件变量
            let control_param_value_list = get_next_control_param(control_struct_step)
            if(control_param_value_list[1] == 21793){
                debugger;
            }
            let type = control_param_value_list[0]
            //根据不同的类型执行不同的操作
            if (type === 'common') {
                if (!is_alter) {
                    for (let idx = 0; idx < control_struct_step.length - 1; idx++) {
                        res_list.push(control_struct_step[idx])//common直接将其添加到res_list
                    }
                    control_param_value = control_param_value_list[1]//将本次代码块的条件作为控制流的初始值执行
                } else {
                    var start_idx = last_res_list.lastIndexOf(alternate_node)
                    var tem_flag = false
                    for (let idx = 0; idx < control_struct_step.length - 1; idx++) {//lastIndexOf()  返回给定元素最后一次出现的索引，如果不存在则返回-1
                        if (last_res_list.lastIndexOf(control_struct_step[idx]) >= 0 && last_res_list.lastIndexOf(control_struct_step[idx]) > start_idx) {//false条件执行的代码块中的代码在之后执行过,说明这个if-else结束了
                            res_list.push(control_struct_step[idx])//如果是common之前执行过，由于没有分支，以common的值再作为条件执行的话是已经执行过了的，所以可以直接结束
                            tem_flag = true
                            break
                        }
                        else if (while_break_next_node) {
                            if (control_struct_step[idx] === while_break_next_node[0][0] || control_struct_step[idx] === while_break_next_node[1][0]) {
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

                        control_param_value_bak = control_param_value_list[1]//结束的时候记录了一下改变初始量的值
                        control_param_value = undefined //已经存在就不再往下执行
                    }
                    else {
                        control_param_value = control_param_value_list[1]
                    }

                }

            }
            else if (type === "if") {
                if (!is_alter) {//是否是False
                    let consequent_value = control_param_value_list[1]
                    let alternate_value = control_param_value_list[2]
                    for (let idx = 0; idx < control_struct_step.length - 1; idx++) {
                        res_list.push(control_struct_step[idx])
                    }
                    let index = res_list.lastIndexOf(control_struct_step[control_struct_step.length - 1])//一轮的执行
                    let index2 = last_res_list.lastIndexOf(control_struct_step[control_struct_step.length - 1])
                    if (index > -1 || index2 > -1) {
                        if (index > -1) {
                            res_list.push(control_struct_step[control_struct_step.length - 1])//大概率是做一个标记了
                            control_param_value = alternate_value//存在就变为false的值接着进行
                        }
                        if (index2 > -1) {
                            res_list.push(control_struct_step[control_struct_step.length - 1])
                            break
                        }

                    } else {
                        // if
                        if (next_node && control_struct_step[control_struct_step.length - 1] === next_node[0]) {
                            control_param_value = undefined
                        } else {
                            res_list.push(control_struct_step[control_struct_step.length - 1])//同时true也添加到res_list中
                            stack.push([control_struct_step[control_struct_step.length - 1], alternate_value])//false添加到栈中
                            control_param_value = consequent_value
                        }
                    }
                } else {
                    //主打的就是判断一下之前有没有执行过，执行的最早的一行代码是什么
                    var start_idx = last_res_list.lastIndexOf(alternate_node)
                    var tem_flag = false
                    let consequent_value = control_param_value_list[1]
                    let alternate_value = control_param_value_list[2]
                    for (let idx = 0; idx < control_struct_step.length - 1; idx++) {//有一个if-else 和有 多个 + 一个 if-else,需要找到第一次执行匹配的代码，所以需要分开匹配
                        if (last_res_list.lastIndexOf(control_struct_step[idx]) >= 0 && last_res_list.lastIndexOf(control_struct_step[idx]) > start_idx) {
                            res_list.push(control_struct_step[idx])
                            tem_flag = true
                            break
                        } else if (while_break_next_node) {
                            if (control_struct_step[idx] === while_break_next_node[0][0] || control_struct_step[idx] === while_break_next_node[1][0]) {
                                // res_list.push(control_struct_step[idx])
                                if (control_struct_step[idx] === while_break_next_node[1][0] && control_struct_step[idx] !== next_node[0]) {
                                    res_list.push(types.breakStatement(null))
                                }
                                tem_flag = true
                                break
                            } else {
                                res_list.push(control_struct_step[idx])
                            }
                        } else if (next_node) {
                            if (control_struct_step[idx] === next_node[0]) {
                                // res_list.push(control_struct_step[idx])
                                tem_flag = true
                                break
                            } else {
                                res_list.push(control_struct_step[idx])
                            }
                        } else {
                            res_list.push(control_struct_step[idx])
                        }
                    }
                    if (tem_flag) {
                        control_param_value_bak = control_param_value_list[1]
                        control_param_value = undefined
                    } else {
                        var tests = control_struct_step[control_struct_step.length - 1].test;
                        for (var for_idx = 0; for_idx < last_res_list.length; for_idx++) {
                            if (last_res_list[for_idx].type === "IfStatement") {
                                if (tests.start === last_res_list[for_idx].test.start && tests.end === last_res_list[for_idx].test.end && for_idx > start_idx) {
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
                            control_param_value = undefined
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
                                // if

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
            else if (type === 'return') {
                for (let idx = 0; idx < control_struct_step.length; idx++) {
                    res_list.push(control_struct_step[idx])
                }
                break
            }

            //检查是否结束
            if (!check_end(control_param_value)) {
                break
            }
            if (get_first) {//只取第一个的意思
                control_param_value = undefined
                stack = []//stack强制清空了
                break
            }
        }

        res_list_values = [];
        res_list_str = ''
        res_list.forEach(function (element) {
            //console.log(generator(ast).code);
            var x = generator(element, {
                retainLines: false,
                comments: false,
                compact: true,
                minified: true
            }).code
            res_list_str += x + '\n';
            res_list_values.push(x);
        })

        res_list_stack_values = [];
        res_list_str_stack = ''
        stack.forEach(function (element) {
            //console.log(generator(ast).code);
            var x = generator(element[0], {
                retainLines: false,
                comments: false,
                compact: true,
                minified: true
            }).code
            res_list_str_stack += x + ',' + element[1] + '\n';
            res_list_stack_values.push(x);
        })

        control_param_value = undefined

        console.log("control_param_value end:==================",control_param_value,stack.length);
        if(stack.length == 922){
            debugger
        }
        //虚假控制流过滤
        // if(stack){
        //     var stack_reuslt = [];
        //     var flag_value = [ 'go', 'fe', 'Fo', 'te', 'ti', 'fe', 'xe', 'K' ]
        //     stack.forEach(function (element) {
        //
        //         if(types.isIfStatement(element[0]) && types.isAssignmentExpression(element[0].test)){
        //             if(flag_value.indexOf(element[0].test.left.name) > -1){
        //                 console.log("stack_filter_1: ",generator(element[0],{retainLines: false, comments: false, compact: true, minified: true}).code,element[1]);
        //             }else{
        //                 stack_reuslt.push([element[0],element[1]])
        //             }
        //         }else if(types.isIfStatement(element[0]) && types.isIdentifier(element[0].test)){
        //             if(flag_value.indexOf(element[0].test.name) > -1){
        //                 console.log("stack_filter_2: ",generator(element[0],{retainLines: false, comments: false, compact: true, minified: true}).code,element[1]);
        //             }else{
        //                 stack_reuslt.push([element[0],element[1]])
        //             }
        //         }
        //         else{
        //             stack_reuslt.push([element[0],element[1]])
        //         }
        //     })
        //     stack = stack_reuslt
        // }

        //stack 所有if执行是的 [if-else条件语句,else的值]
        if (stack.length > 0) {
            let alternate_node = stack.pop()
            let alternate_node_bak = alternate_node
            let alternate_value = alternate_node[1]
            if(alternate_value == 13188){
                debugger;
            }


            //control_param_value_bak 好像这个只有在false中会有值
            if (control_param_value_bak) {//19713，22787
                var next_node2 = get_code(control_struct, control_param_value_bak, res_list, is_alter, null, [], [], true)
            } else {
                var next_node2 = null
            }



            if (next_node2 && next_node2.length > 0 && types.isIfStatement(next_node2[0]) &&
                last_res_list.lastIndexOf(next_node2[0]) >= 0 && last_res_list.lastIndexOf(next_node2[0], last_res_list.lastIndexOf(next_node2[0]) - 1) >= 0) {

                var while_break_next_node2 = [
                    get_code(control_struct, next_node2[0].consequent.body[0].expression.right.value, res_list, is_alter, null, [], [], true),
                    get_code(control_struct, next_node2[0].alternate.body[0].expression.right.value, res_list, is_alter, null, [], [], true)
                ]

            } else {
                var while_break_next_node2 = null;
            }



            alternate_node = alternate_node[0];
            let alternate_list = get_code(
                control_struct, alternate_value, res_list, true, alternate_node, [], [], false,
                next_node2 ? types.isIfStatement(next_node2[0]) ? next_node2 : next_node : next_node,
                while_break_next_node2 ? while_break_next_node2 : while_break_next_node
            )//stack中if-else中false执行的结果


            //将其存入false执行的 alternate_block
            let alternate_block = []//感觉也是打了一个标记
            for (var idx = 0; idx < alternate_list.length; idx++) {
                alternate_block.push(alternate_list[idx])
            }



            let consequent_block = []
            if (res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1) >= 0 &&
                res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1) !== res_list.lastIndexOf(alternate_node)
            ) {//if-else如果都存在，那么就是一个while

                var last2whilestart = res_list[res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1) + 1]
                if (res_list.lastIndexOf(
                    res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1),
                    res_list.lastIndexOf(last2whilestart) - 1
                ) > -1) {
                    // do while
                    // 先处理内部stack
                    if (stack.length > 0) {

                        // 先处理
                        stack = [alternate_node_bak].concat(stack)
                        res_list.splice(res_list.lastIndexOf(last2whilestart) + 1, res_list.lastIndexOf(alternate_node) - res_list.lastIndexOf(last2whilestart) - 1)

                    }
                    else {
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

                    if (old_idx > 2) {
                        for (var up_count = 0; up_count < (new_idx - old_idx); up_count++) {//限定了一个范围
                            if (res_list.lastIndexOf(res_list[new_idx - up_count - 1], old_idx - 1) > -1) {//如果在之前出现过,说明存在while
                                is_other_while = true
                                diff_idx = up_count + 1
                                top_idx = res_list.lastIndexOf(res_list[new_idx - up_count - 1], old_idx - 1)
                            }
                        }
                    }

                    if (is_other_while) {//
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
                                tmp_stack.reverse()
                                consequent2_block = get_code(control_struct, control_param_value, res_list, is_alter, null, tmp_stack, consequent2_block)
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
                                consequent_block = get_code(control_struct, control_param_value, res_list, is_alter, null, tmp_stack, consequent_block)
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
                    else {
                        // 过 while,if-else - if-else 没有别的while，将两个if-else中间的代码分装为一个while
                        for (var idx2 = res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1) + 1; idx2 < res_list.length; idx2++) {
                            if (res_list[idx2] === alternate_node) {
                                break
                            }
                            consequent_block.push(res_list[idx2])
                        }
                        res_list.splice(res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1), 0, types.whileStatement(alternate_node.test, types.blockStatement(consequent_block)))
                        res_list.splice(res_list.indexOf(alternate_node), res_list.lastIndexOf(alternate_node) - res_list.lastIndexOf(alternate_node, res_list.lastIndexOf(alternate_node) - 1) + 1)
                    }


                }

            }
            else {//之后
                for (var idx2 = res_list.lastIndexOf(alternate_node) + 1; idx2 < res_list.length; idx2++) {//如果不存在,
                    if (res_list[idx2] === alternate_node) {
                        break
                    }
                    consequent_block.push(res_list[idx2])
                }

                let flag = false;

                res_list.splice(res_list.lastIndexOf(alternate_node), res_list.length - res_list.lastIndexOf(alternate_node) + 1)

                //对比之后的代码是否存在alternate_block,不同结构的代码对比的方式有所不同
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
                    else {
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
                //flag为false说明 consequent(之后的代码) 中 不存在 alternate，flag为true代表之后的代码存在alternate中的代码
                if (flag) {
                    // if分支合并(将代码整理为if-else结构),对consequent进行if-else组合
                    let body = []
                    if (consequent_id === 0) {

                    }
                    else {
                        for (let id = 0; id < consequent_id; id++) {
                            body.push(consequent_block[id])
                        }

                    }

                    let consequent = types.blockStatement(body)

                    body = []
                    if (alternate_id === 0) {

                    }
                    else {
                        for (let id = 0; id < alternate_id; id++) {
                            body.push(alternate_block[id])
                        }

                    }

                    let alternate = types.blockStatement(body)
                    res_list.push(
                        types.ifStatement(
                            alternate_node.test,
                            consequent,
                            alternate
                        )
                    )
                    for (let id = consequent_id; id < consequent_block.length; id++) {
                        res_list.push(consequent_block[id])
                    }
                }
                else {//不存在说明后面的代码是某个结构的一部分
                    var is_break = true
                    if (types.isIfStatement(consequent_block[consequent_block.length - 1])) {//consequent_block 如果最后一个是if-else 说明还没有结束
                        is_break = false
                    }
                    //alternate_block 如果最后一个是if-else 代表也是还没有结束
                    if (is_break && types.isIfStatement(alternate_block[alternate_block.length - 1]) &&
                        res_list.lastIndexOf(alternate_block[alternate_block.length - 1]) >= 0
                    ) {//if-else  没有结束就代表需要接着遍历执行,将consequent_block(最终结果的一部分) 作为last_result_list,get_first 为true

                        let while_alternate = get_code(control_struct, alternate_block[alternate_block.length - 1].alternate.body[0].expression.right.value, consequent_block, is_alter, null, [], [], true)

                        if (while_alternate[0] !== consequent_block[0]) {//false执行到了自身，表示True为空，不相等说明没有执行到自身，表示可以进行遍历查找是否有相同的内容
                            let body = []
                            for (let id = 0; id < consequent_block.length; id++) {//相同的内容有三中类型的判断,有相同就break
                                if (while_alternate[0] === consequent_block[id]) {
                                    break
                                }
                                if (types.isIfStatement(while_alternate[0]) && while_alternate[0].test === consequent_block[id].test) {
                                    break
                                }
                                if (types.isWhileStatement(while_alternate[0]) && while_alternate[0].test === consequent_block[id].test) {
                                    break
                                }
                                body.push(consequent_block[id])
                            }
                            body.push(types.breakStatement(null))//break
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
                            res_list.push(alternate_block[id])//上面的构建的代码为为空，在这里添加进去
                        }
                        if (while_alternate[0] !== consequent_block[0]) {//相同和不相同的处理
                            for (let id = consequent_block.lastIndexOf(consequent_s.body[consequent_s.body.length - 2]) + 1; id < consequent_block.length; id++) {
                                res_list.push(consequent_block[id])
                            }

                        }
                        else {
                            for (let id = 0; id < consequent_block.length; id++) {
                                res_list.push(consequent_block[id])
                            }
                        }

                    }
                    else {//while  //否则就代表结束了，结束就代表要进行代码合并了
                        let body = []
                        for (let id = 0; id < consequent_block.length; id++) {
                            body.push(consequent_block[id])
                        }
                        var consequent_s = types.blockStatement(body)

                        var is_break = true
                        if (types.isIfStatement(alternate_block[alternate_block.length - 1])) {
                            is_break = false
                        }

                        //consequent_block 中 是否存在if-else
                        if (is_break &&
                            types.isIfStatement(consequent_block[consequent_block.length - 1]) &&
                            res_list.lastIndexOf(
                                consequent_block[consequent_block.length - 1],
                                res_list.lastIndexOf(consequent_block[consequent_block.length - 1]) - 1
                            ) >= 0
                        ) {
                            //如果存在则是一个while
                            let while_alternate = get_code(control_struct,
                                consequent_block[consequent_block.length - 1].alternate.body[0].expression.right.value,
                                alternate_block, is_alter, null, [], [], true)

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
                        else {//不存在则构造一个if-else
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
                                // consequent最后一条是break,最终得到[if(test){}else{alternate_s},[.....consequent_s]]
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
                            else {//构造一个if-else
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
        } else {
            break
        }
    }

    return res_list
}


                    var ast_new = get_code(control_struct, control_param_value)


                    switch (path.parentPath.type) {
                        case 'Program':
                        case 'BlockStatement':
                            let _body = path.parentPath.node.body;//[forStatement]
                            for (var ids = 0; ids < ast_new.length; ids++) {
                                _body.splice(_body.indexOf(node), 0, ast_new[ids])
                            }
                            _body.splice(_body.indexOf(node), 1)
                            break;
                    }

                }else{
                    debugger;
                }
            }


        }else{
            // 未发现存在控制流混淆的代码片段，不做任何处理
        }
    }
}

exports.fix = traverse_express
