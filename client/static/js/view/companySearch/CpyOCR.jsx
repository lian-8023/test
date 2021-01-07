// Ast
import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import ModuleMsg from './ModuleMsg';
import Communication_select from '../module/Communication_select'

//获取所有短信模板
import GetAllMsg from '../../source/common/getAllMsg';
var getAllMsg=new GetAllMsg;
import SendMessage from '../module/sendMessage'; //发送短信弹窗

class CpyOCR extends React.Component {
    constructor(props){
        super(props);
        this.state={
            ocrDate:"", //请求的全部数据
            conditionParam:{},
            ocrModule:{},//对应模型结果-数据来源queue
            statusReasonMap:{},
            change_loanNumber_acount:"",
            change_loanNumber_loanNumber:"",
            nowStatusId:"",
            ocrQueueCertificateRecordsInfoDTO:[]  //文件类型历史记录
        }
    }
    UNSAFE_componentWillMount (){
        this.setState({
            conditionParam:{
                _acount:this.props._acount,
                _loanNumber:this.props._loanNumber,
                _nationalId:this.props._nationalId
            }
        },()=>{
            this.getMsg("RELOAD",true);
        });
        this.initCount();
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        // 初始化
        this.domDataContrle(nextProps);
        $(".edit").text("修改").removeClass("btn-blue").addClass("btn-white");
        $(".cancle_edit").addClass("hidden");
        $(".workFile-tab").find(".select-gray").attr("disabled","true");
        $(".workFile-tab").find(".myCheckbox").removeClass("myCheckbox-visited").unbind("click");

        var _oper_type = nextProps._oper_type_props;
        if(_oper_type=="search"){
            this.setState({
                ocrDate:{},
                ocrModule: {},
                conditionParam:nextProps,
                },()=>{
                    this.getMsg("SEARCH",true);
                });
        }else if(_oper_type=="next"){
            if(nextProps._ocr_Q_ajax&&nextProps._ocr_Q_ajax!="") {
                var moduleMsg = this.parseOcrModule(nextProps._ocr_Q_ajax);
                this.setState({
                    ocrDate: nextProps._ocr_Q_ajax,
                    ocrModule: moduleMsg,
                    conditionParam: {
                        _phoneNo: {},
                        _acount: nextProps._ocr_Q_ajax.ocrQueueInfoDTO.accountId,
                        _loanNumber: nextProps._ocr_Q_ajax.ocrQueueInfoDTO.loanNumber,
                        _nationalId:nextProps._nationalId
                    }
                }, ()=> {
                    this.domDataContrle(this.state.ocrDate);
                    $(".ocr-ctl-tit h3").removeClass("on");
                    $(".ocr-ctl-tit h3").eq(0).addClass("on");
                    $(".ocr-ctl-cont").addClass("hidden");
                    $(".ocr-ctl-cont").eq(0).removeClass("hidden");
                });
            }
        }else if(_oper_type=="change_loanNumber"){
            this.setState({
                change_loanNumber_acount: nextProps._acount,
                change_loanNumber_loanNumber: nextProps._loanNumber
            },()=>{
                this.pub_getOcrMsg(this.state.change_loanNumber_acount,this.state.change_loanNumber_loanNumber,"SEARCH",true);
            });
        }
        this.initCount();
    }
    /**
     * 文件类型版块数据展示
     * current_text 当前tr行
     * trClass tr class类
     * isOkClass 合格且录入 td class名
     */
    ocrCertificate_fn(current_text,trClass,isOkClass){

    }
    componentDidMount(){
        $(".topBundleCounts").removeClass("hidden");
        $(".fraudCounts").addClass("hidden");
        let params_rigPage=this.props._params_rigPage;
        if(params_rigPage!="OCR"){
            $(".OCR-edit-div").addClass("hidden");
        }else {
            $(".OCR-edit-div").removeClass("hidden");
        }

        if(this.props._params_rigPage!="reminder" && this.props._params_rigPage!="collection"){
            var h = document.documentElement.clientHeight;
            $(".auto-box").css("height", h - 200);
        }  
    }
    //ocr辅助证明类型文件数据 展示数据
    initFileMsg(){
        if($(".workFile-tab") && $(".workFile-tab").length>0){
            $(".workFile-tab").find(".myCheckbox").removeClass("myCheckbox-readOnly").addClass("myCheckbox-normal");
            $(".workFile-tab").find("input").val("-");
            $(".workFile-tab").find(".emp-div").html("-<br />-");
            $(".workFile-tab").find("[data-id]").attr("data-id","");
            $(".workFile-tab").find("option").removeProp("selected");
            $(".workFile-tab").find(".defaultOption").prop("selected","selected");
        }
    }
    domDataContrle(ocrDates){
        this.initFileMsg();
        if(ocrDates.ocrQueueCertificateRecordsInfoDTOS && ocrDates.ocrQueueCertificateRecordsInfoDTOS.length>0){
            let _OcrQFileInfoDTO=ocrDates.ocrQueueCertificateRecordsInfoDTOS;
            for(let i=0;i<_OcrQFileInfoDTO.length;i++){
                let _certificateType=_OcrQFileInfoDTO[i].certificateType;
                if(_certificateType=="电话清单"){
                    $(".phoneTr").attr("data-id",_OcrQFileInfoDTO[i].id)
                    let _certificateNameChinese=_OcrQFileInfoDTO[i].certificateNameChinese;
                    if(_certificateNameChinese){  //文件类型
                        let phone_mounth=_certificateNameChinese.substring(0,_certificateNameChinese.indexOf("/"));
                        let phone_lim=_certificateNameChinese.substring(_certificateNameChinese.indexOf("/")+1,_certificateNameChinese.length);
                        $(".phoneSelectList_mouth option:selected").text(phone_mounth);
                        $(".phoneSelectList_limit option:selected").text(phone_lim);
                    }else{
                        $(".phoneSelectList_mouth").find("option").removeProp("selected");
                        $(".phoneSelectList_mouth").find(".defaultOption").prop("selected","selected");

                        $(".phoneSelectList_limit").find("option").removeProp("selected");
                        $(".phoneSelectList_limit").find(".defaultOption").prop("selected","selected");
                    }
                    
                    if(_OcrQFileInfoDTO[i].isOk==1){
                        $(".phoneTr .isEnterFromPhone .myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-readOnly");
                    }else{
                        $(".phoneTr .isEnterFromPhone .myCheckbox").removeClass("myCheckbox-readOnly").addClass("myCheckbox-normal");
                    }

                    $(".isEnterFromPhone .two-line-text").html(
                        commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedBy)
                        +"<br />"+
                        commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedAt)
                    );
                }
                if(_certificateType=="银行流水"){
                    $(".bankTr").attr("data-id",_OcrQFileInfoDTO[i].id)
                    let _certificateNameChinese=_OcrQFileInfoDTO[i].certificateNameChinese;
                    $(".bankSelectList option:selected").text(_certificateNameChinese);
                    if(_OcrQFileInfoDTO[i].isOk==1){
                        $(".bankTr .isEnterFromBank .myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-readOnly");
                    }else{
                        $(".bankTr .isEnterFromBank .myCheckbox").removeClass("myCheckbox-readOnly").addClass("myCheckbox-normal");
                    }
                    $(".isEnterFromBank .two-line-text").html(commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedBy)+"<br />"+commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedAt));
                }
                if(_certificateType=="工作证明"){
                    $(".workTr").attr("data-id",_OcrQFileInfoDTO[i].id)
                    let _certificateNameChinese=_OcrQFileInfoDTO[i].certificateNameChinese;
                    $(".workSelectList option:selected").text(_certificateNameChinese);
                    if(_OcrQFileInfoDTO[i].isOk==1){
                        $(".workTr .isEnterFromJob .myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-readOnly");
                    }else{
                        $(".workTr .isEnterFromJob .myCheckbox").removeClass("myCheckbox-readOnly").addClass("myCheckbox-normal");
                    }
                    $(".isEnterFromJob .two-line-text").html(commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedBy)+"<br />"+commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedAt) );
                }
                if(_certificateType=="公司注册/营业执照"){
                    $(".compyTr").attr("data-id",_OcrQFileInfoDTO[i].id)
                    let _certificateNameChinese=_OcrQFileInfoDTO[i].certificateNameChinese;
                    $(".compneySelectList option:selected").text(_certificateNameChinese);
                    if(_OcrQFileInfoDTO[i].isOk==1){
                        $(".compyTr .isEnterFromCompanyResgit .myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-readOnly");
                    }else{
                        $(".compyTr .isEnterFromCompanyResgit .myCheckbox").removeClass("myCheckbox-readOnly").addClass("myCheckbox-normal");
                    }
                    $(".isEnterFromCompanyResgit .two-line-text").html(commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedBy)+"<br />"+commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedAt) );
                }
                if(_certificateType=="地址证明"){
                    $(".addrTr").attr("data-id",_OcrQFileInfoDTO[i].id)
                    let _certificateNameChinese=_OcrQFileInfoDTO[i].certificateNameChinese;
                    $(".addressSelectList option:selected").text(_certificateNameChinese);
                    if(_OcrQFileInfoDTO[i].isOk==1){
                        $(".addrTr .isEnterFromAddressProf .myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-readOnly");
                    }else{
                        $(".addrTr .isEnterFromAddressProf .myCheckbox").removeClass("myCheckbox-readOnly").addClass("myCheckbox-normal");
                    }
                    $(".isEnterFromAddressProf .two-line-text").html(commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedBy)+"<br />"+commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedAt) );
                }
                if(_certificateType=="辅助证明"){
                    $(".assistTr").attr("data-id",_OcrQFileInfoDTO[i].id)
                    let _certificateNameChinese=_OcrQFileInfoDTO[i].certificateNameChinese;
                    $(".assitsSelectList option:selected").text(_certificateNameChinese);
                    if(_OcrQFileInfoDTO[i].isOk==1){
                        $(".assistTr .isEnterFromAssistProf .myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-readOnly");
                    }else{
                        $(".assistTr .isEnterFromAssistProf .myCheckbox").removeClass("myCheckbox-readOnly").addClass("myCheckbox-normal");
                    }
                    $(".isEnterFromAssistProf .two-line-text").html(commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedBy)+"<br />"+commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedAt) );
                }
                if(_certificateType=="通讯录授权"){
                    $(".communicationTr").attr("data-id",_OcrQFileInfoDTO[i].id)
                    let _certificateNameChinese=_OcrQFileInfoDTO[i].certificateNameChinese;
                    if(_OcrQFileInfoDTO[i].isOk==1){
                        $(".communicationTr .isEnterFrommailListGrant .myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-readOnly");
                    }else{
                        $(".communicationTr .isEnterFrommailListGrant .myCheckbox").removeClass("myCheckbox-readOnly").addClass("myCheckbox-normal");
                    }
                    $(".communicationTr .isEnterFrommailListGrant .two-line-text").html(commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedBy)+"<br />"+commonJs.is_obj_exist(_OcrQFileInfoDTO[i].updatedAt));
                }
            }
        }
    }

    //保存ocr Queue
    saveOcrQueue(event){
        let _that=this;
        let $this=$(event.target);
        let _afterQueueStatusId=$(".contactResultsInfo .commu-select option:selected").attr("id");
        if(!_afterQueueStatusId || typeof(_afterQueueStatusId)=="undefined"){
            alert("处理状态为必填项！");
            return;
        }
        let _contactMethodId=$(".contactMethods .commu-select option:selected").attr("id");
        let _contactResultId=$(".contactResultReasonsInfo .commu-select option:selected").attr("id");
        let _beforeQueueStatusId=$(".queueStatu").attr("data-queueStatusId");
        let _beforeOperateStatus=$(".queueStatu").attr("data-queueStatus");
        let _caseContent=$(".ocrQdetail").val();
        if(!_contactMethodId || _contactMethodId=="0"){
            alert("请选择沟通方式!");
            return;
        }
        if(_beforeQueueStatusId==4||_beforeQueueStatusId==6||_beforeQueueStatusId==7||_beforeQueueStatusId==8||_beforeQueueStatusId==10){
            alert("当前queue状态为"+_beforeOperateStatus+",不能操作");
            return;
        }
        var _data={
                accountId:_that.state.ocrDate.ocrQueueInfoDTO.accountId,
                afterQueueStatusId:_afterQueueStatusId?_afterQueueStatusId:0,   //操作后状态ID --处理状态id
                beforeQueueStatusId:_beforeQueueStatusId,  //操作前状态ID -- companySearchQueueInfoDTO.queueStatusId
                caseContent:_caseContent,  //内容-详情
                contactMethodId:_contactMethodId?_contactMethodId:0,  //沟通方式--沟通方式 id
                loanNumber:_that.state.ocrDate.ocrQueueInfoDTO.loanNumber,
                beforeOperateStatus:_beforeOperateStatus,  //操作之前的状态中文 -- saveVoeQueue.queueStatus
            };
        let _scheduledTime=$(".contactResultsInfo_time").attr("data-time");  //跟进时间--当处理状态选择 跟进时 获取时间
        let followUpTime_attr=$this.closest("table").find(".contactResultsInfo_time option:selected").attr("data-contactresult");
        if(_scheduledTime!=""){
            _data.scheduledTime=_scheduledTime  //	跟进时间--当处理状态选择 跟进时 获取时间 ps：用户没选则不传字段
        }
        // if(followUpTime_attr=="default_follow_up"){
        //     if(_scheduledTime!=""){
        //         _data.scheduledTime=_scheduledTime  //	跟进时间--当处理状态选择 跟进时 获取时间 ps：用户没选则不传字段
        //     }else{
        //         alert("请选择跟进时间！");
        //         return;
        //     }
        // }else 
        if(followUpTime_attr=="complete"||followUpTime_attr=="withdraw"||followUpTime_attr=="cancel"||followUpTime_attr=="decline"){
            if(!_contactResultId||_contactResultId==""||_contactResultId=="0"){
                alert("请选择原因");
                return;
            }
            _data.contactResultId=_contactResultId?_contactResultId:0; //结果 -- 处理原因 id
            _data.withdrawOrCancelReasonId=_contactResultId?_contactResultId:0; //拒绝原因ID
        }
        $.ajax({
            type:"get",
            url:"/companySearch/saveOcrQueue",
            async:false,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                if(!_getData.executed){
                    console.log("保存ocr Queue失败");
                    return;
                }
                alert(_getData.message);
                commonJs.cancelSaveQ();
                _that.getMsg("RELOAD",true);
            }
        })
    }
    //取消
    cancel_edit(event){
        let $this=$(event.target);
        $this.parent().find(".edit").text("修改").removeClass("btn-blue").addClass("btn-white");
        $this.addClass("hidden");
        $this.closest("table").find(".select-gray").attr("disabled","true");
        $this.closest("table").find(".myCheckbox").removeClass("myCheckbox-visited").unbind("click");
        this.getMsg("RELOAD");
    }
    //修改 || 保存 ocr辅助证明类型文件数据
    saveOcrCertificates(event){
        var _that=this;
        var _data={};//ajax给后台数据
        var $this=$(event.target);
        var $parent=$this.closest("table");
        if($this.text()=="修改"){
            $this.text("保存").removeClass("btn-white").addClass("btn-blue");
            $this.parent().find(".cancle_edit").removeClass("hidden");
            $this.closest("table").find(".select-gray").removeAttr("disabled");

            $parent.find(".myCheckbox").each(function(){
                if($(this).hasClass("myCheckbox-readOnly")){
                    $(this).removeClass("myCheckbox-readOnly").addClass("myCheckbox-visited");
                }else{
                    $(this).addClass("myCheckbox-normal");
                }
            })
            //工作信息核实 checkbox点击
            $parent.find(".myCheckbox").on("click",function(){
                let _tr=$(this).closest("tr");
                _tr.attr("isChanged","yes");
                if(_tr.find("select").length>0){
                    let textCont=_tr.find("select option:selected").text();
                    if(textCont==""){
                        alert("请先选择对应的文件类型！");
                        return;
                    }
                }
                if($(this).hasClass("myCheckbox-visited")){
                    $(this).removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                }else{
                    $(this).removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
                }
            })
        }else{
            _data.accountId=_that.state.ocrDate.ocrQueueInfoDTO.accountId;
            _data.loanNumber=_that.state.ocrDate.ocrQueueInfoDTO.loanNumber;
            if($parent.find(".phoneTr").attr("isChanged")=="yes"){
                // let _phoneId=$parent.find(".phoneTr[isChanged='yes']").attr("data-id");
                // if(_phoneId)_data.phoneId=_phoneId;  //电话清单文件类型主键ID
                let _phoneSelectList_mouth=$parent.find(".phoneTr[isChanged='yes'] .phoneSelectList_mouth option:selected").text();
                let _phoneSelectList_limit=$parent.find(".phoneTr[isChanged='yes'] .phoneSelectList_limit option:selected").text();
                if(_phoneSelectList_mouth || _phoneSelectList_limit)_data.fileTypeFromPhone=_phoneSelectList_mouth+"/"+_phoneSelectList_limit;  //电话清单文件类型
                let _phoneGrantAuth=$parent.find(".phoneTr[isChanged='yes'] .grantAuth").text();
                if(_phoneGrantAuth && _phoneGrantAuth!="-" && _phoneGrantAuth!="是"){
                    _data.phoneGrantAuth=true; //是否授权
                }
                let _phoneGrantDate=$parent.find(".phoneTr[isChanged='yes'] .authorizationTime").text();
                if(_phoneGrantDate && _phoneGrantDate!="-")_data.phoneGrantDate=_phoneGrantDate?_phoneGrantDate:"";  //授权时间
                let _isEnterFromPhone=$parent.find(".phoneTr[isChanged='yes'] .isEnterFromPhone").find(".myCheckbox").hasClass("myCheckbox-visited");
                let _phoneTr_checkbox=_isEnterFromPhone?1:0;
                _data.isEnterFromPhone=_phoneTr_checkbox;  //电话清单是否合格且录入
            }

            if($parent.find(".bankTr").attr("isChanged")=="yes"){
                // let _bankId=$parent.find(".bankTr[isChanged='yes']").attr("data-id");
                // if(_bankId)_data.bankId=_bankId;  //银行流水文件类型主键ID
                let _fileTypeFromBankWater=$parent.find(".bankTr[isChanged='yes'] .bankSelectList option:selected").text();
                if(_fileTypeFromBankWater)_data.fileTypeFromBankWater=_fileTypeFromBankWater;  //银行流水文件类型
                let _isEnterFromBank=$parent.find(".bankTr[isChanged='yes'] .isEnterFromBank").find(".myCheckbox").hasClass("myCheckbox-visited");
                let _bankTr_checkbox=_isEnterFromBank?1:0;
                _data.isEnterFromBank=_bankTr_checkbox;  //银行流水是否合格且录入
                let _bankGrantAuth=$parent.find(".bankTr[isChanged='yes'] .grantAuth").text();
                if(_bankGrantAuth && _bankGrantAuth!="-" && _bankGrantAuth!="是"){
                    _data.bankGrantAuth=true; //是否授权
                }
                let _bankGrantDate=$parent.find(".bankTr[isChanged='yes'] .authorizationTime").text();
                if(_bankGrantDate && _bankGrantDate!="-"){
                    _data.bankGrantDate=_bankGrantDate;  //授权时间
                }
            }

            if($parent.find(".workTr").attr("isChanged")=="yes"){
                // let _jobId=$parent.find(".workTr[isChanged='yes']").attr("data-id");
                // if(_jobId)_data.jobId=_jobId?_jobId:"";  //工作证明文件类型主键ID
                let _fileTypeFromJob=$parent.find(".workTr[isChanged='yes'] .workSelectList option:selected").text();
                if(_fileTypeFromJob)_data.fileTypeFromJob=_fileTypeFromJob;  //工作证明文件类型
                let _isEnterFromJob=$parent.find(".workTr[isChanged='yes'] .isEnterFromJob").find(".myCheckbox").hasClass("myCheckbox-visited");
                let _workTr_checkbox=_isEnterFromJob?1:0;
                _data.isEnterFromJob=_workTr_checkbox;  //工作证明是否合格且录入

                let _jobGrantAuth=$parent.find(".workTr[isChanged='yes'] .grantAuth").text();
                if(_jobGrantAuth && _jobGrantAuth!="-" && _jobGrantAuth!="是"){
                    _data.jobGrantAuth=true;  //是否授权
                }
                let _jobGrantDate=$parent.find(".workTr[isChanged='yes'] .authorizationTime").text();
                if(_jobGrantDate && _jobGrantAuth!="-"){
                    _data.jobGrantDate=_jobGrantDate;  //授权时间
                }
            }

            if($parent.find(".compyTr").attr("isChanged")=="yes"){
                // let _companyRegistId=$parent.find(".compyTr[isChanged='yes']").attr("data-id");
                // if(_companyRegistId)_data.companyRegistId=_companyRegistId;  //公司注册文件类型主键ID
                let _fileTypeFromCompanyRegist=$parent.find(".compyTr[isChanged='yes'] .compneySelectList option:selected").text();
                if(_fileTypeFromCompanyRegist)_data.fileTypeFromCompanyRegist=_fileTypeFromCompanyRegist?_fileTypeFromCompanyRegist:"";  //公司注册文件类型
                let _isEnterFromCompanyResgit=$parent.find(".compyTr[isChanged='yes'] .isEnterFromCompanyResgit").find(".myCheckbox").hasClass("myCheckbox-visited");
                let _compyTr_checkbox=_isEnterFromCompanyResgit?1:0;
                _data.isEnterFromCompanyResgit=_compyTr_checkbox;  //公司注册证明是否合格且录入
            }

            if($parent.find(".communicationTr").attr("isChanged")=="yes"){
                // let _mailListGrantId=$parent.find(".communicationTr[isChanged='yes']").attr("data-id");
                // _data.mailListGrantId=_mailListGrantId;  //通讯录授权文件类型主键ID
                let _isEnterFrommailListGrant=$parent.find(".communicationTr[isChanged='yes'] .isEnterFrommailListGrant").find(".myCheckbox").hasClass("myCheckbox-visited");
                let _addrTr_checkbox=_isEnterFrommailListGrant?1:0;
                _data.isEnterFrommailListGrant=_addrTr_checkbox;  //通讯录授权是否合格且录入
                let _mailListGrantAuth=$parent.find(".communicationTr[isChanged='yes'] .grantAuth").text();
                if(_mailListGrantAuth && _mailListGrantAuth!="-" && _mailListGrantAuth=="是"){
                    _data.mailListGrantAuth=true; //是否授权
                }
                let _mailListGrantGrantDate=$parent.find(".communicationTr[isChanged='yes'] .authorizationTime").text();
                if(_mailListGrantGrantDate && _mailListGrantGrantDate!="-"){
                    _data.mailListGrantGrantDate=_mailListGrantGrantDate;  //授权时间
                }
            }
            $.ajax({
                type:"get",
                url:"/companySearch/saveOcrCertificates",
                async:false,
                dataType: "JSON",
                data:_data,
                success:function(res) {
                    if (!commonJs.ajaxGetCode(res)) {
                        return;
                    }
                    var _getData = res.data;
                    if(!_getData.executed){
                        console.log("保存ocr辅助证明类型文件数据失败");
                        return;
                    }
                    alert(_getData.message);
                    $this.parent().find(".edit").text("修改").removeClass("btn-blue").addClass("btn-white");
                    $this.parent().find(".cancle_edit").addClass("hidden");
                    $parent.find(".myCheckbox").removeClass("myCheckbox-visited").unbind("click");
                    $this.closest("table").find(".select-gray").attr("disabled","disabled");
                    $(".workFile-tab tr").removeAttr("isChanged");
                    _that.getMsg("RELOAD");
                }
            })
        }
    }
    initCount(){
        var _that=this;
        //获取数据处理情况
        $.ajax({
            type:"get",
            url:"/companySearch/getOcrCount",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                _that.props._topBindNumber_fn(_getData);
            }
        })
    }
    getMsg(operType){
        var _phone=this.state.conditionParam._phoneNo;
        var _accountId=this.state.conditionParam._acount;
        var _loanNumber=this.state.conditionParam._loanNumber;
        this.pub_getOcrMsg(_accountId,_loanNumber,operType);
        $(".ocr-ctl-tit h3").removeClass("on");
        $(".ocr-ctl-tit h3").eq(0).addClass("on");
        $(".ocr-ctl-cont").addClass("hidden");
        $(".ocr-ctl-cont").eq(0).removeClass("hidden");
     }
    //获取页面数据
    pub_getOcrMsg(_accountId,_loanNumber,operType){
        var _that=this;
        commonJs.cancelSaveQ(); //初始化queue操作框
        if( (typeof(_accountId)=="undefined" || _accountId=="") || (typeof(_loanNumber)=="undefined"|| _loanNumber=="")){
            return;
        }
        $.ajax({
            type: "get",
            url: "/companySearch/getOcrQueueByLoanNumber",
            async: true,
            scriptCharset: 'utf-8',
            data: {
                accountId: _accountId,
                loanNumber: _loanNumber,
                queueReloadEnum:operType,
            },
            dataType: "JSON",
            success: function (res) {
                commonJs.ajaxGetCode(res);
                var _getData = res.data;
                var moduleMsg = _that.parseOcrModule(_getData);
                if(!_getData.executed){
                    _that.setState({
                        ocrDate:_getData,
                        ocrModule:moduleMsg,
                        ocrQueueCertificateRecordsInfoDTO:[]
                    },()=>{
                        _that.domDataContrle(_getData);
                    });
                    return;
                }
                if(_getData.status=="blind"){
                    alert("当前queue已被"+_getData.user+"绑定！");
                    $(".reloadModeMsg").addClass("hidden");
                }
                //跟进group相同去处循环记录
                let fielInfolist=_getData.ocrQueueCertificateRecordsInfoDTO;
                // let _ocrQueueCertificateRecordsInfoDTO=[];
                // if(fielInfolist){
                //     let list_obj={};
                //     for(let i=0;i<fielInfolist.length;i++){
                //         let _group=fielInfolist[i].group;
                //         let _val=fielInfolist[i];
                //         let _vals=list_obj[_group];
                //         if(!_vals){
                //             _vals=[];
                //         }
                //         _vals.push(_val);
                //         list_obj[_group]=_vals;
                //     }
                //     for (let key in list_obj){
                //         _ocrQueueCertificateRecordsInfoDTO.push(list_obj[key]);
                //     }
                // }
                
                _that.setState({
                    ocrDate:_getData,
                    ocrModule:moduleMsg,
                    ocrQueueCertificateRecordsInfoDTO:fielInfolist   //文件类型历史记录
                },()=>{
                    _that.domDataContrle(_getData);
                })
                _that.initCount();
            }
        })
    }

    parseOcrModule(ocrData){
        var moduleMsg = {};
        moduleMsg._source="";
        if(ocrData&&ocrData!=""){
            let _getOcrQMode=ocrData.ocrQueueInfoDTO?ocrData.ocrQueueInfoDTO:""; //模型信息
            moduleMsg._source="cretditModel"; //模型来源
            moduleMsg._grade=_getOcrQMode.grade; //CreditModel等级
            moduleMsg._result=_getOcrQMode.result;  //结果
            moduleMsg._loanAmount3=_getOcrQMode.loanAmount3; //选择金额/3
            moduleMsg._loanAmount12=_getOcrQMode.loanAmount12; //选择金额/12
            moduleMsg._loanAmount18=_getOcrQMode.loanAmount18; //选择金额/18
            moduleMsg._loanAmount24=_getOcrQMode.loanAmount24; //选择金额/24
            moduleMsg._loanAmount36=_getOcrQMode.loanAmount36; //选择金额/36
            moduleMsg._selected_amount=ocrData.selected_amount; //选择金额
            moduleMsg._periods=ocrData.installments ; //期数
            moduleMsg._contract_expiring_date=ocrData.contract_expiring_date; //合同过期日
            moduleMsg._module_date=_getOcrQMode.modeldt; //模型时间
            moduleMsg.lpTest=_getOcrQMode.lpTest; //测试分组
            moduleMsg.ocrTest=_getOcrQMode.ocrTest; //ocrTest
        }
        return moduleMsg;
    }

    turnStatus(status_id,status_value){
        $(".customSelect-ul").addClass("hidden");
        $(".customSelect-ul .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        this.setState({
            selectdArray:[],
            _selected:""
        })//初始化审核结论列表end
        $(".followUpTime").addClass("hidden");
        $(".contactResultReasonsInfo").addClass("hidden");
        $(".contactResultsInfo_time .commu-select").css("width","95%");
        if(status_value=="default_follow_up"){   //设置跟进时间-显示时间控件
            $(".contactResultsInfo_time .commu-select").css("width","40%");
            $(".followUpTime").removeClass("hidden");
        }else if(status_value=="complete"||status_value=="withdraw"||status_value=="cancel"||status_value=="decline" ){
            $(".contactResultReasonsInfo").removeClass("hidden");
            this.setState({
                nowStatusId:status_id
            });
        }
    }
    //显示发送短信弹窗
    showSendMsg(){
        let data=getAllMsg.getAllMsg();
        this.setState({
            msgTypeList:data.templateList
        })
        $(".sendMessage-pop").removeClass("hidden");
    }
    //操作切换
    ocrCtlLable(event){
        let $this=$(event.target);
        let n=$this.index();
        $(".ocr-ctl-tit h3").removeClass("on");
        $(".ocr-ctl-tit h3").eq(n).addClass("on");
        $(".ocr-ctl-cont").addClass("hidden");
        $(".ocr-ctl-cont").eq(n).removeClass("hidden");
    }
    //标识文件类型信息板块是否被修改过
    isChanged(event){
        let $parent=$(event.target).closest("tr");
        $parent.attr("isChanged","yes");
    }
    render() {
        let ocrDates = this.state.ocrDate;

        var moduleMsg=this.state.ocrModule;  //模型数据
        let _ocrQueueRecordsInfoDTO=ocrDates.ocrQueueRecordsInfoDTO;  //沟通方式

        let communications = (ocrDates && ocrDates.contactMethodsInfoDTO); //沟通方式 组件需要数据 array
        let contactResults = (ocrDates && ocrDates.contactResultsInfoDTO); //处理状态数据 组件需要数据 array
        let ocrQueueCertificateRecordsInfoDTO=this.state.ocrQueueCertificateRecordsInfoDTO; //历史记录

        var dealReasons = [];
        if(ocrDates&&ocrDates.contactResultReasonsInfoDTO&&this.state.nowStatusId){
            for(var i=0;i<ocrDates.contactResultReasonsInfoDTO.length;i++){
                var reason_i = ocrDates.contactResultReasonsInfoDTO[i];
                if(reason_i.contactResultId==this.state.nowStatusId){
                    dealReasons.push(reason_i);
                }
            }
        }

        let _queueStatusId, _queueStatus;
        if (ocrDates && ocrDates.ocrQueueInfoDTO && (typeof (ocrDates.ocrQueueInfoDTO) != "undefined")) {
            _queueStatusId = ocrDates.ocrQueueInfoDTO.queueStatusId;
            _queueStatus = ocrDates.ocrQueueInfoDTO.queueStatus;
        }

        if(ocrDates.ocrCertificatesInfoDTOS){
            var _ocrCertificatesInfoDTOS=ocrDates.ocrCertificatesInfoDTOS;  //ocr辅助证明类型文件 全部数据
            var phoneSelectList1=[];  //电话清单月份数据
            var phoneSelectList2=[];  //电话清单月份数据
            var bankSelectList=[];  //银行流水数据
            var workSelectList=[];  //工作证明数据
            var compneySelectList=[];  //公司注册/营业执照
            var addressSelectList=[];  //地址证明
            var assitsSelectList=[];  //辅助证明
            var phoneList=[];  //通讯录授权
            for(let i=0;i<_ocrCertificatesInfoDTOS.length;i++){
                let thisCertificateType=_ocrCertificatesInfoDTOS[i].certificateType;
                if(thisCertificateType=="电话清单1"){
                    phoneSelectList1.push(_ocrCertificatesInfoDTOS[i]);
                }
                if(thisCertificateType=="电话清单2"){
                    phoneSelectList2.push(_ocrCertificatesInfoDTOS[i]);
                }
                if(thisCertificateType=="银行流水1"){
                    bankSelectList.push(_ocrCertificatesInfoDTOS[i]);
                }
                if(thisCertificateType=="工作证明1"){
                    workSelectList.push(_ocrCertificatesInfoDTOS[i]);
                }
                if(thisCertificateType== "公司注册/营业执照"){
                    compneySelectList.push(_ocrCertificatesInfoDTOS[i]);
                }
                if(thisCertificateType== "地址证明_new"){
                    addressSelectList.push(_ocrCertificatesInfoDTOS[i]);
                }
                if(thisCertificateType== "辅助证明_new"){
                    assitsSelectList.push(_ocrCertificatesInfoDTOS[i]);
                }
            }
        }
        var _ocrAuthStatusInfoDTO=ocrDates.ocrAuthStatusInfoDTO;
        //分析当前记录是否被其他人绑定，即status=blind标识被绑定了，则只能查看不能操作
        var blind_status = ocrDates.status;
        var isHideOper = blind_status=="blind"||_queueStatusId==4||_queueStatusId==6||_queueStatusId==7||_queueStatusId==8||_queueStatusId==10;
        return (
            <div className="auto-box pr5">
                <ModuleMsg 
                    _ModuleMsgs={moduleMsg} 
                    _queueType="ocr" 
                    _accountId={this.state.conditionParam._acount} 
                    _loanNumber={this.state.conditionParam._loanNumber} 
                    _queueStatusId={_queueStatusId}
                    _getMsg={this.getMsg.bind(this)}
                />
                <div className="bar mt10">
                    <div className="ocr-ctl-tit clearfix">
                        <h3 className="on" onClick={this.ocrCtlLable.bind(this)}>操作</h3>
                        <h3 onClick={this.ocrCtlLable.bind(this)}>历史记录</h3>
                    </div>
                    <table className="radius-tab workFile-tab ocr-ctl-cont" cellPadding={0} cellSpacing={0} frameBorder={0}>
                        <tbody>
                            <tr>
                                <th></th>
                                <th>文件类型</th>
                                <th>授权状态 / 时间</th>
                                <th>合格且录入</th>
                            </tr>
                            <tr className="border-bottom phoneTr" data-id="">
                                <td className="tit-font">电话清单</td>
                                <td>
                                    <select name="" id="" className="left select-gray mr5 mt8 phoneSelectList_mouth" disabled="true" style={{"width":"50%"}} onChange={this.isChanged.bind(this)}>
                                        <option className="defaultOption" defaultValue="selected" hidden></option>
                                        {
                                            (phoneSelectList1 && phoneSelectList1.length>0)?phoneSelectList1.map((repy,i)=>{
                                                let thisText=repy.certificateNameChinese;
                                                return <option key={i} value="" data-id={repy.id} data-certificateName={repy.certificateName}>{repy.certificateNameChinese}</option>
                                            }):<option value=""></option>
                                        }
                                    </select>
                                    <select name="" id="" className="left select-gray mt8 phoneSelectList_limit" disabled="true" style={{"width":"43%"}} onChange={this.isChanged.bind(this)}>
                                        <option className="defaultOption" defaultValue="selected" hidden></option>
                                        {
                                            (phoneSelectList2 && phoneSelectList2.length>0)?phoneSelectList2.map((repy,i)=>{
                                                let thisText=repy.certificateNameChinese;
                                                return <option key={i} value="" data-id={repy.id} data-certificateName={repy.certificateName}>{repy.certificateNameChinese}</option>
                                            }):<option value=""></option>
                                        }
                                    </select>
                                </td>
                                <td className="two-line-text">
                                    <p className="grantAuth">{ocrDates.ocrAuthStatusInfoDTO?commonJs.is_obj_exist(ocrDates.ocrAuthStatusInfoDTO.certificationStatus=="Y"?"是":"-"):"-"}</p>
                                    <p className="authorizationTime">{ocrDates.ocrAuthStatusInfoDTO?commonJs.is_obj_exist(ocrDates.ocrAuthStatusInfoDTO.certificationDate):"-"}</p>
                                </td>
                                <td className="isEnterFromPhone">
                                    <i className="left myCheckbox myCheckbox-normal mr10 mt10"></i>
                                    <div className="two-line-text left emp-div">
                                        -<br/>-
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-bottom bankTr" data-id="">
                                <td className="tit-font">银行流水</td>
                                <td>
                                    <select name="" id="" className="left select-gray mr5 mt8 bankSelectList" disabled="true" style={{"width":"95%"}} onChange={this.isChanged.bind(this)}>
                                        <option className="defaultOption" defaultValue="selected" hidden></option>
                                    {
                                        (bankSelectList && bankSelectList.length>0)?bankSelectList.map((repy,i)=>{
                                            return <option key={i} value="" data-id={repy.id} data-certificateName={repy.certificateName}>{repy.certificateNameChinese}</option>
                                        }):<option value=""></option>
                                    }
                                    </select>
                                </td>
                                <td className="two-line-text">
                                    <p className="grantAuth">{ocrDates.ocrAuthStatusInfoDTO?commonJs.is_obj_exist(ocrDates.ocrAuthStatusInfoDTO.bankFlowingWaterStatus=="Y"?"是":"-"):"-"}</p>
                                    <p className="authorizationTime">{ocrDates.ocrAuthStatusInfoDTO?commonJs.is_obj_exist(ocrDates.ocrAuthStatusInfoDTO.bankFlowingWaterDate):"-"}</p>
                                </td>
                                <td className="isEnterFromBank">
                                    <i className="left myCheckbox myCheckbox-normal mr10 mt10" ></i>
                                    <div className="two-line-text left emp-div">
                                        -<br/>-
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-bottom workTr" data-id="">
                                <td className="tit-font">工作证明</td>
                                <td>
                                    <select name="" id="" className="left select-gray mr5 mt8 workSelectList" disabled="true" style={{"width":"95%"}} onChange={this.isChanged.bind(this)}>
                                        <option className="defaultOption" defaultValue="selected" hidden></option>
                                        {
                                            (workSelectList && workSelectList.length>0)?workSelectList.map((repy,i)=>{
                                                return <option key={i} value="" data-id={repy.id} data-certificateName={repy.certificateName}>{repy.certificateNameChinese}</option>
                                            }):<option value=""></option>
                                        }
                                    </select>
                                </td>
                                <td className="two-line-text">
                                    <p className="grantAuth">{ocrDates.ocrAuthStatusInfoDTO?commonJs.is_obj_exist(ocrDates.ocrAuthStatusInfoDTO.socialSecurityStatus=="Y"?"是":"-"):"-"}</p>
                                    <p className="authorizationTime">{ocrDates.ocrAuthStatusInfoDTO?commonJs.is_obj_exist(ocrDates.ocrAuthStatusInfoDTO.socialSecurityDate):"-"}</p>
                                </td>
                                <td className="isEnterFromJob">
                                    <i className="left myCheckbox myCheckbox-normal mr10 mt10" ></i>
                                    <div className="two-line-text left emp-div">
                                    -<br/>-
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-bottom communicationTr" data-id="">
                                <td className="tit-font">通讯录授权</td>
                                <td> </td>
                                <td className="two-line-text">
                                    <p className="grantAuth">{ocrDates.ocrAuthStatusInfoDTO?commonJs.is_obj_exist(ocrDates.ocrAuthStatusInfoDTO.mailListGrantAuth=="Y"?"是":"-"):"-"}</p>
                                    <p className="authorizationTime">{ocrDates.ocrAuthStatusInfoDTO?commonJs.is_obj_exist(ocrDates.ocrAuthStatusInfoDTO.mailListGrantAuthDate):"-"}</p>
                                </td>
                                <td className="isEnterFrommailListGrant">
                                    <i className="left myCheckbox myCheckbox-normal mr10 mt10"></i>
                                    <div className="two-line-text left emp-div">
                                        - <br/>-
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-bottom compyTr" data-id="">
                                <td className="two-line-text tit-font">公司注册/ <br/>营业执照</td>
                                <td>
                                    <select name="" id="" className="left select-gray mr5 mt8 compneySelectList" disabled="true" style={{"width":"95%"}} onChange={this.isChanged.bind(this)}>
                                        <option className="defaultOption" defaultValue="selected" hidden></option>
                                        {
                                            (compneySelectList && compneySelectList.length>0)?compneySelectList.map((repy,i)=>{
                                                return <option key={i} value="" data-id={repy.id} data-certificateName={repy.certificateName}>{repy.certificateNameChinese}</option>
                                            }):<option value=""></option>
                                        }
                                    </select>
                                </td>
                                <td className="green-font">
                                </td>
                                <td className="isEnterFromCompanyResgit">
                                    <i className="left myCheckbox myCheckbox-normal mr10 mt10" ></i>
                                    <div className="two-line-text left emp-div">
                                        - <br/>-
                                    </div>
                                </td>
                            </tr>
                            <tr className={isHideOper?"border-bottom OCR-edit-div  bind_hidden hidden":"border-bottom OCR-edit-div"}>
                                <td colSpan="4">
                                    <button className="btn-white block ml20 left" onClick={this.showSendMsg.bind(this)}><i className="send-msg-icon"></i>发送短信</button>
                                    <button className="left block mr20 edit btn-blue right" onClick={this.saveOcrCertificates.bind(this)}>修改</button>
                                    <button className="btn-white left block mr20 cancle_edit right hidden" onClick={this.cancel_edit.bind(this)}>取消</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="ocr-ctl-cont hidden">
                        <div className="border-bottom-2 ml20">
                            <table className="table radius-tab ocr-ctrl-tab-tit no-margin">
                                <tbody>
                                    <tr>
                                        <th width="25%"></th>
                                        <th width="25%">文件类型</th>
                                        <th width="25%">授权状态 / 时间</th>
                                        <th width="25%"></th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {
                            (ocrQueueCertificateRecordsInfoDTO && ocrQueueCertificateRecordsInfoDTO.length>0)?ocrQueueCertificateRecordsInfoDTO.map((repy,a)=>{
                                return <div key={a} className="border-bottom-2 pb2 ml20">
                                    {
                                        (repy && repy.length>0)?repy.map((rsp,i)=>{
                                            return <table key={i} className="radius-tab ocr-ctrl-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                        <tbody>
                                                            <tr>
                                                                <td>{commonJs.is_obj_exist(rsp.certificateType)}</td>
                                                                <td>{commonJs.is_obj_exist(rsp.certificateNameChinese)}</td>
                                                                <td>{commonJs.is_obj_exist(rsp.grantAuth)?"是":"-"} <br/> {commonJs.is_obj_exist(rsp.authorizationTime)}</td>
                                                                <td>{commonJs.is_obj_exist(rsp.updatedBy)} <br/> {commonJs.is_obj_exist(rsp.updatedAt)}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                        }):""
                                    }
                                </div>
                            }):<div className="border-bottom-2 pl20 pt10 pb10 pb2 gray-tip-font">暂未查到相关数据...</div>
                        }
                        
                    </div>
                </div>

                <table className={isHideOper?"radius-tab mt10 OCR-edit-div QrecordInfo bind_hidden hidden":"radius-tab mt10 OCR-edit-div QrecordInfo"} cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                        <tr>
                            <th width="20%">沟通方式</th>
                            <th width="10%">状态</th>
                            <th width="40%">处理状态</th>
                            <th className="hidden contactResultReasonsInfo">处理原因</th>
                        </tr>
                        <tr>
                            <td className="contactMethods">
                                {
                                    communications ? <Communication_select _communications={ocrDates.contactMethodsInfoDTO} type="communications_select" /> : <select name="" id="" className="select-gray"><option value="">请选择</option></select>
                                }
                            </td>
                            <td className="queueStatu" data-queueStatusId={_queueStatusId ? _queueStatusId : ""} data-queueStatus={_queueStatus ? _queueStatus : ""}>{_queueStatus}</td>
                            <td className="contactResultsInfo">
                                {
                                    contactResults ? <Communication_select  _turnStatus={this.turnStatus.bind(this)} _contactResults={ocrDates.contactResultsInfoDTO} type="contactResults_select" /> : <select name="" id="" className="select-gray"><option value="">请选择</option></select>
                                }
                            </td>
                            <td className="hidden contactResultReasonsInfo">
                                {
                                    dealReasons ? <Communication_select _dealReasons={dealReasons} type="dealReason_select" /> : <select name="" id="" className="select-gray"><option value="">请选择</option></select>
                                }
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                <span className="detail-t">详情</span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                <textarea name="" id="" cols="30" rows="10" className="commu-area textarea ocrQdetail"></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                <button className="left block ml20 btn-blue" onClick={this.saveOcrQueue.bind(this)}>保存</button>
                                <button className="btn-white left block ml20" onClick={commonJs.cancelSaveQ.bind(this)}>取消</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table className="pt-table mt10 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                        <tr>
                            <th width="20%">沟通方式</th>
                            <th width="15%">状态</th>
                            <th width="20%">处理状态</th>
                            <th width="20%">处理原因</th>
                            <th></th>
                        </tr>
                        {
                            _ocrQueueRecordsInfoDTO?_ocrQueueRecordsInfoDTO.map((repy,i)=>{
                                    return <tr key={i}>
                                                <td colSpan="5" className="no-padding-left">
                                                    <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                        <tbody>
                                                        <tr>
                                                            <td width="20%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                            <td width="15%" title={commonJs.is_obj_exist(repy.beforeQueueStatus)}>{commonJs.is_obj_exist(repy.beforeQueueStatus)}</td>
                                                            <td width="20%" title={commonJs.is_obj_exist(repy.afterQueueStatus)}>{commonJs.is_obj_exist(repy.afterQueueStatus)}</td>
                                                            <td width="20%" title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                                            <td>
                                                                <div className="ext-source-tip word-break" title={commonJs.is_obj_exist(repy.createdBy )+commonJs.is_obj_exist(repy.createdAt)}>
                                                                    {commonJs.is_obj_exist(repy.createdBy )}<br/>{commonJs.is_obj_exist(repy.createdAt)}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="5" className="short-border-td">
                                                                <div className="short-border"></div>
                                                                <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                             }): <tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                    </tbody>
                </table>
                {/*发送短信弹窗*/}
                <SendMessage _userPhoneNo={this.props._userPhoneNo} sendToUrl="/common/sendSMS" msgMode={this.state.msgTypeList} />
            </div>
        )
    }
}
;

export default CpyOCR;