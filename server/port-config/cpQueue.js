var url = require("url");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var multipart = require('connect-multiparty');
var Router = require('router');
var router = Router();

var requestServer = require('../requestServer');
var _requestServer=new requestServer();

//日志
var loger = require('../log4jsEntry');
// loger.errorLog().error(xxx);
var osConfigJs = require("../request-config/osConfig");
var cooperationPortal=osConfigJs.osConfig.cooperationPortal;   //标识请求cp-portal对应的ip及端口

//下载当前查询结果-合作方挂帐入账
router.get('/account/download/result',function(req, res) {
    var arg = url.parse(req.url).query;
    var _url="/account/download/result?isDown=YES"+(arg?arg:'');
    _requestServer.fileDownload(req, res,_url,cooperationPortal);
});
// 上传批量挂帐文件-合作方挂帐入账
router.post('/account/batch',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/account/batch',req.query, cooperationPortal);
});
// 批量整笔结清模版上传-lyf
router.post('/charge/anyamount/batch',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/charge/anyamount/batch',req.query, cooperationPortal);
});
// 债转数据上传-lyf
router.post('/amc/upload',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/amc/upload',req.query, cooperationPortal);
});
// 
router.post('/file/upload',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/file/upload','', cooperationPortal);
});
// 借款凭证excl上传批量下载
router.post('/file/upload/excl',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/file/upload/excl','', cooperationPortal);
});
// 上传结清文件--挂帐入账
router.post('/account/ensure/settle',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/account/ensure/settle','', cooperationPortal);
});

module.exports = router;