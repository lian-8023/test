import { observable, action, computed ,configure,runInAction} from "mobx";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import GetAddressByCode from  '../../source/common/getAddressByCode';
var getAddressByCode=new GetAddressByCode; //根据编码获取地址

configure({enforceActions:true})

//observable data 注册一个数据，这个数据将会成为一个可mobx监测的数据
//2a portal 个人详情板块
export default class UserInfo2AStore {
    @observable UserMsg_data={};
    @observable loanInfoDTO={};
    @observable userInfo={};
    @observable bankInfo={};
    @observable contactInfo={};
    @observable workInfo={};
    @observable otherInfo={};
    @observable accessryInfo={
        viewPhone:"NO",//是否能看到完整号码
        callByTianr:"YES",//是否使用天润呼叫，YES=天润，NO=800
    };//附加参数
    
    @observable acountId="";
    @observable edit_type_select={};
    @observable _selected_addr={};
    @observable showAddress=false;
    @observable defaultAddr_val="";
    @observable defaultdata_val="";
    @observable _oldDataObj="";  //修改前的数据对象--用作保存时对比数据，如果数据一致则不请求服务器
    @observable msg_cont="";//发送短信内容
    @observable msgSendTo_url=""; //短信发送url地址
    @observable isShowSendMsgBtn=false;//是否显示发送重签短信
    @observable phoneSet="";
    @observable nameSet="";
    @observable addressSet="";
    @observable customerId="";
    @observable contactInfoBack={};  //个人详情各种电话号码传给collection record用
    @observable isModify=true;  //2A详情是否可修改
    
    //获取个人详情数据
    @action getUserInfo2A=()=>{
        let _url='';
        if(typeof(this.acountId)=="undefined" || this.acountId==""){
            this.resetUserInfo2a();
            return;
        }
        $(".contactOther label").addClass("hidden");  //联系人信息--其他联系人、旁系联系人 先隐藏
        $(".workPhoneMsg label").addClass("hidden");  //工作信息--单位手机、单位座机 先隐藏
        let pathname=window.location.pathname;
        if(pathname=='/portal'){
            _url='/node/UserMsg';  //2a 系统获取2a详情接口
            this.isModify=true;
        }else if(pathname=='/cp-portal'){
            _url='/node/search/2A/identity/info'  //cp portal 获取2a详情接口
            this.isModify=false;
        }
        let that=this;
        $.ajax({
            type:"post",
            url:_url,
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify({accountId:this.acountId})},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res){
                $("#loading").remove();
                if(!commonJs.ajaxGetCode(res)){
                    runInAction(() => {
                        that.resetUserInfo2a();
                    })
                    return;
                }
                runInAction(() => {
                    var _getData=res.data;
                    var _validInfo=_getData.validInfo?_getData.validInfo:null;
                    //贷款信息
                    if(!_validInfo || _validInfo==null){
                        that.resetUserInfo2a();
                        return ;
                    }
                    var accessryInfo_ajax = {
                        viewPhone:_getData.viewPhone,
                        callByTianr:_getData.callByTianr,
                        viewIdcard:_getData.viewIdcard
                    };
                    var _loanInfoDTO=_validInfo.loanInfoDTO;
                    var loanInfoDTO_ajax={};
                    if(_loanInfoDTO){
                        loanInfoDTO_ajax={
                            loanNumber:commonJs.is_obj_exist(_loanInfoDTO.loanNumber), //贷款号
                            processingInfoDTO:commonJs.is_obj_exist(commonJs.parseEnum(_loanInfoDTO.processingInfoDTO?_loanInfoDTO.processingInfoDTO.loanProcessingStatus:"")),//processing状态
                            loan_principal :commonJs.is_obj_exist(_loanInfoDTO.loan_principal), //贷款本钱
                            fundingSuccessDate:commonJs.is_obj_exist(_loanInfoDTO.fundingSuccessDate),//放款日期
                            loanStatus:commonJs.is_obj_exist(commonJs.parseEnum(_loanInfoDTO.loanStatus)), //loan状态
                            extensionQualification :_validInfo.extensionQualification?"是":"-", //展期状态
                        }
                    }
                    var homeProvince=getAddressByCode.getAddressByCode(_validInfo.homeProvinceId);
                    var homeCity=getAddressByCode.getAddressByCode(_validInfo.homeCityId);
                    var homeDistrict=getAddressByCode.getAddressByCode(_validInfo.homeDistrictId);

                    //渠道来源-仅显示sourceQuotient_array已有的字段
                    let sourceQuotient_array=["int_aishang3D","int_tongshan4D","int_yixin"];
                    let _sourceQuotient="";
                    for(let i=0;i<sourceQuotient_array.length;i++){
                        if(_validInfo.sourceQuotient && _validInfo.sourceQuotient==sourceQuotient_array[i]){
                            _sourceQuotient+= sourceQuotient_array[i] + " ";
                        }
                    }
                    //个人信息
                    var userInfo_ajax={
                        name:_validInfo.name, //姓名
                        gender:_validInfo.gender, //性别
                        homeAddress_area:homeProvince +' ' +homeCity+' '+homeDistrict, //家庭住址
                        homeAddress:_validInfo.homeAddress, //详细地址
                        housingSituation:commonJs.parseEnum(_validInfo.housingSituation), //住房情况
                        birthday:_validInfo.birthday, //出生日期
                        primaryPhone:_validInfo.primaryPhone, //手机号码
                        directReferencePhoneNumberConsistency:_validInfo.directReferencePhoneNumberConsistency, //手机号码是否一致
                        nationalId:_validInfo.nationalId, //二代身份证号
                        companyPhone:_validInfo.companyPhone, //单位座机
                        censusAddress:_validInfo.censusAddress, //户籍地址
                        homeProvinceId:_validInfo.homeProvinceId,  //家庭联系人省id
                        homeCityId:_validInfo.homeCityId,  //家庭联系人市id
                        homeDistrictId:_validInfo.homeDistrictId,  //家庭联系人区id
                        registrationId:_validInfo.registrationId,
                        haveFinishLoan:_validInfo.haveFinishLoan,
                        sourceQuotient:_sourceQuotient,  //客户渠道来源--外部人员用-只能看到三个
                        sourceQuotient_all:_validInfo.sourceQuotient,  //客户渠道来源--内部人员用-看到所有
                        customerPhoneNumberConsistency:_validInfo.customerPhoneNumberConsistency,  //电话号码是否一致
                        primaryPhoneOnlineTime:_validInfo.primaryPhoneOnlineTime, //手机号码-在网时长
                        secondTelNo:_validInfo.secondTelNo,  //第二号码
                        thirdTelNo:_validInfo.thirdTelNo  //第三号码
                    }

                    var edit_type_select_ajax={   //点击编辑后select对应数据循环值显示 (数组,默认值)
                        housingSituation:that.get_edit_select_val(_validInfo.housingSituations,_validInfo.housingSituation,'housingSituation'), //住房情况s
                        directReferenceRelation:that.get_edit_select_val(_validInfo.directReferenceRelations,_validInfo.directReferenceRelation,'directReferenceRelation'),
                        incomeSource:that.get_edit_select_val(_validInfo.incomeSources,_validInfo.incomeSource,'incomeSource'),
                        workTime:that.get_edit_select_val(_validInfo.workTimes,_validInfo.workTime,'workTime'),  //现单位工作时间
                        companyIndustryE:that.get_edit_select_val(_validInfo.companyIndustryEs,_validInfo.companyIndustryE,'companyIndustryE'),
                        workTypeE:that.get_edit_select_val(_validInfo.workTypeEa,_validInfo.workTypeE,'workTypeE'),//职业
                        highestEducation:that.get_edit_select_val(_validInfo.highestEducations,_validInfo.highestEducation,'highestEducation'),
                        loanPurpose:that.get_edit_select_val(_validInfo.loanPurposes,_validInfo.loanPurpose,'loanPurpose'),
                        otherReferenceRelation:that.get_edit_select_val(_validInfo.otherReferenceRelations,_validInfo.otherReferenceRelation,'otherReferenceRelation'),
                        undirectReferenceRelation:that.get_edit_select_val(_validInfo.undirectContactsRelations,_validInfo.undirectReferenceRelation,'undirectReferenceRelation'),
                        otherReferenceRelation2:that.get_edit_select_val(_validInfo.otherReferenceRelations,_validInfo.otherReferenceRelation2,'otherReferenceRelation2'),
                        maritalStatus:that.get_edit_select_val(_validInfo.maritalStatuss,_validInfo.maritalStatus,'maritalStatus'), //选填信息=》婚否
                        haveChild:that.get_edit_select_val([{value:1,name:1,displayName:"有"},{value:0,name:0,displayName:"无"}],_validInfo.haveChild,'haveChild'),
                        haveCar:that.get_edit_select_val([{value:1,name:1,displayName:"有"},{value:0,name:0,displayName:"无"}],_validInfo.haveCar,'haveCar'),
                        haveHouse:that.get_edit_select_val([{value:1,name:1,displayName:"有"},{value:0,name:0,displayName:"无"}],_validInfo.haveHouse,'haveHouse'),
                        liveTime:that.get_edit_select_val(_validInfo.workTimes,_validInfo.liveTime,'liveTime' )   //现住所居住时间
                    }
                    //银行信息
                    var bankProvince=getAddressByCode.getAddressByCode(_validInfo.bankProvinceId);
                    var bankCity=getAddressByCode.getAddressByCode(_validInfo.bankCityId);
                    var bankDistrict=getAddressByCode.getAddressByCode(_validInfo.bankDistrictId);

                    var bankInfo_ajax={
                        bankName:_validInfo.bankName, //银行名称
                        bankCardNumber:_validInfo.bankCardNumber, //银行卡号
                        bankBranch:_validInfo.bankBranch, //开户支行
                        bank_area:bankProvince +' '+bankCity +' '+bankDistrict, //开户所在地
                        bankProvinceId:_validInfo.bankProvinceId,  //开户行省ID
                        bankCityId:_validInfo.bankCityId,  //开户行市ID
                        bankDistrictId:_validInfo.bankDistrictId,  //开户行区ID
                        bankReservePhone:_validInfo.bankReservePhone,  //银行卡预留手机号
                        unionPayId:_validInfo.unionPayId?_validInfo.unionPayId:0,  //需要发送银联重签短信的唯一标示
                        isAuthSendSms:_validInfo.isAuthSendSms?_validInfo.isAuthSendSms:0  //是否展示重签短信
                    }
                    let _isShowSendMsgBtn=false;
                    if(bankInfo_ajax && bankInfo_ajax.isAuthSendSms==1){
                        _isShowSendMsgBtn=true;
                    }
                    if(bankInfo_ajax && bankInfo_ajax.isAuthSendSms==0 && bankInfo_ajax.unionPayId){
                        _isShowSendMsgBtn=true;
                    }
                    that.isShowSendMsgBtn=_isShowSendMsgBtn;

                    //联系人信息
                    var directReferenceProvince=getAddressByCode.getAddressByCode(_validInfo.directReferenceProvinceId);
                    var directReferenceCity=getAddressByCode.getAddressByCode(_validInfo.directReferenceCityId);
                    var directReferenceDistrict=getAddressByCode.getAddressByCode(_validInfo.directReferenceDistrictId);
                    var _otherReferenceType=_validInfo.otherReferenceType;  //联系人类型
                    $(".contactOther [data-otherreferencetype='"+_validInfo.otherReferenceType +"']").removeClass("hidden");
                    $(".contactOther [data-otherreferencetype]").find(".myRadio").addClass("hidden");
                    var contactInfo_ajax={
                        otherReferenceType:_validInfo.otherReferenceType,
                        directReferenceName:_validInfo.directReferenceName,
                        directReferenceRelation:commonJs.parseEnum(_validInfo.directReferenceRelation),
                        directReferencePhone:_validInfo.directReferencePhone,
                        direct_area:directReferenceProvince +' '+directReferenceCity +' '+directReferenceDistrict,
                        directReferenceAddress:_validInfo.directReferenceAddress,
                        otherReferenceName:_validInfo.otherReferenceName,
                        otherReferenceRelation:commonJs.parseEnum(_validInfo.otherReferenceRelation),  //联系人信息--其他联系人
                        otherReferenceRelations:_validInfo.otherReferenceRelations,  //联系人信息--其他联系人select
                        otherReferencePhone:_validInfo.otherReferencePhone,
                        undirectReferenceName:_validInfo.undirectReferenceName,
                        undirectReferenceRelation:commonJs.parseEnum(_validInfo.undirectReferenceRelation),  //联系人信息--旁系联系人
                        undirectContactsRelations:_validInfo.undirectContactsRelations,  //联系人信息--其他联系人select
                        undirectReferencePhone:_validInfo.undirectReferencePhone,
                        undirectReferencePhoneNumberConsistency:_validInfo.undirectReferencePhoneNumberConsistency, //旁系联系人电话号码是否一致
                        otherReferencePhoneNumberConsistency:_validInfo.otherReferencePhoneNumberConsistency, //其他联系人电话号码是否一致
                        otherReferenceName2:_validInfo.otherReferenceName2,
                        otherReferenceRelation2:commonJs.parseEnum(_validInfo.otherReferenceRelation2),
                        otherReferencePhone2:_validInfo.otherReferencePhone2,
                        otherReferencePhone2NumberConsistency:_validInfo.otherReferencePhone2NumberConsistency,//其他联系人2电话号码是否一致
                        directReferencePhoneOnlineTime:_validInfo.directReferencePhoneOnlineTime,
                        otherReferencePhoneOnlineTime:_validInfo.otherReferencePhoneOnlineTime,
                        otherReferencePhone2OnlineTime:_validInfo.otherReferencePhone2OnlineTime,
                        directReferenceProvinceId:_validInfo.directReferenceProvinceId,
                        directReferenceCityId:_validInfo.directReferenceCityId,
                        directReferenceDistrictId:_validInfo.directReferenceDistrictId
                    }

                    //工作信息
                    var companyProvince=getAddressByCode.getAddressByCode(_validInfo.companyProvinceId);
                    var companyCity=getAddressByCode.getAddressByCode(_validInfo.companyCityId);
                    var companyDistrict=getAddressByCode.getAddressByCode(_validInfo.companyDistrictId);
                    var _companyPhoneAreaCode=_validInfo.companyPhoneAreaCode?_validInfo.companyPhoneAreaCode:""; //单位固话，电话类型为FIXED，座机区号
                    var _companyPhone=_validInfo.companyPhone?_validInfo.companyPhone:""; //单位固话，电话类型为FIXED，座机号
                    var _companyPhoneExtNumber=_validInfo.companyPhoneExtNumber?_validInfo.companyPhoneExtNumber:""; //单位固话，电话类型为FIXED，分机号
                    var _tellPhoneNo="";

                    $(".workPhoneMsg [data-companyphonetype='"+_validInfo.companyPhoneType+"']").removeClass("hidden");

                    if(_validInfo.companyPhoneType=="FIXED"){
                        _tellPhoneNo=commonJs.is_obj_exist(_companyPhoneAreaCode)+" - "+commonJs.is_obj_exist(_companyPhone)+" - "+commonJs.is_obj_exist(_companyPhoneExtNumber);
                    }else{
                        _tellPhoneNo=_validInfo.companyPhoneMobile;
                    }


                    var workInfo_ajax={
                        companyPhoneType:_validInfo.companyPhoneType,
                        incomeSource:commonJs.parseEnum(_validInfo.incomeSource),
                        incomeCash:_validInfo.incomeCash,
                        incomeDdi:_validInfo.incomeDdi,
                        company:_validInfo.company,
                        paydate:_validInfo.paydate,
                        position:_validInfo.position,
                        companyAddress:_validInfo.companyAddress,
                        workTime:commonJs.parseEnum(_validInfo.workTime),
                        companyIndustryE:commonJs.parseEnum(_validInfo.companyIndustryE),
                        workTypeE:commonJs.parseEnum(_validInfo.workTypeE),
                        company_area:companyProvince +' '+companyCity +' '+companyDistrict,
                        companyPhoneOnlineTime:_validInfo.companyPhoneOnlineTime,  //单位电话-在网时长
                        companyProvinceId:_validInfo.companyProvinceId,
                        companyCityId:_validInfo.companyCityId,
                        companyDistrictId:_validInfo.companyDistrictId,
                        tellPhoneNo:_tellPhoneNo,
                        companyPhoneAreaCode:_validInfo.companyPhoneAreaCode,  //单位固话，电话类型为FIXED，座机区号 
                        companyPhone:_validInfo.companyPhone,  //单位固话，电话类型为FIXED，座机号 
                        companyPhoneExtNumber:_validInfo.companyPhoneExtNumber,  //单位固话，电话类型为FIXED，分机号
                        companyPhoneMobile:_validInfo.companyPhoneMobile,  //单位手机号码，电话类型为MOBILE时获取该值
                    }

                    //选填信息
                    var otherInfo_ajax={
                        highestEducation:commonJs.parseEnum(_validInfo.highestEducation),
                        graduationYear:_validInfo.graduationYear,
                        graduationSchool:_validInfo.graduationSchool,
                        haveChild:_validInfo.haveChild==1?'有':'无',
                        liveTime:_validInfo.liveTime?_validInfo.liveTime.displayName:"",
                        loanPurpose:commonJs.parseEnum(_validInfo.loanPurpose),
                        haveCar:_validInfo.haveCar==1?'有':'无',
                        haveHouse:_validInfo.haveHouse==1?'有':'无',
                        maritalStatus:_validInfo.maritalStatus?_validInfo.maritalStatus.displayName:"",
                        qq:_validInfo.qq,
                        weixin:_validInfo.weixin,
                        recommended_phone:_validInfo.recommendedPhone,
                        requestAmount:_validInfo.requestAmount,//逾期贷款金额，只读不能修改
                        isMoreIncome:_validInfo.isMoreIncome,//电核更多收入
                    }
                    //个人详情各种电话号码传给其他组件用
                    let _contactInfoBack={};
                    _contactInfoBack.userName=commonJs.is_obj_exist(userInfo_ajax.name);  //本人姓名
                    _contactInfoBack.primaryPhone=commonJs.is_obj_exist(userInfo_ajax.primaryPhone);  //本人注册
                    _contactInfoBack.secondTelNo=commonJs.is_obj_exist(userInfo_ajax.secondTelNo);  //本人第二号码
                    _contactInfoBack.thirdTelNo=commonJs.is_obj_exist(userInfo_ajax.thirdTelNo);  //本人第三号码
                    _contactInfoBack.company=commonJs.is_obj_exist(workInfo_ajax.company);  //单位名称
                    if(_validInfo.companyPhoneType=="FIXED"){
                        _tellPhoneNo=_companyPhoneAreaCode+_companyPhone+_companyPhoneExtNumber;
                    }else{
                        _tellPhoneNo=_validInfo.companyPhoneMobile;
                    }
                    _contactInfoBack.companyPhone=_tellPhoneNo;  //单位座机(公司电话)
                    _contactInfoBack.directReferenceName=commonJs.is_obj_exist(contactInfo_ajax.directReferenceName);  //第一联系人名称
                    _contactInfoBack.directReferencePhone=commonJs.is_obj_exist(contactInfo_ajax.directReferencePhone);  //第一联系人（家庭联系人）
                    let twoName=commonJs.is_obj_exist(contactInfo_ajax.otherReferenceType=="OTHER"?contactInfo_ajax.otherReferenceName:contactInfo_ajax.undirectReferenceName )
                    _contactInfoBack.twoName=commonJs.is_obj_exist(twoName);  //第二联系人姓名
                    let twoPhone=(contactInfo_ajax.otherReferenceType=="OTHER"?contactInfo_ajax.otherReferencePhone:contactInfo_ajax.undirectReferencePhone);
                    _contactInfoBack.twoPhone=commonJs.is_obj_exist(twoPhone);  //第二联系人（手机/固话2）
                    _contactInfoBack.otherReferenceName2=commonJs.is_obj_exist(contactInfo_ajax.otherReferenceName2);  //第三联系人（手机/固话1）
                    _contactInfoBack.otherReferencePhone2=commonJs.is_obj_exist(contactInfo_ajax.otherReferencePhone2);  //第三联系人（手机/固话1）
                    _contactInfoBack.bankpPhoneNo=commonJs.is_obj_exist(_validInfo.bankReservePhone);  //第三联系人（手机/固话1）
                    that.contactInfoBack=_contactInfoBack;
                    //更新数据
                    that.loanInfoDTO=loanInfoDTO_ajax;
                    that.userInfo=userInfo_ajax;
                    that.bankInfo=bankInfo_ajax;
                    that.contactInfo=contactInfo_ajax;
                    that.workInfo=workInfo_ajax;
                    that.otherInfo=otherInfo_ajax;
                    that.edit_type_select=edit_type_select_ajax;
                    that.accessryInfo=accessryInfo_ajax;
                    that.phoneSet=_validInfo.phoneSet;
                    that.nameSet=_validInfo.nameSet;
                    that.addressSet=_validInfo.addressSet;
                    that.customerId=_validInfo.customerId
                })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }

    @action get_edit_select_val(obj,current_obj,id){
        if(!obj || obj.length<=0){
            return;
        }
        let edit_seletct='<select name="" id="'+id+'" class="select-gray ml20 edited-select"><option value="">请选择</option>';
        for (let i=0;i<obj.length;i++){
            if (current_obj && current_obj.value==obj[i].value){  //设置默认值
                edit_seletct+='<option selected="selected" value="'+obj[i].name+'">'+obj[i].displayName +'</option>';
            }else {
                edit_seletct+='<option value="'+obj[i].name+'">'+obj[i].displayName +'</option>';
            }
        }
        edit_seletct+= '</select>';
        return edit_seletct;
    }
    //重置所有信息
    @action resetUserInfo2a=()=>{
        this.UserMsg_data={};
        this.loanInfoDTO={};
        this.userInfo={};
        this.bankInfo={};
        this.contactInfo={};
        this.workInfo={};
        this.otherInfo={};
        this.edit_type_select={};
        this.accessryInfo={};
        this.acountId="";
        this._selected_addr={};
        this.showAddress=false;
        this.defaultAddr_val="";
        this.defaultdata_val="";
        this._oldDataObj="";  //修改前的数据对象--用作保存时对比数据，如果数据一致则不请求服务器
        this.msg_cont="";//发送短信内容
        this.msgSendTo_url=""; //短信发送url地址
        this.isShowSendMsgBtn=false;//是否显示发送重签短信
        this.phoneSet="";
        this.nameSet="";
        this.addressSet="";
        this.customerId=""
        this.contactInfoBack={};  //个人详情各种电话号码传给collection record用
    }
}