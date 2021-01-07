import moment from 'moment';
// 订单审核详情数据模板
const Agriculture={
    'userExtraInfo':[
        {keyword:"annualIncome",desc:"卖主年收入"},

        {keyword:"annualIncomeName",desc:"卖主年收入"},

        {keyword:"annualIncomes",desc:"每年收入"},

        {keyword:"annuallyIncome",desc:"每年收入"},

        {keyword:"averageWeight",desc:"销售平均重量（公斤）"},

        {keyword:"beginManageDate",desc:"猪场开始经营日期"},

        {keyword:"breedScale",desc:"养殖方式"},

        {keyword:"breedScaleName",desc:"养殖方式"},

        {keyword:"buyAgMachineryToPastThreeYears",desc:"近三年有无购买过农机"},

        {keyword:"canBirthSowCount_1",desc:"能繁母猪头数"},

        {keyword:"canBirthSowCount_2",desc:"能繁母猪头数"},

        {keyword:"canBirthSowCount_3",desc:"能繁母猪头数"},

        {keyword:"canBirthSowCount_4",desc:"能繁母猪头数"},

        {keyword:"car",desc:"车"},

        {keyword:"carAmount",desc:"车总价(元)"},

        {keyword:"carCount",desc:"车数量(辆)"},

        {keyword:"companyAddress",desc:"赊账金额"},

        {keyword:"companyOwnership",desc:"年营业额"},

        {keyword:"contactPerson1Rate",desc:"联系人1对借款人评价"},

        {keyword:"contactPerson2Name",desc:"联系人2姓名"},

        {keyword:"contactPerson2Phone",desc:"联系人2电话"},

        {keyword:"contactPerson2Rate",desc:"联系人2对借款人评价"},

        {keyword:"contactPerson2Relationship",desc:"联系人2关系"},

        {keyword:"creditAmount",desc:"经营地址"},

        {keyword:"cultivationPattern",desc:"养殖模式"},

        {keyword:"cultureAddress",desc:"养殖详细地址"},

        {keyword:"cultureCityName",desc:"养殖市"},

        {keyword:"cultureDistrictName",desc:"养殖区"},

        {keyword:"cultureMode",desc:"养殖规模"},

        {keyword:"cultureProvinceName",desc:"养殖省"},

        {keyword:"currentInFenceCount",desc:"当前存栏头数"},

        {keyword:"environmentProof",desc:"环保资质"},

        {keyword:"everyBatchMaxCount",desc:"猪场每批次最多可养殖头数"},

        {keyword:"factoryId",desc:"工厂ID"},

        {keyword:"factoryName",desc:"工厂名称"},

        {keyword:"familyMonthlyExpend",desc:"家庭每月支出(元)"},

        {keyword:"familyNumber",desc:"家庭同住人口(人)"},

        {keyword:"farmProduce",desc:"农产品库存"},

        {keyword:"farmProduceAmount",desc:"农产品库存总价(元)"},

        {keyword:"farmProduceCount",desc:"农产品库存数量(亩/张)"},

        {keyword:"farmingUseMachine",desc:"农用机械设备"},

        {keyword:"farmingUseMachineAmount",desc:"农用机械设备总价(元)"},

        {keyword:"farmingUseMachineCount",desc:"农用机械设备数量(台)"},

        {keyword:"fertilizer",desc:"肥料/农药/其他饲料"},

        {keyword:"fertilizerAmount",desc:"肥料/农药/其他饲料总价(元)"},

        {keyword:"fertilizerCount",desc:"肥料/农药/其他饲料数量(吨/件)"},

        {keyword:"getFatDeathPercent_1",desc:"育肥平均死亡率（%）"},

        {keyword:"getFatDeathPercent_2",desc:"育肥猪死亡率（%）"},

        {keyword:"getFatInFenceCount",desc:"育肥存栏头数"},

        {keyword:"hasEpidemicPreventionLog",desc:"是否有猪场防疫工作日志"},

        {keyword:"hasEpidemicPreventionProof",desc:"是否取得《动物防疫条件合格证》"},

        {keyword:"hasInFence_1",desc:"当前有无存栏"},

        {keyword:"hasInFence_2",desc:"当前有无存栏"},

        {keyword:"house",desc:"房屋"},

        {keyword:"houseAmount",desc:"房屋总价(元)"},

        {keyword:"houseCount",desc:"房屋数量(套)"},

        {keyword:"inFenceCount_1",desc:"当前存栏头数"},

        {keyword:"inFenceCount_2",desc:"当前存栏头数"},

        {keyword:"inFenceDeathPercent_1",desc:"存栏平均死亡率（%）"},

        {keyword:"inFenceDeathPercent_2",desc:"存栏平均死亡率（%）"},

        {keyword:"inFenceNewPlan_1",desc:"除当前存栏外，贷款期内计划新养殖批数"},

        {keyword:"inFenceNewPlan_2",desc:"除当前存栏外，贷款期内计划新养殖批数"},

        {keyword:"inFenceTime_1",desc:"存栏批次已养殖时间（月）"},

        {keyword:"inFenceTime_2",desc:"存栏批次已养殖时间（月）"},

        {keyword:"isBelongAgMachinery",desc:"是否属于农机手"},

        {keyword:"isOtherLoan",desc:"是否有其他机构贷款"},

        {keyword:"isRent",desc:"场地是否为租赁"},

        {keyword:"lastTimeBuyMachineryAmount",desc:"上次购买农机金额"},

        {keyword:"lastTimeBuyMachineryType",desc:"上次购买农机类型"},

        {keyword:"latestInFenceCount_1",desc:"上一批养殖头数"},

        {keyword:"latestInFenceCount_2",desc:"上一批养殖头数"},

        {keyword:"latestInFenceDeathPercent_1",desc:"上一批平均死亡率（%）"},

        {keyword:"latestInFenceDeathPercent_2",desc:"上一批平均死亡率（%）"},

        {keyword:"loanNewPlan_1",desc:"贷款期内计划新养殖批数"},

        {keyword:"loanNewPlan_2",desc:"贷款期内计划新养殖批数"},

        {keyword:"managementUseCar",desc:"经营性用车"},

        {keyword:"managementUseCarAmount",desc:"经营性用车总价(元)"},

        {keyword:"managementUseCarCount",desc:"经营性用车数量(辆)"},

        {keyword:"manyYearsPlant",desc:"多年生地里作物"},

        {keyword:"manyYearsPlantAmount",desc:"多年生地里作物总价(元)"},

        {keyword:"manyYearsPlantCount",desc:"多年生地里作物数量(亩)"},

        {keyword:"newPlanBeginDate_1",desc:"新增第一批预计开始养殖时间"},

        {keyword:"newPlanBeginDate_2",desc:"新增第一批预计开始养殖时间"},

        {keyword:"otherAccruedAssets",desc:"其他猪场以外其他经营性流动资产"},

        {keyword:"otherAccruedAssetsDiscribe",desc:"其他猪场以外其他经营性流动资产描述"},

        {keyword:"otherAssets",desc:"其他非经营性固定资产"},

        {keyword:"otherAssetsDiscribe",desc:"其他非经营性固定资产描述"},

        {keyword:"otherFixedAssets",desc:"其他猪场以外其他经营性固定资产"},

        {keyword:"otherFixedAssetsDiscribe",desc:"其他猪场以外其他经营性固定资产描述"},

        {keyword:"otherIncomeAmount",desc:"非猪场的年净收入（元）"},

        {keyword:"otherIncomeProportion",desc:"非猪场收入占总收入比重"},

        {keyword:"otherIncomeSource",desc:"非猪场的其他收入来源"},

        {keyword:"otherLoanAmount",desc:"其他机构贷款金额"},

        {keyword:"otherProduce",desc:"其他种类养殖"},

        {keyword:"otherProduceAmount",desc:"其他种类养殖总价(元)"},

        {keyword:"otherProduceCount",desc:"其他种类养殖数量(羽/头/亩)"},

        {keyword:"pigFactoryAddress",desc:"猪场详细地址"},

        {keyword:"pigFactoryCity",desc:"猪场地区（市）"},

        {keyword:"pigFactoryDistrict",desc:"猪场地区（区）"},

        {keyword:"pigFactoryName",desc:"猪场名称"},

        {keyword:"pigFactoryPrice",desc:"猪场价值(元)"},

        {keyword:"pigFactoryProvince",desc:"猪场地区（省）"},

        {keyword:"plantType",desc:"植物类型"},

        {keyword:"plantingScale",desc:"种植规模"},

        {keyword:"rentAgreementRemainYear",desc:"租赁合同剩余时间(年)"},

        {keyword:"selfBringUpCount",desc:"自繁自养存栏头数"},

        {keyword:"selfBringUpDeathPercent",desc:"自繁自养死亡率（%）"},

        {keyword:"sonSellPercentage",desc:"预计仔猪销售比例（%）"},

        {keyword:"sonsCountPerBirth_1",desc:"母猪平均每胎产活仔数（只/胎）"},

        {keyword:"sonsCountPerBirth_2",desc:"母猪平均每胎产活仔数（只/胎）"},

        {keyword:"sonsCountPerBirth_3",desc:"母猪平均每胎产活仔数（只/胎）"},

        {keyword:"sonsCountPerBirth_4",desc:"母猪平均每胎产活仔数（只/胎）"},

        {keyword:"sonsCountPerYear_1",desc:"平均每年胎数"},

        {keyword:"sonsCountPerYear_2",desc:"平均每年胎数"},

        {keyword:"sonsCountPerYear_3",desc:"平均每年胎数"},

        {keyword:"sonsCountPerYear_4",desc:"平均每年胎数"},

        {keyword:"sonsDeathPercent_1",desc:"平均死亡率（%）"},

        {keyword:"sonsDeathPercent_2",desc:"仔猪死亡率（%）"},
        
        {keyword:"sonsInFenceCount",desc:"存栏头数"},
        
        {keyword:"sonsPerWeight",desc:"仔猪销售平均重量（公斤）"},
        
        {keyword:"sowInFenceCount_1",desc:"母猪存栏头数"},
        
        {keyword:"sowInFenceCount_2",desc:"母猪存栏头数"},
        
        {keyword:"sowInFenceCount_3",desc:"母猪存栏头数"},
        
        {keyword:"sowInFenceCount_4",desc:"母猪存栏头数"},
        
        {keyword:"spouseAttitude",desc:"配偶贷款意愿"},
        
        {keyword:"storagePlace",desc:"温室大棚/库房/其他圈舍"},
        
        {keyword:"storagePlaceAmount",desc:"温室大棚/库房/其他圈舍总价(元)"},

        {keyword:"storagePlaceCount",desc:"温室大棚/库房/其他圈舍数量(座)"},
        
        {keyword:"turnover",desc:"经营地权属"},
    ],
    "userInfo":[
        {keyword:'userName',desc:'用户姓名'},
        
        {keyword:'userPhone',desc:'用户手机号'},
        
        {keyword:'sex',desc:'用户性别'},
        
        {keyword:'spouseName',desc:'配偶姓名'},
        
        {keyword:'spousePhone',desc:'配偶电话'},

        {keyword:'sumPrincipal',desc:'剩余应还本金之和'},

        {keyword:'sumAmountOfMonth',desc:'月剩余应还总金额'},

        {keyword:'nationalId',desc:'用户身份证号码',cell:function(des,cdt){
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

        {keyword:'address',desc:'用户身份证地址'},
        
        /*  {keyword:'accountId',desc:'accountId用户id'},
        {keyword:'customerId',desc:'customerId用户id'}, */
        

        {keyword:'homeAddress',desc:'详细地址'},
        
        {keyword:'homeCityId',desc:'市编号'},
        
        {keyword:'homeCityName',desc:'现居住地(市)'},
        
        {keyword:'homeDistrictId',desc:'区编号'},
        
        {keyword:'homeDistrictName',desc:'现居住地(区)'},
        
        {keyword:'homeProvinceId',desc:'省份编号'},
        
        {keyword:'homeProvinceName',desc:'现居住地(省)'},
        
        {keyword:'houseNumber',desc:'门牌号'},
        
        {keyword:'isMarried',desc:'婚姻状态'},
        
        {keyword:'isMarriedName',desc:'婚姻状态(名称)'},
        
        {keyword:'isSelf',desc:'是否本人'},
        
        {keyword:'isSelfName',desc:'是否本人(名称)'},
        
        {keyword:'levelId',desc:'关联层级表'},
        
        {keyword:'contactName',desc:'联系人姓名'},
        
        {keyword:'contactPhone',desc:'联系人电话'},
        
        {keyword:'contactRelationship',desc:'联系人关系'},
        
        {keyword:'contactRelationshipName',desc:'联系人关系(名,称)'},
        
        {keyword:'liveTime',desc:'居住时长关联'},
        
        {keyword:'liveTimeName',desc:'居住时长关联(名称)'},
        
        
        {keyword:'rawAddTime($date-time)',desc:'创建时间'},
        
        {keyword:'rawUpdateTime($date-time)',desc:'修改时间'},
        
        {keyword:'reserve1',desc:'备用字段1'},
        
        {keyword:'reserve2',desc:'备用字段2'},
        
        
        {keyword:'是否可以更新用户信息',desc:'updateUserInfo',cell:function(des,cdt){
            let val = '';
            switch (des) {
                case true:val = '是'
                    
                    break;
            
                default:
                    val = '否'
                    break;
            }
            return val;
        }},
        
        {keyword:'userGid',desc:'用户唯一gid'},
        
        {keyword:'userVersion',desc:'用户信息修改记录版本号'},
        
        {keyword:'validDateRange',desc:'身份证有效期'},
        
        {keyword:'faceDistinguishNo',desc:'人脸识别订单号'},

        {keyword:'xydId',desc:'xydId'},
    ],
    'bankInfo':[
        {keyword: 'bankCardNumber',desc: '银行卡号'},

        {keyword: 'bankCityId',desc: '银行市id'},

        {keyword: 'bankCityName',desc: '开户行市'},

        {keyword: 'bankName',desc: '银行名称'},

        {keyword: 'bankPhone',desc: '银行卡预留手机号'},

        {keyword: 'bankProvinceId',desc: '银行省份id'},

        {keyword: 'bankProvinceName',desc: '开户行省份'},

        {keyword: 'identification',desc: '标识',cell:function(des,cdt){
            let val = '';
            switch (des) {
                case 1:val = '用户';
                    break;
                case 2:val = '担保人';
                    break
                default:
                    break;
            }
            return val;
        }},

        {keyword: 'rawAddTime',desc: '创建时间',cell:function(des,cdt){
            if(des){
                var time2=myTime(des);
                return time2;
            }else{
                return '';
            }
        }},

        {keyword: 'rawUpdateTime',desc: '修改时间',cell:function(des,cdt){
            if(des){
                var time2=myTime(des);
                return time2;
            }else{
                return '';
            }
        }},

        {keyword: 'reserve1',desc: '备用字段1'},

        {keyword: 'reserve2',desc: '备用字段2'},

        {keyword: 'status',desc: '状态',cell:function(des,cdt){
            let val = '';
            switch (des) {
                case 1:val = '正常使用';
                    break;
                case 4:val = '业务删除';
                    break
                default:
                    break;
            }
            return val;
        }},

        {keyword: 'uskeyword:erId',desc: '关联用户信息表'},
    ],
    'guaranteeInfo':[
        {keyword: 'customerId',desc: '担保人唯一id'},

        {keyword: 'faceDistinguishNo',desc: '人脸识别订单号'},

        {keyword: 'homeAddress',desc: '地址'},

        {keyword: 'homeCityId',desc: '市id'},

        {keyword: 'homeCityName',desc: '市名称'},

        {keyword: 'homeDistrictId',desc: '区id'},

        {keyword: 'homeDistrictName',desc: '区名称'},

        {keyword: 'homeProvinceId',desc: '省id'},

        {keyword: 'homeProvinceName',desc: '省名称'},

        {keyword: 'houseNumber',desc: '门牌号'},

        {keyword: 'name',desc: '姓名'},

        {keyword: 'nationalId',desc: '身份证号'},

        {keyword: 'phone',desc: '电话'},

        {keyword: 'processingStatusId',desc: '担保人节点状态'},

        {keyword: 'productNo',desc: '产品号'},

        {keyword: 'relationship',desc: '与借款人关系:暂时只显示夫妻'},

        {keyword: 'relationshipName',desc: '与借款人关系:暂时只显示夫妻'},

        {keyword: 'sex',desc: '性别'},

        {keyword: 'status',desc: '担保人状态'},

        {keyword: 'userGid',desc: '用户唯一标识'},

        {keyword: 'validDateRange',desc: '身份证有效期'},
    ],
    'guaranteeBankInfo':[
        {keyword: 'bankCardNumber',desc: '银行卡号'},

        {keyword: 'bankCityId',desc: '银行市id'},

        {keyword: 'bankCityName',desc: '开户行市'},

        {keyword: 'bankName',desc: '银行名称'},

        {keyword: 'bankPhone',desc: '银行卡预留手机号'},

        {keyword: 'bankProvinceId',desc: '银行省份id'},

        {keyword: 'bankProvinceName',desc: '开户行省份'},

        {keyword: 'identification',desc: '标识'},

        {keyword: 'rawAddTime',desc: '创建时间',cell:function(des,cdt){
            if(des){
                var time2=myTime(des);
                return time2;
            }else{
                return '';
            }
        }},

        {keyword: 'rawUpdateTime',desc: '修改时间',cell:function(des,cdt){
            if(des){
                var time2=myTime(des);
                return time2;
            }else{
                return '';
            }
        }},

        {keyword: 'reserve1',desc: '备用字段1'},

        {keyword: 'reserve2',desc: '备用字段2'},

        {keyword: 'status',desc: '状态'},

        {keyword: 'uskeyword:erId',desc: '关联用户信息表'},
    ]
}
function myTime(date){
         var arr=date.split("T");
         var d=arr[0];
       var darr = d.split('-');
    
       var t=arr[1];
       var tarr = t.split('.000');
       var marr = tarr[0].split(':');
    
       var dd = parseInt(darr[0])+"/"+parseInt(darr[1])+"/"+parseInt(darr[2])+" "+parseInt(marr[0])+":"+parseInt(marr[1])+":"+parseInt(marr[2]);
     return dd;
    }
    
     // 数字补0操作
    function  addZero(num) {
        return num < 10 ? '0' + num : num;
    } 
    
 function formatDateTime (date) {
        var time = new Date(Date.parse(date));
        time.setTime(time.setHours(time.getHours() + 8));
        var Y = time.getFullYear() + '-';
        var  M = this.addZero(time.getMonth() + 1) + '-';
        var D = this.addZero(time.getDate()) + ' ';
        var h = this.addZero(time.getHours()) + ':';
        var m = this.addZero(time.getMinutes()) + ':';
        var  s = this.addZero(time.getSeconds());
        return Y + M + D;
        // }
 }
export default Agriculture;


