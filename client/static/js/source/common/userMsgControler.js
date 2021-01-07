//个人信息 ocr =》编辑||保存||取消按钮js
import React from 'react';
import $ from 'jquery';
import Address from '../../view/module/address';
import CommonJs from './common';
var commonJs=new CommonJs;

class UserMsgControler{
    // msg-ul列表编辑按钮
    Edit(edit_req_url,event){
        var _that=this;
        var _this=$(event.target);
        let msg_cont_parent=_this.closest(".bar");
        let msg_cont=msg_cont_parent.find(".msg-cont,.editInput");
        let info_ul=_this.closest("ul");
        var tradings_array=[];
        var oldDataObj={}; //编辑前的数据列表
        oldDataObj.accountId=this.state.this_params;
        var newDataObj={};  //编辑后的数据列表
        var _data={};  //ajax提交给后台服务器数据
        var typeInTime_div="";
        var n=0;
        var condition=true;
        if(msg_cont_parent.find(".type-in-timer")){  
            typeInTime_div=msg_cont_parent.find(".type-in-timer");
        }
        
        let isRequired,required_tip_text;
        if(_this.text()=="修改"){
            var reference_myRadio_dom=_this.closest(".toggle-box").find(".referenceEditClass");
            if(reference_myRadio_dom && reference_myRadio_dom.length>0){
                _that.edit_OtherReference();
            }
            //点击编辑隐藏图标
            msg_cont_parent.find(".phont-btn-user").addClass("hidden");
            msg_cont_parent.find(".online-time").addClass("hidden");
            msg_cont_parent.find(".phoneIsSame").addClass("hidden");
            msg_cont_parent.find(".sex-dom").addClass("hidden");

            //搜索详情页 ocr 录入计时
            if(msg_cont_parent.find(".type-in-timer")){  
                typeInTime_div.find(".typeInTime").text(0);
                this.setState({
                    theTimer:setInterval(function () {
                        n=n+1;
                        typeInTime_div.find(".typeInTime").text(n);
                    },1000)
                })
                typeInTime_div.removeClass("hidden");
            }
            this.state.theTimer;
            if(info_ul.attr("id")){
                oldDataObj.id=info_ul.attr("id");
            }
            //银行流水
            if(msg_cont_parent.find(".bank-running-tab").length>0){
                let bankTable=msg_cont_parent.find(".bank-running-tab");
                bankTable.find("td").each(function(){
                    $(this).find(".del-btn").removeClass("hidden");
                    let _parem=$(this).attr("data-param");
                    let _text=$(this).find(".bankRunning").text();
                    $(this).find(".bankRunning").addClass("hidden");
                    if(_parem=="time"){
                        $(this).find(".banklisttime-div").removeClass("hidden");
                    }else if(_parem=="input"){
                        $(this).append('<input type="text" class="input" value="'+_text+'">')
                    }else if(_parem=="select"){
                        let _select='<select name="" id="" class="select-gray typeTrading">'+
                                        '<option value="" data-name="SALARY">工资/代发工资</option>'+
                                        '<option value="" data-name="SMALL_BALANCE_FOR_MONTH">月最小余额</option>'+
                                        '<option value="" data-name="BALANCE_FOR_PAYDAY">发薪日余额</option>'+
                                        '<option value="" data-name="PAYMENT_AMOUNT_FOR_MONTH">月总还款金额</option>'+
                                        '<option value="" data-name="CASH_ATM_FOR_BANK">现金/ATM存入</option>'+
                                    '</select>'
                        $(this).append(_select);
                        $(this).find(".typeTrading option[data-name='"+$(this).find(".bankRunning").attr("data-code")+"']").attr("selected","selected");
                    }
                })
            }

            //循环
            msg_cont.each(function () {
                var edit_html;
                let b_paramName=$(this).attr("data-paramname");
                let this_edit_type=$(this).attr("data-edit-type");
                let verify=$(this).attr("data-verify");
                let theText=$(this).text();
                let realData=$(this).text();  //身份证和手机号星号显示后，保存真实号码
                if(realData.indexOf("*")>=0){
                    realData=$(this).attr("data-cake");
                }
                if(theText=="-"){
                    theText="";
                }
                oldDataObj[b_paramName]=theText; //编辑前的数据列表
                if($(this).attr("data-inp-paramname")){ 
                    oldDataObj[b_paramName]=$(this).attr("value"); //编辑前的数据列表--获取地址省、市、区id默认值  && 选取时间 
                }
                _that.setState({
                    _oldDataObj:oldDataObj
                })
                if (this_edit_type=="input"){  //文本框
                    if(verify && verify=="phone"){
                        edit_html='<input class="input ml20 editInput left afterInput" type="text" data-realData="'+realData+'" value="'+theText+'" id="'+b_paramName+'" data-inp-paramName="'+b_paramName+'" onkeyup="myaer(this)" />';
                    }else if(verify && verify=="onlyMobile"){
                        edit_html='<input class="input ml20 editInput left afterInput" type="text" data-realData="'+realData+'" value="'+theText+'" id="'+b_paramName+'" data-inp-paramName="'+b_paramName+'" onkeyup="onlyMobile(this)" />';
                    }else{
                        edit_html='<input class="input ml20 editInput left afterInput" type="text" data-realData="'+realData+'" value="'+theText+'" id="'+b_paramName+'" data-inp-paramName="'+b_paramName+'"/>';                        
                    }
                }
                if (this_edit_type=="select"){  //下拉框
                    edit_html= _that.state.edit_type_select[b_paramName];
                    let default_selected_val=$(this).parent().find("select option:selected").attr("value");//当用户未选择时，下拉框获取默认值传给后台
                    $(this).parent().find(".getSelectedVal").attr("value",default_selected_val);
                }
                if (this_edit_type=="address"){  //选择地址
                    msg_cont_parent.find(".address-div").removeClass("hidden");
                }
                if (this_edit_type=="select-data"){  //选择日期
                    msg_cont_parent.find(".select-data-div").removeClass("hidden");
                }
                if(this_edit_type=="checbox"){  //checbox
                    oldDataObj[b_paramName]=$(this).parent().find(".myCheckbox-readOnly").attr("data-name"); //编辑前的数据列表--checbox

                    let nextAll_i=$(this).parent().find(".myCheckbox");
                    nextAll_i.each(function () {
                        if($(this).hasClass("myCheckbox-readOnly")){
                            $(this).removeClass("myCheckbox-readOnly").addClass("myCheckbox-visited");
                        }
                    })
                    nextAll_i.click(function () {
                        nextAll_i.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                        $(this).addClass("myCheckbox-visited");
                    })
                }
                if(this_edit_type=="radio"){  //radio
                    oldDataObj[b_paramName]=$(this).parent().find(".cpyRadio:visible").find(".myRadio").attr("data-name"); //编辑前的数据列表--Radio

                    let nextAll_i=$(this).parent().find(".myRadio");
                    
                    var myRadio_dom=$(this).parent().find(".cpyTellPhone");  //单位座机修改
                    if(myRadio_dom && myRadio_dom.length>0){
                        myRadio_dom.removeClass("hidden");
                        _that.edit_CompanyPhoneText();
                    }

                    nextAll_i.click(function () {
                        nextAll_i.removeClass("myRadio-visited").addClass("myRadio-normal");
                        $(this).addClass("myRadio-visited");
                    })
                }
                $(this).after(edit_html);

                msg_cont.addClass("hidden");
                _this.removeClass("btn-white").addClass("btn-blue").text("保存");
                msg_cont_parent.find(".cancle_edit").removeClass("hidden");
            })
            //详情ocr 工作证明类型调用对应方法
            if(this.workMsgEdit){
                this.workMsgEdit();
            }
            
        }else { //保存
            //详情ocr 录入计时
            if(msg_cont_parent.find(".type-in-timer") && msg_cont_parent.find(".type-in-timer").length>0){ 
                let _operateTime=typeInTime_div.find(".typeInTime").text();
                newDataObj.operateTime=_operateTime;  //传给后台 操作时间
                clearInterval(this.state.theTimer);
                typeInTime_div.find(".typeInTime").text(0);
                typeInTime_div.addClass("hidden");
            }
            
            msg_cont_parent.find(".edited-select").each(function () {  //获取select框选择后的值 
                isRequired=$(this).closest("li").find(".msg-tit").attr("data-required");  //是否必填属性
                required_tip_text=$(this).closest("li").find(".msg-tit").text(); //必填alert提示标题
                if(isRequired){
                    if($(this).find("option:selected").attr("value")==""){
                        $(this).addClass("warnBg");
                        alert(required_tip_text+"是必填项！");
                        condition=false;
                    }else{
                        $(this).removeClass("warnBg");
                    }
                }
                let selectEditVal=$(this).find("option:selected").attr("value");
                $(this).next(".getSelectedVal").val(selectEditVal);
            });
            msg_cont_parent.find(".editInput").each(function () {
                isRequired=$(this).closest("li").find(".msg-tit").attr("data-required");  //是否必填属性
                required_tip_text=$(this).closest("li").find(".msg-tit").text(); //必填alert提示标题
                if(isRequired){
                    if($(this).val()==""){
                        $(this).addClass("warnBg");
                        alert(required_tip_text+"是必填项！");
                        condition=false;
                    }else{
                        $(this).removeClass("warnBg");
                    }
                }
                var dataPiker_dig=($(this).closest("li").find(".msg-cont").attr("data-edit-type")=="select-data");
                //编辑后地址未选择时获取默认值
                let ADDRESS_selected=$(this).closest(".address-selected");
                let parent_is_ADDRESS=$(this).closest(".ADDRESS");
                let is_parent_is_ADDRESS=parent_is_ADDRESS && parent_is_ADDRESS.length>0;
                let is_ADDRESS_selected=!ADDRESS_selected || ADDRESS_selected.length<=0;
                var this_attr="";
                if(is_parent_is_ADDRESS && is_ADDRESS_selected){//解析省市区的code-input框
                    this_attr=$(this).attr("data-inp-paramName");
                    var this_defaultVal=$(this).attr("value");
                    if(this_defaultVal=="-"){
                        this_defaultVal="";
                    }
                    newDataObj[this_attr]=this_defaultVal;  
                }else if(dataPiker_dig){
                    this_attr=$(this).attr("data-inp-paramName");
                    let default_time=$(this).attr("value");
                    newDataObj[this_attr]=default_time;
                    // $(this).closest("li").find(".editInput").val(userMsgControler.getNowTimeYMD());
                }else{
                    this_attr=$(this).attr("data-inp-paramName");
                    var this_val=$(this).val();
                    if(this_val.indexOf("*")>=0){
                        this_val=$(this).attr("data-realData");  //取星号显示的真实值
                    }
                    if(this_val=="-"){
                        this_val="";
                    }
                    if(this_val){
                        newDataObj[this_attr]=this_val;  //编辑后的数据列表
                    }
                    
                }
            });
            msg_cont_parent.find(".checbox-div").each(function () {
                var this_attr=$(this).attr("data-inp-paramName");
                var this_val=$(this).find(".myCheckbox-visited").attr("data-name");
                if(typeof(this_val)!="undefined"){  //用户没选择
                    newDataObj[this_attr]=this_val; //checbox
                }
            });
            msg_cont_parent.find(".radio-div").each(function () {  // radio
                var this_attr=$(this).attr("data-inp-paramName"); 
                var this_val=$(this).find(".myRadio-visited").attr("data-name");
                newDataObj[this_attr]=this_val; //类型

                let _dom=$(this).parent().find(".cpyTellPhone");
                if(_dom && _dom.length>0 && !_dom.find(".MOBILE-edit-div").hasClass("hidden")){
                    newDataObj.companyPhone=_dom.find(".MOBILE-edit-inp").val();// 单位座机值传给后端
                }else{
                    let _area_No=_dom.find(".area-No").val();
                    let _phone_No=_dom.find(".phone-No").val();
                    let _brach_No=_dom.find(".brach-No").val();
                    newDataObj.companyPhone=_area_No+"-"+_phone_No+"-"+_brach_No;   // 单位座机值传给后端
                }
            });
            
            //ocr 银行流水列表
            if(msg_cont_parent.find(".bank-running-tab").length>0){
                msg_cont_parent.find(".bank-running-tab").find(".bankmsg-tab").each(function () { 
                    var tradings_obj={};  //修改银行流水 
                    tradings_obj.gmtTrading=$(this).find(".gmtTrading-td").find(".ant-calendar-picker-input").attr("value");
                    if(typeof(tradings_obj.gmtTrading)=="undefined" || tradings_obj.gmtTrading==""){
                        alert("请选择日期！");
                        condition=false;
                        return condition;
                    }

                    tradings_obj.typeTrading=$(this).find(".typeTrading-td option:selected").attr("data-name");
                    if(tradings_obj.amountTrading==""){
                        alert("请输入总金额！");
                        condition=false;
                        return condition;
                    }

                    tradings_obj.amountTrading=$(this).find(".amountTrading-td").find("input:visible").val();
                    if(isNaN(tradings_obj.amountTrading)){
                        alert("总金额必须是数字！");
                        condition=false;
                        return condition;
                    }

                    tradings_obj.numTrading=$(this).find(".numTrading-td").find("input:visible").val();
                    if(tradings_obj.numTrading==""){
                        alert("请输入笔数！");
                        condition=false;
                        return condition;
                    }
                    if(tradings_obj.numTrading>=100){
                        alert("笔数超出限制，请重新输入！");
                        condition=false;
                        return condition;
                    }
                    if(isNaN(tradings_obj.numTrading)){
                        alert("笔数必须是数字！");
                        condition=false;
                        return condition;
                    }

                    tradings_array.push(tradings_obj);
                })
                newDataObj["tradings"]=tradings_array; 
            }
            if(!condition){
                return;
            }

            //获取id
            let _info_ul=_this.closest(".toggle-box").find(".info-ul").attr("data-id");
            if(_info_ul && _info_ul!="-"){
                newDataObj.id=_info_ul;
            }

            if(_this.hasClass("addrModify")){  //地址证明--保存
                let _addressProofId=_this.closest(".toggle-box").find(".info-ul").attr("data-addressProofId");
                newDataObj.addressProofId=_addressProofId;
                if(_addressProofId=="-"){
                    newDataObj.addressProofId="";
                }
            }

            if(msg_cont_parent.find(".contactOther").length>0){
                var _otherReferenceType=$(".contactOther i.myRadio-visited").parent().attr("data-otherReferenceType");//个人信息板块 传联系人信息给后台 其他联系人|旁系联系人 类型
                newDataObj.otherReferenceType=_otherReferenceType;
            }
            newDataObj.accountId=this.state.this_params;
            newDataObj.loanNumber=this.state.this_loanNumber;
            if(!condition){
                return;
            }

            newDataObj.customerId=this.state.customerId;
            if(_this.hasClass("bankModify")){  //银行流水--保存
                newDataObj.bankCode="";  //银行编号
                _data={josnParam:JSON.stringify(newDataObj)};
            }else{
                _data=newDataObj;  //ajax提交给后台服务器数据
            }
            if(msg_cont_parent.find(".warnBg").length>0){
                alert("请输入正确的信息！");
                return;
            }
            $.ajax({
                type:'get',
                url:edit_req_url,
                data:_data,
                async:false,
                dataType:'json',
                success:function (res) {
                    if (!CommonJs.ajaxGetCode(res)) {
                        return;
                    }
                    let _getData = res.data;
                    alert(_getData.message);
                    _that.getMsg();
                    let parent_bar=_this.closest(".bar");
                    //显示电话图标
                    if(msg_cont_parent.find(".phont-btn-user") && msg_cont_parent.find(".phont-btn-user").length>0){
                        msg_cont_parent.find(".phont-btn-user").removeClass("hidden");
                    }
                    _this.text("修改").removeClass("btn-blue").addClass("btn-white");
                    _this.parent().find(".cancle_edit").addClass("hidden");
                    parent_bar.find(".afterInput,.select-gray").remove();
                    parent_bar.find(".address-div,.address-select-box,.select-data-div").addClass("hidden");
                    parent_bar.find(".msg-cont").removeClass("hidden");
                    $(".bankAddList_tr").remove();
                    parent_bar.find(".myCheckbox,.myRadio").unbind("click");
                    $(".add-btn,.followUpTime,.cpyTellPhone").addClass("hidden");
                    $(".cpyRadio").find(".myRadio").addClass("hidden");
                    $("[data-otherreferencetype='"+newDataObj.otherReferenceType+"']").addClass("hidden");
                    $(".radio-div").find("[data-companyphonetype='"+newDataObj.companyPhoneType+"']").siblings().addClass("hidden");
                    $(".checbox-div").find(".myCheckbox-visited").addClass("myCheckbox-readOnly");
                    parent_bar.find(".online-time,.phoneIsSame,.sex-dom").removeClass("hidden");
                }
            })
        }
    }
    // 取消保存 个人信息板块和ocr
    cancle_Edit(even){
        let _this=$(even.target);
        let parent_bar=_this.closest(".bar");
        parent_bar.find(".afterInput,.select-gray").remove();
        parent_bar.find(".address-div,.address-select-box,.select-data-div,.followUpTime").addClass("hidden");
        parent_bar.find(".msg-cont,.phoneIsSame,.sex-dom").removeClass("hidden");
        
        _this.addClass("hidden");
        _this.parent().find(".edit").text("修改").removeClass("btn-blue").addClass("btn-white");
        
        //隐藏电话图标
        if(parent_bar.find(".phont-btn-user") && parent_bar.find(".phont-btn-user").length>0){
            parent_bar.find(".phont-btn-user").removeClass("hidden");
        }
        parent_bar.find(".online-time").removeClass("hidden");

        parent_bar.find(".myCheckbox").unbind("click");
        // parent_bar.find(".myCheckbox").removeClass("myCheckbox-visited");
        // parent_bar.find(".myCheckbox-visited").addClass("myCheckbox-readOnly");

        if(parent_bar.find(".bankAddList_tr").length>0){
            $(".bankAddList_tr").remove();
            $(".add-btn").addClass("hidden");
        }
        parent_bar.find(".cpyTellPhone").addClass("hidden");
        parent_bar.find(".radio-div").find(".myRadio").addClass("hidden");
        
        //详情ocr 录入计时
        var typeInTime_div="";
        if(parent_bar.find(".type-in-timer")){  
            typeInTime_div=parent_bar.find(".type-in-timer");
        }
        if(parent_bar.find(".type-in-timer")){ 
            typeInTime_div.find(".typeInTime").text(0);
            typeInTime_div.addClass("hidden");
            clearInterval(this.state.theTimer);
        }
        this.getMsg();
    } 
}

export default UserMsgControler;