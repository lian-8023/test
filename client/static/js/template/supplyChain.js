// 订单审核详情数据模板
const SupplyChain={
    'baseInfo':[
        // {keyword:'registerMobileNo',desc:'用户名'},
        {keyword:'name',desc:'姓名'},
        {keyword:'mobile',desc:'手机号'},
        {keyword:'email',desc:'电子邮件'},
        {keyword:'maritalStatus',desc:'婚姻状况'},
        {keyword:'highestEducation',desc:'学历'},
        {keyword:'trade',desc:'行业'},
        {keyword:'workTime',desc:'从业时长'},
        {keyword:'liveProvince',desc:'居住省'},
        {keyword:'liveCity',desc:'居住市'},
        {keyword:'liveDistrict',desc:'居住区/县'},
        {keyword:'liveTime',desc:'居住时长'},
        {keyword:'liveStatus',desc:'居住状态'},
        {keyword:'liveAddress',desc:'居住详细地址'},
        {keyword:'idCard',desc:'身份证号码',cell:function(des,cdt){
            if(cdt){
                if(des){
                    return des.replace(/(.{0}).*(.{12})/, "$1****$2");
                }else{
                    return '';
                }
            }else{
                return des;
            }
        }},
        {keyword:'idCardAddress',desc:'身份证住址'},
        {keyword:'idCardValidStart',desc:'身份证有效期开始时间'},
        {keyword:'idCardValidEnd',desc:'身份证有效期结束时间'},
        {keyword:'native',desc:'是否本地人'},
        {keyword:'otherNotBankLoan',desc:'是否有本地房产'},
        {keyword:'consumptionInstallmentCompany',desc:'消费分期公司贷款'},
    ],
    'bankInfo':[
        {keyword:'number',desc:'银行卡号'},
        {keyword:'bankName',desc:'银行名称'},
        {keyword:'branch',desc:'支行'},
        {keyword:'mobile',desc:'银行卡绑定手机号'}
    ],
    "contactInfos":[
        {keyword:'type',desc:'类型'},
        {keyword:'name',desc:'姓名'},
        {keyword:'mobile',desc:'电话'},
        {keyword:'rel',desc:'关系'},
    ],
    'enterpriseInfo':[
        {keyword:'signboardName',desc:'门店招牌名称'},
        {keyword:'businessMode',desc:'执照类型'},
        {keyword:'businessTime',desc:'经营时长(月)'},
        {keyword:'peakSeason',desc:'旺季时间'},
        {keyword:'expectedTurnoverThisYear',desc:'预计今年营业额（万元）'},
        {keyword:'inventoryValue',desc:'存货价值（万元）'},
        {keyword:'numberOfEmployees',desc:'员工人数'},
        {keyword:'province',desc:'经营地址省'},
        {keyword:'city',desc:'经营地址市'},
        {keyword:'district',desc:'经营地址区/县'},
        {keyword:'businessAddress',desc:'经营详细地址'},
        {keyword:'businessAddressArea',desc:'经营地址面积'},
        {keyword:'businessAddressLeaseTime',desc:'经营地址租约剩余时长'},
        {keyword:'businessTimeCurrentAddress',desc:'当前地址经营时长'},
        {keyword:'cooperateBusinessTime',desc:'与主体企业合作时长'},
        {keyword:'cooperateBusinessScale',desc:'与主体企业合作规模占比'},
        {keyword:'salesLevel',desc:'销售层级'},
        {keyword:'channelLevel',desc:'渠道层级'},
        {keyword:'deliveryMethod',desc:'货物配送方式'},
        {keyword:'posCode',desc:'POS编码'},
    ],
    "creditInfo":[
        {keyword:'creditLine',desc:'授信额度'},
        {keyword:'creditStatus',desc:'授信状态'},
        {keyword:'failureTime',desc:'失效时间'},
        // {keyword:'defaultData',desc:'类型'},
    ],
}
export default SupplyChain;