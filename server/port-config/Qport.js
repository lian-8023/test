/**
 * Created by Administrator on 2016/12/30.
 */
var http = require('http');
var inv = process.env.nodejs_env;
var url = require("url");
var express = require('express');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var router = express.Router();
var multipart = require('connect-multiparty');

var res_Code = require('../responseCode');
var _CodeJs = new res_Code();

var requestServer = require('../requestServer');
var _requestServer=new requestServer();

//日志
var loger = require('../log4jsEntry');
//loger.useLog().info('测试日志');

// 导出短信记录excl-lyf
router.get('/exportSmsRecordsExcl',function(req, res) {
    var arg = url.parse(req.url).query;
    var _url="/sms/exportSmsRecordsExcl?"+arg;
    _requestServer.fileDownload(req, res,_url);
});
// 导出实时任务-lyf
router.get('/exportTRtask',function(req, res) {
    var arg = url.parse(req.url).query;
    var _url="/rtTask/exportRt?"+arg;
    _requestServer.fileDownload(req, res,_url);
});
// 核对结果导出记录
router.get('/exportReconRecordsExcl',function(req, res) {
    var arg = url.parse(req.url).query;
    var _url="/recon/exportReconRecordsExcl?"+arg;
    _requestServer.fileDownload(req, res,_url);
});
// 导出数据明细excel
router.get('/exportReconDetailsRecordsExcl',function(req, res) {
    var arg = url.parse(req.url).query;
    var _url="/recon/exportReconDetailsRecordsExcl?"+arg;
    _requestServer.fileDownload(req, res,_url);
});
// 上传对账文件
router.post('/dataUpLoadFile',multipart(),function(req, res) {
    var _param = req.query.channel;
    _requestServer.upLoadFile_post(req, res, '/recon/uploadReconFile/'+_param, "");
});
// 外呼短信Q，新增短信群发功能，点击上传批量模板
router.post('/debtUploadExcel',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/debt/uploadExcel', "");
});
// 上传
router.post('/uploadExcelSendMsg',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/sms/uploadExcelSendMsg', "");
});
// 委外批量导入
router.post('/collection/bulkImportOutSourcing',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/collection/bulkImportOutSourcing', "");
});
// 诉讼批量导入
router.post('/collection/bulkImportLawsuit',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/collection/bulkImportLawsuit', "");
});
//财务数据上传
router.post('/finance',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/file/finance/upload', "",'cooperationPortal');
});
// 导出数据明细excel
router.get('/exportDebtExcl',function(req, res) {
    var _url="/debt/exportPDF";
    _requestServer.fileDownload(req, res,_url);
});
// 上传文件--上报数据
router.post('/alchemist',multipart(),function(req, res) {
    var _param=req.query;
    _requestServer.upLoadFile_post(req, res, '/file/upload/alchemist-excl',_param);
});
// ast上传身份证
router.post('/astUpLoadFile',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/ast/step1/upload', req.query);
});


module.exports = router;