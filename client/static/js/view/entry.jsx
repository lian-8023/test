// 内部portal入口文件
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import {Provider} from 'mobx-react';
import * as allStoreJs from '../store/allStore';  //所有mobx监测的数据
let allStore=allStoreJs.default;
import '../../css/portal-style.less';
import '../../css/cp-portal-style.less';
import Menu from './module/menu';
import Index from './index';
import Search from './search/Search';
import Detail_file from './search/Detail_page';
import CompanySearchIndex from './companySearch/CompanySearchIndex';
import Withhold from './queue/withhold'; //重签代扣
import Home2A from './A2-module/home2A'; //欢迎页面
import CustomNote from './queue/CustomNote';  //短信查询
import Taskbundle from './queue/Taskbundle';  //任务绑定
import NotesQuery from './queue/NotesQuery';  //短信查询
import OutboundNotes from './queue/OutboundNotes';  //外呼短信
import NotesModeEdit from './queue/NotesModeEdit';  //短信模板编辑
import NotesRecord from './queue/notesRecord';  //短信记录
import RTtask from './queue/RTtask';  //实时任务
import DataCheck from './queue/dataCheck';  //数据核对 
import DataDetail from './queue/dataDetail';  //数据明细 
import DataUpdate from './queue/dataUpdate';  //数据上传
import DataAbnormal from './queue/dataAbnormal';  //数据异常
import TianR from './queue/TianR';  //天润
import WorkAllot from './queue/workAllot';  //工作分配
import AstIndex from './AST/AstIndex';  //ast页面
import Reminder from './Reminder/ReminderIndex';  //Reminder页面  
import Collection from './Collection/CollectionIndex';  //Collection页面
import EarlierCostIndex from './earlierCost/EarlierCostIndex';  //服务费页面
import GuaranteeCostIndex from './guaranteeCost/guaranteeCostIndex';  //担保费
import Outsource from './Outsource/OutsourceIndex';  //Outsource页面
import HistoryList from './queue/HistoryList';  //历史记录  
import PartnerSearch from './queue/PartnerSearch';  //合作方客户查询
import AbnormalData from './queue/AbnormalData';  //异常数据
import RTboard from './queue/RTboard';  //实时看板 
import ReportData from './queue/reportData';  //上报数据 
import Lawsuit from './queue/lawsuit';  //诉讼
import LawsuitProof from './cp-queue/lawsuitProof';  //诉讼举证
import ReportCheck from './queue/reportCheck';  //上报查询
import NoteModel from './queue/NoteModel'; //短信模版管理
import NoteBusiness from './queue/noteBusiness'; //短信业务管理
import LitigationTemplate from './queue/litigationTemplate'; //诉讼模板管理
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';

let menuList=[
    {
        path:'/search',
        component:Search
    },
    {
        path:'/partnerSearch',
        component:PartnerSearch
    },
    {
        path:'/detail/:id',
        component:Detail_file
    },
    {
        path:'/companySearch/:rigPage',
        component:CompanySearchIndex
    },
    {
        path:'/Withhold',
        component:Withhold
    },
    {
        path:'/CustomNote',
        component:CustomNote
    },
    {
        path:'/Taskbundle',
        component:Taskbundle
    },
    {
        path:'/NotesQuery',
        component:NotesQuery
    },
    {
        path:'/OutboundNotes',
        component:OutboundNotes
    },
    {
        path:'/NotesModeEdit',
        component:NotesModeEdit
    },
    {
        path:'/RTtask',
        component:RTtask
    },
    {
        path:'/TianR',
        component:TianR
    },
    {
        path:'/AST',
        component:AstIndex
    },
    {
        path:'/AST2',
        component:AstIndex
    },
    {
        path:'/Reminder/:rigPage',
        component:Reminder
    },
    {
        path:'/Collection/:rigPage',
        component:Collection
    },
    {
        path:'/Outsource/:rigPage',
        component:Outsource
    },
    {
        path:'/dataCheck',
        component:DataCheck
    },
    {
        path:'/service/:rigPage',
        component:EarlierCostIndex
    },
    {
        path:'/guarantee/:rigPage',
        component:GuaranteeCostIndex
    },
    {
        path:'/dataDetail',
        component:DataDetail
    },
    {
        path:'/notesRecord',
        component:NotesRecord
    },
    {
        path:'/dataUpdate',
        component:DataUpdate
    },
    {
        path:'/dataAbnormal',
        component:DataAbnormal
    },
    {
        path:'/test',
        component:Index
    },{
        path:'/historyList',
        component:HistoryList
    },{
        path:'/workAllot',
        component:WorkAllot
    },{
        path:'/abnormalData',
        component:AbnormalData
    },{
        path:'/RTboard',
        component:RTboard
    },{
        path:'/reportData',
        component:ReportData
    },{
        path:'/Lawsuit',
        component:Lawsuit
    },{
        path:'/LawsuitProof',
        component:LawsuitProof
    },{
        path:'/reportCheck',
        component:ReportCheck
    },{
        path:'/noteModel',
        component:NoteModel
    },{
        path:'/noteBusiness',
        component:NoteBusiness
    },{
        path:'/LitigationTemplate',
        component:LitigationTemplate
    },
]
ReactDOM.render(
    <Provider allStore={allStore}>
        <ConfigProvider locale={zhCN}>
            <Router history = {hashHistory} >
                <route path ="/" component={Menu} >
                    <IndexRoute component={Home2A} />
                    {
                        menuList.map((item,i)=>{
                            return <route key={i} path ={item.path} component={item.component} />
                        })
                    }
                </route>
            </Router>
        </ConfigProvider>
    </Provider>,
    document.getElementById('index')
);