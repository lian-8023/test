//贷款信息条展示
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { observable, action, computed ,configure,runInAction} from "mobx";
import CpCommonJs from '../../source/cp-portal/common';
let cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react"; 

@inject('allStore') @observer
class RepayInfoBar extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;  //用户详情
        this.state={
            platformFlag:this.props.platformFlag,  //数据来源标识 TH 第三方 PF 平台
            cooperationFlag:this.props.cooperationFlag  //合作方标识
        }
    }
    componentDidMount(){
        this.domCss(this.props.cooperationFlag);
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            platformFlag:nextProps.platformFlag,
            cooperationFlag:nextProps.cooperationFlag
        },()=>{
            this.domCss(nextProps.cooperationFlag);
        })
    }
    // 根据同产品号页面展示不同，样式有变化
    domCss(cooperationFlag){
        if(cooperationFlag&&cooperationFlag=="3E"){
            $(".cmenu").css({
                "column-count": 8,
                "-webkit-column-count": 8,
                "-moz-column-count": 8,
                "-ms-column-count": 8,
                "-o-column-count": 8,
            })
        }else{
            $(".cmenu").css({
                "column-count": 4,
                "-webkit-column-count": 4,
                "-moz-column-count": 4,
                "-ms-column-count": 4,
                "-o-column-count": 4,
            })
        }
    }
    render() {
        let dataObj={};


        let platformFlag=this.props.platformFlag;
        let cooperationFlag=this.props.cooperationFlag;
        let loanInfoDTO={};
        if(platformFlag=="TH"){
            let thirdIdentityResponseOldDTO=cpCommonJs.opinitionObj(this.userinfoStore.thirdIdentityResponseOldDTO); 
            loanInfoDTO=cpCommonJs.opinitionObj(thirdIdentityResponseOldDTO.loanMap); //第三方贷款信息-顶部
            dataObj.loanAmount=loanInfoDTO['贷款金额'];
            dataObj.mouthRepay=loanInfoDTO['每期还款'];
            dataObj.loanPeriods=loanInfoDTO['贷款期数'];
            dataObj.firstMoney=loanInfoDTO['首付金额'];

            dataObj.netOnlineTime=loanInfoDTO['在网时长'];
            dataObj.operator=loanInfoDTO['运营商'];
            dataObj.userArea=loanInfoDTO['用户区域 '];
            dataObj.custormerType=loanInfoDTO['客户类型  '];
        }else if(platformFlag=="PF"){
            let platforIdentityInfo=cpCommonJs.opinitionObj(this.userinfoStore.platforIdentityInfo); 
            loanInfoDTO=cpCommonJs.opinitionObj(platforIdentityInfo.platformLoanInfoDTO); //平台贷款信息-顶部
            dataObj.loanAmount=loanInfoDTO.loanLoanAmount;
            dataObj.mouthRepay="";
            dataObj.loanPeriods=loanInfoDTO.loanInstallments;
            dataObj.firstMoney=loanInfoDTO.loanDownPayment;
            dataObj.repaymentMethod=loanInfoDTO.repaymentMethod;
        }else if(platformFlag=="XYH"){
            let XYH_IdentityInfo=cpCommonJs.opinitionObj(this.userinfoStore.XYH_IdentityInfo); 
            let paymentPlanDetailDTOList=cpCommonJs.opinitionArray(XYH_IdentityInfo.paymentPlanDetailDTOList);  //还款计划信息
            loanInfoDTO=cpCommonJs.opinitionObj(XYH_IdentityInfo.loanInfo);  //贷款信息
            dataObj.loanAmount=loanInfoDTO.applyAmount;
            dataObj.mouthRepay=paymentPlanDetailDTOList[0]?paymentPlanDetailDTOList[0].amount:"";
            dataObj.loanPeriods=loanInfoDTO.period;
            dataObj.repaymentMethod=loanInfoDTO.repaymentMethod;    
        }
        return (
            <div className="clearfix cmenu">
                <div className="left cmenu-bar">
                    <i className="cmenu-icon left block mr20 dkje"><i></i></i>
                    <div className="cmenu-rig left">
                        <b className="cmenu-t">贷款金额</b>
                        <p className="cmenu-money dkje-mey" title={commonJs.is_obj_exist(dataObj.loanAmount)}>{commonJs.is_obj_exist(dataObj.loanAmount)}</p>
                    </div>
                </div>
                <div className="left cmenu-bar">
                    <i className="cmenu-icon left block mr20 mqhk"><i></i> </i>
                    <div className="cmenu-rig left">
                        <b className="cmenu-t">每期还款</b>
                        <p className="cmenu-money mqhk-mey" title={commonJs.is_obj_exist(dataObj.mouthRepay)}>{commonJs.is_obj_exist(dataObj.mouthRepay)}</p>
                    </div>
                </div>
                <div className="left cmenu-bar">
                    <i className="cmenu-icon left block mr20 dkqs"><i></i> </i>
                    <div className="cmenu-rig left">
                        <b className="cmenu-t">贷款期数</b>
                        <p className="cmenu-money dkqs-mey" title={commonJs.is_obj_exist(dataObj.loanPeriods)}>{commonJs.is_obj_exist(dataObj.loanPeriods)}</p>
                    </div>
                </div>
                {
                    platformFlag=="XYH"?"":
                    <div className="left cmenu-bar">
                        <i className="cmenu-icon left block mr20 sfje"><i></i> </i>
                        <div className="cmenu-rig left">
                            <b className="cmenu-t">首付金额</b>
                            <p className="cmenu-money sfje-mey" title={commonJs.is_obj_exist(dataObj.firstMoney)}>{commonJs.is_obj_exist(dataObj.firstMoney)}</p>
                        </div>
                    </div>
                }
                {
                    platformFlag=="XYH"?
                    <div className="left cmenu-bar">
                        <i className="cmenu-icon left block mr20 sfje"><i></i> </i>
                        <div className="cmenu-rig left">
                            <b className="cmenu-t">还款方式</b>
                            <p className="cmenu-money sfje-mey" title={commonJs.is_obj_exist(dataObj.repaymentMethod)}>{commonJs.is_obj_exist(dataObj.repaymentMethod)}</p>
                        </div>
                    </div>:""
                }

                {
                    cooperationFlag=="3E"?
                    <div className="left cmenu-bar">
                        <i className="cmenu-icon left block mr20 zwsc"><i></i> </i>
                        <div className="cmenu-rig left">
                            <b className="cmenu-t">在网时长</b>
                            <p className="cmenu-money zwsc-mey" title={commonJs.is_obj_exist(dataObj.netOnlineTime)}>{commonJs.is_obj_exist(dataObj.netOnlineTime)}</p>
                        </div>
                    </div>:""
                }
                {
                    cooperationFlag=="3E"?
                    <div className="left cmenu-bar">
                        <i className="cmenu-icon left block mr20 yys"><i></i> </i>
                        <div className="cmenu-rig left">
                            <b className="cmenu-t">运营商</b>
                            <p className="cmenu-money yys-mey" title={commonJs.is_obj_exist(dataObj.operator)}>{commonJs.is_obj_exist(dataObj.operator)}</p>
                        </div>
                    </div>:""
                }
                {
                    cooperationFlag=="3E"?
                    <div className="left cmenu-bar">
                        <i className="cmenu-icon left block mr20 yyqy"><i></i> </i>
                        <div className="cmenu-rig left">
                            <b className="cmenu-t">用户区域</b>
                            <p className="cmenu-money yyqy-mey" title={commonJs.is_obj_exist(dataObj.userArea)}>{commonJs.is_obj_exist(dataObj.userArea)}</p>
                        </div>
                    </div>:""
                }
                {
                    cooperationFlag=="3E"?
                    <div className="left cmenu-bar">
                        <i className="cmenu-icon left block mr20 khlx"><i></i> </i>
                        <div className="cmenu-rig left">
                            <b className="cmenu-t">客户类型</b>
                            <p className="cmenu-money khlx-mey" title={commonJs.is_obj_exist(dataObj.custormerType)}>{commonJs.is_obj_exist(dataObj.custormerType)}</p>
                        </div>
                    </div>:""
                }
                
            </div>
    );
    }
};


export default RepayInfoBar;