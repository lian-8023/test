// 
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
class RepaymentRemindpage extends React.Component {
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore; 
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.topBindNumberStore=this.props.allStore.TopBindNumberStore;  //顶部绑定（完成）数显示-通用 2A portal
        this.state={
            RmdData:{},
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
    }
    //获取页面数据
    getMsg(){
        let _that=this;
        let parems=this.labelBoxStore.rowData;
        commonJs.cancelSaveQ(); //初始化queue操作框
        $.ajax({
            type: "post",
            url: "/node/remind/judgeBind",
            async: true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(parems)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success: function (res) {
                $("#loading").remove();
                commonJs.ajaxGetCode(res);
                var _getData = res.data;
                if (!_getData.executed) {
                    _that.setState({
                        RmdData:{},
                        status:''
                    })
                    return;
                }
                let bindStatus=_getData.bindStatus;
                let bindBy=_getData.bindBy;
                if(bindStatus=='bind'){
                    alert(`当前queue已被${bindBy}绑定！`);
                }

                _that.setState({
                    RmdData:_getData,
                    status:_getData.status
                });
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }

    // reminder queue保存操作
    saveRmdQueueHandler(event){
        var _that=this;
        let _data=this.labelBoxStore.rowData;
        let RmdData=this.state.RmdData;
        let xyhReminderInfoDTO=cpCommonJs.opinitionObj(RmdData.xyhReminderInfoDTO);
        let _queueStatusId=xyhReminderInfoDTO.queueStatusId;

        let _afterQueueStatusId=$(".contactResultsInfo option:selected").attr("value");
        let remindContactResultId = $(".contactMethodReminderInfos .commu-select option:selected").attr("value");
        let paySelect =  $(".paySelectEnums .commu-select option:selected").attr("value");

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
        _data.beforeQueueStatusId=_queueStatusId;
        _data.remindContactResultId=remindContactResultId;
        _data.paySelect=paySelect;
        let _caseContent=$(".RemdQdetail").val();
        if(_caseContent!=""){
            _data.content=_caseContent;
        }
        $.ajax({
            type:"post",
            url:"/node/remind/xyh/save",
            async:false,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                // if(_that.props.updataList_fn){
                //     _that.props.updataList_fn(false);
                // }
                _that.getMsg();
            }
        })
    }
    //发送短信
    smsSend=()=>{
        var _that=this;
        var UserInfo2AStore = _that.props.allStore.UserinfoStore.XYH_IdentityInfo;
        let _data=this.labelBoxStore.rowData;
        let RmdData=this.state.RmdData;
        const {notPaidAmountCurrentDate} = RmdData.xyhReminderInfoDTO;
        let bankNumber = UserInfo2AStore.bankInfo.bankCardNo?UserInfo2AStore.bankInfo.bankCardNo.substr(UserInfo2AStore.bankInfo.bankCardNo.length-4):'';
        let parems = {
            amount:notPaidAmountCurrentDate,
            bankName:UserInfo2AStore.bankInfo.userBankName,
            bankNumber:bankNumber,
            name:UserInfo2AStore.bankInfo.cardholderName,
            phone:UserInfo2AStore.bankInfo.receiptBankReservePhone,
        };
        $.ajax({
            type:"post",
            url:"/node/cp/sms/send",
            async:false,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(parems)},
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
            }
        })
    }
    render() {
        let {status,RmdData={}}=this.state;
        let reminderRecordInfoDTOS=cpCommonJs.opinitionArray(RmdData.reminderRecordInfoDTOS);
        let xyhReminderInfoDTO=cpCommonJs.opinitionObj(RmdData.xyhReminderInfoDTO);
        let _queueStatusId=xyhReminderInfoDTO.queueStatusId;
        let _queueStatus=xyhReminderInfoDTO.queueStatus;
        let queueContactResultEnums=cpCommonJs.opinitionArray(RmdData.queueContactResultEnums);
        let contactMethodReminderInfos = RmdData.contactMethodReminderInfos;
        let paySelectEnums = RmdData.paySelectEnums;
        return (
            <div className="auto-box pr5">
                <table className={(!_queueStatusId || _queueStatusId==4 || status=='blind')?"radius-tab mt10 Remd-edit-div QrecordInfo  bind_hidden hidden":"radius-tab mt10 Remd-edit-div QrecordInfo"} cellPadding={0} cellSpacing={0} frameBorder={0}>
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
                        </tr>
                        <tr>
                            <td className="queueStatu">
                                {commonJs.is_obj_exist(_queueStatus)}
                            </td>
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
                                <select name="" id="contactResultsInfo" className="select-gray commu-select left mr5">
                                    <option value="" id='0' hidden>请选择</option>
                                    {
                                        (queueContactResultEnums && queueContactResultEnums.length>0) ? queueContactResultEnums.map((repy,i)=>{
                                            return <option value={commonJs.is_obj_exist(repy.value)} key={i} name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option value="">请选择</option>
                                    }
                                </select>
                            </td>
                            <td className="paySelectEnums" >
                                <select name="" className="select-gray commu-select left mr5" id='paySelectEnums'>
                                    <option value="" id='0' hidden>请选择</option>
                                    {
                                        (paySelectEnums && paySelectEnums.length>0) ? paySelectEnums.map((repy,i)=>{
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
                                {this.labelBoxStore.rowData.cooperationFlag=="2C"&&<button className="btn-white left block ml20 cancle_edit" style={{float: 'right',marginRight: '20px'}} id='Sms' onClick={()=>{this.smsSend(this)}}>发送短信</button>}
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
                            (reminderRecordInfoDTOS && reminderRecordInfoDTOS.length>0) ? reminderRecordInfoDTOS.map((repy,i)=>{
                                return <tr key={i}>
                                    <td colSpan="4" className="no-padding-left">
                                        <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                            <tbody>
                                            <tr>
                                                <td width="25%" title={commonJs.is_obj_exist(repy.beforeQueueStatus)}>{commonJs.is_obj_exist(repy.beforeQueueStatus)}</td>
                                                <td width="25%" title={commonJs.is_obj_exist(repy.remindContactResult)}>{commonJs.is_obj_exist(repy.remindContactResult)}</td>
                                                <td width="25%" title={commonJs.is_obj_exist(repy.afterQueueStatus)}>{commonJs.is_obj_exist(repy.afterQueueStatus)}</td>
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
            </div>
        )
    }
};

export default RepaymentRemindpage;