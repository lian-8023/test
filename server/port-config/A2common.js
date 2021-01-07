/**
 * Created by Administrator on 2016/12/30.
 */

var osCnfigJs = require("../request-config/osConfig");
var myOption = require("../request-config/option");
var nodejs_env=process.env.nodejs_env;
var request=require('request');

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

var _getRuls=require('../getRules');
var getRuls=new _getRuls();
//日志
var loger = require('../log4jsEntry');
//loger.useLog().info('测试日志');
var osConfigJs = require("../request-config/osConfig"); //不同系统对应不同ip端口
var osConfig=osConfigJs.osConfig;
// 省
router.get('/getAllProvince',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.address_http_get(req, res, '/region/getAllProvince?',arg);
});
// 市
router.get('/getCities',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.address_http_get(req, res, '/region/getCitiesByProvinceCode?',arg);
});

// 区
router.get('/getDistricts',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.address_http_get(req, res, '/region/getDistrictsByCityCode?',arg);
});

// 根据编码获取
router.get('/getByCode',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.address_http_get(req, res, '/region/getByCode?',arg);
});
// 上传文件
router.post('/upLoadFile',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/file/upload', req.query);
});
// 文件盖章
router.post('/file/word/officialSeal',multipart(),function(req, res) {
    _requestServer.upLoadFile_post(req, res, '/file/word/officialSeal', '',osConfig.cooperationPortal);
});
// 根据文件类型获取文件
router.get('/byType',function(req, res) {
    _requestServer.http_post(req, res, '/file/get/bytype', req.query);
});
// 改变文件类型
router.get('/changeFileType',function(req, res) {
    _requestServer.http_post(req, res, '/file/change/type', req.query);
});
// 下载文件，图片说略图预览
router.get('/thumbnailShow',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.address_http_get(req, res, '/file/down/?',arg);
});
// 删除图片
router.get('/del',function(req, res) {
    _requestServer.http_post(req, res, '/file/del', req.query);
});

//获取登录管理员对应的天润账号
router.get('/admin/tianr',function(req, res) {
    _requestServer.http_get(req, res, '/tianr/get/own?', "");
});
//获取登录信息
router.get('/rule/login/admin',function(req, res) {
    _requestServer.http_get(req, res, '/rule/login/admin?1=1', "",osConfig.cooperationPortal);
});
//退出登录
router.get('/loginOut',function(req, res) {
    var osOption = url.parse(req.url).query;
    if(!osOption){
        osOption='a2Portal';
    }
    var jsessionId = req.session.jsessionId;
    var options = {
        method: 'GET',
        uri: myOption[nodejs_env][osOption]+"/login/out?way=json",
        headers:{
            "Cookie":"SESSION="+jsessionId
        }
    }
    request(options, function callback(error, response, body) {
        //是否输出正常日志
        loger.globalLoger(options,req, response, body);
        if (!error && response.statusCode == 200) {
            console.log(_requestServer.getServerBaseUrl(osOption)+"/login/out")
            res.redirect('http://rule-manager.xyd.cn/pages/login.html');
        }else if(error && error.code === 'ETIMEDOUT'){
            loger.errorLog().error('loginOut error: '+JSON.stringify(options)+',responseCode:'+ response.statusCode+',responseBody:' + JSON.stringify(body));
            res.send(_CodeJs.request_result_obj(_CodeJs.Code.FAILED,"请求超时！",""));
        }else{
            loger.errorLog().error('loginOut error: ' + JSON.stringify(options)+',error:'+((error&&error.stack)?error.stack:'')+',responseCode:'+((response&&response.statusCode)?response.statusCode:'')+',responseBody:' + JSON.stringify(body));
            res.send(_CodeJs.request_result_obj(_CodeJs.Code.FAILED,"请求失败，请联系后端开发人员！",""));
        }
    });
});
// 根据手机号码获取合同信息
router.post('/getByPhone',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/sms/getByPhone', _param);
});
// 获取短信模板
router.get('/getAllSMSTemplate',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/sms/getAllSMSTemplate?', arg);
});
// 获取银行卡名称
router.get('/bank/all',function(req, res) {
    var arg = url.parse(req.url).query;
    _requestServer.http_get(req, res, '/bank/all?', arg);
});
//发送短信
router.post('/sendSMS',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/sms/sendSMS', _param);
});
//LP APPROVE 发送短信地址
router.post('/sendLpApproveSms',urlencodedParser,function(req, res) {
    var _param = req.body;
    _requestServer.http_post(req, res, '/lp/sendLpApproveSms', _param);
});
//调用tcc.taobao.com查询手机号码信息
router.get('/mobileSegment',function(req, res) {
    var phone=req.query.phone;
    _requestServer.http_get(req, res, "/tianr/search/800/"+phone,"?1=1");
});
//获取服务器当前时间
router.get('/getServerTime',function(req, res) {
    var nowTime=new Date();
    var year=nowTime.getFullYear();
    var mouth=("0"+(nowTime.getMonth()+1)).slice(-2);
    var date=("0"+nowTime.getDate()).slice(-2);
    var houre=("0"+nowTime.getHours()).slice(-2);
    var minutes=("0"+nowTime.getMinutes()).slice(-2);
    var seconds=("0"+nowTime.getSeconds()).slice(-2);
    var resultTime=year+"-"+mouth+"-"+date+" "+houre+":"+minutes+":"+seconds;
    res.send(_CodeJs.request_result_obj(_CodeJs.Code.SUCCESSFULLY,"成功连接服务器",resultTime));
    loger.allLog().info(req.query.mark+"获取进入queue时间成功："+resultTime);
    return;
});

//获取管理员所有的权限接口-portal
router.get('/admin/rules',function(req, res) {
    var clientRuleArray=req.query.btnRulsArray;
    getRuls.GetRuls(req,res,clientRuleArray,"/admin/rules",osConfig.a2Portal);
});
//获取管理员所有的权限接口-  cp-portal
router.get('/rule/admin/rules',function(req, res) {
    var cp_clientRuleArray=req.query.btnRulsArray;
    getRuls.GetRuls(req,res,cp_clientRuleArray,"/rule/admin/leafs",osConfig.cooperationPortal);
});

//VOIP 八百呼
router.get('/voip800',function(req, res) {
    var _url = url.parse(req.url).query;
   _requestServer.get_pipe(req,res,_url);
});
//获取用户请求 ip
router.get('/getUserIp',function(req, res) {
    res.send(_CodeJs.request_result_obj(_CodeJs.Code.SUCCESSFULLY,"成功连接服务器",req.headers.host));
    res.end();
});

module.exports = router;