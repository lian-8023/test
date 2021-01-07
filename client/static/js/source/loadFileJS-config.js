// 对应的openPage方法，新开页面地址栏参数JSsource对应需要引入的js文件名称

var JSsource=GetQueryString("JSsource");
var loadJS='<script src="/js/source/'+JSsource+'.js" type="text/javascript"></script>';
$("body").append(loadJS);

