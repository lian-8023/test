// collection
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { DatePicker } from 'antd';
import ChangeLabel2A from '../../source/common/changeLabel2A';
let changeLabel2A=new ChangeLabel2A;
import ChangeLabelCP from '../../source/common/changeLabelCP';
let changeLabelCP=new ChangeLabelCP;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import InAcount from '../cp-module/InAccount';
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class Collection extends React.Component {
    constructor(props){  //类（构造函数）的原型对象prototype，constuctor用作接收参数，返回实例对象this。
        super(props);
        this.userInfoCP=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息 
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2a portal accountid白色信息条bar展示
        this.phoneMsgStore=this.props.allStore.PhoneMsgStore;  //2A PORTAL电话详情页面store 
        this.topBindNumberStore=this.props.allStore.TopBindNumberStore;  //顶部绑定（完成）数显示-通用 2A portal
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            coltnData:{},
            reasonSubs:[],
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        var _oper_type = nextProps._oper_type_props;  //collection操作：search || next
        if(_oper_type=="search"){
            this.setState({
                coltnData: {},
                },()=>{
                    this.resetInAcount();
                });
        }else if(_oper_type=="next"){
            this.setState({
                coltnData: {},
            })
            if(nextProps._coltn_Q_ajax) {
                this.setState({
                    coltnData: nextProps._coltn_Q_ajax,  //获取collectionIndex中下一条方法请求到的数据
                });
            }
            this.resetInAcount();
        }
        $(".newamount-inp").val('');
        $('.chargeMount').val('');
    }
    componentDidMount(){
        this.setState({
            coltnData: this.props._coltn_Q_ajax,  //获取collectionIndex中下一条方法请求到的数据
        });
        $(".topBundleCounts").removeClass("hidden");
        var h = document.documentElement.clientHeight;

        let params_rigPage=this.props._params_rigPage;
        if(params_rigPage!="LP"){
            $(".LP-edit-div").addClass("hidden");
        }else {
            $(".LP-edit-div").removeClass("hidden");
        }
        let productNo=this.labelBoxStore.rowData.productNo;
        if(productNo=="2A"){
            $(".Csearch-right-page li").removeClass("on");
            $(".Csearch-right-page li:contains('Collection')").addClass("on");
            $(".CPS-edit-div,.OCR-edit-div,.LP-edit-div,.AP-edit-div,.FR-edit-div").addClass("hidden");
        }
    }
    /**
     * 获取页面数据
     * @param {*服务端需要的搜索类型} operType 
     * @param {*是否需要弹窗提示绑定} shouldAlert 
     */
    getMsg(operType,shouldAlert,toBind){
        var _accountId=this.userInfo2AStore.acountId;
        var _loanNumber=this.acountBarStore.currentLoanNumber;
        this.pub_getMsg(_accountId,_loanNumber,operType,shouldAlert,toBind);
    }
    //获取页面数据
    @action pub_getMsg(_accountId,_loanNumber,operType,shouldAlert,toBind){
        let _that=this;
        commonJs.cancelSaveQ(); //初始化queue操作框
        if( (typeof(_accountId)=="undefined" || _accountId=="") || (typeof(_loanNumber)=="undefined"|| _loanNumber=="")){
            return;
        }
        $.ajax({
            type: "post",
            url: "/RemColt/collectionNext",
            async: false,
            dataType: "JSON",
            data: {
                loanNumber: _loanNumber,
                toBind:toBind?toBind:""
            },
            success: function (res) {
                runInAction(() => {
                    if (!commonJs.ajaxGetCode(res)) {
                        _that.setState({
                            coltnData:_getData,
                        });
                        _that.commonStore.loanNumberList_array=[];
                        return;
                    }
                    var _getData = res.data;
                    if(_getData.status && shouldAlert){
                        alert(_getData.statusMessage);
                    }
                    _that.setState({
                        coltnData:_getData,
                    })
                    let loanNumberList_array=commonJs.is_obj_exist(_getData.loanNumber).split(',');
                    _that.commonStore.loanNumberList_array=loanNumberList_array;
                })
            }
        })
    }
    //用户打标
    marking =()=>{
        var _that=this;
        let $this=$(event.target);
        const loanNumber = this.acountBarStore.currentLoanNumber;
        let obj ={loanNumber:loanNumber};
        $.ajax({
            type:"post",
            url:"/node/collection/flag",
            async:false,
            dataType: "JSON",
            data:obj,
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                _that.getMsg("RELOAD",false,true);

                if(_that.props.updataList_fn){
                    _that.props.updataList_fn(false,true,true);
                }
                commonJs.cancelSaveQ();
            }
        })

    }
    // queue保存操作
    savecoltnQueueHandler(event){
        var _that=this;
        let $this=$(event.target);
        let _parent=$this.closest(".QrecordInfo");
        let _data={};
        let loanNumberList_array=this.commonStore.loanNumberList_array;
        if(loanNumberList_array.length<=0){
            alert('未获取到合同号!');
            return;
        }
        _data.loanNumber=loanNumberList_array.toString();
        let contactInfo=this.userInfo2AStore.contactInfo;  //来自个人详情的联系人信息
        let _contactPersonId=_parent.find(".communicateObjectList option:selected").attr("data-name");  //联系对象
        if(!_contactPersonId){
            alert("请选择沟通对象!");
            return;
        }
        if(_contactPersonId=="ONESELF_FIRST"){  //本人第二号码
            _data.secondTelNo=true;
            _data.customerId=this.userInfo2AStore.customerId;
            if(contactInfo.thirdTelNo && contactInfo.thirdTelNo!="-"){
                _data.phoneNo=contactInfo.thirdTelNo
            }
        }
        if(_contactPersonId=="ONESELF_SECOND"){  //本人第三号码
            _data.thirdTelNo=true;
            _data.customerId=this.userInfo2AStore.customerId;
            if(contactInfo.secondTelNo && contactInfo.secondTelNo!="-"){
                _data.phoneNo=contactInfo.secondTelNo
            }
        }
        _data.contactPersonId=_contactPersonId;
        let _communicateName=_parent.find(".communicateName").val();  //沟通姓名
        if(!_communicateName){
            alert("沟通姓名为必填项！");
            return;
        }
        _data.contactName=_communicateName;
        let _processingState=_parent.find(".contactResultsInfo option:selected").attr("data-value");  //案列状态
        if(!_processingState){
            alert("案列状态为必填项！");
            return;
        }
        _data.processingState=_processingState;
        
        let _telNo=_parent.find(".telNo").val();  //通话号码
        if(!_telNo){
            alert("通话号码为必填项！");
            return;
        }
        if(isNaN(_telNo)){
            alert("通话号码必须为纯数字!");
            return;
        }
        _data.telNo=_telNo;
        let caseStatus=0;  //是否留案
        if($(".coll-edit-div .caseStatus").hasClass("myCheckbox-visited")){
            caseStatus=1;
        }
        _data.caseStatus=caseStatus;

        let _caseContent=_parent.find(".CollQdetail").val();
        if(_caseContent!=""){
            _data.caseContent=_caseContent;  //内容
        }
        let _scheduledTime=_parent.find(".contactResultsInfo").attr("data-time");  //跟进时间--当处理状态选择 跟进时 获取时间
        if(_scheduledTime!="" && (_processingState=="B_FOLLOW_UP" || _processingState=="C_FOLLOW_UP" || _processingState=="D_FOLLOW_UP" || _processingState=="APPLY_EXTENSION" || _processingState=="OUTSOURCING")){
            _data.planTime=_scheduledTime  //	跟进时间--当处理状态选择 跟进时 获取时间 ps：用户没选则不传字段
        }
        let _promiseRepaymentTime=_parent.find(".COMMITMENT_REPAY_TIME").attr("data-time");  //承诺还款时间--当处理状态选择 承诺还款 获取时间
        if((!_promiseRepaymentTime || _promiseRepaymentTime=="") && _processingState=="COMMITMENT_REPAY"){
            alert("请选择承诺还款时间！");
            return;
        }
        if(_promiseRepaymentTime!="" && _processingState=="COMMITMENT_REPAY"){
            _data.commitmentTime=_promiseRepaymentTime  //ps：用户没选则不传字段
        }
        let action=$('.coll-edit-div .action option:selected').attr('data-value');
        let actionResult=$('.coll-edit-div .actionResult option:selected').attr('data-value');
        if(!action){
            alert('请选择催收行为！');
            return;
        }
        _data.action=action;
        if(!actionResult){
            alert('请选择催收结果！');
            return;
        }
        _data.actionResult=actionResult;

        let repaymentMethod=$('.coll-edit-div .repaymentMethodList option:selected').attr('data-value');
        if(!repaymentMethod){
            alert('请选择还款方式！');
            return;
        }
        _data.repaymentMethod=repaymentMethod;
        $.ajax({
            type:"post",
            url:"/RemColt/saveCollQueue",
            async:true,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                _that.getMsg("RELOAD",false,true);

                if(_that.props.updataList_fn){
                    _that.props.updataList_fn(false,true,true);
                }
                commonJs.cancelSaveQ();
                //保存本人第二号码和本人第三号码需要更新个人信息板块数据
                if(_contactPersonId=="ONESELF_FIRST" || _contactPersonId=="ONESELF_SECOND"){  
                    changeLabel2A.changeLeft2A(parseInt(0),_that);
                }
            }
        })
    }
    //获取跟进时间
    selectTime(value, dateString) {
        $(".contactResultsInfo").attr("data-time",dateString);
        $(".coll-edit-div .CollQdetail").val("需跟进时间"+dateString);
    }
    //承诺还款时间
    selectTime_crt(value, dateString) {
        $(".COMMITMENT_REPAY_TIME").attr("data-time",dateString);
        $(".coll-edit-div .CollQdetail").val("承诺"+dateString+"通过XX方式还款XX金额");
    }
    //切换案列状态
    getDetailText(event){
        let $this=$(event.target);
        let crrentVal=$this.find("option:selected").attr("data-value");
        let crrentText=$this.find("option:selected").text();
        $(".followUpTime,.COMMITMENT_REPAY_TIME").addClass("hidden");
        $('.actionResult').find("option").removeProp("selected");
        $(".coll-edit-div .CollQdetail").val('');
        // 获取对应详情内容
        if(crrentVal=="COMMITMENT_REPAY"){  //承诺还款
            $('.actionResult').find("[data-value='承诺还款']").prop("selected","selected");
            $(".followUpTime").addClass("hidden");
            $(".COMMITMENT_REPAY_TIME").removeClass("hidden");
            $(".COMMITMENT_REPAY_TIME .ant-calendar-picker").css("width","115px")
        }else if(crrentVal=="BOUNCED_CHECK"){  //跳票
            
            $('.actionResult').find("[data-value='跳票']").prop("selected","selected");
        }else if(crrentVal=="NO_ANSWER" || crrentVal=="NO_ANSWER_E5"){  //未接
            $('.actionResult').find("[data-value='未接']").prop("selected","selected");
        }else if(crrentVal=="B_FOLLOW_UP" || crrentVal=="C_FOLLOW_UP" || crrentVal=="D_FOLLOW_UP" || crrentVal=="APPLY_EXTENSION" || crrentVal=="OUTSOURCING"){  //需跟进
            $('.actionResult').find("[data-value='需跟进']").prop("selected","selected");
            $(".followUpTime").removeClass("hidden");
            $(".COMMITMENT_REPAY_TIME").addClass("hidden");
        }else if(crrentVal=="OUTSOURCING"){  //申请委外
            $('.actionResult').find("[data-value='其它']").prop("selected","selected");
        }else if(crrentVal=="SHUTDOWN"){  //关机
            $('.actionResult').find("[data-value='关机']").prop("selected","selected");
        }else if(crrentVal=="INVALID_PHONE_EMPTY" || crrentVal=="INVALID_PHONE_STOP"){  //停机
            $('.actionResult').find("[data-value='停机']").prop("selected","selected");
        }else if(crrentVal=="APPLY_EXTENSION"){  //申请延期
            $('.actionResult').find("[data-value='其它']").prop("selected","selected");
        }else if(crrentVal=="APPLY_STAY_CASE"){  //空号
            $('.actionResult').find("[data-value='其它']").prop("selected","selected");
        }else if(crrentVal=="OTHER_H1" || crrentVal=="OTHER_H2" || crrentVal=="OTHER_H3" || crrentVal=="OTHER_H4" || crrentVal=="OTHER_H5"){  //其他
            $('.actionResult').find("[data-value='其它']").prop("selected","selected");
        }
        $(".coll-edit-div .CollQdetail").val(crrentText);
    }
    //沟通对象切换
    communicateObjectFn(event){
        let $this=$(event.target);
        let $parent=$this.closest(".coll-edit-div");
        let _selected=$this.find("option:selected").attr("data-name");
        let platformFlag=this.labelBoxStore.rowData.platformFlag;
        let contactInfoBack={};
        if(platformFlag=='PN'){
            contactInfoBack=this.userInfo2AStore.contactInfoBack;  //来自个人详情的联系人信息
        }else if(platformFlag=='PF'){
            contactInfoBack=this.userInfoCP.contactInfoBackPF;
        }else if(platformFlag=='TH'){
            contactInfoBack=this.userInfoCP.contactInfoBackTH;
        }else if(platformFlag=='SUPPLY'){
            contactInfoBack=this.userInfoCP.contactInfoBackSUPPLY;
        }else if(platformFlag=='AG'){
            contactInfoBack=this.userInfoCP.contactInfoBackAG;
        }
        $('.action').find("option").removeProp("selected");
        switch(_selected)
        {
            case "ONESELF":  //本人注册
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.userName));
                $(".QrecordInfo .telNo").val(commonJs.is_obj_exist(contactInfoBack.primaryPhone));
                $('.action').find("[data-value='电话本人']").prop("selected","selected");
                break;
            case "ONESELF_FIRST": //本人第二号码
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.userName));
                $(".QrecordInfo .telNo").val(commonJs.is_obj_exist(contactInfoBack.secondTelNo));
                $('.action').find("[data-value='电话本人']").prop("selected","selected");
                break;
            case "ONESELF_SECOND": //本人第三号码
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.userName));
                $(".QrecordInfo .telNo").val(commonJs.is_obj_exist(contactInfoBack.thirdTelNo));
                $('.action').find("[data-value='电话本人']").prop("selected","selected");
                break;
            case "COMPANY": //公司电话
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.company));
                $(".QrecordInfo .telNo").val(commonJs.is_obj_exist(contactInfoBack.companyPhone));
                $('.action').find("[data-value='电话其他人']").prop("selected","selected");
                break;
            case "FIRST_CONTACT": //第一联系人
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.directReferenceName));
                $(".QrecordInfo .telNo").val(commonJs.is_obj_exist(contactInfoBack.directReferencePhone));
                $('.action').find("[data-value='电话联系人']").prop("selected","selected");
                break;
            case "SECOND_CONTACT": //第二联系人
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.twoName));
                $(".QrecordInfo .telNo").val(commonJs.is_obj_exist(contactInfoBack.twoPhone));
                $('.action').find("[data-value='电话联系人']").prop("selected","selected");
                break;
            case "THIRD_CONTACT": //第三联系人
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.otherReferenceName2));
                $(".QrecordInfo .telNo").val(commonJs.is_obj_exist(contactInfoBack.otherReferencePhone2));
                $('.action').find("[data-value='电话联系人']").prop("selected","selected");
                break;
            case "MAIL_LIST": //通讯录
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(this.phoneMsgStore.phonecallListInfoDTOS_action.contact_name));
                $(".QrecordInfo .telNo").val(commonJs.is_obj_exist(this.phoneMsgStore.phonecallListInfoDTOS_action.phone_num));
                $('.action').find("[data-value='电话其他人']").prop("selected","selected");
                break;
            case "OTHER": //其它
                $(".QrecordInfo .communicateName").val('');
                $(".QrecordInfo .telNo").val('');
                $('.action').find("[data-value='其它']").prop("selected","selected");
                break;
        }
    }
    changeLeftCP(index,right_index){
        var leftHtml = changeLabelCP.getLeftHtml(parseInt(index),this);
        this.labelBoxStore.lef_page=leftHtml;
        $(".Csearch-left-page li").removeClass("on");
        $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
    }
    //重置tab框数据
    resetInAcount(){
        this.setState({
            chargeTime:null,
            actualDueDate:null,
        })
        $('.processing-cont input').val('');
        $('.processing-cont').find("option").removeProp("selected");
        $('.processing-cont').find("option:eq(0)").prop("selected","selected");
    }

    //
    actionRecordCancle(){
        let _parent=$('.actionRecord');
        _parent.find("select option").removeProp("selected");
        _parent.find("select option[id='0']").prop("selected","selected");
    }
    render() {
        let _recordeQueueStatus;
        if(this.state.coltnData){
            // _periods=cpCommonJs.opinitionObj(this.state.coltnData).periods;
            _recordeQueueStatus=this.state.coltnData.recordeQueueStatus?this.state.coltnData.recordeQueueStatus:"";
        }
        let collectionOverdueDetailInfoDTOS=this.state.coltnData.collectionOverdueDetailInfoDTOS ? this.state.coltnData.collectionOverdueDetailInfoDTOS :[]  //逾期信息
        let collectionOverdueRecordsInfoDTOS=this.state.coltnData.collectionOverdueRecordsInfoDTOS ? this.state.coltnData.collectionOverdueRecordsInfoDTOS :[]  //操作记录
        let topBindNumberStore=this.topBindNumberStore.bindNumberData;
        let rowData=cpCommonJs.opinitionObj(this.labelBoxStore.rowData).productNo;
        let action=cpCommonJs.opinitionArray(topBindNumberStore.action);  //催收行为
        let actionResult=cpCommonJs.opinitionArray(topBindNumberStore.actionResult);  //催收结果
        let repaymentMethodList=cpCommonJs.opinitionArray(topBindNumberStore.repaymentMethodList);  //还款方式

        return (
            <div className="auto-box pr5">
                {
                    rowData=="2A"?"":<InAcount />
                }
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        逾期信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table">
                            <tbody>
                                <tr>
                                    <th width="20%">逾期期数</th>
                                    <th width="20%">逾期天数</th>
                                    <th width="20%">逾期本金</th>
                                    <th width="20%">逾期利息</th>
                                    <th width="20%">逾期总金额</th>
                                </tr>
                                {
                                    collectionOverdueDetailInfoDTOS.length>0 ? collectionOverdueDetailInfoDTOS.map((repy,i)=>{
                                        return <tr key={i}>
                                                    <td width="20%" className="yellow-font">{commonJs.is_obj_exist(repy.periods)}</td>
                                                    <td width="20%">{commonJs.is_obj_exist(repy.overdueDays)}天</td>
                                                    <td width="20%">¥{commonJs.is_obj_exist(repy.principal)}</td>
                                                    <td width="20%">¥{commonJs.is_obj_exist(repy.interest)}</td>
                                                    <td width="20%">¥{commonJs.is_obj_exist(repy.principal+repy.interest).toFixed(2)}</td>
                                                </tr>
                                    }): <tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* record 操作 */}
                <div className={((!_recordeQueueStatus && !_recordeQueueStatus.name) || _recordeQueueStatus.name=="COMPLETE")?"bar mt10 coll-edit-div pb10 QrecordInfo  bind_hidden hidden":"bar mt10 coll-edit-div pb10 QrecordInfo"}>
                    <dl>
                        <dt>沟通对象</dt>
                        <dd className="communicateObjectList">
                            <select name="" id='communicateObjectList' className="select-gray" onChange={this.communicateObjectFn.bind(this)}>
                                <option data-name="" id="0" hidden>请选择</option>
                                {
                                    (topBindNumberStore && topBindNumberStore.communicateObjectList && topBindNumberStore.communicateObjectList.length>0) ? topBindNumberStore.communicateObjectList.map((repy,i)=>{
                                        return <option key={i} data-name={repy.name} data-value={repy.value}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                    }):<option data-name=""> </option>
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl>
                        <dt>沟通姓名</dt>
                        <dd>
                            <input type="text" className="input communicateName" id='communicateName' placeholder="请输入"/>
                        </dd>
                    </dl>
                    <dl style={{width:'200px'}}>
                        <dt>案列状态</dt>
                        <dd className="contactResultsInfo">
                            <select name="" id="contactResultsInfo" className="select-gray commu-select left mr5" onChange={this.getDetailText.bind(this)}>
                                <option data-name="" id="0" hidden>请选择</option>
                                {
                                    (topBindNumberStore && topBindNumberStore.processStatusList && topBindNumberStore.processStatusList.length>0) ? topBindNumberStore.processStatusList.map((repy,i)=>{
                                        return <option key={i} data-name={repy.name} data-value={repy.value}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                    }):<option data-name=""> </option>
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl className="followUpTime hidden" style={{width:'200px'}}>
                        <dt>跟进时间</dt>
                        <dd id='followUpTime'>
                            <DatePicker format="YYYY-MM-DD HH:mm:ss" onChange={this.selectTime.bind(this)} disabledDate={disabledDate} showTime />
                        </dd>
                    </dl>
                    <dl className="COMMITMENT_REPAY_TIME hidden" style={{width:'200px'}}>
                        <dt>承诺还款时间</dt>
                        <dd id='commitmentRepayTime'>
                            <DatePicker format="YYYY-MM-DD HH:mm:ss" onChange={this.selectTime_crt.bind(this)} disabledDate={disabledDate} showTime />
                        </dd>
                    </dl>
                    <dl>
                        <dt>新号码记录</dt>
                        <dd>
                            <input type="text" id='telNo' className="input telNo" placeholder="请输入"/>
                        </dd>
                    </dl>
                    <dl>
                        <dt>是否留案</dt>
                        <dd>
                            <i className="myCheckbox caseStatus myCheckbox-normal mt5" id='caseStatus' onClick={commonJs.myCheckbox.bind(this)}></i>
                        </dd>
                    </dl>
                    <dl>
                        <dt>催收行为</dt>
                        <dd className="action">
                            <select name="action" className="select-gray commu-select" onChange={this.communicateObjectFn.bind(this)}>
                                <option data-name="" id="0" hidden>请选择</option>
                                {
                                    (action && action.length>0) ? action.map((repy,i)=>{
                                        return <option key={i} data-value={repy}>{commonJs.is_obj_exist(repy)}</option>
                                    }):<option > </option>
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl>
                        <dt>催收结果</dt>
                        <dd className="actionResult">
                            {/* <select name="" id="actionResult" className="select-gray commu-select left mr5" onChange={this.getDetailText.bind(this)}> */}
                            <select name="" id="actionResult" className="select-gray commu-select left mr5">
                                <option data-name="" id="0" hidden>请选择</option>
                                {
                                    (actionResult && actionResult.length>0) ? actionResult.map((repy,i)=>{
                                        return <option key={i} data-value={repy}>{commonJs.is_obj_exist(repy)}</option>
                                    }):<option > </option>
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl>
                        <dt>还款方式</dt>
                        <dd className="repaymentMethodList">
                            <select name="" id="repaymentMethodList" className="select-gray commu-select left mr5">
                                <option data-name="" id="0" hidden>请选择</option>
                                {
                                    (repaymentMethodList && repaymentMethodList.length>0) ? repaymentMethodList.map((repy,i)=>{
                                        return <option key={i} data-value={repy.value}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                    }):<option > </option>
                                }
                            </select>
                        </dd>
                    </dl>
                    <div className="clearfix"></div>
                    <dl className="through-dl ">
                        <dt>详情</dt>
                        <dd className="">
                            <textarea name="" id="" cols="30" rows="10" className="commu-area textarea CollQdetail" id='CollQdetail'></textarea>
                        </dd>
                    </dl>
                    <div>
                        <button className="left block ml10 edit btn-blue" id='savecoltnQueue' onClick={this.savecoltnQueueHandler.bind(this)}>保存</button>
                        <button className="btn-white left block ml20 cancle_edit" id='savecoltnQueueCancle' onClick={commonJs.cancelSaveQ.bind(this)}>取消</button>
                        <button className="btn-white left block ml20" id='marking' onClick={()=>{this.marking()}}>投诉用户打标</button>
                    </div>
                </div>
                
                <div className={(collectionOverdueRecordsInfoDTOS && collectionOverdueRecordsInfoDTOS.length>0)?"bar mt10 coll-edit-div":"bar mt10 coll-edit-div hidden"}>
                {
                    (collectionOverdueRecordsInfoDTOS && collectionOverdueRecordsInfoDTOS.length>0) ? collectionOverdueRecordsInfoDTOS.map((repy,i)=>{
                    let recordTime="";
                    if(repy.processingState){
                        if(repy.processingState=="承诺还款"){
                            recordTime=commonJs.is_obj_exist(repy.commitmentTime);
                        }else if(repy.processingState=="需跟进"){
                            recordTime=commonJs.is_obj_exist(repy.scheduledTime);
                        }else{
                            recordTime=""
                        }
                    }else{recordTime=""}
                    return <div key={i} className="border-bottom-3 pb5">
                            <dl className="border-bottom">
                                <dt>沟通对象</dt>
                                <dd className="">
                                    {commonJs.is_obj_exist(repy.contactPersonId)}
                                </dd>
                            </dl>
                            <dl>
                                <dt>沟通姓名</dt>
                                <dd className="">
                                    {commonJs.is_obj_exist(repy.contactName)}
                                </dd>
                            </dl>
                            <dl>
                                <dt>案列状态</dt>
                                <dd className="">
                                    <span className="left mt2 mr2">{commonJs.is_obj_exist(repy.processingState)} </span>
                                    <span className="showRecordTime" title={recordTime}>{recordTime}</span>
                                </dd>
                            </dl>
                            <dl>
                                <dt>通话号码</dt>
                                <dd className="">
                                    {commonJs.is_obj_exist(repy.telNo)} 
                                </dd>
                            </dl>
                            <dl>
                                <dt>是否留案</dt>
                                <dd className="">
                                    {commonJs.is_obj_exist(repy.caseStatus)==1?"是":"否"} 
                                </dd>
                            </dl>
                            {
                                i == 0&&<dl>
                                <dt>投诉停止催收用户</dt>
                                <dd className="">
                                    {commonJs.is_obj_exist(this.state.coltnData.complainFlag)?"是":"否"} 
                                </dd>
                            </dl>
                            }
                            <div className="clearfix ml10 mr10 record-detail-div">
                                <div className="record-detail left">
                                    <span className="left block pr10">详情</span>
                                    <div className="left detail elli">{commonJs.is_obj_exist(repy.caseContent)}</div>
                                </div>    
                                <div className="left toggle-record-detail on" onClick={commonJs.toggle_record_detail.bind(this)}><i></i></div>
                            </div>
                            <div className="clearfix ml10 border-top">
                                <span className="left pr10">{commonJs.is_obj_exist(repy.userName)}</span>
                                <div className="left">{commonJs.is_obj_exist(repy.updatedTime)}</div>
                            </div>
                        </div>
                    }): ""
                }
                </div>
            </div>
        )
    }
};
function range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
function disabledDate(current) {
    // can not select days before today and today
    return current && current.valueOf() < Date.now()-86400000;
}
export default Collection;