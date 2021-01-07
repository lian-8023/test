import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import Address from './address';
import GetAddressByCode from  '../../source/common/getAddressByCode';
var getAddressByCode=new GetAddressByCode; //根据编码获取地址
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import UserMsgControler from '../../source/common/A2userMsgControler.js';
var userMsgControler=new UserMsgControler;
import BankName from '../../source/common/bankName';
var bankName=new BankName;
// 选择时间组件
import { DatePicker ,Button } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class UserMsg extends React.Component {
    constructor(props){
        super(props);
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息
        this.commonStore=this.props.allStore.CommonStore; 
    }
    
    //获取地址
    getAddress(addrObj){
        var new_selected_addr={
            pince:addrObj.prince,
            pince_id:addrObj.pince_id,
            city:addrObj.city,
            city_id:addrObj.city_id,
            district:addrObj.district,
            district_id:addrObj.district_id
        };
        this.setState({
            _selected_addr:new_selected_addr
        })
    }
    componentDidMount (){
        commonJs.reloadRules();
        // this.pub_getMsg(this.state.this_params);
        $(".detail-top-select").addClass("hidden");
        var _that=this;
        $(".contactMsg-edit").click(function () {
            // $(".contactOther label").removeClass("hidden");
            $(".contactOther label i").click(function () {
                let $this=$(event.target);
                let thisType=$this.parent().attr("data-otherreferencetype");
                _that.controlOtherReference(thisType);
            })
        })
        $(".workPhoneMsg").on("click","i",function(){
            let this_data_name=$(this).attr("data-name");
            _that.controlCompanyPhoneText(this_data_name);
        })
        //根据银行卡号获取银行名称
        $(".bankCard-li").on("keyup",".editInput",function(){
            var cardNo=$(".bankCard-li .editInput").val();
            let getBankName='';
            if(cardNo.length>9){
                $.ajax({
                    type:"get",
                    url:"/common/bank/all",
                    async:true,
                    dataType: "JSON",
                    data:{
                        bankCardNo:cardNo
                    },
                    success:function(res) {
                        if (!commonJs.ajaxGetCode(res)) {
                            return;
                        }
                        let _getData = res.data;
                        getBankName=_getData.bankName;
                        $(".bankName-li .editInput").val(getBankName);
                    }
                })
            }
        })
        
    }

    //联系人信息-修改
    edit_OtherReference(){
        var _contactInfo = this.userInfo2AStore.contactInfo;  //工作信息
        this.controlOtherReference(_contactInfo.otherReferenceType);
    }
    /**
     * 联系人信息-其他联系人和旁系联系人切换效果
     * @param referenceType 联系人类型 OTHER
     */
    controlOtherReference(referenceType){
        var _that=this;
        let accessryInfo = this.userInfo2AStore.accessryInfo;
        $(".referenceEditClass [data-otherreferencetype]").removeClass("hidden");
        $(".referenceEditClass [data-otherreferencetype]").find(".myRadio").removeClass("hidden").removeClass("myRadio-visited").addClass("myRadio-normal");
        $(".referenceEditClass [data-otherreferencetype='"+referenceType+"']").find(".myRadio").removeClass("myRadio-normal").addClass("myRadio-visited");
        var _contactInfo = this.userInfo2AStore.contactInfo;
        if(referenceType=="OTHER"){
            $(".cantact-name .editInput").attr("data-inp-paramname","otherReferenceName").val(_contactInfo.otherReferenceName);
            $(".cantact-phone .editInput").attr("data-inp-paramname","otherReferencePhone").val(commonJs.phoneReplace(accessryInfo.viewPhone,_contactInfo.otherReferencePhone));
            $(".cantact-relation .editInput").attr("data-inp-paramname","otherReferenceRelation").val(_contactInfo.otherReferenceRelation);
            $(".cantact-relation .msg-cont").attr("data-paramname","otherReferenceRelation");
            var _otherReferenceRelations=_contactInfo.otherReferenceRelations;
            var new_select='';//设置默认值
            for(let i=0;i<_otherReferenceRelations.length;i++){
                new_select+='<option value='+_otherReferenceRelations[i].name+" "+(_contactInfo.otherReferenceRelation==_otherReferenceRelations[i].displayName?'selected="selected"':'')+'>'+_otherReferenceRelations[i].displayName+'</option>'
            }
            $(".cantact-relation select").html(new_select);
        }else{
            $(".cantact-name .editInput").attr("data-inp-paramname","undirectReferenceName").val(_contactInfo.undirectReferenceName);
            $(".cantact-phone .editInput").attr("data-inp-paramname","undirectReferencePhone").val(commonJs.phoneReplace(accessryInfo.viewPhone,_contactInfo.undirectReferencePhone));
            $(".cantact-relation .editInput").attr("data-inp-paramname","undirectReferenceRelation").val(_contactInfo.undirectReferenceRelation);
            $(".cantact-relation .msg-cont").attr("data-paramname","undirectReferenceRelation");
            var _undirectContactsRelations=_contactInfo.undirectContactsRelations;
            var new_select='';//设置默认值
            for(let i=0;i<_undirectContactsRelations.length;i++){
                new_select+='<option value='+_undirectContactsRelations[i].name+" "+(_contactInfo.undirectReferenceRelation==_undirectContactsRelations[i].displayName?'selected="selected"':'')+'>'+_undirectContactsRelations[i].displayName+'</option>'
            }
            $(".cantact-relation select").html(new_select)
        }
    }

    //工作信息-修改
    edit_CompanyPhoneText(){
        var workInfo_result = this.userInfo2AStore.workInfo;  //工作信息
        this.controlCompanyPhoneText(workInfo_result.companyPhoneType);
    }

    /**
     * 工作信息-单位手机和座机切换效果
     * @param companyTellType 需要切换到的类型FIXED 、MOBILE
     */
    controlCompanyPhoneText(companyTellType){
        let accessryInfo = this.userInfo2AStore.accessryInfo;
        var workInfo_result = this.userInfo2AStore.workInfo;  //工作信息
        $(".workPhoneMsg [data-companyphonetype]").removeClass("hidden");
        $(".workPhoneMsg [data-companyphonetype]").find(".myRadio").removeClass("hidden").removeClass("myRadio-visited").addClass("myRadio-normal");
        $(".workPhoneMsg [data-companyphonetype='"+companyTellType+"']").find(".myRadio").removeClass("myRadio-normal").addClass("myRadio-visited");
        if(companyTellType=="FIXED"){
            $(".FIXED-edit-div .area-No").val(workInfo_result.companyPhoneAreaCode ? workInfo_result.companyPhoneAreaCode : "");
            $(".FIXED-edit-div .phone-No").val(workInfo_result.companyPhone ? commonJs.phoneReplace(accessryInfo.viewPhone,workInfo_result.companyPhone) : "");
            $(".FIXED-edit-div .brach-No").val(workInfo_result.companyPhoneExtNumber ? workInfo_result.companyPhoneExtNumber : "");
            $(".cpyTellPhone").find(".FIXED-edit-div").removeClass("hidden");
            $(".cpyTellPhone").find(".MOBILE-edit-div").addClass("hidden");
        }else{
            $(".cpyTellPhone").find(".FIXED-edit-div").addClass("hidden");
            $(".cpyTellPhone").find(".MOBILE-edit-div").removeClass("hidden");
            $(".MOBILE-edit-inp").val(workInfo_result.companyPhoneMobile ? commonJs.phoneReplace(accessryInfo.viewPhone,workInfo_result.companyPhoneMobile) : "");
        }
    }

    //发送短信--弹框
    sendMsg(){
        this.userInfo2AStore.getUserInfo2A();
        let _that=this;
        let _accound=this.userInfo2AStore.acountId;
        let _loanNumber=this.userInfo2AStore.loanInfoDTO.loanNumber;
        let _bankReservePhone=this.userInfo2AStore.bankInfo.bankReservePhone;  //银行卡预留手机号
        let _bankCardNumber=$(".bank-msg .bankCard-li .msg-cont[data-paramname='bankCardNumber']").text();
        let _bankName=$(".bank-msg .bankName-li .msg-cont").text();
        let _oName=$(".bank-msg b[data-paramname='oName']").text();
        if(!_accound || _accound==""){
            alert("账号不能为空！")
            return;
        }
        if(!_loanNumber || _loanNumber==""){
            alert("合同号不能为空！");
            return;
        }
        if(!_bankCardNumber || _bankCardNumber==""){
            alert("银行卡号不能为空！");
            return;
        }
        if(!_bankName || _bankName==""){
            alert("银行名称不能为空！");
            return;
        }
        if(!_oName || _oName==""){
            alert("oName不能为空！");
            return;
        }
        $.ajax({
            type:"get",
            url:"/node/smsmodel",
            async:true,
            dataType: "JSON",
            data:{
                accountId:_accound,
                loanNumber:_loanNumber,
                bankName:_bankName,
                bankCardNumber:_bankCardNumber,
                oName:_oName,
                bankReservePhone:_bankReservePhone
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                _that.setState({
                    msg_cont:_getData.resign_sms_content,
                    msgSendTo_url:_getData.resign_url
                });
                $(".sendMsg-prop .msg-content").val(_that.state.msg_cont);
                $(".sendMsg-prop").removeClass("hidden");
            }
        })
    }
    //点击发送 
    sendTo_fn(){
        let _that=this;
        $.ajax({
            type:"get",
            url:"/node/sendSMS",
            async:true,
            dataType: "JSON",
            data:{
                accountId:this.userInfo2AStore.acountId,
                loanNumber:this.userInfo2AStore.loanInfoDTO.loanNumber,
                resign_url:this.userInfo2AStore.msgSendTo_url,
                primaryPhone:this.userInfo2AStore.userInfo.primaryPhone,
                unionpayId:this.userInfo2AStore.bankInfo.unionPayId
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                $(".sendMsg-prop").addClass("hidden");
                _that.getMsg();
            }
        })
    }
    closeSendMsg(){
        $(".sendMsg-prop").addClass("hidden");
    }
    //设置密码--保存
    EditUserPwd(event){
        let _that=this;
        let $this=$(event.target);
        let _password=$this.closest(".bar").find(".userPassword").val();
        let _password_sure=$this.closest(".bar").find(".userPassword_sure").val();
        if (_password!=_password_sure){
            alert("确认密码和新密码不一致，请重新输入！");
            return;
        }
        $.ajax({
            type:"get",
            url:"/node/user/pwd",
            async:false,
            dataType: "JSON",
            data:{
                accountId:this.userInfo2AStore.acountId,
                primaryPhone:this.userInfo2AStore.userInfo.primaryPhone,
                password:_password
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                if(!_getData.executed){
                    console.log("设置密码失败");
                    return;
                }
                alert(_getData.message);
                $this.closest(".bar").find(".userPassword").val("");
                $this.closest(".bar").find(".userPassword_sure").val("");
            }
        })
    }
    //设置密码--取消
    cancelUserPwd(event){
        let $this=$(event.target);
        $this.closest(".bar").find(".userPassword").val("");
        $this.closest(".bar").find(".userPassword_sure").val("");
    }
    // 电话图标
    callPhone(phoneNo){
        let _location=this.props.get_location;
        let accessryInfo = this.userInfo2AStore.accessryInfo;
        if(_location=="/AST"){
            location.href="ALICCT:dialout?calleeno="+commonJs.queueEncypt800("/AST",phoneNo);
        }else if(_location=="/AST2"){
            location.href="ALICCT:dialout?calleeno="+commonJs.queueEncypt800("/AST2",phoneNo);
        }else if(_location=="OCR"){
            location.href="ALICCT:dialout?calleeno="+commonJs.queueEncypt800("OCR",phoneNo);
        }else{
            if(accessryInfo.callByTianr=="YES"){
                voipCallPhone(phoneNo);
            }else{
                location.href="ALICCT:dialout?calleeno="+commonJs.encypt800(phoneNo);
            }
        }  
    }
    // 电话号码验证
    myaer(event){
        let $this=$(event.target);
        var _val=$this.val();
        var phoneVeri=!(/^1\d{10}$/.test(_val));
        if(_val.length>0 && (isNaN(_val) || phoneVeri) && _val.indexOf("0")!=0){
            $this.addClass("warnBg");
        }else{
            $this.removeClass("warnBg");
        }
    }
    /**
     * 判断信息是否一致，若一致文字提示红色
     * @param {*} info 需要作判断的数据
     * @param {*} type 类型：姓名:name、电话:phone、详细地址:addr
     */
    isSame(info,type){
        if(!info){
            return;
        }
        let baseArray=[];
        let result=false;        
        let userInfo2AStore=this.userInfo2AStore;
        if(type=="name"){
            baseArray=userInfo2AStore.nameSet;
        }else if(type=="phone"){
            baseArray=userInfo2AStore.phoneSet;
        }else if(type=="addr"){
            baseArray=userInfo2AStore.addressSet;
        }
        for(let i=0;i<baseArray.length;i++){
            if(info==baseArray[i]){
                result=true;
            }
        }
        return result;
    }
    //注销
    logout=(e,userInfo_result)=>{
        e.stopPropagation();
        let {primaryPhone} = userInfo_result;
        if(primaryPhone&&primaryPhone.length>0){
            $.ajax({
                type:"post",
                url:'/node/identity/logout',
                async:true,
                dataType: "JSON",
                data:{phone:primaryPhone},
                success:function(res) {
                    if (!commonJs.ajaxGetCode(res)) {
                        return;
                    }
                    alert(res.message);
                }
            })
        }else{
            alert('该用户信息缺失手机号');
        }
    }
    render() {
        let userInfo2AStore=this.userInfo2AStore;
        let loanInfoDTO_result=userInfo2AStore.loanInfoDTO,  //贷款信息
            userInfo_result =userInfo2AStore.userInfo,  //个人信息
            bankInfo_result = userInfo2AStore.bankInfo,  //银行信息  
            contactInfo_result = userInfo2AStore.contactInfo,  //联系人信息
            workInfo_result = userInfo2AStore.workInfo,  //工作信息
            otherInfo_result = userInfo2AStore.otherInfo ; //选填信息
        let accessryInfo = userInfo2AStore.accessryInfo;
        let contactInfoOtherPhone = (contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferencePhone:contactInfo_result.undirectReferencePhone);
        let commonJs=new CommonJs;
        //身份证号打星
        let newNationalId=commonJs.newNationalIdReplace(accessryInfo.viewIdcard,userInfo_result.nationalId);

        let collectionNextData=cpCommonJs.opinitionObj(this.commonStore.collectionNextData);
        let collectionOverdueInfoDTOS=collectionNextData.collectionOverdueInfoDTOS;
        let collectionGrade='';
        if(collectionOverdueInfoDTOS && collectionOverdueInfoDTOS[0]){
            collectionGrade=collectionOverdueInfoDTOS[0].collectionGrade;
        }
        let stopDay=collectionNextData.stopDay;
        let guaranteeFeeInfo=collectionNextData.guaranteeFeeInfo;  //担保费是否逾期 仅 collection 中详情展示
        return (
            <div className="auto-box pr5 relative">
                <div className="toggle-box mt10" data-btn-rule="RULE:DETAIL:LOAN:DIV">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit on" onClick={commonJs.content_toggle.bind(this)}>
                        贷款信息
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <div className="bar mt5 loanInfoDTO">
                        <ul className="info-ul loan-msg">
                            <li>
                                <p className="msg-tit">贷款号码</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.loanNumber:"")}>
                                    {commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.loanNumber:"")}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">贷款本钱</p>
                                <b className="msg-cont" data-paramname="loan_principal">{commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.loan_principal:"")}</b>
                            </li>
                            <li>
                                <p className="msg-tit">放款日期</p>
                                <b className="msg-cont" data-paramname="fundingSuccessDate">{commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.fundingSuccessDate:"")}</b>
                            </li>
                            <li>
                                <p className="msg-tit">loan状态</p>
                                <b className="msg-cont" data-paramname="loanStatus">{commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.loanStatus:"")}</b>
                            </li>
                            <li>
                                <p className="msg-tit">processing状态</p>
                                <b className="msg-cont" data-paramname="processingInfoDTO" title={commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.processingInfoDTO:"")}>
                                    {commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.processingInfoDTO:"")}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">展期状态</p>
                                <b className="msg-cont" data-paramname="extensionQualification">{commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.extensionQualification:"")}</b>
                            </li>
                            <li>
                                <p className="msg-tit">催收等级</p>
                                <b className="msg-cont">{commonJs.is_obj_exist(collectionGrade)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">停留时间</p>
                                <b className={(stopDay==1)?'red msg-cont':'msg-cont'}>{commonJs.is_obj_exist(stopDay)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">担保费是否逾期</p>
                                <b className="msg-cont">{commonJs.is_obj_exist(guaranteeFeeInfo)}</b>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="toggle-box mt10" data-btn-rule="RULE:DETAIL:USERINFO:DIV">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        个人信息
                        {this.props.allStore.UserinfoStore.cooperationFlag=='2A'&&<Button type="primary" style={{marginLeft: '75%',width: '65px',height: '27px'}} onClick={(e)=>{this.logout(e,userInfo_result)}} >注销</Button>}
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <ul className="info-ul personal-msg">
                            <li>
                                <p className="msg-tit">姓名</p>
                                <b className={this.isSame(userInfo_result.name,"name")?"msg-cont red":"msg-cont"} data-paramname="name" data-edit-type="input">
                                    {commonJs.is_obj_exist(userInfo_result.name)}
                                </b>
                                <b className="left content-font sex-dom">
                                    ({userInfo_result.gender?commonJs.is_obj_exist(userInfo_result.gender.displayName):"-"})
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oName" data-edit-type="input">
                                    {commonJs.is_obj_exist(userInfo_result.name)}
                                </b>
                            </li>
                            <li className="ADDRESS">
                                <p className="msg-tit">家庭住址</p>
                                <b className="msg-cont elli" data-paramname="homeAddress_area" data-edit-type="address" title={commonJs.is_obj_exist(userInfo_result.homeAddress_area)}>
                                    {commonJs.is_obj_exist(userInfo_result.homeAddress_area)}
                                </b>
                                <div className="address-div pl20 hidden relative">
                                    <Address _defaultAddr_val={userInfo_result.homeAddress_area} id='homeAddressArea' />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(userInfo_result.homeAddress_area)} className="getAddress editInput" data-inp-paramName="homeAddress_area" data-paramname="homeAddress_area" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(userInfo_result.homeProvinceId)} className="ProvinceId editInput" data-inp-paramName="homeProvinceId" data-paramname="homeProvinceId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(userInfo_result.homeCityId)} className="CityId editInput" data-inp-paramName="homeCityId" data-paramname="homeCityId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(userInfo_result.homeDistrictId)} className="DistrictId editInput" data-inp-paramName="homeDistrictId" data-paramname="homeDistrictId" hidden="hidden" />
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">详细</p>
                                <b className={this.isSame(userInfo_result.homeAddress,"addr")?"msg-cont elli red":"msg-cont elli"} title="'+{userInfo_result.homeAddress}+'" data-paramname="homeAddress" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.homeAddress)}>
                                    {commonJs.is_obj_exist(userInfo_result.homeAddress)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">住房情况</p>
                                <b className="msg-cont elli" data-paramname="housingSituation" data-edit-type="select" title={commonJs.is_obj_exist(userInfo_result.housingSituation)} >
                                    {commonJs.is_obj_exist(userInfo_result.housingSituation)} 
                                </b>
                                <input type="text" defaultValue={userInfo_result.housingSituation} className="getSelectedVal editInput" data-inp-paramName="housingSituation" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">出生日期</p>
                                <b className="msg-cont2 elli" title={commonJs.is_obj_exist(userInfo_result.birthday)}>
                                    {commonJs.is_obj_exist(userInfo_result.birthday)} 
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">手机号码</p>
                                <b data-cake={commonJs.is_obj_exist(userInfo_result.primaryPhone)} className={this.isSame(userInfo_result.primaryPhone,"phone")?"msg-cont elli red":"msg-cont elli"} data-paramname="primaryPhone" data-edit-type="input" data-verify="onlyMobile">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,userInfo_result.primaryPhone)}
                                </b>
                                {
                                    userInfo_result.primaryPhone&&userInfo_result.primaryPhone.length>0?<a className="phont-btn-user block left ml3 mr3" onClick={this.callPhone.bind(this,userInfo_result.primaryPhone)}></a>:""
                                }
                                <span className="online-time gray-tip-font left" title={commonJs.is_obj_exist(userInfo_result.primaryPhoneOnlineTime)}>
                                    {commonJs.is_obj_exist(userInfo_result.primaryPhoneOnlineTime)}
                                </span>
                            </li>
                            <li>
                                <p className="msg-tit">二代身份证</p>
                                <b className="msg-cont elli" data-paramname="nationalId" data-edit-type="input" title={commonJs.is_obj_exist(newNationalId)} data-cake={commonJs.is_obj_exist(userInfo_result.nationalId)}>
                                    {commonJs.is_obj_exist(newNationalId)} 
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oNationalId" data-edit-type="input" data-cake={commonJs.is_obj_exist(userInfo_result.nationalId)}>
                                    {commonJs.is_obj_exist(userInfo_result.nationalId)}
                                </b>
                            </li>
                            <li className="censusAddress-li">
                                <p className="msg-tit">户籍地址</p>
                                <b className={this.isSame(userInfo_result.censusAddress,"addr")?"msg-cont2 elli red":"msg-cont2 elli"} data-paramname="censusAddress" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.censusAddress)}>
                                    {commonJs.is_obj_exist(userInfo_result.censusAddress)}
                                </b>
                            </li>
                            <li data-btn-rule="RULE:DETAILS:OUTSIDE:KEY">
                                <p className="msg-tit">渠道来源</p>
                                <b className="msg-cont2 elli" data-paramname="sourceQuotient" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.sourceQuotient)}>
                                    {commonJs.is_obj_exist(userInfo_result.sourceQuotient)}
                                </b>
                            </li>
                            <li data-btn-rule="RULE:DETAILS:INSIDE:KEY">
                                <p className="msg-tit">渠道来源</p>
                                <b className="msg-cont2 elli" data-paramname="sourceQuotient" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.sourceQuotient_all)}>
                                    {commonJs.is_obj_exist(userInfo_result.sourceQuotient_all)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">第二号码</p>
                                
                                <b className={this.isSame(userInfo_result.secondTelNo,"phone")?"msg-cont elli red":"msg-cont elli"} data-paramname="secondTelNo" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.secondTelNo)} data-verify="phone">
                                    {commonJs.is_obj_exist(userInfo_result.secondTelNo)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">第三号码</p>
                                <b  className={this.isSame(userInfo_result.thirdTelNo,"phone")?"msg-cont elli red":"msg-cont elli"} data-paramname="thirdTelNo" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.thirdTelNo)} data-verify="phone">
                                    {commonJs.is_obj_exist(userInfo_result.thirdTelNo)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oBankCardNumber" data-edit-type="input">
                                    {commonJs.is_obj_exist(bankInfo_result.bankCardNumber)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oBankReservePhone" data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,bankInfo_result.bankReservePhone)}
                                </b>
                            </li>
                        </ul>
                        <div className={(this.userInfo2AStore.acountId && this.userInfo2AStore.isModify)?"clearfix":"hidden clearfix"} data-btn-rule="RULE:DETAIL:USERINFO:MODIFY:BUTTON">
                            <button className="btn-white left mt10 mb10 block ml20 edit" id='userInfoEdit' onClick={userMsgControler.Edit.bind(this,"/node/UserMsg_edit_contactMsg")}>修改</button>
                            <button className="btn-white left mt10 mb10 block ml20 hidden cancle_edit" id='userInfoEditCancle' onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                        </div>
                    </div>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        银行信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <ul className="info-ul bank-msg">
                            <li className="bankCard-li">
                                <p className="msg-tit">银行卡号</p>
                                <b className="msg-cont elli" data-edit-type="input" data-paramname="bankCardNumber" title={commonJs.is_obj_exist(bankInfo_result.bankCardNumber)}>
                                    {commonJs.is_obj_exist(bankInfo_result.bankCardNumber)}
                                </b>
                            </li>
                            <li className="bankName-li">
                                <p className="msg-tit">银行</p>
                                <b className="msg-cont" data-edit-type="input" data-paramname="bankName" title={commonJs.is_obj_exist(bankInfo_result.bankName)}>
                                    {commonJs.is_obj_exist(bankInfo_result.bankName)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">开户支行</p>
                                <b className="msg-cont elli" data-edit-type="input" data-paramname="bankBranch" title={commonJs.is_obj_exist(bankInfo_result.bankBranch)}>
                                    {commonJs.is_obj_exist(bankInfo_result.bankBranch)}
                                </b>
                            </li>
                            <li className="ADDRESS">
                                <p className="msg-tit">开户所在地</p>
                                <b className="msg-cont elli" data-paramname="bankAddress" data-edit-type="address" title={commonJs.is_obj_exist(bankInfo_result.bank_area)}>
                                    {commonJs.is_obj_exist(bankInfo_result.bank_area)}
                                </b>
                                <div className="address-div pl20 hidden relative">
                                    <Address _defaultAddr_val={bankInfo_result.bank_area} id='bankArea' />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(bankInfo_result.bank_area)} className="getAddress editInput" data-inp-paramName="bankAddress" data-paramname="bankAddress" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(bankInfo_result.bankProvinceId)} className="ProvinceId editInput" data-inp-paramName="bankProvinceId" data-paramname="bankProvinceId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(bankInfo_result.bankCityId)} className="CityId editInput" data-inp-paramName="bankCityId" data-paramname="bankCityId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(bankInfo_result.bankDistrictId)} className="DistrictId editInput" data-inp-paramName="bankDistrictId" data-paramname="bankDistrictId" hidden="hidden" />
                                </div>
                            </li>
                            <li className="bankCardPhone-li">
                                <p className="msg-tit" data-required="true">银行卡预留手机号码</p>
                                <b data-cake={commonJs.is_obj_exist(bankInfo_result.bankReservePhone)} className={this.isSame(bankInfo_result.bankReservePhone,"phone")?"msg-cont elli red":"msg-cont elli"} data-edit-type="input" data-paramname="bankReservePhone" data-verify="onlyMobile" title={commonJs.phoneReplace(accessryInfo.viewPhone,bankInfo_result.bankReservePhone)}>
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,bankInfo_result.bankReservePhone)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oName" data-edit-type="input">
                                    {commonJs.is_obj_exist(userInfo_result.name)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oBankName" data-edit-type="input">
                                    {commonJs.is_obj_exist(bankInfo_result.bankName)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oBankCardNumber" data-edit-type="input">
                                    {commonJs.is_obj_exist(bankInfo_result.bankCardNumber)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oNationalId" data-edit-type="input" data-cake={commonJs.is_obj_exist(userInfo_result.nationalId)}>
                                    {commonJs.is_obj_exist(newNationalId)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oBankReservePhone" data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,bankInfo_result.bankReservePhone)}
                                </b>
                            </li>
                        </ul>
                        <div className={(this.userInfo2AStore.acountId && this.userInfo2AStore.isModify)?"clearfix":"hidden clearfix"}>
                            <button className="btn-white left mt10 mb10 block ml20 edit" id='bankInfoEdit' onClick={userMsgControler.Edit.bind(this,"/node/UserMsg_edit_contactMsg")}>修改</button>
                            <button className="btn-white left mt10 mb10 block ml20 hidden cancle_edit" id='bankInfoEditCancle' onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                            <button className={this.userInfo2AStore.isShowSendMsgBtn ? "btn-white left mt10 mb10 block ml20": "btn-white left mt10 mb10 block ml20 hidden"} id='sendMsg' onClick={this.sendMsg.bind(this)}>发送短信</button>
                        </div>
                    </div>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        联系人信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <h3 className="info-label inline-block contactOther">家庭联系人</h3>
                        <ul className="info-ul home-contact-msg">
                            <li>
                                <p className="msg-tit">姓名</p>
                                <b className={this.isSame(contactInfo_result.directReferenceName,"name")?"msg-cont elli red":"msg-cont elli"} title={commonJs.is_obj_exist(contactInfo_result.directReferenceName)} data-paramname="directReferenceName" data-edit-type="input">
                                    {commonJs.is_obj_exist(contactInfo_result.directReferenceName)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">手机/固话1</p>
                                <b data-cake={commonJs.is_obj_exist(contactInfo_result.directReferencePhone)} className={this.isSame(contactInfo_result.directReferencePhone,"phone")?"msg-cont elli red":"msg-cont elli"} data-verify="phone" title={commonJs.phoneReplace(accessryInfo.viewPhone,contactInfo_result.directReferencePhone)} data-paramname="directReferencePhone" data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,contactInfo_result.directReferencePhone)}
                                </b>
                                {
                                    contactInfo_result.directReferencePhone&&contactInfo_result.directReferencePhone.length>0?<a className="phont-btn-user block left ml3 mr3" onClick={this.callPhone.bind(this,contactInfo_result.directReferencePhone)}></a>:""
                                }
                                <span className="online-time gray-tip-font left" title={commonJs.is_obj_exist(contactInfo_result.directReferencePhoneOnlineTime)}>
                                    {commonJs.is_obj_exist(contactInfo_result.directReferencePhoneOnlineTime)}
                                </span>
                            </li>
                            <li>
                                <p className="msg-tit">关系</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(contactInfo_result.directReferenceRelation)} data-paramname="directReferenceRelation" data-edit-type="select">
                                    {commonJs.is_obj_exist(contactInfo_result.directReferenceRelation)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="directReferenceRelation" hidden="hidden" />
                            </li>
                            <li className="ADDRESS">
                                <p className="msg-tit">家庭联系人地址</p>
                                <b className="msg-cont elli" data-paramname="direct_area" data-edit-type="address" title={commonJs.is_obj_exist(contactInfo_result.direct_area)}>
                                    {commonJs.is_obj_exist(contactInfo_result.direct_area)}
                                </b>
                                <div className="address-div pl20 hidden relative">
                                    <Address _defaultAddr_val={contactInfo_result.direct_area} id='directArea' />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(contactInfo_result.direct_area)} className="getAddress editInput" data-inp-paramName="directReferenceAddress" data-paramname="directReferenceAddress" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(contactInfo_result.directReferenceProvinceId)} className="ProvinceId editInput" data-inp-paramName="directReferenceProvinceId" data-paramname="directReferenceProvinceId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(contactInfo_result.directReferenceCityId)} className="CityId editInput" data-inp-paramName="directReferenceCityId" data-paramname="directReferenceCityId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(contactInfo_result.directReferenceDistrictId)} className="DistrictId editInput" data-inp-paramName="directReferenceDistrictId" data-paramname="directReferenceDistrictId" hidden="hidden" />
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">详细地址</p>
                                <b className={this.isSame(contactInfo_result.directReferenceAddress,"addr")?"msg-cont elli red":"msg-cont elli"} data-paramname="directReferenceAddress" data-edit-type="input" title={commonJs.is_obj_exist(contactInfo_result.directReferenceAddress)}>
                                    {commonJs.is_obj_exist(contactInfo_result.directReferenceAddress)}
                                </b>
                            </li>
                        </ul>
                        <h3 className="info-label inline-block contactOther referenceEditClass">
                            <label data-otherReferenceType="OTHER" className="hidden" id='OTHERLable'>
                                <i className="left myRadio myRadio-normal mt3 hidden"></i>
                                其他联系人
                            </label>
                            <label data-otherReferenceType="UNDIRECT" className="hidden" id='UNDIRECTLable'>
                                <i className="left myRadio myRadio-normal mt3 hidden"></i>
                                旁系联系人
                            </label>
                        </h3>
                        <ul className="info-ul other-contact-msg">
                            <li className="cantact-name">
                                <p className="msg-tit">姓名</p>
                                <b className={this.isSame((contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferenceName:contactInfo_result.undirectReferenceName),"name")?"msg-cont elli red":"msg-cont elli"} data-paramname={contactInfo_result.otherReferenceType=="OTHER"?"otherReferenceName":"undirectReferenceName" } data-edit-type="input" title={commonJs.is_obj_exist(contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferenceName:contactInfo_result.undirectReferenceName )}>
                                    {commonJs.is_obj_exist(contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferenceName:contactInfo_result.undirectReferenceName )}
                                </b>
                            </li>
                            <li className="cantact-phone">
                                <p className="msg-tit">手机/固话2</p>
                                <b data-cake={commonJs.is_obj_exist(contactInfoOtherPhone)} className={this.isSame(contactInfoOtherPhone,"phone")?"msg-cont elli red":"msg-cont elli"} data-verify="phone" data-paramname={contactInfo_result.otherReferenceType=="OTHER"?"otherReferencePhone":"undirectReferencePhone" } data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,contactInfoOtherPhone)}
                                </b>
                                {
                                    contactInfoOtherPhone&&contactInfoOtherPhone.length>0?
                                        <a className="phont-btn-user block left ml3 mr3" onClick={this.callPhone.bind(this,contactInfoOtherPhone)}></a>
                                        :""
                                }
                                <span className="online-time gray-tip-font left">{commonJs.is_obj_exist(contactInfo_result.otherReferencePhoneOnlineTime)}</span>
                            </li>
                            <li className="cantact-relation">
                                <p className="msg-tit">关系</p>
                                <b className="msg-cont" data-paramname={contactInfo_result.otherReferenceType=="OTHER"?"otherReferenceRelation":"undirectReferenceRelation" } data-edit-type="select" title={commonJs.is_obj_exist(contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferenceRelation:contactInfo_result.undirectReferenceRelation )}>
                                    {commonJs.is_obj_exist(contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferenceRelation:contactInfo_result.undirectReferenceRelation )}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName={contactInfo_result.otherReferenceType=="OTHER"?"otherReferenceRelation":"undirectReferenceRelation" } hidden="hidden" />
                            </li>
                        </ul>
                        <h3 className="info-label inline-block contactOther">其他联系人2</h3>
                        <ul className="info-ul other-contact-msg">
                            <li>
                                <p className="msg-tit">姓名</p>
                                <b className={this.isSame(contactInfo_result.otherReferenceName2,"name")?"msg-cont elli red":"msg-cont elli"} data-paramname="otherReferenceName2" data-edit-type="input" title={commonJs.is_obj_exist(contactInfo_result.otherReferenceName2)}>
                                    {commonJs.is_obj_exist(contactInfo_result.otherReferenceName2)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">手机/固话1</p>
                                <b data-cake={commonJs.is_obj_exist(contactInfo_result.otherReferencePhone2)} className={this.isSame(contactInfo_result.otherReferencePhone2,"phone")?"msg-cont elli red":"msg-cont elli"} data-verify="phone" title={commonJs.phoneReplace(accessryInfo.viewPhone,contactInfo_result.otherReferencePhone2)} data-paramname="otherReferencePhone2" data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,contactInfo_result.otherReferencePhone2)}
                                </b>
                                {
                                    contactInfo_result.otherReferencePhone2&&contactInfo_result.otherReferencePhone2.length>0?
                                        <a className="phont-btn-user block left ml3 mr3" onClick={this.callPhone.bind(this,contactInfo_result.otherReferencePhone2)}></a>
                                        :""
                                }
                                <span className="online-time gray-tip-font left">{commonJs.is_obj_exist(contactInfo_result.otherReferencePhone2OnlineTime)}</span>
                            </li>
                            <li>
                                <p className="msg-tit">关系</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(contactInfo_result.otherReferenceRelation2)} data-paramname="otherReferenceRelation2" data-edit-type="select">
                                    {commonJs.is_obj_exist(contactInfo_result.otherReferenceRelation2)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="otherReferenceRelation2" hidden="hidden" />
                            </li>
                        </ul>
                        <div className={(this.userInfo2AStore.acountId && this.userInfo2AStore.isModify)?"clearfix":"hidden clearfix"}>
                            <button className="btn-white left mt10 mb10 block ml20 edit contactMsg-edit" id='contactEdit' onClick={userMsgControler.Edit.bind(this,"/node/UserMsg_edit_contactMsg")}>修改</button>
                            <button className="btn-white left mt10 mb10 block ml20 hidden cancle_edit" id='contactEditCancle' onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                        </div>
                    </div>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        选填信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <h3 className="info-label inline-block">学历</h3>
                        <ul className="info-ul certificate-msg">
                            <li>
                                <p className="msg-tit" data-required="true">最高学历</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.highestEducation)} data-paramname="highestEducation" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.highestEducation)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="highestEducation" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">毕业学校</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.graduationSchool)} data-paramname="graduationSchool" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.graduationSchool)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">毕业年份</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.graduationYear)} data-paramname="graduationYear" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.graduationYear)}
                                </b>
                            </li>
                        </ul>
                        <h3 className="info-label inline-block">其他</h3>
                        <ul className="info-ul certificate-msg2">
                            <li>
                                <p className="msg-tit">婚否</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.maritalStatus)} data-paramname="maritalStatus" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.maritalStatus)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="maritalStatus" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">子女情况</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.haveChild)} data-paramname="haveChild" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.haveChild)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="haveChild" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit" data-required="true">现住所居住时间</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.liveTime)} data-paramname="liveTime" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.liveTime)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="liveTime" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">是否有车</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.haveCar)} data-paramname="haveCar" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.haveCar)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="haveCar" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">是否有房</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.haveHouse)} data-paramname="haveHouse" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.haveHouse)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="haveHouse" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">QQ号码</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.qq)} data-paramname="qq" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.qq)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">微信号码</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.weixin)} data-paramname="weixin" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.weixin)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">推荐人手机号</p>
                                <b data-cake={commonJs.is_obj_exist(otherInfo_result.recommended_phone)} className="msg-cont" data-verify="onlyMobile" title={commonJs.phoneReplace(accessryInfo.viewPhone,otherInfo_result.recommended_phone)} data-paramname="recommended_phone" data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,otherInfo_result.recommended_phone)}
                                </b>
                                {
                                    otherInfo_result.recommended_phone&&otherInfo_result.recommended_phone.length>0?
                                        <a className="phont-btn-user mr20 block left ml3 mr3" onClick={this.callPhone.bind(this,otherInfo_result.recommended_phone)}></a>
                                        :""
                                }
                            </li>
                            <li>
                                <p className="msg-tit">预期贷款金额</p>
                                <b className="msg-cont2" title={commonJs.is_obj_exist(otherInfo_result.requestAmount)} data-paramname="requestAmount" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.requestAmount)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">电核更多收入</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.isMoreIncome)} data-paramname="isMoreIncome" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.isMoreIncome)}
                                </b>
                            </li>
                        </ul>
                        <div className={(this.userInfo2AStore.acountId && this.userInfo2AStore.isModify)?"clearfix":"hidden clearfix"}>
                            <button className="btn-white left mt10 mb10 block ml20 edit" id='certificateEdit' onClick={userMsgControler.Edit.bind(this,"/node/UserMsg_edit_contactMsg")}>修改</button>
                            <button className="btn-white left mt10 mb10 block ml20 hidden cancle_edit" id='certificateEditCancle' onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                        </div>
                    </div>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        工作信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <ul className="info-ul work-msg">
                            <li>
                                <p className="msg-tit">收入来源</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.incomeSource)} data-paramname="incomeSource" data-edit-type="select">
                                    {commonJs.is_obj_exist(workInfo_result.incomeSource)}
                                </b>
                                <input type="text" className="getSelectedVal editInput hidden" data-inp-paramname="incomeSource" />
                            </li>
                            <li>
                                <p className="msg-tit">工作单位</p>
                                <b className="msg-cont" data-paramname="company" data-edit-type="input" title={commonJs.is_obj_exist(workInfo_result.company)}>
                                    {commonJs.is_obj_exist(workInfo_result.company)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit radio-div workPhoneMsg" data-inp-paramName="companyPhoneType">
                                    <label data-companyPhoneType="MOBILE" className={workInfo_result.companyPhoneType=="MOBILE"?"left cpyRadio":"left cpyRadio hidden"}>
                                        <i className="left myRadio myRadio-normal mt3 hidden" data-name="MOBILE"></i>
                                        单位手机
                                    </label>
                                    <label data-companyPhoneType="FIXED" className={workInfo_result.companyPhoneType=="FIXED"?"left cpyRadio":"left cpyRadio hidden"}>
                                        <i className="left myRadio mt3 myRadio-normal hidden" data-name="FIXED"></i>
                                        单位座机
                                    </label>
                                </p>
                                <div className="clear"></div>
                                <b className={this.isSame(workInfo_result.tellPhoneNo,"phone")?"msg-cont red":"msg-cont"} title={commonJs.phoneReplace(accessryInfo.viewPhone,workInfo_result.tellPhoneNo)} data-paramname="companyPhone" data-edit-type="radio">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,workInfo_result.tellPhoneNo)}
                                </b>
                                {
                                    workInfo_result.tellPhoneNo&&workInfo_result.tellPhoneNo.length>0?
                                        <a className="phont-btn-user mr20 block left ml3 mr3" onClick={this.callPhone.bind(this,workInfo_result.tellPhoneNo)}></a>
                                        :""
                                }
                                <span className="gray-tip-font left">
                                    {commonJs.is_obj_exist(workInfo_result.companyPhoneOnlineTime )}
                                </span>
                                <div className="cpyTellPhone hidden">
                                    <div className="MOBILE-edit-div pl20 hidden">
                                        <input type="text" className="input MOBILE-edit-inp"  onKeyUp={this.myaer.bind(this)} />
                                    </div>
                                    <div className="FIXED-edit-div pl20 hidden">
                                        <input type="text" className="left input area-No" />
                                        <span className="left middle-line"> - </span>
                                        <input type="text" className="left input phone-No" />
                                        <span className="left middle-line"> - </span>
                                        <input type="text" className="left input brach-No" />
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">月现金收入</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.incomeCash)} data-paramname="incomeCash" data-edit-type="input">
                                    {commonJs.is_obj_exist(workInfo_result.incomeCash)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">月银行工资卡收入</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.incomeDdi)} data-paramname="incomeDdi" data-edit-type="input">
                                    {commonJs.is_obj_exist(workInfo_result.incomeDdi)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">工资发放日期</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.paydate)} data-paramname="paydate" data-edit-type="input">
                                    {commonJs.is_obj_exist(workInfo_result.paydate)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">现单位工作时间</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.workTime)} data-paramname="workTime" data-edit-type="select">
                                    {commonJs.is_obj_exist(workInfo_result.workTime)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramname="workTime" hidden="hidden" />
                            </li>
                            <li className="ADDRESS">
                                <p className="msg-tit">单位地址</p>
                                <b className="msg-cont elli" data-paramname="company_area" data-edit-type="address" title={commonJs.is_obj_exist(workInfo_result.company_area)}>
                                    {commonJs.is_obj_exist(workInfo_result.company_area)}
                                </b>
                                <div className="address-div pl20 hidden relative">
                                    <Address _defaultAddr_val={workInfo_result.company_area} id='companyArea' />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(workInfo_result.company_area)} className="getAddress editInput" data-inp-paramName="companyAddress" data-paramname="companyAddress" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(workInfo_result.companyProvinceId)} className="ProvinceId editInput" data-inp-paramName="companyProvinceId" data-paramname="companyProvinceId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(workInfo_result.companyCityId)} className="CityId editInput" data-inp-paramName="companyCityId" data-paramname="companyCityId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(workInfo_result.companyDistrictId)} className="DistrictId editInput" data-inp-paramName="companyDistrictId" data-paramname="companyDistrictId" hidden="hidden" />
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">详细地址</p>
                                <b className={this.isSame(workInfo_result.companyAddress,"addr")?"msg-cont red":"msg-cont"} data-paramname="companyAddress" data-edit-type="input" title={commonJs.is_obj_exist(workInfo_result.companyAddress)}>
                                    {commonJs.is_obj_exist(workInfo_result.companyAddress)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">单位所属行业</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.companyIndustryE)} data-paramname="companyIndustryE" data-edit-type="select">
                                    {commonJs.is_obj_exist(workInfo_result.companyIndustryE)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="companyIndustry" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">职业</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.workTypeE)} data-paramname="workTypeE" data-edit-type="select">
                                    {commonJs.is_obj_exist(workInfo_result.workTypeE)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="workType" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">公司职位</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.position)} data-paramname="position" data-edit-type="input">
                                    {commonJs.is_obj_exist(workInfo_result.position)}
                                </b>
                            </li>
                        </ul>
                        <div className={(this.userInfo2AStore.acountId && this.userInfo2AStore.isModify)?"clearfix":"hidden clearfix"}>
                            <button className="btn-white left mt10 mb10 block ml20 edit" id='compEdit' onClick={userMsgControler.Edit.bind(this,"/node/UserMsg_edit_contactMsg")}>修改</button>
                            <button className="btn-white left mt10 mb10 block ml20 hidden cancle_edit" id='compEditCancle' onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                        </div>
                    </div>
                </div>
                {
                    this.userInfo2AStore.isModify ? 
                    <div className={this.userInfo2AStore.acountId?"toggle-box mt10":"hidden toggle-box mt10"}>
                        <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                            设置密码
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <div className="bar mt5 hidden">
                            <ul className="info-ul parssword-msg">
                                <li>
                                    <p className="msg-tit">新的密码</p>
                                    <b className="msg-cont"><input type="password" className="input userPassword" /></b>
                                </li>
                                <li>
                                    <p className="msg-tit">确认密码</p>
                                    <b className="msg-cont"><input type="password" className="input userPassword_sure" /></b>
                                </li>
                            </ul>
                            <div className="clearfix">
                                <button className="btn-blue mr10 mt10 mb10 block ml20 left" id='passwordSave' onClick={this.EditUserPwd.bind(this)}>保存</button>
                                <button className="btn-white mt10 mb10 block left" id='passwordSaveCancle' onClick={this.cancelUserPwd.bind(this)}>取消</button>
                            </div>
                        </div>
                    </div>:''
                }
                {/*发送短信弹窗*/}
                <div className="sendMsg-prop hidden">
                    <div className="tanc_bg"></div>
                    <div className="msg-div">
                        <i className="close" onClick={this.closeSendMsg.bind(this)}></i>
                        <textarea className="msg-content" name="" id="sendMsgCont" cols="30" rows="10"></textarea>
                        <button className="btn-blue mt20 block send-btn" id='sureSendMsg' onClick={this.sendTo_fn.bind(this)}>发送</button>
                    </div>
                </div>
            </div>
    );
    }
};


export default UserMsg;