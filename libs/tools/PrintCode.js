
const generator = require("@babel/generator").default;

const pt = {
    PrintCode: function (path) {
        // console.log(path.toString());
        console.log(generator(path.node).code)
    }
}



module.exports = pt