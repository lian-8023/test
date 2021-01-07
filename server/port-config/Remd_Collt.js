/**
 * reminder & collection接口
 */
var url = require("url");
var express = require('express');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var router = express.Router();
var multipart = require('connect-multiparty');

var requestServer = require('../requestServer');
var _requestServer=new requestServer();

var res_Code = require('../responseCode');
var _CodeJs = new res_Code();
//日志
var loger = require('../log4jsEntry');
//loger.useLog().info('测试日志');

//获取reminder数据处理情况
router.post('/getReminderCount',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/reminderQueue/getReminderCount', _param);
});
// reminder搜索
// router.post('/RmdSearch',urlencodedParser,function(req, res) {
//     var _param = req.body;
//     _requestServer.http_post(req, res, '/reminderQueue/searchRemindListByConditions', _param);
// });
router.get('/RmdSearch',function(req, res) {
    var arg = req.query;
    _requestServer.http_post(req, res, '/reminderQueue/searchRemindListByConditions', arg);
});
// 搜索下一条
router.post('/remindNext',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/reminderQueue/remindNext', _param);
});
// 获取records记录
router.get('/getRemdRecods',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/reminderQueue/getRemindQueueByLoanNumber?', arg);
});
// reminder保存
router.post('/saveRemdQueue',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/reminderQueue/saveRemindQueue', _param);
});
// 导出记录
router.get('/exportRemindList',function(req, res) {
    var arg = url.parse(req.url).query;
    var _url="/reminderQueue/exportRemindList?"+arg;
    _requestServer.fileDownload(req, res,_url);
});
// reminder改派
router.post('/changeBelongToOther',urlencodedParser,function(req, res) {
    var _param = req.body.josnParam;
    _requestServer.http_post_body(req, res, '/reminderQueue/changeBelongToOther',_param);
});
// 手动发送remind提醒短信-lyf
router.post('/sendRemindSms',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/reminderQueue/sendRemindSms', _param);
});

// ========================  Collection  ====================================
// 委外公司列表
router.get('/companyLIst',function(req, res) {
    _requestServer.http_get(req, res, '/external/companyList?1=1', '');
});
// 搜索
router.get('/ColtSearch',function(req, res) {
    var arg = req.query;
    _requestServer.http_post(req, res, '/collection/list', arg);
});
// 获取枚举初始值
router.post('/initial',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/collection/initial', _param);
});
// 导出记录
router.get('/exportCollectionList',function(req, res) {
    var arg = url.parse(req.url).query;
    var _url="/collection/export?"+arg;
    _requestServer.fileDownload(req, res,_url);
});
// 改派
router.post('/reassignment',urlencodedParser,function(req, res) {
    var _param = req.body.josnParam;
    _requestServer.http_post_body(req, res, '/collection/reassignment',_param);
});
// 委外
router.post('/outSourcing',urlencodedParser,function(req, res) {
    var _param = req.body.josnParam;
    _requestServer.http_post_body(req, res, '/collection/outSourcing', _param);
});
// 搜索下一条
router.post('/collectionNext',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/collection/next', _param);
});
// 搜索下十条
router.post('/collection/bindByTen',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/collection/bindByTen', _param);
});
// 保存record
router.post('/saveCollQueue',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/collection/saveRecords', _param);
});

// ========================  委外  ====================================

// 搜索
router.post('/externalList',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/external/list', _param);
});
// 导出记录
router.get('/exportExternalList',function(req, res) {
    var arg = url.parse(req.url).query;
    var _url="/external/export?"+arg;
    _requestServer.fileDownload(req, res,_url);
});
// 结案
router.post('/externalSettle',urlencodedParser,function(req, res) {
    var _param = req.body.josnParam;
    _requestServer.http_post_body(req, res, '/external/settle', _param);
});
// ========================  前期费  ====================================
//获取初始化枚举值
router.get('/getUpfrontFeeInitEnum',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/upfrontFee/getUpfrontFeeInitEnum?1=1', arg);
});
// 搜索
router.post('/getUpfrontFeeList',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/upfrontFee/getUpfrontFeeList', _param);
});
//下一条
router.get('/getUpfrontFeeDetail',function(req, res) { 
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/upfrontFee/getUpfrontFeeDetail?', arg);
});
//保存操作记录
router.post('/saveQrecord',urlencodedParser,function(req, res) {
    var _param = req.body.josnParam;
    _requestServer.http_post_body(req, res, '/upfrontFee/toSaveAfterQueryUpfrontFeeRecords', _param);
});
//改派
router.post('/reassignmentUpfrontFee',urlencodedParser,function(req, res) {
    var _param = req.body.josnParam;
    _requestServer.http_post_body(req, res, '/upfrontFee/reassignmentUpfrontFee',_param);
});
// 导出记录
router.get('/upfrontFeEexport',function(req, res) {
    var arg = url.parse(req.url).query;
    var _url="/upfrontFee/export?"+arg;
    _requestServer.fileDownload(req, res,_url);
});
//改派
router.post('/external/reassignCompany',urlencodedParser,function(req, res) {
    var _param = req.body.josnParam;
    _requestServer.http_post_body(req, res, '/external/reassignCompany',_param);
});
// 上传合同号
router.post('/external/upload',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/external/upload', req.query);
});

module.exports = router;