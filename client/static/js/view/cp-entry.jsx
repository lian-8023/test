// 合作方portal入口文件
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import '../../css/cp-portal-style.less';
import {Provider} from 'mobx-react';
import * as allStoreJs from '../store/allStore';  //所有mobx监测的数据
let allStore=allStoreJs.default;
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';

import HomeCP from './cp-module/homeCP'; //欢迎页面
import CPMenu from './cp-module/menu';  //左侧菜单
import PersonCheck from './cp-queue/personCheck';  //人工审核
import Search from './cp-search/search';  //搜索
import Detail from './cp-search/detail';  //搜索详情
import OpposeFraud from './cp-queue/opposeFraud';  //反欺诈
import TaskBundleCP from './cp-queue/taskBundleCP';  //任务绑定 
import ShopCheck from './cp-queue/shopCheck';  //门店审核 
import RTboard from './cp-queue/RTboard';  //实时看板 --审核看板
import AvisitBoard from './cp-queue/avisitBoard';  //回访看板queue
import AvisitLoan from './cp-queue/avisitLoan';  //回访放款
// import BatchProcessingLoan from './cp-queue/batchProcessingLoan';  //批量放款处理
import Avisit from './cp-queue/avisit';  //回访
import AvisitRepayment from './cp-queue/avisitRepayment';  //回访还款
import AvisitNotRepayment from './cp-queue/avisitNotRepayment';  //回访未还款
import SpecialAvist from './cp-queue/specialAvist';  //特殊回访
import DealAvisit from './cp-queue/dealAvisit';  //回访处理queue   
import AvisitCase from './cp-queue/avisitCase';  //已完成任务-回访案列  
import CheckQueue from './cp-queue/checkQueue';  //订单审核-审核queue - 小雨花   
import XYH_shopCheck from './cp-queue/XYH_shopcheck';  //门店审核-审核queue - 小雨花 
import XYH_productCheck from './cp-queue/XYH_productCheck';  //产品审核-审核queue - 小雨花 
import XYH_goodsCheck from './cp-queue/XYH_goodsCheck';  //商品审核-审核queue - 小雨花 
import Store_shop_manage from './cp-queue/store_shop_manage';  //商户门店管理
import XYH_businessCheck from './cp-queue/XYH_businessCheck';  //商户审核-审核queue - 小雨花 
import SpecialAvisitPull from './cp-queue/specialAvisitPull';  //特殊回访拉取数据
import CooperationAccounting from './cp-queue/cooperationAccounting';  //合作方挂账入账  
import LawsuitProof from './cp-queue/lawsuitProof';  //诉讼举证
import CreditInvestigation from './cp-queue/creditInvestigation';  //人行征信
import InformationDownLoad from './cp-queue/informationDownLoad'; //资料下载
import Reminder from './Reminder/ReminderIndex';  //Reminder页面  
import RepaymentRemind from './repaymentRemind/index';  //还款日提醒 
import ChargeAccount from './chargeAccount/index';  //记账宝还款管理 list
import ChargeAccountDetail from './chargeAccount/detail';  //记账宝还款管理 detail
import RefundAdjust from './cp-queue/refundAdjust'; //还款计划修改
import FinancialData from './cp-queue/financialData'; //财务数据
import QRcodeManagement from './cp-queue/QRcodeManagement'; //财务数据
import AstIndex from './AST_2F/AstIndex'; //AST_2F
import Prepay from './cp-queue/Prepay'; //预付金
import Prepay_det from './cp-queue/Prepay_det'; //预付金-详情
import BestLoansManage from './cp-queue/BestLoansManage'; //优选贷管理 
import VirtualFund from './cp-queue/virtualFund'; //虚拟资金池
import RetainageCheck from './cp-queue/RetainageCheck'; //扣款查询
import PactCheck from './cp-queue/PactCheck'; //合同查询
import AMCdebt from './cp-queue/AMCdebt'; //AMC债务

import Index from './index';
let menuList=[
    {
        path:'/test',
        component:Index
    },{
        path:'/search',
        component:Search
    },{
        path:'/personCheck',
        component:PersonCheck
    },{
        path:'/detail',
        component:Detail
    },{
        path:'/opposeFraud',
        component:OpposeFraud
    },{
        path:'/taskBundleCP',
        component:TaskBundleCP
    },{
        path:'/shopCheck',
        component:ShopCheck
    },{
        path:'/RTboard',
        component:RTboard
    },{
        path:'/avisit',
        component:Avisit
    },{
        path:'/avisitLoan',
        component:AvisitLoan
    },{
        path:'/avisitRepayment',
        component:AvisitRepayment
    },{
        path:'/avisitNotRepayment',
        component:AvisitNotRepayment
    },{
        path:'/dealAvisit',
        component:DealAvisit
    },{
        path:'/specialAvist',
        component:SpecialAvist
    },{
        path:'/avisitBoard',
        component:AvisitBoard
    },{
        path:'/avisitCase',
        component:AvisitCase
    },{
        path:'/checkQueue',
        component:CheckQueue
    },{
        path:'/specialAvisitPull',
        component:SpecialAvisitPull
    },{
        path:'/cooperationAccounting',
        component:CooperationAccounting
    },{
        path:'/LawsuitProof',
        component:LawsuitProof
    },{
        path:'/creditInvestigation',
        component:CreditInvestigation
    },{
        path:'/InformationDownLoad',
        component:InformationDownLoad
    },{
        path:'/Reminder/:rigPage',
        component:Reminder
    },{
        path:'/XYH_shopCheck/1',
        component:XYH_shopCheck
    },{
        path:'/offlineShopCheck/0',
        component:XYH_shopCheck
    },{
        path:'/XYH_productCheck',
        component:XYH_productCheck
    },{
        path:'/XYH_goodsCheck',
        component:XYH_goodsCheck
    },{
        path:'/store_shop_manage',
        component:Store_shop_manage
    },{
        path:'/XYH_businessCheck',
        component:XYH_businessCheck
    },{
        path:'/repaymentRemind',
        component:RepaymentRemind
    },{
        path:'/chargeAccount',
        component:ChargeAccount
    },{
        path:'/chargeAccountDetail',
        component:ChargeAccountDetail
    },{
        path:'/refundAdjust',
        component:RefundAdjust
    },{
        path:'/financialData',
        component:FinancialData
    },{
        path:'/QRcodeManagement',
        component:QRcodeManagement
    },{
        path:'/AstIndex',
        component:AstIndex
    },{
        path:'/Prepay',
        component:Prepay
    },{
        path:'/Prepay_det',
        component:Prepay_det
    },{
        path:'/BestLoansManage',
        component:BestLoansManage
    },{
        path:'/VirtualFund',
        component:VirtualFund
    },{
        path:'/RetainageCheck',
        component:RetainageCheck
    },{
        path:'/PactCheck',
        component:PactCheck
    },{
        path:'/AMCdebt',
        component:AMCdebt
    }
];
ReactDOM.render(
    <Provider allStore={allStore}>
        <ConfigProvider locale={zhCN}>
            <Router history = {hashHistory} >
                <route path ="/" component={CPMenu} >
                    <IndexRoute component={HomeCP} />
                    {
                        menuList.map((item,i)=>{
                            return <route key={i} path ={item.path} component={item.component} />
                        })
                    }
                </route>
            </Router>
        </ConfigProvider>
    </Provider>,
    document.getElementById('cp-index')
);