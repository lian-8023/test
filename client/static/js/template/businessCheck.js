// 门店审核详情数据模板-TH
const BusinessCheck={
    'merchantInfo':[
        {keyword:'merchantName',desc:'商户名称'},
        {keyword:'merchantTypeStr',desc:'商户类型'},
        {keyword:'businessTypeStr',desc:'业务类型'},
        {keyword:'businessLicense',desc:'营业执照号'},
    ],
    'merchantInfo2':[
        {keyword:'applicationTypeStr',desc:'申请类型'},
        {keyword:'submitTime',desc:'提交时间'},
        {keyword:'applicationFrom',desc:'申请来源'},
    ],
    'merchantExamineInfo':[
        {keyword:'shortName',desc:'商户简称'},
        {keyword:'loginName',desc:'用户名'},
        {keyword:'channelSource',desc:'渠道来源'},
        {keyword:'isOnlineDesc',desc:'交易场景'},
        {keyword:'eduTypeDesc',desc:'场景类型'},
        {keyword:'mainGoodsClassDesc',desc:'主营业务'},
        {keyword:'licenseNo',desc:'营业执照号码'},
        {keyword:'registAmount',desc:'注册资本金/开办金额（万元）',modification:true,modifyType:'input',paremKey:'registAmount'},
        {keyword:'yearBusinessAmount',desc:'年营业额（万元）',modification:true,modifyType:'input',paremKey:'yearBusinessAmount'},
        {keyword:'operatingArea',desc:'经营面积（平方米）',modification:true,modifyType:'input',paremKey:'operatingArea'},
        {keyword:'operationTime',desc:'经营时长',modification:true,modifyType:'select',paremKey:'operationTime',stateKey:'operationTimeList'},
        {keyword:'leaseTime',desc:'租赁年限',modification:true,modifyType:'select',paremKey:'leaseTime',stateKey:'modifyTypeList',stateKey:'leaseTimeList'},
        {keyword:'scale',desc:'企业规模',modification:true,modifyType:'select',paremKey:'scale',stateKey:'scaleList'},
        {keyword:'merchantProvinceCityArea',desc:'实际经营地址省市区',modification:true,modifyType:'addr',provinceId:'provinceId',cityId:'cityId',areaId:'areaId'},
        {keyword:'address',desc:'实际经营详细地址',modification:true,modifyType:'input',paremKey:'address'},
        {keyword:'longitude',desc:'经度',modification:true,modifyType:'input',paremKey:'longitude'},
        {keyword:'latitude',desc:'纬度',modification:true,modifyType:'input',paremKey:'latitude'},
        {keyword:'isUndertake',desc:'是否兜底',cell:function(keyword){
            switch(keyword){
                case 0:
                    return '否';
                case 1:
                    return '是';
            }
        }},
        {keyword:'depositRate',desc:'保证金比例'},
        {keyword:'depositDay',desc:'保证金代偿规则'},
        {keyword:'warningValue',desc:'额度预警阈值（元）',modification:true,modifyType:'input',paremKey:'warningValue'},
        {keyword:'monthLimitQuota',desc:'单月最高放款额度（元）'},
        {keyword:'merchantLevelDesc',desc:'商户级别',modification:true,modifyType:'select',paremKey:'merchantLevel',stateKey:'levelEnums'},
        {keyword:'supportElsewhereInput',desc:'异地进件配置',cell:function(keyword){
            if(keyword !=='-'){
                if(keyword){
                    return '支持';
                }else{
                    return '不支持';
                }
            }
        }},
    ],
    'merchantExamineInfo2':[
        {keyword:'legalName',desc:'姓 名'},
        {keyword:'legalIdNo',desc:'身份证号码'},
        {keyword:'legalTel',desc:'手机号码'},
        {keyword:'legalProvinceCityArea',desc:'省市区'},
        {keyword:'legalHomeAddress',desc:'家庭详细地址'},
    ],
    'merchantExamineInfo3':[
        {keyword:'contactName',desc:'联系人姓名'},
        {keyword:'contactTel',desc:'联系电话'},
    ],
    'merchantExamineInfo4':[
        {keyword:'receiptAccountTypeDesc',desc:'账户类型'},
        {keyword:'receiptAccountName',desc:'收款方名称'},
        {keyword:'receiptBankName',desc:'开户行'},
        {keyword:'receiptAccountIdNo',desc:'收款人身份证号'},
        {keyword:'receiptBankReservePhone',desc:'收款人预留手机号'},
        {keyword:'receiptBankNo',desc:'收款方银行账户'},
        {keyword:'paymentMerchantId',desc:'第三方支付账户'},
    ],
}
export default BusinessCheck;