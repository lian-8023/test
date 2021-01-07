// Ast
import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import Communication_select from '../module/Communication_select';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;

import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class Reminder extends React.Component {
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore; 
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.topBindNumberStore=this.props.allStore.TopBindNumberStore;  //顶部绑定（完成）数显示-通用 2A portal
        this.state={
            RmdData:"",
            reasonSubs:[],
            _acount: this.props._acount,
            _loanNumber: this.props._loanNumber,
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        // this.topBindNumberStore.initCount("/node/remind/count",'get');
        this.getMsg();
    }

    componentDidMount(){
        this.getMsg();
        // this.topBindNumberStore.initCount("/node/remind/count",'get');
        $(".topBundleCounts").removeClass("hidden");
        var h = document.documentElement.clientHeight;

        let params_rigPage=this.props._params_rigPage;
        if(params_rigPage!="LP"){
            $(".LP-edit-div").addClass("hidden");
        }else {
            $(".LP-edit-div").removeClass("hidden");
        }

        $(".contactResultsInfo select").change(function(){
            if($(this).find("option:selected").attr("name")=="FOLLOW_UP"){
                $(".contactResultsInfo .commu-select").css("width","35%");
                $(".followUpTime").removeClass("hidden");
                return;
            }
            $(".followUpTime").addClass("hidden");
        });
    }
    //获取页面数据
    getMsg(){
        let _that=this;
        let _loanNumber=this.labelBoxStore.rowData.loanNumber;
        commonJs.cancelSaveQ(); //初始化queue操作框
        $.ajax({
            type: "get",
            url: "/node/remind/query/loanNumber",
            async: false,
            dataType: "JSON",
            data: {
                loanNumber: _loanNumber,
            },
            success: function (res) {
                commonJs.ajaxGetCode(res);
                var _getData = res.data;
                if (!_getData.executed) {
                    _that.setState({
                        RmdData:_getData
                    })
                    return;
                }
                if(_getData.status=="blind"){
                    alert("当前queue已被"+_getData.user+"绑定！");
                }

                _that.setState({
                    RmdData:_getData
                });
                _that.commonStore.remanderNextData=_getData;
            }
        })
    }

    // reminder queue保存操作
    saveRmdQueueHandler(event){
        var _that=this;
        let $this=$(event.target);
        let _parent=$this.closest("table");
        let _data={};
        let _afterQueueStatusId=_parent.find(".contactResultsInfo .commu-select option:selected").attr("value");//处理状态
        let remindContactResultId = _parent.find(".contactMethodReminderInfos .commu-select option:selected").attr("value");
        let paySelect = _parent.find(".paySelectEnums .commu-select option:selected").attr("value");
        
        if(!_afterQueueStatusId || typeof(_afterQueueStatusId)=="undefined"){
            alert("处理状态为必填项！");
            return;
        }
        if(!remindContactResultId || typeof(remindContactResultId)=="undefined"){
            alert("沟通方式为必填项！");
            return;
        }
        if(!paySelect || typeof(paySelect)=="undefined"){
            alert("承诺还款为必填项！");
            return;
        }
        _data.afterQueueStatusId=_afterQueueStatusId;
        _data.remindContactResultId=remindContactResultId;
        _data.paySelect=paySelect;
        let _beforeQueueStatusId=$(".queueStatu").attr("data-queueStatusId");
        _data.beforeQueueStatusId=_beforeQueueStatusId;
        let _caseContent=$(".RemdQdetail").val();
        if(_caseContent!=""){
            _data.content=_caseContent;
        }
        let _comunicateResultId=$(".contactMethods .commu-select option:selected").attr("id");
        if(_comunicateResultId!=""){
            _data.comunicateResultId=_comunicateResultId;
        }
        _data.loanNumber=this.labelBoxStore.rowData.loanNumber;
        _data.orderNumber=this.labelBoxStore.rowData.orderNumber;
        _data.productNo=this.labelBoxStore.rowData.productNo;
        _data.customerId = this.labelBoxStore.rowData.customerId;
        $.ajax({
            type:"post",
            url:"/node/remind/save",
            async:false,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                if(_that.props.updataList_fn){
                    _that.props.updataList_fn(false,true);
                }
                _that.getMsg();
            }
        })
    }

    //获取跟进时间
    selectTime(value, dateString) {
        $(".contactResultsInfo").attr("data-time",dateString);
    }
    //短信弹窗
    sendRemindSms_pop(){
        $(".sendMsg-pop").removeClass("hidden");
    }
    closepop(){
        $(".sendMsg-pop").addClass("hidden");
    }
    //发送短信
    sendRemindSms(){
        let bankCardNo=this.props._bankCardNo ? this.props._bankCardNo : "";
        $.ajax({
            type:"post",
            url:"/RemColt/sendRemindSms",
            async:true,
            dataType: "JSON",
            data:{
                primaryPhone:this.props._primaryPhone,
                name:this.props._name,
                payDate:this.props._payDate,
                installments:this.props._installments,
                amount:this.props._amount,
                bankNum:bankCardNo.substr(bankCardNo.length-4)
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                $(".sendMsg-pop").addClass("hidden");
                alert(_getData.message);
            }
        })
    }

    render() {
        let bankCardNo=this.props._bankCardNo?this.props._bankCardNo:"";
        let RmdData=cpCommonJs.opinitionObj(this.commonStore.remanderNextData);
        let redminderRecordInfoDTOS=cpCommonJs.opinitionArray(RmdData.redminderRecordInfoDTOS);
        let queueContactResultEnums=(RmdData && RmdData.queueContactResultEnums); //处理状态数据 组件需要数据 array
        let contactMethodReminderInfos = RmdData.contactMethodReminderInfos;
        let paySelectEnums = RmdData.paySelectEnums;
        let _queueStatusId,_queueStatus;
        if(RmdData && RmdData.reminderInfoDTO){
            _queueStatusId=RmdData.reminderInfoDTO.queueStatusId;
            _queueStatus=RmdData.reminderInfoDTO.queueStatus;
        }
        let reminderInfoDTO=RmdData.reminderInfoDTO?RmdData.reminderInfoDTO:{};
        return (
            <div className="auto-box pr5">
                <table className={(!_queueStatusId || _queueStatusId==4 )?"radius-tab mt10 Remd-edit-div QrecordInfo  bind_hidden hidden":"radius-tab mt10 Remd-edit-div QrecordInfo"} cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                        <tr>
                            <th width="10%" >状态</th>
                            <th width="30%"  >
                                <span className="detail-t">沟通方式</span>
                            </th>
                            <th width="30%"  >处理状态</th>
                            <th width="30%" >
                                <span className="detail-t">承诺还款</span>
                            </th>
                            {/* <th></th> */}
                        </tr>
                        <tr>
                            <td className="queueStatu" data-queueStatusId={_queueStatusId?_queueStatusId:""} data-queueStatus={_queueStatus?_queueStatus:""}>{_queueStatus}</td>
                            <td className="contactMethodReminderInfos">
                                <select name="" className="select-gray commu-select left mr5" id='contactMethodReminderInfos'>
                                    <option value="" id='0' hidden>请选择</option>
                                    {
                                        (contactMethodReminderInfos && contactMethodReminderInfos.length>0) ? contactMethodReminderInfos.map((repy,i)=>{
                                            return <option value={repy.id?repy.id:""} key={i} name={repy.contactMethodChinese?repy.contactMethodChinese:""}>{commonJs.is_obj_exist(repy.contactMethodChinese)}</option>
                                        }):<option value="">请选择</option>
                                    }
                                </select>
                            </td>
                            <td className="contactResultsInfo">
                                <select name="" className="select-gray commu-select left mr5" id='contactResultsInfo'>
                                    <option value="" id='0' hidden>请选择</option>
                                    {
                                        (queueContactResultEnums && queueContactResultEnums.length>0) ? queueContactResultEnums.map((repy,i)=>{
                                            return <option value={repy.value?repy.value:""} key={i} name={repy.name?repy.name:""}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option value="">请选择</option>
                                    }
                                </select>
                            </td>
                            <td className="paySelectEnums" >
                                <select name="" className="select-gray commu-select left mr5" id='paySelectEnums'>
                                    <option value="" id='0' hidden>请选择</option>
                                    {
                                        (paySelectEnums && paySelectEnums.length>0) ? paySelectEnums.map((repy,i)=>{
                                            console.log(repy)
                                            return <option value={repy.value} key={i} name={repy.name?repy.name:""}>{commonJs.is_obj_exist(repy.name)}</option>
                                        }):<option value="">请选择</option>
                                    }
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                <span className="detail-t">详情</span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                <textarea name="" id="RemdQdetail" cols="30" rows="10" className="commu-area textarea RemdQdetail"></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                <button className="left block ml20 edit btn-blue" id='saveRmdQueueHandler' onClick={this.saveRmdQueueHandler.bind(this)}>保存</button>
                                <button className="btn-white left block ml20 cancle_edit" id='cancelSaveQ' onClick={commonJs.cancelSaveQ.bind(this)}>取消</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table className="pt-table mt10 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                        <tr>
                            <th width="25%">状态</th>
                            <th width="25%">沟通方式</th>
                            <th width="25%">处理状态</th>
                            <th width="25%">承诺还款</th>
                        </tr>
                        {
                            (redminderRecordInfoDTOS && redminderRecordInfoDTOS.length>0) ? redminderRecordInfoDTOS.map((repy,i)=>{
                                return <tr key={i}>
                                    <td colSpan="4" className="no-padding-left">
                                        <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                            <tbody>
                                            <tr>
                                                <td width="25%" title={commonJs.is_obj_exist(repy.beforeQueueStatus)}>{commonJs.is_obj_exist(repy.beforeQueueStatus)}</td>
                                                <td width="25%" title={commonJs.is_obj_exist(repy.remindContactResult)}>{commonJs.is_obj_exist(repy.remindContactResult)}</td>
                                                <td width="25%" title={commonJs.is_obj_exist(repy.afterQueueStatusStatus)}>{commonJs.is_obj_exist(repy.afterQueueStatusStatus)}</td>
                                                <td width="25%" title={commonJs.is_obj_exist(repy.paySelectZH)}>{commonJs.is_obj_exist(repy.paySelectZH)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="4" className="short-border-td">
                                                    <div className="short-border"></div>
                                                    <p className="left pt5 pb5 word-break pre-wrap" style={{"width":"65%"}} title={commonJs.is_obj_exist(repy.content)}>{commonJs.is_obj_exist(repy.content)}</p>
                                                    <div className="left ext-source-tip word-break" style={{"width":"30%","marginTop":"5px","paddingRight":"0"}} title={commonJs.is_obj_exist(repy.createdBy)+commonJs.is_obj_exist(repy.createdAt)}>
                                                        {commonJs.is_obj_exist(repy.createdBy)} <br/>{commonJs.is_obj_exist(repy.createdAt)}
                                                    </div>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                }): <tr><td colSpan="2" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                    </tbody>
                </table>
                {/*短信弹窗*/}
                <div className="sendMsg-pop hidden">
                    <div className="tanc_bg"></div>
                    <div className="sendMessage-box">
                        <div className="clearfix">
                            <i className="close right mt5" onClick={this.closepop.bind(this)}></i>
                        </div>
                        <div className="message-cont mt10">
                            尊敬的{this.props._name}，您在小雨点网贷办理的贷款第{this.props._installments}期应还款{this.props._amount}元将于{this.props._payDate}日扣款，请及时将足额款项存入您尾号为{(bankCardNo?bankCardNo.substr(bankCardNo.length-4):"")}的银行账户，详询4000188299。
                        </div>
                        <button className="btn-blue block mt10 send-btn" id='sendRemindSms' onClick={this.sendRemindSms.bind(this)}>发送短信</button>
                    </div>
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
        return current && current.valueOf() < Date.now()-86400;
}
function disabledDateTime() {
    return {
        // disabledHours: () => range(0, 24).splice(4, 20),
        // disabledMinutes: () => range(0, 60),
        // disabledSeconds: () => [55, 56],
    };
}

export default Reminder;