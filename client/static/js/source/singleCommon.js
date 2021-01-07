// 单开页面公共js文件

// 获取地址栏参数
function GetQueryString(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}

//公用接口数据判断-- common js
function ajaxGetCode(res){
    var loginAlert;
    if (res.code != 1) {
        if(res.code=="-3"){
            loginAlert = confirm('您还没有登录，请先登录！');
            if(loginAlert){
                window.location.href ="/common/loginOut";
            }
            return false;
        }
        if(res.code=="-2"){
            alert("无法连接服务器");
            return false;
        }
        alert(res.msg);
        return false;
    }
    var _server_data = res.data;
    if((typeof _server_data.success!="undefined" && !_server_data.success)||(typeof _server_data.executed!="undefined" && !_server_data.executed)){
        if(_server_data.code == "LOGIN_INVALID"){
            loginAlert = confirm('您还没有登录，请先登录！');
            if(loginAlert){
                window.location.href ="/common/loginOut";
            }
            return false;
        }
        alert(_server_data.message?_server_data.message:"失败");
        return false;
    }
    return true;
}

// 判断obj值是否存在-- common js
function is_obj_exist(_obj,replace_content) {
    if (replace_content==null || typeof(replace_content) == "undefined"){
        if(typeof(_obj)=="number"){
            replace_content=0;
        }else{
            replace_content="-";
        }
    }
    if(_obj==null || typeof(_obj) == "undefined" ||(typeof(_obj) == "string"&& (_obj==null||_obj==""||_obj=="undefined"))){
        _obj=replace_content;
    }
    return _obj;
}
// 判断枚举类型值
function parseEnum(_enum){
    if(!_enum){
        return '-';
    }
    return _enum.displayName;
}
//根据权限 显示 || 隐藏 页面按钮
function displayByRules(){
    var hideRulsArray;  //返回给html页面隐藏按钮array
    var btnRulsArray=[]; //页面传给服务器的按钮数组
    $("[data-btn-rule]").each(function () {
        let thisVal=$(this).attr("data-btn-rule");
        btnRulsArray.push(thisVal)
    });
    var that=this;
    $.ajax({
        type:"get",
        url:"/common/admin/rules",
        async:false,
        dataType: "JSON",
        data:{"btnRulsArray":btnRulsArray},
        success:function(res){
            if(!that.ajaxGetCode(res)){
                return;
            }
            hideRulsArray=res.data;
        }
    });
    return hideRulsArray;  //返回需要隐藏的key值
}
//根据权限展示
function reloadRules(){
    var hideBtnArray=displayByRules();
    if(hideBtnArray && hideBtnArray.length>0){
        for (var i=0;i<hideBtnArray.length;i++){
            $("[data-btn-rule='"+hideBtnArray[i]+"']").addClass("hidden");
        }
    }
}