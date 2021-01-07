import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import Address from './address';
import GetAddressByCode from  '../../source/common/getAddressByCode';
var getAddressByCode=new GetAddressByCode; //根据编码获取地址
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import UserMsgControler from '../../source/common/userMsgControler';
var userMsgControler=new UserMsgControler;
import BankName from '../../source/common/bankName';
import callCofig from '../../template/callSystemConfig';
var bankName=new BankName;
// 选择时间组件
import { DatePicker ,Button} from 'antd';
const { MonthPicker, RangePicker } = DatePicker;

class UserMsg extends React.Component {
    constructor(props){
        super(props);
        this.state={
            UserMsg_data:{},
            loanInfoDTO:{},
            userInfo:{},
            bankInfo:{},
            contactInfo:{},
            workInfo:{},
            otherInfo:{},
            accessryInfo:{
                viewPhone:"NO",//是否能看到完整号码
                callByTianr:"YES",//是否使用天润呼叫，YES=天润，NO=800
            },//附加参数
            edit_type_select:{},
            _selected_addr:{},
            showAddress:false,
            defaultAddr_val:"",
            this_params:this.props._params,  //用户ID
            this_loanNumber:this.props._loanNumber,
            defaultdata_val:"",
            _oldDataObj:"",  //修改前的数据对象--用作保存时对比数据，如果数据一致则不请求服务器
            msg_cont:"",//发送短信内容
            msgSendTo_url:"", //短信发送url地址
            isShowSendMsgBtn:false,//是否显示发送重签短信
            a:""
        }
        this.get_edit_select_val=function(obj,current_obj,id){
            if(!obj || obj.length<=0){
                return;
            }
            var edit_seletct='<select name="" id="'+id+'" class="select-gray ml20 edited-select"><option value="">请选择</option>';
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
    }
    //获取地址
    getAddress(addrObj){
        var new_selected_addr={
            pince:addrObj.prince,
            pince_id:addrObj.pince_id,
            city:addrObj.city,
            city_id:addrObj.city_id,
            district:addrObj.district,
            district_id:addrObj.district_id
        };
        this.setState({
            _selected_addr:new_selected_addr
        })
    }
    UNSAFE_componentWillMount(){
        
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps==this.props){
            return;
        }
        var _oper_type_props = nextProps._oper_type_props;
        if(_oper_type_props && _oper_type_props=="noload"){
            return;
        }
        this.setState({this_params:nextProps._params},()=>{
            this.pub_getMsg(nextProps._params);
        });
    }
    componentDidMount (){
        console.log(this.props.this_params)
        this.pub_getMsg(this.state.this_params);
        commonJs.reloadRules();

        $(".detail-top-select").addClass("hidden");
        var _that=this;
        $(".contactMsg-edit").click(function () {
            // $(".contactOther label").removeClass("hidden");
            $(".contactOther label i").click(function () {
                let $this=$(event.target);
                let thisType=$this.parent().attr("data-otherreferencetype");
                _that.controlOtherReference(thisType);
            })
        })
        $(".workPhoneMsg").on("click","i",function(){
            let this_data_name=$(this).attr("data-name");
            _that.controlCompanyPhoneText(this_data_name);
        })
        //根据银行卡号获取银行名称
        $(".bankCard-li").on("keyup",".editInput",function(){
            var cardNo=$(".bankCard-li .editInput").val();
            let getBankName='';
            if(cardNo.length>9){
                $.ajax({
                    type:"get",
                    url:"/common/bank/all",
                    async:true,
                    dataType: "JSON",
                    data:{
                        bankCardNo:cardNo
                    },
                    success:function(res) {
                        if (!commonJs.ajaxGetCode(res)) {
                            return;
                        }
                        let _getData = res.data;
                        getBankName=_getData.bankName;
                        $(".bankName-li .editInput").val(getBankName);
                    }
                })
            }
        })
        
    }

    //联系人信息-修改
    edit_OtherReference(){
        var _contactInfo = this.state.contactInfo;  //工作信息
        this.controlOtherReference(_contactInfo.otherReferenceType);
    }
    /**
     * 联系人信息-其他联系人和旁系联系人切换效果
     * @param referenceType 联系人类型 OTHER
     */
    controlOtherReference(referenceType){
        var _that=this;
        let accessryInfo = this.state.accessryInfo;
        $(".referenceEditClass [data-otherreferencetype]").removeClass("hidden");
        $(".referenceEditClass [data-otherreferencetype]").find(".myRadio").removeClass("hidden").removeClass("myRadio-visited").addClass("myRadio-normal");
        $(".referenceEditClass [data-otherreferencetype='"+referenceType+"']").find(".myRadio").removeClass("myRadio-normal").addClass("myRadio-visited");
        var _contactInfo = this.state.contactInfo;
        if(referenceType=="OTHER"){
            $(".cantact-name .editInput").attr("data-inp-paramname","otherReferenceName").val(_contactInfo.otherReferenceName);
            $(".cantact-phone .editInput").attr("data-inp-paramname","otherReferencePhone").val(commonJs.phoneReplace(accessryInfo.viewPhone,_contactInfo.otherReferencePhone));
            $(".cantact-relation .editInput").attr("data-inp-paramname","otherReferenceRelation").val(_contactInfo.otherReferenceRelation);
            $(".cantact-relation .msg-cont").attr("data-paramname","otherReferenceRelation");
            var _otherReferenceRelations=_contactInfo.otherReferenceRelations;
            var new_select='';//设置默认值
            for(let i=0;i<_otherReferenceRelations.length;i++){
                new_select+='<option value='+_otherReferenceRelations[i].name+" "+(_contactInfo.otherReferenceRelation==_otherReferenceRelations[i].displayName?'selected="selected"':'')+'>'+_otherReferenceRelations[i].displayName+'</option>'
            }
            $(".cantact-relation select").html(new_select);
        }else{
            $(".cantact-name .editInput").attr("data-inp-paramname","undirectReferenceName").val(_contactInfo.undirectReferenceName);
            $(".cantact-phone .editInput").attr("data-inp-paramname","undirectReferencePhone").val(commonJs.phoneReplace(accessryInfo.viewPhone,_contactInfo.undirectReferencePhone));
            $(".cantact-relation .editInput").attr("data-inp-paramname","undirectReferenceRelation").val(_contactInfo.undirectReferenceRelation);
            $(".cantact-relation .msg-cont").attr("data-paramname","undirectReferenceRelation");
            var _undirectContactsRelations=_contactInfo.undirectContactsRelations;
            var new_select='';//设置默认值
            for(let i=0;i<_undirectContactsRelations.length;i++){
                new_select+='<option value='+_undirectContactsRelations[i].name+" "+(_contactInfo.undirectReferenceRelation==_undirectContactsRelations[i].displayName?'selected="selected"':'')+'>'+_undirectContactsRelations[i].displayName+'</option>'
            }
            $(".cantact-relation select").html(new_select)
        }
    }

    //工作信息-修改
    edit_CompanyPhoneText(){
        var workInfo_result = this.state.workInfo;  //工作信息
        this.controlCompanyPhoneText(workInfo_result.companyPhoneType);
    }

    /**
     * 工作信息-单位手机和座机切换效果
     * @param companyTellType 需要切换到的类型FIXED 、MOBILE
     */
    controlCompanyPhoneText(companyTellType){
        let accessryInfo = this.state.accessryInfo;
        var workInfo_result = this.state.workInfo;  //工作信息
        $(".workPhoneMsg [data-companyphonetype]").removeClass("hidden");
        $(".workPhoneMsg [data-companyphonetype]").find(".myRadio").removeClass("hidden").removeClass("myRadio-visited").addClass("myRadio-normal");
        $(".workPhoneMsg [data-companyphonetype='"+companyTellType+"']").find(".myRadio").removeClass("myRadio-normal").addClass("myRadio-visited");
        if(companyTellType=="FIXED"){
            $(".FIXED-edit-div .area-No").val(workInfo_result.companyPhoneAreaCode ? workInfo_result.companyPhoneAreaCode : "");
            $(".FIXED-edit-div .phone-No").val(workInfo_result.companyPhone ? commonJs.phoneReplace(accessryInfo.viewPhone,workInfo_result.companyPhone) : "");
            $(".FIXED-edit-div .brach-No").val(workInfo_result.companyPhoneExtNumber ? workInfo_result.companyPhoneExtNumber : "");
            $(".cpyTellPhone").find(".FIXED-edit-div").removeClass("hidden");
            $(".cpyTellPhone").find(".MOBILE-edit-div").addClass("hidden");
        }else{
            $(".cpyTellPhone").find(".FIXED-edit-div").addClass("hidden");
            $(".cpyTellPhone").find(".MOBILE-edit-div").removeClass("hidden");
            $(".MOBILE-edit-inp").val(workInfo_result.companyPhoneMobile ? commonJs.phoneReplace(accessryInfo.viewPhone,workInfo_result.companyPhoneMobile) : "");
        }
    }
    /**
     * 处理未获取到user数据时需要数据清空
     */
    empty_msg_param(){
        this.setState({
            loanInfoDTO:{},
            userInfo:{},
            bankInfo:{},
            contactInfo:{},
            workInfo:{},
            otherInfo:{},
            edit_type_select:{},
        })
        this.callbackFuncToUp('','',"","","","","","","","","","","",{},"","NO");
    }
    getMsg(){
        this.pub_getMsg(this.state.this_params);
    }

    callbackFuncToUp(bankName,bankCardNumber,registrationId,loanNumber,nationalId,company,companyPhone,userPhoneNo,cardNo,customerId,userName,sex,allPhoneNo,sourceQuotient,haveFinishLoan){
        if(this.props.callbackFunc){
            this.props.callbackFunc(bankName,bankCardNumber,registrationId,loanNumber,nationalId,company,companyPhone,userPhoneNo,cardNo,customerId,userName,sex,allPhoneNo,sourceQuotient,haveFinishLoan);
        }
    }
    //获取页面数据
    pub_getMsg(newAcountId){
        var that=this;
        if(typeof(newAcountId)=="undefined" || newAcountId==""){
            this.empty_msg_param();
            return;
        }
        $(".contactOther label").addClass("hidden");  //联系人信息--其他联系人、旁系联系人 先隐藏
        $(".workPhoneMsg label").addClass("hidden");  //工作信息--单位手机、单位座机 先隐藏
        $.ajax({
            type:"post",
            url:"/node/UserMsg",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify({accountId:newAcountId})},
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.empty_msg_param();
                    return;
                }
                var _getData=res.data;

                var _validInfo=_getData.validInfo?_getData.validInfo:null;
                //贷款信息
                if(!_validInfo || _validInfo==null){
                    that.empty_msg_param();
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
                    liveTime:that.get_edit_select_val(_validInfo.workTimes,_validInfo.liveTime,'liveTime')   //现住所居住时间
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
                that.setState({
                    isShowSendMsgBtn:_isShowSendMsgBtn
                })

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
                //个人详情各种电话号码传给collection record用
                let _allPhoneNo={};
                _allPhoneNo.userName=commonJs.is_obj_exist(userInfo_ajax.name);  //本人姓名
                _allPhoneNo.primaryPhone=commonJs.is_obj_exist(userInfo_ajax.primaryPhone);  //本人注册
                _allPhoneNo.secondTelNo=commonJs.is_obj_exist(userInfo_ajax.secondTelNo);  //本人第二号码
                _allPhoneNo.thirdTelNo=commonJs.is_obj_exist(userInfo_ajax.thirdTelNo);  //本人第三号码
                _allPhoneNo.company=commonJs.is_obj_exist(workInfo_ajax.company);  //单位名称
                if(_validInfo.companyPhoneType=="FIXED"){
                    _tellPhoneNo=_companyPhoneAreaCode+_companyPhone+_companyPhoneExtNumber;
                }else{
                    _tellPhoneNo=_validInfo.companyPhoneMobile;
                }
                _allPhoneNo.companyPhone=_tellPhoneNo;  //单位座机(公司电话)
                _allPhoneNo.directReferenceName=commonJs.is_obj_exist(contactInfo_ajax.directReferenceName);  //第一联系人名称
                _allPhoneNo.directReferencePhone=commonJs.is_obj_exist(contactInfo_ajax.directReferencePhone);  //第一联系人（家庭联系人）
                let twoName=commonJs.is_obj_exist(contactInfo_ajax.otherReferenceType=="OTHER"?contactInfo_ajax.otherReferenceName:contactInfo_ajax.undirectReferenceName )
                _allPhoneNo.twoName=commonJs.is_obj_exist(twoName);  //第二联系人姓名
                let twoPhone=(contactInfo_ajax.otherReferenceType=="OTHER"?contactInfo_ajax.otherReferencePhone:contactInfo_ajax.undirectReferencePhone);
                _allPhoneNo.twoPhone=commonJs.is_obj_exist(twoPhone);  //第二联系人（手机/固话2）
                _allPhoneNo.otherReferenceName2=commonJs.is_obj_exist(contactInfo_ajax.otherReferenceName2);  //第三联系人（手机/固话1）
                _allPhoneNo.otherReferencePhone2=commonJs.is_obj_exist(contactInfo_ajax.otherReferencePhone2);  //第三联系人（手机/固话1）
                _allPhoneNo.bankpPhoneNo=commonJs.is_obj_exist(_validInfo.bankReservePhone);  //第三联系人（手机/固话1）
                that.callbackFuncToUp(
                    bankInfo_ajax.bankName,
                    bankInfo_ajax.bankCardNumber,
                    userInfo_ajax.registrationId,
                    loanInfoDTO_ajax.loanNumber,
                    userInfo_ajax.nationalId,
                    workInfo_ajax.company,
                    workInfo_ajax.tellPhoneNo,
                    userInfo_ajax.primaryPhone,
                    bankInfo_ajax.bankCardNumber,
                    _validInfo.customerId,
                    _validInfo.name,
                    (userInfo_ajax.gender?userInfo_ajax.gender.displayName:"-"),
                    _allPhoneNo,
                    _validInfo.sourceQuotient,
                    _validInfo.haveFinishLoan
                );
                that.setState({
                    loanInfoDTO:loanInfoDTO_ajax,
                    userInfo:userInfo_ajax,
                    bankInfo:bankInfo_ajax,
                    contactInfo:contactInfo_ajax,
                    workInfo:workInfo_ajax,
                    otherInfo:otherInfo_ajax,
                    edit_type_select:edit_type_select_ajax,
                    accessryInfo:accessryInfo_ajax,
                    phoneSet:_validInfo.phoneSet,
                    nameSet:_validInfo.nameSet,
                    addressSet:_validInfo.addressSet,
                    customerId:_validInfo.customerId
                })
            }
        })
    }
    //发送短信--弹框
    sendMsg(){
        this.getMsg();
        let _that=this;
        let _accound=this.state.this_params;
        let _loanNumber=this.state.loanInfoDTO.loanNumber;
        let _bankReservePhone=this.state.bankInfo.bankReservePhone;  //银行卡预留手机号
        let _bankCardNumber=$(".bank-msg .bankCard-li .msg-cont[data-paramname='bankCardNumber']").text();
        let _bankName=$(".bank-msg .bankName-li .msg-cont").text();
        let _oName=$(".bank-msg b[data-paramname='oName']").text();
        if(!_accound || _accound==""){
            alert("账号不能为空！")
            return;
        }
        if(!_loanNumber || _loanNumber==""){
            alert("合同号不能为空！");
            return;
        }
        if(!_bankCardNumber || _bankCardNumber==""){
            alert("银行卡号不能为空！");
            return;
        }
        if(!_bankName || _bankName==""){
            alert("银行名称不能为空！");
            return;
        }
        if(!_oName || _oName==""){
            alert("oName不能为空！");
            return;
        }
        $.ajax({
            type:"get",
            url:"/node/smsmodel",
            async:true,
            dataType: "JSON",
            data:{
                accountId:_accound,
                loanNumber:_loanNumber,
                bankName:_bankName,
                bankCardNumber:_bankCardNumber,
                oName:_oName,
                bankReservePhone:_bankReservePhone
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                _that.setState({
                    msg_cont:_getData.resign_sms_content,
                    msgSendTo_url:_getData.resign_url
                });
                $(".sendMsg-prop .msg-content").val(_that.state.msg_cont);
                $(".sendMsg-prop").removeClass("hidden");
            }
        })
    }
    //点击发送
    sendTo_fn(){
        let _that=this;
        $.ajax({
            type:"get",
            url:"/node/sendSMS",
            async:true,
            dataType: "JSON",
            data:{
                accountId:_that.state.this_params,
                loanNumber:_that.state.loanInfoDTO.loanNumber,
                resign_url:_that.state.msgSendTo_url,
                primaryPhone:_that.state.userInfo.primaryPhone,
                unionpayId:_that.state.bankInfo.unionPayId
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                $(".sendMsg-prop").addClass("hidden");
                _that.getMsg();
            }
        })
    }
    closeSendMsg(){
        $(".sendMsg-prop").addClass("hidden");
    }
    //设置密码--保存
    EditUserPwd(event){
        let _that=this;
        let $this=$(event.target);
        let _password=$this.closest(".bar").find(".userPassword").val();
        let _password_sure=$this.closest(".bar").find(".userPassword_sure").val();
        if (_password!=_password_sure){
            alert("确认密码和新密码不一致，请重新输入！");
            return;
        }
        $.ajax({
            type:"get",
            url:"/node/user/pwd",
            async:false,
            dataType: "JSON",
            data:{
                accountId:this.state.this_params,
                primaryPhone:this.state.userInfo.primaryPhone,
                password:_password
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                if(!_getData.executed){
                    console.log("设置密码失败");
                    return;
                }
                alert(_getData.message);
                $this.closest(".bar").find(".userPassword").val("");
                $this.closest(".bar").find(".userPassword_sure").val("");
            }
        })
    }
    //设置密码--取消
    cancelUserPwd(event){
        let $this=$(event.target);
        $this.closest(".bar").find(".userPassword").val("");
        $this.closest(".bar").find(".userPassword_sure").val("");
    }
    // 电话图标
    callPhone(phoneNo){
        console.log('into callPhone:',phoneNo);
        let _location=this.props.get_location;
        let accessryInfo = this.state.accessryInfo;
        if(_location=="/AST"){
            console.log('callPhone /AST:',phoneNo);
            if(callCofig.sys == 'new'){
                if(callCofig.Ccbar.call){
                    callCofig.Ccbar.call(phoneNo);
                }else{
                    alert('请先登录呼叫系统');
                }
            }else{
                location.href="ALICCT:dialout?calleeno="+commonJs.queueEncypt800("/AST",phoneNo);
            }
        }else if(_location=="/AST2"){
            console.log('callPhone /AST2:',phoneNo);
            location.href="ALICCT:dialout?calleeno="+commonJs.queueEncypt800("/AST2",phoneNo);
        }else if(_location=="OCR"){
            location.href="ALICCT:dialout?calleeno="+commonJs.queueEncypt800("OCR",phoneNo);
        }else{
            console.log('callPhone else:',accessryInfo.callByTianr);
            if(accessryInfo.callByTianr=="YES"){
                voipCallPhone(phoneNo);
            }else{
                location.href="ALICCT:dialout?calleeno="+commonJs.encypt800(phoneNo);
            }
        }  
    }
    //注销
    logout=(e,userInfo_result)=>{
        e.stopPropagation();
        let {primaryPhone} = userInfo_result
        if(primaryPhone&&primaryPhone.length>0){
            $.ajax({
                type:"post",
                url:'/node/identity/logout',
                async:true,
                dataType: "JSON",
                data:{phone:primaryPhone},
                success:function(res) {
                    if (!commonJs.ajaxGetCode(res)) {
                        return;
                    }
                    alert(res.message);
                }
            })
        }else{
            alert('该用户信息缺失手机号');
        }
    }
    // 电话号码验证
    myaer(event){
        let $this=$(event.target);
        var _val=$this.val();
        var phoneVeri=!(/^1\d{10}$/.test(_val));
        if(_val.length>0 && (isNaN(_val) || phoneVeri) && _val.indexOf("0")!=0){
            $this.addClass("warnBg");
        }else{
            $this.removeClass("warnBg");
        }
    }
    /**
     * 判断信息是否一致，若一致文字提示红色
     * @param {*} info 需要作判断的数据
     * @param {*} type 类型：姓名:name、电话:phone、详细地址:addr
     */
    isSame(info,type){
        if(!info){
            return;
        }
        let baseArray=[];
        let result=false;
        if(type=="name"){
            baseArray=this.state.nameSet;
        }else if(type=="phone"){
            baseArray=this.state.phoneSet;
        }else if(type=="addr"){
            baseArray=this.state.addressSet;
        }
        for(let i=0;i<baseArray.length;i++){
            if(info==baseArray[i]){
                result=true;
            }
        }
        return result;
    }
    render() {
        let loanInfoDTO_result=this.state.loanInfoDTO,  //贷款信息
            userInfo_result =this.state.userInfo,  //个人信息
            bankInfo_result = this.state.bankInfo,  //银行信息  
            contactInfo_result = this.state.contactInfo,  //联系人信息
            workInfo_result = this.state.workInfo,  //工作信息
            otherInfo_result = this.state.otherInfo ; //选填信息
        let accessryInfo = this.state.accessryInfo;
        let contactInfoOtherPhone = (contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferencePhone:contactInfo_result.undirectReferencePhone);
        let commonJs=new CommonJs;
        //身份证号打星
        let newNationalId=commonJs.newNationalIdReplace(accessryInfo.viewIdcard,userInfo_result.nationalId);
        return (
            <div className="auto-box pr5 relative">
                <div className="toggle-box mt10" data-btn-rule="RULE:DETAIL:LOAN:DIV">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit on" onClick={commonJs.content_toggle.bind(this)}>
                        贷款信息
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <div className="bar mt5 loanInfoDTO">
                        <ul className="info-ul loan-msg">
                            <li>
                                <p className="msg-tit">贷款号码</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.loanNumber:"")}>
                                    {commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.loanNumber:"")}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">贷款本钱</p>
                                <b className="msg-cont" data-paramname="loan_principal">{commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.loan_principal:"")}</b>
                            </li>
                            <li>
                                <p className="msg-tit">放款日期</p>
                                <b className="msg-cont" data-paramname="fundingSuccessDate">{commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.fundingSuccessDate:"")}</b>
                            </li>
                            <li>
                                <p className="msg-tit">loan状态</p>
                                <b className="msg-cont" data-paramname="loanStatus">{commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.loanStatus:"")}</b>
                            </li>
                            <li>
                                <p className="msg-tit">processing状态</p>
                                <b className="msg-cont" data-paramname="processingInfoDTO" title={commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.processingInfoDTO:"")}>
                                    {commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.processingInfoDTO:"")}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">展期状态</p>
                                <b className="msg-cont" data-paramname="extensionQualification">{commonJs.is_obj_exist(loanInfoDTO_result?loanInfoDTO_result.extensionQualification:"")}</b>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="toggle-box mt10" data-btn-rule="RULE:DETAIL:USERINFO:DIV">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        个人信息
                        <Button type="primary" style={{marginLeft: '75%',width: '65px',height: '27px'}} onClick={(e)=>{this.logout(e,userInfo_result)}} >注销</Button>
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <ul className="info-ul personal-msg">
                            <li>
                                <p className="msg-tit">姓名</p>
                                <b className={this.isSame(userInfo_result.name,"name")?"msg-cont red":"msg-cont"} data-paramname="name" data-edit-type="input">
                                    {commonJs.is_obj_exist(userInfo_result.name)}
                                </b>
                                <b className="left content-font sex-dom">
                                    ({userInfo_result.gender?commonJs.is_obj_exist(userInfo_result.gender.displayName):"-"})
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oName" data-edit-type="input">
                                    {commonJs.is_obj_exist(userInfo_result.name)}
                                </b>
                            </li>
                            <li className="ADDRESS">
                                <p className="msg-tit">家庭住址</p>
                                <b className="msg-cont elli" data-paramname="homeAddress_area" data-edit-type="address" title={commonJs.is_obj_exist(userInfo_result.homeAddress_area)}>
                                    {commonJs.is_obj_exist(userInfo_result.homeAddress_area)}
                                </b>
                                <div className="address-div pl20 hidden relative">
                                    <Address _defaultAddr_val={userInfo_result.homeAddress_area} id='homeAddressArea' />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(userInfo_result.homeAddress_area)} className="getAddress editInput" data-inp-paramName="homeAddress_area" data-paramname="homeAddress_area" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(userInfo_result.homeProvinceId)} className="ProvinceId editInput" data-inp-paramName="homeProvinceId" data-paramname="homeProvinceId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(userInfo_result.homeCityId)} className="CityId editInput" data-inp-paramName="homeCityId" data-paramname="homeCityId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(userInfo_result.homeDistrictId)} className="DistrictId editInput" data-inp-paramName="homeDistrictId" data-paramname="homeDistrictId" hidden="hidden" />
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">详细</p>
                                <b className={this.isSame(userInfo_result.homeAddress,"addr")?"msg-cont elli red":"msg-cont elli"} title="'+{userInfo_result.homeAddress}+'" data-paramname="homeAddress" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.homeAddress)}>
                                    {commonJs.is_obj_exist(userInfo_result.homeAddress)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">住房情况</p>
                                <b className="msg-cont elli" data-paramname="housingSituation" data-edit-type="select" title={commonJs.is_obj_exist(userInfo_result.housingSituation)} >
                                    {commonJs.is_obj_exist(userInfo_result.housingSituation)} 
                                </b>
                                <input type="text" defaultValue={userInfo_result.housingSituation} className="getSelectedVal editInput" data-inp-paramName="housingSituation" hidden="" />
                            </li>
                            <li>
                                <p className="msg-tit">出生日期</p>
                                <b className="msg-cont2 elli" title={commonJs.is_obj_exist(userInfo_result.birthday)}>
                                    {commonJs.is_obj_exist(userInfo_result.birthday)} 
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">手机号码</p>
                                <b data-cake={commonJs.is_obj_exist(userInfo_result.primaryPhone)} className={this.isSame(userInfo_result.primaryPhone,"phone")?"msg-cont elli red":"msg-cont elli"} data-paramname="primaryPhone" data-edit-type="input" data-verify="onlyMobile">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,userInfo_result.primaryPhone)}
                                </b>
                                {
                                    userInfo_result.primaryPhone&&userInfo_result.primaryPhone.length>0?<a className="phont-btn-user block left ml3 mr3" onClick={this.callPhone.bind(this,userInfo_result.primaryPhone)}></a>:""
                                }
                                <span className="online-time gray-tip-font left" title={commonJs.is_obj_exist(userInfo_result.primaryPhoneOnlineTime)}>
                                    {commonJs.is_obj_exist(userInfo_result.primaryPhoneOnlineTime)}
                                </span>
                            </li>
                            <li>
                                <p className="msg-tit">二代身份证</p>
                                <b className="msg-cont elli" data-paramname="nationalId" data-edit-type="input" title={commonJs.is_obj_exist(newNationalId)} data-cake={commonJs.is_obj_exist(userInfo_result.nationalId)}>
                                    {commonJs.is_obj_exist(newNationalId)} 
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oNationalId" data-edit-type="input" data-cake={commonJs.is_obj_exist(userInfo_result.nationalId)}>
                                    {commonJs.is_obj_exist(userInfo_result.nationalId)}
                                </b>
                            </li>
                            <li className="censusAddress-li">
                                <p className="msg-tit">户籍地址</p>
                                <b className={this.isSame(userInfo_result.censusAddress,"addr")?"msg-cont2 elli red":"msg-cont2 elli"} data-paramname="censusAddress" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.censusAddress)}>
                                    {commonJs.is_obj_exist(userInfo_result.censusAddress)}
                                </b>
                            </li>
                            <li data-btn-rule="RULE:DETAILS:OUTSIDE:KEY">
                                <p className="msg-tit">渠道来源</p>
                                <b className="msg-cont2 elli" data-paramname="sourceQuotient" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.sourceQuotient)}>
                                    {commonJs.is_obj_exist(userInfo_result.sourceQuotient)}
                                </b>
                            </li>
                            <li data-btn-rule="RULE:DETAILS:INSIDE:KEY">
                                <p className="msg-tit">渠道来源</p>
                                <b className="msg-cont2 elli" data-paramname="sourceQuotient" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.sourceQuotient_all)}>
                                    {commonJs.is_obj_exist(userInfo_result.sourceQuotient_all)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">第二号码</p>
                                
                                <b className={this.isSame(userInfo_result.secondTelNo,"phone")?"msg-cont elli red":"msg-cont elli"} data-paramname="secondTelNo" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.secondTelNo)} data-verify="phone">
                                    {commonJs.is_obj_exist(userInfo_result.secondTelNo)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">第三号码</p>
                                <b  className={this.isSame(userInfo_result.thirdTelNo,"phone")?"msg-cont elli red":"msg-cont elli"} data-paramname="thirdTelNo" data-edit-type="input" title={commonJs.is_obj_exist(userInfo_result.thirdTelNo)} data-verify="phone">
                                    {commonJs.is_obj_exist(userInfo_result.thirdTelNo)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oBankCardNumber" data-edit-type="input">
                                    {commonJs.is_obj_exist(bankInfo_result.bankCardNumber)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oBankReservePhone" data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,bankInfo_result.bankReservePhone)}
                                </b>
                            </li>
                        </ul>
                        <div className={this.state.this_params?"clearfix":"hidden clearfix"} data-btn-rule="RULE:DETAIL:USERINFO:MODIFY:BUTTON">
                            <button className="btn-white left mt10 mb10 block ml20 edit" id='userInfoEdit' onClick={userMsgControler.Edit.bind(this,"/node/UserMsg_edit_contactMsg")}>修改</button>
                            <button className="btn-white left mt10 mb10 block ml20 hidden cancle_edit" id='userInfoEditCancle' onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                        </div>
                    </div>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        银行信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <ul className="info-ul bank-msg">
                            <li className="bankCard-li">
                                <p className="msg-tit">银行卡号</p>
                                <b className="msg-cont elli" data-edit-type="input" data-paramname="bankCardNumber" title={commonJs.is_obj_exist(bankInfo_result.bankCardNumber)}>
                                    {commonJs.is_obj_exist(bankInfo_result.bankCardNumber)}
                                </b>
                            </li>
                            <li className="bankName-li">
                                <p className="msg-tit">银行</p>
                                <b className="msg-cont" data-edit-type="input" data-paramname="bankName" title={commonJs.is_obj_exist(bankInfo_result.bankName)}>
                                    {commonJs.is_obj_exist(bankInfo_result.bankName)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">开户支行</p>
                                <b className="msg-cont elli" data-edit-type="input" data-paramname="bankBranch" title={commonJs.is_obj_exist(bankInfo_result.bankBranch)}>
                                    {commonJs.is_obj_exist(bankInfo_result.bankBranch)}
                                </b>
                            </li>
                            <li className="ADDRESS">
                                <p className="msg-tit">开户所在地</p>
                                <b className="msg-cont elli" data-paramname="bankAddress" data-edit-type="address" title={commonJs.is_obj_exist(bankInfo_result.bank_area)}>
                                    {commonJs.is_obj_exist(bankInfo_result.bank_area)}
                                </b>
                                <div className="address-div pl20 hidden relative">
                                    <Address _defaultAddr_val={bankInfo_result.bank_area} id='bankArea' />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(bankInfo_result.bank_area)} className="getAddress editInput" data-inp-paramName="bankAddress" data-paramname="bankAddress" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(bankInfo_result.bankProvinceId)} className="ProvinceId editInput" data-inp-paramName="bankProvinceId" data-paramname="bankProvinceId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(bankInfo_result.bankCityId)} className="CityId editInput" data-inp-paramName="bankCityId" data-paramname="bankCityId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(bankInfo_result.bankDistrictId)} className="DistrictId editInput" data-inp-paramName="bankDistrictId" data-paramname="bankDistrictId" hidden="hidden" />
                                </div>
                            </li>
                            <li className="bankCardPhone-li">
                                <p className="msg-tit" data-required="true">银行卡预留手机号码</p>
                                <b data-cake={commonJs.is_obj_exist(bankInfo_result.bankReservePhone)} className={this.isSame(bankInfo_result.bankReservePhone,"phone")?"msg-cont elli red":"msg-cont elli"} data-edit-type="input" data-paramname="bankReservePhone" data-verify="onlyMobile" title={commonJs.phoneReplace(accessryInfo.viewPhone,bankInfo_result.bankReservePhone)}>
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,bankInfo_result.bankReservePhone)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oName" data-edit-type="input">
                                    {commonJs.is_obj_exist(userInfo_result.name)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oBankName" data-edit-type="input">
                                    {commonJs.is_obj_exist(bankInfo_result.bankName)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oBankCardNumber" data-edit-type="input">
                                    {commonJs.is_obj_exist(bankInfo_result.bankCardNumber)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oNationalId" data-edit-type="input" data-cake={commonJs.is_obj_exist(userInfo_result.nationalId)}>
                                    {commonJs.is_obj_exist(newNationalId)}
                                </b>
                            </li>
                            <li className="hidden">
                                <b className="msg-cont" data-paramname="oBankReservePhone" data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,bankInfo_result.bankReservePhone)}
                                </b>
                            </li>
                        </ul>
                        <div className={this.state.this_params?"clearfix":"hidden clearfix"}>
                            <button className="btn-white left mt10 mb10 block ml20 edit" id='bankInfoEdit' onClick={userMsgControler.Edit.bind(this,"/node/UserMsg_edit_contactMsg")}>修改</button>
                            <button className="btn-white left mt10 mb10 block ml20 hidden cancle_edit" id='bankInfoEditCancle' onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                            <button className={this.state.isShowSendMsgBtn ? "btn-white left mt10 mb10 block ml20": "btn-white left mt10 mb10 block ml20 hidden"} id='sendMsg' onClick={this.sendMsg.bind(this)}>发送短信</button>
                        </div>
                    </div>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        联系人信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <h3 className="info-label inline-block contactOther">家庭联系人</h3>
                        <ul className="info-ul home-contact-msg">
                            <li>
                                <p className="msg-tit">姓名</p>
                                <b className={this.isSame(contactInfo_result.directReferenceName,"name")?"msg-cont elli red":"msg-cont elli"} title={commonJs.is_obj_exist(contactInfo_result.directReferenceName)} data-paramname="directReferenceName" data-edit-type="input">
                                    {commonJs.is_obj_exist(contactInfo_result.directReferenceName)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">手机/固话1</p>
                                <b data-cake={commonJs.is_obj_exist(contactInfo_result.directReferencePhone)} className={this.isSame(contactInfo_result.directReferencePhone,"phone")?"msg-cont elli red":"msg-cont elli"} data-verify="phone" title={commonJs.phoneReplace(accessryInfo.viewPhone,contactInfo_result.directReferencePhone)} data-paramname="directReferencePhone" data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,contactInfo_result.directReferencePhone)}
                                </b>
                                {
                                    contactInfo_result.directReferencePhone&&contactInfo_result.directReferencePhone.length>0?<a className="phont-btn-user block left ml3 mr3" onClick={this.callPhone.bind(this,contactInfo_result.directReferencePhone)}></a>:""
                                }
                                <span className="online-time gray-tip-font left" title={commonJs.is_obj_exist(contactInfo_result.directReferencePhoneOnlineTime)}>
                                    {commonJs.is_obj_exist(contactInfo_result.directReferencePhoneOnlineTime)}
                                </span>
                            </li>
                            <li>
                                <p className="msg-tit">关系</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(contactInfo_result.directReferenceRelation)} data-paramname="directReferenceRelation" data-edit-type="select">
                                    {commonJs.is_obj_exist(contactInfo_result.directReferenceRelation)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="directReferenceRelation" hidden="hidden" />
                            </li>
                            <li className="ADDRESS">
                                <p className="msg-tit">家庭联系人地址</p>
                                <b className="msg-cont elli" data-paramname="direct_area" data-edit-type="address" title={commonJs.is_obj_exist(contactInfo_result.direct_area)}>
                                    {commonJs.is_obj_exist(contactInfo_result.direct_area)}
                                </b>
                                <div className="address-div pl20 hidden relative">
                                    <Address _defaultAddr_val={contactInfo_result.direct_area} id='directArea' />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(contactInfo_result.direct_area)} className="getAddress editInput" data-inp-paramName="directReferenceAddress" data-paramname="directReferenceAddress" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(contactInfo_result.directReferenceProvinceId)} className="ProvinceId editInput" data-inp-paramName="directReferenceProvinceId" data-paramname="directReferenceProvinceId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(contactInfo_result.directReferenceCityId)} className="CityId editInput" data-inp-paramName="directReferenceCityId" data-paramname="directReferenceCityId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(contactInfo_result.directReferenceDistrictId)} className="DistrictId editInput" data-inp-paramName="directReferenceDistrictId" data-paramname="directReferenceDistrictId" hidden="hidden" />
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">详细地址</p>
                                <b className={this.isSame(contactInfo_result.directReferenceAddress,"addr")?"msg-cont elli red":"msg-cont elli"} data-paramname="directReferenceAddress" data-edit-type="input" title={commonJs.is_obj_exist(contactInfo_result.directReferenceAddress)}>
                                    {commonJs.is_obj_exist(contactInfo_result.directReferenceAddress)}
                                </b>
                            </li>
                        </ul>
                        <h3 className="info-label inline-block contactOther referenceEditClass">
                            <label data-otherReferenceType="OTHER" className="hidden" id='OTHERLable'>
                                <i className="left myRadio myRadio-normal mt3 hidden"></i>
                                其他联系人
                            </label>
                            <label data-otherReferenceType="UNDIRECT" className="hidden" id='UNDIRECTLable'>
                                <i className="left myRadio myRadio-normal mt3 hidden"></i>
                                旁系联系人
                            </label>
                        </h3>
                        <ul className="info-ul other-contact-msg">
                            <li className="cantact-name">
                                <p className="msg-tit">姓名</p>
                                <b className={this.isSame((contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferenceName:contactInfo_result.undirectReferenceName),"name")?"msg-cont elli red":"msg-cont elli"} data-paramname={contactInfo_result.otherReferenceType=="OTHER"?"otherReferenceName":"undirectReferenceName" } data-edit-type="input" title={commonJs.is_obj_exist(contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferenceName:contactInfo_result.undirectReferenceName )}>
                                    {commonJs.is_obj_exist(contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferenceName:contactInfo_result.undirectReferenceName )}
                                </b>
                            </li>
                            <li className="cantact-phone">
                                <p className="msg-tit">手机/固话2</p>
                                <b data-cake={commonJs.is_obj_exist(contactInfoOtherPhone)} className={this.isSame(contactInfoOtherPhone,"phone")?"msg-cont elli red":"msg-cont elli"} data-verify="phone" data-paramname={contactInfo_result.otherReferenceType=="OTHER"?"otherReferencePhone":"undirectReferencePhone" } data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,contactInfoOtherPhone)}
                                </b>
                                {
                                    contactInfoOtherPhone&&contactInfoOtherPhone.length>0?
                                        <a className="phont-btn-user block left ml3 mr3" onClick={this.callPhone.bind(this,contactInfoOtherPhone)}></a>
                                        :""
                                }
                                <span className="online-time gray-tip-font left">{commonJs.is_obj_exist(contactInfo_result.otherReferencePhoneOnlineTime)}</span>
                            </li>
                            <li className="cantact-relation">
                                <p className="msg-tit">关系</p>
                                <b className="msg-cont" data-paramname={contactInfo_result.otherReferenceType=="OTHER"?"otherReferenceRelation":"undirectReferenceRelation" } data-edit-type="select" title={commonJs.is_obj_exist(contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferenceRelation:contactInfo_result.undirectReferenceRelation )}>
                                    {commonJs.is_obj_exist(contactInfo_result.otherReferenceType=="OTHER"?contactInfo_result.otherReferenceRelation:contactInfo_result.undirectReferenceRelation )}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName={contactInfo_result.otherReferenceType=="OTHER"?"otherReferenceRelation":"undirectReferenceRelation" } hidden="hidden" />
                            </li>
                        </ul>
                        <h3 className="info-label inline-block contactOther">其他联系人2</h3>
                        <ul className="info-ul other-contact-msg">
                            <li>
                                <p className="msg-tit">姓名</p>
                                <b className={this.isSame(contactInfo_result.otherReferenceName2,"name")?"msg-cont elli red":"msg-cont elli"} data-paramname="otherReferenceName2" data-edit-type="input" title={commonJs.is_obj_exist(contactInfo_result.otherReferenceName2)}>
                                    {commonJs.is_obj_exist(contactInfo_result.otherReferenceName2)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">手机/固话1</p>
                                <b data-cake={commonJs.is_obj_exist(contactInfo_result.otherReferencePhone2)} className={this.isSame(contactInfo_result.otherReferencePhone2,"phone")?"msg-cont elli red":"msg-cont elli"} data-verify="phone" title={commonJs.phoneReplace(accessryInfo.viewPhone,contactInfo_result.otherReferencePhone2)} data-paramname="otherReferencePhone2" data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,contactInfo_result.otherReferencePhone2)}
                                </b>
                                {
                                    contactInfo_result.otherReferencePhone2&&contactInfo_result.otherReferencePhone2.length>0?
                                        <a className="phont-btn-user block left ml3 mr3" onClick={this.callPhone.bind(this,contactInfo_result.otherReferencePhone2)}></a>
                                        :""
                                }
                                <span className="online-time gray-tip-font left">{commonJs.is_obj_exist(contactInfo_result.otherReferencePhone2OnlineTime)}</span>
                            </li>
                            <li>
                                <p className="msg-tit">关系</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(contactInfo_result.otherReferenceRelation2)} data-paramname="otherReferenceRelation2" data-edit-type="select">
                                    {commonJs.is_obj_exist(contactInfo_result.otherReferenceRelation2)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="otherReferenceRelation2" hidden="hidden" />
                            </li>
                        </ul>
                        <div className={this.state.this_params?"clearfix":"hidden clearfix"}>
                            <button className="btn-white left mt10 mb10 block ml20 edit contactMsg-edit" id='contactEdit' onClick={userMsgControler.Edit.bind(this,"/node/UserMsg_edit_contactMsg")}>修改</button>
                            <button className="btn-white left mt10 mb10 block ml20 hidden cancle_edit" id='contactEditCancle' onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                        </div>
                    </div>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        选填信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <h3 className="info-label inline-block">学历</h3>
                        <ul className="info-ul certificate-msg">
                            <li>
                                <p className="msg-tit" data-required="true">最高学历</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.highestEducation)} data-paramname="highestEducation" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.highestEducation)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="highestEducation" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">毕业学校</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.graduationSchool)} data-paramname="graduationSchool" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.graduationSchool)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">毕业年份</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.graduationYear)} data-paramname="graduationYear" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.graduationYear)}
                                </b>
                            </li>
                        </ul>
                        <h3 className="info-label inline-block">其他</h3>
                        <ul className="info-ul certificate-msg2">
                            <li>
                                <p className="msg-tit">婚否</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.maritalStatus)} data-paramname="maritalStatus" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.maritalStatus)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="maritalStatus" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">子女情况</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.haveChild)} data-paramname="haveChild" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.haveChild)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="haveChild" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit" data-required="true">现住所居住时间</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.liveTime)} data-paramname="liveTime" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.liveTime)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="liveTime" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">是否有车</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.haveCar)} data-paramname="haveCar" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.haveCar)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="haveCar" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">是否有房</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.haveHouse)} data-paramname="haveHouse" data-edit-type="select">
                                    {commonJs.is_obj_exist(otherInfo_result.haveHouse)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="haveHouse" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">QQ号码</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.qq)} data-paramname="qq" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.qq)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">微信号码</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.weixin)} data-paramname="weixin" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.weixin)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">推荐人手机号</p>
                                <b data-cake={commonJs.is_obj_exist(otherInfo_result.recommended_phone)} className="msg-cont" data-verify="onlyMobile" title={commonJs.phoneReplace(accessryInfo.viewPhone,otherInfo_result.recommended_phone)} data-paramname="recommended_phone" data-edit-type="input">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,otherInfo_result.recommended_phone)}
                                </b>
                                {
                                    otherInfo_result.recommended_phone&&otherInfo_result.recommended_phone.length>0?
                                        <a className="phont-btn-user mr20 block left ml3 mr3" onClick={this.callPhone.bind(this,otherInfo_result.recommended_phone)}></a>
                                        :""
                                }
                            </li>
                            <li>
                                <p className="msg-tit">预期贷款金额</p>
                                <b className="msg-cont2" title={commonJs.is_obj_exist(otherInfo_result.requestAmount)} data-paramname="requestAmount" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.requestAmount)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">电核更多收入</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo_result.isMoreIncome)} data-paramname="isMoreIncome" data-edit-type="input">
                                    {commonJs.is_obj_exist(otherInfo_result.isMoreIncome)}
                                </b>
                            </li>
                        </ul>
                        <div className={this.state.this_params?"clearfix":"hidden clearfix"}>
                            <button className="btn-white left mt10 mb10 block ml20 edit" id='certificateEdit' onClick={userMsgControler.Edit.bind(this,"/node/UserMsg_edit_contactMsg")}>修改</button>
                            <button className="btn-white left mt10 mb10 block ml20 hidden cancle_edit" id='certificateEditCancle' onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                        </div>
                    </div>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        工作信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <ul className="info-ul work-msg">
                            <li>
                                <p className="msg-tit">收入来源</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.incomeSource)} data-paramname="incomeSource" data-edit-type="select">
                                    {commonJs.is_obj_exist(workInfo_result.incomeSource)}
                                </b>
                                <input type="text" className="getSelectedVal editInput hidden" data-inp-paramname="incomeSource" />
                            </li>
                            <li>
                                <p className="msg-tit">工作单位</p>
                                <b className="msg-cont" data-paramname="company" data-edit-type="input" title={commonJs.is_obj_exist(workInfo_result.company)}>
                                    {commonJs.is_obj_exist(workInfo_result.company)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit radio-div workPhoneMsg" data-inp-paramName="companyPhoneType">
                                    <label data-companyPhoneType="MOBILE" className={workInfo_result.companyPhoneType=="MOBILE"?"left cpyRadio":"left cpyRadio hidden"}>
                                        <i className="left myRadio myRadio-normal mt3 hidden" data-name="MOBILE"></i>
                                        单位手机
                                    </label>
                                    <label data-companyPhoneType="FIXED" className={workInfo_result.companyPhoneType=="FIXED"?"left cpyRadio":"left cpyRadio hidden"}>
                                        <i className="left myRadio mt3 myRadio-normal hidden" data-name="FIXED"></i>
                                        单位座机
                                    </label>
                                </p>
                                <div className="clear"></div>
                                <b className={this.isSame(workInfo_result.tellPhoneNo,"phone")?"msg-cont red":"msg-cont"} title={commonJs.phoneReplace(accessryInfo.viewPhone,workInfo_result.tellPhoneNo)} data-paramname="companyPhone" data-edit-type="radio">
                                    {commonJs.phoneReplace(accessryInfo.viewPhone,workInfo_result.tellPhoneNo)}
                                </b>
                                {
                                    workInfo_result.tellPhoneNo&&workInfo_result.tellPhoneNo.length>0?
                                        <a className="phont-btn-user mr20 block left ml3 mr3" onClick={this.callPhone.bind(this,workInfo_result.tellPhoneNo)}></a>
                                        :""
                                }
                                <span className="gray-tip-font left">
                                    {commonJs.is_obj_exist(workInfo_result.companyPhoneOnlineTime )}
                                </span>
                                <div className="cpyTellPhone hidden">
                                    <div className="MOBILE-edit-div pl20 hidden">
                                        <input type="text" className="input MOBILE-edit-inp"  onKeyUp={this.myaer.bind(this)} />
                                    </div>
                                    <div className="FIXED-edit-div pl20 hidden">
                                        <input type="text" className="left input area-No" />
                                        <span className="left middle-line"> - </span>
                                        <input type="text" className="left input phone-No" />
                                        <span className="left middle-line"> - </span>
                                        <input type="text" className="left input brach-No" />
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">月现金收入</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.incomeCash)} data-paramname="incomeCash" data-edit-type="input">
                                    {commonJs.is_obj_exist(workInfo_result.incomeCash)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">月银行工资卡收入</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.incomeDdi)} data-paramname="incomeDdi" data-edit-type="input">
                                    {commonJs.is_obj_exist(workInfo_result.incomeDdi)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">工资发放日期</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.paydate)} data-paramname="paydate" data-edit-type="input">
                                    {commonJs.is_obj_exist(workInfo_result.paydate)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">现单位工作时间</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.workTime)} data-paramname="workTime" data-edit-type="select">
                                    {commonJs.is_obj_exist(workInfo_result.workTime)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramname="workTime" hidden="hidden" />
                            </li>
                            <li className="ADDRESS">
                                <p className="msg-tit">单位地址</p>
                                <b className="msg-cont elli" data-paramname="company_area" data-edit-type="address" title={commonJs.is_obj_exist(workInfo_result.company_area)}>
                                    {commonJs.is_obj_exist(workInfo_result.company_area)}
                                </b>
                                <div className="address-div pl20 hidden relative">
                                    <Address _defaultAddr_val={workInfo_result.company_area} id='companyArea' />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(workInfo_result.company_area)} className="getAddress editInput" data-inp-paramName="companyAddress" data-paramname="companyAddress" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(workInfo_result.companyProvinceId)} className="ProvinceId editInput" data-inp-paramName="companyProvinceId" data-paramname="companyProvinceId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(workInfo_result.companyCityId)} className="CityId editInput" data-inp-paramName="companyCityId" data-paramname="companyCityId" hidden="hidden" />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(workInfo_result.companyDistrictId)} className="DistrictId editInput" data-inp-paramName="companyDistrictId" data-paramname="companyDistrictId" hidden="hidden" />
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">详细地址</p>
                                <b className={this.isSame(workInfo_result.companyAddress,"addr")?"msg-cont red":"msg-cont"} data-paramname="companyAddress" data-edit-type="input" title={commonJs.is_obj_exist(workInfo_result.companyAddress)}>
                                    {commonJs.is_obj_exist(workInfo_result.companyAddress)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">单位所属行业</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.companyIndustryE)} data-paramname="companyIndustryE" data-edit-type="select">
                                    {commonJs.is_obj_exist(workInfo_result.companyIndustryE)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="companyIndustry" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">职业</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.workTypeE)} data-paramname="workTypeE" data-edit-type="select">
                                    {commonJs.is_obj_exist(workInfo_result.workTypeE)}
                                </b>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="workType" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">公司职位</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(workInfo_result.position)} data-paramname="position" data-edit-type="input">
                                    {commonJs.is_obj_exist(workInfo_result.position)}
                                </b>
                            </li>
                        </ul>
                        <div className={this.state.this_params?"clearfix":"hidden clearfix"}>
                            <button className="btn-white left mt10 mb10 block ml20 edit" id='compEdit' onClick={userMsgControler.Edit.bind(this,"/node/UserMsg_edit_contactMsg")}>修改</button>
                            <button className="btn-white left mt10 mb10 block ml20 hidden cancle_edit" id='compEditCancle' onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                        </div>
                    </div>
                </div>
                <div className={this.state.this_params?"toggle-box mt10":"hidden toggle-box mt10"}>
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        设置密码
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <ul className="info-ul parssword-msg">
                            <li>
                                <p className="msg-tit">新的密码</p>
                                <b className="msg-cont"><input type="password" className="input userPassword" /></b>
                            </li>
                            <li>
                                <p className="msg-tit">确认密码</p>
                                <b className="msg-cont"><input type="password" className="input userPassword_sure" /></b>
                            </li>
                        </ul>
                        <div className="clearfix">
                            <button className="btn-blue mr10 mt10 mb10 block ml20 left" id='passwordSave' onClick={this.EditUserPwd.bind(this)}>保存</button>
                            <button className="btn-white mt10 mb10 block left" id='passwordSaveCancle' onClick={this.cancelUserPwd.bind(this)}>取消</button>
                        </div>
                    </div>
                </div>
                {/*发送短信弹窗*/}
                <div className="sendMsg-prop hidden">
                    <div className="tanc_bg"></div>
                    <div className="msg-div">
                        <i className="close" onClick={this.closeSendMsg.bind(this)}></i>
                        <textarea className="msg-content" name="" id="sendMsgCont" cols="30" rows="10"></textarea>
                        <button className="btn-blue mt20 block send-btn" id='sureSendMsg' onClick={this.sendTo_fn.bind(this)}>发送</button>
                    </div>
                </div>
            </div>
    );
    }
};


export default UserMsg;