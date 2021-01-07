/*
 * cooperationPortal 请求接口
 * node:{}  前端请求node端配置， url:前端请求node端地址， method:请求方法（默认请求方式为get），os:2a portal或者cp portal；
 * server:{} node端请求服务端配置，url:node端请求后端地址， method:请求方法；
 * { node:{url:'/setup',method:'post'}, server:{url:'/loan/payment/setup',method:'post'} },  //设定付款
 *  */ 
var osConfigJs = require("../request-config/osConfig");
var osOption=osConfigJs.osConfig.cooperation_alchemist;
module.exports = {
    osOption:osOption,
    urlConfig:[
        // search
        { node:{url:'/litigationData/findLawByPage',method:'post'}, server:{url:'/litigationData/findLawByPage',method:'post_body'} },  //诉讼举证-分页搜索 6C && 17C
        { node:{url:'/litigationData/findByPage',method:'post'}, server:{url:'/litigationData/findByPage',method:'post_body'} },  //诉讼举证-分页搜索 9F
        { node:{url:'/litigationData/exportLawExcel'}, server:{url:'/litigationData/exportLawExcel',method:'pipe_flowUrl'} },  //诉讼举证-导出 6C && 17C
        { node:{url:'/litigationData/exportExcel'}, server:{url:'/litigationData/exportExcel',method:'pipe_flowUrl'} },  //诉讼举证-导出 9F
        
    ]
}