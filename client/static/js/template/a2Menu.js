
// 2a portal 菜单
const A2MenuConfig=[
    {
        _url:'/search',
        ruleKey:'SEARCH:SEARCH',
        title:'搜索',
        id:'a2TreeSearch'
    },
    {
        _url:'/partnerSearch',
        ruleKey:'RULE:TREE:CORPORATION',
        title:'合作方查询',
        id:'a2TreeCorporation'
    },
    {
        _url:'/AST',
        ruleKey:'RULE:TREE:AST',
        title:'AST',
        id:'a2TreeAst'
    },
    /* {
        _url:'/AST2',
        title:'AST_insurance',
        query:'resource=ast_insurance',
        id:'a2TreeAst2'
    }, */
    {
        _url:'/companySearch/CpySearch',
        ruleKey:'RULE:TREE:COMPANY',
        title:'公司搜索',
        id:'a2TreeCpySearch'
    },
    {
        _url:'/companySearch/Fraud',
        ruleKey:'RULE:TREE:FRAUD',
        title:'Fraud',
        id:'a2TreeFraud'
    },
    // {
    //     _url:'/companySearch/Approve',
    //     ruleKey:'RULE:TREE:APPROVE',
    //     title:'Approve',
    //     id:'a2TreeApprove'
    // },
    // {
    //     _url:'/Reminder/reminder',
    //     ruleKey:'RULE:TREE:REMIND',
    //     title:'Reminder',
    //     id:'a2TreeReminder'
    // },
    {
        _url:'/Collection/collection',
        ruleKey:'RULE:TREE:COLLECTION',
        title:'Collection',
        id:'a2TreeCollection'
    },
    {
        _url:'/Outsource/outsource',
        ruleKey:'RULE:TREE:EXTERNAL',
        title:'委外',
        id:'a2TreeOutsource'
    },
    {
        _url:'/lawsuit',
        ruleKey:'lawsuit:key:tree',
        title:'诉讼',
        id:'a2TreeLawsuit'
    },
    {
        _url:'/Withhold',
        ruleKey:'RULE:TREE:RESIGN',
        title:'重签代扣',
        id:'a2TreeWithhold'
    },
    {
        _url:'/RTtask',
        ruleKey:'RULE:TREE:RT',
        title:'实时任务',
        id:'a2TreeRTtask'
    },
    /* {
        _url:'/service/charge',
        ruleKey:'',
        title:'服务费',
        id:'a2TreeeService'
    }, */
    {
        _url:'/guarantee/charge',
        ruleKey:'',
        title:'担保费',
        id:'a2TereeeGuarantee'
    },
    {
        _url:'/Taskbundle',
        ruleKey:'RULE:TREE:BIND',
        title:'任务绑定',
        id:'a2TreeTaskbundle'
    },
    // {
    //     _url:'/TianR',
    //     ruleKey:'RULE:TREE:TIANR',
    //     title:'天润绑定',
    //     id:'a2TreeTianR'
    // },
    {
        _url:'/NotesQuery',
        ruleKey:'RULE:TREE:SMSSEARCH',
        title:'短信查询',
        id:'a2TreeNotesQuery'
    },
    {
        _url:'/OutboundNotes',
        ruleKey:'RULE:TREE:SMSOUTCALL',
        title:'外呼短信',
        id:'a2TreeOutboundNotes'
    },
    {
        _url:'/NotesModeEdit',
        ruleKey:'RULE:TREE:SMSEDIT',
        title:'短信模板编辑',
        id:'a2TreeNotesModeEdit'
    },
    {
        _url:'/notesRecord',
        ruleKey:'RULE:TREE:RECORD',
        title:'短信记录',
        id:'a2TreeNotesRecord'
    },
    {
        _url:'/DataCheck',
        ruleKey:'RECON:QUERYRECON',
        title:'数据核对',
        id:'a2TreeDataCheck'
    },
    {
        _url:'/dataDetail',
        ruleKey:'RECON:QUERYRECONDETAILS',
        title:'数据明细',
        id:'a2TreeDataDetail'
    },
    {
        _url:'/dataUpdate',
        ruleKey:'RECON:UPLOADRECONFILE',
        title:'数据上传',
        id:'a2TreeDataUpdate'
    },
    {
        _url:'/historyList',
        ruleKey:'RULE:TREE:HISTORY',
        title:'操作历史记录',
        id:'a2TreeHistoryList'
    },
    {
        _url:'/abnormalData',
        ruleKey:'RULE:REDIS:TREE',
        title:'异常数据',
        id:'a2TreeAbnormalData'
    },
    {
        _url:'/RTboard',
        ruleKey:'external:statistics',
        title:'实时看板',
        id:'a2TreeRTboard'
    },
    {
        _url:'/reportData',
        ruleKey:'RULE:TREE:GOVT:UPLOAD',
        title:'上报数据',
        id:'a2TreeReportData'
    },
    {
        _url:'/workAllot',
        ruleKey:'RULE:TREE:WORKORDER',
        title:'工单',
        id:'a2TreeWorkAllot'
    },
    {
        _url:'/reportCheck',
        ruleKey:'RULE:TREE:FINANCIAL',
        title:'上报查询',
        id:'a2TreeReportCheck'
    },
    {
        _url:'/noteModel',
        ruleKey:'SMS:MANAGER',
        title:'短信模板管理',
        id:'a2TreeNoteModel'
    },
    {
        _url:'/noteBusiness',
        ruleKey:'SMS:MANAGER',
        title:'短信业务管理',
        id:'a2TreeNoteBusiness'
    },{
        _url:'/LitigationTemplate',
        ruleKey:'FILE:AFTER:LOAN',
        title:'诉讼模板管理',
        id:'LitigationTemplate'
    },
]
export default A2MenuConfig;