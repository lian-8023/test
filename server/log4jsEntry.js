var log4js = require('log4js');
var env = process.env.nodejs_env;
console.log('nodejs_env: ',env);

let appenders_info = ["_info"],
    appenders_error=['_error'];
if(!env || env=='undefined' || env=='native'){
	appenders_info.push("_console");
	appenders_error.push("_console");
}else if(env=='online'){
    appenders_info = ["_console"];
    appenders_error = ["_console"];
}

var logBasePath=process.env.APP_LOG || "/home/simplecredit/log/frontend-portal/applog";
log4js.configure({
    "appenders":{
        "_console":{
            "type": "console",
        },
        "_info":{ 
            "type": "file", 
            "filename": logBasePath+'/frontend-portal-info.log', 
            "encoding":"utf-8",
            "maxLogSize": 104857500,  
            "backups": 50 
        },
        "_error":{
            "type": "dateFile",  
            "filename":logBasePath+'/frontend-portal-error.log',
            "alwaysIncludePattern": true,  
            "encoding":"utf-8",
            "pattern": "-yyyy-MM-dd"
        }
    },
    "categories":{
        "default":{
            "appenders":["_console"],
            "level": "INFO"
        },
        "log_all": {
            "appenders": appenders_info,
            "level": "INFO"
        },
        "log_error": {
            "appenders": appenders_error,
            "level": "ERROR"
        }
    }
}

);
const isLogger=require('../utils').isLogger;

exports.allLog = function(){
	var LogFile_all = log4js.getLogger('log_all');
	LogFile_all.addContext('project_path','info22');
    return LogFile_all;
//demo loger.allLog().info("post:jsessionId="+jsessionId);
}

exports.errorLog = function(){
	var LogFile_error = log4js.getLogger('log_error');
    return LogFile_error;
//demo	loger.errorLog().error('start error: ' + err);
}

//控制全局打印日志
exports.globalLoger = function(options,req, response, body){
	// var isLogger=false;  //是否需要全局打印请求日志  true 打印 || false 不打印
	var getBody=body;
	if(body&&typeof(body)=="object"){
		getBody=JSON.stringify(body);
	}
	if(getBody && getBody.length>600){
		getBody=`${getBody.substr(0,600)} ... ...`;
	}
	isLogger ? this.allLog().info(
		req.headers['user-agent']+
		",【requestOptions】:"+JSON.stringify(options)+
		",【responseCode】:"+(response?response.statusCode:'')+
		",【responseBody】:"+getBody
	):"";
}; 
//是否输出正常日志
// loger.globalLoger(options,req, response, body);

//demo	LogFile.info('info test');