/*
 * 供应链 请求接口
 * node:{}  前端请求node端配置， url:前端请求node端地址， method:请求方法（默认请求方式为get），os:2a portal或者cp portal；
 * server:{} node端请求服务端配置，url:node端请求后端地址， method:请求方法；
 * { node:{url:'/setup',method:'post'}, server:{url:'/loan/payment/setup',method:'post'} },  //设定付款
 *  */ 
var osConfigJs = require("../request-config/osConfig");
var osOption=osConfigJs.osConfig.internalGateway;
module.exports = {
    osOption:osOption,
    urlConfig:[
        // search
        { node:{url:'/inner/getBorrowerDetailInfo'}, server:{url:'/scpre/sc/inner/getBorrowerDetailInfo'} },
    ]
}