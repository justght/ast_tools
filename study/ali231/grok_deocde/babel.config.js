// babel.config.js
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    './control-flow-unflattener.js' // 你的插件路径
  ]
};