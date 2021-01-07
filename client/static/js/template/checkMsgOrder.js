// 订单审核详情数据模板
const CheckMsgOrder={
    'userInfo':[
        {keyword:'registerMobileNo',desc:'用户名'},
        {keyword:'realName',desc:'姓名'},
        {keyword:'sexChinese',desc:'性别'},
        {keyword:'highestEducationChinese',desc:'学历'},
        {keyword:'workTypeChinese',desc:'社会身份'},
        {keyword:'homePCD',desc:'居住省市区'},
        {keyword:'address',desc:'详细地址'},
        {keyword:'certNo',desc:'身份证号码',cell:function(des,cdt){
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
        {keyword:'mobileNo',desc:'手机号'},
    ],
    'bankInfo':[
        {keyword:'bankCardNo',desc:'银行卡号'},
        {keyword:'cardholderName',desc:'持卡人姓名'},
        {keyword:'userBankName',desc:'银行名称'},
        {keyword:'receiptBankReservePhone',desc:'银行卡绑定手机号'}
    ],
    "jobInfo":[
        {keyword:'companyName',desc:'单位名称'},
        {keyword:'companyPCD',desc:'单位地址（省市区）'},
        {keyword:'companyAddress',desc:'单位详细地址'},
        {keyword:'companyPhone',desc:'单位电话'},
        {keyword:'position',desc:'职位'},
        {keyword:'professional',desc:'职业'},
    ],
    'linkmanInfo':[
        {keyword:'firstContactName',desc:'第一联系人姓名'},
        {keyword:'firstContactPhone',desc:'第一联系人电话'},
        {keyword:'firstRelationChinese',desc:'第一联系人关系'},
        {keyword:'secondContactName',desc:'第二联系人姓名'},
        {keyword:'secondContactPhone',desc:'第二联系人电话'},
        {keyword:'secondRelationChinese',desc:'第二联系人关系'},
        {keyword:'thirdContactName',desc:'第三联系人姓名'},
        {keyword:'thirdContactPhone',desc:'第三联系人电话'},
        {keyword:'thirdRelationChinese',desc:'第三联系人关系'},
    ],
    'otherInfo':[
        {keyword:'channelSource',desc:'业务来源'},
        {keyword:'imei',desc:'IMEI'},
        {keyword:'latitude',desc:'门店纬度'},
        {keyword:'longitude',desc:'门店经度'},
        {keyword:'shopAddress',desc:'门店地址'},
        {keyword:'shopName',desc:'门店名称',isbutton:'其他门店'},
        {keyword:'typeDesc',desc:'商户类型'},
        {keyword:'merchantGrade',desc:'商户评级'},
        {keyword:'merchantIsGreenChannel',desc:'商户是否绿通'},
        {keyword:'shopGrade',desc:'门店评级'},
        {keyword:'merchantMonthLimitQuota',desc:'单月最高放款额'},
    ]
}
export default CheckMsgOrder;