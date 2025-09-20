function dealWithCaseNum(Li_case_num,Ci_case_num,mi_case_num){
    let switchBaseNum = '520';    // 有控制流的数值是0不能作为首位，所以提供一个基础数字
    if(mi_case_num < 10){
        mi_case_num = "0" + mi_case_num
    }
    if(Ci_case_num < 10){
        Ci_case_num = "0" + Ci_case_num
    }
    if(Li_case_num < 10){
        Li_case_num = "0" + Li_case_num
    }
    CaseNum = switchBaseNum + Li_case_num + Ci_case_num + mi_case_num  // 根据外层到内一次作为记号
    return parseInt(CaseNum)    // 返回number类型的数值
}

function count_li_Value(value){
  /*
  value为我们提前li等于后面的一个值，拿出来计算
  */
    var li = 31 & value,
    gi = value >> 5,        // 中间变量
    Ci = 31 & gi,
    mi = 31 & gi >> 5;
    if(li < 6 ){        // 只有li是 0,1,2,3,4,5才可以通过我们自己定义的变量，后面的不是三层switch不能用
        newValue = dealWithCaseNum(li,Ci,mi)
    }else{
        newValue = li
    }
    return newValue
}
// 三层switch转一层
var switch_3to1 = {
    SwitchCase:{
        exit(path){
            let {parentPath,node} = path;
            if(parentPath.node.discriminant.name != "mi"){
                return;
            }
            let mi_case_num = node.test.value
            let Ci_case_num = parentPath.parentPath.node.test.value
            let Li_case_num = parentPath.parentPath.parentPath.parentPath.node.test.value
            CaseNum = dealWithCaseNum(Li_case_num,Ci_case_num,mi_case_num)    // 处理得到新的case编号
            // console.log(Li_case_num,Ci_case_num,mi_case_num,'------->',CaseNum)
            path.node.test.value = CaseNum   // 更换编号
            parentPath.parentPath.parentPath.parentPath.insertBefore(path.node)
            path.remove()
    }}
}

// 修改  li = 15941;  改为 我们规定的模块变量  规则 count_li_Value
var amendStatueValue = {
    AssignmentExpression(path){
        let {left,right} = path.node;
        if(!types.isIdentifier(left,{"name": "li"}) || !types.isNumericLiteral(right)){
            return
        }

        let newValue = count_li_Value(right.value)
        // console.log(right.value,'------->',newValue)
        right.value = newValue
    },
    VariableDeclarator(path){
        let {id,init} = path.node;
        if(!types.isIdentifier(id,{"name": "li"}) || !types.isNumericLiteral(init)){
            return;
        }
        let newValue = count_li_Value(init.value)
        // console.log(init.value,'------->',newValue)
        init.value = newValue
    } 
}


function reconstructL(L, x, d, high = 0) {
  // high 是高 8 位（第 24–31 位），如果不知道可以默认 0
  return (high << 24) | (L << 16) | (x << 8) | d;
}
console.log(reconstructL(76,0,0))
