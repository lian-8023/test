// OCR
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import Address from '../module/address';
import GetAddressByCode from  '../../source/common/getAddressByCode';
var getAddressByCode=new GetAddressByCode; //根据编码获取地址
import moment from 'moment';
import CommonJs from '../../source/common/common'
var commonJs=new CommonJs;
import UserMsgControler from '../../source/common/userMsgControler';
var userMsgControler=new UserMsgControler;
import { DatePicker } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

class OCR extends React.Component {
    constructor(props){
        super(props);
        this.state={
            edit_type_select:"",
            _selected_addr:"",
            showAddress:false,
            defaultAddr_val:"",
            CpyMsg:"",
            workMsg:"",
            bankRunningMsg:"",
            addrMsg:"",
            this_params:this.props.prev_params,
            this_loanNumber:"",
            typeInTime_Time:"",  //录入计时
            _oldDataObj:"",  //修改前的数据对象--用作保存时对比数据，如果数据一致则不请求服务器
            list_tr:[],  //新增tr列表
            theTimer:"", //ocr修改时计时器
            isExeDatePicker:false,//是否初始化时间控件，防止默认值设置失败问题
        }
        this.get_edit_select_val=function(obj,current_obj){
            if(!obj || obj.length<=0){
                return;
            }
            var edit_seletct='<select name="" class="select-gray ml20 edited-select">';
            for (let i=0;i<obj.length;i++){
                if (current_obj && current_obj==obj[i].displayName){  //设置默认值
                    edit_seletct+='<option selected="selected" value="'+obj[i].name+'">'+obj[i].displayName +'</option>';
                }else {
                    edit_seletct+='<option value="'+obj[i].name+'">'+obj[i].displayName +'</option>';
                }
            }
            edit_seletct+= '</select>';
            return edit_seletct;
        }
    }
    UNSAFE_componentWillMount(){
        this.setState({
            this_loanNumber:this.props.prev_loanNumber,
            isExeDatePicker:false
        },()=>{
            this.getMsg();
        });
    }
    componentDidMount () {
        var h = document.documentElement.clientHeight;
        if(this.props._location!="reminder" && this.props._location!="collection" && this.props._location!="outsource"){
            $(".auto-box").css("height", h - 105);
        }
        //隐藏 收起、展开 全部图标
        $(".taggle-cion-up").removeClass("hidden");
        //
        $(".ocrPage_bank .amountTrading-td input").change(function(e){
            $(e.target).val($(e.target).val());
        });
        $(".ocrPage_bank .numTrading-td input").change(function(e){
            $(e.target).val($(e.target).val());
        });
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            this_loanNumber:nextProps.prev_loanNumber,
            isExeDatePicker:false
        },()=>{
            this.getMsg();
        });
    }
    /** 公共请求方法
     * req_url 请求地址
     * stateVal 存到state里面的数据key
     */
    ajaxMsg(req_url,loannumber){
        if(!loannumber||loannumber==""){
            return;
        }
        let ajax_result;
        $.ajax({
            type:"get",
            url:req_url,
            async:false,
            dataType: "JSON",
            data:{
                accountId:this.props.prev_params,
                loanNumber:loannumber,
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                if(_getData.executed){
                    ajax_result=_getData;
                }else {
                    console.log(req_url+" 请求后台数据失败")
                }
            }
        })
        return ajax_result;
    }
    is_exist(obj,msg){
        if(!obj){
            console.log(msg);
        }
    }
    
    getMsg(){
        $(".bank-running-tab .banklisttime-div,.bank-running-tab .typeTrading,.bank-running-tab .input").addClass("hidden");
        $(".bank-running-tab .bankRunning").removeClass("hidden");
        $(".bank-running-tab .del-btn").addClass("hidden");
        $(".bank-running-tab tr").removeClass("hidden");
        $(".bank-running-tab .border-bottom").each(function(){
            if(!$(this).hasClass("bankmsg-tab")){
                $(this).addClass("bankmsg-tab");
            }
        })

        var loannumber = this.state.this_loanNumber;
        var _getCpyMsg=this.ajaxMsg("/node/getCpyMsg",loannumber);
        var _getWorkMsg=this.ajaxMsg("/node/getworkMsg",loannumber);
        var _getBankrunning=this.ajaxMsg("/node/getBankRunningMsg",loannumber);
        var _getAddrMsg=this.ajaxMsg("/node/getAddrMsg",loannumber);

        var getCpyMsg=(_getCpyMsg && _getCpyMsg.companyRegistrationsInfoDTO)?_getCpyMsg.companyRegistrationsInfoDTO:"";
        var getWorkMsg=(_getWorkMsg && _getWorkMsg.employmentProofsInfoDTO)?_getWorkMsg.employmentProofsInfoDTO:"";
        var getBankrunning=(_getBankrunning && _getBankrunning.bankStatementInfoDTO)?_getBankrunning.bankStatementInfoDTO:"";
        var getAddrMsg=(_getAddrMsg && _getAddrMsg.manualAddressProofsInfoDTO)?_getAddrMsg.manualAddressProofsInfoDTO:"";

        this.is_exist(getCpyMsg,"获取公司信息请求失败");
        this.is_exist(getWorkMsg,"获取工作证明信息请求失败");
        this.is_exist(getBankrunning,"获取银行流水信息请求失败");
        this.is_exist(getAddrMsg,"获取地址证明信息请求失败");

        var loannumber = this.state.this_loanNumber;
        $(".detail-top-select,.detail-top-select-bar").removeClass("hidden");

        //点击编辑后select对应数据循环值显示 (数组,默认值)
        var _informationSources_array=[{value:"网络",name:"网络",displayName:"网络"},{value:"营业执照",name:"营业执照",displayName:"营业执照"},{value:"组织机构",name:"组织机构",displayName:"组织机构"}];//信息来源 下拉框数组
        var _types_array=[{value:"SCREENSHOT",name:"SCREENSHOT",displayName:"截图"},{value:"PAPER",name:"PAPER",displayName:"纸质"},{value:"AUTH",name:"AUTH",displayName:"授权"}];
        var edit_type_select_ajax={
            information_sources:this.get_edit_select_val(_informationSources_array,getCpyMsg.informationSources), //信息来源
            employmentDocumentTypeId:this.get_edit_select_val(getWorkMsg.employmentDocumentTypeIds,getWorkMsg.employmentDocumentTypeId), //信息来源
            companyProofType:this.get_edit_select_val(getWorkMsg.duDocumentTypes,(getWorkMsg&&getWorkMsg.companyProofType)?getWorkMsg.companyProofType.displayName:""),  //工作证明类型
            yearsOfService:this.get_edit_select_val(getWorkMsg.workTimeEnums,(getWorkMsg&&getWorkMsg.yearsOfService)?getWorkMsg.yearsOfService.displayName:""),  //工作年限
            supportFileType:this.get_edit_select_val(getWorkMsg.supportFileTypes,getWorkMsg.supportFileType?getWorkMsg.supportFileType.displayName:""),   //工作证明-证明类型
            typeOfProof:this.get_edit_select_val(getAddrMsg.proofTypes,getAddrMsg.typeOfProof?getAddrMsg.typeOfProof.displayName:""),   //地址证明-证明类型
            type:this.get_edit_select_val(_types_array,getBankrunning.type?getBankrunning.type.displayName:" "), //信息来源
            typeOfContract:this.get_edit_select_val(getAddrMsg.contractTypes,getAddrMsg.typeOfContract?getAddrMsg.typeOfContract.displayName:""), //合同类型
            supportingEvidence:this.get_edit_select_val(getAddrMsg.assistProofss,getAddrMsg.supportingEvidence?getAddrMsg.supportingEvidence.displayName:"")  //辅助证明
        }
        this.setState({
            CpyMsg:getCpyMsg,
            workMsg:getWorkMsg,
            bankRunningMsg:getBankrunning,
            addrMsg:getAddrMsg,
            edit_type_select:edit_type_select_ajax,
            isExeDatePicker:true
        },()=>{
            this.reloadOcrActiveX();
        });
        //点击编辑，新增一行
        $(".bankModify").click(function(){
            $(".add-btn").removeClass("hidden");
        })
        //银行流水--删除新增行
        $(".bank-running-tab").on("click",".del-btn",function(){
            $(this).closest("tr").removeClass("bankmsg-tab").addClass("hidden");
        })
        if(!loannumber||loannumber==''){
            $(".ocr_edit").addClass("hidden");
        }else{
            $(".ocr_edit").removeClass("hidden");
        }
    }
    
    addBankTr(){
        var list_tr_array = this.state.list_tr;
        var n=new Date().getTime();
        list_tr_array.push(<tr className="border-bottom bankAddList_tr bankmsg-tab" key={n}>
                        <td className="gmtTrading-td">
                            <DatePicker />
                        </td>
                        <td className="typeTrading-td">
                            <select name="" id="" className="select-gray">
                                <option value="" data-name="SALARY">工资/代发工资</option>
                                <option value="" data-name="SMALL_BALANCE_FOR_MONTH">月最小余额</option>
                                <option value="" data-name="BALANCE_FOR_PAYDAY">发薪日余额</option>
                                <option value="" data-name="PAYMENT_AMOUNT_FOR_MONTH">月总还款金额</option>
                                <option value="" data-name="CASH_ATM_FOR_BANK">现金/ATM存入</option>
                            </select>
                        </td>
                        <td className="amountTrading-td"><input type="text" className="input" /></td>
                        <td className="numTrading-td"><input type="text" className="input" /></td>
                        <td><button className="del-btn">×</button></td>
                    </tr>);
        this.setState({
            list_tr:list_tr_array
        })
    }
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
    registrationDate_fn(date, dateString){
        $(".registrationDate").attr("value",dateString);  //公司注册/营业执照=>营业期限-成立日期
    }
    expirationDate_fn(date, dateString){
        $(".expirationDate").attr("value",dateString);  //公司注册/营业执照=>营业期限-注销日期
    }
    contractValidity_befor_fn(date, dateString){
        $(".contractValidity_befor").attr("value",dateString);  //工作证明=》合同有效期 前
    }
    contractValidity_after_fn(date, dateString){
        $(".contractValidity_after").attr("value",dateString);  //工作证明=》合同有效期 后
    }
    signDate_fn(date, dateString){
        $(".signDate").attr("value",dateString);  //工作证明=》开具（签字）日期
    }
    issuedDate_fn(date, dateString){
        $(".issuedDate").attr("value",dateString);  //地址证明=》开具日期
    }
    dealDate_fn(date, dateString){
        $(".dealDate").attr("value",dateString);  //地址证明=》办理日期
    }
    annualIns_fn(date, dateString){
        $(".annualInspectionTime").attr("value",dateString);  //公司注册=》年检时间
    }

    reloadOcrActiveX(){
        let thisCpyMsg=this.state.CpyMsg;
        let thisWorkMsg=this.state.workMsg;
        let thisBankRunningMsg=this.state.bankRunningMsg;
        let thisAddrMsg=this.state.addrMsg;

        $(".ocrPage_company [data-inp-paramname='companyRegistrationStatusId'] .myCheckbox").removeClass("myCheckbox-readOnly").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        if(thisCpyMsg&&thisCpyMsg.companyRegistrationStatusId&&thisCpyMsg.companyRegistrationStatusId!=''){
            if(thisCpyMsg.companyRegistrationStatusId.value==1){
                $(".ocrPage_company [data-inp-paramname='companyRegistrationStatusId'] [data-name='IN_OPERATION']").addClass("myCheckbox-readOnly");
            }else{
                $(".ocrPage_company [data-inp-paramname='companyRegistrationStatusId'] [data-name='CANCEL']").addClass("myCheckbox-readOnly");
            }
        }
        $(".ocrPage_company [data-inp-paramname='suspicion'] .myCheckbox").removeClass("myCheckbox-readOnly").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        if(thisCpyMsg){
            if(thisCpyMsg.suspicion){
                $(".ocrPage_company [data-inp-paramname='suspicion'] [data-name='true']").addClass("myCheckbox-readOnly");
                $(".ocrPage_company [data-inp-paramname='suspicion'] [data-name='false']").removeClass("myCheckbox-readOnly");
            }else if(typeof(thisCpyMsg.suspicion)=="undefined"){
                $(".ocrPage_company [data-inp-paramname='suspicion'] [data-name='true']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_company [data-inp-paramname='suspicion'] [data-name='false']").removeClass("myCheckbox-readOnly");
            }else if(!thisCpyMsg.suspicion){
                $(".ocrPage_company [data-inp-paramname='suspicion'] [data-name='true']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_company [data-inp-paramname='suspicion'] [data-name='false']").addClass("myCheckbox-readOnly");
            }
        }
        $(".ocrPage_company [data-inp-paramname='clientObligate'] .myCheckbox").removeClass("myCheckbox-readOnly").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        if(thisCpyMsg){
            if(thisCpyMsg.clientObligate=="1"){
                $(".ocrPage_company [data-inp-paramname='clientObligate'] [data-name='true']").addClass("myCheckbox-readOnly");
                $(".ocrPage_company [data-inp-paramname='clientObligate'] [data-name='false']").removeClass("myCheckbox-readOnly");
            }else if(typeof(thisCpyMsg.clientObligate)=="undefined"){
                $(".ocrPage_company [data-inp-paramname='clientObligate'] [data-name='true']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_company [data-inp-paramname='clientObligate'] [data-name='false']").removeClass("myCheckbox-readOnly");
            }else if(thisCpyMsg.clientObligate=="0"){
                $(".ocrPage_company [data-inp-paramname='clientObligate'] [data-name='true']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_company [data-inp-paramname='clientObligate'] [data-name='false']").addClass("myCheckbox-readOnly");
            }
        }
        $(".ocrPage_work [data-inp-paramname='isNormalPayment'] .myCheckbox").removeClass("myCheckbox-readOnly").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        if(thisWorkMsg&&thisWorkMsg.isNormalPayment&&thisWorkMsg.isNormalPayment!=''){
            if(thisWorkMsg.isNormalPayment=="YES"){
                $(".ocrPage_work [data-inp-paramname='isNormalPayment'] [data-name='YES']").addClass("myCheckbox-readOnly");
                $(".ocrPage_work [data-inp-paramname='isNormalPayment'] [data-name='NO']").removeClass("myCheckbox-readOnly");
            }else if(typeof(thisWorkMsg.isNormalPayment)=="undefined"){
                $(".ocrPage_work [data-inp-paramname='isNormalPayment'] [data-name='YES']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_work [data-inp-paramname='isNormalPayment'] [data-name='NO']").removeClass("myCheckbox-readOnly");
            }else if(thisWorkMsg.isNormalPayment=="NO"){
                $(".ocrPage_work [data-inp-paramname='isNormalPayment'] [data-name='YES']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_work [data-inp-paramname='isNormalPayment'] [data-name='NO']").addClass("myCheckbox-readOnly");
            }
        }
        $(".ocrPage_work [data-inp-paramname='suspicion'] .myCheckbox").removeClass("myCheckbox-readOnly").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        if(thisWorkMsg&&thisWorkMsg.suspicion&&thisWorkMsg.suspicion!=''){
            if(thisWorkMsg.suspicion=="YES"){
                $(".ocrPage_work [data-inp-paramname='suspicion'] [data-name='YES']").addClass("myCheckbox-readOnly");
                $(".ocrPage_work [data-inp-paramname='suspicion'] [data-name='NO']").removeClass("myCheckbox-readOnly");
            }else if(typeof(thisWorkMsg.suspicion)=="undefined"){
                $(".ocrPage_work [data-inp-paramname='suspicion'] [data-name='YES']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_work [data-inp-paramname='suspicion'] [data-name='NO']").removeClass("myCheckbox-readOnly");
            }else if(thisWorkMsg.suspicion=="NO"){
                $(".ocrPage_work [data-inp-paramname='suspicion'] [data-name='YES']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_work [data-inp-paramname='suspicion'] [data-name='NO']").addClass("myCheckbox-readOnly");
            }
        }
        $(".ocrPage_bank [data-inp-paramname='isDoubt'] .myCheckbox").removeClass("myCheckbox-readOnly").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        if(thisBankRunningMsg&&thisBankRunningMsg.isDoubt&&thisBankRunningMsg.isDoubt!=''){
            if(thisBankRunningMsg.isDoubt=="YES"){
                $(".ocrPage_bank [data-inp-paramname='isDoubt'] [data-name='YES']").addClass("myCheckbox-readOnly");
                $(".ocrPage_bank [data-inp-paramname='isDoubt'] [data-name='NO']").removeClass("myCheckbox-readOnly");
            }else if(typeof(thisBankRunningMsg.isDoubt)=="undefined"){
                $(".ocrPage_bank [data-inp-paramname='isDoubt'] [data-name='YES']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_bank [data-inp-paramname='isDoubt'] [data-name='NO']").removeClass("myCheckbox-readOnly");
            }else if(thisBankRunningMsg.isDoubt=="NO"){
                $(".ocrPage_bank [data-inp-paramname='isDoubt'] [data-name='YES']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_bank [data-inp-paramname='isDoubt'] [data-name='NO']").addClass("myCheckbox-readOnly");
            }
        }
        $(".ocrPage_bank [data-inp-paramname='multipart'] .myCheckbox").removeClass("myCheckbox-readOnly").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        if(thisBankRunningMsg&&thisBankRunningMsg.multipart&&thisBankRunningMsg.multipart!=''){
            if(thisBankRunningMsg.multipart=="YES"){
                $(".ocrPage_bank [data-inp-paramname='multipart'] [data-name='YES']").addClass("myCheckbox-readOnly");
                $(".ocrPage_bank [data-inp-paramname='multipart'] [data-name='NO']").removeClass("myCheckbox-readOnly");
            }else if(typeof(thisBankRunningMsg.multipart)=="undefined"){
                $(".ocrPage_bank [data-inp-paramname='multipart'] [data-name='YES']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_bank [data-inp-paramname='multipart'] [data-name='NO']").removeClass("myCheckbox-readOnly");
            }else if(thisBankRunningMsg.multipart=="NO"){
                $(".ocrPage_bank [data-inp-paramname='multipart'] [data-name='YES']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_bank [data-inp-paramname='multipart'] [data-name='NO']").addClass("myCheckbox-readOnly");
            }
        }
        $(".ocrPage_address [data-inp-paramname='suspicion'] .myCheckbox").removeClass("myCheckbox-readOnly").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        if(thisAddrMsg){
            if(thisAddrMsg.suspicion){
                $(".ocrPage_address [data-inp-paramname='suspicion'] [data-name='true']").addClass("myCheckbox-readOnly");
                $(".ocrPage_address [data-inp-paramname='suspicion'] [data-name='false']").removeClass("myCheckbox-readOnly");
            }else if(typeof(thisAddrMsg.suspicion)=="undefined"){
                $(".ocrPage_address [data-inp-paramname='suspicion'] [data-name='true']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_address [data-inp-paramname='suspicion'] [data-name='false']").removeClass("myCheckbox-readOnly");
            }else if(!thisAddrMsg.suspicion){
                $(".ocrPage_address [data-inp-paramname='suspicion'] [data-name='true']").removeClass("myCheckbox-readOnly");
                $(".ocrPage_address [data-inp-paramname='suspicion'] [data-name='false']").addClass("myCheckbox-readOnly");
            }
        }
    }

    //工作证明 能编辑信息根据 工作证明类型 选项disabled
    workMsgEdit(){
        let isShowKey_obj={};
        isShowKey_obj["劳动合同"]=[".work-prove-type",".work-limit",".pact-valid-time",".company-umber",".position",".issue-time",".suspect-forge",".prove-type"];
        isShowKey_obj["社保"]=[".work-prove-type",".work-limit",".normal-payment",".issue-time",".suspect-forge",".prove-type"];
        isShowKey_obj["工作收入证明"]=[".work-prove-type",".work-limit",".company-umber",".issue-time",".suspect-forge",".prove-type",".position"];
        isShowKey_obj["公积金证明"]=[".work-prove-type",".work-limit",".normal-payment",".issue-time",".suspect-forge",".prove-type"];
        isShowKey_obj["其他"]=[".work-prove-type",".pact-valid-time",".normal-payment",".work-limit",".issue-time",".suspect-forge",".company-umber",".prove-type",".position"];

        let _that=this;
        let workSlect_dom=$(".work-prove-type").find("select");
        let workProveType_selected=$(".work-prove-type").find(".msg-cont").text();  //select选中的值
        workSlect_dom.find("option").each(function(){
            if($(this).text()==workProveType_selected){
                $(this).attr("selected","selected");
            }
        })
        if(workProveType_selected=="-" || !workProveType_selected){
            _that.showWorkMsg_fn( isShowKey_obj["其他"]);
        }else{
            _that.showWorkMsg_fn( isShowKey_obj[workProveType_selected]);
        }

        workSlect_dom.change(function(){
            workProveType_selected=workSlect_dom.find("option:selected").text();
            _that.showWorkMsg_fn( isShowKey_obj[workProveType_selected]);
        })
    }
    showWorkMsg_fn(_array){
        $(".ocrPage_work li").addClass("hidden");
        $(".work-prove-type").removeClass("hidden");
        for(let i=0;i<_array.length;i++){
            let isShowKey_obj_i=_array[i];
            $(isShowKey_obj_i).removeClass("hidden");
        }
    }
    render() {
        let thisCpyMsg=this.state.CpyMsg;
        let thisWorkMsg=this.state.workMsg;
        let thisBankRunningMsg=this.state.bankRunningMsg;
        let thisAddrMsg=this.state.addrMsg;
        var cpy_province = getAddressByCode.getAddressByCode(thisCpyMsg?thisCpyMsg.province:"");
        var cpy_city = getAddressByCode.getAddressByCode(thisCpyMsg?thisCpyMsg.city:"");
        var cpy_district= getAddressByCode.getAddressByCode(thisCpyMsg?thisCpyMsg.district:"");
        var isExeDatePicker = this.state.isExeDatePicker;
        return (
            <div className="auto-box pr5 ocrPage">
                <div className="toggle-box mt5 ocrPage_company">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit on" data-type="orc" onClick={commonJs.content_toggle.bind(this)}>
                        公司注册/营业执照
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <div className="bar mt5">
                        <ul className="info-ul cpyAboutMsg-ul" data-id={thisCpyMsg.id?thisCpyMsg.id:""}>
                            <li>
                                <p className="msg-tit">企业（字号）名称</p>
                                <strong className="msg-cont" data-paramname="companyName" data-edit-type="input" title={commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.companyName:"")}>
                                    {commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.companyName:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">企业类型</p>
                                <strong className="msg-cont" data-paramname="companyType" data-edit-type="input" title={commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.companyType:"")}>
                                    {commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.companyType:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">法人（经营者）</p>
                                <strong className="msg-cont" data-paramname="companyOwner" data-edit-type="input" title={commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.companyOwner:"")}>
                                    {commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.companyOwner:"")}
                                </strong>
                            </li>
                            <li className="ADDRESS">
                                <p className="msg-tit">公司地址</p>
                                <b className="msg-cont elli" data-paramname="companyAddress" data-edit-type="address" title={commonJs.is_obj_exist(cpy_province)+ " "+commonJs.is_obj_exist(cpy_city)+ " "+commonJs.is_obj_exist(cpy_district)}>
                                    {commonJs.is_obj_exist(cpy_province)+ " "+commonJs.is_obj_exist(cpy_city)+ " "+commonJs.is_obj_exist(cpy_district)}
                                </b>
                                <div className="address-div pl20 hidden relative">
                                    <Address _defaultAddr_val={cpy_province+ " "+cpy_city+ " "+cpy_district} />
                                    <input type="text" defaultValue={cpy_province+ " "+cpy_city+ " "+cpy_district} className="getAddress editInput" data-inp-paramName="companyAddress" data-paramname="companyAddress" hidden="hidden" />
                                    <input type="text" defaultValue={thisCpyMsg?thisCpyMsg.province:""} className="ProvinceId editInput" data-inp-paramName="province" data-paramname="province" hidden="hidden" />
                                    <input type="text" defaultValue={thisCpyMsg?thisCpyMsg.city:""} className="CityId editInput" data-inp-paramName="city" data-paramname="city" hidden="hidden" />
                                    <input type="text" defaultValue={thisCpyMsg?thisCpyMsg.district:""} className="DistrictId editInput" data-inp-paramName="district" data-paramname="district" hidden="hidden" />
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">营业期限</p>
                                <div className="msg-cont business-time" data-edit-type="select-data" title={commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.registrationDate:"")+"-"+commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.expirationDate:"")}>
                                    <strong className="time-cont left" data-paramname="registrationDate">{commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.registrationDate:"")}</strong>
                                    <strong className="time-line left">-</strong>
                                    <strong className="time-cont left" data-paramname="expirationDate">{commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.expirationDate:"")}</strong>
                                </div>
                                <div className="select-data-div pl20 hidden">
                                    <div className="TIME left" style={{"width":"47%"}}>
                                        {isExeDatePicker?(thisCpyMsg.registrationDate?<DatePicker _random={new Date().getTime()} defaultValue={moment(thisCpyMsg.registrationDate, 'YYYY-MM-DD')} onChange={this.registrationDate_fn.bind(this)} />:<DatePicker onChange={this.registrationDate_fn.bind(this)} />):''}
                                        <input type="text" className="registrationDate editInput" data-inp-paramName="registrationDate" data-paramname="registrationDate" defaultValue={thisCpyMsg.registrationDate?thisCpyMsg.registrationDate:""} />
                                    </div>
                                    <strong className="time-line left">-</strong>
                                    <div className="TIME left" style={{"width":"47%"}}>
                                        {isExeDatePicker?(thisCpyMsg.expirationDate?<DatePicker defaultValue={moment(thisCpyMsg.expirationDate, 'YYYY-MM-DD')} onChange={this.expirationDate_fn.bind(this)} />:<DatePicker onChange={this.expirationDate_fn.bind(this)} />):''}
                                        <input type="text" className="expirationDate editInput" data-inp-paramName="expirationDate" data-paramname="expirationDate" defaultValue={thisCpyMsg.expirationDate?thisCpyMsg.expirationDate:""} />                                    
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">街道地址</p>
                                <strong className="msg-cont" data-paramname="street" data-edit-type="input" title={commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.street:"")}>
                                    {commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.street:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">工商注册号</p>
                                <strong className="msg-cont" data-paramname="companyRegistrationId" data-edit-type="input" title={commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.companyRegistrationId:"")}>
                                    {commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.companyRegistrationId:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">注册资本金（万元）</p>
                                <strong className="msg-cont" data-paramname="registeredCapital" data-edit-type="input" title={commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.registeredCapital:"")}>
                                    {commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.registeredCapital:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">信息来源</p>
                                <strong className="msg-cont" data-paramname="information_sources" data-edit-type="select" title={commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.informationSources:"")}>
                                    {commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.informationSources:"")}
                                </strong>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="informationSources" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">年检时间</p>
                                <div className="msg-cont" data-edit-type="select-data">
                                    <strong className="time-cont left" data-paramname="annualInspectionTime" title={commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.annualInspectionTime:"")}>
                                        {commonJs.is_obj_exist(thisCpyMsg?thisCpyMsg.annualInspectionTime:"")}
                                    </strong>
                                </div>
                                <div className="select-data-div pl20 hidden">
                                    <div className="TIME left" style={{"width":"100%"}}>
                                        {isExeDatePicker?(thisCpyMsg.annualInspectionTime?<DatePicker defaultValue={moment(thisCpyMsg.annualInspectionTime, 'YYYY-MM-DD')} onChange={this.annualIns_fn.bind(this)} />:<DatePicker onChange={this.annualIns_fn.bind(this)} />):''}
                                        <input type="text" className="annualInspectionTime editInput hidden" data-inp-paramName="annualInspectionTime" defaultValue={thisCpyMsg?thisCpyMsg.annualInspectionTime:""} />
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">企业状态</p>
                                <strong className="msg-cont" data-paramname="companyRegistrationStatusId" data-edit-type="checbox"></strong>
                                <label className="checbox-div pl20" data-paramname="companyRegistrationStatusId" data-inp-paramName="companyRegistrationStatusId">
                                    <i className={(thisCpyMsg &&thisCpyMsg.companyRegistrationStatusId)?(thisCpyMsg.companyRegistrationStatusId.value==1?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"):"myCheckbox myCheckbox-normal"} data-name="IN_OPERATION"></i>
                                    存续
                                    <i className={(thisCpyMsg && thisCpyMsg.companyRegistrationStatusId)?(thisCpyMsg.companyRegistrationStatusId.value==2?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"):"myCheckbox myCheckbox-normal"} data-name="CANCEL"></i>
                                    注销
                                </label>
                            </li>
                            <li>
                                <p className="msg-tit">疑似造假</p>
                                <strong className="msg-cont" data-paramname="suspicion" data-edit-type="checbox"></strong>
                                <label className="checbox-div pl20" data-paramname="suspicion" data-inp-paramName="suspicion">
                                    <i className={thisCpyMsg.suspicion?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="true"></i>
                                    是
                                    <i className={!thisCpyMsg.suspicion?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="false"></i>
                                    否
                                </label>
                            </li>
                            <li>
                                <p className="msg-tit">客户预留</p>
                                <strong className="msg-cont" data-paramname="clientObligate" data-edit-type="checbox"></strong>
                                <label className="checbox-div pl20" data-paramname="clientObligate" data-inp-paramName="clientObligate">
                                    <i className={thisCpyMsg.clientObligate=="1"?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="true"></i>
                                    是
                                    <i className={thisCpyMsg.clientObligate=="0"?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="false"></i>
                                    否
                                </label>
                            </li>
                        </ul>
                        <div className="clear"></div>
                        <div>
                            <button className="btn-white right mt10 mb10 block mr20 cancle_edit hidden" onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                            <button className="right mt10 mb10 mr20 block edit btn-white ocr_edit"  onClick={userMsgControler.Edit.bind(this,"/node/ocrCompanyUpdate")}>修改</button>
                            <span className="right type-in-timer mr20 blue-font hidden">录入计时：<span className="typeInTime">0</span> s</span>
                        </div>
                        <div className="clear"></div>
                    </div>
                </div>
                <div className="toggle-box mt5 ocrPage_work">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="orc" onClick={commonJs.content_toggle.bind(this)}>
                        工作证明
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <ul className="left info-ul" data-id={thisWorkMsg.id?thisWorkMsg.id:""}>
                            <li className="work-prove-type">
                                <p className="msg-tit">工作证明类型</p>
                                <strong className="msg-cont" data-paramname="companyProofType" data-edit-type="select" title={(thisWorkMsg&&thisWorkMsg.companyProofType)?commonJs.is_obj_exist(thisWorkMsg.companyProofType.displayName):"-"}>
                                    {(thisWorkMsg&&thisWorkMsg.companyProofType)?commonJs.is_obj_exist(thisWorkMsg.companyProofType.displayName):"-"}
                                </strong>
                                <input type="text" data-inp-paramName="companyProofType" className="getSelectedVal hidden editInput" />
                            </li>
                            <li className="pact-valid-time">
                                <p className="msg-tit">合同有效期</p>  
                                <div className="msg-cont" data-edit-type="select-data" title={thisWorkMsg?(thisWorkMsg.contractValidityStart+"-"+thisWorkMsg.contractValidityEnd):""}>
                                    <strong className="time-cont" data-paramname="contractValidity">{thisWorkMsg?commonJs.is_obj_exist(thisWorkMsg.contractValidityStart):"-"}</strong>
                                    <strong className="time-line">-</strong>
                                    <strong className="time-cont" data-paramname="contractValidity">{thisWorkMsg?commonJs.is_obj_exist(thisWorkMsg.contractValidityEnd):"-"}</strong>
                                </div>
                                <div className="select-data-div pl20 hidden">
                                    <div className="TIME left" style={{"width":"47%"}}>
                                        {isExeDatePicker?(thisWorkMsg.contractValidityStart?<DatePicker defaultValue={moment(thisWorkMsg.contractValidityStart, 'YYYY-MM-DD')} onChange={this.contractValidity_befor_fn.bind(this)} />:<DatePicker onChange={this.contractValidity_befor_fn.bind(this)} />):''}
                                        <input type="text" className="contractValidity_befor editInput hidden" data-inp-paramName="contractValidityStart" defaultValue={thisWorkMsg?thisWorkMsg.contractValidityStart:""} />
                                    </div>
                                    <strong className="time-line left">-</strong>
                                    <div className="TIME left" style={{"width":"47%"}}>
                                        {isExeDatePicker?(thisWorkMsg.contractValidityEnd?<DatePicker defaultValue={moment(thisWorkMsg.contractValidityEnd, 'YYYY-MM-DD')} onChange={this.contractValidity_after_fn.bind(this)} />:<DatePicker onChange={this.contractValidity_after_fn.bind(this)} />):''}
                                        <input type="text" className="contractValidity_after editInput hidden" data-inp-paramName="contractValidityEnd" defaultValue={thisWorkMsg?thisWorkMsg.contractValidityEnd:""} />   
                                     </div>
                                </div>
                            </li>
                            <li className="normal-payment">
                                <p className="msg-tit">正常缴纳</p>
                                <strong className="msg-cont" data-edit-type="checbox"></strong>
                                <label className="checbox-div pl20" data-paramname="isNormalPayment" data-inp-paramName="isNormalPayment">
                                    <i className={thisWorkMsg.isNormalPayment=="YES"?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="YES"></i>
                                    是
                                    <i className={thisWorkMsg.isNormalPayment=="NO"?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="NO"></i>
                                    否
                                </label>
                            </li>
                            <li className="work-limit">
                                <p className="msg-tit">工作年限</p>
                                <strong className="msg-cont" data-edit-type="select" data-paramname="yearsOfService" title={(thisWorkMsg && thisWorkMsg.yearsOfService)?commonJs.is_obj_exist(thisWorkMsg.yearsOfService.displayName):""}>
                                    {(thisWorkMsg && thisWorkMsg.yearsOfService)?commonJs.is_obj_exist(thisWorkMsg.yearsOfService.displayName):""}
                                </strong>
                                <input type="text" data-inp-paramName="yearsOfService" className="getSelectedVal hidden editInput" defaultValue={(thisWorkMsg && thisWorkMsg.yearsOfService)?commonJs.is_obj_exist(thisWorkMsg.yearsOfService.displayName):"-"} />
                            </li>
                            <li className="issue-time">
                                <p className="msg-tit">开具（签字）日期</p>
                                <div className="msg-cont" data-edit-type="select-data" title={thisWorkMsg?commonJs.is_obj_exist(thisWorkMsg.issuedDate):"-"}>
                                    <strong className="time-cont left" data-paramname="issuedDate">{thisWorkMsg?commonJs.is_obj_exist(thisWorkMsg.issuedDate):"-"}</strong>
                                </div>
                                <div className="select-data-div pl20 hidden">
                                    <div className="TIME left" style={{"width":"100%"}}>
                                        {isExeDatePicker?(thisWorkMsg.issuedDate?<DatePicker defaultValue={moment(thisWorkMsg.issuedDate, 'YYYY-MM-DD')} onChange={this.signDate_fn.bind(this)} />:<DatePicker onChange={this.signDate_fn.bind(this)} />):''}
                                        <input type="text" className="signDate editInput hidden" data-inp-paramName="issuedDate" defaultValue={thisWorkMsg?thisWorkMsg.issuedDate:""} />
                                    </div>
                                </div>
                            </li>
                            <li className="suspect-forge">
                                <p className="msg-tit">疑似造假</p>
                                <strong className="msg-cont" data-edit-type="checbox"></strong>
                                <label className="checbox-div pl20" data-paramname="suspicion" data-inp-paramName="suspicion">
                                    <i className={thisWorkMsg.suspicion=="YES"?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="YES"></i>
                                    是
                                    <i className={thisWorkMsg.suspicion=="NO"?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="NO"></i>
                                    否
                                </label>
                            </li>
                            <li className="company-umber">
                                <p className="msg-tit">公司号码</p>
                                <strong className="msg-cont" data-edit-type="input" data-paramname="companyPhone" title={thisWorkMsg?commonJs.is_obj_exist(thisWorkMsg.companyPhone):""}>
                                    {thisWorkMsg?commonJs.is_obj_exist(thisWorkMsg.companyPhone):""}
                                </strong>
                            </li>
                            <li className="prove-type">
                                <p className="msg-tit">证明类型</p>
                                <strong className="msg-cont" data-edit-type="select" data-paramname="supportFileType" title={(thisWorkMsg&&thisWorkMsg.supportFileType)?commonJs.is_obj_exist(thisWorkMsg.supportFileType.displayName):"-"}>
                                    {(thisWorkMsg&&thisWorkMsg.supportFileType)?commonJs.is_obj_exist(thisWorkMsg.supportFileType.displayName):"-"}
                                </strong>
                                <input type="text" data-inp-paramName="supportFileType" className="getSelectedVal hidden editInput" defaultValue={(thisWorkMsg&&thisWorkMsg.supportFileType)?thisWorkMsg.supportFileType.displayName:""} />                            
                            </li>
                            <li className="position">
                                <p className="msg-tit">职位</p>
                                <strong className="msg-cont" data-edit-type="input" data-paramname="position" title={commonJs.is_obj_exist(thisWorkMsg?thisWorkMsg.position:"")}>
                                    {commonJs.is_obj_exist(thisWorkMsg?thisWorkMsg.position:"")}
                                </strong>
                            </li>
                        </ul>
                        <div className="clear"></div>
                        <div>
                            <button className="btn-white right mt10 mb10 block mr20 cancle_edit hidden" onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                            <button className="right mt10 mb10 mr20 block edit btn-white ocr_edit"  onClick={userMsgControler.Edit.bind(this,"/node/ocrEmployUpdate")}>修改</button>
                            <span className="right type-in-timer mr20 blue-font hidden">录入计时：<span className="typeInTime"></span> s</span>
                        </div>
                        <div className="clear"></div>
                    </div>
                </div>
                <div className="toggle-box ocrPage_bank">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="orc" onClick={commonJs.content_toggle.bind(this)}>
                        银行流水
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <ul className="left info-ul" data-id={thisBankRunningMsg?thisBankRunningMsg.id:""}>
                            <li>
                                <p className="msg-tit">银行名</p>
                                <strong className="msg-cont" data-paramname="bankName" data-edit-type="input" title={commonJs.is_obj_exist(thisBankRunningMsg?thisBankRunningMsg.bankName:"")}>
                                    {commonJs.is_obj_exist(thisBankRunningMsg?thisBankRunningMsg.bankName:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">月均打卡金额</p>
                                <strong className="msg-cont" data-paramname="monthAmountCard" data-edit-type="input" title={commonJs.is_obj_exist(thisBankRunningMsg?thisBankRunningMsg.monthAmountCard:"")}>
                                    {commonJs.is_obj_exist(thisBankRunningMsg?thisBankRunningMsg.monthAmountCard:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">流水类型</p>
                                <strong className="msg-cont" data-paramname="type" data-edit-type="select" title={(thisBankRunningMsg && thisBankRunningMsg.type)?commonJs.is_obj_exist(thisBankRunningMsg?thisBankRunningMsg.type.displayName:""):"-"}>
                                    {(thisBankRunningMsg && thisBankRunningMsg.type)?commonJs.is_obj_exist(thisBankRunningMsg?thisBankRunningMsg.type.displayName:""):"-"}
                                </strong>
                                <input type="text" data-inp-paramName="type" className="getSelectedVal hidden editInput" defaultValue={thisBankRunningMsg && thisBankRunningMsg.type?thisBankRunningMsg && thisBankRunningMsg.type:""} />
                            </li>
                            <li>
                                <p className="msg-tit">银行账户号码</p>
                                <strong className="msg-cont" data-paramname="bankCardNumber" data-edit-type="input" title={commonJs.is_obj_exist(thisBankRunningMsg?thisBankRunningMsg.bankCardNumber:"")}>
                                    {commonJs.is_obj_exist(thisBankRunningMsg?thisBankRunningMsg.bankCardNumber:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">月均现金金额</p>
                                <strong className="msg-cont" data-paramname="monthAmountCash" data-edit-type="input" title={commonJs.is_obj_exist(thisBankRunningMsg?thisBankRunningMsg.monthAmountCash:"")}>
                                    {commonJs.is_obj_exist(thisBankRunningMsg?thisBankRunningMsg.monthAmountCash:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">疑似造假</p>
                                <strong className="msg-cont" data-paramname="isDoubt" data-edit-type="checbox"></strong>
                                <label className="checbox-div pl20" data-paramname="isDoubt" data-inp-paramName="isDoubt">
                                    <i className={thisBankRunningMsg.isDoubt=="YES"?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="YES"></i>
                                    是
                                    <i className={thisBankRunningMsg.isDoubt=="NO"?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="NO"></i>
                                    否
                                </label>
                            </li>
                            <li>
                                <p className="msg-tit">多头</p>
                                <strong className="msg-cont" data-paramname="multipart" data-edit-type="checbox"></strong>
                                <label className="checbox-div pl20" data-paramname="multipart" data-inp-paramName="multipart">
                                    <i className={thisBankRunningMsg.multipart=="YES"?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="YES"></i>
                                    是
                                    <i className={thisBankRunningMsg.multipart=="NO"?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="NO"></i>
                                    否
                                </label>
                            </li>
                        </ul>
                        <div className="clear"></div>
                        <table className="radius-tab pt-table bank-running-tab" width="100%">
                            <tbody>
                                <tr>
                                    <th>日期</th>
                                    <th>类型</th>
                                    <th>总金额</th>
                                    <th>笔数</th>
                                    <th><button className="add-btn hidden" onClick={this.addBankTr.bind(this)}>+</button></th>
                                </tr>
                                {
                                    (thisBankRunningMsg.tradingDTOs && thisBankRunningMsg.tradingDTOs.length>0)?thisBankRunningMsg.tradingDTOs.map((repy,i)=>{
                                       return <tr className="border-bottom bankmsg-tab" key={i}>
                                                <td data-param="time" className="gmtTrading-td">
                                                    <span className="bankRunning" title={commonJs.is_obj_exist(repy.gmtTrading)}>{commonJs.is_obj_exist(repy.gmtTrading)}</span>
                                                    <div className="banklisttime-div hidden">
                                                        <DatePicker defaultValue={moment(repy.gmtTrading, 'YYYY-MM-DD')} />
                                                    </div>
                                                </td>
                                                <td data-param="select" className="typeTrading-td" data-name={(repy.typeTrading && repy.typeTrading.name)?repy.typeTrading.name:""}>
                                                    <span data-code={(repy.typeTrading ? repy.typeTrading.name:"")} className="bankRunning" title={(repy.typeTrading && repy.typeTrading.displayName)?commonJs.is_obj_exist(repy.typeTrading.displayName):"-"}>
                                                        {(repy.typeTrading && repy.typeTrading.displayName)?commonJs.is_obj_exist(repy.typeTrading.displayName):"-"}
                                                    </span>
                                                </td>
                                                <td data-param="input" className="amountTrading-td">
                                                    <span className="bankRunning" title={commonJs.is_obj_exist(repy.amountTrading)}>{commonJs.is_obj_exist(repy.amountTrading)}</span>
                                                </td>
                                                <td data-param="input" className="numTrading-td">
                                                    <span className="bankRunning" title={commonJs.is_obj_exist(repy.numTrading)}>{commonJs.is_obj_exist(repy.numTrading)}</span>
                                                </td>
                                                <td><button className="del-btn hidden">×</button></td>
                                            </tr>
                                    }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                                {this.state.list_tr}
                            </tbody>
                        </table>
                        <div className="border-top">
                            <button className="btn-white right mt10 mb10 block mr20 cancle_edit hidden" onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                            <button className="right mt10 mb10 mr20 block edit btn-white bankModify ocr_edit"  onClick={userMsgControler.Edit.bind(this,"/node/bankModify")}>修改</button>
                            <span className="right type-in-timer mr20 blue-font hidden">录入计时：<span className="typeInTime"></span> s</span>
                        </div>
                        <div className="clear"></div>
                    </div>
                </div>
                <div className="toggle-box ocrPage_address">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" data-type="ocr" onClick={commonJs.content_toggle.bind(this)}>
                        地址证明
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <ul className="left info-ul" data-id={thisAddrMsg?thisAddrMsg.id:""}>
                            <li>
                                <p className="msg-tit">合同类型</p>
                                <strong className="msg-cont" data-paramname="typeOfContract" data-edit-type="select" title={commonJs.is_obj_exist((thisAddrMsg&&thisAddrMsg.typeOfContract)?thisAddrMsg.typeOfContract.displayName:"")}>
                                    {commonJs.is_obj_exist((thisAddrMsg&&thisAddrMsg.typeOfContract)?thisAddrMsg.typeOfContract.displayName:"")}
                                </strong>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="typeOfContract" hidden="hidden" />
                            </li>
                            <li>
                                <p className="msg-tit">证明类型</p>
                                <strong className="msg-cont" data-paramname="typeOfProof" data-edit-type="select" title={commonJs.is_obj_exist((thisAddrMsg&&thisAddrMsg.typeOfProof)?thisAddrMsg.typeOfProof.displayName:"")}>
                                    {commonJs.is_obj_exist((thisAddrMsg&&thisAddrMsg.typeOfProof)?thisAddrMsg.typeOfProof.displayName:"")}
                                </strong>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="typeOfProof" hidden="hidden" />                                
                            </li>
                            <li>
                                <p className="msg-tit">辅助证明</p>
                                <strong className="msg-cont" data-paramname="supportingEvidence" data-edit-type="select" title={commonJs.is_obj_exist((thisAddrMsg&&thisAddrMsg.supportingEvidence)?thisAddrMsg.supportingEvidence.displayName:"")}>
                                    {commonJs.is_obj_exist((thisAddrMsg&&thisAddrMsg.supportingEvidence)?thisAddrMsg.supportingEvidence.displayName:"")}
                                </strong>
                                <input type="text" className="getSelectedVal editInput" data-inp-paramName="supportingEvidence" hidden="hidden" />                                                           
                            </li>
                            <li>
                                <p className="msg-tit">甲方</p>
                                <strong className="msg-cont" data-paramname="partyA" data-edit-type="input" title={commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.partyA:"")}>
                                    {commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.partyA:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">开具单位</p>
                                <strong className="msg-cont" data-paramname="issuedUnit" data-edit-type="input" title={commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.issuedUnit:"")}>
                                    {commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.issuedUnit:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">办理人/收货人/户主</p>
                                <strong className="msg-cont" data-paramname="receiver" data-edit-type="input" title={commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.receiver:"")}>
                                    {commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.receiver:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">乙方</p>
                                <strong className="msg-cont" data-paramname="partyB" data-edit-type="input" title={commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.partyB:"")}>
                                    {commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.partyB:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">开具日期</p>
                                <div className="msg-cont" data-edit-type="select-data">
                                    <strong className="time-cont left" data-paramname="issuedDate" title={commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.issuedDate:"")}>
                                        {commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.issuedDate:"")}
                                    </strong>
                                </div>
                                <div className="select-data-div pl20 hidden">
                                    <div className="TIME left" style={{"width":"40%"}}>
                                        {isExeDatePicker?(thisAddrMsg.issuedDate?<DatePicker defaultValue={moment(thisAddrMsg.issuedDate, 'YYYY-MM-DD')} onChange={this.issuedDate_fn.bind(this)} />:<DatePicker onChange={this.issuedDate_fn.bind(this)} />):''}
                                        <input type="text" className="issuedDate editInput hidden" data-inp-paramName="issuedDate" data-paramname="registrationDate" defaultValue={thisAddrMsg?thisAddrMsg.issuedDate:""} />
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">办理日期</p>
                                <div className="msg-cont" data-edit-type="select-data">
                                    <strong className="time-cont left" data-paramname="issuedDate" title={commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.dealDate:"")}>
                                        {commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.dealDate:"")}
                                    </strong>
                                </div>
                                <div className="select-data-div pl20 hidden">
                                    <div className="TIME left" style={{"width":"40%"}}>
                                        {isExeDatePicker?(thisAddrMsg.dealDate?<DatePicker defaultValue={moment(thisAddrMsg.dealDate, 'YYYY-MM-DD')} onChange={this.dealDate_fn.bind(this)} />:<DatePicker onChange={this.dealDate_fn.bind(this)} />):''}
                                        <input type="text" className="dealDate editInput hidden" data-inp-paramName="dealDate" data-paramname="dealDate" defaultValue={thisAddrMsg?thisAddrMsg.dealDate:""} />
                                    </div>
                                </div>
                            </li>
                            <li className="ADDRESS">
                                <p className="msg-tit">租房/购房地址</p>
                                <strong className="msg-cont elli" data-paramname="rentAddress" data-edit-type="address" title={commonJs.is_obj_exist(thisAddrMsg.rentAddress)}>
                                    {commonJs.is_obj_exist(thisAddrMsg.rentAddress)}
                                </strong>
                                <div className="address-div pl20 hidden relative">
                                    <Address _defaultAddr_val={thisAddrMsg.rentAddress} />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(thisAddrMsg.rentAddress)} className="getAddress editInput" data-inp-paramName="rentAddress" data-paramname="rentAddress" hidden="hidden" />
                                </div>
                            </li>
                            <li className="ADDRESS">
                                <p className="msg-tit">居住地址</p>
                                <strong className="msg-cont elli" data-paramname="residentialAddress" data-edit-type="address" title={commonJs.is_obj_exist(thisAddrMsg.residentialAddress)}>
                                    {commonJs.is_obj_exist(thisAddrMsg.residentialAddress)}
                                </strong>
                                <div className="address-div pl20 hidden relative">
                                    <Address _defaultAddr_val={thisAddrMsg.residentialAddress} />
                                    <input type="text" defaultValue={commonJs.is_obj_exist(thisAddrMsg.residentialAddress)} className="getAddress editInput" data-inp-paramName="residentialAddress" data-paramname="residentialAddress" hidden="hidden" />
                                </div>
                            </li>                            
                            <li>
                                <p className="msg-tit">疑似造假</p>
                                <strong className="msg-cont" data-paramname="suspicion" data-edit-type="checbox"></strong>
                                <label className="checbox-div pl20" data-paramname="suspicion" data-inp-paramName="suspicion">
                                    <i className={thisAddrMsg.suspicion?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="true"></i>
                                    是
                                    <i className={!thisAddrMsg.suspicion?"myCheckbox myCheckbox-readOnly":"myCheckbox myCheckbox-normal"} data-name="false"></i>
                                    否
                                </label>
                            </li>
                            <li>
                                <p className="msg-tit">街道地址</p>
                                <strong className="msg-cont" data-paramname="rentAddressStreet" data-edit-type="input" title={commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.rentAddressStreet:"")}>
                                    {commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.rentAddressStreet:"")}
                                </strong>
                            </li>
                            <li>
                                <p className="msg-tit">街道地址</p>
                                <strong className="msg-cont" data-paramname="street" data-edit-type="input" title={commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.street:"")}>
                                    {commonJs.is_obj_exist(thisAddrMsg?thisAddrMsg.street:"")}
                                </strong>
                            </li>
                        </ul>
                        <div className="border-top">
                            <button className="btn-white right mt10 mb10 block mr20 cancle_edit hidden" onClick={userMsgControler.cancle_Edit.bind(this)}>取消</button>
                            <button className="right mt10 mb10 mr20 block edit btn-white addrModify ocr_edit"  onClick={userMsgControler.Edit.bind(this,"/node/ocrAddressUpdate")}>修改</button>
                            <span className="right type-in-timer mr20 blue-font hidden">录入计时：<span className="typeInTime"></span> s</span>
                        </div>
                        <div className="clear"></div>
                    </div>
                </div>
            </div>
        )
    }
}
;

export default OCR;