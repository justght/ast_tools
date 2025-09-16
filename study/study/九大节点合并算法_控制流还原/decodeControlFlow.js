const parser    = require("@babel/parser");
const traverse  = require("@babel/traverse").default;
const types     = require("@babel/types");
const t         = require("@babel/types");
const generator = require("@babel/generator");
const fs        = require("fs");


process.argv.length > 2?encodeFile = process.argv[2]:encodeFile = "E:\\ast_tools\\study\\study\\九大节点合并算法_控制流还原\\match7.js";
process.argv.length > 3?decodeFile = process.argv[3]:decodeFile = "./match7_output.js";
sourceCode = fs.readFileSync(encodeFile, {encoding: "utf-8"});

// 转换为AST语法树
let ast = parser.parse(sourceCode);



// 标准化代码结构
// 这个方法的作用是检查一个 switch 语句中的 case 子句，
// 确保每个 case 子句的结尾都有一个 break 语句。
// 如果没有 break 语句，方法会自动在 case 子句的结尾添加一个 break 语句。
const addBreakStatement =
{
	SwitchCase(path)
	{
		let {consequent} = path.node;
		if (!t.isBreakStatement(consequent[consequent.length-1]))
		{
			consequent.push(t.BreakStatement());
		}
	}
}

traverse(ast, addBreakStatement);




//===================================================================================

/**
 * 这个函数的目的是在 switch 语句中找到测试值为指定数字的 case 子句。
 * 如果找到了匹配的 case 子句，函数会返回一个数组，包含该 case 子句及其索引。
 * 如果没有找到匹配的 case 子句，函数不会返回任何值（即返回 undefined）
 * @param path
 * @param number
 * @returns {(*|number)[]}
 */
function getItemFromTestValue(path, number)
{
	let {cases} = path.node;
	for (let index =0; index<cases.length;index++)
	{
		let item = cases[index];
		if (item.test.value == number)
		{
			return [item,index];
		}
	}
}





/**
 * 类似于一个入度的计算：
 * 从case0开始遍历所有的case情况，统计出这个switch中，指向每个case的个数
 * 比如 第一个case0的执行条件是 case等于0，那就遍历所有的case，更具每个case的倒数第二个赋值语句判断是否等于0，统计出又多少个case可以指向case0
 * 最终形成一个map，key是case的index，value是case指向的个数
 *
 * 这个函数用于在 switch 语句的 case 子句中查找特定的条件，
 * 主要是通过检查表达式语句中的数值字面量或条件表达式中的数值是否等于传入的 number，
 * 以计算满足条件的 case 子句的数量。这在代码分析、代码转换或重构工具中可能会用到。
 *
 *
 * 计算前驱节点的个数并返回
 * @param path
 * @param number
 * @returns {number}
 */

function getPrevItemCounts(path, number)
{
	let counts = 0;// 用于计数满足条件的 case 子句数量
	let {cases} = path.node; // 解构出 path.node 中的 cases 属性，这是一个包含所有 case 子句的数组

	for (let i=0; i<cases.length;i++)// 遍历所有的 case 子句
	{
		let item = cases[i];// 当前遍历的 case 子句
		let {test,consequent} = item;// 解构出 case 子句的 test 和 consequent 属性
		let len = consequent.length;// 获取当前 case 子句中 consequent 数组的长度
		if (!t.isExpressionStatement(consequent[len - 2])) // 检查倒数第二个语句是否是表达式语句
		{
			continue;// 如果不是表达式语句，跳过这个 case 子句
		}
		// 获取倒数第二个表达式语句中的右侧部分
	  let {right} = consequent[len - 2].expression;
		// 检查右侧部分是否是数值字面量，且其值等于传入的 number
	  if (t.isNumericLiteral(right,{value:number}))
	  {
	  	counts++; // 如果条件满足，增加计数器
	  	continue;// 跳过当前循环，继续下一个 case 子句
	  }
	  // 检查右侧部分是否是条件表达式
	  if (t.isConditionalExpression(right))
	  {
		  // 检查条件表达式的两个分支（consequent 和 alternate）是否有一个的值等于传入的 number
	  	if (right.consequent.value == number ||
	  	    right.alternate.value  == number)
	  	{
	  		counts++;// 如果条件满足，增加计数器
	  	}
	  }
	}

	return counts;// 返回满足条件的 case 子句数量
}


function isCombinCases(path,item,countsMap)
{
	let {test,consequent} = item;// 从 item 中解构出 test 和 consequent 属性
	let len = consequent.length;// 获取 consequent 数组的长度
	let {left,operator,right} = consequent[len-2].expression;//// 获取倒数第二个表达式语句的各个部分

	let nextNumber = right.value;// 获取表达式右侧的值

	let counts = countsMap.get(nextNumber);// 从 countsMap 中获取 nextNumber 的计数值
	if (counts == 1)// 如果计数值等于 1
	{
		// 获取测试值为 nextNumber 的 case 子句及其索引
		let data = getItemFromTestValue(path, nextNumber);
		let nextItem = data[0];// 获取对应的 case 子句
		consequent.splice(consequent.length - 2, 2);// 删除当前 case 子句的倒数第二个和最后一个语句
		consequent.push(...nextItem.consequent);// 将找到的 case 子句的所有 consequent 语句追加到当前 case 子句中

		path.node.cases.splice(data[1], 1);// 从 cases 数组中删除找到的 case 子句
		countsMap.set(nextNumber,0);// 将 countsMap 中 nextNumber 的计数值设置为 0

		return true;// 返回 true 表示合并成功
	}

	return false;// 返回 false 表示没有进行合并
}







/**
 * 如何将两个 case 子句转换为一个包含 while 循环的 case 子句  有一定的条件
 *
 *只适合相邻的两个
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     if (x < 10) x = 6; else x = 7;
 *     break;
 *   case 6:
 *     console.log('Six');
 *     if (x < 5) x = 1; else x = 2;
 *     break;
 *   case 7:
 *     console.log('Seven');
 *     break;
 * 	case 5:
		next = p >h?6 : 7;
		break;
	case 6:
		code;
		next = 5;
 * }
 *
 * let countsMap = new Map();
 * countsMap.set(1, 1);
 * countsMap.set(6, 1);
 * countsMap.set(7, 1);
 *
 *
 * 转换后
 *
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     while (x < 10) {
 *       console.log('Six');
 *       if (x < 5) x = 1; else x = 2;
 *     }
 *     x = 7;
 *     break;
 *   case 7:
 *     console.log('Seven');
 *     break;
 * 	case 5:
 * 		while(p>h){code;}next = 7;
 * 		break;
 * }
 *
 *
 * @param path
 * @param item
 * @param countsMap
 * @returns {boolean}
 */

function isCreateWhileNode(path,item,countsMap)
{
	let {test,consequent} = item; // 从 item 中解构出 test 和 consequent 属性

	let curValue = test.value;// 获取当前 case 子句的测试值
	let len = consequent.length;// 获取 consequent 数组的长度

	let {left,operator,right} = consequent[len-2].expression;// 获取倒数第二个表达式语句的各个部分

	let nextTest = right.test; // 获取右侧表达式的测试部分

	if (t.isBinaryExpression(nextTest))// 检查 nextTest 是否是一个二元表达式
	{
		let trueValue  = right.consequent.value;  //6 // 获取条件表达式的 true 分支值
		let falseValue = right.alternate.value;   //7 // 获取条件表达式的 false 分支值

		let data = getItemFromTestValue(path, trueValue)// 获取测试值为 trueValue 的 case 子句及其索引

		let trueItem = data[0] //case 6:.....  // 获取对应的 case 子句

		let trueConse = trueItem.consequent;// 获取对应 case 子句的 consequent 数组
		let trueLen   = trueConse.length; // 获取 trueConse 数组的长度
		let rightNode = trueConse[trueLen-2].expression.right; // 获取 trueConse 数组中倒数第二个表达式的右侧部分
		// 检查 rightNode 是否是一个数值字面量，且值等于 curValue
		if (t.isNumericLiteral(rightNode,{value:curValue}))
		{
			// 创建一个 while 语句节点，条件为 nextTest，循环体为 trueConse 中除去最后两个元素的部分
			let whileNode = t.whileStatement(nextTest,t.blockStatement(trueConse.slice(0, trueLen - 2)));
			consequent.splice(consequent.length - 2, 0, whileNode);// 在当前 case 子句的倒数第二个位置插入 whileNode
      consequent[consequent.length - 2].expression.right = t.NumericLiteral(falseValue);// 更新倒数第二个表达式的右侧值为 falseValue

      let counts = countsMap.get(trueValue);// 获取 trueValue 的计数值

      if (counts == 1)// 如果计数值等于 1
      {
      	path.node.cases.splice(data[1], 1);// 从 cases 数组中删除找到的 case 子句

      	let curCounts = countsMap.get(curValue);// 获取 curValue 的计数值
      	countsMap.set(curValue,curCounts - 1); // 更新 curValue 的计数值
      }
      countsMap.set(trueValue,counts - 1);// 更新 trueValue 的计数值

      return true;// 返回 true 表示创建 while 节点成功
		}
	}


	return false;// 返回 false 表示没有创建 while 节点
}


/**
 *
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     p > h ? x = 6 : x = 7;
 *     break;
 *   case 6:
 *     y = 6;
 *     m ? x = 8 : x = 9;
 *     break;
 *   case 8:
 *     z = 8;
 *     x = 7;
 *     break;
 *   case 9:
 *     w = 9;
 *     x = 1;
 *     break;
 * }
 * 
 * 
 * switch(next){
case 5:
	next = p >h?6 : 7;
	break;
case 6 :
	code1;
	next = m ? 8:9;
	break;
case 8:
	code2;
	next = 7;
	break;
case 9:
	code3;
	next = 5;
	break;}
 *
 * let countsMap = new Map();
 * countsMap.set(1, 1);
 * countsMap.set(6, 1);
 * countsMap.set(7, 1);
 * countsMap.set(8, 1);
 * countsMap.set(9, 1);
 *
 * 转换后
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     while (p > h) {
 *       y = 6;
 *       if (m) {
 *         z = 8;
 *       }
 *       w = 9;
 *     }
 *     x = 7;
 *     break;
 * }
 *
 * case 5:
  while(p>h){
	  codel;		
	  if (m){		
	  code2;		
	  break;		
	  }			
	  code3;}
	  next = 7;	
	  break;
 * 
 * @param path
 * @param item
 * @param countsMap
 * @returns {boolean}
 */

function isCreateWhileIFNode(path,item,countsMap)
{
	let {test,consequent} = item;// 从 item 中解构出 test 和 consequent 属性
	let len = consequent.length;// 获取 consequent 数组的长度
	let curValue = test.value;// 获取当前 case 子句的测试值
	let {left,operator,right} = consequent[len-2].expression;// 获取倒数第二个表达式语句的各个部分

//p > h ? 6 : 7
		let nextTest = right.test;// 获取右侧表达式的测试部分
		if (t.isBinaryExpression(nextTest))// 检查 nextTest 是否是一个二元表达式
		{
			let trueValue  = right.consequent.value;  //6  // 获取条件表达式的 true 分支值
			let falseValue = right.alternate.value;   //7  // 获取条件表达式的 false 分支值

			let trueData = getItemFromTestValue(path, trueValue);// 获取测试值为 trueValue 的 case 子句及其索引
			let trueItem = trueData[0]; //case 6:..... // 获取对应的 case 子句
			let trueConse = trueItem.consequent;// 获取对应 case 子句的 consequent 数组
			let trueLen = trueConse.length;	// 获取 trueConse 数组的长度
			let rightNode = trueConse[trueLen-2].expression.right;// 获取 trueConse 数组中倒数第二个表达式的右侧部分


			if (t.isConditionalExpression(rightNode))// 检查 rightNode 是否是一个条件表达式
			{//m ? 8:9
				let true_true_number  = rightNode.consequent.value;  //8 // 获取条件表达式的 true 分支值
        let true_false_number = rightNode.alternate.value;   //9 // 获取条件表达式的 false 分支值

        let trueTrueData = getItemFromTestValue(path, true_true_number);// 获取测试值为 true_true_number 的 case 子句及其索引
        let true_true_item =  trueTrueData[0];  //case 8:... // 获取对应的 case 子句
        let true_true_conse = true_true_item.consequent;// 获取对应 case 子句的 consequent 数组
        let true_true_len   = true_true_conse.length;// 获取 true_true_conse 数组的长度

        let trueFalseData = getItemFromTestValue(path, true_false_number);// 获取测试值为 true_false_number 的 case 子句及其索引
        let true_false_item = trueFalseData[0]; //case 9:...  // 获取对应的 case 子句
        let true_false_conse = true_false_item.consequent;// 获取对应 case 子句的 consequent 数组
        let true_false_len   = true_false_conse.length;    // 获取 true_false_conse 数组的长度
        // 检查 true_true_conse 和 true_false_conse 的倒数第二个表达式是否符合条件
        if (t.isNumericLiteral(true_true_conse[true_true_len-2].expression.right,{value:falseValue}) &&
            t.isNumericLiteral(true_false_conse[true_false_len-2].expression.right,{value:curValue}))
        {
			// 移除 true_true_item 中的倒数第二个元素
         	true_true_item.consequent.splice(true_true_item.consequent.length-2,1);
			 // 创建 if 语句节点
         	let ifNode = t.ifStatement(rightNode.test,t.blockStatement(true_true_item.consequent),null);
			// 创建 while 循环体
         	let whileBody = trueConse.slice(0, trueLen - 2);//code 1  // 复制 trueConse 的前部分

			whileBody.push(ifNode);  //ifNode;  // 插入 if 节点
         	whileBody.push(...true_false_item.consequent.slice(0, true_false_item.consequent.length - 2));//code 3   // 插入 true_false_item 的前部分

			// 创建 while 语句节点
			let whileNode = t.whileStatement(nextTest,t.blockStatement(whileBody));
			// 在当前 case 子句的倒数第二个位置插入 whileNode
       	  consequent.splice(consequent.length - 2, 0, whileNode);  //case 5 插入 while节点
       	  // 更新倒数第二个表达式的右侧值为 falseValue
			consequent[consequent.length - 2].expression.right = t.numericLiteral(falseValue);  // next = 7
       	  // 更新 countsMap 和 path.node.cases
       	  let trueCounts = countsMap.get(trueValue);
       	  if (trueCounts == 1)
       	  {
       	  	path.node.cases.splice(trueData[1], 1);

       	  	let trueTrueCounts = countsMap.get(true_true_number);
       	  	countsMap.set(true_true_number,trueTrueCounts - 1);

       	  	let trueFalseCounts = countsMap.get(true_false_number);
       	  	countsMap.set(true_false_number,trueFalseCounts - 1);
       	  }

       	  let trueTrueCounts = countsMap.get(true_true_number);
       	  if (trueTrueCounts == 0)
       	  {
       	  	trueTrueData = getItemFromTestValue(path, true_true_number);
       	  	path.node.cases.splice(trueTrueData[1], 1);

       	  	let falseCounts = countsMap.get(falseValue);
       	  	countsMap.set(falseValue,falseCounts - 1);


       	  }
       	  let trueFalseCounts = countsMap.get(true_false_number);
       	  if (trueFalseCounts == 0)
       	  {
       	  	trueFalseData = getItemFromTestValue(path, true_false_number);
       	  	path.node.cases.splice(trueFalseData[1], 1);


       	  	let curCounts = countsMap.get(curValue);
       	  	countsMap.set(curValue,curCounts - 1);
       	  }

       	  countsMap.set(trueValue,trueCounts - 1);
       	  return true;
        }
			}
		}


	return false;
}


/**
 * 用于在特定条件下将 switch 语句中的某些 case 子句转换为包含 if 语句的节点。
 * 这个函数主要检查特定的条件表达式并在符合条件时进行转换。
 *
 *
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     p > h ? x = 6 : x = 7;
 *     break;
 *   case 6:
 *     y = 6;
 *     x = 7;
 *     break;
 * }
 *
 * let countsMap = new Map();
 * countsMap.set(1, 1);
 * countsMap.set(6, 1);
 * countsMap.set(7, 1);
 *
 * 转换后
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     if (p > h) {
 *       y = 6;
 *     }
 *     x = 7;
 *     break;
 * }
 *
 * @param path
 * @param item
 * @param countsMap
 * @returns {boolean}
 */

function isCreateIFNode1(path,item,countsMap)
{
	let {test,consequent} = item;// 从 item 中解构出 test 和 consequent 属性
	let len = consequent.length;// 获取 consequent 数组的长度
	let curValue = test.value; // 获取当前 case 子句的测试值
	let {left,operator,right} = consequent[len-2].expression;// 获取倒数第二个表达式语句的各个部分

	let nextTest = right.test;// 获取右侧表达式的测试部分
	let trueValue  = right.consequent.value;  //6 // 获取条件表达式的 true 分支值
	let falseValue = right.alternate.value;   //7 // 获取条件表达式的 false 分支值
	if (t.isBinaryExpression(nextTest)) return;// 如果 nextTest 是一个二元表达式，直接返回

	// 获取测试值为 trueValue 的 case 子句及其索引
	let data = getItemFromTestValue(path, trueValue);
	let trueItem = data[0] //case 8:.....  // 获取对应的 case 子句

	let trueConse = trueItem.consequent; // 获取对应 case 子句的 consequent 数组
	let trueLen = trueConse.length;// 获取 trueConse 数组的长度

	// 检查 trueConse 的倒数第二个表达式是否符合条件
	if (t.isExpressionStatement(trueConse[trueLen-2]) &&
		  t.isNumericLiteral(trueConse[trueLen-2].expression.right,{value:falseValue}))
	{
		// 创建 if 语句节点
		let ifNode = t.ifStatement(nextTest, t.blockStatement(trueConse.slice(0, trueLen - 2)));
		// 在当前 case 子句的倒数第二个位置插入 ifNode
		consequent.splice(consequent.length - 2, 0, ifNode);
		// 更新倒数第二个表达式的右侧值为 falseValue
		consequent[consequent.length - 2].expression.right = t.numericLiteral(falseValue);  // next = 7

		// 更新 countsMap 和 path.node.cases
    let counts = countsMap.get(trueValue);
    if (counts == 1)
    {
     path.node.cases.splice(data[1], 1);

     falseCounts = countsMap.get(falseValue);
     countsMap.set(falseValue,falseCounts-1);
    }
    countsMap.set(trueValue,counts-1);



    return true;
  }

	return false;
}


/**
 * 该函数用于将 switch 语句中的特定 case 子句转换为包含 if 语句的节点。其主要目的是在符合特定条件时，将多个 case 子句合并为一个包含 if 语句的 case 子句
 *
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     p > h ? x = 7 : x = 6;
 *     break;
 *   case 6:
 *     y = 6;
 *     x = 7;
 *     break;
 * }
 *
 *
 * let countsMap = new Map();
 * countsMap.set(1, 1);
 * countsMap.set(6, 1);
 * countsMap.set(7, 1);
 *
 * 转为：
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     if (!(p > h)) {
 *       y = 6;
 *     }
 *     x = 7;
 *     break;
 * }
 *
 * @param path
 * @param item
 * @param countsMap
 * @returns {boolean}
 */

function isCreateIFNode2(path,item,countsMap)
{
	let {test,consequent} = item;// 从 item 中解构出 test 和 consequent 属性
	let len = consequent.length;// 获取 consequent 数组的长度
	let curValue = test.value;// 获取当前 case 子句的测试值
	let {left,operator,right} = consequent[len-2].expression;// 获取倒数第二个表达式语句的各个部分

	let nextTest = right.test;// 获取右侧表达式的测试部分
	let trueValue  = right.consequent.value;  //6 // 获取条件表达式的 true 分支值
	let falseValue = right.alternate.value;   //7 // 获取条件表达式的 false 分支值
	if (t.isBinaryExpression(nextTest)) return; // 如果 nextTest 是一个二元表达式，直接返回

// 获取测试值为 falseValue 的 case 子句及其索引
	let data = getItemFromTestValue(path, falseValue);
	let falseItem = data[0] //case 8:.....  // 获取对应的 case 子句

	let falseConse = falseItem.consequent; // 获取对应 case 子句的 consequent 数组
	let falseLen = falseConse.length;// 获取 falseConse 数组的长度
		// 检查 falseConse 的倒数第二个表达式是否符合条件
	if (t.isExpressionStatement(falseConse[falseLen-2]) &&
		  t.isNumericLiteral(falseConse[falseLen-2].expression.right,{value:trueValue}))
	{
		// 创建 if 语句节点，使用 nextTest 的否定形式
		let ifNode = t.ifStatement(t.unaryExpression("!",nextTest), t.blockStatement(falseConse.slice(0, falseLen - 2)));
		// 在当前 case 子句的倒数第二个位置插入 ifNode
		consequent.splice(consequent.length - 2, 0, ifNode);
    	// 更新倒数第二个表达式的右侧值为 trueValue
		consequent[consequent.length - 2].expression.right = t.numericLiteral(trueValue);  // next = 7
    // 更新 countsMap 和 path.node.cases
    let counts = countsMap.get(falseValue);
    if (counts == 1)
    {
     path.node.cases.splice(data[1], 1);
     tureCounts = countsMap.get(trueValue);
     countsMap.set(trueValue,tureCounts-1);
    }

    countsMap.set(falseValue,counts-1);





    return true;
	}


	return false;
}



/********************************
      case 5:
        code1;
        next = m ? 6 : 7;
        break;
     case 6 :
        code2;
        next = 8;
        break;
     case 7:
        code3;
        next = 8;
        break;

     ===>

     case 5 :
        code1;
        if (m)
        {
          code2;
        }
        else
        {
          code3;
        }

        next = 8;
        break;

********************************/

function isCreateIFNode3(path,item,countsMap)
{
	let {test,consequent} = item;// 从 item 中解构出 test 和 consequent 属性
	let len = consequent.length;// 获取 consequent 数组的长度
	let curValue = test.value;// 获取当前 case 子句的测试值
	let {left,operator,right} = consequent[len-2].expression;// 获取倒数第二个表达式语句的各个部分

	let nextTest = right.test;// 获取右侧表达式的测试部分
	let trueValue  = right.consequent.value;  //6 // 获取条件表达式的 true 分支值
	let falseValue = right.alternate.value;   //7 // 获取条件表达式的 false 分支值
	// 如果 nextTest 是一个二元表达式，直接返回
	if (t.isBinaryExpression(nextTest)) return;
	// 获取测试值为 trueValue 的 case 子句及其索引
	let trueData = getItemFromTestValue(path, trueValue);
	let trueItem = trueData[0]; //case 6:.....  // 获取对应的 case 子句
	let trueConse = trueItem.consequent; // 获取对应 case 子句的 consequent 数组
	let trueLen = trueConse.length;// 获取 trueConse 数组的长度
	// 获取测试值为 falseValue 的 case 子句及其索引
	let falseData = getItemFromTestValue(path, falseValue);
	let falseItem = falseData[0]; //case 8:.....  // 获取对应的 case 子句
	let falseConse = falseItem.consequent;// 获取对应 case 子句的 consequent 数组
	let falseLen = falseConse.length;// 获取 falseConse 数组的长度

	// 检查 trueConse 和 falseConse 的倒数第二个表达式是否符合条件
	if (t.isExpressionStatement(trueConse[trueLen-2]) && t.isExpressionStatement(falseConse[falseLen-2]) &&
		  t.isNumericLiteral(trueConse[trueLen-2].expression.right) && t.isNumericLiteral(falseConse[falseLen-2].expression.right) &&
		  trueConse[trueLen-2].expression.right.value == falseConse[falseLen-2].expression.right.value)
	{
			// 创建 if-else 语句节点
			let ifNode = t.ifStatement(nextTest,
      	                         t.blockStatement(trueConse.slice(0, trueLen - 2)),
      	                         t.blockStatement(falseConse.slice(0, falseLen - 2)));
			// 在当前 case 子句的倒数第二个位置插入 ifNode
			consequent.splice(consequent.length - 2, 0, ifNode);
			// 更新倒数第二个表达式的右侧值
      consequent[consequent.length - 2].expression.right = trueConse[trueLen-2].expression.right;  // next = 7

      // 更新 countsMap 和 path.node.cases
      let trueCounts = countsMap.get(trueValue);
      if (trueCounts == 1)
      {
     	  path.node.cases.splice(trueData[1], 1);
     	  let counts = countsMap.get(trueConse[trueLen-2].expression.right.value);
     	  countsMap.set(trueConse[trueLen-2].expression.right.value,counts-1);
     	}
      countsMap.set(trueValue,trueCounts-1);


      falseData = getItemFromTestValue(path, falseValue);
      let falseCounts = countsMap.get(falseValue);
      if (falseCounts == 1)
      {
     	  path.node.cases.splice(falseData[1], 1);
     	  let counts = countsMap.get(trueConse[trueLen-2].expression.right.value);
     	  countsMap.set(trueConse[trueLen-2].expression.right.value,counts-1);
      }
      countsMap.set(falseValue,falseCounts-1);

      let counts = countsMap.get(trueConse[trueLen-2].expression.right.value);
      countsMap.set(trueConse[trueLen-2].expression.right.value,counts+1);

      return true;
	}


	return false;
}


/**
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     p > h ? x = 6 : x = 7;
 *     break;
 *   case 6:
 *     y = 6;
 *     return y;
 *   case 7:
 *     z = 7;
 *     break;
 * }
 *
 *
 * let countsMap = new Map();
 * countsMap.set(1, 1);
 * countsMap.set(6, 1);
 * countsMap.set(7, 1);
 *
 * 转换后：
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     if (p > h) {
 *       y = 6;
 *       return y;
 *     }
 *     x = 7;
 *     break;
 *   case 7:
 *     z = 7;
 *     break;
 * }
 * 转换后：
 *
 *
 * @param path
 * @param item
 * @param countsMap
 * @returns {boolean}
 */


function isCreateReturnNode1(path,item,countsMap)
{
	let {test,consequent} = item;// 从 item 中解构出 test 和 consequent 属性
	let len = consequent.length;// 获取 consequent 数组的长度
	let curValue = test.value;// 获取当前 case 子句的测试值
	let {left,operator,right} = consequent[len-2].expression;// 获取倒数第二个表达式语句的各个部分

		let nextTest = right.test;// 获取右侧表达式的测试部分
		let trueValue  = right.consequent.value;  //6 // 获取条件表达式的 true 分支值
		let falseValue = right.alternate.value;   //7 // 获取条件表达式的 false 分支值
		// 如果 nextTest 是一个二元表达式，直接返回
		if (t.isBinaryExpression(nextTest)) return;
	// 获取测试值为 trueValue 的 case 子句及其索引
    let data = getItemFromTestValue(path, trueValue);
		let trueItem = data[0]; // 获取对应的 case 子句

		let trueConse = trueItem.consequent; // 获取对应 case 子句的 consequent 数组
		let trueLen = trueConse.length;// 获取 trueConse 数组的长度
		// 检查 trueConse 的倒数第二个元素是否是一个返回语句
		if (t.isReturnStatement(trueConse[trueLen-2]))
		{

			 let counts = countsMap.get(trueValue);// 获取 trueValue 对应的计数
			 if (counts == 1)
			 {
			 	// 创建 if 语句节点
			 	let ifNode = t.ifStatement(nextTest, t.blockStatement(trueConse.slice(0,trueLen-1)));
		  	// 在当前 case 子句的倒数第二个位置插入 ifNode
				 consequent.splice(consequent.length - 2, 0, ifNode);
		  	// 更新倒数第二个表达式的右侧值为 falseValue
				 consequent[consequent.length - 2].expression.right = t.numericLiteral(falseValue);  // next = 7
		  	// 从 path.node.cases 中移除 trueItem
		  	path.node.cases.splice(data[1], 1);
			  // 更新 countsMap 中 trueValue 的计数
		  	countsMap.set(trueValue,counts-1);

		  	return true;// 返回 true 表示创建成功
			 }
		}

		return false;	// 返回 false 表示没有创建 if 节点
}


/**
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     p > h ? x = 6 : x = 7;
 *     break;
 *   case 7:
 *     z = 7;
 *     return z;
 * }
 *
 * let countsMap = new Map();
 * countsMap.set(1, 1);
 * countsMap.set(6, 1);
 * countsMap.set(7, 1);
 *
 * 转换后：
 * switch (num) {
 *   case 1:
 *     x = 1;
 *     if (!(p > h)) {
 *       z = 7;
 *       return z;
 *     }
 *     x = 6;
 *     break;
 * }
 *
 *
 * @param path
 * @param item
 * @param countsMap
 * @returns {boolean}
 */

function isCreateReturnNode2(path,item,countsMap)
{
	let {test,consequent} = item;// 从 item 中解构出 test 和 consequent 属性
	let len = consequent.length;// 获取 consequent 数组的长度
	let curValue = test.value;// 获取当前 case 子句的测试值 curValue
	let {left,operator,right} = consequent[len-2].expression; // 获取倒数第二个表达式语句的各个部分

  	let nextTest = right.test;// 获取右侧表达式的测试部分
	let trueValue  = right.consequent.value;  //6 // 获取条件表达式的 true 分支值
	let falseValue = right.alternate.value;   //7 // 获取条件表达式的 false 分支值

	if (t.isBinaryExpression(nextTest)) return;// 如果 nextTest 是一个二元表达式，直接返回

	let data = getItemFromTestValue(path, falseValue);// 获取测试值为 falseValue 的 case 子句及其索引

	let falseItem = data[0]; // 获取对应的 case 子句

	let falseConse = falseItem.consequent;// 获取对应 case 子句的 consequent 数组
	let falseLen = falseConse.length;// 获取 falseConse 数组的长度
	// 检查 falseConse 的倒数第二个元素是否是一个返回语句
	if (t.isReturnStatement(falseConse[falseLen-2]))
	{
		let counts = countsMap.get(falseValue);// 获取 falseValue 对应的计数
		if (counts == 1)
		{
			// 创建一个新的 if 语句节点
			let ifNode = t.ifStatement(t.unaryExpression("!",nextTest), t.blockStatement(falseConse.slice(0,falseLen-1)));
		  // 在当前 case 子句的倒数第二个位置插入 ifNode
			consequent.splice(consequent.length - 2, 0, ifNode);
			// 更新倒数第二个表达式的右侧值为 trueValue
		  consequent[consequent.length - 2].expression.right = t.numericLiteral(trueValue);  // next = 7
		  // 从 path.node.cases 中移除 falseItem
		  path.node.cases.splice(data[1], 1);
		  // 更新 countsMap 中 falseValue 的计数
		  countsMap.set(falseValue,counts-1);

		  return true;// 返回 true 表示创建成功
		}
	}

	return false;	// 返回 false 表示没有创建 if 节点
}


/**
 * switch (value) {
 *   case 1:
 *     x = test1 ? 6 : 7;
 *     break;
 *   case 6:
 *     // Some code
 *     x = 1;
 *     break;
 *   case 7:
 *     // Some other code
 *     break;
 * }
 *
 *
 * 转换后：
 * switch (value) {
 *   case 1:
 *     while (test1) {}
 *
 *     break;
 * }
 *
 *
 * @param path
 * @param item
 * @param countsMap
 * @returns {boolean}
 */

function isCreateWhileNode2(path,item,countsMap)
{
	let {test,consequent} = item;// 从 item 中解构出 test 和 consequent 属性
	let len = consequent.length;// 获取 consequent 数组的长度
	let curValue = test.value;// 获取当前 case 子句的测试值 curValue
	let {left,operator,right} = consequent[len-2].expression;// 获取倒数第二个表达式语句的各个部分

		let nextTest = right.test;// 获取右侧表达式的测试部分
		let trueValue  = right.consequent.value;  //6 // 获取条件表达式的 true 分支值
		let falseValue = right.alternate.value;   //7  // 获取条件表达式的 false 分支值

		if (t.isBinaryExpression(nextTest)) return;// 如果 nextTest 是一个二元表达式，直接返回


		let data = getItemFromTestValue(path, trueValue);
		let trueItem = data[0];  // 获取测试值为 trueValue 的 case 子句及其索引


		let trueConse = trueItem.consequent;// 获取对应 case 子句的 consequent 数组
		let trueLen   = trueConse.length;// 获取 trueConse 数组的长度
	// 检查 trueConse 的倒数第二个元素是否为一个表达式语句，并且右侧值是否为 curValue
	if (t.isExpressionStatement(trueConse[trueLen-2]) &&
		    t.isNumericLiteral(trueConse[trueLen-2].expression.right,{value:curValue}))
		{
			// 获取 trueValue 对应的计数
			let counts = countsMap.get(trueValue);
		  if (counts == 1)
		  {
		  	let whileNode = null;
		  	if(item.consequent.length === 2)
		  	{
				  // 创建一个 while 语句节点
		  		whileNode = t.whileStatement(nextTest, t.blockStatement(trueConse.slice(0, trueLen - 2)));
        }
        else
        {
			// 创建一个带有 if 语句的 while(true) 语句节点
        	whileNode = t.whileStatement(
                      t.booleanLiteral(true),
                      t.blockStatement(consequent.slice(0, consequent.length - 2).concat(t.ifStatement(
                                       nextTest,
                                       t.blockStatement(trueConse.slice(0, trueLen - 2)),
                                       t.blockStatement([t.breakStatement()])))))

        }

        consequent.splice(0, 0, whileNode); // 在 consequent 数组的开头插入 whileNode
        consequent.splice(1, consequent.length - 3);// 移除多余的元素
        consequent[consequent.length - 2].expression.right = t.numericLiteral(falseValue);// 更新倒数第二个表达式的右侧值为 falseValue


      	path.node.cases.splice(data[1], 1);// 从 path.node.cases 中移除 trueItem
      	countsMap.set(trueValue,0);// 将 trueValue 对应的计数设置为 0

      	let curCounts = countsMap.get(curValue);// 获取 curValue 对应的计数
      	countsMap.set(curValue,curCounts - 1);// 将 curValue 对应的计数减 1


        return true;     // 返回 true 表示创建成功
      }
    }

  return false;// 返回 false 表示没有创建 while 节点
}


/**
 * 入度就算：
 * 这个函数 savePrevsCountsToMap 用于遍历一个 switch 语句的所有 case 子句，
 * 并将每个 case 子句的测试值（test.value）和前一个相关项的计数存储在一个 Map 对象中。
 * 具体来说，它的作用是为每个 case 子句计算并保存一个计数，以便后续的代码能够使用这些计数信息。
 *
 *
 *
 * @param path
 * @returns {Map<any, any>}
 */

function savePrevsCountsToMap(path)
{
	let countsMap = new Map();// 创建一个空的 Map 对象
	let {cases} = path.node; // 从 path.node 获取所有的 case 子句
	for (const singleCase of cases)
	{
		let {test} = singleCase;// 获取单个 case 子句的 test 属性
		let value = test.value;// 获取 test 属性的值
		let prevItemCounts = getPrevItemCounts(path, value);// 获取前一个相关项的计数
		countsMap.set(value,prevItemCounts);// 将 value 和 prevItemCounts 存储到 Map 中
	}

	return countsMap;// 返回包含所有计数的 Map
}






const dealWithSwitch =
{
	SwitchStatement(path)
	{

		let {scope,node} = path;

		let countsMap = savePrevsCountsToMap(path);
		//动态变化的
		for (let i=0; i < path.node.cases.length;i++)
		{
			let item = path.node.cases[i];
			let {test,consequent} = item;

			let len = consequent.length;
			if (!t.isExpressionStatement(consequent[len-2]))
			{//过滤掉return语句
				continue;
			}

			let {left,operator,right} = consequent[len-2].expression;

			if (t.isNumericLiteral(right))
			{
				if (isCombinCases(path,item,countsMap))
				{
					i = -1;//每次替换成功后，又从零开始遍历
					continue;
				}
			}
			else if (t.isConditionalExpression(right))//倒数第二个节点右侧本身的节点类型不是 数字时
			{
				//item是switchcase
				if (isCreateWhileNode(path,item,countsMap)|| //过 二元表达式的while构建，下一个自行到自身
				   isCreateWhileIFNode(path,item,countsMap) || //过 有点麻烦
				   isCreateIFNode1(path,item,countsMap) ||//过
				   isCreateIFNode2(path,item,countsMap) ||//过
				   isCreateIFNode3(path,item,countsMap) ||  //过
				   isCreateReturnNode1(path,item,countsMap) || //过 true为return
				   isCreateReturnNode2(path,item,countsMap) || //过 false为return
				   isCreateWhileNode2(path,item,countsMap)//过 不是二元表达式的while构建
				   )
				{
					i = -1;
					continue;
				}
			}
		}
	},
}


traverse(ast, dealWithSwitch);


console.time('穷举还原一些简单的if和for混淆');
//
//
//
// let {code} = generator.default(ast, {
//     compact: false,  // 压缩格式
//     comments: false,  // 注释
//     jsescOption: {
//         minimal: false // 转义
//     }
// });
//
// fs.writeFile(decodeFile, code, (err) => {});


//去除无效节点,case中只存在一个赋值和break语句，赋值的静态传递到使用的地方，然后删除该节点
const combinSingleCase =
{
	SwitchCase(path)
	{
		let {scope,node} = path;
		let {test,consequent} = node;
		if (consequent.length != 2) return;
		if (!t.isExpressionStatement(consequent[0]) ||
		    !t.isBreakStatement(consequent[1]))
		{//不满足条件皆退出
			return;
		}

		let {left,operator,right} = consequent[0].expression;

		if (!t.isIdentifier(left) || operator != "=" || !t.isNumericLiteral(right))
		{//可屏蔽
			return;
		}

		let testValue  = test.value;
		let nextValue  = right.value;
		let switchName = left.name;

		let canBeRemoved = false;

		//把 case 指定的赋值逻辑静态传播到整个作用域。
		scope.traverse(scope.block,
		{
			NumericLiteral(ppath)
			{
				if (ppath.node.value != testValue)
				{//不是当前testValue则退出
					return;
				}
				let assignPath = ppath.findParent(p => p.isAssignmentExpression());  //获取赋值语句父节点
				if (!assignPath || !assignPath.parentPath.isExpressionStatement())
				{//不满足条件皆退出
					return;
				}

				if (!t.isIdentifier(assignPath.node.left,{name:switchName}))
				{//可屏蔽
					return;
				}
				ppath.node.value = nextValue;
			}

		});

		path.remove();
	}
}

traverse(ast, combinSingleCase);



/*
*
*
* 转换前：
* let x = 0;               // binding.path 是 VariableDeclarator

while (1) {               // 处理 WhileStatement
  switch (x) {            // 循环体内只有一个 switch
    case 0:               // switch 只有一个 case
      foo();              // 真实业务语句
      x = 1;              // discriminant 自身的赋值，插件会删除
      break;              // break 也会被删除
  }
}

let y = 0;

for (;;) {
  switch (y) {
    case 0:
      bar();
      y = 2;
      break;
  }
}
*
*
* 转换后：
* foo();
* bar();
*
*
*
* */
const replaceSwitchNOde =
{
	"ForStatement|WhileStatement"(path)
	{
		let {scope,node} = path;
		let body = node.body.body;
		if (body.length != 1 ||
		    !types.isSwitchStatement(body[0]))
		{
			return;
		}
		let {discriminant,cases} = body[0];
		let binding =  path.scope.getBinding(discriminant.name);
		if (!binding || !binding.path ||
		    !binding.path.isVariableDeclarator()) //用于检查当前路径节点是否是一个变量声明符
		{
			return;
		}

		if (cases.length != 1) return;

		let {consequent} = cases[0];

		if (types.isBreakStatement(consequent[consequent.length-1]))
		{
			consequent.pop();
		}
		if (types.isExpressionStatement(consequent[consequent.length-1]) &&
		    types.isAssignmentExpression(consequent[consequent.length-1].expression))
		{

			let {left} = consequent[consequent.length-1].expression;
			if (types.isIdentifier(left,{name:discriminant.name}))
			{
				consequent.pop();
			}
		}

		path.replaceWithMultiple(consequent);

		binding.path.remove();


	}
}


traverse(ast, replaceSwitchNOde);


console.timeEnd('穷举还原一些简单的if和for混淆');



let {code} = generator.default(ast, {
    compact: false,  // 压缩格式
    comments: false,  // 注释
    jsescOption: {
        minimal: false // 转义
    }
});

fs.writeFile(decodeFile, code, (err) => {});