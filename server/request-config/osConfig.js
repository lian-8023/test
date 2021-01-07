/**
 * 不同标识对应不同请求地址配置 对应 iotion.js 文件字段
 */
module.exports={
    osConfig:{
        a2Portal:"a2Portal",  //newportal
        cooperationPortal:"cooperationPortal",  //合作方portal
        cooperation_alchemist:"cooperation_alchemist",  //
        internalGateway:"internalGateway"  //
},
    defaultParse:function(osOption){ //处理newportal起初没有加配置字段的情况
        if(!osOption){
            return this.osConfig.a2Portal; 
        }
        return osOption;
    }
}