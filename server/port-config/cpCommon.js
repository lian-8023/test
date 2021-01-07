var url = require("url");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var Router = require('router');
var router = Router();

var requestServer = require('../requestServer');
var _requestServer=new requestServer();

//日志
var loger = require('../log4jsEntry');
// loger.errorLog().error(xxx);
var osConfigJs = require("../request-config/osConfig");
var cooperationPortal=osConfigJs.osConfig.cooperationPortal;   //标识请求cp-portal对应的ip及端口

//获取所有管理员list
router.get('/rule/all/list',function(req, res) {
    _requestServer.http_get(req, res, '/rule/all/list?1=1',"",cooperationPortal);
});
//获取所有管理员组
router.get('/rule/reV/list',function(req, res) {
    _requestServer.http_get(req, res, '/rule/reV/list?1=1',"",cooperationPortal);
});
module.exports = router;