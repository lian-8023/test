var voip = new voipCall();
$(function(){ 
	$.ajax({
		type: "get",
		url: "/common/getUserIp",
		async: true,
		dataType: "JSON",
		success: function (res) {
				var _getData = res.data;
				console.log(res)
		}
})
  //初始化数据
  voip.init("http://10.244.76.150:8081/");
  // 登录返回，code =0登录成功，其它为失败
  voip.CallBack_login = function(code,message){
	  if(code==0){
			$('.normal-state-open').addClass("hidden");
			$('.normal-state-logined').removeClass('hidden').attr("type","logined");
	  }else{
		  alert(message?message:'登录失败！');
			$('.normal-state-logined').attr("type","");
	  }
  };
  // 显示消息
  voip.ShowMsg = function(obj){
	$("#popupscreendiv").append('msg：'+obj+'<br>');
  };
  // 来电弹屏
  voip.CallBack_Call = function(kind,phone){
	if(kind==2){
		$("#calleriddiv").html("来电号码: <span>"+phone+"</span>");
	}else{
		$("#calleriddiv").html("呼出号码: <span>"+phone+"</span>");
	}
  };
  //接听弹屏
  voip.CallBack_Answer = function(kind,phone){
	if(kind==2){
		$("#calleriddiv").html("呼入接听：<span>"+phone+"</span>");
	}else{
		$("#calleriddiv").html("呼出接听：<span>"+phone+"</span>");
	}	 
  };
  //按键
  voip.CallBack_Key = function(keylist){
	  if (keylist && keylist.length > 0) {
		  for(var i=0;i<keylist.length;i++){
			  var item = keylist[i];
			  $("#popupscreendiv").append('电话：'+item.phone+',按键：'+item.key+'<br>');
		  }		  
	  }
  }
  //挂机弹屏
  voip.CallBack_HangUp = function(kind,phone,obj){
	var peer = '呼出';
	if(obj.cdrPeer==2){
		peer = '呼入';
	}  
	$("#popupscreendiv").append("录音文件："+obj.cdrRecordFile+"<br>,区域:"+obj.cdrPhoneArea+"<br>,接听时间："+obj.cdrSucessTime+			 "<br>,时长："+obj.cdrTalktime+'，方向：'+peer+"<br>");
	$("#calleriddiv").html('方向：'+peer+',电话：'+phone+'<span></span>');
  };
  //状态改变返回
  voip.CallBack_status = function(data){
	  $("#devUserName").html("用户名称: <span>"+data.exteName+"</span>");
	  $("#deviceData").html("设备状态:"+data.statustext);
	  
  };
  //开始登录
  $("#start").click(function(){
	var ll = setTimeout(function(){
		let userName=$(".phoneUserName").val();
		let parssWord=$(".phonePassword").val();
		if(!userName){
			alert("请输入用户名！");
			return;
		}
		if(!parssWord){
			alert("请输入密码！");
			return;
		}
	  voip.userlogin(userName,parssWord);	  
	},1000);    
  });
  //签入 签入后SIP话机可以收到来电电话
  $("#pause").click(function(){
	voip.setUserCheckInOut(0,function(data){
		if(data.code==0){
			$(".normal-state-logined .phoneStatus").text('在线');
		}
	});   
  });
  //签出 签出后电话就不会在转入这个话机
  $("#unpause").click(function(){
	voip.setUserCheckInOut(1,function(data){
		if(data.code==0){
			$(".normal-state-logined .phoneStatus").text('离线');
		}
	});  
  });
  //拔号
  $("#dial").click(function(){
		var phone = $("#phoneno").val();
		if(phone==null||phone.length<3){
			alert("号码不能为空");
		}
		voip.CallPhone(phone,function(data){
			if(data.code==0){
				alert('拔号成功：'+$("#phoneno").val());
				$(".normal-state-logined #hangup").removeClass("hidden");
			}else{
				alert('拔号失败：'+data.message);
			}
		});  
  });
  //挂机
  $("#hangup").click(function(){
	voip.hangup($("#phoneno").val(),function(data){
		if(data.code==0){
			alert('挂机成功：'+$("#phoneno").val());
			$(".normal-state-logined #hangup").addClass("hidden");
		}else{
			alert('挂机失败：'+$("#phoneno").val());
		}
	});   
  });
  //接听
  $("#Answer").click(function(){
	voip.answerPhone($("#phoneno").val(),function(data){
		if(data.code==0){
			alert('接听成功：'+$("#phoneno").val());
		}else{
			alert('接听失败：'+$("#phoneno").val());
		}
	});   
  });
  //静音
  $("#StopPhone").click(function(){
	voip.StopPhone($("#phoneno").val(),function(data){
		if(data.code==0){
			$("#popupscreendiv").append("静音成功："+$("#phoneno").val()+"<br>");
		}else{
			$("#popupscreendiv").append("静音失败："+$("#phoneno").val()+"<br>");
		}
	});   
  });
  
  //转接 可以转接到坐席，传真，手机等---非坐席类电话，需要有空闲的线路
  $("#ivr").click(function(){
	  var phone = $("#phoneivr").val();
	  if(phone==null||phone.length<3){
		alert("号码不能为空");
	  }
	  voip.TransferUser(phone,function(data){
		if(data.code==0){
			$("#popupscreendiv").append("转接成功："+$("#phoneivr").val()+"<br>");
		}else{
			$("#popupscreendiv").append("转接失败："+$("#phoneivr").val()+"<br>");
		} 
	  });
  });
});
// 调用拨打电话
function voipCallPhone(phone){
	let type=$('.normal-state-logined').attr("type");
	if(!type){
		alert("请先登录！");
		$(".normal-state").addClass("hidden");
    $(".phoneCtrl,.normal-state-open").removeClass("hidden");
		return;
	}
	if(phone==null||phone.length<3){
		alert("号码不能为空");
	}
	if(phone.indexOf("-")>0){  //处理座机号码
		let tellPhoneArr=phone.split("-");
		phone=tellPhoneArr[0]+tellPhoneArr[1];
	}
	phone=phone.replace(/\s/g,"");
	voip.CallPhone(phone,function(data){
		if(data.code==0){
			alert('拔号成功：'+phone);
			$(".normal-state-logined #hangup").removeClass("hidden");
		}else{
			alert('拔号失败：'+data.message);
		}
	}); 
}