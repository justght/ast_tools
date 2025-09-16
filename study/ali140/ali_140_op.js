/*****************************************************
 *
 *
 * Author:  sml2h3
 * Date:    2021-03-12
 * File:    main
 * Project: ast_tools
 *****************************************************/

const fs = require("fs");
const iconv = require('iconv-lite');


// const common_fix = require('./pro/geetest_fix')
const common_fix = require('../../pro/demo1/demo1_fix')
// const source_path = './demos/ali_baba/225/ali_225.js'
// const source_path = './demos/test/test_output.js'
// const output_path = './demos/ali_baba/225/ali_225_output.js'
// const source_path = './demos/demo1/encode.js'
const source_path = 'study/ali140/demo_mid.js'
// const source_path = './demos/test/test.js'
const output_path = 'study/ali140/demo_outputs.js'

// const source_path = './demos/geetest/geetest.6.0.9.js'
// const output_path = './demos/geetest/geetest_out.js'



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




