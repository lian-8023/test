
import StoreDetailTH from  './storeDetailTH';  //门店审核-正常数据
import StoreDetail3C from  './storeDetail3C';  //门店审核3C
import StoreDetail3C1 from  './storeDetail3C1';  //门店审核3C1
import StoreDetailPF from  './storeDetailPF';  //门店审核平台

import CheckMsgOrder from  './checkMsgOrder';  //小雨花订单审核详情
import SupplyChain from  './supplyChain';  //供应链详情
import Agriculture from  './agriculture';  //农业详情
import BusinessCheck from  './businessCheck';  //小雨花商户审核详情
import Shopcheck from  './shopcheck';  //小雨花门店审核详情



// 产品对应配置
const ProductConfig={
    "3C":{
        msg:[  //详情配置
            {"name":"门店信息",templateKey:StoreDetail3C.goodsMsg},
        ],
        files:[  //文件配置
            {"name":"文件信息",templateKey:StoreDetail3C.fileMsg},
            {name:'经营场所购房（租赁）合同照片',templateKey:'contractPhoto_1',source:'fromJava',loopType:'openUrl',fileName:'fileType'},
        ]
    },
    "3C1":{  //平台的3C1 和 6C1 信息模版
        msg:[  
            {"name":"门店信息",templateKey:StoreDetail3C1.baseMsg},
        ],
        files:[
            {"name":"证件图片",templateKey:'proveFiles',source:'fromJava',listLocation:'wrap',fileName:'fileName'},  //文件list数据在最外层
            {"name":"场地图片",templateKey:'locateFiles',source:'fromJava',listLocation:'wrap',fileName:'fileName'},
            {"name":"经营场所购房（租赁）合同照片",templateKey:'contractPhoto',source:'fromJava',listLocation:'wrap',fileName:'fileName'},
            {"name":"门店确认函",templateKey:'storeConfirmation',source:'fromJava',listLocation:'wrap',fileName:'fileName'},
        ]
    },
    'PF':{
        msg:[  
            {"name":"门店信息",templateKey:StoreDetailPF.goodsMsg},
        ],
        files:[  
            {"name":"文件信息",templateKey:'storeFiles',source:'fromJava',fileName:'fileType'},  //后端借口返回数据为list，storeFiles为后端数据key值
        ]
    },
    "TH":{
        msg:[  
            {"name":"基本信息",templateKey:StoreDetailTH.baseMsg},
            {"name":"银行信息",templateKey:StoreDetailTH.bankMsg},
        ],
        files:[  
            {"name":"合同文件",templateKey:StoreDetailTH.contractFile},
            {"name":"门店信息",templateKey:'storeFiles',source:'fromJava',fileName:'fileType'},  //后端借口返回数据为list，storeFiles为后端数据key值
        ]
    },
    'checkMsgOrder':{  //订单审核详情
        msg:[  
            {"name":"客户信息",templateKey:CheckMsgOrder.userInfo,javaKey:'userInfo'},
            {"name":"银行信息",templateKey:CheckMsgOrder.bankInfo,javaKey:'bankInfo'},
            {"name":"工作信息",templateKey:CheckMsgOrder.jobInfo,javaKey:'jobInfo'},
            {"name":"联系人信息",templateKey:CheckMsgOrder.linkmanInfo,javaKey:'linkmanInfo'},
            {"name":"其他信息",templateKey:CheckMsgOrder.otherInfo,javaKey:'otherInfo'},
        ],
    },
    'businessCheck':{  //小雨花商户审核详情
        msg:[  
            {"name":"基本信息",templateKey:BusinessCheck.merchantInfo,javaKey:'merchantInfo'},
            {"name":"申请信息",templateKey:BusinessCheck.merchantInfo2,javaKey:'merchantInfo'},
            {"name":"商户基本信息",templateKey:BusinessCheck.merchantExamineInfo,javaKey:'merchantExamineInfo',withinKey:'merchantPortalDetail',mark:'merchantbaseInfo','tip':'请确定商户可通过再进行信息修改操作，否则无法保存本次修改信息'},
            {"name":"法定代表/负责人信息",templateKey:BusinessCheck.merchantExamineInfo2,javaKey:'merchantExamineInfo',withinKey:'merchantPortalDetail'},
            {"name":"联系人信息",templateKey:BusinessCheck.merchantExamineInfo3,javaKey:'merchantExamineInfo',withinKey:'merchantPortalDetail'},
            {"name":"商户收款账户",templateKey:BusinessCheck.merchantExamineInfo4,javaKey:'merchantExamineInfo',withinKey:'merchantPortalDetail'},
        ],
    },
    'shopcheck':{
        msg:[  
            {"name":"基本信息",templateKey:Shopcheck.shopExamineInfo,javaKey:'shopExamineInfo',withinKey:'shopPortalDetail'},
            {"name":"申请信息",templateKey:Shopcheck.shopExamineInfo2,javaKey:'merchantStoreCheck'},
            {"name":"门店基本信息",templateKey:Shopcheck.shopExamineInfo3,javaKey:'shopExamineInfo',withinKey:'shopPortalDetail','tip':'请确定门店可通过再进行信息修改操作，否则无法保存本次修改信息'},
            {"name":"法定代表/负责人信息",templateKey:Shopcheck.shopExamineInfo4,javaKey:'shopExamineInfo',withinKey:'shopPortalDetail'},
            {"name":"联系人信息",templateKey:Shopcheck.shopExamineInfo5,javaKey:'shopExamineInfo',withinKey:'shopPortalDetail'},
        ],
    },
    'supplyChain':{  //供应链详情配置
        msg:[  
            {"name":"授信信息",templateKey:SupplyChain.creditInfo,javaKey:'creditInfo'},
            {"name":"客户信息",templateKey:SupplyChain.baseInfo,javaKey:'baseInfo'},
            {"name":"银行信息",templateKey:SupplyChain.bankInfo,javaKey:'bankInfo'},
            {"name":"联系人信息",templateKey:SupplyChain.contactInfos,javaKey:'contactInfos'},
            {"name":"企业信息",templateKey:SupplyChain.enterpriseInfo,javaKey:'enterpriseInfo'},
        ],
        files:[  
            {"name":"身份证图片",templateKey:'idCardInfos',source:'fromJava',listLocation:'wrap',fileName:'fileName'},  //文件list数据在最外层
            {"name":"其他图片",templateKey:'elsePicInfos',source:'fromJava',listLocation:'wrap',fileName:'fileName'},,
        ]
    },
    'AG':{
        msg:[  
            {"name":"客户信息",templateKey:Agriculture.userInfo,javaKey:'userInfo'},
            {"name":"银行卡信息",templateKey:Agriculture.bankInfo,javaKey:'bankInfo'},
            {"name":"担保人信息",templateKey:Agriculture.guaranteeInfo,javaKey:'guaranteeInfo'},
            {"name":"担保人银行卡信息",templateKey:Agriculture.guaranteeBankInfo,javaKey:'guaranteeBankInfo'},
            {"name":"用户拓展信息",templateKey:Agriculture.userExtraInfo,javaKey:'userExtraInfo'},
        ],
    }
}
export default ProductConfig;