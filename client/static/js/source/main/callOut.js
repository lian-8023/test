// 天润电话js
var agentNumber = "";
var orderCallbackCount = 0;
var isLogin=false;
function testCall(){
    var params = {};
    params.tel = document.getElementById('tel').value;
    params.callType = '3'; //3点击外呼
    document.getElementById("toolbar").contentWindow.executeAction("doPreviewOutCall", params);
}

function validateFixPhone(phone){
    phone = phone.replace(/(\d+-)(\d+)-\d+/, '$1$2');
    return phone;
}

function callout(tel){
    var tel_tes = validateFixPhone(tel);
    var params = {};
    params.tel = tel_tes;
    params.callType = '3'; //3点击外呼
    document.getElementById("toolbar").contentWindow.executeAction("doPreviewOutCall", params);
}
function login(){//登录
    var params = {};
    params.hotLine = document.getElementById('hotLine').innerText;
    params.cno =  document.getElementById('cno').innerText;
    params.pwd =  document.getElementById('pwd').innerText; 
    params.bindTel =  document.getElementById('bindTel').innerText; 
    params.bindType = document.getElementById('bindType').attributes["data-type"].value;
    params.initStatus =  document.getElementById('initStatus').attributes["data-status"].value;
    document.getElementById("toolbar").contentWindow.executeAction('doLogin',  params);//执行登陆 ccic2里面的js类
    agentNumber = params.cno;
}
function logout(){//登出
    var params = {};
    params.type=1;
    document.getElementById("toolbar").contentWindow.executeAction('doLogout', params);
    $(".phoneCtrl .log-out,.phoneCtrl .call").addClass("hidden");
    $(".phoneCtrl .login").removeClass("hidden");
}

function readyLoad(d){
    //在这里登录
    //login();
}

//----------- 回调函数 ------------
/**
 * 登录回调 cbLogin
 * 返回json对象token:  {"type":"response","code":"0","msg":"ok","reqType":"login", 
    "sessionId":"812c16f96fa7f4bf34d75e07de4950bb", "hotline":"4006006001",
    "enterpriseId":"3000000","cno":"2002", "cname":"test","bindTel":"01041005975","bindType":"1"} 
    * code描述
0 ：登录成功
4 ：座席不在任何一个队列
29 ：在线座席数超过并发限制
23 ：默认自定义置忙状态配置错误 
    * hotline 热线号码
    * enterpriseId 企业号
    * cno 座席工号
    * cname 座席姓名
    * bindTel 绑定电话
    * bindType 绑定电话类型
*/
function cbLogin(token){//登陆
    if(token.code == "0"){
        alert("登录成功");
        isLogin=true;
        orderCallbackCount = token.allCallBackCount;
        document.getElementById("toolbar").contentWindow.executeAction('doQueueStatus');//获取队列数据
        $(".phoneCtrl .log-out,.phoneCtrl .call,.phoneCtrl .login").removeClass("hidden");
        $(".phoneCtrl .login").addClass("hidden");
    }else{
        alert("登录失败！" + token.msg);
        isLogin=false;
        $(".phoneCtrl .log-out,.phoneCtrl .call").addClass("hidden");
        $(".phoneCtrl .login").removeClass("hidden");
    }
}

/**
 * 外呼回调 cbPreviewOutCall
 * 返回json对象token:  "type":"response","code":"0","msg":"ok","reqType":"previewOutCall" 
 * code描述
0  ：成功
6  ：外呼失败，参数错误
13 ：外呼失败，外呼号码格式错误
20 ：外呼失败，呼叫范围受限
25 ：外呼失败，此号码为黑名单
26 ：外呼失败，座席没有外呼权限，请联系管理员
27 ：外呼失败，余额不足
28 ：外呼失败，没有路由  
*/
function cbPreviewOutCall(token) {  //外呼回调
    
}

/**
 * 有预约回呼
*/
function cbOrderCallBack(token) {
    if(token.addORReduce == 1) {
        orderCallbackCount++;
    }
    if(token.addORReduce == -1) {
        orderCallbackCount--;
    }
}

function cbLogout(token) {//退出
    if(token.code == "0"){
        // document.getElementById("toolbar").src = 'toolbarIframe.html?type=bs';
        alert("已退出");
    }
}


function searchAccByPhone(recvPhone){
    $(".call-state-open .accountId").text("");
    $(".call-state-open .accPrimeryPhone").text("");
    $(".call-state-open .accName").text("");
    $.ajax({
        type:"get",
        url:"/node/search_list",
        async:false,
        dataType: "JSON",
        data:{
            mobile:recvPhone
        },
        success:function(res){
            var _data=res.data;
            if(_data&&_data.userInfos){
                var userInfo0 = _data.userInfos[0];
                $(".call-state-open .accountId").text(userInfo0.accountId);
                $(".call-state-open .accPrimeryPhone").text(userInfo0.primaryPhone);
                $(".call-state-open .accName").text(userInfo0.name);
            }
        }
    })
}

function getNowTimeYMD(){
    var oDate = new Date(); //实例一个时间对象；
    return oDate.getFullYear()+"-"+(oDate.getMonth()+1)+"-"+oDate.getDate();
}
function getNowTimeHMS(){
    var oDate = new Date();
    return oDate.getHours()+":"+oDate.getMinutes()+":"+oDate.getSeconds();
}

//状态回调：来电弹屏等
function cbThisStatus(token){
    $(".adminCtrl,.phoneCtrl").css({
        "width":$(".menu").width()-20,
        "max-width":"115px"
    });
    if(token.cno == agentNumber){
        //callType：
        //1：呼入，2：网上400,3：点击外呼，4：预览外呼，5：IVR外呼，6：分机直接外呼
        if(token.eventName == "comeRinging"&&token.name == "ringing"){	//呼入响铃
            // alert("来电号码：" + token.customerNumber);
            //var call_id = token.uniqueId;		//获取录音编号
            searchAccByPhone(token.customerNumber);
            
            //展示来电
            if($(".phoneCtrl").hasClass("hidden")){
                $(".adminCtrl").addClass("hidden");
                $(".phoneCtrl,.normal-state").addClass("hidden");
                $(".phoneCtrl,.call-state").removeClass("hidden");
                $(".call-state-open .comeingPhoneNo").text(token.customerNumber);
                $(".phoneCtrl .down-icon").addClass("down-icon-yellow");
            }
            //无电话展开时 来电
            if($(".normal-state-open").is(":visible")){
                $(".normal-state-open .no-call").addClass("hidden");
                $(".normal-state-open .have-call").removeClass("hidden");
                $(".call-state-open .comeingPhoneNo").text(token.customerNumber);
            }

            $(".call-state-open .time").html(getNowTimeYMD()+"<br />"+getNowTimeHMS());

        }
        if(token.eventName == "normalBusy"&&token.name == "status"){
            alert("来电号码：" + token.customerNumber + "已接听");
        }
        if(token.eventName == "neatenStart"){
            // alert("挂断");
            // 隐藏黄色收起状态
            if($(".call-state").is(":visible")){
                $(".call-state").addClass("hidden");
                $(".normal-state").removeClass("hididen");
                $(".phoneCtrl .down-icon").removeClass("down-icon-yellow");
            }
            //改变无电话展开时title
            if($(".normal-state-open").is(":visible")){
                $(".normal-state-open .no-call").removeClass("hidden");
                $(".normal-state-open .have-call").addClass("hidden");
            }
            //有电话呼入时展开状态 =》无电话呼入展开
            if($(".call-state-open").is(":visible")){
                $(".call-state-open").addClass("hidden");
                $(".normal-state-open").removeClass("hidden");
                $(".normal-state-open .no-call").removeClass("hidden");
                $(".normal-state-open .have-call").addClass("hidden");
                $(".phoneCtrl .down-icon").removeClass("down-icon-yellow");
            }
        }
        if(token.eventName == "consultLink"&&token.name == "consultLink"){	//咨询接听
            alert("咨询号码" + token.consultObject + "已接听");
        }
        if(token.eventName == "normalBusy"&&token.name == "consultError"){	//咨询失败
            alert("咨询失败");
        }
        if(token.eventName == "neatenStart"){	//客户挂断，整理开始：呼入、空闲时外呼
            // alert("已挂机，开始整理");
        }
        if(token.eventName == "neatenEnd"){	//客户挂断，整理结束：呼入、空闲时外呼
            // alert("整理结束");
        }
        if(token.eventName == "outRinging"&&token.name == "ringing"&&token.callType == "3"){	//外呼时座席响铃:3、点击外呼
            alert("外呼号码：" + token.customerNumber);
            //var call_id = token.uniqueId;		//获取录音编号
        }
        if(token.eventName == "waitLink"&&token.callType == "3"){	//座席接听后外呼客户:3、点击外呼
            alert("座席接听，开始呼叫客户");
        }
        if(token.eventName == "outBusy"&&token.name == "previewOutcallBridge"&&token.callType == "3"){	//外呼客户:3、点击外呼
            // alert("外呼号码：" + token.customerNumber + "已接听");
        }
        if(token.eventName == "onlineUnlink"){	//空闲时外呼，客户无应答，座席挂机
            alert("已挂机");
        }
        if(token.eventName == "pauseUnlink"){	//置忙时外呼，客户挂断或无应答，座席挂机
            alert("已挂机");
        }
    }
    //alert("Token:"+json2str(token));	//Token的JSON对象内容
}


function transfer(){
    var transferText = document.getElementById("transferText").value;
    var obj = {};
    obj.transferObject = transferText;
    obj.objectType = document.getElementById("transferType").value;
    document.getElementById("toolbar").contentWindow.executeAction('doTransfer', obj);
}
function consultCancel(){
    document.getElementById("toolbar").contentWindow.executeAction('doConsultCancel');	
}


/**
* json对象转字符串形式
*/
function json2str(o) {
    var arr = [];
    var fmt = function(s) {
        if (typeof s == 'object' && s != null) return json2str(s);
        return /^(string|number)$/.test(typeof s) ? "'" + s + "'" : s;
    }
    for (var i in o) arr.push("'" + i + "':" + fmt(o[i]));
    return '{' + arr.join(',') + '}';
}

