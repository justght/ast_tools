/*****************************************************
 *
 *
 * Author:  sml2h3
 * Date:    2021-03-12
 * File:    main
 * Project: ast_tools
 *****************************************************/

const fs = require("fs");//引入 Node.js 内置的 文件系统模块 fs，用于读写文件。
const iconv = require('iconv-lite');//用来做字符编码转换
//引入本地模块 ./pro/demo1_fix.js，
//这个文件里应该导出了一个 fix 函数，负责具体的 AST 处理逻辑（比如反混淆、AST 修改）
const common_fix = require('./pro/akamai3_fix')


const source_path = './study/akamai/source/OWtdMHoB_format.js'
const output_path = './study/akamai/source/output.js'
const content = fs.readFileSync(source_path, {encoding: 'binary'});
const buf = new Buffer.from(content, 'binary');
const source_code = iconv.decode(buf, 'utf-8');



const start_time = new Date().getTime()
const output_ast = common_fix.fix(source_code)


fs.writeFile(output_path, output_ast, {flag: 'w', encoding: 'utf-8', mode: '0666'}, function (err) {
    if (err) {
        console.log(output_path, new Date().getTime() - start_time, 'ms', "文件写入失败")
    } else {
        console.log(output_path, new Date().getTime() - start_time, 'ms', "文件写入成功");

    }

});




