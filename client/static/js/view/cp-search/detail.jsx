// 人工审核-爱尚
import React from 'react';
import $ from 'jquery';
import axios from '../../axios';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import BaseUserInfoBar from '../cp-module/baseUserInfoBar';  //处理条数 
import RepayInfoBar from '../cp-module/repayInfoBar';  //贷款信息展示
import DealAvisitRecordList from '../cp-module/dealAvisitRecordList';//回访数据处理record记录
import RecordList from '../cp-module/recordList';  //record展示
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import RepaymentMsg29A from '../cp-module/repaymentMsg29A'; //29A 增加还款信息表现
// 左侧页面
import UserMsgTerrace from '../cp-module/userMsgTerrace';//详情--平台
import UserMsgThird from '../cp-module/userMsgThird';//详情--第三方
import FileTerrace from './fileTerrace';  //=>附件-平台
import FileThird from './fileThird';  //=>附件-第三方
import FileReconsider from './fileReconsider';  //=>复议资料-小雨花

import ShopMsgXYH from '../cp-module/shopMsgXYH';//详情-小雨花
import FileXYH from './fileXYH';  //=>附件-小雨花
import OrderInfo from './orderInfo';  //=>订单信息-小雨花 
import RiskInfo from './riskInfo';  //=>风控信息-小雨花   
import OperateList from './operateList';  //=>操作记录-小雨花
import HistoryOrder from './historyOrder';  //=>历史订单-小雨花
import Case from './case';  //=>案例-小雨花
import GuaranteeRapayList from '../../view/module/guaranteeRapayList'; //担保费还款计划table展示
import DeductionRecordsList from '../../view/module/deductionRecordsList'; //担保费还款计划table展示

import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class Detail extends React.Component{
    constructor(props){
        super(props);
        this.store=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.commonStore=this.props.allStore.CommonStore;
        this.state={
            // lef_page:(pathQuery.platformFlag=="TH")?<UserMsgThird />:<UserMsgTerrace />,  //左边页面组件
            lef_page:"",  //左边页面组件
            deductionRecordsList:{},
            pathQuery:this.commonStore.rowData
        }
    }
    @action componentDidMount(){
        // 风控信息关联数据跳转详情
        let riskInfoCurrentLoanNo=this.props.location.query.riskInfoCurrentLoanNo;
        if(riskInfoCurrentLoanNo){
            this.search(riskInfoCurrentLoanNo);
            this.loadPageMsg();
        }else{
            //正常加载
            let pathQuery=cpCommonJs.opinitionObj(this.commonStore.rowData);
            if(Object.keys(pathQuery).length<=0){   //页面刷新时，this.commonStore.rowData数据为空，页面从url中获取
                pathQuery=this.props.location.query;
            }
            this.store.orderNo=pathQuery.orderNo;
            this.store.loanNo=pathQuery.loanNumber;
            this.store.cooperationFlag=pathQuery.cooperationFlag;
            this.store.fromFlag=pathQuery.platformFlag;
            this.store.platformFlag=pathQuery.platformFlag;
            this.store.customerId=pathQuery.customerId;
            this.commonStore.rowData=pathQuery;
            commonJs.reloadRules();
            this.loadPageMsg();
            this.setState({
                pathQuery:pathQuery
            })
        }
    }
    @action UNSAFE_componentWillReceiveProps(nextProps){
        //风控信息 关联数据合同号点击展示对应详情
        // this.store.restoreUserInfo();
        let riskInfoCurrentLoanNo=nextProps.location.query.riskInfoCurrentLoanNo;
        if(riskInfoCurrentLoanNo){
            this.search(riskInfoCurrentLoanNo);
            this.loadPageMsg();
        }
    }

    //风控信息合同号跳转到详情
    loadPageMsg=()=>{
        if(!this.store.platformFlag){
            this.changeLeftCP(0);
            return;
        }
        this.store.getIdentityInfo(this,true);  
        let get_persenChecRecordkDTO=this.getQueueCase('/node/record/manualQueueRecord');  //人工审核案列记录
        let persenChecRecordkDTO=cpCommonJs.opinitionArray(get_persenChecRecordkDTO.checkQueueRecordInfoDTOS);
        let get_fraudRecordDTO=this.getQueueCase('/node/record/fraudQueueRecord');  //fraud案列记录
        let fraudRecordDTO=cpCommonJs.opinitionArray(get_fraudRecordDTO.fraudRecordQueueInfoDTOS);
        let avisitRecord=this.getQueueCase('/node/record/reVisitQueueRecord').queueRecordInfoDTOS;  //回访案列记录
        this.setState({
            persenChecRecordkDTO:persenChecRecordkDTO,
            fraudRecordDTO:fraudRecordDTO,
            avisitRecord:avisitRecord,
        })
    }
    // 调用搜索搜索页接口获取 customerid等信息
    search=(loanNo)=>{
        let that=this;
        $.ajax({
            type:"post", 
            url:"/node/search/info", 
            async:false,
            dataType: "JSON", 
            data:{loanNo:loanNo}, 
            success:function(res){
                let _data=res.data;
                let _checkQueueInfoDTOS=cpCommonJs.opinitionArray(_data.checkQueueInfoDTOS); //搜索结果list
                if(!commonJs.ajaxGetCode(res) || _checkQueueInfoDTOS.length<=0){
                    that.commonStore.rowData={};
                    that.store.loanNo='';
                    that.store.platformFlag='';
                    that.setState({
                        pathQuery:{}
                    })
                   return;
                }
                let _checkQueueInfoDTOS_0=cpCommonJs.opinitionObj(_checkQueueInfoDTOS[0]);;
                that.commonStore.rowData=_checkQueueInfoDTOS_0;
                that.store.loanNo=_checkQueueInfoDTOS_0.loanNumber;
                that.store.platformFlag=_checkQueueInfoDTOS_0.platformFlag;
                that.setState({
                    pathQuery:_checkQueueInfoDTOS_0
                })
           }
       })
    }
    /**
     * 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     */
    changeLeftCP(index){
        var leftHtml = this.getLeftHtml(index);
        this.setState({
            lef_page:leftHtml
        },()=>{
            $(".Csearch-left-page li").removeClass("on");
            $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
        })
    }

    /**
     * 获取左侧组件内容
     * @param index
     * @returns {string}
     */
    getLeftHtml(index){
        let left_page="";
        let platformFlag=cpCommonJs.opinitionObj(this.commonStore.rowData).platformFlag;//接口返回的平台或第三方标识
        this.userinfoStore = this.store;
        if(!platformFlag){
            platformFlag="default"
        }
        let pageParm={
            userPage:{
                "TH":<UserMsgThird />,
                "PF":<UserMsgTerrace />,
                "XYH":<ShopMsgXYH />,
                "default":<UserMsgTerrace />
            },
            filePage:{
                "TH":<FileThird />,
                "PF":<FileTerrace />,
                "XYH":<FileXYH />,
                "default":<FileTerrace />
            },
            Guarantee:{
                "PF":<div><GuaranteeRapayList that={this} pageFlag="CP2F" getGuranteeList={this.getGuranteeList}  guaranteeFeePayInfoList={this.state.guaranteeFeePayInfoList} /><DeductionRecordsList 
                            pageFlag="CP2F"
                            that={this} 
                    /></div>
            }
        };
        switch (index){
            case 0:
                left_page=pageParm.userPage[platformFlag];
                break;
            case 1:
                left_page=pageParm.filePage[platformFlag];
                break;
            case 5:
                left_page=pageParm.Guarantee[platformFlag];
                break;
            case 'XYH_1':
                left_page=<OrderInfo/>;
                break;
            case 'XYH_2':
                left_page=<FileXYH />;
                break;
            case 'XYH_3':
                left_page=<RiskInfo />;
                break;
            case 'XYH_4':
                left_page=<OperateList tempType='checkQueue' />;
                break;
            case 'XYH_5':
                left_page=<HistoryOrder />;
                break;
            case 'XYH_6':
                left_page=<FileReconsider />;
                break;
            case '6':
                left_page=<Case />;
                break;
                
        }
        return left_page;
    }

    //获取案列展示-公共请求方法
    getQueueCase(_url){
        let that=this;
        let pathQuery=cpCommonJs.opinitionObj(this.commonStore.rowData);
        let caseRecordInfo=[];
        $.ajax({
            type:"get", 
            url:_url, 
            async:false,
            dataType: "JSON", 
            data:{
                loanNumber:pathQuery.loanNumber,
                orderNo:pathQuery.orderNo,
                type:pathQuery.cooperationFlag
            },
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    caseRecordInfo=[];
                }
                caseRecordInfo=res.data;
           }
       })
       return caseRecordInfo;
    }
    //显示还款列表弹窗
    showRepayPop(){
        let pathQuery=this.commonStore.rowData;
        let loanNo=pathQuery.loanNumber;
        let orderNo=pathQuery.orderNo;
        let cooperationFlag=pathQuery.cooperationFlag;
        let fromFlag=pathQuery.platformFlag;
        window.open("/cp-repaymentList?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag);
    }
    //扣款列表页面
    showWithholdPop(){
        let pathQuery=this.commonStore.rowData;
        let loanNo=pathQuery.loanNumber;
        let orderNo=pathQuery.orderNo;
        let cooperationFlag=pathQuery.cooperationFlag;
        let fromFlag=pathQuery.platformFlag;
        window.open("/cp-withholdList?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag);
    }
    //历史借款记录页面
    historyBorrowPop(){
        let pathQuery=this.commonStore.rowData;
        let loanNo=pathQuery.loanNumber;
        let orderNo=pathQuery.orderNo;
        let cooperationFlag=pathQuery.cooperationFlag;
        let fromFlag=pathQuery.platformFlag;
        window.open("/cp-historyBorrow?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag);
    }
    render() {
        let persenChecRecordkDTO=cpCommonJs.opinitionArray(this.state.persenChecRecordkDTO);
        let fraudRecordDTO=cpCommonJs.opinitionArray(this.state.fraudRecordDTO);
        let {pathQuery={}}=this.state;
        let platformFlag=cpCommonJs.opinitionObj(pathQuery).platformFlag;
        let cooperationFlag=cpCommonJs.opinitionObj(pathQuery).cooperationFlag;
        
        let XYH_IdentityInfo=cpCommonJs.opinitionObj(this.store.XYH_IdentityInfo);
        let reconsideration=cpCommonJs.opinitionObj(XYH_IdentityInfo.reconsideration);
        return (
            <div className="content" id="content">
                <RepayInfoBar platformFlag={platformFlag} cooperationFlag={cooperationFlag} />  {/* 贷款信息条展示 */}
                <div className="mt20 clearfix">
                    <div className="left cont-left content-toggle  relative">
                        {/* tit-shadow */}
                        <div className="bar title-box Csearch-left-page clearfix">
                            <ul className="left ml10 nav mt5">
                                <li className="on" data-id="0" onClick={this.changeLeftCP.bind(this,0,null)}>
                                    {platformFlag!='XYH'?'详情':'客户信息'}
                                </li>
                                {platformFlag!='XYH' ? <li data-id="1" onClick={this.changeLeftCP.bind(this,1,null)} id='CPFILE'>文件</li>:''}
                                {platformFlag!='XYH' ? <li data-id="2" onClick={this.showRepayPop.bind(this)} id='CPREPAYMENTLIST'>还款列表</li>:''}
                                {platformFlag!='XYH' ? <li data-id="3" onClick={this.showWithholdPop.bind(this)} data-btn-rule="identity:getDebitingInfo" id='CPWITHHOLDLIST'>扣款列表</li>:''}
                                {platformFlag!='XYH' ? <li data-id="4" onClick={this.historyBorrowPop.bind(this)} id='CPHISTORYBOWN'>历史借款记录</li>:''}
                                {platformFlag!=='XYH'&&cooperationFlag=='2F'? <li data-id="5" onClick={this.changeLeftCP.bind(this,5,null)} id='CPFILE'>担保费</li>:''}
                                {platformFlag=='XYH' ? <li data-id="XYH_1" onClick={this.changeLeftCP.bind(this,'XYH_1',null)} id='CPORDERINFO'>订单信息</li>:''}
                                {platformFlag=='XYH' ? <li data-id="XYH_2" onClick={this.changeLeftCP.bind(this,'XYH_2',null)} id='CPINFOMATION'>资料信息</li>:''}
                                {platformFlag=='XYH' ? <li data-id="XYH_3" onClick={this.changeLeftCP.bind(this,'XYH_3',null)} id='CPPNEUMATIC'>风控信息</li>:''}
                                {platformFlag=='XYH' ? <li data-id="XYH_4" onClick={this.changeLeftCP.bind(this,'XYH_4',null)} id='CPOPRATELIST'>操作记录</li>:''}
                                {platformFlag=='XYH' ? <li data-id="XYH_5" onClick={this.changeLeftCP.bind(this,'XYH_5',null)} id='CPHISTORYORDER'>历史订单</li>:''}
                                {(platformFlag=='XYH'&&reconsideration.reconsiderationReason) ? <li data-id="XYH_6" id='CPRECONSIDERINFO' onClick={this.changeLeftCP.bind(this,'XYH_6',null)}>复议资料</li>:''}
                                <li data-id="6" onClick={this.changeLeftCP.bind(this,'6',null)} id='CPCASERECORD' data-btn-rule="RULE:XYH:CASE:ADD">案例记录</li>
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={cpCommonJs.all_content_toggle.bind(this)}></i> */}
                            
                        </div>
                        <div className="mt10">
                            {this.state.lef_page}
                        </div>
                    </div>
                    <div className="right cont-right content-toggle">
                        <BaseUserInfoBar _customerId={pathQuery.customerId} _orderNo={pathQuery.orderNo}  _loanNo={pathQuery.loanNumber} _stuCheck={pathQuery.stuCheck} />  {/*用户信息条展示-蓝色条*/}
                        {/* 29A 增加还款信息表现 */}
                        {
                            pathQuery.cooperationFlag=="29A"?
                            <div className="mt10"><RepaymentMsg29A /></div>:""
                        }
                        {/* 人工审核 start */}
                        <div className="toggle-box mt10">
                            <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                                人工审核
                                <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                            </h2>
                            <div className="hidden">
                                <RecordList data={persenChecRecordkDTO} />
                            </div>
                        </div>
                        {/* 人工审核 end */}
                        {/* Fraudqueue start */}
                        <div className="toggle-box">
                            <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                                Fraud
                                <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                            </h2>
                            <div className="hidden">
                                <RecordList data={fraudRecordDTO} />
                            </div>
                        </div>
                        {/* Fraudqueue end */}
                        
                        {/* dealavisit Record start */}
                        <div className="toggle-box">
                            <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                                回访Record
                                <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                            </h2>
                            <div className="hidden">
                                <DealAvisitRecordList productNo={commonJs.is_obj_exist(this.store.cooperationFlag)} data={this.state.avisitRecord} />
                            </div>
                        </div>
                        
                        {/* dealavisit Record end */}
                    </div>
                </div>
            </div>
        )
    }
};

export default Detail;  //ES6语法，导出模块