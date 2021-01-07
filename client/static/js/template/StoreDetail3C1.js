// 门店审核详情数据模板-3C1
const StoreDetail3C1={
    'baseMsg':[
        {keyword:'code',desc:'门店唯一编码'},
        {keyword:'productNo',desc:'产品号'},
        {keyword:'name',desc:'门店名称'},
        {keyword:'provinceName',desc:'所在省'},
        {keyword:'cityName',desc:'所在市'},
        {keyword:'districtName',desc:'所在区'},
        {keyword:'address',desc:'所在地址'},
        {keyword:'legalName',desc:'法人姓名'},
        {keyword:'legalCertNo',desc:'法人身份证号'},
        {keyword:'creditNo',desc:'社会信用代码'},
        {keyword:'type',desc:'门店类型',cell:function(keyword){
            switch(keyword){
                case 0:
                    return '其他';
                case 1:
                    return '医美';
            }
        }},
        {keyword:'contactName',desc:'联系人姓名'},
        {keyword:'contactPhone',desc:'联系人电话'},
        {keyword:'lng',desc:'门店位置经度'},
        {keyword:'lat',desc:'门店位置纬度'},
        {keyword:'storeStatus',desc:'合作方门店状态',cell:function(keyword){
            switch(keyword){
                case 1:
                    return '正常';
                case 2:
                    return '待审核';
                case 3:
                    return '已关闭';
                case 4:
                    return '已驳回';
                case 5:
                    return '已拒绝';
            }
        }},
        {keyword:'startDate',desc:'合作开始时间'},
        {keyword:'operator',desc:'操作人姓名'},
        {keyword:'licenseName',desc:'营业执照名称'},
    ]
}
export default StoreDetail3C1;