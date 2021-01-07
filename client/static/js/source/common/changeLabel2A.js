
// 2a portal 切换左右组件公共方法
import React from 'react';
import $ from 'jquery';


import UserMsg from '../../view/A2-module/UserMsg';
import Case from '../../view/A2-search/Case';   //=>案例
import Pact from '../../view/A2-search/Pact';   //=>合同列表
import File from '../../view/A2-search/File';  //=>附件
import OCR from '../../view/A2-search/OCR';   //=>OCR
import PhoneMsg from '../../view/A2-search/PhoneMsg';   //=>PhoneMsg
import OperatorReport from '../../view/A2-search/OperatorReport';   //=>运营商报告
import OperatorReportNew from '../../view/A2-search/OperatorReportNew';   //=>运营商报告新
import MessageList from '../../view/A2-search/messageList';   //=>通讯录
import CallRecord from '../../view/A2-search/callRecord';   //=>拨打记录
import SecurityRcord from '../../view/A2-search/SecurityRcord';   //=>社保记录  
import BankList from '../../view/A2-search/bankList';   //=>银行流水  

// import CpySearch from '../../view/A2-companySearch/CpySearch';
// import CpyOCR from '../../view/A2-companySearch/CpyOCR';
// import CpyLP from '../../view/A2-companySearch/CpyLP';
// import CpyApprove from '../../view/A2-companySearch/CpyApprove';
// import CpyFraud from '../../view/A2-companySearch/CpyFraud';
import Reminder from '../../view/Reminder/Reminder';
import GuaranteeCost from '../../view/guaranteeCost/GuaranteeCost';
import RepaymentRemindpage from '../../view/repaymentRemind/repaymentRemindpage';  //还款日提醒 
import Collection from '../../view/Collection/Collection';
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

export default class ChangeLabel2A{
    //导航切换页面
    guideLinkToRigPage(rigComponent,that){
        $(".top .phoneNo,.top .acount").val("");
        var _this=this;
        that.setState({
            getQueue:[],
            cpy_Q_ajax:"", //公司搜索数据
            voe_Q_ajax: "",  //voe搜索数据
            vor_Q_ajax: "",  //vor搜索数据
            ocr_Q_ajax:"",  //ocr搜索数据
            lp_Q_ajax:"",  //lp搜索数据
            approve_Q_ajax:"",  //approve搜索数据
            fraud_Q_ajax:"",  //fraud搜索数据
            _location:rigComponent,
        },()=>{
            switch (rigComponent){
                // case "CpySearch":
                //     _this.changeRight2A(0,that);
                //     break;
                // case "OCR":
                //     _this.changeRight2A(3,that);
                //     break;
                // case "Approve":
                //     _this.changeRight2A(5,that);
                //     break;
                // case "Fraud":
                //     _this.changeRight2A(6,that);
                //     break;
                case "collection":
                    _this.changeRight2A(8,that);
                    break;
                case "Reminder":
                    _this.changeRight2A(7,that);
                    break;
                case "earlierCost":
                    _this.changeRight2A(9,that);
                    break;
            }
        })
    }
    /**
     * 获取左侧组件内容
     * @param index
     * @returns {string}
     */
    getLeftHtml=(index,that)=>{
        var left_page="";
        switch (index){
            case 0:
                left_page=<UserMsg _location={that.props.rigPage} />;
                break;
            case 1:
                left_page=<Case _location={that.props.rigPage} />;
                break;
            case 2:
                left_page=<Pact _location={that.props.rigPage} />;
                break;
            case 3:
                left_page=<File _location={that.props.rigPage} />;
                break;
            case 4:
                left_page=<OCR _location={that.props.rigPage} />;
                break;
            case 5:
                left_page=<PhoneMsg _location={that.props.rigPage} />;
                break;
            case 6:
                left_page=<MessageList />;
                break;
            case 7:
                left_page=<CallRecord />;
                break;
            case 8:
                left_page=<OperatorReport />;
                break;
            case 9:
                left_page=<SecurityRcord />;
                break;
            case 10:
                left_page=<BankList />;
                break;
            case 11:
                left_page=<OperatorReportNew />;
                break;
        }
        return left_page;
    }
    /**
     * 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    @action changeLeft2A=(index,that)=>{
        var leftHtml = this.getLeftHtml(parseInt(index),that);
        that.labelBoxStore.lef_page=leftHtml;
        $(".Csearch-left-page li").removeClass("on");
        $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
    }
    
    /**
     * 渲染右侧queue详情
     * @param index
     * @param showButton 需要显示的button对应的class名称，如果不需要设置则赋值null
     * @param thisPointer 调用此方法时的this指针，是否需要回调index组件的方法（列如collection需要调用CollectionIndex.jsx的coltnSearch方法,根据this指针传对应组件内的函数）
     */
    @action changeRight2A(index,that,thisPointer){
        var right_page="";
        switch (index){
            // case 0:
            //     right_page=<CpySearch 
            //                     _oper_type_props={that.state._oper_type}  //搜索方式 search、next
            //                     _params_rigPage={that.state.params_rigPage} 
            //                     _cpy_Q_ajax={that.state.cpy_Q_ajax} 
            //                 />;
            //     break;
            // case 3:
            //     right_page=<CpyOCR 
            //                     _oper_type_props={that.state._oper_type}
            //                     _params_rigPage={that.state.params_rigPage}
            //                     _ocr_Q_ajax={that.state.ocr_Q_ajax}
            //                 />;
            //     break;
            // case 4:
            //     right_page=<CpyLP 
            //                     _oper_type_props={that.state._oper_type}
            //                     _params_rigPage={that.state.params_rigPage}
            //                     _lp_Q_ajax={that.state.lp_Q_ajax}
            //                 />;
            //     break;
            // case 5:
            //     right_page=<CpyApprove 
            //                     _oper_type_props={that.state._oper_type}
            //                     _params_rigPage={that.state.params_rigPage}
            //                     _approve_Q_ajax={that.state.approve_Q_ajax}
            //                 />;
            //     break;
            // case 6:
            //     right_page=<CpyFraud 
            //                     _oper_type_props={that.state._oper_type}
            //                     _params_rigPage={that.state.params_rigPage}
            //                     _fraud_Q_ajax={that.state.fraud_Q_ajax}
            //                 />;
            //     break;
            case 7:
                right_page=<Reminder _oper_type_props={that.state._oper_type}
                                     _params_rigPage={that.state.params_rigPage}
                            />;
                break;
            case 21:
                right_page=<RepaymentRemindpage
                                _params_rigPage={that.state.params_rigPage}
                                updataList_fn={that.RmdSearch.bind(that)}  //更新搜索列表
                            />;
                break;
            case 22:
                right_page=<GuaranteeCost
                                _params_rigPage={that.state.params_rigPage}
                                updataList_fn={that.searchFn.bind(that)}  //更新搜索列表
                            />;
                break;
            case 8:
                right_page=<Collection 
                                     _oper_type_props={that.state._oper_type}
                                     _params_rigPage={that.state.params_rigPage}
                                     _coltn_Q_ajax={that.state.coltn_Q_ajax}
                                     updataList_fn={thisPointer=="commonJs"?that.coltnSearch.bind(that):this.props.updateList.bind(this)}  //更新搜索列表
                            />;
                break;
            case 9:
                    right_page=<Case />;
                break;
            case 10:
                    right_page=<Pact />;
                break;
            case 11:
                    right_page=<File />;
                break;
            case 12:
                    right_page=<OCR />;
                break;
            case 13:
                    right_page=<PhoneMsg />;
                break;
            case 14:
                    right_page=<OperatorReport />;
                break;
            case 15:
                    right_page=<OperatorReportNew />;
                break;
            case 16:
                    right_page=<MessageList />;
                break;
            case 17:
                    right_page=<CallRecord />;
                break;
            case 18:
                    right_page=<SecurityRcord />;
                break;
            case 19:
                    right_page=<BankList />;
                break;
        }
        that.labelBoxStore.rig_page=right_page;
        $(".Csearch-right-page li").removeClass("on");
        $(".Csearch-right-page li[data-id='"+index+"']").addClass("on");
    }
}