function voipCall(){
	var oVoip = new Object;
	oVoip.userSession = "";
	oVoip.userName = "";
	oVoip.userPass = "";
	oVoip.extension = "";
	oVoip.exteId = 0;
	oVoip.compId = 0;
	oVoip.Waterline = 0;
	oVoip.CallBack_Call = null;
	oVoip.CallBack_Answer = null;
	oVoip.CallBack_HangUp = null;
	oVoip.CallBack_login = null;
	oVoip.CallBack_status = null;
	oVoip.CallBack_Key = null;
	oVoip.ShowMsg = null;
	oVoip.status = 2;
	oVoip.kind = 1;
	oVoip.phone = null;
	//用户登录
	oVoip.init = function(url){
		oVoip.serviceUrl = url;
	};
	oVoip.TransferUser = function(phone,func){
		var url = oVoip.getUrl(oVoip.userName,oVoip.userPass,"transferExten");  
		getJsonP(url,{descExten:phone},function(data) {
			func(data);		
		});
	};
	oVoip.setUserCheckInOut = function(aStatus,fun){
		var url = oVoip.getUrl(oVoip.userName,oVoip.userPass,"setUserCheckInOut");  
		getJsonP(url,{status:0},function(data) {
			fun(data);		
		});	
	};
	oVoip.CallPhone = function(phone,func){
		if(phone==null||phone.length<3){
			return;
		}
		var url = oVoip.getUrl(oVoip.userName,oVoip.userPass,"callbackPhone");  
		getJsonP(url,{sourcePhone:oVoip.userName,descPhone:phone},function(data) {
			func(data);		
		});
	};
	oVoip.hangup = function(phone,func){
		var url = oVoip.getUrl(oVoip.userName,oVoip.userPass,"hangupExten");  
		getJsonP(url,{phoneNum:phone},function(data) {
			func(data);		
		});
	}
	oVoip.userlogin = function(userName,userpass){		
		var url = oVoip.getUrl(userName,userpass,"getExtension");
		getJsonP(url,{},function(data) {
			if(data.code==0){
				oVoip.userSession = data.sessionId;
				oVoip.exteId = data.exteId;
				oVoip.compId = data.compId;
				oVoip.extension = data.extension.substr(0, 6);
				oVoip.userName = userName;
				oVoip.userPass = userpass;
				oVoip.CallBack_login(0,"");
				oVoip.getLongWaterLine();
				oVoip.getLoadmonitor();
			}else{
				oVoip.userSesson = "";
				oVoip.exteId = 0;
				oVoip.compId = 0;
				oVoip.userName = "";
				oVoip.userPass = "";
				oVoip.CallBack_login(1,data.message);
			}
		});
	};
	oVoip.getLoadmonitor = function(){
		var url = oVoip.serviceUrl + 'voip/extensionmanager/loadmonitor.jsonp?callback=?&sessionId='+oVoip.userSession+"&extension="+oVoip.userName;
		getJsonP(url,{},function(data) {
			if(data.code==0&&data.rows!=null&&data.rows.length>0){
				oVoip.CallBack_status(data.rows[0]);
			}
			setTimeout(function(){oVoip.getLoadmonitor()},60000);
		});
	};
	
	//取服务器是否发生变化
	oVoip.getLongWaterLine = function(){
		var url = oVoip.getUrl(oVoip.userName,oVoip.userPass,"getLongWaterLine");
		getJsonP(url,{client:1},function(data) {
			if(data.code==0){
				if(data.waterline>oVoip.Waterline){
					if(oVoip.Waterline==0){
						oVoip.Waterline = data.waterline - 1;
					}
					oVoip.getMsgList();
				}
				if(data&&oVoip.CallBack_Key&&data.keylist){
					oVoip.CallBack_Key(data.keylist);
				}
			}
			oVoip.getLongWaterLine();
		});
	};
	//接收消息
	oVoip.getMsgList = function(){
		var url = oVoip.getUrl(oVoip.userName,oVoip.userPass,"recvMsg");
		var aLimit = 9876;
		if(oVoip.Waterline>0){
			aLimit = 5;
		}
		getJsonP(url,{waterLine:oVoip.Waterline,client:1,limit:aLimit},function(data) {
			if(data.code==0&&data.msgs!=null&&data.msgs.length>0){
				var msg = data.msgs;
				var Waterline = 0;
				for (var i = 0; i < msg.length; i++) {
					var obj = msg[i];
					var slastrecvMsgTime = obj.waterLine;
                    if (slastrecvMsgTime > oVoip.Waterline) {
						if(Waterline<slastrecvMsgTime){
							Waterline = slastrecvMsgTime;	
						}			
						var status = 0;
						var cdrId = 0;
						try{
							context = eval('(' + obj.content + ')');
							status = context.status;							
							cdrId = context.cdrId;
							try{
								var nn = parseInt(context.status);
								status = nn;
							}catch(ee){
								
							}
						}catch(err){
							//return;
						}
						if(obj.kind==1||obj.kind==2){
							if(oVoip.phone!=obj.phone){
								if(status==0){
									oVoip.CallBack_Call(obj.kind,obj.phone);
									oVoip.phone = obj.phone;
									oVoip.kind = obj.kind;
									oVoip.status = 0;
								}
							}else if(oVoip.status!=status){
								switch (status) {
								case (0):
									oVoip.CallBack_Call(obj.kind,obj.phone);
									oVoip.phone = obj.phone;
									oVoip.kind = obj.kind;
									oVoip.status = 0;
									break;
								case (1):
									oVoip.CallBack_Answer(obj.kind,obj.phone);
								    break;
								case (2):
									oVoip.getHandUpMsg(obj.phone,oVoip.kind,cdrId);
									break;									
								}	
								oVoip.status=status;
							}
							
						}else if(obj.kind>100&&oVoip.ShowMsg!=null){
							oVoip.ShowMsg(obj);
						}
                    }
				}
				if(Waterline>oVoip.Waterline){
					oVoip.Waterline = Waterline;
				}
			}
		});		
	};
	oVoip.getHandUpMsg = function(phone,kind,aCdrId){
		var url = oVoip.getUrl(oVoip.userName,oVoip.userPass,"findDialrecord");
		if(phone!=null&&phone.length<5){
			phone = oVoip.extension+phone;
		}
		getJsonP(url,{phoneNum:phone,limit:1,extension:oVoip.userName,scdrId:aCdrId},function(data) {
			if(data.code==0&&data.rows!=null&&data.rows.length>0){
				var obj = data.rows[0];
				oVoip.CallBack_HangUp(kind,phone,obj);
			}else{
				var obj = new Object;
				obj.cdrId = aCdrId;
				obj.cdrPeer=kind;
				oVoip.CallBack_HangUp(kind,phone,obj);
			}
		});		
	};
	oVoip.answerPhone = function(phone,func){
		var url = oVoip.getUrl(oVoip.userName,oVoip.userPass,"sendMsg");  
		getJsonP(url,{phone:phone,kind:6,client:1,lostTime:10},function(data) {
			func(data);		
		});
	}
	oVoip.StopPhone = function(phone,func){
		var url = oVoip.getUrl(oVoip.userName,oVoip.userPass,"sendMsg");  
		getJsonP(url,{phone:phone,kind:7,client:1,lostTime:10},function(data) {
			func(data);		
		});
	}
	oVoip.getUrl = function(user,pass,funcname){
		var url = oVoip.serviceUrl+'voip/api/jsonpdata.jsonp?callback=?&method='+funcname+'&sa_user='+user+'&sa_password='+$.md5(pass)+			"&loginType=jsonpLogin";
		return url;
	}
	return oVoip;
}

function getJsonP(url,parms,callback){
	var _url = "/common/voip800?"+url;
	$.getJSON(_url,parms, function(data) {
		callback(data);		
	});
}


//-本地有客户端拔号
function callPhone(phone){
	$.ajax({
		type: 'get',
		async: false,
		url: 'http://127.0.0.1:10800/?type=3&phone=' + phone,
		dataType: 'jsonp',
		jsonp: 'clientCallback',
		jsonpCallback:"clientCallback",
		success: function(data){
			if(!data.code && data.code != 0){
				$.messager.alert('提示','呼叫失败，客户端呼叫错误','error');
			}
		},
		error: function(data){
			if(!data.code && data.code != 0){
				$.messager.alert('提示','呼叫失败，无法连接客户端','error');
			}
		}
	});
}

