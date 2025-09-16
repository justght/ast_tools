
const generator = require("@babel/generator").default;
const types = require("@babel/types");
const cfun_call = require("../createNode/funCall");
const judge_loop = {
    IfStatement(path){
        fix(path)
    }
}



//如果一个if-else的两个分支都执行，说明不是虚假分支
function fix_old(path) {
    var turnNum = function(nums){
        return nums.map(Number);
    }
    const loop_falge1 = {
        "225": [
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "257": [
            true
        ],
        "420": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "513": [
            true
        ],
        "546": [
            false
        ],
        "579": [
            true
        ],
        "1024": [
            true
        ],
        "1091": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "1221": [
            false
        ],
        "1253": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "1312": [
            false
        ],
        "1317": [
            false
        ],
        "1540": [
            true
        ],
        "1601": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "1636": [
            true
        ],
        "1762": [
            true
        ],
        "1792": [
            true
        ],
        "1922": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "2084": [
            true
        ],
        "2276": [
            true
        ],
        "2339": [
            true
        ],
        "2401": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "2531": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "2720": [
            true
        ],
        "2786": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "3105": [
            true
        ],
        "3109": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "3490": [
            true
        ],
        "3619": [
            false
        ],
        "3811": [
            true
        ],
        "3968": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "4192": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "4261": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "4290": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "4321": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "4420": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "4515": [
            true
        ],
        "4640": [
            false
        ],
        "4675": [
            true
        ],
        "4708": [
            true
        ],
        "4835": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "4865": [
            true
        ],
        "4932": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "5185": [
            true
        ],
        "5186": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "5253": [
            false
        ],
        "5282": [
            true
        ],
        "5475": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "5540": [
            false
        ],
        "5669": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "5890": [
            true
        ],
        "6243": [
            false
        ],
        "6245": [
            false
        ],
        "6497": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "6756": [
            true
        ],
        "6816": [
            true
        ],
        "6849": [
            false
        ],
        "6948": [
            true
        ],
        "6978": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "7040": [
            false
        ],
        "7169": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "7173": [
            false
        ],
        "7328": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "7392": [
            true
        ],
        "7554": [
            true
        ],
        "7811": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "7907": [
            false
        ],
        "7968": [
            true
        ],
        "8064": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "8259": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "8322": [
            true
        ],
        "8484": [
            true
        ],
        "8547": [
            true
        ],
        "8676": [
            false
        ],
        "8707": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "8708": [
            true
        ],
        "8739": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "8864": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "8929": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "8963": [
            true
        ],
        "9315": [
            true
        ],
        "9696": [
            false
        ],
        "10339": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "10881": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "11267": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "11457": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "11458": [
            true
        ],
        "11524": [
            true
        ],
        "11713": [
            false
        ],
        "11843": [
            true
        ],
        "11939": [
            false
        ],
        "11940": [
            false
        ],
        "12001": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "12036": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "12065": [
            false
        ],
        "12096": [
            true
        ],
        "12163": [
            true
        ],
        "12483": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "12484": [
            true
        ],
        "12576": [
            true
        ],
        "12577": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "12579": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "12608": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "12612": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "12613": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "12640": [
            false
        ],
        "12737": [
            false
        ],
        "12993": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "13089": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "13154": [
            false
        ],
        "13155": [
            true
        ],
        "13347": [
            true
        ],
        "13731": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "13952": [
            true
        ],
        "14018": [
            true
        ],
        "14341": [
            false
        ],
        "14402": [
            true
        ],
        "14501": [
            false
        ],
        "14788": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "15427": [
            true,
            true,
            true,
            true
        ],
        "15456": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "15521": [
            true
        ],
        "15844": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "15968": [
            true
        ],
        "16160": [
            false
        ],
        "16164": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "16258": [
            false
        ],
        "16418": [
            true
        ],
        "16549": [
            true
        ],
        "16608": [
            true
        ],
        "16677": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "16707": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "16897": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "17092": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "17120": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "17184": [
            true
        ],
        "17219": [
            true
        ],
        "17408": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "17508": [
            false
        ],
        "17632": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "17636": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "17824": [
            true
        ],
        "17921": [
            true
        ],
        "17952": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "17984": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "18048": [
            false
        ],
        "18757": [
            false
        ],
        "18817": [
            true
        ],
        "19138": [
            true
        ],
        "19204": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "19236": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "19329": [
            true
        ],
        "19520": [
            true
        ],
        "19523": [
            true
        ],
        "19713": [
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "19844": [
            true
        ],
        "19877": [
            false
        ],
        "19904": [
            false,
            false
        ],
        "19971": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "19972": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "20034": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "20481": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "20738": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "20962": [
            true
        ],
        "20964": [
            true
        ],
        "21120": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "21505": [
            true
        ],
        "21508": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "21602": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "21701": [
            true
        ],
        "21760": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "21793": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "21956": [
            true
        ],
        "22049": [
            false
        ],
        "22914": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "23396": [
            true
        ],
        "23651": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "23749": [
            true
        ],
        "23877": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "23968": [
            true
        ],
        "23973": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "24066": [
            false
        ],
        "24129": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "24258": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "24356": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "24387": [
            false
        ],
        "24673": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "24929": [
            false
        ],
        "25027": [
            true
        ],
        "25313": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "25376": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "25473": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "25667": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "25699": [
            false
        ],
        "25728": [
            true
        ],
        "25827": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "25857": [
            false
        ],
        "25858": [
            false
        ],
        "25985": [
            true
        ],
        "26080": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "26085": [
            true
        ],
        "26116": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "26117": [
            true
        ],
        "26147": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "26209": [
            true
        ],
        "26210": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "26273": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "26276": [
            false
        ],
        "26337": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "26624": [
            false
        ],
        "26689": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "26787": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "26852": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "27201": [
            true
        ],
        "27458": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "27460": [
            true
        ],
        "27490": [
            false,
            false,
            false,
            false
        ],
        "27491": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "27649": [
            true
        ],
        "27652": [
            true
        ],
        "27744": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "27745": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "27812": [
            true
        ],
        "27874": [
            true
        ],
        "27970": [
            true
        ],
        "28000": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "28002": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "28227": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "28324": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        "28545": [
            true
        ],
        "28900": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "29185": [
            false
        ],
        "29248": [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],
        "29346": [
            true
        ],
        "29538": [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ]
    }
    const loop_falge2 = {
    "225": [
        false
    ],
    "420": [
        true
    ],
    "513": [
        true
    ],
    "579": [
        true
    ],
    "1024": [
        true
    ],
    "1091": [
        false
    ],
    "1253": [
        false
    ],
    "1601": [
        false
    ],
    "1636": [
        true
    ],
    "1922": [
        false
    ],
    "2084": [
        true
    ],
    "2401": [
        false
    ],
    "2531": [
        false
    ],
    "2786": [
        true
    ],
    "3109": [
        false
    ],
    "3490": [
        true
    ],
    "3619": [
        false
    ],
    "3968": [
        false
    ],
    "4192": [
        false
    ],
    "4290": [
        true
    ],
    "4321": [
        false
    ],
    "4420": [
        false
    ],
    "4515": [
        true
    ],
    "4835": [
        false
    ],
    "4865": [
        true
    ],
    "4932": [
        false
    ],
    "5186": [
        false
    ],
    "5249": [
        true
    ],
    "5475": [
        false
    ],
    "5540": [
        false
    ],
    "5669": [
        false
    ],
    "6245": [
        false
    ],
    "6497": [
        false
    ],
    "6756": [
        true
    ],
    "6978": [
        false
    ],
    "7169": [
        false
    ],
    "7328": [
        false
    ],
    "7811": [
        false
    ],
    "7907": [
        false
    ],
    "7968": [
        true
    ],
    "8064": [
        false
    ],
    "8259": [
        false
    ],
    "8322": [
        true
    ],
    "8484": [
        true
    ],
    "8707": [
        false
    ],
    "8739": [
        false
    ],
    "8864": [
        false
    ],
    "8929": [
        false
    ],
    "8963": [
        true
    ],
    "10339": [
        false
    ],
    "10881": [
        true
    ],
    "11267": [
        true
    ],
    "11457": [
        true
    ],
    "11875": [
        false
    ],
    "11940": [
        false
    ],
    "12001": [
        false
    ],
    "12036": [
        false
    ],
    "12065": [
        false
    ],
    "12163": [
        true
    ],
    "12483": [
        false
    ],
    "12579": [
        false
    ],
    "12608": [
        true
    ],
    "12612": [
        true
    ],
    "12613": [
        false
    ],
    "12993": [
        false
    ],
    "13089": [
        true
    ],
    "13154": [
        false
    ],
    "13731": [
        false
    ],
    "14402": [
        true
    ],
    "14788": [
        false
    ],
    "15456": [
        false
    ],
    "15521": [
        true
    ],
    "15844": [
        true
    ],
    "16164": [
        true
    ],
    "16418": [
        true
    ],
    "16707": [
        false
    ],
    "16897": [
        false
    ],
    "17092": [
        true
    ],
    "17120": [
        false
    ],
    "17508": [
        false
    ],
    "17636": [
        false
    ],
    "17729": [
        true
    ],
    "17824": [
        true
    ],
    "17952": [
        false
    ],
    "17984": [
        true
    ],
    "19204": [
        false
    ],
    "19236": [
        false
    ],
    "19520": [
        true
    ],
    "19523": [
        true
    ],
    "19904": [
        false
    ],
    "19971": [
        false
    ],
    "20034": [
        true
    ],
    "20481": [
        false
    ],
    "20738": [
        false
    ],
    "20962": [
        true
    ],
    "21120": [
        false
    ],
    "21508": [
        false
    ],
    "21602": [
        false
    ],
    "21701": [
        true
    ],
    "21793": [
        false
    ],
    "22049": [
        false
    ],
    "22914": [
        false
    ],
    "23396": [
        true
    ],
    "23651": [
        false
    ],
    "23973": [
        false
    ],
    "24066": [
        false
    ],
    "24129": [
        false
    ],
    "24258": [
        false
    ],
    "24356": [
        false
    ],
    "25027": [
        true
    ],
    "25313": [
        false
    ],
    "25376": [
        false
    ],
    "25473": [
        false
    ],
    "25667": [
        false
    ],
    "25857": [
        false
    ],
    "25858": [
        false
    ],
    "26080": [
        false
    ],
    "26085": [
        true
    ],
    "26117": [
        true
    ],
    "26147": [
        false
    ],
    "26209": [
        true
    ],
    "26210": [
        false
    ],
    "26273": [
        false
    ],
    "26337": [
        true
    ],
    "26689": [
        false
    ],
    "26787": [
        false
    ],
    "26852": [
        false
    ],
    "27201": [
        true
    ],
    "27458": [
        false
    ],
    "27490": [
        false
    ],
    "27491": [
        true
    ],
    "27744": [
        false
    ],
    "27745": [
        false
    ],
    "28000": [
        false
    ],
    "28324": [
        true
    ],
    "28900": [
        false
    ],
    "29346": [
        true
    ],
    "29538": [
        true
    ]
}
    const loop_falge = {
    "225": [
        false,
        1040576,
        1040720
    ],
    "420": [
        true,
        319984,
        320120
    ],
    "513": [
        true,
        2331444,
        2331580
    ],
    "579": [
        true,
        448647,
        448791
    ],
    "1024": [
        true,
        897353,
        897442
    ],
    "1091": [
        false,
        1423699,
        1423836
    ],
    "1253": [
        false,
        64021,
        64158
    ],
    "1317": [
        false,
        225155,
        225292
    ],
    "1601": [
        false,
        970695,
        970800
    ],
    "1636": [
        true,
        1414363,
        1414508
    ],
    "1922": [
        false,
        2263537,
        2263682
    ],
    "2084": [
        true,
        2523351,
        2523496
    ],
    "2401": [
        false,
        1968412,
        1968557
    ],
    "2531": [
        false,
        93507,
        93652
    ],
    "2786": [
        true,
        2562693,
        2562838
    ],
    "3109": [
        false,
        2255678,
        2255815
    ],
    "3490": [
        true,
        1494590,
        1494727
    ],
    "3619": [
        false,
        346964,
        347109
    ],
    "3968": [
        false,
        2319909,
        2320054
    ],
    "4192": [
        false,
        468603,
        468748
    ],
    "4290": [
        true,
        1645775,
        1645912
    ],
    "4321": [
        false,
        376778,
        376923
    ],
    "4420": [
        false,
        2574462,
        2574583
    ],
    "4515": [
        true,
        442429,
        442574
    ],
    "4835": [
        false,
        802648,
        802769
    ],
    "4865": [
        true,
        2263386,
        2263531
    ],
    "4932": [
        false,
        256287,
        256408
    ],
    "5186": [
        false,
        504430,
        504575
    ],
    "5475": [
        false,
        629813,
        629934
    ],
    "5540": [
        false,
        2237816,
        2237961
    ],
    "5669": [
        false,
        1652944,
        1653081
    ],
    "6245": [
        false,
        733849,
        733954
    ],
    "6497": [
        false,
        1709472,
        1709617
    ],
    "6756": [
        true,
        1745857,
        1746002
    ],
    "6978": [
        false,
        446287,
        446432
    ],
    "7169": [
        false,
        1662074,
        1662211
    ],
    "7173": [
        false,
        2449365,
        2449510
    ],
    "7328": [
        false,
        910210,
        910355
    ],
    "7811": [
        false,
        1668746,
        1668867
    ],
    "7907": [
        false,
        2347582,
        2347687
    ],
    "7968": [
        true,
        1040425,
        1040570
    ],
    "8064": [
        false,
        520892,
        521029
    ],
    "8259": [
        false,
        1370465,
        1370610
    ],
    "8322": [
        true,
        471976,
        472113
    ],
    "8484": [
        true,
        1899429,
        1899550
    ],
    "8707": [
        false,
        742063,
        742208
    ],
    "8739": [
        false,
        329168,
        329313
    ],
    "8864": [
        false,
        753530,
        753667
    ],
    "8929": [
        false,
        1290319,
        1290456
    ],
    "8963": [
        true,
        128462,
        128599
    ],
    "10339": [
        false,
        987910,
        988016
    ],
    "10881": [
        true,
        913738,
        913844
    ],
    "11267": [
        true,
        194540,
        194678
    ],
    "11457": [
        true,
        17614,
        17736
    ],
    "11940": [
        false,
        1945397,
        1945535
    ],
    "12001": [
        false,
        410544,
        410682
    ],
    "12036": [
        false,
        1962991,
        1963113
    ],
    "12065": [
        false,
        2080523,
        2080669
    ],
    "12163": [
        true,
        1007909,
        1008055
    ],
    "12483": [
        false,
        1031904,
        1032042
    ],
    "12579": [
        false,
        1342620,
        1342758
    ],
    "12608": [
        true,
        520127,
        520273
    ],
    "12612": [
        true,
        469299,
        469421
    ],
    "12613": [
        false,
        1135172,
        1135318
    ],
    "12993": [
        false,
        1338179,
        1338285
    ],
    "13089": [
        true,
        416538,
        416684
    ],
    "13154": [
        false,
        2606207,
        2606273
    ],
    "13731": [
        false,
        832240,
        832362
    ],
    "14402": [
        true,
        1310152,
        1310298
    ],
    "14788": [
        false,
        2417431,
        2417577
    ],
    "15456": [
        false,
        338244,
        338382
    ],
    "15521": [
        true,
        230479,
        230617
    ],
    "15844": [
        true,
        482826,
        482972
    ],
    "16164": [
        true,
        1214057,
        1214203
    ],
    "16258": [
        false,
        2307081,
        2307227
    ],
    "16418": [
        true,
        1910146,
        1910292
    ],
    "16707": [
        false,
        909761,
        909907
    ],
    "16897": [
        false,
        463699,
        463845
    ],
    "17092": [
        true,
        1394750,
        1394896
    ],
    "17120": [
        false,
        1968862,
        1969008
    ],
    "17508": [
        false,
        2561086,
        2561232
    ],
    "17636": [
        false,
        1070024,
        1070170
    ],
    "17824": [
        true,
        1957513,
        1957651
    ],
    "17952": [
        false,
        1849915,
        1850021
    ],
    "17984": [
        true,
        2430907,
        2431013
    ],
    "19204": [
        false,
        2225468,
        2225614
    ],
    "19236": [
        false,
        1627181,
        1627303
    ],
    "19520": [
        true,
        586012,
        586150
    ],
    "19523": [
        true,
        173765,
        173903
    ],
    "19904": [
        false,
        1431680,
        1431802
    ],
    "19971": [
        false,
        70451,
        70589
    ],
    "20034": [
        true,
        560098,
        560244
    ],
    "20481": [
        false,
        2229282,
        2229428
    ],
    "20738": [
        false,
        825307,
        825445
    ],
    "20962": [
        true,
        1716973,
        1717119
    ],
    "21120": [
        false,
        1566587,
        1566733
    ],
    "21508": [
        false,
        1480641,
        1480787
    ],
    "21602": [
        false,
        2185698,
        2185836
    ],
    "21701": [
        true,
        1849803,
        1849909
    ],
    "21793": [
        false,
        812499,
        812637
    ],
    "22049": [
        false,
        2141848,
        2141954
    ],
    "22914": [
        false,
        856082,
        856228
    ],
    "23396": [
        true,
        1380598,
        1380736
    ],
    "23651": [
        false,
        1648069,
        1648207
    ],
    "23968": [
        true,
        1429939,
        1430077
    ],
    "23973": [
        false,
        1352921,
        1353067
    ],
    "24066": [
        false,
        2104787,
        2104933
    ],
    "24129": [
        false,
        629339,
        629445
    ],
    "24258": [
        false,
        411592,
        411738
    ],
    "24356": [
        false,
        2520749,
        2520887
    ],
    "25027": [
        true,
        1375095,
        1375241
    ],
    "25313": [
        false,
        2246568,
        2246714
    ],
    "25376": [
        false,
        834044,
        834190
    ],
    "25473": [
        false,
        2248454,
        2248592
    ],
    "25667": [
        false,
        570765,
        570903
    ],
    "25857": [
        false,
        761661,
        761807
    ],
    "25858": [
        false,
        2021296,
        2021442
    ],
    "26080": [
        false,
        58317,
        58455
    ],
    "26085": [
        true,
        1859604,
        1859726
    ],
    "26117": [
        true,
        1385971,
        1386117
    ],
    "26147": [
        false,
        1490313,
        1490451
    ],
    "26209": [
        true,
        858229,
        858375
    ],
    "26210": [
        false,
        281047,
        281169
    ],
    "26273": [
        false,
        448797,
        448943
    ],
    "26337": [
        true,
        1431552,
        1431674
    ],
    "26689": [
        false,
        2003327,
        2003465
    ],
    "26787": [
        false,
        1537437,
        1537575
    ],
    "26852": [
        false,
        2468918,
        2469056
    ],
    "27201": [
        true,
        2319757,
        2319903
    ],
    "27458": [
        false,
        14669,
        14807
    ],
    "27490": [
        false,
        416690,
        416836
    ],
    "27491": [
        true,
        400839,
        400977
    ],
    "27744": [
        false,
        1420496,
        1420642
    ],
    "27745": [
        false,
        607633,
        607739
    ],
    "28000": [
        false,
        560250,
        560395
    ],
    "28324": [
        true,
        845001,
        845139
    ],
    "28900": [
        false,
        1448745,
        1448883
    ],
    "29346": [
        true,
        389965,
        390111
    ],
    "29538": [
        true,
        1071371,
        1071509
    ]
}
    const loog_key = Object.keys(loop_falge);
    const loog_keys = turnNum(loog_key)
    const node = path.node;
    var switch_array = ['zbj_Si', 'wi', 'Ei'];
    var test_var = '';
    // try{
    //    var tt =  node.alternate.body.length
    // }catch{
    //     debugger;
    // }

    if(!node.consequent || !node.alternate){
        return;
    }
    if(!types.isBlockStatement(node.consequent) || !types.isBlockStatement(node.alternate)){
        return;
    }
    try{
        if(node.consequent.body.length != 1 || node.alternate.body.length != 1){
        return;
    }
    }catch{
        debugger;
    }

    if(!types.isExpressionStatement(node.consequent.body[0])
        || !types.isExpressionStatement(node.alternate.body[0])
        || !types.isAssignmentExpression(node.alternate.body[0].expression)
        || !types.isAssignmentExpression(node.consequent.body[0].expression)
    ){
        return;
    }
    console.log(generator(node,{retainLines: false,comments: false, compact: true, minified: true}).code);
    if(node.consequent.body[0].expression.left.name != 'Si' && node.alternate.body[0].expression.left.name != 'Si'){
        return;
    }

    if (types.isAssignmentExpression(node.test)) {
        test_var = node.test.left.name;

    } else if (types.isIdentifier(node.test)) {
        test_var = node.test.name;
    } else {
        console.log("未知结构:............");
        return;
    }

    if (switch_array.indexOf(test_var) <= -1) {
        const left_t = node.consequent.body[0].expression.right.value;
        const right_t = node.alternate.body[0].expression.right.value;

        if((loog_keys.indexOf(left_t) >= 0 && loog_keys.indexOf(right_t) >= 0) || (loog_keys.indexOf(left_t) < 0 && loog_keys.indexOf(right_t) < 0)){
            console.log('不是虚假分支:',generator(path.node,{retainLines: false,comments: false, compact: true, minified: true}).code)
        }
        else if((loog_keys.indexOf(left_t)>=0 && loog_keys.indexOf(right_t) < 0) || (loog_keys.indexOf(left_t)<0 && loog_keys.indexOf(right_t) >= 0)){
            let ar_k = ''
            if(loog_keys.indexOf(left_t)>=0){
                ar_k = loop_falge[String(loog_keys[loog_keys.indexOf(left_t)])]
            }else if(loog_keys.indexOf(right_t) >= 0){
                ar_k = loop_falge[String(loog_keys[loog_keys.indexOf(right_t)])]
            }
            c_node_start = node.consequent.start
            c_node_end = node.consequent.end

            a_node_start = node.alternate.start
            a_node_end = node.alternate.end

            if((ar_k.indexOf(c_node_start)>=0 && ar_k.indexOf(c_node_end)>=0) || (ar_k.indexOf(a_node_start)>=0 && ar_k.indexOf(a_node_end)>=0)){
                console.log("目测虚假分支:",generator(path.node,{retainLines: false,comments: false, compact: true, minified: true}).code)
            }

        }
    }
}


function fix(path){
    var loop_env_v = ["go","fe","Fo","te","ti","fe","xe","K"];
    node = path.node;
    if(!node.consequent || !node.alternate){
        return;
    }
    if(!types.isBlockStatement(node.consequent) || !types.isBlockStatement(node.alternate)){
        return;
    }
    try{
        if(node.consequent.body.length != 1 || node.alternate.body.length != 1){
        return;
    }
    }catch{
        debugger;
    }

    if(!types.isExpressionStatement(node.consequent.body[0])
        || !types.isExpressionStatement(node.alternate.body[0])
        || !types.isAssignmentExpression(node.alternate.body[0].expression)
        || !types.isAssignmentExpression(node.consequent.body[0].expression)
    ){
        return;
    }
    // console.log(generator(node,{retainLines: false,comments: false, compact: true, minified: true}).code);
    if(node.consequent.body[0].expression.left.name != 'Si' && node.alternate.body[0].expression.left.name != 'Si'){
        return;
    }

    if (types.isAssignmentExpression(node.test)) {
        test_var = node.test.left.name;

    } else if (types.isIdentifier(node.test)) {
        test_var = node.test.name;
    } else {
        console.log("未知结构:............",generator(node,{retainLines: false,comments: false, compact: true, minified: true}).code);
        return;
    }

    if(loop_env_v.indexOf(test_var) >= 0){
        parentNode = path.parentPath;
        if(types.isBlockStatement(parentNode)){
            index_id = parentNode.node.body.indexOf(path.node);
            parentNode.node.body[index_id] = node.consequent.body[0];
        }
        else{
            console.log("情况未知:",generator(node,{retainLines: false,comments: false, compact: true, minified: true}).code)
        }

    }
}
exports.fix = judge_loop