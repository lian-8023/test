var url = require("url");
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var Router = require('router');
var router = Router();
var requestServer = require('./requestServer');
var _requestServer=new requestServer();
var loger = require('./log4jsEntry');  //日志
var format = require("string-template");
//2a portal router list 
var A2routers=require('./port-config/A2routers');
parseRouter(A2routers);

//cp portal router list
var CProuters=require('./port-config/CProuters');
parseRouter(CProuters);

//cooperation_alchemist router list
var CooperationAlchemist=require('./port-config/CooperationAlchemist');
parseRouter(CooperationAlchemist);
//internalGateway
var internalGateway=require('./port-config/internalGateway');
parseRouter(internalGateway);
// parse router list 
function parseRouter(routerObj){
    if(!routerObj){
        return;
    }
    let osOption = routerObj.osOption;
    let urlConfig = routerObj.urlConfig;

    for(let j=0;j<urlConfig.length;j++){
        let urlConfig_j=urlConfig[j];
        let node_method=urlConfig_j.node.method;
        node_method = node_method?node_method:'get';   //默认请求为 get 方法
        let node_url=urlConfig_j.node.url;
        let server_url=urlConfig_j.server.url;
        let server_method=urlConfig_j.server.method;
        server_method=server_method?server_method:'get';   //默认请求为 get 方法
      
        if(node_method=='get'){ 
            router.get(node_url,function(req, res) {
                if(server_method=='get'){
                    var arg = url.parse(req.url).query;
                    let params = req.query;
                    let _server_url=format(server_url,params);  //处理参数直接跟到斜线后面的情况，如 '/jxl/search/'+nationalId+'/'+sourceQuotient+'/'+customerId
                    _server_url=encodeURI(_server_url);  //参数中中文转码
                    // server_url=server_url.replace(/\/\//g,'/'); //参数为空时，路由会出现两个连续斜线，替换成一个斜线避免报错。
                    _requestServer.http_get(req, res, _server_url, arg, osOption,urlConfig_j.server.typesof);
                }
                else if(server_method=='post'){
                    var _query=req.query;
                    _requestServer.http_post(req, res, server_url, _query, osOption);
                }else if(server_method=='post_body'){
                    var _param = req.query.josnParam;
                    _requestServer.http_post_body(req, res, server_url,_param, osOption);
                }else if(server_method=='pipe'){
                    _requestServer.get_pipe(req,res,server_url,osOption);
                }else if(server_method=='pipe_flowUrl'){
                    _requestServer.get_pipe(req,res,server_url,osOption,true);
                }else{
                    loger.errorLog().error('node router get error!');
                }
            });
        }else if(node_method=='post'){
            router.post(node_url, urlencodedParser, function (req, res) {
                if(server_method=='post'){
                    var _param = req.body;
                    _requestServer.http_post(req, res, server_url, _param, osOption,'',urlConfig_j.server.type);
                }else if(server_method=='post_pipe'){
                    var _param = req.body;
                    _requestServer.http_post(req, res, server_url, _param, osOption,true);
                }else if(server_method=='post_body'){
                    var _param = req.body.josnParam;
                    _requestServer.http_post_body(req, res, server_url, _param, osOption);
                }else{
                    loger.errorLog().error('node router post error!');
                }
            });
        }else{
            loger.errorLog().error('node router error!');
        }
    }
}

module.exports = router;