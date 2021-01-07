var http = require('http');
var inv = process.env.nodejs_env;
var url = require("url");
var express = require('express');
var session = require('express-session');
var Router = require('router');
var router = Router();

var fs = require('fs');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var res_Code = require('../responseCode');
var _CodeJs = new res_Code();

var requestServer = require('../requestServer');
var _requestServer=new requestServer();

//日志
var loger = require('../log4jsEntry');
//loger.useLog().info('测试日志');

// 公司queue的合同号--根据手机号、accountId查询当前账户的
router.get('/getCQLoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/companySearch/getCompanyQueueLoanNumber?', arg);
});
// 获取voe当前合同号--根据手机号、accountId查询当前账户的
router.get('/getVOELoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/voeQueue/getVoeQueueLoanNumber?', arg);
});
// 获取vor当前合同号--根据手机号、accountId查询当前账户的
router.get('/getVORLoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/vorQueue/getVorQueueLoanNumber?', arg);
});
// 获取ocr当前合同号--根据手机号、accountId查询当前账户的
router.get('/getOCRLoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/ocrQueue/getOcrLoanNumber?', arg);
});
// 获取LP当前合同号--根据手机号、accountId查询当前账户的
router.get('/getLPLoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/lp/getLpLoanNumbers?', arg);
});
// 获取Decline_LP LP当前合同号--根据手机号、accountId查询当前账户的
router.get('/getDeclineLpLoanNumbers',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/decline-lp/getDeclineLpLoanNumbers?', arg);
});
// 获取APPROVE当前合同号--根据手机号、accountId查询当前账户的
router.get('/getApproveLoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/approveQueue/getLoanNumber?', arg);
});
// 获取fraud当前合同号--根据手机号、accountId查询当前账户的
router.get('/getFRAUDLoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/fraudQueue/getLoanNumber?', arg);
});


// 根据合同号查询公司搜索queue
router.get('/searchCompanyQByLoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/companySearch/searchCompanyQByLoanNumber?', arg);
});


// 公司搜索数据处理情况
router.get('/getCompanySearchCount',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/companySearch/getCompanySearchCount?', arg);
});
// voe数据处理情况
router.get('/getVoeQueueCount',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/voeQueue/getVoeQueueCount?', arg);
});
// vor数据处理情况
router.get('/getVorQueueCount',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/vorQueue/getVorQueueCount?', arg);
});
// ocr数据处理情况
router.get('/getOcrCount',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/ocrQueue/getOcrCount?', arg);
});
// lp数据处理情况
router.get('/getLpCount',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/lp/getLpCount?', arg);
});
// fraud数据处理情况
router.get('/getFraudCount',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/fraudQueue/getFraudQueueCount?', "1=1");
});
// approve数据处理情况
router.get('/getApproveQueueCount',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/approveQueue/getApproveQueueCount?', arg);
});

// 通过合同号获取vor
router.get('/getVorQueueByLoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/vorQueue/getVorQueueByLoanNumber?', arg);
});
// 通过loanNumber查询OCR的数据
router.get('/getOcrQueueByLoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/ocrQueue/getOcrQueueByLoanNumber?', arg);
});
// 通过loanNumber查询OCR的数据
router.get('/getApproveQueueByLoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/approveQueue/getApproveQueueByLoanNumber?', arg);
});
// 通过loan_number查询FraudQueue数据
router.get('/getFraudQueueByLoanNumber',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/fraudQueue/getFraudQueueByLoanNumber?', arg);
});
//公司搜索--点击搜索下一条
router.get('/companySearchNext',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/companySearch/next?', arg);
});
//OCR--点击搜索下一条
router.get('/ocrQueueNext',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/ocrQueue/next?', arg);
});
//lp--点击搜索下一条
router.get('/lpQueueNext',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/lp/next?', arg);
});
//approve--点击搜索下一条
router.get('/approveQueueNext',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/approveQueue/next?', arg);
});
//fraud--点击搜索下一条
router.get('/fraudQueueNext',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/fraudQueue/next?', arg);
});

// 保存接口
// 天眼查大峰查接口
router.get('/getCompanyQuery',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/companySearch/getCompanyQuery?', arg);
});
// 精确查询大蜂查号码
router.get('/getCompanyPhoneByName',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/companySearch/getCompanyPhoneByName?', arg);
});
// 保存公司搜索记录
router.get('/saveCompanyQueryRecord',function(req, res) {
    _requestServer.http_post(req, res, '/companySearch/saveCompanyQueryRecord', req.query);
});
// 保存公司搜索记录
router.get('/saveCompanyQueueRecord',function(req, res) {
    loger.allLog().info("保存公司搜索记录:"+JSON.stringify(req.query));
    _requestServer.http_post(req, res, '/companySearch/saveCompanyQueueRecord', req.query);
});
// Voe 保存工作信息核实记录
router.get('/saveWorkCheckInfo',function(req, res) {
    _requestServer.http_post(req, res, '/voeQueue/saveWorkCheckInfo', req.query);
});
// 保存voe操作记录
router.get('/saveVoeQueue',function(req, res) {
    loger.allLog().info("保存voe操作记录:"+JSON.stringify(req.query));
    _requestServer.http_post(req, res, '/voeQueue/saveVoeQueue', req.query);
});

// 保存vor家庭联系人信息
router.get('/saveHousemanCheckInfo',function(req, res) {
    _requestServer.http_post(req, res, '/vorQueue/saveHousemanCheckInfo', req.query);
});
// 保存vor其他联系人信息
router.get('/saveLinkmanCheckInfo',function(req, res) {
    _requestServer.http_post(req, res, '/vorQueue/saveLinkmanCheckInfo', req.query);
});
// 保存vor其他联系人2信息
router.get('/saveLinkman2CheckInfo',function(req, res) {
    _requestServer.http_post(req, res, '/vorQueue/saveLinkman2CheckInfo', req.query);
});
// 保存vor Q
router.get('/saveVorQueue',function(req, res) {
    loger.allLog().info("保存vor操作记录:"+JSON.stringify(req.query));
    _requestServer.http_post(req, res, '/vorQueue/saveVorQueue', req.query);
});

// 保存ocr Queue
router.get('/saveOcrQueue',function(req, res) {
    loger.allLog().info("保存ocr操作记录:"+JSON.stringify(req.query));
    _requestServer.http_post(req, res, '/ocrQueue/saveOcrQueue', req.query);
});
// 保存ocr辅助证明类型文件数据
router.get('/saveOcrCertificates',function(req, res) {
    _requestServer.http_post(req, res, '/ocrQueue/saveOcrCertificates', req.query);
});
// lp queue保存操作
router.post('/saveLpQueue',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/lp/saveLpQueue', _param);
});
// 保存Approve数据
router.post('/saveApprove',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/approveQueue/saveApprove', _param);
});
// LP/APPROVE放款后追加案例记录-lyf
router.post('/appendLoanRecord',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/lp/appendLoanRecord', _param);
});
// 保存Fraud数据
router.get('/saveFraud',function(req, res) {
    loger.allLog().info("保存fraud操作记录:"+JSON.stringify(req.query));
    _requestServer.http_post(req, res, '/fraudQueue/saveFraud', req.query);
});

//重跑模型
router.get('/remodelFromQueue',function(req, res) {
    _requestServer.http_post(req, res, '/remodel/remodelFromQueue', req.query);
});
//获取aprove还款列表
router.get('/getAmortizations',function(req, res) {
    _requestServer.http_post(req, res, '/loan/getAmortizations', req.query);
});
// 公司搜索-网络搜索保存
router.post('/networkSearchSave',urlencodedParser,function(req, res) {
    var _param = req.body.josnParam;
    _requestServer.http_post_body(req, res, '/companySearch/networkSearchSave',_param);
});
// 公司搜索-网络搜索
router.get('/networkSearch',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/companySearch/networkSearch?', arg);
});
// 公司搜索-电话号码归属地查询
router.get('/searchPhoneCity',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/companySearch/searchPhoneCity?', arg);
});
// LP计算器-lyf
router.post('/calculator',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/lp/calculator', _param);
});

module.exports = router;