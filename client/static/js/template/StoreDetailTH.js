// 门店审核详情数据模板-TH
const StoreDetail={
    'baseMsg':[
        {keyword:'bankUserName',desc:'姓名'},
        {keyword:'bankPhone',desc:'手机号码'},
        {keyword:'city',desc:'市'},
        {keyword:'bankNationalId',desc:'身份证号'},
        {keyword:'phone',desc:'座机'},
        {keyword:'storeName',desc:'门店名称'},
        {keyword:'storeId',desc:'门店ID'},
        {keyword:'province',desc:'省份'},
        {keyword:'city',desc:'城市'},
        {keyword:'district',desc:'区域'},
        {keyword:'address',desc:'详细地址'},
        {keyword:'storeHeadquartersId',desc:'对应总校id'},
    ],
    'bankMsg':[
        {keyword:'bankName',desc:'银行名称'},
        {keyword:'bankPlace',desc:'支行地址'},
        {keyword:'bankCardNumber',desc:'银行卡号'},
        {keyword:'bankCode',desc:'银行编码'}
    ],
    "contractFile":[
        {fileName:'门店与合作方文件',url:'storeContractId',type:'byId'},
        {fileName:'营业执照',url:'businessLicenseFileId',type:'byId'},
        {fileName:'租赁合同',url:'leaseagreementId',type:'byId'},
        {fileName:'场地照片',url:'sitephotosId',type:'byId'},
    ],
}
export default StoreDetail;