var http = require('http');
var url = require("url");
var request=require('request');
var res_Code = require('./responseCode');
var _CodeJs = new res_Code();
var querystring = require('querystring');
var loger = require('./log4jsEntry');
var format = require("string-template");  //路由占位符
var fs = require('fs');
// 请求接口配置文件
var osConfigJs = require("./request-config/osConfig");
var myOption = require("./request-config/option");
var nodejs_env=process.env.nodejs_env;

module.exports = function(){
//  console.log(new request_result_obj(Code.EXCEPTION,"无法连接服务器","").obj2Json())
    //文件下载
    this.fileDownload=function(req,res,_url,osOption){
        if(!req.session||!req.session.jsessionId){
            res.send(_CodeJs.request_result_obj(_CodeJs.Code.loginCode,"未获取到登录信息",""));
            res.end();
            return;
        }
        var jsessionId_base64 = req.session.jsessionId;
        var jsessionId =  Buffer.from(jsessionId_base64, 'base64').toString();
        osOption=osConfigJs.defaultParse(osOption);
        var baseURL = myOption[nodejs_env][osOption];
        _url=baseURL+_url+"&sessionId="+jsessionId;
        loger.allLog().info('pipe:'+_url+",responseCode:"+res.statusCode);
        request(_url).pipe(res);
    }
    // flowUrl 是否把前端传过来的参数全部直接跟到url后面
    this.get_pipe=function(req,res,_url,osOption,flowUrl){
        if(_url.indexOf('?')<0){
            _url=_url+'?1=1';
        }
        if(osOption){
            if(!req.session||!req.session.jsessionId){
                res.send(_CodeJs.request_result_obj(_CodeJs.Code.loginCode,"未获取到登录信息",""));
                res.end();
                return;
            }
            var jsessionId_base64 = req.session.jsessionId;
            var jsessionId =  Buffer.from(jsessionId_base64, 'base64').toString();
            osOption=osConfigJs.defaultParse(osOption);
            var baseURL = myOption[nodejs_env][osOption];
            _url=baseURL+_url+"&sessionId="+jsessionId;
        }

        let params = req.query;   //params is object
        let arg = url.parse(req.url).query;  //arg is string (如：&minAmount=1&maxAmount=10000)
        if(arg&&arg[0]!='&'){
            arg='&'+arg;
        }
        if(flowUrl){
            _url = encodeURI(_url+arg);
            loger.allLog().info('pipe_flowUrl:'+_url+",responseCode:"+res.statusCode);
        }else{
            _url=format(_url,params);
            _url = encodeURI(_url);
            loger.allLog().info('pipe:'+_url+",params:"+(params?JSON.stringify(params):'-')+",responseCode:"+res.statusCode);
        }
        
        request(_url).pipe(res);
    };
    /**
     * 统一的get请求
     * @param req
     * @param res
     * @param options
     */
    this.pub_http_get=function(req,res,options){
        request(options, function callback(error, response, body) {
            //是否输出正常日志
            loger.globalLoger(options,req, response, body);
            let statusCode=response?response.statusCode:"";
            if (!error && statusCode == 200) {
                res.send(_CodeJs.request_result_obj(_CodeJs.Code.SUCCESSFULLY,"成功连接服务器",body?JSON.parse(body):''));
            }else if(error && error.code === 'ETIMEDOUT'){
                loger.errorLog().error('pub_http_get ETIMEDOUT error: '+options?JSON.stringify(options):''+',responseCode:'+ statusCode+',responseBody:' + JSON.stringify(body));
                res.send(_CodeJs.request_result_obj(_CodeJs.Code.FAILED,"请求超时！",""));
            }else{
                loger.errorLog().error('pub_http_get error: ' + JSON.stringify(options)+',error:'+((error&&error.stack)?error.stack:'')+',responseCode:'+statusCode+',responseBody:' + JSON.stringify(body));
                res.send(_CodeJs.request_result_obj(_CodeJs.Code.FAILED,"请求失败，请联系后端开发人员！",""));
            }
        });
    };

    this.http_get=function(req,res,_url,_params,osOption,typesof){
        if(_url.indexOf('?')<0){
            _url=_url+'?1=1';
        }
        osOption=osConfigJs.defaultParse(osOption);
        if(!req.session||!req.session.jsessionId){
            res.send(_CodeJs.request_result_obj(_CodeJs.Code.loginCode,"未获取到登录信息",""));
            res.end();
            return;
        }
        var jsessionId = req.session.jsessionId;
        var _params=_params?('&'+_params):'';
        var uri = myOption[nodejs_env][osOption]+_url+_params+"&way=json";
        //如果是带域名的接口
        if(typesof == 'area'){
            uri = _url+_params;
        }
        // loger.allLog().info("get:jsessionId="+jsessionId);
        var options = {
            method: 'GET',
            Accept:'*/*',
            uri: uri,
            headers:{
                "Cookie":"SESSION="+jsessionId
            },
            timeout:120000   //2分钟
        }
       this.pub_http_get(req,res,options);
    };

    this.getServerBaseUrl=function(osOption){
        osOption=osConfigJs.defaultParse(osOption);
       var baseURL = myOption[nodejs_env][osOption];
       return baseURL;
    };

    /**
     * 省市区地址请求
     * @param req
     * @param res
     * @param _url
     * @param _params
     */
    this.address_http_get=function(req,res,_url,_params){
        var options = {
            uri: 'http://'+myOption[nodejs_env].cityHost+"/"+_url+_params+"&way=json",
            method: 'GET',
            timeout:120000   //2分钟
        }
        this.pub_http_get(req,res,options);
    }

    this.http_post=function(req,res,_url,_param,osOption,post_pipe,type,parameter){
        var parms={};
        for(var key in _param) {
            parms[key]=_param[key]
        }
        if(post_pipe){
            _url=format(_url,parms);
        }
        _param.way="json";
        var request_data = querystring.stringify(_param);
        this.pub_http_post(req,res,_url,request_data,'application/x-www-form-urlencoded',osOption,type);
    };
    this.http_post_body=function(req,res,_url,_param,osOption){
        _url=_url+"?way=json";
        this.pub_http_post(req,res,_url,_param,'application/json',osOption);
    };

    this.pub_http_post=function(req,res,_url,request_data,contenttype,osOption,type){

        osOption=osConfigJs.defaultParse(osOption);
        if(!req.session||!req.session.jsessionId){
            res.send(_CodeJs.request_result_obj(_CodeJs.Code.loginCode,"未获取到登录信息"," "));
            res.end();
            return false;
        }
        var jsessionId = req.session.jsessionId;
        // loger.allLog().info("post:jsessionId="+jsessionId);
        let parse_query=request_data;
        if(contenttype=="application/json"){
            if(request_data){
                parse_query=JSON.parse(request_data);
            }
        }
        let uri = myOption[nodejs_env][osOption]+_url;
        let headers = {
            "Cookie":"SESSION="+jsessionId,
            'Content-Type': contenttype,
        };
        var options = {
            method: 'POST',
            uri: uri,
            json: true, // Automatically stringifies the body to JSON 
            headers:headers,
            timeout:120000   //2分钟
        };
        if(type == 'area'){
            uri = _url;
            headers={
                "Cookie":"SESSION="+jsessionId,
                'Content-Type': 'application/json',
                'Authorization':req.headers.authorization,
                'Accept':req.headers.accept
            }
            options = {
                method: 'POST',
                uri: uri,
                headers:headers,
                timeout:120000,   //2分钟
            };
        }
        if(type == 'area'){
            let data = req.body;
            options['body']=JSON.stringify(data);
        }else{
            if(parse_query){
                options['body']=parse_query;
            }
            if(request_data){
                options['Content-Length']=Buffer.byteLength(request_data);
            }
        }

        request(options, function callback(error, response, body) {
            //是否输出正常日志
            loger.globalLoger(options,req, response, body);
            let statusCode=response?response.statusCode:"";
            if (!error && statusCode == 200) {
                res.send(_CodeJs.request_result_obj(_CodeJs.Code.SUCCESSFULLY,"成功连接服务器",body));
            }else if(error && error.code === 'ETIMEDOUT'){
                loger.errorLog().error('pub_http_post error: '+JSON.stringify(options)+',responseCode:'+ statusCode+',responseBody:' + JSON.stringify(body));
                res.send(_CodeJs.request_result_obj(_CodeJs.Code.FAILED,"请求超时！",""));
            }else{
                loger.errorLog().error('pub_http_post error: '+JSON.stringify(options)+',error:'+((error&&error.stack)?error.stack:'')+',statusCode:'+statusCode+',responseBody:' + JSON.stringify(body));
                res.send(_CodeJs.request_result_obj(_CodeJs.Code.FAILED,"请求失败，请联系后端开发人员！",""));
            }
        });
    };

    //上传文件
    this.upLoadFile_post=function(req,res,_url,_param,osOption){
        osOption=osConfigJs.defaultParse(osOption);
        if(!req.session||!req.session.jsessionId){
            res.end(_CodeJs.request_result_obj(_CodeJs.Code.loginCode,"未获取到登录信息",""));
            return;
        }
        var jsessionId = req.session.jsessionId;
        var _boundary = new Date().getTime();
        //从request获取所有的文件，{filename1:{fileName:filename1,path:_path1,size:_size1,...},filename2:{fileName:filename2,path:_path2,size:_size2,...}}

        var options = {
            method: 'POST',
            uri: myOption[nodejs_env][osOption]+_url,
            json: true, // Automatically stringifies the body to JSON 
            headers:{
                "Cookie":"SESSION="+jsessionId,
                'Content-Type': "multipart/form-data; boundary=" + _boundary,
            },
            timeout:120000,  //2分钟
        }

        const r = request.post(options, function optionalCallback(err, httpResponse, response) {
            
            if (err) {
                loger.errorLog().error('upLoadFile_post error: '+JSON.stringify(options)+',responseCode:'+ (response?response.statusCode:'')+',responseError:' + e.message);
                res.send(_CodeJs.request_result_obj(_CodeJs.Code.FAILED,"请求失败，请联系后端开发人员！",""));
            }
            //是否输出正常日志
            loger.globalLoger(options,req, response, response);
            // 数据接收完成
            res.send(_CodeJs.request_result_obj(_CodeJs.Code.SUCCESSFULLY,"成功连接服务器",response));
        })
        
        var files = req.files;
        if(!files){
            res.send(_CodeJs.request_result_obj(_CodeJs.Code.SUCCESSFULLY,"请至少选择一个文件","1"));
            return;
        }
        var fileData=files.ws;
        const form = r.form();
        if(_param){
            for(var key in _param){
                var _value = _param[key];
                form.append([key], _value);
            }
        }
        if(Array.isArray(fileData)){ //判断是否是多个文件 单个文件fileData是对象，返回false；多个则是数组，返回true
            for(let i=0;i<fileData.length;i++){
                form.append('custom_file', fs.createReadStream(fileData[i].path), {filename: fileData[i].originalFilename,contentType: fileData[i].type});
            }
        }else{
            form.append('custom_file', fs.createReadStream(fileData.path), {filename: fileData.originalFilename,contentType: fileData.type});
        }
    };
};