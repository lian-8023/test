// 根据不同合作方显示不同板块body（label组合成的body,2A嵌接合作方）
/**
 * 配置是否显示模块(参照对应列表)
 * 公司搜索 - CpySearch
 * Fraud - Fraud
 * Approve - Approve
 * Reminder - Reminder
 * Collection - Collection
 */
import React from 'react';
import $ from 'jquery';

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import ChangeLabel2A from '../../source/common/changeLabel2A';
let changeLabel2A=new ChangeLabel2A;
import ChangeLabelCP from '../../source/common/changeLabelCP';
let changeLabelCP=new ChangeLabelCP;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class LabelBody extends React.Component{
    constructor(props){
        super(props);
        this.userInfoCP=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息  
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2A PORTAL用户详情-UserMsg组件信息 
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.state={
            params_rigPage:this.props.rigPage,  //右侧页面对应的路由值
        }
    }
    
    componentDidMount(){
        
        commonJs.reloadRules();
    }
    @action UNSAFE_componentWillReceiveProps(nextProps){
        this.labelBoxStore.A2LeftComponent=nextProps.A2LeftComponent;  //2A portal-左侧页面需要显示的组件配置(统一驼峰命名)
        this.labelBoxStore.A2RightComponent=nextProps.A2RightComponent;  //2A portal-右侧页面需要显示的组件配置
        this.labelBoxStore.CPLeftComponent=nextProps.CPLeftComponent;  //cooperation portal-左侧页面需要显示的组件配置
        this.labelBoxStore.CPRightComponent=nextProps.CPRightComponent;  //cooperation portal-右侧页面需要显示的组件配置
    }
    /**
     * 2A PORTAL切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    @action changeLeft2A(index){
        $(".Csearch-left-page li").removeClass("on");
        $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
        var lef_current_page=$(".Csearch-left-page .nav").find(".on").attr("data-id");
        changeLabel2A.changeLeft2A(parseInt(lef_current_page),this);
    }
    /** coopration 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    @action changeLeftCP(index,right_index){
        var leftHtml = changeLabelCP.getLeftHtml(parseInt(index),this);
        this.labelBoxStore.lef_page=leftHtml;
        $(".Csearch-left-page li").removeClass("on");
        $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
    }
    render() {
        let productNo=this.labelBoxStore.rowData.productNo;
        let platformFlag = this.labelBoxStore.rowData.platformFlag;
        let A2LeftComponent=cpCommonJs.opinitionArray(this.labelBoxStore.A2LeftComponent);  //2A portal-左侧页面需要显示的组件配置(统一驼峰命名)
        let A2RightComponent=cpCommonJs.opinitionArray(this.labelBoxStore.A2RightComponent);  //2A portal-右侧页面需要显示的组件配置
        let CPLeftComponent=cpCommonJs.opinitionArray(this.labelBoxStore.CPLeftComponent);  //cooperation portal-左侧页面需要显示的组件配置
        let CPRightComponent=cpCommonJs.opinitionArray(this.labelBoxStore.CPRightComponent);  //cooperation portal-右侧页面需要显示的组件配置
        return (
            <div>
                <div className="clearfix">
                    <div className="left cont-left content-toggle">
                        <div className="bar title-box Csearch-left-page clearfix relative">
                            {
                                productNo=="2A"?
                                // 2A PORTAL 左侧菜单 A2LeftComponent
                                <ul className="left ml10 nav mt5">
                                    {
                                        A2LeftComponent.includes('userMsg')?
                                        <li className="on" data-id="0" onClick={this.changeLeft2A.bind(this,0)} data-btn-rule="RULE:DETAIL:USERINFO:DIV" id='USERINFO'>账户详情</li>:""
                                    }
                                    {
                                        A2LeftComponent.includes('case')?
                                        <li data-id="1" onClick={this.changeLeft2A.bind(this,1)} data-btn-rule="RULE:DETAIL:CASE:TOP" id='CASE'>案例</li>:""
                                    }
                                    {
                                        A2LeftComponent.includes('packList')?
                                        <li data-id="2" onClick={this.changeLeft2A.bind(this,2)} data-btn-rule="RULE:DETAIL:LOAN:TOP" id='LOAN'>合同列表</li>:""
                                    }
                                    {
                                        A2LeftComponent.includes('file')?
                                        <li data-id="3" onClick={this.changeLeft2A.bind(this,3)} data-btn-rule="RULE:DETAIL:FILE:TOP" id='FILE'>附件</li>:""
                                    }
                                    {/* <li data-id="4" onClick={this.changeLeft2A.bind(this,4)} data-btn-rule="RULE:DETAIL:OCR:TOP">OCR</li> */}
                                    {
                                        A2LeftComponent.includes('phoneMsg')?
                                        <li data-id="5" onClick={this.changeLeft2A.bind(this,5)} data-btn-rule="RULE:JXL:OPERATION:DETAIL" id='OPERATION'>电话详情</li>:""
                                    }
                                    {
                                        A2LeftComponent.includes('operatorReport')?
                                        <li data-id="8" onClick={this.changeLeft2A.bind(this,8)} data-btn-rule="RULE:TREE:JXLSEARCH" id='JXLSEARCH'>运营商</li>:""
                                    }
                                    {
                                        A2LeftComponent.includes('operatorReportNew')?
                                        <li data-id="11" onClick={this.changeLeft2A.bind(this,11)} data-btn-rule="RULE:TREE:JXLSEARCH:NEW" id='JXLSEARCHNEW'>运营商新</li>:""
                                    }
                                    {
                                        A2LeftComponent.includes('messageList')?
                                        <li data-id="6" onClick={this.changeLeft2A.bind(this,6)} data-btn-rule="LOAN:RULE:MQUERY:CONTACTSLIST" id='CONTACTSLIST'>通讯录</li>:""
                                    }
                                    {
                                        A2LeftComponent.includes('callRecord')?
                                        <li data-id="7" onClick={this.changeLeft2A.bind(this,7)} data-btn-rule="RULE:TREE:MANUALCALL" id='MANUALCALL'>拨打记录</li>:""
                                    }
                                    {
                                        A2LeftComponent.includes('securityRcord')?
                                        <li data-id="9" onClick={this.changeLeft2A.bind(this,9)} data-btn-rule="RULE:DETAIL:MANAGER:SOCIAL:INFO" id='SOCIAL'>社保</li>:""
                                    }
                                    {
                                        A2LeftComponent.includes('bankList')?
                                        <li data-id="10" onClick={this.changeLeft2A.bind(this,10)} data-btn-rule="RULE:DETAIL:MANAGER:BANK:INFO" id='BANK'>银行</li>:""
                                    }
                                </ul>
                                :
                                // COOPERATION PORTAL 左侧菜单 CPLeftComponent
                                <ul className="left ml10 nav mt5">
                                    {
                                        CPLeftComponent.includes('userMsg')?
                                        <li className="on" data-id="0" onClick={this.changeLeftCP.bind(this,0,null)} id='CPUSERINFO'>详情</li>:""
                                    }
                                    {
                                        CPLeftComponent.includes('file')?
                                        <li data-id="1" onClick={this.changeLeftCP.bind(this,1,null)} id='CPFILE'>文件</li>:""
                                    }
                                    {
                                        CPLeftComponent.includes('repaymentList')&&platformFlag !== "SUPPLY"&&platformFlag !== "AG"?
                                        <li data-id="2" onClick={changeLabelCP.showRepayPop.bind(this,this)} id='CPREPAYMENTLIST'>还款列表</li>:""
                                    }
                                    {
                                        CPLeftComponent.includes('withholdList')?
                                        <li data-id="3" onClick={changeLabelCP.showWithholdPop.bind(this,this)} data-btn-rule="identity:getDebitingInfo" id='CPWITHHOLDLIST'>扣款列表</li>:""
                                    }
                                    {
                                        productNo=="2F"?
                                        <li data-id="4" onClick={this.changeLeftCP.bind(this,4,this)} id=''>借款详情</li>:""
                                    }
                                    {
                                        productNo=="2F"?
                                        <li data-id="5" onClick={this.changeLeftCP.bind(this,5,this)} id=''>担保费</li>:""
                                    }
                                </ul>
                            }
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={commonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        {this.labelBoxStore.lef_page}
                    </div>
                    <div className="right cont-right content-toggle">
                        <div className="bar title-box Csearch-right-page clearfix relative">
                            {
                                productNo=="2A"?
                                // 2A PORTAL 右侧菜单 A2RightComponent
                                <ul className="left ml10 mt5 nav">
                                    {
                                        A2RightComponent.includes('cpySearch')?
                                        <li data-id="0" onClick={changeLabel2A.changeRight2A.bind(this,0,this)} data-btn-rule="RULE:TREE:COMPANY" id='COMPANY'>公司搜索</li>
                                        :""
                                    }
                                    {/* <li data-id="3" onClick={changeLabel2A.changeRight2A.bind(this,3,this)} data-btn-rule="RULE:TREE:OCR">OCR</li> */}
                                    {
                                        A2RightComponent.includes('fraud')?
                                        <li data-id="6" onClick={changeLabel2A.changeRight2A.bind(this,6,this)} data-btn-rule="RULE:TREE:FRAUD" id='FRAUD'>Fraud</li>
                                        :""
                                    }
                                    {
                                        A2RightComponent.includes('approve')?
                                        <li data-id="5" onClick={changeLabel2A.changeRight2A.bind(this,5,this)} data-btn-rule="RULE:TREE:APPROVE" id='APPROVE'>Approve</li>
                                        :""
                                    }
                                    {
                                        A2RightComponent.includes('reminder')?
                                        <li data-id="7" onClick={changeLabel2A.changeRight2A.bind(this,7,this)} data-btn-rule="RULE:TREE:REMIND" id='REMIND'>Reminder</li>
                                        :""
                                    }
                                    {
                                        A2RightComponent.includes('collection')?
                                        <li data-id="8" onClick={changeLabel2A.changeRight2A.bind(this,8,this,"labelBox")} data-btn-rule="RULE:TREE:COLLECTION" id='COLLECTION'>Collection</li>
                                        :""
                                    }
                                    {
                                        A2RightComponent.includes('repaymentRemind')?
                                        <li data-id="21" onClick={changeLabel2A.changeRight2A.bind(this,21,this)} data-btn-rule="" id='REPAYMENTREMIND'>小雨花Reminder</li>
                                        :""
                                    }
                                    {
                                        A2RightComponent.includes('guarantee')?
                                        <li data-id="22" onClick={changeLabel2A.changeRight2A.bind(this,22,this)} data-btn-rule="" id='GUARANTEETAB'>担保费</li>
                                        :""
                                    }
                                    {/* =============== */}
                                    {
                                        A2RightComponent.includes('case')?
                                        <li data-id="9" onClick={changeLabel2A.changeRight2A.bind(this,9,this)} data-btn-rule="RULE:DETAIL:CASE:TOP" id='CASE'>案例</li>:""
                                    }
                                    {
                                        A2RightComponent.includes('packList')?
                                        <li data-id="10" onClick={changeLabel2A.changeRight2A.bind(this,10,this)} data-btn-rule="RULE:DETAIL:LOAN:TOP" id='LOAN'>合同列表</li>:""
                                    }
                                    {
                                        A2RightComponent.includes('file')?
                                        <li data-id="11" onClick={changeLabel2A.changeRight2A.bind(this,11,this)} data-btn-rule="RULE:DETAIL:FILE:TOP" id='FILE'>附件</li>:""
                                    }
                                    {
                                        A2RightComponent.includes('ocr')?
                                        <li data-id="12" onClick={changeLabel2A.changeRight2A.bind(this,12,this)} data-btn-rule="RULE:DETAIL:OCR:TOP" id='OCR'>OCR</li>:""
                                    }
                                    {
                                        A2RightComponent.includes('phoneMsg')?
                                        <li data-id="13" onClick={changeLabel2A.changeRight2A.bind(this,13,this)} data-btn-rule="RULE:JXL:OPERATION:DETAIL" id='OPERATION'>电话详情</li>:""
                                    }
                                    {
                                        A2RightComponent.includes('operatorReport')?
                                        <li data-id="14" onClick={changeLabel2A.changeRight2A.bind(this,14,this)} data-btn-rule="RULE:TREE:JXLSEARCH" id='JXLSEARCH'>运营商</li>:""
                                    }
                                    {
                                        A2RightComponent.includes('operatorReportNew')?
                                        <li data-id="15" onClick={changeLabel2A.changeRight2A.bind(this,15,this)} data-btn-rule="RULE:TREE:JXLSEARCH:NEW" id='JXLSEARCHNEW'>运营商新</li>:""
                                    }
                                    {
                                        A2RightComponent.includes('messageList')?
                                        <li data-id="16" onClick={changeLabel2A.changeRight2A.bind(this,16,this)} data-btn-rule="LOAN:RULE:MQUERY:CONTACTSLIST" id='CONTACTSLIST'>通讯录</li>:""
                                    }
                                    {
                                        A2RightComponent.includes('callRecord')?
                                        <li data-id="17" onClick={changeLabel2A.changeRight2A.bind(this,17,this)} data-btn-rule="RULE:TREE:MANUALCALL" id='MANUALCALL'>拨打记录</li>:""
                                    }
                                    {
                                        A2RightComponent.includes('SecurityRcord')?
                                        <li data-id="18" onClick={changeLabel2A.changeRight2A.bind(this,18,this)} data-btn-rule="RULE:DETAIL:MANAGER:SOCIAL:INFO" id='SOCIAL'>社保</li>:""
                                    }
                                    {
                                        A2RightComponent.includes('BankList')?
                                        <li data-id="19" onClick={changeLabel2A.changeRight2A.bind(this,19,this)} data-btn-rule="RULE:DETAIL:MANAGER:BANK:INFO" id='BANK'>银行</li>:""
                                    }
                                </ul>
                                :
                                // COOPERATION PORTAL 右侧菜单 CPRightComponent
                                <ul className="left ml10 mt5 nav">
                                    {
                                        CPRightComponent.includes('collection')?
                                        <li data-id="0" onClick={changeLabel2A.changeRight2A.bind(this,8,this,"labelBox")} data-btn-rule="RULE:TREE:COLLECTION" id='COLLECTION'>Collection</li>:""
                                    }
                                    {
                                        CPRightComponent.includes('file')?
                                        <li data-id="1" onClick={changeLabelCP.changeRightCP.bind(this,1,this)} id='CPFILE'>文件</li>
                                        :""
                                    }
                                    {
                                        CPRightComponent.includes('repaymentList')&&platformFlag !== "SUPPLY"&&platformFlag !== "AG"?
                                        <li data-id="2" onClick={changeLabelCP.showRepayPop.bind(this,this)} id='CPREPAYMENTLIST'>还款列表</li>:""
                                    }
                                    {
                                        CPRightComponent.includes('withholdList')?
                                        <li onClick={changeLabelCP.showWithholdPop.bind(this,this)} data-btn-rule="identity:getDebitingInfo" id='CPWITHHOLDLIST'>扣款列表</li>:""
                                    }
                                    {
                                        CPRightComponent.includes('reminder')?
                                        <li onClick={changeLabelCP.changeRightCP.bind(this,2,this)} id='REMINDER' data-btn-rule="RULE:REMINDER:TREE">Reminder</li>:""
                                    }
                                    {
                                        CPRightComponent.includes('InAcount')?
                                        <li data-id="3" onClick={changeLabelCP.changeRightCP.bind(this,3,this)} data-btn-rule="" id='CPINACOUNT'>扣款及入账</li>:""
                                    }
                                    {
                                        CPRightComponent.includes('repaymentRemind')?
                                        <li data-id="4" onClick={changeLabelCP.changeRightCP.bind(this,4,this)} id='REPAYMENTREMIND'>小雨花Reminder</li>
                                        :""
                                    }
                                </ul>
                            }
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={commonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        {this.labelBoxStore.rig_page}
                    </div>
                </div>
            </div>
        )
    }
};

export default LabelBody;  //ES6语法，导出模块