var path = require("path");
const _env = require('../../utils').project_env;
let config = {
  test: {
    modeName: 'development',
    devtoolName: 'chean-module-source-map',
    isWatch:true
  },
  online: {
    modeName: 'production',
    devtoolName: false,
    isWatch:false
  }
}

module.exports = {
  // 默认false，不开启
  watch: config[_env].isWatch,
  // 只有开启时，watchOptions才有意义
  watchOptions: {
    // 忽略，支持正则
    ignored: /node_modules/,
    // 当第一个文件更改，会在重新构建前增加延迟。这个选项允许 webpack 将这段时间内进行的任何其他更改都聚合到一次重新构建里。毫秒
    aggregateTimeout:300,
    // 怕乱文件是否变化是通过不停询问系统指定文件有没变化实现的，默认每秒1000次
    poll:1000
  },
  mode: config[_env].modeName, //"development" | "production" | "none"
  entry: {
    "main": ['./js/view/entry.jsx'],
    "cp-main": ['./js/view/cp-entry.jsx'],
  },
  output: {
    path: path.resolve(__dirname, "./build"),
    publicPath: "./build/",
    filename: "[name].bundle.js", //[name]的意思是根据入口文件的名称，打包成相同的名称，有几个入口文件，就可以打包出几个文件。
    chunkFilename: "[name].chunk.js"
  },
  devtool: config[_env].devtoolName,
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [{
        test: /\.less$/,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader", "less-loader"]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(jsx|js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-1'],
          plugins: ['transform-decorators-legacy', 'transform-decorators']
        }
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.svg/,
        loader: 'file-loader'
      }
    ]
  },
  optimization: { //对代码进行拆分
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "commons", //拆分出来块的名字(Chunk Names)
          chunks: "initial", //表示显示块的范围，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
          minChunks: 2 //在分割之前模块的被引用次数
        }
      }
    }
  },
  //关闭 webpack 的性能提示
  performance: {
    hints: false
  }
};