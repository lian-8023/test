// cp-portal详情
import {
    observable,
    action,
    computed,
    configure,
    runInAction,
    extendObservable
} from "mobx";
import CommonJs from '../../source/common/common';
var commonJs = new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs = new CpCommonJs;
import GetAddressByCode from '../../source/common/getAddressByCode';
import md5 from 'md5';
var getAddressByCode = new GetAddressByCode; //根据编码获取地址
configure({
    enforceActions: true
})

//observable data 注册一个数据，这个数据将会成为一个可mobx监测的数据
//用户信息
export default class UserinfoStore {
    @observable loanNo = ""; //条件-合同号
    @observable orderNo = ""; //条件-订单号
    @observable cooperationFlag = ""; //条件-合作方17C
    @observable platformFlag = ""; //条件-平台标识 TH/TF/XYH
    @observable xyhRecheck = ""; //小雨花 订单审核&订单复审 加标示区别

    @observable loanStatus = "";
    @observable thirdDataRepaymentResponseDTO = {}; //还款列表-第三方
    @observable thirdFilesResponseOldDTO = {}; //文件-第三方
    @observable thirdIdentityResponseOldDTO = {}; //详情-第三方
    @observable specialKey = {}; //用作判断作用的对象-第三方详情    
    @observable flagKey = {}; //用作判断作用的对象-第三方详情

    @observable previousRepaymentResponseDTO = {}; //29A 增加还款信息表现
    @observable showLoanFile="";  //平台，合同（另外接口）文件是否展示

    @observable platforIdentityInfo = {}; //详情-平台
    @observable platforFileInfo = {}; //文件-平台
    @observable XYH_IdentityInfo = {}; //详情-小雨花

    @observable platformLoanPlanInfoDTOS = {} //还款列表-平台
    @observable withdrawFileIds=[];  //需要重传的文件id
    @observable withdrawFileTypes=[];  //重传文件类型-中文
    @observable needWithDraw='';  //平台是否展示撤回，并且左边文件列表是否支持勾选
    @observable spinning=false; 
    @observable contactInfoBackPF={};  //个人详情各种电话号码传给collection record用  
    @observable contactInfoBackTH={};  //个人详情各种电话号码传给collection record用
    @observable contactInfoBackXYH={};  //个人详情各种电话号码传给collection record用
    @observable contactInfoBackSUPPLY={};  //个人详情各种电话号码传给collection record用
    @observable contactInfoBackAG={};  //个人详情各种电话号码传给collection record用
    

    //获取详情
    @action getIdentityInfo = (parentThis, isChangeLeft, isChangeRight,rowdata) => {
        let that = this;
        let parems={};
        if(this.xyhRecheck){
            parems.xyhRecheck=this.xyhRecheck;
        }
        let url = "/node/search/identity/info";
        let type = 'post';
        let fromFlag = this.platformFlag;
        //31G-小雨车、25G-和汽、31J-小雨车经营贷
        if(fromFlag=='SUPPLY'){
            parems.productNo = this.cooperationFlag;
            parems.loanNo = this.loanNo;
            if(rowdata){
                if(rowdata.nationalId){
                    parems.idCard=rowdata.nationalId;
                }
                if(rowdata.nationalId){
                    this.nationalId = rowdata.nationalId
                }
            }
            url = '/node/inner/getBorrowerDetailInfo';
            type = 'get'
        }else if(parentThis.state.searchResult&&parentThis.state.searchResult.astQInfoDTO&&parentThis.state.searchResult.astQInfoDTO.productNo == "2F"){
            const creditNo = parentThis.state.searchResult.astQInfoDTO.creditNo;
            const cooperationFlag = parentThis.state.searchResult.astQInfoDTO.productNo;
            fromFlag = parentThis.state.searchResult.astQInfoDTO.cooperationFlag;
            const loanNo ='';
            const orderNo = '';
            parems = {
                creditNo:creditNo,
                cooperationFlag:cooperationFlag,
                fromFlag:fromFlag,
                loanNo:loanNo,
                orderNo:orderNo,
            }
        }else{
             let _loanNo=this.loanNo;
            if(this.cooperationFlag == '2F'&&parentThis.state.pageType == "2Fseach"){
                parems.creditNo = this.loanNo;
            }else if(parentThis.state.pageType == '2FAST'){
                that.platforIdentityInfo = {}; //详情-平台
                that.platforFileInfo = {}; //文件-平台
                return
            }else{
                if(_loanNo){parems.loanNo=_loanNo;}
            }
            let _orderNo=this.orderNo;
            if(_orderNo){parems.orderNo=_orderNo;}
            parems.cooperationFlag=this.cooperationFlag;
            parems.fromFlag=this.platformFlag;
        }
        parems.label='userInfo_common';
        $.ajax({
            type: type,
            url: url,
            async: true,
            dataType: "JSON",
            data: parems,
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success: function (res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    runInAction(() => {
                        that.loanStatus = "";
                        that.thirdDataRepaymentResponseDTO = {}; //还款列表-第三方
                        that.thirdFilesResponseOldDTO = {}; //文件-第三方
                        that.thirdIdentityResponseOldDTO = {}; //详情-第三方
                        that.specialKey = {}; //用作判断作用的对象-第三方详情
                        that.flagKey = {}; //用作判断作用的对象-第三方详情
                        that.previousRepaymentResponseDTO = {}; //29A 增加还款信息表现
                        that.showLoanFile="";  //平台，合同（另外接口）文件是否展示

                        that.platforIdentityInfo = {}; //详情-平台
                        that.platforFileInfo = {}; //文件-平台
                        that.XYH_IdentityInfo = {}; //详情-小雨花

                        that.platformLoanPlanInfoDTOS = {} //还款列表-平台
                        
                        that.withdrawFileIds=[];  //需要重传的文件id
                        that.withdrawFileTypes=[];  //重传文件类型-中文
                        that.needWithDraw='';  //平台是否展示撤回，并且左边文件列表是否支持勾选
                        that.spinning=false;
                    })
                    if (isChangeLeft) {
                        parentThis.changeLeftCP(0);
                    }
                    // that.dealData(that.platforIdentityInfo);
                    return;
                }
                runInAction(() => {
                    var _data = res.data ? res.data : {};
                    let platforIdentityInfo = {};
                    if(rowdata&&rowdata.pageType=='Collection'&&fromFlag=='SUPPLY'){
                        platforIdentityInfo = {//基本信息
                            baseInfo: cpCommonJs.opinitionObj(_data.baseInfo), //客户信息
                            bankInfo: cpCommonJs.opinitionObj(_data.bankInfo), //银行信息
                            contactInfos: cpCommonJs.opinitionObj(_data.contactInfos), //联系人信息 
                            creditInfo: cpCommonJs.opinitionObj(_data.creditInfo), //授信信息 
                            enterpriseInfo: cpCommonJs.opinitionObj(_data.enterpriseInfo), //企业信息 
                        }
                       /*  let platforFileInfo = { //平台文件
                            idCardInfos: cpCommonJs.opinitionArray(_data.idCardInfos), //身份证文件
                            elsePicInfos: cpCommonJs.opinitionArray(_data.elsePicInfos), //其他图片
                        } */
                        // that.platforIdentityInfo = platforIdentityInfo; //详情-平台
                        // that.platforFileInfo = platforFileInfo; //文件-平台
                        //个人详情各种电话号码传给其他组件用
                        let _contactInfoBackSUPPLY={};
                        _contactInfoBackSUPPLY.userName=cpCommonJs.opinitionObj(_data.baseInfo).name;  //本人姓名
                        _contactInfoBackSUPPLY.primaryPhone=cpCommonJs.opinitionObj(_data.baseInfo).mobile;  //本人注册
                        _contactInfoBackSUPPLY.directReferenceName=cpCommonJs.opinitionObj(_data.contactInfos).name;  //第一联系人名称
                        _contactInfoBackSUPPLY.directReferencePhone=cpCommonJs.opinitionObj(_data.contactInfos).mobile;  //第一联系人（家庭联系人）
                        that.contactInfoBackSUPPLY=_contactInfoBackSUPPLY;

                    }else if(rowdata&&rowdata.pageType=='Collection'&&fromFlag=='AG'){
                        platforIdentityInfo = {//基本信息
                            userInfo: cpCommonJs.opinitionObj(_data.userInfo), //客户信息
                            userExtraInfo: cpCommonJs.opinitionObj(_data.userExtraInfo), //银行信息
                        }

                        let platforFileInfo = { //平台文件
                            idCardInfos: cpCommonJs.opinitionArray(_data.idCardInfos), //身份证文件
                            elsePicInfos: cpCommonJs.opinitionArray(_data.elsePicInfos), //其他图片
                        }
                        if(fromFlag=='AG'){
                            platforIdentityInfo.userInfo.sumPrincipal = _data.sumPrincipal;
                            platforIdentityInfo.userInfo.sumAmountOfMonth = _data.sumAmountOfMonth;
                        }
                        that.platforIdentityInfo = platforIdentityInfo; //详情-平台
                        that.platforFileInfo = platforFileInfo; //文件-平台
                        
                        let _contactInfoBackAG={};
                        _contactInfoBackAG.userName=cpCommonJs.opinitionObj(_data.userInfo).userName;  //本人姓名
                        _contactInfoBackAG.primaryPhone=cpCommonJs.opinitionObj(_data.userInfo).userPhone;  //本人注册
                        _contactInfoBackAG.bankpPhoneNo=cpCommonJs.opinitionObj(_data.bankInfo).bankPhone;  //其他联系信息（银行卡预留手机）
                        that.contactInfoBackAG=_contactInfoBackAG;
                    }else{
                        platforIdentityInfo = { //详情-平台
                            platformUserInfoDTO: cpCommonJs.opinitionObj(_data.platformUserInfoDTO), //客户信息
                            platformBankInfoDTO: cpCommonJs.opinitionObj(_data.platformBankInfoDTO), //银行信息
                            platformContactsInfoDTO: cpCommonJs.opinitionObj(_data.platformContactsInfoDTO), //联系人信息 
                            platformWorkInfoDTO: cpCommonJs.opinitionObj(_data.platformWorkInfoDTO), //工作信息 
                            platformLoanInfoDTO: cpCommonJs.opinitionObj(_data.platformLoanInfoDTO), //贷款信息 
                            platformOtherInfoDTO: cpCommonJs.opinitionObj(_data.platformOtherInfoDTO), //其他信息 
                            corpInfoDTO: cpCommonJs.opinitionObj(_data.corpInfoDTO) //企业信息 
                        };
    
                        //个人详情各种电话号码传给其他组件用
                        let _contactInfoBackPF={};
                        _contactInfoBackPF.userName=cpCommonJs.opinitionObj(_data.platformUserInfoDTO).userName;  //本人姓名
                        _contactInfoBackPF.primaryPhone=cpCommonJs.opinitionObj(_data.platformUserInfoDTO).userPhone;  //本人注册
                        _contactInfoBackPF.company=cpCommonJs.opinitionObj(_data.platformWorkInfoDTO).workCompanyName;  //单位名称
                        _contactInfoBackPF.companyPhone=cpCommonJs.opinitionObj(_data.platformWorkInfoDTO).workWorkPhone;  //单位座机(公司电话)
                        _contactInfoBackPF.directReferenceName=cpCommonJs.opinitionObj(_data.platformContactsInfoDTO).contactFirstContactName;  //第一联系人名称
                        _contactInfoBackPF.directReferencePhone=cpCommonJs.opinitionObj(_data.platformContactsInfoDTO).contactFirstContactPhone;  //第一联系人（家庭联系人）
                        _contactInfoBackPF.twoName=cpCommonJs.opinitionObj(_data.platformContactsInfoDTO).contactSecondContactName;  //第二联系人姓名
                        _contactInfoBackPF.twoPhone=cpCommonJs.opinitionObj(_data.platformContactsInfoDTO).contactSecondContactPhone;  //第二联系人（手机/固话2）
                        _contactInfoBackPF.otherReferenceName2=cpCommonJs.opinitionObj(_data.platformContactsInfoDTO).contactThirdContactName;  //第三联系人
                        _contactInfoBackPF.otherReferencePhone2=cpCommonJs.opinitionObj(_data.platformContactsInfoDTO).contactThirdContactPhone;  //第三联系人（手机/固话1）
                        _contactInfoBackPF.bankpPhoneNo=cpCommonJs.opinitionObj(_data.platformBankInfoDTO).userBankCardBindPhone;  //其他联系信息（银行卡预留手机）
                        that.contactInfoBackPF=_contactInfoBackPF;
    
                        let platforFileInfo = { //平台文件
                            childrenLoanNumbers: cpCommonJs.opinitionArray(_data.childrenLoanNumbers), //合同文件
                            loanNumber: cpCommonJs.opinitionArray(_data.loanNumber), //合同文件
                            platformProveFilesInfoDTO: cpCommonJs.opinitionArray(_data.platformProveFilesInfoDTO), //证明文件
                            platformIdentityCardFilesInfoDTO: cpCommonJs.opinitionArray(_data.platformIdentityCardFilesInfoDTO), //身份证文件
                            platformContractFilesInfoDTO: cpCommonJs.opinitionArray(_data.platformContractFilesInfoDTO), //合同文件
                            operateReportFileInfoDTO: cpCommonJs.opinitionArray(_data.operateReportFileInfoDTO), //运营商报告
                            faceRecogniseFilesInfoDTO: cpCommonJs.opinitionArray(_data.faceRecogniseFilesInfoDTO), //人脸识别
                        }
                        let thirdFileInfo = { //第三方文件
                            contractsFileMap: cpCommonJs.opinitionObj(_data.thirdFilesResponseOldDTO ? _data.thirdFilesResponseOldDTO.contractsFileMap : {}), //合同文件-wml
                            identityDocumentsMap: cpCommonJs.opinitionObj(_data.thirdIdentityResponseOldDTO ? _data.thirdIdentityResponseOldDTO.identityDocumentsMap : {}), //身份证文件-whw
                            proveDocumentsMap: cpCommonJs.opinitionObj(_data.thirdIdentityResponseOldDTO ? _data.thirdIdentityResponseOldDTO.proveDocumentsMap : {}), //证明文件-whw
                        };
                        that.thirdDataRepaymentResponseDTO = cpCommonJs.opinitionArray(_data.thirdDataRepaymentResponseDTO ? _data.thirdDataRepaymentResponseDTO.thirdLoanPlanInfos : {}); //还款列表-第三方
                        that.thirdFilesResponseOldDTO = cpCommonJs.opinitionObj(thirdFileInfo); //文件-第三方
                        let _thirdIdentityResponseOldDTO= cpCommonJs.opinitionObj(_data.thirdIdentityResponseOldDTO); //详情-第三方
    
                        //个人详情各种电话号码传给其他组件用
                        let _contactInfoBackTH={};
                        _contactInfoBackTH.userName=cpCommonJs.opinitionObj(_thirdIdentityResponseOldDTO.personMap)['姓名'];  //本人姓名
                        _contactInfoBackTH.primaryPhone=cpCommonJs.opinitionObj(_thirdIdentityResponseOldDTO.personMap)['联系电话'];  //本人注册
                        _contactInfoBackTH.company=cpCommonJs.opinitionObj(_thirdIdentityResponseOldDTO.workMap)['公司名称'];  //单位名称
                        _contactInfoBackTH.companyPhone=cpCommonJs.opinitionObj(_thirdIdentityResponseOldDTO.workMap)['单位座机'];  //单位座机(公司电话)
                        _contactInfoBackTH.directReferenceName=cpCommonJs.opinitionObj(_thirdIdentityResponseOldDTO.personMap)['第一联系人姓名'];  //第一联系人名称
                        _contactInfoBackTH.directReferencePhone=cpCommonJs.opinitionObj(_thirdIdentityResponseOldDTO.personMap)['第一联系人电话号码'];  //第一联系人（家庭联系人）
                        _contactInfoBackTH.twoName=cpCommonJs.opinitionObj(_thirdIdentityResponseOldDTO.personMap)['第二联系人姓名'];  //第二联系人姓名
                        _contactInfoBackTH.twoPhone=cpCommonJs.opinitionObj(_thirdIdentityResponseOldDTO.personMap)['第二联系人电话'];  //第二联系人（手机/固话2）
                        that.contactInfoBackTH=_contactInfoBackTH;
    
    
                        that.thirdIdentityResponseOldDTO = _thirdIdentityResponseOldDTO;
                        that.previousRepaymentResponseDTO = cpCommonJs.opinitionObj(_data.previousRepaymentResponseDTO); //29A 增加还款信息表现
                        
                        that.specialKey = _thirdIdentityResponseOldDTO.specialKey?_thirdIdentityResponseOldDTO.specialKey:{};
                        that.flagKey = _thirdIdentityResponseOldDTO.flagKey?_thirdIdentityResponseOldDTO.flagKey:{};
    
                        that.platforIdentityInfo = platforIdentityInfo; //详情-平台
                        that.platforFileInfo = platforFileInfo; //文件-平台
                        that.platformLoanPlanInfoDTOS = cpCommonJs.opinitionArray(_data.platformLoanPlanInfoDTOS); //还款列表-平台
                        that.showLoanFile=_data.showLoanFile?_data.showLoanFile:"";
                        that.needWithDraw=_data.needWithDraw;  
    
                        
                        //个人详情各种电话号码传给其他组件用
                        let _contactInfoBackXYH={};
                        _contactInfoBackXYH.userName=cpCommonJs.opinitionObj(_data.userInfo).realName;  //本人姓名
                        _contactInfoBackXYH.primaryPhone=cpCommonJs.opinitionObj(_data.userInfo).mobileNo;  //本人注册
                        _contactInfoBackXYH.company=cpCommonJs.opinitionObj(_data.jobInfo).companyName;  //单位名称
                        _contactInfoBackXYH.companyPhone=cpCommonJs.opinitionObj(_data.jobInfo).companyPhone;  //单位座机(公司电话)
                        _contactInfoBackXYH.directReferenceName=cpCommonJs.opinitionObj(_data.linkmanInfo).firstContactName;  //第一联系人名称
                        _contactInfoBackXYH.directReferencePhone=cpCommonJs.opinitionObj(_data.linkmanInfo).firstContactPhone;  //第一联系人（家庭联系人）
                        _contactInfoBackXYH.twoName=cpCommonJs.opinitionObj(_data.linkmanInfo).secondContactName;  //第二联系人姓名
                        _contactInfoBackXYH.twoPhone=cpCommonJs.opinitionObj(_data.linkmanInfo).secondContactPhone;  //第二联系人（手机/固话2）
                        _contactInfoBackXYH.bankpPhoneNo=cpCommonJs.opinitionObj(_data.receiptBankReservePhone);  //其他联系信息（银行卡预留手机）
                        that.contactInfoBackXYH=_contactInfoBackXYH;
                        
                        
                        
                        
                    }
                    that.XYH_IdentityInfo=_data;  //小雨花详情
                    if(fromFlag=='AG'){
                        that.XYH_IdentityInfo.userInfo.sumPrincipal = _data.sumPrincipal;
                        that.XYH_IdentityInfo.userInfo.sumAmountOfMonth = _data.sumAmountOfMonth;
                    }else if(fromFlag=='PF'){
                        that.dealData(platforIdentityInfo);
                    }
                    if (isChangeLeft) {
                        parentThis.changeLeftCP(0);
                    }
                })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //显示修改IMEI串码按钮
    @action showAddBtn(event) {
        let $this = $(event.target);
        let this_attr = $this.attr("data-action");
        if (this_attr == "showInput") {
            $(".IMEIinput,.addImeiBtn").removeClass("hidden");
            $(".IMEIinput").val("");
            $this.attr("data-action", "addImei");
            $this.text("取消");
        } else {
            $(".IMEIinput,.addImeiBtn").addClass("hidden");
            $(".IMEIinput").val("");
            $this.attr("data-action", "showInput");
            $this.text("新增");
        }

    }
    //修改IMEI串码-lyf
    @action updateIMEI = (event) => {
        let that = this;
        let $this = $(event.target);
        let imeitext = $(".IMEIinput").val();
        if (!imeitext) {
            alert("请输入需要新增的数据！");
            return;
        }
        $.ajax({
            type: "post",
            url: "/node/identity/update/imei",
            async: true,
            dataType: "JSON",
            data: {
                order_no: this.orderNo,
                product_no: this.cooperationFlag,
                platformFlag: this.platformFlag,
                imei: imeitext
            },
            success: function (res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                alert(res.data.message);
                $(".IMEIinput,.imeiBtn").addClass("hidden");
                $(".IMEIinput").val("");
                $this.attr("data-action", "showInput");
                $this.text("新增");
                that.getIdentityInfo();
            }
        })

    }
    //还原数据信息
    @action restoreUserInfo = () => {
        this.loanNo = ""; //条件-合同号
        this.orderNo = ""; //条件-订单号
        this.cooperationFlag = ""; //条件-合作方17C
        this.platformFlag = ""; //条件-平台标识 TH/TF

        this.loanStatus = "";
        this.thirdDataRepaymentResponseDTO = {}; //还款列表-第三方
        this.thirdFilesResponseOldDTO = {}; //文件-第三方
        this.thirdIdentityResponseOldDTO = {}; //详情-第三方
        this.specialKey = {}; //用作判断作用的对象-第三方详情
        this.flagKey = {}; //用作判断作用的对象-第三方详情
        this.previousRepaymentResponseDTO = {}; //29A 增加还款信息表现
        this.showLoanFile="";  //平台，合同（另外接口）文件是否展示

        this.platforIdentityInfo = {}; //详情-平台
        this.platforFileInfo = {}; //文件-平台
        this.XYH_IdentityInfo = {}; //详情-小雨花

        this.platformLoanPlanInfoDTOS = {} //还款列表-平台
        
        this.withdrawFileIds=[];  //需要重传的文件id
        this.withdrawFileTypes=[];  //重传文件类型-中文
        this.needWithDraw='';  //平台是否展示撤回，并且左边文件列表是否支持勾选
        this.spinning=false;
    }
    
    /**
     * 文件-新开页面预览文件
     * sign  标记，用于新开的页面获取对应下标
     * his_loanNo 合同号
     * his_orderNo 订单号
     * his_cooperationFlag 合作方
     * his_platformFlag 标示
     * his_JSsource 单开页面加载到js文件
     * type 是否用传入的参数
     */
    openPage = (sign,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,his_JSsource,type) => {
        if (!sign) {
            sign = "";
            alert('未获取到文件id！')
            return;
        }
        if (sign) {
            sign=sign.toString();
            sign=md5(sign);
        }
        let loanNo='',orderNo='',cooperationFlag='',platformFlag='',jSsource='',barseUrl='';
        if(type){
            loanNo=his_loanNo,orderNo=his_orderNo,cooperationFlag=his_cooperationFlag,platformFlag=his_platformFlag,jSsource=his_JSsource;
            barseUrl = "/cp-fileView?loanNo=" +loanNo + "&orderNo=" +orderNo + "&cooperationFlag=" +cooperationFlag + "&platformFlag=" +platformFlag + "&key=" + sign + "&JSsource="+jSsource;
        }else{
            barseUrl = "/cp-fileView?loanNo=" + this.loanNo + "&orderNo=" + this.orderNo + "&cooperationFlag=" + this.cooperationFlag + "&platformFlag=" + this.platformFlag + "&key=" + sign + "&JSsource=userInfoFile"+"&nationalId=" + this.nationalId;
        }
        window.open(barseUrl);
    }

    // 平台详情处理数据
    @action dealData = (data) => {
        // let data=this.platforIdentityInfo;
        if(Object.keys(data).length<=0){
            return;
        }
        let userInfo = cpCommonJs.opinitionObj(data.platformUserInfoDTO); //客户信息
        let bankInfo = cpCommonJs.opinitionObj(data.platformBankInfoDTO); //银行信息
        let contactsInfo = cpCommonJs.opinitionObj(data.platformContactsInfoDTO); //联系人信息
        let workInfo = cpCommonJs.opinitionObj(data.platformWorkInfoDTO); //工作信息
        let loanInfo = cpCommonJs.opinitionObj(data.platformLoanInfoDTO); //贷款信息
        let otherInfo = cpCommonJs.opinitionObj(data.platformOtherInfoDTO); //其他信息
        // ----------------------------------------------------------------------------------------------
        //处理用户居住省市区
        let userCityId = commonJs.is_obj_exist(userInfo.userCityId);
        let userCity = getAddressByCode.getAddressByCode(userCityId); //城市 
        let userDistrictId = commonJs.is_obj_exist(userInfo.userDistrictId);
        let userDistrict = getAddressByCode.getAddressByCode(userDistrictId); //区域
        let userProvinceId = commonJs.is_obj_exist(userInfo.userProvinceId);
        let userProvince = getAddressByCode.getAddressByCode(userProvinceId); //省份
        // userInfo.userAddress=userProvince+userCity+userDistrict;  //重新赋值住房省市区字段
        extendObservable(this.platforIdentityInfo.platformUserInfoDTO, {
            userAddress: userProvince + userCity + userDistrict
        })
        //处理客户信息-学位
        let userHighestEducation = userInfo.userHighestEducation;
        let newUserHighestEducation = "";
        switch (userHighestEducation) {
            case 1:
                newUserHighestEducation = "研究生";
                break;
            case 2:
                newUserHighestEducation = "大学本科和专科";
                break;
            case 3:
                newUserHighestEducation = "中专或中技";
                break;
            case 4:
                newUserHighestEducation = "技术学校";
                break;
            case 5:
                newUserHighestEducation = "高中";
                break;
            case 6:
                newUserHighestEducation = "初中";
                break;
            case 7:
                newUserHighestEducation = "小学及以下";
                break;
        }
        extendObservable(this.platforIdentityInfo.platformUserInfoDTO, {
            newUserHighestEducation: newUserHighestEducation
        })
        //处理客户信息-住房情况
        let userHousingSituation = userInfo.userHousingSituation;
        let newUserHousingSituation = "";
        switch (userHousingSituation) {
            case "rent":
                newUserHousingSituation = "租房";
                break;
            case "own":
                newUserHousingSituation = "买房";
                break;
            case "living_with_parents":
                newUserHousingSituation = "父母同住";
                break;
            case "mployer_provided":
                newUserHousingSituation = "公司提供";
                break;
            case "other":
                newUserHousingSituation = "其他";
                break;
        }
        extendObservable(this.platforIdentityInfo.platformUserInfoDTO, {
            newUserHousingSituation: newUserHousingSituation
        })
        //处理婚姻情况
        let userIsMarried = userInfo.userIsMarried;
        let newUserIsMarried = "";
        switch (userIsMarried) {
            case "1":
                newUserIsMarried = "未婚";
                break;
            case "2":
                newUserIsMarried = "已婚";
                break;
            case "3":
                newUserIsMarried = "初婚";
                break;
            case "4":
                newUserIsMarried = "再婚";
                break;
            case "5":
                newUserIsMarried = "复婚";
                break;
            case "6":
                newUserIsMarried = "丧偶";
                break;
            case "7":
                newUserIsMarried = "离婚";
                break;
        }
        extendObservable(this.platforIdentityInfo.platformUserInfoDTO, {
            newUserIsMarried: newUserIsMarried
        })
        // ----------------------------------------------------------------------------------------------
        //处理银行所在省市区
        let bankCityId = commonJs.is_obj_exist(bankInfo.bankCityId);
        let bankCity = getAddressByCode.getAddressByCode(bankCityId); //城市 
        let bankDistrictId = commonJs.is_obj_exist(bankInfo.bankDistrictId);
        let bankDistrict = getAddressByCode.getAddressByCode(bankDistrictId); //区域
        let bankProvinceId = commonJs.is_obj_exist(bankInfo.bankProvinceId);
        let bankProvince = getAddressByCode.getAddressByCode(bankProvinceId); //省份
        // bankInfo.bankAddress=bankProvince+bankCity+bankDistrict;  //重新赋值银行省市区字段
        extendObservable(this.platforIdentityInfo.platformBankInfoDTO, {
            bankAddress: bankProvince + bankCity + bankDistrict
        })
        // ----------------------------------------------------------------------------------------------
        //处理第一联系人省市区
        let contactFirstContactCityId = commonJs.is_obj_exist(contactsInfo.contactFirstContactCityId);
        let contactFirstContactCity = getAddressByCode.getAddressByCode(contactFirstContactCityId); //城市 
        let contactFirstContctDistrictId = commonJs.is_obj_exist(contactsInfo.contactFirstContctDistrictId);
        let contactFirstContctDistrict = getAddressByCode.getAddressByCode(contactFirstContctDistrictId); //区域
        let contactFirstContactProvinceId = commonJs.is_obj_exist(contactsInfo.contactFirstContactProvinceId);
        let contactFirstContactProvince = getAddressByCode.getAddressByCode(contactFirstContactProvinceId); //省份
        // contactsInfo.contactsAddress=contactFirstContactProvince+contactFirstContctDistrict+contactFirstContactCity;  //重新赋值联系人省市区字段
        extendObservable(this.platforIdentityInfo.platformContactsInfoDTO, {
            contactsAddress: contactFirstContactProvince + contactFirstContctDistrict + contactFirstContactCity
        })
        //处理第一联系人关系
        let contactFirstContactRelationship = contactsInfo.contactFirstContactRelationship;
        let newContactFirstContactRelationship = "";
        switch (contactFirstContactRelationship) {
            case "parent":
                newContactFirstContactRelationship = "父母";
                break;
            case "spouse":
                newContactFirstContactRelationship = "配偶";
                break;
            case "child":
                newContactFirstContactRelationship = "儿女";
                break;
        }
        extendObservable(this.platforIdentityInfo.platformContactsInfoDTO, {
            newContactFirstContactRelationship: newContactFirstContactRelationship
        })
        //处理第二联系人关系
        let contactSecondContactRelationship = contactsInfo.contactSecondContactRelationship;
        let newContactSecondContactRelationship = "";
        switch (contactSecondContactRelationship) {
            case "relative":
                newContactSecondContactRelationship = "亲戚";
                break;
            case "colleague":
                newContactSecondContactRelationship = "同事";
                break;
            case "friend":
                newContactSecondContactRelationship = "朋友";
                break;
        }
        extendObservable(this.platforIdentityInfo.platformContactsInfoDTO, {
            newContactSecondContactRelationship: newContactSecondContactRelationship
        })
        // ----------------------------------------------------------------------------------------------
        //处理工作信息-收入来源
        let userIncomeSource = workInfo.userIncomeSource;
        let newUserIncomeSource = "";
        switch (userIncomeSource) {
            case "4":
                newUserIncomeSource = "工薪";
                break;
            case "3":
                newUserIncomeSource = "自营";
                break;
            case "2":
                newUserIncomeSource = "自由职业者";
                break;
            case "1":
                newUserIncomeSource = "离退休";
                break;
            case "0":
                newUserIncomeSource = "无业";
                break;
        }
        extendObservable(this.platforIdentityInfo.platformContactsInfoDTO, {
            newUserIncomeSource: newUserIncomeSource
        })
        //处理单位地址省市区
        let workWorkCityId = commonJs.is_obj_exist(workInfo.workWorkCityId);
        let workWorkCity = getAddressByCode.getAddressByCode(workWorkCityId); //城市 
        let workWorkDistrictId = commonJs.is_obj_exist(workInfo.workWorkDistrictId);
        let workWorkDistrict = getAddressByCode.getAddressByCode(workWorkDistrictId); //区域
        let workWorkProvinceId = commonJs.is_obj_exist(workInfo.workWorkProvinceId);
        let workWorkProvince = getAddressByCode.getAddressByCode(workWorkProvinceId); //省份
        // workInfo.workAddress=workWorkProvince+workWorkCity+workWorkDistrict;  //重新赋值单位地址省市区字段
        extendObservable(this.platforIdentityInfo.platformWorkInfoDTO, {
            workAddress: workWorkProvince + workWorkCity + workWorkDistrict
        })
        // ----------------------------------------------------------------------------------------------
        //处理其他信息-最高学历
        let userHighestDegree = otherInfo.userHighestDegree;
        let newUserHighestDegree = "";
        switch (userHighestDegree) {
            case "0":
                newUserHighestDegree = "其他";
                break;
            case "1":
                newUserHighestDegree = "名誉博士";
                break;
            case "2":
                newUserHighestDegree = "博士";
                break;
            case "3":
                newUserHighestDegree = "硕士";
                break;
            case "4":
                newUserHighestDegree = "学士";
                break;
            case "9":
                newUserHighestDegree = "未知";
                break;
        }
        extendObservable(this.platforIdentityInfo.platformOtherInfoDTO, {
            newUserHighestDegree: newUserHighestDegree
        })
    }
}