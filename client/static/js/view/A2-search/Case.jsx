// 案例
import React from 'react';
import $ from 'jquery';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class Case extends React.Component {
    constructor(props){
        super(props);
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2A PORTAL用户详情-UserMsg组件信息 
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息
        this.state={
            _caseTypes:[],  //案例类别
            _contactMethodsInfoDTO:[],  //沟通方式
            _CpyRecordsInfo:[],  //公司搜索Qinfo
            _VoeRecordsInfo:[],  //voe Qinfo
            _VorRecordsInfo:[],  //vor Qinfo
            _OcrRecordsInfo:[],  //ocr Qinfo
            _LpRecordsInfo:[],  //Lp Qinfo
            _ApproveRecordsInfo:[],  //Approve Qinfo
            _FraudRecordsInfo:[],  //Fraud Qinfo
            _caseListInfo:[],  //案例记录
            upfrontFeeRecordsInfoDTO_server:[]  //服务费
            
        }
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        // var _oper_case_type = nextProps._oper_case_type;
        // if(_oper_case_type&&_oper_case_type=="noload"){
        //     return;
        // }
        // this.setState({
        //     loanNumber:nextProps.prev_loanNumber,
        //     accountId:nextProps.prev_params
        // },()=>{
        //     this.getCaseTypes();
        //     this.getCaseList();
        // })
    }
    componentDidMount () {
        this.getCaseTypes();
        this.getCaseList();
        commonJs.reloadRules();
        var h = document.documentElement.clientHeight;
        if(this.props._location!="reminder" && this.props._location!="collection" && this.props._location!="outsource"){
            $(".auto-box").css("height", h - 105);
        }
        
        $(".detail-top-select,.detail-top-select-bar").removeClass("hidden");

        //创建案例
        $(".creatCaseBtn").click(function(){
            $(".creatCaseCont").removeClass("hidden");
        })
    }
    //通过loan_number查询案例记录
    getCaseList(){
        let _accountId=this.acountBarStore.acountId;
        let _loanNumber=this.acountBarStore.selectedLoanNumber;
        let _that=this;
        if(!_accountId || typeof(_accountId)=="undefined" || _accountId==""){
            return;
        }
        $.ajax({
            type:"get",
            url:"/node/getCaseListByLoanNumber",
            async:true,
            dataType: "JSON",
            data:{
                loanNumber:_loanNumber,
                accountId:_accountId
            },
            success:function(res) {
                if (!res.data.executed) {
                    _that.setState({
                        _caseListInfo:[]
                    })
                    return;
                }
                var _getData = res.data;
                _that.setState({
                    _caseListInfo:_getData.caseListInfo?_getData.caseListInfo:[]
                })
            }
        })
    }

    //获取案例类别和沟通方式
    getCaseTypes(){
        let _that=this;
        $.ajax({
            type:"get",
            url:"/node/getCaseTypes",
            async:false,
            dataType: "JSON",
            success:function(res) {
                // if (!commonJs.ajaxGetCode(res)) {
                //     return;
                // }
                var _getData = res.data;
                if(!_getData.executed){
                    console.log("案例记录失败！");
                    return;
                }
                _that.setState({
                    _caseTypes:_getData.caseTypes?_getData.caseTypes:[],  //案例类别
                    _contactMethodsInfoDTO:_getData.contactMethodsInfoDTO?_getData.contactMethodsInfoDTO:[],  //沟通方式
                })
            }
        })
    }
    //公司搜索
    CpyRecordsInfo_fn(){
        this.setState({
            _CpyRecordsInfo:get_CpyRecordsInfo
        })
    }
    //获取对应Q数据
    getMsg(type,event){
        let _that=this;
        if(!event || !event.target){
            return;
        }
        let _this=$(event.target);
        let dom="";
        if(_this.hasClass("toggle-tit")){
            dom=_this;
        }else{
            dom=_this.closest(".toggle-tit");
        }
        if(dom.next().hasClass("hidden")){
            this.getBarMsg(type);
            dom.parent().siblings().find("h2.bar").next(".bar:visible").addClass("hidden");
            dom.parent().siblings().find("h2.bar").removeClass("on");
            dom.parent().siblings().find("h2.bar").find(".bar-tit-toggle").removeClass("bar-tit-toggle-up").addClass("bar-tit-toggle-down");

            dom.find(".bar-tit-toggle").removeClass("bar-tit-toggle-down").addClass("bar-tit-toggle-up");
            dom.nextAll().removeClass("hidden");
            dom.addClass("on");
        }else {
            dom.find(".bar-tit-toggle").removeClass("bar-tit-toggle-up").addClass("bar-tit-toggle-down");
            dom.nextAll().addClass("hidden");
            dom.removeClass("on");
        }
    }
    getBarMsg(type){
        let _that=this;
        switch (type){
            case "Cpy":
                let get_CpyRecordsInfo=_that.pub_getMsg("/node/getCompanyQueueRecordsByLoanNumber");
                _that.setState({
                    _CpyRecordsInfo:get_CpyRecordsInfo.companySearchQueueRecordsInfoDTO?get_CpyRecordsInfo.companySearchQueueRecordsInfoDTO:[]
                })
                break;
            case "OCR":
                let get_OcrRecordsInfo=_that.pub_getMsg("/node/getOcrQueueRecordsByLoanNumber");
                _that.setState({
                    _OcrRecordsInfo:get_OcrRecordsInfo.ocrQueueRecordsInfoDTO?get_OcrRecordsInfo.ocrQueueRecordsInfoDTO:[]
                })
                break;
            case "Dcline_LP":
                let get_Decline_LpRecordsInfo=_that.pub_getMsg("/node/getDeclineLpQueueRecordsByLoanNumber");
                _that.setState({
                    _Dcline_LpRecordsInfo:get_Decline_LpRecordsInfo.lpUltimateQueueRecordsInfoDTOS?get_Decline_LpRecordsInfo.lpUltimateQueueRecordsInfoDTOS:[]
                })
                break;
            case "Approve":
                let get_ApproveRecordsInfo=_that.pub_getMsg("/node/getApproveQueueRecordByLoanNumber");
                _that.setState({
                    _ApproveRecordsInfo:get_ApproveRecordsInfo.approveQueueRecordList?get_ApproveRecordsInfo.approveQueueRecordList:[]
                })
                break;
            case "Fraud":
                let get_FraudRecordsInfo=_that.pub_getMsg("/node/getFraudQueueRecordByLoanNumber");
                _that.setState({
                    _FraudRecordsInfo:get_FraudRecordsInfo.fraudQueueRecordList?get_FraudRecordsInfo.fraudQueueRecordList:[]
                })
                break;
            case "Reminder":
                let get_RminderRecordsInfo=_that.pub_getMsg("/node/getRemindQueueRecordsByLoanNumber");
                _that.setState({
                    _ReminderRecordsInfo:get_RminderRecordsInfo.newRemindQueueRecordInfoDTOS?get_RminderRecordsInfo.newRemindQueueRecordInfoDTOS:[]
                })
                break;
            case "Collection":
                let get_CollectionRecordsInfo=_that.pub_getMsg("/node/getCollectionQueueRecordsByLoanNumber");
                _that.setState({
                    _CollectionRecordsInfo:get_CollectionRecordsInfo.recordsInfoDTOS?get_CollectionRecordsInfo.recordsInfoDTOS:[]
                })
                break;
            case "charge":
                let get_earlyCostRecordsInfo_charge=_that.pub_getMsg("/node/getUpfrontFeeRecordsByLoanNumber",'feeType');
                _that.setState({
                    upfrontFeeRecordsInfoDTO_server:get_earlyCostRecordsInfo_charge.upfrontFeeRecordsInfoDTO ?get_earlyCostRecordsInfo_charge.upfrontFeeRecordsInfoDTO :[]
                })
                break;
            case "AST":
                let get_astInfo=_that.pub_getMsg("/node/queueRecord/getAstRecordsByLoanNumber","AST");
                _that.setState({
                    _astInfo:get_astInfo.astQueueRecordInfoDTOS ?get_astInfo.astQueueRecordInfoDTOS :[]
                })
                break;
            case "AST_insurance":
                let get_astInfo_insurance=_that.pub_getMsg("/node/queueRecord/getAstRecordsByLoanNumber","AST_insurance");
                _that.setState({
                    _astInfo_insurance:get_astInfo_insurance.astQueueRecordInfoDTOS ?get_astInfo_insurance.astQueueRecordInfoDTOS :[]
                })
                break;
        }
    }
    //ajax公共请求方法,_url请求地址，type接口标识,
    pub_getMsg(_url,type){
        let ajaxData={};
        let _data={};
        if(this.acountBarStore.selectedLoanNumber){
            _data.loanNumber=this.acountBarStore.selectedLoanNumber;
        }
        if(type){
            if(type=="AST"){
                _data.registrationId=this.userInfo2AStore.userInfo.registrationId;
            }else if(type=='feeType'){
                _data.feeType='insure';  //服务费record接口需要传 feeType
            }else if(type=='AST_insurance'){
                _data.resource='ast_insurance';
                _data.registrationId=this.userInfo2AStore.userInfo.registrationId;
            }
        }
        $.ajax({
            type:"get",
            url:_url,
            async:false,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                if(!_getData.executed){
                    ajaxData={};
                    console.log("获取queue信息失败！");
                    return;
                }
                ajaxData=_getData;
            }
        })
        return ajaxData;
    }
    
    //保存案例
    saveCaseList(){
        let _data={};
        let _that=this;
        _data.accountId=this.acountBarStore.acountId;
        var _caseTypeId=$(".creatCaseCont .caseType option:selected").attr("id");
        if(!_caseTypeId){
            alert("请选择案例类别！");
            return;
        }
        _data.caseTypeId=_caseTypeId;
        var _contactMethodId=$(".creatCaseCont .caseContactWay option:selected").attr("data-id");
        if(_contactMethodId=="0"){
            alert("请选择沟通方式！");
            return;
        }
        _data.contactMethodId=_contactMethodId;
        _data.loanNumber=this.acountBarStore.selectedLoanNumber;
        _data.detail=$(".creatCaseCont .commu-area").val();
        $.ajax({
            type:"get",
            url:"/node/saveCaseList",
            async:false,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                if(!_getData.executed){
                    console.log("创建案例失败");
                    return;
                }
                alert(_getData.message);
                _that.getCaseList();
                $(".creatCaseCont .caseType option,.creatCaseCont .caseContactWay option").removeAttr("defaultChecked");
                $(".creatCaseCont .caseType option[data-id='0']").attr("selected","selected");
                $(".creatCaseCont .caseContactWay option[data-id='0']").attr("selected","selected");
                $(".creatCaseCont .textarea").val("");
            }
        })
    }
    //取消保存
    cancelSave(){
        $(".creatCaseCont").addClass("hidden");
    }
    render() {
        let caseTypes=this.state._caseTypes;  //案例类别
        let contactMethodsInfoDTO=this.state._contactMethodsInfoDTO;  //沟通方式
        let caseListInfo=this.state._caseListInfo;  //案例记录

        let CpyRecordsInfo=this.state._CpyRecordsInfo;
        let VoeRecordsInfo=this.state._VoeRecordsInfo;
        let VorRecordsInfo=this.state._VorRecordsInfo;
        let OcrRecordsInfo=this.state._OcrRecordsInfo;
        let LpRecordsInfo=this.state._LpRecordsInfo;
        let ApproveRecordsInfo=this.state._ApproveRecordsInfo;
        let FraudRecordsInfo=this.state._FraudRecordsInfo;
        let ReminderRecordsInfo=this.state._ReminderRecordsInfo;
        let CollectionRecordsInfo=this.state._CollectionRecordsInfo;
        let upfrontFeeRecordsInfoDTO=this.state._earlyCostRecordsInfo;
        let upfrontFeeRecordsInfoDTO_server=this.state.upfrontFeeRecordsInfoDTO_server;
        let Decline_LPInfo=this.state._Dcline_LpRecordsInfo;
        let astInfo=this.state._astInfo;
        let astInfo_insurance=this.state._astInfo_insurance;
        let TSRecordsInfo=this.state._TSRecordsInfo;
        return (
            <div className="auto-box pr5 casePage">
                <div className="toggle-box mt10">
                    <div className="bar pl20">
                        <button className="bar-btn block creatCaseBtn" id='creatCaseBtn'>+&nbsp;创建案例</button>
                    </div>
                    <div className="clearfix mt5 toggle-cont-mid creatCaseCont hidden">
                        <table className="radius-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                            <tbody>
                                <tr>
                                    <th width="20%">案例类别</th>
                                    <th width="20%">沟通方式</th>
                                    <th></th>
                                </tr>
                                <tr>
                                    <td className="">
                                        <select className="select-gray caseType" name="" id="caseTypes" style={{"width":"100%"}}>
                                            <option data-id="0" hidden defaultChecked="defaultChecked">请选择</option>
                                        {
                                            (caseTypes && caseTypes.length>0) ? caseTypes.map((repy,i)=>{
                                                return <option key={i} id={repy.id}>{repy.caseType}</option>
                                            }):<option id="">没有数据</option>
                                        }
                                        </select>
                                    </td>
                                    <td className="">
                                        <select className="select-gray caseContactWay" name="" id="caseContactWay" style={{"width":"100%"}}>
                                            <option data-id="0" hidden defaultChecked="defaultChecked">请选择</option>
                                            {
                                                (contactMethodsInfoDTO && contactMethodsInfoDTO.length>0) ? contactMethodsInfoDTO.map((repy,i)=>{
                                                    return <option key={i} data-contactMethod={repy.contactMethod} data-id={repy.id}>{repy.contactMethodChinese}</option>
                                                }):<option value="">没有数据</option>
                                            }
                                        </select>
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan="3">
                                        <span className="detail-t">详情</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="3">
                                        <textarea name="" id="caseDetail" cols="30" rows="10" className="commu-area textarea"></textarea>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="3">
                                        <button className="left block ml20 edit btn-blue saveVoeQueue-btn" id='saveCase' onClick={this.saveCaseList.bind(this)}>保存</button>
                                        <button className="btn-white left block ml20 cancle_edit" id='saveCaseCancle' onClick={this.cancelSave.bind(this)}>取消</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {/*案例记录*/}
                {
                    (caseListInfo && caseListInfo.length>0) ? caseListInfo.map((repy,i)=>{
                        return <div className="toggle-box" key={i}>
                                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="Fraud" data-caseTypeId={repy.caseTypeId} onClick={this.getMsg.bind(this,"")}>
                                        {repy.caseType=="AST"?"AST 手工记录":repy.caseType}
                                        <i className="right bar-tit-toggle bar-tit-toggle-down" data-type="Fraud" ></i>
                                    </h2>
                                    <div className="bar mt5 hidden">
                                        <table className="radius-tab replay-list commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                            <tbody>
                                            <tr>
                                                <th width="10%">类别</th>
                                                <th width="35%">合同号</th>
                                                <th width="25%">沟通方式</th>
                                                <th></th>
                                            </tr>
                                            {
                                                (repy.caseList && repy.caseList.length>0)?repy.caseList.map((cases,index)=>{
                                                    return <tr key={index}>
                                                            <td colSpan="4" className="no-padding-left">
                                                                <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td width="10%" title={commonJs.is_obj_exist(cases.caseType)}>{commonJs.is_obj_exist(cases.caseType)}</td>
                                                                            <td width="35%" title={commonJs.is_obj_exist(cases.loanNumber)}>{commonJs.is_obj_exist(cases.loanNumber)}</td>
                                                                            <td width="25%" title={commonJs.is_obj_exist(cases.contactMethod)} data-id={commonJs.is_obj_exist(cases.contactMethodId)}>{commonJs.is_obj_exist(cases.contactMethod)}</td>
                                                                            <td title={commonJs.is_obj_exist(cases.createdBy)+commonJs.is_obj_exist(cases.createdAt)}>
                                                                                <div className="ext-source-tip word-break">
                                                                                    {commonJs.is_obj_exist(cases.createdBy)} <br/>{commonJs.is_obj_exist(cases.createdAt)}
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                        <tr className="border-bottom">
                                                                            <td colSpan="4" className="short-border-td">
                                                                                <div className="short-border"></div>
                                                                                <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(cases.detail)}>{commonJs.is_obj_exist(cases.detail)}</p>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                }):<tr><td colSpan="4" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                            }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                    }):""
                }
                {/*公司搜索*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="Cpy" onClick={this.getMsg.bind(this,"Cpy")}>
                        公司搜索
                        <i className="right bar-tit-toggle bar-tit-toggle-down" data-type="Cpy" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table mt5 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                        <tbody>
                            <tr>
                                <th width="15%">沟通方式</th>
                                <th width="10%">状态</th>
                                <th width="20%">处理状态</th>
                                <th width="20%">处理原因</th>
                                <th width="15%">审核结论</th>
                                <th width="20%"></th>
                            </tr>
                            {
                                (CpyRecordsInfo && CpyRecordsInfo.length>0) ? CpyRecordsInfo.map((repy,index)=>{
                                    return <tr key={index}>
                                        <td colSpan="6" className="no-padding-left">
                                        <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                            <tbody>
                                                <tr>
                                                    <td width="15%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.beforeQueueStatus)}>{commonJs.is_obj_exist(repy.beforeQueueStatus)}</td>
                                                    <td width="20%" title={commonJs.is_obj_exist(repy.afterQueueStatus)}>{commonJs.is_obj_exist(repy.afterQueueStatus)}</td>
                                                    <td width="20%" title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                                    <td width="15%" title={commonJs.is_obj_exist(repy.checkResult)}>{commonJs.is_obj_exist(repy.checkResult)}</td>
                                                    <td width="20%">
                                                        <div className="ext-source-tip word-break" title={commonJs.is_obj_exist(repy.createdBy)+commonJs.is_obj_exist(repy.createdAt)}>
                                                            {commonJs.is_obj_exist(repy.createdBy)} <br/>{commonJs.is_obj_exist(repy.createdAt)}
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="6" className="short-border-td">
                                                        <div className="short-border"></div>
                                                        <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        </td>
                                    </tr>
                                    }):<tr><td colSpan="6" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                        </tbody>
                    </table>
                    </div>
                </div>
                {/*OCR*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="OCR" onClick={this.getMsg.bind(this,"OCR")}>
                        OCR
                        <i className="right bar-tit-toggle bar-tit-toggle-down" data-type="OCR" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table mt5 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                        <tbody>
                            <tr>
                                <th width="20%">沟通方式</th>
                                <th width="15%">状态</th>
                                <th width="20%">处理状态</th>
                                <th width="20%">处理原因</th>
                                <th></th>
                            </tr>
                            {
                                (OcrRecordsInfo && OcrRecordsInfo.length>0) ? OcrRecordsInfo.map((repy,i)=>{
                                        return <tr key={i}>
                                                    <td colSpan="5" className="no-padding-left">
                                                        <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                            <tbody>
                                                            <tr>
                                                                <td width="20%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                                <td width="15%" title={commonJs.is_obj_exist(repy.beforeQueueStatus)}>{commonJs.is_obj_exist(repy.beforeQueueStatus)}</td>
                                                                <td width="20%" title={commonJs.is_obj_exist(repy.afterQueueStatus)}>{commonJs.is_obj_exist(repy.afterQueueStatus)}</td>
                                                                <td width="20%" title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                                                <td>
                                                                    <div className="ext-source-tip word-break" title={commonJs.is_obj_exist(repy.createdBy )+commonJs.is_obj_exist(repy.createdAt)}>
                                                                        {commonJs.is_obj_exist(repy.createdBy )}<br/>{commonJs.is_obj_exist(repy.createdAt)}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="5" className="short-border-td">
                                                                    <div className="short-border"></div>
                                                                    <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                }): <tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                        </tbody>
                    </table>
                    </div>
                </div>
                {/*Approve*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="Approve" onClick={this.getMsg.bind(this,"Approve")}>
                        Approve
                        <i className="right bar-tit-toggle bar-tit-toggle-down" data-type="Approve" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                    <table className="pt-table mt10 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                        <tbody>
                            <tr>
                                <th width="10%">沟通方式</th>
                                <th width="10%">状态</th>
                                <th width="10%">处理状态</th>
                                <th width="10%">撤回原因</th>
                                <th width="10%">打折类型</th>
                                <th width="10%">打折率</th>
                                <th width="10%">期数</th>
                                <th>放款金额</th>
                            </tr>
                            {
                                (ApproveRecordsInfo && ApproveRecordsInfo.length>0) ? ApproveRecordsInfo.map((repy,i)=>{
                                    return <tr key={i}>
                                        <td colSpan="8" className="no-padding-left">
                                            <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                <tbody>
                                                <tr>
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.beforeApproveStatus)}>{commonJs.is_obj_exist(repy.beforeApproveStatus)}</td>
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.afterApproveStatus)}>{commonJs.is_obj_exist(repy.afterApproveStatus)}</td>
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.discountType)}>{commonJs.is_obj_exist(repy.discountType)}</td>
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.discount)}>{commonJs.is_obj_exist(repy.discount)}</td>
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.installments)}>{commonJs.is_obj_exist(repy.installments)}</td>
                                                    <td title={commonJs.is_obj_exist(repy.loanAmount)}>{commonJs.is_obj_exist(repy.loanAmount)}</td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="8" className="short-border-td">
                                                        <div className="short-border"></div>
                                                        <p className="left pt5 pb5 word-break pre-wrap" style={{"width":"65%"}} title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                                        <div className="left ext-source-tip word-break" style={{"width":"30%","marginTop":"5px","paddingRight":"0"}} title={commonJs.is_obj_exist(repy.createdBy)+commonJs.is_obj_exist(repy.createdAt)}>
                                                            {commonJs.is_obj_exist(repy.createdBy)} <br/>{commonJs.is_obj_exist(repy.createdAt)}
                                                        </div>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    }): <tr><td colSpan="8" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                        </tbody>
                    </table>
                    </div>
                </div>
                {/*Fraud*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="Fraud" onClick={this.getMsg.bind(this,"Fraud")}>
                        Fraud
                        <i className="right bar-tit-toggle bar-tit-toggle-down" data-type="Fraud" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table mt5 replay-list" cellPadding={0} cellSpacing={0} frameBorder={0}>
                            <tbody>
                            <tr>
                                <th width="20%">沟通方式</th>
                                <th width="20%">状态</th>
                                <th width="20%">处理状态</th>
                                <th width="20%">撤回原因</th>
                                <th></th>
                            </tr>
                            {
                                (FraudRecordsInfo && FraudRecordsInfo.length>0) ?FraudRecordsInfo.map((repy,i)=>{
                                        return <tr key={i}>
                                            <td colSpan="5" className="no-padding-left">
                                                <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                    <tbody>
                                                    <tr>
                                                        <td width="20%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                        <td width="20%" title={commonJs.is_obj_exist(repy.beforeFraudStatus)}>{commonJs.is_obj_exist(repy.beforeFraudStatus)}</td>
                                                        <td width="20%" title={commonJs.is_obj_exist(repy.afterFraudStatus)}>{commonJs.is_obj_exist(repy.afterFraudStatus)}</td>
                                                        <td width="20%" title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                                        <td title={commonJs.is_obj_exist(repy.loanAmount)}>{commonJs.is_obj_exist(repy.loanAmount)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="5" className="short-border-td">
                                                            <div className="short-border"></div>
                                                            <p className="left pt5 pb5 word-break pre-wrap" style={{"width":"65%"}} title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                                            <div className="left ext-source-tip word-break" style={{"width":"30%","marginTop":"5px","paddingRight":"0"}} title={commonJs.is_obj_exist(repy.createdBy)+commonJs.is_obj_exist(repy.createdAt)}>
                                                                {commonJs.is_obj_exist(repy.createdBy)} <br/>{commonJs.is_obj_exist(repy.createdAt)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        }): <tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                {/*reminder*/}
                <div className="toggle-box" data-btn-rule="QUEUERECORD:REMIND">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="Reminder" onClick={this.getMsg.bind(this,"Reminder")}>
                        Reminder
                        <i className="right bar-tit-toggle bar-tit-toggle-down" data-type="Reminder" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table mt5 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                        <tbody>
                            <tr>
                                <th width="30%">沟通方式</th>
                                <th width="30%">状态</th>
                                <th width="30%">处理状态</th>
                            </tr>
                            {
                                (ReminderRecordsInfo && ReminderRecordsInfo.length>0) ? ReminderRecordsInfo.map((repy,i)=>{
                                    return <tr key={i}>
                                        <td colSpan="3" className="no-padding-left">
                                            <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                <tbody>
                                                <tr>
                                                    <td width="30%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                    <td width="30%" title={commonJs.is_obj_exist(repy.beforeQueueStatus)}>{commonJs.is_obj_exist(repy.beforeQueueStatus)}</td>
                                                    <td width="30%" title={commonJs.is_obj_exist(repy.afterQueueStatus)}>{commonJs.is_obj_exist(repy.afterQueueStatus)}</td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="3" className="short-border-td">
                                                        <div className="short-border"></div>
                                                        <p className="left pt5 pb5 word-break pre-wrap" style={{"width":"65%"}} title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                                        <div className="left ext-source-tip word-break" style={{"width":"30%","marginTop":"5px","paddingRight":"0"}} title={commonJs.is_obj_exist(repy.createdBy)+commonJs.is_obj_exist(repy.createdAt)}>
                                                            {commonJs.is_obj_exist(repy.createdBy)} <br/>{commonJs.is_obj_exist(repy.createdAt)}
                                                        </div>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    }): <tr><td colSpan="3" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                        </tbody>
                    </table>
                    </div>
                </div>
                {/*collection*/}
                <div className="toggle-box" data-btn-rule="QUEUERECORD:COLLECTION">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="Collection" onClick={this.getMsg.bind(this,"Collection")}>
                        Collection
                        <i className="right bar-tit-toggle bar-tit-toggle-down" data-type="Collection" ></i>
                    </h2>
                    <div className="bar mt5 coll-edit-div hidden">
                    {
                        (CollectionRecordsInfo && CollectionRecordsInfo.length>0) ? CollectionRecordsInfo.map((repy,i)=>{
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
                            }): <table className="pt-table mt5 commu-tab"><tbody><tr><td className="gray-tip-font">暂未查到相关数据...</td></tr></tbody></table>
                        }
                    </div>
                </div>
                {/*服务费*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="Collection" onClick={this.getMsg.bind(this,"charge")}>
                        服务费
                        <i className="right bar-tit-toggle bar-tit-toggle-down" data-type="Collection" ></i>
                    </h2>
                    <div className="bar mt5 coll-edit-div hidden">
                        {
                            (upfrontFeeRecordsInfoDTO_server && upfrontFeeRecordsInfoDTO_server.length>0) ? upfrontFeeRecordsInfoDTO_server.map((repy,i)=>{
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
                                return <div key={i} className="border-bottom pb5">
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
                            }): <table className="pt-table mt5 commu-tab"><tbody><tr><td className="gray-tip-font">暂未查到相关数据...</td></tr></tbody></table>
                        }
                    </div>
                </div>
                {/*AST*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="Collection" onClick={this.getMsg.bind(this,"AST")}>
                        AST QUEUE
                        <i className="right bar-tit-toggle bar-tit-toggle-down" data-type="Collection" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table mt10 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                            <tbody>
                                <tr>
                                    <th width="15%">沟通方式</th>
                                    <th width="20%">状态</th>
                                    <th width="20%">处理状态</th>
                                    <th width="20%">处理原因</th>
                                    <th width="25%"></th>
                                </tr>
                                {
                                    (astInfo && astInfo.length>0) ? astInfo.map((repy,index)=>{
                                        return <tr key={index}>
                                            <td colSpan="5" className="no-padding-left">
                                                <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                    <tbody>
                                                        <tr>
                                                            <td width="15%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                            <td width="20%" title={commonJs.is_obj_exist(repy.beforeQueueStatus)}>{commonJs.is_obj_exist(repy.beforeQueueStatus)}</td>
                                                            <td width="20%" title={commonJs.is_obj_exist(repy.afterQueueStatus)+commonJs.is_obj_exist(repy.followTime)}>
                                                                {commonJs.is_obj_exist(repy.afterQueueStatus)}
                                                                <br />
                                                                {commonJs.is_obj_exist(repy.followTime)}
                                                            </td>
                                                            <td width="20%" title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                                            <td width="25%">
                                                                <div className="ext-source-tip word-break" title={commonJs.is_obj_exist(repy.createdBy)+commonJs.is_obj_exist(repy.createdAt)}>
                                                                    {commonJs.is_obj_exist(repy.createdBy)} <br/>{commonJs.is_obj_exist(repy.createdAt)}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="5" className="short-border-td">
                                                                <div className="short-border"></div>
                                                                <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/*AST_insurance*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="Collection" onClick={this.getMsg.bind(this,"AST_insurance")}>
                        AST_insurance QUEUE
                        <i className="right bar-tit-toggle bar-tit-toggle-down" data-type="Collection" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table mt10 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                            <tbody>
                                <tr>
                                    <th width="15%">沟通方式</th>
                                    <th width="20%">状态</th>
                                    <th width="20%">处理状态</th>
                                    <th width="20%">处理原因</th>
                                    <th width="25%"></th>
                                </tr>
                                {
                                    (astInfo_insurance && astInfo_insurance.length>0) ? astInfo_insurance.map((repy,index)=>{
                                        return <tr key={index}>
                                            <td colSpan="5" className="no-padding-left">
                                                <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                    <tbody>
                                                        <tr>
                                                            <td width="15%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                            <td width="20%" title={commonJs.is_obj_exist(repy.beforeQueueStatus)}>{commonJs.is_obj_exist(repy.beforeQueueStatus)}</td>
                                                            <td width="20%" title={commonJs.is_obj_exist(repy.afterQueueStatus)+commonJs.is_obj_exist(repy.followTime)}>
                                                                {commonJs.is_obj_exist(repy.afterQueueStatus)}
                                                                <br />
                                                                {commonJs.is_obj_exist(repy.followTime)}
                                                            </td>
                                                            <td width="20%" title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                                            <td width="25%">
                                                                <div className="ext-source-tip word-break" title={commonJs.is_obj_exist(repy.createdBy)+commonJs.is_obj_exist(repy.createdAt)}>
                                                                    {commonJs.is_obj_exist(repy.createdBy)} <br/>{commonJs.is_obj_exist(repy.createdAt)}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="5" className="short-border-td">
                                                                <div className="short-border"></div>
                                                                <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}
;

export default Case;