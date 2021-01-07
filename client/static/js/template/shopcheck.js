// 门店审核详情数据模板-TH
const Shopcheck={
    'shopExamineInfo':[
        {keyword:'name',desc:'门店名称'},
        {keyword:'licenseNo',desc:'营业执照号'},
    ],
    'shopExamineInfo2':[
        {keyword:'applicationType',desc:'申请类型',cell:function(keyword){
            switch(keyword){
                case 'SHOP_ADD':
                    return '门店新增';
                case 'SHOP_MODIFY':
                    return '门店修改';
            }
        }},
        {keyword:'submitTime',desc:'提交时间'},
        {keyword:'applicationFrom',desc:'申请来源'},
        {keyword:'belongMerchant',desc:'所属商户'},
    ],
    'shopExamineInfo3':[
        {keyword:'shortName',desc:'门店简称'},
        {keyword:'loginName',desc:'用户名'},
        {keyword:'isOnline',desc:'交易场景',cell:function(keyword){
            switch(keyword){
                case 0:
                    return '线下';
                case 1:
                    return '线上';
            }
        }},
        {keyword:'licenseNo',desc:'营业执照号码'},
        {keyword:'provinceCityArea',desc:'门店省市区',modification:true,modifyType:'addr',provinceId:'provinceId',cityId:'cityId',areaId:'areaId'},
        {keyword:'address',desc:'实际经营地址',modification:true,modifyType:'input',paremKey:'address'},
        {keyword:'operationTime',desc:'经营时长',modification:true,modifyType:'select',paremKey:'operationTime',stateKey:'operationTimeList'},
        {keyword:'leaseTime',desc:'租赁年限',modification:true,modifyType:'select',paremKey:'leaseTime',stateKey:'leaseTimeList'},
        {keyword:'longitude',desc:'经度',modification:true,modifyType:'input',paremKey:'longitude'},
        {keyword:'latitude',desc:'纬度',modification:true,modifyType:'input',paremKey:'latitude'},
        {keyword:'recipientTypeDesc',desc:'获客类型'},
        {keyword:'profile',desc:'门店简介',width:'100%'},
    ],
    'shopExamineInfo4':[
        {keyword:'legalName',desc:'姓 名',modification:true,modifyType:'input',paremKey:'legalName'},
        {keyword:'legalIdNo',desc:'身份证号码',modification:true,modifyType:'input',paremKey:'legalIdNo'},
        {keyword:'legalTel',desc:'手机号码',modification:true,modifyType:'input',paremKey:'legalTel'},
        {keyword:'legalProvinceCityArea',desc:'法人省市区',modification:true,modifyType:'addr',provinceId:'legalHomeProvinceId',cityId:'legalHomeCityId',areaId:'legalHomeAreaId'},
        {keyword:'legalHomeAddress',desc:'法人所在详细地址',modification:true,modifyType:'input',paremKey:'legalHomeAddress'},
    ],
    'shopExamineInfo5':[
        {keyword:'contactName',desc:'联系人姓名'},
        {keyword:'contactTel',desc:'联系电话'},
    ],
}
export default Shopcheck;