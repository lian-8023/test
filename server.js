// 引入模块
var express = require('express');
var app = express();
var loger = require('./server/log4jsEntry');
var querystring=require('querystring');
// 当服务器进程异常时记录错误日志
process.on('uncaughtException', function (err) {
      loger.errorLog().error('node server restart error: ' + err.stack);
});
/* 路由里的错误日志 */
app.use((error, req, res, next) => {
    if (error) {
      res.json({ msg: error.message?error.message:"", code: error.code?error.code:"" });
      loger.errorLog().error('node server error: ' + ( error?error:"node server error" ));
    }
});

var compression = require('compression');
var path = require('path');
var portConfig = require('./server/port-config/index');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var RedisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');// post 请求

var exphbs  = require('express-handlebars');
const globalJs=require('./utils');
const _env=globalJs.project_env;
const version=globalJs.version;

// 请求接口配置文件
var myOption = require("./server/request-config/option");
var nodejs_env=process.env.nodejs_env;
app.use(compression());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(session({
    resave: true, //:(是否允许)当客户端并行发送多个请求时，其中一个请求在另一个请求结束时对session进行修改覆盖并保存。
    saveUninitialized: true, //初始化session时是否保存到存储
    store: new RedisStore({
        // host:'10.244.76.7',
        // port:'6379',
        host:myOption[nodejs_env].redisHost,
        port:myOption[nodejs_env].redisPort,
        prefix:"NEWPORTAL:SESSION:",
    }),
    secret: 'keyboard cat'
}));

// handlebars config
app.set('views', path.join(__dirname, './client/view'));
app.engine('html', exphbs({
    layoutsDir: 'views',
    defaultLayout: ['main','cp-main'],
    extname: 'html',
}));
app.set('view engine', 'html');
function myLaout(res,_laoutName){
    res.render(_laoutName,{
        layout: false,
        version
    })
    // if(_env=='test'){
    //     res.sendFile(__dirname + `/client/view/${_laoutName}.html`);
    // }else if(_env=='online'||_env=='staging'){
    //     res.render(_laoutName,{
    //         layout: false,
    //         version
    //     })
    // }
}

// app.use路径配置
app.use(express.static(__dirname + '/client/static'));
for(var key in portConfig){
    app.use(key,require(portConfig[key]));
}
app.use('/node',require('./server/nodeRouter'));  //node路由 

app.get('/', function (req, res,next) {
    res.redirect("/portal#/");
    // res.end();
});
// 内部portal返回main.html
app.get('/portal', function (req, res,next) {
    myLaout(res,'main');
});
// 合作方portal返回cp-main.html
app.get('/cp-portal', function (req, res,next) {
    myLaout(res,'cp-main');
});

// 后端登录后跳转的前端地址，并且设置session； portal
app.get('/portal-client', function (req, res) {
    var _jsessionId= Buffer.from(req.query.jsessionId).toString('base64');
    req.session.jsessionId=_jsessionId;
    req.session.loginName=req.query.loginname;
    res.redirect(`/portal#/?userName=${req.query.loginname}`);
});
// 后端登录后跳转的前端地址，并且设置session； cp-portal
app.get('/setSessionId', function (req, res) {  //cp-portal-v1.1 删除
    var _jsessionId= Buffer.from(req.query.jsessionId).toString('base64');
    req.session.jsessionId=_jsessionId;
    req.session.loginName=req.query.loginname;
    res.redirect(`/portal#/?userName=${req.query.loginname}`);
});
// 后端登录后跳转的前端地址，并且设置session；  (ps:获取管理员权限接口有用到 cp-portal 字段)
app.get('/cp-portal-client', function (req, res, next) {
    var getParam={},_query=req.query;
    var _jsessionId= Buffer.from(_query.jsessionId).toString('base64');
    var toRout=req.query.toRout;
    for(key in _query){
        if(key!='jsessionId' && key!='loginname'){
            getParam[key]=_query[key]
        }
    }
    
    var getParam_url=querystring.stringify(getParam);
    if(toRout){ // 默认跳转到征信页面
        req.session.jsessionId=_jsessionId;
        req.session.loginName=req.query.loginname;
        res.redirect(`/cp-portal#/${toRout}?${getParam_url}`);
        return;
    }
    req.session.jsessionId=_jsessionId;
    req.session.loginName=req.query.loginname;
    res.redirect(`/cp-portal#/?userName=${req.query.loginname}`);
});
// 合同列表-单独页面
app.get('/deductions', function (req, res,next) {
    myLaout(res,'deductions');
});
// cp portal 还款列表-单独页面
app.get('/cp-repaymentList', function (req, res,next) {
    myLaout(res,'cp-repaymentList');
});
// cp portal 还款列表-单独页面
app.get('/cp-withholdList', function (req, res,next) {
    myLaout(res,'cp-withholdList');
});
// cp portal 还款列表2F-单独页面
app.get('/cp-withholdList2F', function (req, res,next) {
    myLaout(res,'cp-withholdList2F');
});
// cp portal 文件预览-单独页面
app.get('/cp-fileView', function (req, res,next) {
    myLaout(res,'cp-fileView');
});
// cp portal 历史借款记录-单独页面
app.get('/cp-historyBorrow', function (req, res,next) {
    myLaout(res,'cp-historyBorrow');
});
// xyh 还款列表
app.get('/XYH-repaymentList', function (req, res,next) {
    myLaout(res,'XYH_repaymentList');
});

//测试node服务器是否正常运行
app.get('/frontend_portal/monitor', function (req, res,next) {
    res.send("200");
    res.end();
});

// 启动一个服务，监听端口进入的所有连接请求
var nodejsPort = process.env.nodejs_http_port;
var server = app.listen(nodejsPort || 9004, function(){
    var host = server.address().address;
    var port = server.address().port;
    loger.allLog().info("node server restart successful, Listening at http://%s:%s",host, port);
});

// loger.errorLog().error('pub_http_get error: ' + JSON.stringify(error));