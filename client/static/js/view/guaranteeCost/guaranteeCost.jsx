// 担保费
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import { DatePicker,Table } from 'antd';
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";
import axios from '../../axios';
import GuaranteeRapayList from '../module/guaranteeRapayList'; //担保费还款计划table展示
import DeductionRecordsList from '../module/deductionRecordsList'; //担保费还款计划table展示

import qs from 'Qs';
@inject('allStore') @observer
class GuaranteeCost extends React.Component {
    constructor(props){
        super(props);
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息 
        this.state={
            coltnData:{},
            reasonSubs:[],
            _acount: this.props._acount,
            _loanNumber: this.props._loanNumber,
            _ownerId:this.props._ownerId, //任务所有者
            _communicateName:this.props._communicateName,  //电话详情界面回传的沟通姓名
            _newPhoneNo:this.props._newPhoneNo,  //电话详情回传的新号码记录
            customerId:this.props.customerId,
            deductionRecordsList:{}
        }
    }

    componentDidMount (){
        // this.initCount();
        this.getMsg();
        $(".contactResultsInfo select").change(function(){
            let _attr=$(this).find("option:selected").attr("data-name");
            if(_attr=="SET_TIME_FOLLOW_UP"){
                $(".followUpTime").removeClass("hidden");
                $(".COMMITMENT_REPAY_TIME").addClass("hidden");
                return;
            }
            if(_attr=="COMMITMENT_REPAY"){
                $(".followUpTime").addClass("hidden");
                $(".COMMITMENT_REPAY_TIME").removeClass("hidden");
                return;
            }
            $(".followUpTime,.COMMITMENT_REPAY_TIME").addClass("hidden");
        })
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.getMsg();
    }
    initCount(){
        //获取枚举初始值
        let _that=this;
        $.ajax({
            type:"get",
            url:"/RemColt/getUpfrontFeeInitEnum",
            async:true,
            data:{feeType:'guaranteefee'},
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                } 
                let _getData=res.data;
                let processStatusList=_getData?_getData.processStatusList:[];  //处理状态
                let new_processStatusList=[];  //record 处理状态列表 
                for(let i=0;i<processStatusList.length;i++){
                    if(processStatusList[i].name!="NEW_ADD"){
                        new_processStatusList.push(processStatusList[i]);
                    }
                }
                _that.setState({
                    initialData:_getData,
                    new_processStatusList:new_processStatusList
                })
            }
        })
    }
    //根据合同号查询担保费还款列表-lyf
    getGuranteeList=()=>{
        let that=this;
        let _loanNumber=this.labelBoxStore.rowData.loanNumber;
        let productNo=this.labelBoxStore.rowData.productNo;
        axios({
            method: 'get',
            url:'/node/upfrontFee/query/gurantee',
            params:{loanNumber:_loanNumber,productNo:productNo}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if(!response.executed){
                that.setState({
                    guaranteeFeePayInfoList:[]
                })
            }
            that.setState({
                guaranteeFeePayInfoList:cpCommonJs.opinitionArray(data.guaranteeFeePayInfoList)
            })
        })
    }
    //担保费扣款记录查询-lyf
    deductionRecords=(pageData)=>{
        let that=this;
        let _loanNumber=this.labelBoxStore.rowData.loanNumber;
        let productNo=this.labelBoxStore.rowData.productNo;
        
        let params = {};
        params = pageData;
        params.loanNumber = _loanNumber;
        params.productNo = productNo;
        $.ajax({
            type:"post",
            url:"/node/upfrontFee/gurantee/pay",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(params)},
            success:function(res) {
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                if(!response.executed){
                    that.setState({
                        deductionRecordsList:{}
                    })
                }
                that.setState({
                    deductionRecordsList:cpCommonJs.opinitionArray(response)
                })
            }
        })
    }
    //获取页面数据
    getMsg(){
        let _that=this;
        let _loanNumber=this.labelBoxStore.rowData.loanNumber;
        commonJs.cancelSaveQ(); //初始化queue操作框
        if(typeof(_loanNumber)=="undefined"|| _loanNumber==""){
            return;
        }
        $.ajax({
            type: "get",
            url: "/RemColt/getUpfrontFeeDetail",
            async: true,
            dataType: "JSON",
            data: {
                loanNumber: _loanNumber,
                feeType:'guaranteefee'
            },
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success: function (res) {
                $("#loading").remove();
                commonJs.ajaxGetCode(res);
                var _getData = res.data;
                if (!_getData.executed) {
                    _that.setState({
                        coltnData:_getData
                    })
                    return;
                }
                
                _that.setState({
                    coltnData:_getData
                })
                let upfrontFeeInfoDTO=_getData.upfrontFeeInfoDTO?_getData.upfrontFeeInfoDTO:{}; //修改当前条数的逾期金额/天数
                let tr_Principal=$(".cdt-list tr").eq(_that.state._clickNextNumber).find(".r_Principal");
                tr_Principal.html(commonJs.is_obj_exist(upfrontFeeInfoDTO.totalPrincipal)+ "/" + commonJs.is_obj_exist(upfrontFeeInfoDTO.totalOverdueDays));
                _that.initCount();
                _that.getGuranteeList();
                let pageData = {
                    pageSize:'10',
                    pageNum:'1'
                }
                _that.deductionRecords(pageData);
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }

    // queue保存操作
    savecoltnQueueHandler(event){
        var _that=this;
        let $this=$(event.target);
        let _parent=$this.closest(".QrecordInfo");
        let _data={};
        _data.accountId=this.labelBoxStore.rowData.accountId;
        _data.loanNumber=this.labelBoxStore.rowData.loanNumber;
        let contactInfoBack=this.userInfo2AStore.contactInfoBack;  //来自个人详情的联系人信息
        let _contactPersonId=_parent.find(".communicateObjectList option:selected").attr("data-name");  //沟通对象
        if(!_contactPersonId){
            alert("请选择沟通对象!");
            return;
        }
        if(_contactPersonId=="ONESELF_FIRST"){  //本人第二号码
            _data.customerId=this.labelBoxStore.rowData.customerId;
            if(contactInfoBack.thirdTelNo && contactInfoBack.thirdTelNo!="-"){
                _data.phoneNumber=contactInfoBack.thirdTelNo
            }
        }
        if(_contactPersonId=="ONESELF_SECOND"){  //本人第三号码
            _data.customerId=this.labelBoxStore.rowData.customerId;
            if(contactInfoBack.secondTelNo && contactInfoBack.secondTelNo!="-"){
                _data.phoneNumber=contactInfoBack.secondTelNo
            }
        }
        _data.contactPersonId=_contactPersonId;
        let _processingState=_parent.find(".contactResultsInfo option:selected").attr("data-name");  //处理状态
        if(!_processingState){
            alert("处理状态为必填项！");
            return;
        }
        _data.processingState=_processingState;
        let _scheduledTime=_parent.find(".contactResultsInfo").attr("data-time");  //跟进时间--当处理状态选择 跟进时 获取时间
        if(_scheduledTime!="" && _processingState=="SET_TIME_FOLLOW_UP"){
            _data.planTime=_scheduledTime  //	跟进时间--当处理状态选择 跟进时 获取时间 ps：用户没选则不传字段
        }
        let _promiseRepaymentTime=_parent.find(".COMMITMENT_REPAY_TIME").attr("data-time");  //承诺还款时间--当处理状态选择 承诺还款 获取时间
        if((!_promiseRepaymentTime || _promiseRepaymentTime=="") && _processingState=="COMMITMENT_REPAY"){
            alert("请选择承诺还款时间！");
            return;
        }
        if(_promiseRepaymentTime!="" && _processingState=="COMMITMENT_REPAY"){
            _data.promiseRepaymentTime=_promiseRepaymentTime  //ps：用户没选则不传字段
        }
        let _newMoblieRecord=_parent.find(".newMoblieRecord").val();  //新号码记录
        if(!_newMoblieRecord || _newMoblieRecord=="-"){
            alert("请输入新号码记录！");
            return;
        }
        if(isNaN(_newMoblieRecord)){
            alert("新号码记录必须为纯数字!");
            return;
        }
        _data.newMoblieRecord=_newMoblieRecord;
        
        let _contact_person_name=_parent.find(".communicateName").val();  //沟通姓名
        if(!_contact_person_name || _contact_person_name=="-"){
            alert("请输入沟通姓名！");
            return;
        }
        _data.contactPersonName=_contact_person_name;
        
        let _caseContent=_parent.find(".CollQdetail").val();
        if(_caseContent!=""){
            _data.caseContent=_caseContent;  //内容
        }
        _data.feeType='guaranteefee';
        $.ajax({
            type:"post",
            url:"/RemColt/saveQrecord",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                _that.getMsg();
                if(_that.props.updataList_fn){
                    _that.props.updataList_fn(false,true);
                }
                _that.cancelSaveQ();
                //保存本人第二号码和本人第三号码需要更新个人信息板块数据
                if(_contactPersonId=="ONESELF_FIRST" || _contactPersonId=="ONESELF_SECOND"){  
                    _that.props.reloadUserMsg();
                }
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //取消保存record
    cancelSaveQ(){
        let _parent=$(".coll-edit-div");
        _parent.find(".communicateObjectList").find("select option").removeProp("selected");
        _parent.find(".communicateObjectList").find("select option:eq(0)").prop("selected","selected");
        _parent.find(".communicateName").val("");
        _parent.find(".newMoblieRecord").val("");
        _parent.find(".contactResultsInfo").find("select option").removeProp("selected");
        _parent.find(".contactResultsInfo").find("select option:eq(0)").prop("selected","selected");
        _parent.find(".followUpTime,.COMMITMENT_REPAY_TIME").addClass("hidden");
    }

    //获取跟进时间
    selectTime(value, dateString) {
        $(".contactResultsInfo").attr("data-time",dateString);
    }
    //获取承诺还款时间
    selectTime_crt(value, dateString) {
        $(".COMMITMENT_REPAY_TIME").attr("data-time",dateString);
    }
    //沟通对象切换
    communicateObjectFn(event){
        let $this=$(event.target);
        let $parent=$this.closest(".QrecordInfo");
        let _selected=$this.find("option:selected").attr("data-name");
        let contactInfoBack=this.userInfo2AStore.contactInfoBack;  //来自个人详情的联系人信息
        switch(_selected)
        {
            case "ONESELF":  //本人注册
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.userName));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(contactInfoBack.primaryPhone));
                break;
            case "ONESELF_FIRST": //本人第二号码
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.userName));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(contactInfoBack.secondTelNo));
                break;
            case "ONESELF_SECOND": //本人第三号码
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.userName));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(contactInfoBack.thirdTelNo));
                break;
            case "COMPANY": //公司电话
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.company));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(contactInfoBack.companyPhone));
                break;
            case "FIRST_CONTACT": //第一联系人
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.directReferenceName));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(contactInfoBack.directReferencePhone));
                break;
            case "SECOND_CONTACT": //第二联系人
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.twoName));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(contactInfoBack.twoPhone));
                break;
            case "THIRD_CONTACT": //第三联系人
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(contactInfoBack.otherReferenceName2));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(contactInfoBack.otherReferencePhone2));
                break;
            case "MAIL_LIST": //通讯录
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(''));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(''));
                break;
        }
    }
    //设定扣款
    transferHandle=()=>{
        let _setType=$('.processing-cont-div .set_type option:selected').attr('value');
        let _set_amount=$(".processing-cont-div .newamount-inp").val();
        let installmentNumber=null;//$(".processing-cont-div .installmentNumber-inp").val();//2.8.11不需要传null
        if(!_set_amount){
            alert("请设置金额！");
            return;
        }
        /* if(!installmentNumber){
            alert("请填写期数！");
            return;
        } */
        let rowData=this.labelBoxStore.rowData?this.labelBoxStore.rowData:{};
        let _parems={
            productNo:rowData.productNo,
            accountId:rowData.accountId,
            loannumber:rowData.loanNumber,
            set_type:_setType,
            installmentNumber:installmentNumber,
            set_amount:_set_amount,
            isCooperation:true
        }
        let result=confirm("设定扣款金额为"+_set_amount+",请确认！");  
        if(!result){  
            return false;
        }
        $.ajax({
            type:"get",
            url:'/node/setup',
            async:true,
            dataType: "JSON",
            data:_parems,
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _getData = res.data;
                alert(_getData.message);
                $(".processing-cont-div input").val("");
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    render() {
        let {coltnData={},guaranteeFeePayInfoList=[]}=this.state;  //页面数据
        let upfrontFeeRecordsInfoDTOS=coltnData.upfrontFeeRecordsInfoDTOS ? coltnData.upfrontFeeRecordsInfoDTOS :[]  //操作记录列表
        let new_processStatusList=this.state.new_processStatusList;
        // let columns=[
        //     {
        //         title: '贷款号',
        //         key:'loan_number',
        //         widt:'20%',
        //         render: (text,record,index) => {return commonJs.is_obj_exist(record.loan_number)}
        //     },{
        //         title: '金额',
        //         key:'amount',
        //         widt:'10%',
        //         render: (text,record,index) => {return commonJs.is_obj_exist(record.amount)}
        //     },{
        //         title: '未付金额',
        //         key:'amount_not_paid',
        //         widt:'10%',
        //         render: (text,record,index) => {return commonJs.is_obj_exist(record.amount_not_paid)}
        //     },{
        //         title: '最后一次扣款成功时间',
        //         key:'clearance_date',
        //         widt:'20%',
        //         render: (text,record,index) => {return commonJs.is_obj_exist(record.clearance_date)}
        //     },{
        //         title: '应还款日',
        //         key:'due_date',
        //         widt:'20%',
        //         render: (text,record,index) => {return commonJs.is_obj_exist(record.due_date)}
        //     },{
        //         title: '期数',
        //         key:'installment_number',
        //         widt:'10%',
        //         render: (text,record,index) => {return commonJs.is_obj_exist(record.installment_number)}
        //     },{
        //         title: '是否结清',
        //         key:'paid_off',
        //         widt:'10%',
        //         render: (text,record,index) => {
        //             if(record.paid_off==1){
        //                 return '是';
        //             }else if(record.paid_off==0){
        //                 return '否';
        //             }else{
        //                 return '-';
        //             }
        //         }
        //     }
        // ]
        return (
            <div className="auto-box pr5">
                <GuaranteeRapayList guaranteeFeePayInfoList={guaranteeFeePayInfoList} />
                <DeductionRecordsList 
                    deductionRecords ={this.deductionRecords}
                    deductionRecordsList={this.state.deductionRecordsList}
                />
                <div>
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        逾期信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="processing-cont-div mt5 clearfix bar">
                        <ul className="processing-cont ml20">
                            <li>
                                <p className="proc-cont-tit">设定的类型</p>
                                <select className="select-gray set_type" id='setTypr' style={{"width":"100px"}}>
                                    <option value="security_cost" defaultValue='true'>担保费扣款</option>
                                </select>
                            </li>
                            <li>
                                <p className="proc-cont-tit">new amount</p>
                                <input type="text" className="input newamount-inp" id='newamount' placeholder="请输入" />
                            </li>
                            <li style={{display: 'none'}} >
                                <p className="proc-cont-tit">期数</p>
                                <input type="text" className="input installmentNumber-inp" id='installmentNumber' placeholder="请输入" />
                            </li>
                            <li>
                                <button className="btn-blue right mr20 mt30" id='transfer' onClick={this.transferHandle.bind(this)}>保存</button>
                            </li>
                        </ul>
                    </div>
                </div>
                {/* record 操作 */}
                <div className='bar mt10 coll-edit-div pb10 QrecordInfo'>
                    <dl>
                        <dt>沟通对象</dt>
                        <dd className="communicateObjectList">
                            <select name="" id='communicate' className="select-gray commu-select" onChange={this.communicateObjectFn.bind(this)}>
                                <option data-name="" id="0" hidden>请选择</option>
                                {
                                    (this.state.initialData && this.state.initialData.communicateObjectList && this.state.initialData.communicateObjectList.length>0) ? this.state.initialData.communicateObjectList.map((repy,i)=>{
                                        return <option key={i} data-name={repy.name} data-value={repy.value}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                    }):<option data-name=""> </option>
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl>
                        <dt>沟通姓名</dt>
                        <dd className="">
                            <input type="text" className="input communicateName" id='communicateName' placeholder="请输入"/>
                        </dd>
                    </dl>
                    <dl>
                        <dt>处理状态</dt>
                        <dd className="contactResultsInfo">
                            <select name="" id='contactResultsInfo' className="select-gray commu-select left mr5">
                                <option data-name="" id="0" hidden>请选择</option>
                                {
                                    (new_processStatusList && new_processStatusList.length>0) ? new_processStatusList.map((repy,i)=>{
                                        return <option key={i} data-name={repy.name} data-value={repy.value}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                    }):<option data-name=""> </option>
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl className="followUpTime hidden">
                        <dt>跟进时间</dt>
                        <dd id='followUpTime'>
                            <DatePicker format="YYYY-MM-DD HH:mm:ss" onChange={this.selectTime.bind(this)} disabledDate={disabledDate} showTime />
                        </dd>
                    </dl>
                    <dl className="COMMITMENT_REPAY_TIME hidden">
                        <dt>承诺还款时间</dt>
                        <dd id='commitmentRepayTime'>
                            <DatePicker format="YYYY-MM-DD HH:mm:ss" onChange={this.selectTime_crt.bind(this)} disabledDate={disabledDate} showTime />
                        </dd>
                    </dl>
                    <dl>
                        <dt>新号码记录</dt>
                        <dd className="">
                            <input type="text" id='newMoblieRecord' className="input newMoblieRecord" placeholder="请输入"/>
                        </dd>
                    </dl>
                    <div className="clearfix"></div>
                    <dl className="through-dl">
                        <dt>详情</dt>
                        <dd className="">
                            <textarea name="" id="CollQdetail" cols="30" rows="10" className="commu-area textarea CollQdetail"></textarea>
                        </dd>
                    </dl>
                    <div>
                        <button className="left block ml10 edit btn-blue" id='savecoltnQueue' onClick={this.savecoltnQueueHandler.bind(this)}>保存</button>
                        <button className="btn-white left block ml20 cancle_edit" id='savecoltnQueueCancle' onClick={commonJs.cancelSaveQ.bind(this)}>取消</button>
                    </div>
                </div>
                {/* record 记录 */}
                <div className={(upfrontFeeRecordsInfoDTOS && upfrontFeeRecordsInfoDTOS.length>0)?"bar mt10 coll-edit-div":"bar mt10 coll-edit-div hidden"}>
                {
                    (upfrontFeeRecordsInfoDTOS && upfrontFeeRecordsInfoDTOS.length>0) ? upfrontFeeRecordsInfoDTOS.map((repy,i)=>{
                    let recordTime="";
                    if(repy.processingState){
                        if(repy.processingState=="承诺还款"){
                            recordTime=commonJs.is_obj_exist(repy.promiseRepaymentTime);
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
                                    {commonJs.is_obj_exist(repy.contactPersonName)}
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
                                <dt>新号码记录</dt>
                                <dd className="">
                                    {commonJs.is_obj_exist(repy.newMoblieRecord)} 
                                </dd>
                            </dl>
                            <div className="clearfix ml10 mr10 record-detail-div">
                                <div className="record-detail left">
                                    <span className="left block pr10">详情</span>
                                    <div className="left detail elli">{commonJs.is_obj_exist(repy.caseContent)}</div>
                                </div>
                                <div className="right toggle-record-detail on" onClick={commonJs.toggle_record_detail.bind(this)}><i></i></div>
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
        return current && current.valueOf() < Date.now()-86400;
}

export default GuaranteeCost;