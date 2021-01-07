// 服务费 index
import React,{PureComponent} from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import $ from 'jquery';
import { Pagination,DatePicker,Select } from 'antd';  //页码
const Option = Select.Option;
// import ReactSelectize from "react-selectize";
// var SimpleSelect = ReactSelectize.SimpleSelect;
// var MultiSelect = ReactSelectize.MultiSelect;

// 左侧页面
import UserMsg from '../module/UserMsg';
import Case from '../search/Case';   //=>案例
import Pact from '../search/Pact';   //=>合同列表
import File from '../search/File';  //=>附件
import OCR from '../search/OCR';   //=>OCR
import PhoneMsg from '../search/PhoneMsg';   //=>PhoneMsg
import OperatorReport from '../search/OperatorReport';   //=>运营商报告
import OperatorReportNew from '../search/OperatorReportNew';   //=>运营商报告
import MessageList from '../search/messageList';   //=>通讯录
import CallRecord from '../search/callRecord';   //=>拨打记录
import SecurityRcord from '../search/SecurityRcord';   //=>社保记录  
import BankList from '../search/bankList';   //=>银行流水  
// 右侧页面
import CpySearch from '../companySearch/CpySearch';
import CpyOCR from '../companySearch/CpyOCR';
import CpyApprove from '../companySearch/CpyApprove';
import CpyFraud from '../companySearch/CpyFraud';
import Reminder from '../Reminder/Reminder';
import Collection from '../Collection/Collection';
import EarlierCost from './earlierCost';  //服务费

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import AccountBar from '../module/AccountBar'  // 横向的信息栏
 
import SortTimeJs from '../../source/common/sortTime';
var sortTimeJs=new SortTimeJs;  //排序时间

class CollectionIndex extends React.Component{
    constructor(props){
        super(props);
        this.state={
            _oper_type:"search",//操作类型，search=搜索按钮、next=下一条、bar导航
            _params:"",  //账号
            _userMsg_reload:"",//操作类型：noload表示不重新加载数据
            isBarUpdata:"noload",  //操作类型：noload表示AccountBar不重新加载数据
            haveFinishLoan:"NO",//是否有已完成的合同YES、NO
            getQueue:[], //顶部获取到的合同号 array
            topBindNumber:"",  //顶部绑定条数
            top_phoneNo:"",  //用户输入的电话号码
            top_acount:"",  //用户输入账号
            top_loanNumber:"",  //用户选择的合同号--右侧页面切换用
            case_ocr_loanNumber:"",//用户选择的合同号--左侧页面案例||ocr切换用
            outSearchCont:[],  //外部查询信息
            RecordsInfo:[],  //公司搜索queue记录
            cpy_Q_ajax:"", //公司搜索数据
            ocr_Q_ajax:"",  //ocr搜索数据
            approve_Q_ajax:"",  //approve搜索数据
            fraud_Q_ajax:"",  //fraud搜索数据
            params_rigPage:this.props.params.rigPage,  //右侧页面对应的路由值
            lef_page:<UserMsg />,  //左边页面组件
            rig_page:'',  //右边页面组件
            workInfo_company:"",  //工作单位--给子组件用
            userPhoneNo:"",  //个人信息手机号码--给ocr件用
            nationalId:"", //身份证--给子组件用
            companyPhone:"",//单位电话-VOE工作信息核实-预留模块使用
            _location:"",//当前打开queue对应唯一标识
            registrationId:"",
            clickNextNumber:0,
            oldConditions:{},  //重复的搜索条件，用于保存record后更新搜索列表
            a:"",
            b:"",
            barsNum:10,  //每页显示多少条
            currentPage:1,  //当前页码
            updatedAtTimeS: null,
            updatedAtTimeE: null,
            updatedAtTimeeO: false,

            startValue: null,
            endValue: null,
            endOpen: false,

            scheduledTimeS: null,
            scheduledTimeE: null,
            scheduledTimeO: false,

            settleTimeS: null,
            settleTimeE: null,
            settleTimeO: false
        }
    }

    callbackFunc(bankName,bankCardNumber,_registrationId,_loanNumber,_nationalId,_company,_companyPhone,_userPhoneNo,_cardNo,_customerId,_userName,_sex,_allPhoneNo,_sourceQuotient,_haveFinishLoan){
        this.setState({
            registrationId:_registrationId,
            loanNumber:_loanNumber,
            haveFinishLoan:_haveFinishLoan,
            nationalId:_nationalId,
            workInfo_company:_company,
            companyPhone:_companyPhone,
            userPhoneNo:_userPhoneNo,
            bankCardNo:_cardNo,
            customerId:_customerId,
            userName:_userName,
            allPhoneNo:_allPhoneNo,
            sex:_sex,
            sourceQuotient:_sourceQuotient,
            isBarUpdata:"reload"
        },()=>{
            var rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
            this.changeRight(parseInt(rig_current_page));
        })
        this.setState({isBarUpdata:"noload"})
    }
    //电话详情回调函数
    phoneCallBackFunc(name,telNo){
        this.setState({
            phone_name:name,
            phone_telNo:telNo,
            _oper_type:"getPhoneList"
        },()=>{
            var rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
            this.changeRight(parseInt(rig_current_page));
        })
    }

    UNSAFE_componentWillMount(){
        let _location=this.state.params_rigPage;
        if(_location=='earlierCost'){
            this.setState({
                right_tab9:'前期费',
                feeType:'upfrontfee'
            })
        }else{
            this.setState({
                right_tab9:'服务费',
                feeType:'insure'
            })
        }
        // this.guideLinkToRigPage(_location);
        this.getAdminMaps();
    }
    componentDidMount(){
        var _that=this;
        commonJs.reloadRules();
        let _location=this.state.params_rigPage;
        this.guideLinkToRigPage(_location);
        
        var h = document.documentElement.clientHeight;
        if(this.props._params_rigPage!="EarlierCost"){
            $("#content").height(h-40);
        }
        $(".cdt-list").on('click','.myCheckbox',function(event){
            let self=$(event.target);
            self.parent().siblings().find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            let _state=self.hasClass("myCheckbox-normal");
            if(_state){
                self.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            }else {
                self.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            }
            event.stopPropagation();
        })
        //修改state
        $(".cdt-list").on('click','tr',function(){
            $(".cdt-list tr").removeClass("tr-on");
            $(this).addClass("tr-on");
            let _r_accountId=$(this).find(".r_accountId").text();
            let _r_loanNumber=$(this).find(".r_loanNumber").text();
            let rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
            let _r_name=$(this).find(".r_name").text();
            let _r_telPhone=$(this).find(".r_telPhone").text();
            let _r_ownerName=$(this).find(".r_ownerName").text();
            _that.setState({
                _params:_r_accountId,
                top_loanNumber:_r_loanNumber,
                _name:_r_name,
                _telPhone:_r_telPhone,
                _ownerId:_r_ownerName,
                _userMsg_reload:"reload",
                _oper_type:"search",
                isBarUpdata:"reload"
            },()=>{
                _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                // _that.changeRight(parseInt(rig_current_page));
                _that.setState({isBarUpdata:"noload"})
            })
        })
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            upfrontFeeInfoDTOList: [],
            coltn_Q_ajax:{},
            currentPage:1,  //当前页码
            _params:"",
        })
        commonJs.resetCondition(this);
        let rigParams=nextProps.params.rigPage;
        let action=nextProps.location.action;
        if(action=="PUSH"){
            this.guideLinkToRigPage(rigParams);
        }
        if(rigParams=='earlierCost'){
            this.setState({
                right_tab9:'前期费',
                feeType:'upfrontfee'
            })
        }else{
            this.setState({
                right_tab9:'服务费',
                feeType:'insure'
            })
        }
    }
    //条件框的委外勾选
    cdtHutcouse(event){
        let $this=$(event.target);
        if($this.hasClass("myCheckbox-normal")){
            $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            $this.closest(".cdt-outcouse").find(".outcouseCpy").removeClass("hidden");
        }else{
            $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            $this.closest(".cdt-outcouse").find(".outcouseCpy").addClass("hidden");
        }
    }

    // 详情--select框切换合同号
    changeLoanNo(event){
        let $this=$(event.target);
        var n=$(".Csearch-left-page .on").attr("data-id");
        var theText=$this.find("option:selected").text();
        this.setState({
            case_ocr_loanNumber:theText
        },()=>{
            this.changeLeft(n,null);
        })
    }

    //设置顶部绑定数据 state
    topBindNumber_fn(_val){
        this.setState({
            collectionHandleCount:_val.collectionHandleCount,  //处理情况统计
            sourceChannelList:_val.sourceChannelList,  //来源渠道--条件
            queueStatus:_val.queueStatus,  //任务状态--条件 
            processStatusList:_val.processStatusList,  //子状态--条件
        })
    }
    //导航切换页面
    guideLinkToRigPage(rigComponent){
        $(".top .phoneNo,.top .acount").val("");
        this.setState({
            _params:"",
            top_phoneNo:"",
            top_acount:"",
            top_loanNumber:"",
            getQueue:[],
            _oper_type:"bar",
            _userMsg_reload:"reload",
            cpy_Q_ajax:"", //公司搜索数据
            ocr_Q_ajax:"",  //ocr搜索数据
            approve_Q_ajax:"",  //approve搜索数据
            fraud_Q_ajax:"",  //fraud搜索数据
            lef_page:<UserMsg callbackFunc={this.callbackFunc.bind(this)} />,  //左边页面组件
            rig_page:'',  //右边页面组件
            _location:rigComponent,
            case_ocr_loanNumber:"",
            isBarUpdata:"reload"
        },()=>{
            switch (rigComponent){
                case "CpySearch":
                    this.changeRight(0);
                    break;
                case "OCR":
                    this.changeRight(3);
                    break;
                case "Approve":
                    this.changeRight(5);
                    break;
                case "Fraud":
                    this.changeRight(6);
                    break;
                case "earlierCost":
                    this.changeRight(9);
                    break;
                case "charge":
                    this.changeRight(9);
                    break;
            }
        })
    }
    /**
     *
     * 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    changeLeft(index,right_index){
        var leftHtml = this.getLeftHtml(parseInt(index));
        this.setState({
            lef_page:leftHtml
        },()=>{
            $(".Csearch-left-page li").removeClass("on");
            $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
        })
    }

    /**
     * 获取左侧组件内容
     * @param index
     * @returns {string}
     */
    getLeftHtml(index){
        let thisAcountId=this.state._params;
        var left_page="";
        switch (index){
            case 0:
                left_page=<UserMsg 
                            _params={this.state._params} 
                            _oper_type_props={this.state._userMsg_reload}
                            callbackFunc={this.callbackFunc.bind(this)}
                            _location={this.state._location}
                            />;
                break;
            case 1:
                left_page=<Case prev_registrationId={this.state.registrationId} prev_params={this.state._params} prev_loanNumber={this.state.case_ocr_loanNumber} _oper_case_type="reload" _location={this.state._location}/>;
                break;
            case 2:
                left_page=<Pact _params={this.state._params} _location={this.state._location} _nationalId={this.state.nationalId} _customerId={this.state.customerId} />;
                break;
            case 3:
                left_page=<File prev_userPhoneNo={this.state.userPhoneNo} prev_customerId={this.state.customerId} prev_registrationId={this.state.registrationId} prev_loanNumber={this.state.loanNumber} _location={this.state._location} />;
                break;
            case 4:
                left_page=<OCR prev_params={this.state._params}  prev_loanNumber={this.state.case_ocr_loanNumber} _location={this.state._location} />;
                break;
            case 5:
                left_page=<PhoneMsg 
                            prev_params={this.state._params} 
                            _nationalId={this.state.nationalId} 
                            _location={this.state._location} 
                            phoneCallBackFunc={this.phoneCallBackFunc.bind(this)}
                 />;
                break;
            case 6:
                left_page=<MessageList _customerId={this.state.customerId} />;
                break;
            case 7:
                left_page=<CallRecord _params={this.state._params} />;
                break
            case 8:
                    left_page=<OperatorReport _customerId={this.state.customerId} prev_params={this.state._params} _nationalId={this.state.nationalId} _sourceQuotient={this.state.sourceQuotient} />;
                    break;
            case 9:
                left_page=<SecurityRcord prev_params={this.state._params} _nationalId={this.state.nationalId} />;
                break;
            case 10:
                left_page=<BankList prev_params={this.state._params} _nationalId={this.state.nationalId} />;
                break;
            case 11:
                    left_page=<OperatorReportNew _customerId={this.state.customerId} prev_params={this.state._params} _nationalId={this.state.nationalId} _sourceQuotient={this.state.sourceQuotient} />;
                    break;
        }
        return left_page;
    }

    changeRight(index){
        var rigComponent = this.state._location;
        switch (rigComponent){
            case "CpySearch":
                this.changeRightAndHideButton(index,".CPS-edit-div");
                break;
            case "reminder":
                this.changeRightAndHideButton(index,".CPS-edit-div");
                break;
            case "OCR":
                this.changeRightAndHideButton(index,".OCR-edit-div");
                break;
            case "Approve":
                this.changeRightAndHideButton(index,".AP-edit-div");
                break;
            case "Fraud":
                this.changeRightAndHideButton(index,".FR-edit-div");
                break;
            case "reminder":
                this.changeRightAndHideButton(index,"");
                break;
            case "collection":
                this.changeRightAndHideButton(index,"");
                break;
            case "earlierCost":
                this.changeRightAndHideButton(index,"");
                break;
            case "charge":
                this.changeRightAndHideButton(index,"");
                break;
        }
    }

    /**
     * 渲染右侧queue详情
     * @param index
     * @param showButton 需要显示的button对应的class名称，如果不需要设置则赋值null
     */
    changeRightAndHideButton(index,showButton){
        var right_page="";
        switch (index){
            case 0:
                right_page=<CpySearch 
                            _oper_type_props={this.state._oper_type} 
                            _params_rigPage={this.state.params_rigPage} 
                            _acount={this.state._params} 
                            _phoneNo={this.state.top_phoneNo} 
                            _loanNumber={this.state.top_loanNumber}  
                            _cpy_Q_ajax={this.state.cpy_Q_ajax} 
                            _topBindNumber_fn={this.topBindNumber_fn.bind(this)} 
                            _workInfo_company={this.state.workInfo_company}
                            _nationalId={this.state.nationalId}
                            />;
                break;
            case 3:
                right_page=<CpyOCR _oper_type_props={this.state._oper_type}
                                   _params_rigPage={this.state.params_rigPage}
                                   _acount={this.state._params}
                                   _phoneNo={this.state.top_phoneNo}
                                   _loanNumber={this.state.top_loanNumber}
                                   _userPhoneNo={this.state.userPhoneNo}
                                   _ocr_Q_ajax={this.state.ocr_Q_ajax}
                                   _nationalId={this.state.nationalId}
                                   _topBindNumber_fn={this.topBindNumber_fn.bind(this)} />;
                break;
            case 5:
                right_page=<CpyApprove _oper_type_props={this.state._oper_type}
                                       _params_rigPage={this.state.params_rigPage}
                                       _acount={this.state._params}
                                       _phoneNo={this.state.top_phoneNo}
                                       _loanNumber={this.state.top_loanNumber}
                                       _approve_Q_ajax={this.state.approve_Q_ajax}
                                       _nationalId={this.state.nationalId}
                                       _topBindNumber_fn={this.topBindNumber_fn.bind(this)} />;
                break;
            case 6:
                right_page=<CpyFraud _oper_type_props={this.state._oper_type}
                                     _params_rigPage={this.state.params_rigPage}
                                     _acount={this.state._params}
                                     _phoneNo={this.state.top_phoneNo}
                                     _loanNumber={this.state.top_loanNumber}
                                     _fraud_Q_ajax={this.state.fraud_Q_ajax}
                                     _topBindNumber_fn={this.topBindNumber_fn.bind(this)} />;
                break;
            case 7:
                right_page=<Reminder _oper_type_props={this.state._oper_type}
                                     _params_rigPage={this.state.params_rigPage}
                                     _acount={this.state._params}
                                     _remindQueueStatusEnums={this.state.rcd_remindQueueStatusEnums}
                                     _loanNumber={this.state.top_loanNumber}
                                     _primaryPhone={this.state.userPhoneNo}
                                     _name={this.state._name}
                                     _payDate={this.state._payDate}
                                     _installments={this.state._installments}
                                     _amount={this.state._amount}
                                     _Remd_Q_ajax={this.state.Rmd_Q_ajax}
                                     _topBindNumber_fn={this.topBindNumber_fn.bind(this)} 
                                    _bankCardNo={this.state.bankCardNo}
                            />;
                break;
            case 8:
                right_page=<Collection _oper_type_props={this.state._oper_type}
                                     _params_rigPage={this.state.params_rigPage}
                                     _acount={this.state._params}
                                     _loanNumber={this.state.top_loanNumber}
                                     _primaryPhone={this.state.userPhoneNo}
                                     _name={this.state._name}
                                     _telPhone={this.state._telPhone}
                                     _installments={this.state._installments}
                                     _amount={this.state._amount}
                                     _coltn_Q_ajax={this.state.coltn_Q_ajax}
                                     _topBindNumber_fn={this.topBindNumber_fn.bind(this)} 
                                     _communicateName={this.state.phone_name}
                                     _newPhoneNo={this.state.phone_telNo}
                            />;
                break;
            case 9:
                right_page=<EarlierCost _oper_type_props={this.state._oper_type}
                                     _params_rigPage={this.state.params_rigPage}
                                     _acount={this.state._params}
                                     _loanNumber={this.state.top_loanNumber}
                                     _primaryPhone={this.state.userPhoneNo}
                                     _name={this.state._name}
                                     _telPhone={this.state._telPhone}
                                     _installments={this.state._installments}
                                     _amount={this.state._amount}
                                     _ownerId={this.state._ownerId}
                                     _coltn_Q_ajax={this.state.coltn_Q_ajax}
                                     _topBindNumber_fn={this.topBindNumber_fn.bind(this)} 
                                     _clickNextNumber={this.state.clickNextNumber}
                                     _communicateName={this.state.phone_name}
                                     _newPhoneNo={this.state.phone_telNo}
                                     updataList_fn={this.coltnSearch.bind(this)}
                                     allPhoneNo={this.state.allPhoneNo}
                                     customerId={this.state.customerId}
                                     reloadUserMsg={this.reloadUserMsg.bind(this)}
                                     feeType={this.state.feeType}
                            />;
                break;
        }
        
        this.setState({
            rig_page:right_page
        },()=>{
            $(".Csearch-right-page li").removeClass("on");
            $(".Csearch-right-page li[data-id='"+index+"']").addClass("on");

            if(showButton && showButton!=""){
                $(".CPS-edit-div,.VOE-edit-div,.VOR-edit-div,.OCR-edit-div,.LP-edit-div,.AP-edit-div,.FR-edit-div").addClass("hidden");
                $(showButton).removeClass("hidden");
                $(showButton).each(function(){
                    if($(this).hasClass("bind_hidden")){
                        $(showButton).addClass("hidden");
                    }
                })
            }

        })
    }
    //展开收起条件框
    showCondition(e){
        let $this=$(e.target);
        if($this.hasClass("cdtIcon")){
            $this=$this.parent();
        }
        let $parent=$this.closest(".conditionBox");
        let $cdtCont=$parent.find(".cdt-cont");
        let cdtIcon=$this.find(".cdtIcon");
        if(cdtIcon.hasClass("cdt-on")){
            cdtIcon.removeClass("cdt-on").addClass("cdt-off");
            $cdtCont.slideUp("normal");
        }else{
            cdtIcon.removeClass("cdt-off").addClass("cdt-on");
            $cdtCont.slideDown("normal");
        }
    }
    //展开收起搜索结果列表
    showSearchList(e){
        let $this=$(e.target);
        let $parent=$this.closest(".cdt-result").find(".cdt-list");
        if($this.hasClass("cdtIcon")){
            $this=$this.parent();
        }
        let cdtIcon=$this.find(".cdtIcon");
        if(cdtIcon.hasClass("cdt-off")){
            cdtIcon.removeClass("cdt-off").addClass("cdt-on");
            $(".cdt-list").animate({"max-height":"245px"});
        }else{
            cdtIcon.removeClass("cdt-on").addClass("cdt-off");
            $(".cdt-list").animate({"max-height":"42px"});
        }
    }
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            currentPage:1
        },()=>{
            this.setState({
                barsNum:pageSize
            })
        })
    }
    //快速跳转到某一页。
    gotoPageNum(pageNumber) {
        this.setState({
            currentPage:pageNumber
        })
    }
    //改派弹窗
    dispatchPop(event){
        let _array=[];
        let _loanNumberArray=[];
        let $this=$(event.target);
        let theType=$this.attr("data-type");
        let pop="";
        if($this.text()=="改派"){
            pop=$(".dispatch-pop");
        }else{
            pop=$(".outcouce-pop");
        }
        
        if($(".cdt-list").find(".myCheckbox-visited").length<=0){
            alert("请选择操作内容！");
            return;
        }
        $(".cdt-list tr").each(function(){
            if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                let _id=$(this).attr("id");
                let _No=$(this).find(".r_loanNumber").text();
                _array.push(_id);
                _loanNumberArray.push(_No);
            }
        })
        if(pop.hasClass("hidden")){
            pop.removeClass("hidden");
            this.setState({
                dispatchArray:_array,
                r_loanNumberArray:_loanNumberArray
            })
        }else{
            pop.addClass("hidden");
        }
    }
    //关闭弹窗
    closetanc(event){
        let $this=$(event.target);
        $this.closest(".tanc").addClass("hidden");
    }
    // 最近处理时间
    updatedAtTimeDisS(updatedAtTimeS){
        const updatedAtTimeE = this.state.updatedAtTimeE;
        if (!updatedAtTimeS || !updatedAtTimeE) {
            return false;
        }
        return updatedAtTimeS.valueOf() > updatedAtTimeE.valueOf()-1;
    }
    updatedAtTimeDisE(updatedAtTimeE){
        const updatedAtTimeS = this.state.updatedAtTimeS;
        if (!updatedAtTimeE || !updatedAtTimeS) {
            return false;
        }
        return updatedAtTimeE.valueOf() <= updatedAtTimeS.valueOf()-1;
    }
    onChange(field, value){
        this.setState({
            [field]: value,
        });
    }
    updatedAtTimeChangeS(value){
        this.onChange('updatedAtTimeS', value);
    }
    updatedAtTimeEchange(value){
        this.onChange('updatedAtTimeE', value);
    }
    updatedAtTimeHSO(open){
        if (!open) {
            this.setState({ updatedAtTimeO: true });
        }
    }
    handleupdatedAtTimeOChange(open){
        this.setState({ updatedAtTimeO: open });
    }
    //
    disabledStartDate(startValue){
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf()-1;
    }

    disabledEndDate(endValue){
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf()-1;
    }

    onStartChange(value){
        this.onChange('startValue', value);
    }

    onEndChange(value){
        this.onChange('endValue', value);
        $(".createdAtTime").attr("endTime",commonJs.dateToString(value));
    }

    handleStartOpenChange(open){
        if (!open) {
            this.setState({ endOpen: true });
        }
    }

    handleEndOpenChange(open){
        this.setState({ endOpen: open });
    }
    //
    scheduledTimeSdis(scheduledTimeS){
        const scheduledTimeE = this.state.scheduledTimeE;
        if (!scheduledTimeS || !scheduledTimeE) {
            return false;
        }
        return scheduledTimeS.valueOf() > scheduledTimeE.valueOf()-1;
    }
    scheduledTimeEdis(scheduledTimeE){
        const scheduledTimeS = this.state.scheduledTimeS;
        if (!scheduledTimeE || !scheduledTimeS) {
            return false;
        }
        return scheduledTimeE.valueOf() <= scheduledTimeS.valueOf()-1;
    }
    scheduledTimeSchange(value){
        this.onChange('scheduledTimeS', value);
    }
    scheduledTimeEchange(value){
        this.onChange('scheduledTimeE', value);
    }
    scheduledTimeSOC(open){
        if (!open) {
            this.setState({ scheduledTimeO: true });
        }
    }
    scheduledTimeEOC(open){
        this.setState({ scheduledTimeO: open });
    }
    //
    settleTimeSdis(settleTimeS){
        const settleTimeE = this.state.settleTimeE;
        if (!settleTimeS || !settleTimeE) {
            return false;
        }
        return settleTimeS.valueOf() > settleTimeE.valueOf()-1;
    }
    settleTimeEdis(settleTimeE){
        const settleTimeS = this.state.settleTimeS;
        if (!settleTimeE || !settleTimeS) {
            return false;
        }
        return settleTimeE.valueOf() <= settleTimeS.valueOf()-1;
    }
    settleTimeSchange(value){
        this.onChange('settleTimeS', value);
    }
    settleTimeEchange(value){
        this.onChange('settleTimeE', value);
    }
    settleTimeSOC(open){
        if (!open) {
            this.setState({ settleTimeO: true });
        }
    }
    settleTimeEOC(open){
        this.setState({ settleTimeO: open });
    }
    
    
    // 获取用户名
    getAdminMaps(){
        let _that=this;
        let _array=[];
        $.ajax({
            type:"get",
            url:"/node/tianrList",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                var keys=[];//定义一个数组用来接受key  
                var values=[];//定义一个数组用来接受value  
                for(var key in _getData.adminNameMaps){  
                    keys.push(key);  
                    _array.push(_getData.adminNameMaps[key]);//取得value   
                }  
                _that.setState({
                    adminNameMaps:_array
                })
            }
        })
    }
    //获取搜索条件
    getConditions(){
        let data={};
        let loanNumber=$(".top .loanNumber").val().replace(/\s/g,"");   //用户合同号
        let primaryPhone=$(".top .phoneNo").val().replace(/\s/g,"");   //手机号
        let userName=$(".top .name").val().replace(/\s/g,"");  //姓名
        let accountId=$(".top .acount").val().replace(/\s/g,"");   //用户账号
        let sourceChannel=$(".conditionBox .sourceQuotient option:selected").attr("name");  //来源渠道
        let paymentstatus=$(".conditionBox .queueStatus option:selected").attr("value");   //任务状态ID
        let processingChildState=$(".conditionBox .processingChildState option:selected").attr("name");   //子状态ID
        let recentOperatorName=this.state.updatedBy_selected?this.state.updatedBy_selected:"";   //最近处理人
        let ownerName=this.state.bindBy_selected?this.state.bindBy_selected:"";   //任务所有者
        let updateStartTime=commonJs.dateToString(this.state.updatedAtTimeS);   //最近处理时间起
        let updateEndTime=commonJs.dateToString(this.state.updatedAtTimeE);   //最近处理时间止
        let createStartTime=commonJs.dateToString(this.state.startValue);   //创建时间起
        let createEndTime=commonJs.dateToString(this.state.endValue);   //创建时间止
        let scheduledStartTime=commonJs.dateToString(this.state.scheduledTimeS);   //需跟进时间起
        let scheduledEndTime=commonJs.dateToString(this.state.scheduledTimeE);   //需跟进时间止

        let totalPrincipalStart=$(".conditionBox .totalPrincipalStart").val();   //逾期金额最小金额
        let totalPrincipalEnd=$(".conditionBox .totalPrincipalEnd").val();   //逾期金额最大金额
        let overdueDaysStart=$(".conditionBox .overdueDaysStart").val();   //逾期天数起始天数
        let overdueDaysEnd=$(".conditionBox .overdueDaysEnd").val();   //逾期天数结束天数
        let isValid=$(".conditionBox .is-valid option:selected").attr("value");  //是否绑定
        
        if(loanNumber) data.loanNumber=loanNumber;
        if(primaryPhone) data.primaryPhone=primaryPhone;
        if(userName) data.userName=userName;
        if(accountId) data.accountId=accountId;
        if(sourceChannel.replace(/\s/g,"")) data.sourceChannel=sourceChannel;
        if(recentOperatorName.replace(/\s/g,"")) data.recentOperatorName=recentOperatorName;
        if(ownerName.replace(/\s/g,"")) data.ownerName=ownerName;
        if(paymentstatus.replace(/\s/g,"")) data.paymentstatus=paymentstatus;
        if(processingChildState.replace(/\s/g,"")) data.processingChildState=processingChildState;
        if(updateStartTime!="1970-1-1 8:0:0") data.updateStartTime=updateStartTime;
        if(updateEndTime!="1970-1-1 8:0:0") data.updateEndTime=updateEndTime;
        if(createStartTime!="1970-1-1 8:0:0") data.createStartTime=createStartTime;
        if(createEndTime!="1970-1-1 8:0:0") data.createEndTime=createEndTime;
        if(scheduledStartTime!="1970-1-1 8:0:0") data.scheduledStartTime=scheduledStartTime;
        if(scheduledEndTime!="1970-1-1 8:0:0") data.scheduledEndTime=scheduledEndTime;
        
        if(totalPrincipalStart.replace(/\s/g,"")) data.totalPrincipalStart=totalPrincipalStart;
        if(totalPrincipalEnd.replace(/\s/g,"")) data.totalPrincipalEnd=totalPrincipalEnd;
        if(overdueDaysStart.replace(/\s/g,"")) data.overdueDaysStart=overdueDaysStart;
        if(overdueDaysEnd.replace(/\s/g,"")) data.overdueDaysEnd=overdueDaysEnd;
        if(isValid) data.isValid=isValid;
        if(this.state.feeType)data.feeType=this.state.feeType;
        return data;
    }
    /**
     * 搜索
     * @param {*} fromBtn 是否是点击搜索按钮
     * @param {*} useOldCondition 是否重复条件搜索，用于record保存后刷新搜索列表数据
     */
    coltnSearch(fromBtn,useOldCondition){
        let _that=this;
        let _data={};
        if(useOldCondition){
            _data=this.state.oldConditions;
        }else{
            _data=this.getConditions();
            this.setState({
                oldConditions:_data
            })
        }
        let rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
        let keys=[];
        for(var key in _data){
            keys.push(key);
        }
        if(keys.length<1){
            alert("至少输入一个搜索条件！");
            return;
        }
        this.setState({
            currentPage:1,  //当前页码
        })
        console.log(_data);
        $.ajax({
            type:"post",
            url:"/RemColt/getUpfrontFeeList?time="+new Date().getTime(),
            async:true,
            dataType: "JSON",
            data:_data,
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                commonJs.ajaxGetCode(res);
                let _getData = res.data;
                if(!_getData.executed){
                    _that.setState({
                        upfrontFeeInfoDTOList: [],
                        coltn_Q_ajax:{},
                        currentPage:1,  //当前页码
                        _params:"",
                        _oper_type:"next",
                    },()=>{
                        _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                        _that.changeRight(parseInt(rig_current_page));
                    });
                    $(".search-next").addClass("hidden");
                    return;
                }
                $(".search-next").removeClass("hidden");
                if(fromBtn){
                    _that.setState({
                        upfrontFeeInfoDTOList:_getData.upfrontFeeInfoDTOList ? _getData.upfrontFeeInfoDTOList: [],
                        coltn_Q_ajax:_getData,
                        clickNextNumber:0,
                        currentPage:1,  //当前页码
                    })
                }else{
                    _that.setState({
                        upfrontFeeInfoDTOList:_getData.upfrontFeeInfoDTOList ? _getData.upfrontFeeInfoDTOList: [],
                        coltn_Q_ajax:_getData,
                        clickNextNumber:0,
                    })
                }
                if(_getData.upfrontFeeInfoDTOList && _getData.upfrontFeeInfoDTOList.length<7){
                    $(".cdt-list").css("padding-right","18px");
                }else{
                    $(".cdt-list").css("padding-right","0");
                }
                $(".paageNo .ant-pagination-item").removeClass("ant-pagination-item-active");
                $(".paageNo .ant-pagination-item-"+_that.state.currentPage+"").addClass("ant-pagination-item-active");
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    // 搜索下一条
    coltnSearchNext(){
        let _that=this;
        let rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
        let _resultList=this.state.upfrontFeeInfoDTOList;  //搜索结果列表数据
        let _clickNextNumber=this.state.clickNextNumber;  //点击次数
        let r_loanNumber=$(".cdt-list tr:eq("+this.state.clickNextNumber+")").find(".r_loanNumber").text();
        $(".cdt-list tr").removeClass("tr-on");
        $(".cdt-list tr:eq("+this.state.clickNextNumber+")").addClass("tr-on");
        if(_clickNextNumber>=_resultList.length){
            alert("无数据！");
            this.setState({
                coltn_Q_ajax:{},
                _params:"",
                _oper_type:"next",
            },()=>{
                _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                _that.changeRight(parseInt(rig_current_page));
            });
            return;
        }
        let _currentLoanNo=_resultList[_clickNextNumber].loanNumber;  //用于搜索下一条的合同号
        $.ajax({
            type:"get",
            url:"/RemColt/getUpfrontFeeDetail",
            async:true,
            dataType: "JSON",
            data:{
                loanNumber:_currentLoanNo,
                feeType:this.state.feeType?this.state.feeType:''
            },
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                commonJs.ajaxGetCode(res);
                let _getData = res.data;
                if(!_getData.executed){
                    _that.setState({
                        coltn_Q_ajax:{},
                        _oper_type:"next",
                        _userMsg_reload:"reload",
                        clickNextNumber:0,
                        currentPage:1,  //当前页码
                    },()=>{
                        _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                        // _that.changeRight(parseInt(rig_current_page));
                    });
                    return;
                }
                if(_getData.status){
                    alert(_getData.statusMessage);
                }

                _that.setState({
                    coltn_Q_ajax:_getData,
                    _oper_type:"next",
                    _params:_getData.upfrontFeeInfoDTO.accountId,
                    top_loanNumber:r_loanNumber,
                    _userMsg_reload:"reload",
                    clickNextNumber:_clickNextNumber+1,
                    currentPage:1,  //当前页码
                },()=>{
                    let upfrontFeeInfoDTO=_getData.upfrontFeeInfoDTO?_getData.upfrontFeeInfoDTO:{}; //修改当前条数的逾期金额/天数
                    let tr_Principal=$(".cdt-list tr").eq(_clickNextNumber).find(".r_Principal");
                    tr_Principal.html(commonJs.is_obj_exist(upfrontFeeInfoDTO.totalPrincipal)+ "/" + commonJs.is_obj_exist(upfrontFeeInfoDTO.totalOverdueDays));
                    _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                    // _that.changeRight(parseInt(rig_current_page));
                })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //改派
    sureDispath(event){
        let _that=this;
        let $this=$(event.target);
        let _text=$this.text();
        let _code=$(".dispathToName").attr("data-selected");
        let _r_loanNumber=this.state.r_loanNumberArray;
        let _couseCompany=$(".outcouce-pop .couseCompany option:selected").attr("value");
        let _data={};
        _data={
            loanNumberList:_r_loanNumber,
            reassignmentOwnerName:_code,
            feeType:this.state.feeType?this.state.feeType:''
        }
        if(!_code){
            alert("请选择改派对象！");
            return;
        }
        $.ajax({
            type:"post",
            url:"/RemColt/reassignmentUpfrontFee",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    $(".dispatch-pop").addClass("hidden");
                    return;
                }
                let _getData = res.data;
                $(".dispatch-pop").addClass("hidden");
                $(".cdt-list .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                alert(_getData.message);
                _that.coltnSearch("RELOAD",false);
            }
        })
    }
    // 详情--select框切换合同号
    changeDetLoanNo(NO){
        var n=$(".Csearch-left-page .on").attr("data-id");
        this.setState({
            case_ocr_loanNumber:NO
        },()=>{
            this.changeLeft(n,null);
            this.setState({
                isBarUpdata:"noload",
                _userMsg_reload:"noload",
            })
        })
    }
    updatedByChange(value) {  //最近处理人事件
        this.setState({
            updatedBy_selected:value
        })
    }
    bindByChange(value) {  //任务所有者
        this.setState({
            bindBy_selected:value
        })
    }
    //更新个人信息板块数据
    reloadUserMsg(){
        let rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
        this.setState({
            _userMsg_reload:"reload",
            _oper_type:"noload"
        },()=>{
            this.changeLeft(parseInt(0),null);
        })
        this.setState({
            _userMsg_reload:"noload",
        })
    }

    render() {
        const { updatedAtTimeS, updatedAtTimeE, updatedAtTimeO } = this.state;
        const { startValue, endValue, endOpen } = this.state;
        const { scheduledTimeS, scheduledTimeE, scheduledTimeO } = this.state;
        const { settleTimeS, settleTimeE, settleTimeO } = this.state;
        let adminNameMaps=this.state.adminNameMaps;
        let collectionHandleCount=this.state.collectionHandleCount ? this.state.collectionHandleCount : {};
        return (
            <div className="content" id="content">
                <div data-isresetdiv="yes" 
                     data-resetstate="updatedAtTimeS,updatedAtTimeE,startValue,endValue,scheduledTimeS,scheduledTimeE,updatedBy_selected,bindBy_selected"
                >
                    <div className="top">
                        <div className="clearfix">
                            <input type="text" name="" placeholder="手机号" className="input left mr15 mt20 phoneNo input_w" id='phoneNo' />
                            <input type="text" name="" placeholder="姓名" className="input left mr15 mt20 name input_w" id='name' />
                            <input type="text" name="" placeholder="账号" className="input left mr15 mt20 acount input_w" id='acount' />
                            <input type="text" name="" placeholder="合同号" className="input left mr15 mt20 loanNumber input_w" id='loanNumber' />
                            <button className="left mr15 mt20 btn-blue getCQ-btn" onClick={this.coltnSearch.bind(this,"fromBtn",false)} id='searchBtn'>搜索</button>
                            <button className="left mr15 mt20 btn-blue search-next hidden" onClick={this.coltnSearchNext.bind(this)} id='searchNext'>查询下一条</button>
                            <button className="left mt20 btn-white" onClick={commonJs.resetCondition.bind(this,this)} id='reset'>重置</button>
                        </div>
                        <div className="clearfix mt10" style={{"height":"22px"}}>
                            <div className="topBundleCounts">
                                <b className="left mr20">所有未绑定<span className="deep-yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(collectionHandleCount.untreatedCount)}</span>条</b>
                                <b className="left mr20">我的绑定<span className="yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(collectionHandleCount.ownorBindCount)}</span>条</b>
                                <b className="left mr20">今日须跟进<span className="light-blue-font mr10 ml10 arail">{commonJs.is_obj_exist(collectionHandleCount.followUpCount)}</span>条</b>
                                <b className="left mr20">今日共完成<span className="blue-font mr10 ml10 arail">{commonJs.is_obj_exist(collectionHandleCount.todayHandleCount)}</span>条</b>
                            </div>
                        </div>
                    </div>

                    {/*条件*/}
                    <div className="conditionBox clearfix">
                        <div className="cdt" onClick={this.showCondition.bind(this)}>
                            <i className="cdtIcon cdt-on"></i>
                        </div>
                        <div className="cdt-cont clearfix pb10">
                            <div className="left select-box"> 
                                <select name="" id="sourceQuotient" className="select-gray sourceQuotient left mt10" style={{"width":"100%"}}>
                                    <option value="" name="" hidden>来源渠道</option>
                                    <option value="" name="">全部</option>
                                    {
                                        (this.state.sourceChannelList && this.state.sourceChannelList.length>0)?this.state.sourceChannelList.map((repy,i)=>{
                                            return <option value="XYD" key={i} name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option value=""></option>
                                    }
                                </select>
                                <select name="" id="queueStatus" className="select-gray left mt5 queueStatus" style={{"width":"100%"}}>
                                    <option value="" name="" hidden>任务状态</option>
                                    <option value="" name="">全部</option>
                                    {
                                        (this.state.queueStatus && this.state.queueStatus.length>0)?
                                        this.state.queueStatus.map((repy,i)=>{
                                            return <option value={commonJs.is_obj_exist(repy.value)} name={commonJs.is_obj_exist(repy.name)} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option value=""></option>
                                    }
                                </select>
                                <select name="" id="processingChildState" className="select-gray left mt5 processingChildState" style={{"width":"100%"}}>
                                    <option value="" name="" hidden>子状态</option>
                                    <option value="" name="">全部</option>
                                    {
                                        (this.state.processStatusList && this.state.processStatusList.length>0)?
                                        this.state.processStatusList.map((repy,i)=>{
                                            return <option value={commonJs.is_obj_exist(repy.value)} name={commonJs.is_obj_exist(repy.name)} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option value=""></option>
                                    }
                                </select>
                            </div>
                            <div className="line left"></div>
                            <dl className="left lable-box mt10 mr10">
                                <dt>最近处理人<span></span></dt>
                                <dd className="relative">
                                    <div className="updatedBy" id='updatedBy'>
                                        <Select
                                            showSearch
                                            style={{ width: "100%" }}
                                            placeholder="请输入"
                                            allowClear
                                            optionFilterProp="children"
                                            onChange={this.updatedByChange.bind(this)}
                                            filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        >
                                            {
                                                (this.state.adminNameMaps && this.state.adminNameMaps.length>0) ? this.state.adminNameMaps.map((repy,i)=>{
                                                    return <Option value = {repy.loginname} name={111} key={i}>{repy.name}</Option>
                                                }):<Option value = "">没有数据</Option>
                                            }
                                        </Select>
                                    </div>
                                </dd>
                                <dt>最近处理时间<span></span></dt>
                                <dd id='updatedAtTime'>
                                    <DatePicker
                                        disabledDate={this.updatedAtTimeDisS.bind(this)}
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={updatedAtTimeS}
                                        placeholder="Start"
                                        onChange={this.updatedAtTimeChangeS.bind(this)}
                                        onOpenChange={this.updatedAtTimeHSO.bind(this)}
                                    />
                                    <span> - </span>
                                    <DatePicker
                                        disabledDate={this.updatedAtTimeDisE.bind(this)}
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={updatedAtTimeE}
                                        placeholder="End"
                                        onChange={this.updatedAtTimeEchange.bind(this)}
                                        open={updatedAtTimeO}
                                        onOpenChange={this.handleupdatedAtTimeOChange.bind(this)}
                                    />
                                </dd>
                                <dt>创建时间<span></span></dt>
                                <dd id='disabledStartDate'>
                                    <DatePicker
                                        disabledDate={this.disabledStartDate.bind(this)}
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={startValue}
                                        placeholder="Start"
                                        onChange={this.onStartChange.bind(this)}
                                        onOpenChange={this.handleStartOpenChange.bind(this)}
                                    />
                                    <span> - </span>
                                    <DatePicker
                                        disabledDate={this.disabledEndDate.bind(this)}
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={endValue}
                                        placeholder="End"
                                        onChange={this.onEndChange.bind(this)}
                                        open={endOpen}
                                        onOpenChange={this.handleEndOpenChange.bind(this)}
                                    />
                                </dd>
                                <dt>需跟进时间<span></span></dt>
                                <dd id='scheduledTime'>
                                    <DatePicker
                                        disabledDate={this.scheduledTimeSdis.bind(this)}
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={scheduledTimeS}
                                        placeholder="Start"
                                        onChange={this.scheduledTimeSchange.bind(this)}
                                        onOpenChange={this.scheduledTimeSOC.bind(this)}
                                    />
                                    <span> - </span>
                                    <DatePicker
                                        disabledDate={this.scheduledTimeEdis.bind(this)}
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={scheduledTimeE}
                                        placeholder="End"
                                        onChange={this.scheduledTimeEchange.bind(this)}
                                        open={scheduledTimeO}
                                        onOpenChange={this.scheduledTimeEOC.bind(this)}
                                    />
                                </dd>
                            </dl>
                            <dl className="left lable-box mt10 mr10">
                                <dt>任务所有者<span></span></dt>
                                <dd className="relative">
                                    <div className="bindBy" id='bindBy'>
                                        <Select
                                            showSearch
                                            style={{ width: "100%" }}
                                            placeholder="请输入"
                                            allowClear
                                            optionFilterProp="children"
                                            onChange={this.bindByChange.bind(this)}
                                            filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        >
                                            {
                                                (this.state.adminNameMaps && this.state.adminNameMaps.length>0) ? this.state.adminNameMaps.map((repy,i)=>{
                                                    return <Option value = {repy.loginname} name={111} key={i}>{repy.name}</Option>
                                                }):<Option value = "">没有数据</Option>
                                            }
                                        </Select>
                                    </div>
                                </dd>
                                <dt>逾期金额<span></span></dt>
                                <dd className="relative">
                                    <input type="text" className="input half totalPrincipalStart" id='totalPrincipalStart' placeholder="请输入" />
                                    <span> - </span>
                                    <input type="text" className="input half totalPrincipalEnd" id='totalPrincipalEnd' placeholder="请输入" />
                                </dd>
                                <dt>逾期天数<span></span></dt>
                                <dd>
                                    <input type="text" className="input half overdueDaysStart" id='overdueDaysStart' placeholder="start" />
                                    <span> - </span>
                                    <input type="text" className="input half overdueDaysEnd" id='overdueDaysEnd' placeholder="end" />
                                </dd>
                                <dt>是否绑定<span></span></dt>
                                <dd className="relative is-valid">
                                    <select name="" id="isValid" className="select-gray" style={{"width":"100%",height:'20px'}}>
                                        <option value="" hidden>请输入</option>
                                        <option value="">全部</option>
                                        <option value="0">是</option>
                                        <option value="1">否</option>
                                    </select>
                                </dd>
                            </dl> 
                        </div>
                    </div>
                    {/*条件 end*/}
                </div>
                
                <div className="cdt-result bar mt20 relative">
                    <div className="cdt-th th-bg">
                        <table className="pt-table th-bg">
                            <tbody>
                                <tr>
                                    <th width="10%">portal号</th>
                                    <th width="5%">客户姓名</th>
                                    <th width="10%">逾期金额</th>
                                    <th width="10%" className="pointer" data-sort="invert" id='totalPrincipalSort' onClick={sortTimeJs.sortNumber.bind(this,this.state.upfrontFeeInfoDTOList,"totalOverdueDays","upfrontFeeInfoDTOList",event,this)}>
                                        <span className="left mr5">逾期天数</span>
                                        <i className="sort-icon sort-normal mt19"></i>
                                    </th>
                                    <th width="10%">末次案例状态</th>
                                    <th width="10%" className="pointer" data-sort="invert" id='promiseRepaymentTimeSort' onClick={sortTimeJs.sortTime.bind(this,this.state.upfrontFeeInfoDTOList,"promiseRepaymentTime","upfrontFeeInfoDTOList",event,this)}>
                                        <span className="left mr5">承诺还款时间</span>
                                        <i className="sort-icon sort-normal mt19"></i>
                                    </th>
                                    <th width="10%" className="pointer" data-sort="invert" id='latestProcessingTimeSor' onClick={sortTimeJs.sortTime.bind(this,this.state.upfrontFeeInfoDTOList,"latestProcessingTime","upfrontFeeInfoDTOList",event,this)}>
                                        <span className="left mr5">最近处理时间</span>
                                        <i className="sort-icon sort-normal mt19"></i>
                                    </th>
                                    <th width="10%">最近处理人</th>
                                    <th width="10%">任务所有者</th>
                                    <th width="5%"><i className="myCheckbox myCheckbox-normal" id='selectAll' onClick={commonJs.selectAll.bind(this,".cdt-result")}></i></th>
                                    <th width="">
                                        <a  className="dispatch left mr5" id='dispath' data-type="dispath" data-btn-rule="COLLECTION:OUT" onClick={this.dispatchPop.bind(this)}>改派</a>
                                    </th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="cdt-list">
                        <table className="pt-table layout-fixed">
                            <tbody>
                            {
                                (this.state.upfrontFeeInfoDTOList && this.state.upfrontFeeInfoDTOList.length>0) ? this.state.upfrontFeeInfoDTOList.map((repy,i)=>{
                                    let barsNums=this.state.barsNum;  //每一页显示条数
                                    let currentPage=this.state.currentPage;  //当前页码
                                    if(i>=barsNums*(currentPage-1) && i<=(barsNums*currentPage-1)){
                                        return <tr key={i} id={commonJs.is_obj_exist(repy.id)} data-type="toDetaul" data-processingState={repy.processingState}>
                                                <td className="r_accountId" width="10%" title={commonJs.is_obj_exist(repy.accountId)}>
                                                    {commonJs.is_obj_exist(repy.accountId)}  {/* portal号 */}
                                                </td>
                                                <td className="r_name" width="5%" title={commonJs.is_obj_exist(repy.userName)}>
                                                    {commonJs.is_obj_exist(repy.userName)}  {/* 客户姓名 */}
                                                </td>
                                                <td className="r_loanNumber hidden" title={commonJs.is_obj_exist(repy.loanNumber)}>
                                                    {commonJs.is_obj_exist(repy.loanNumber)}
                                                </td>
                                                <td className="" width="10%" title={commonJs.is_obj_exist(repy.totalPrincipal)}>
                                                    {commonJs.is_obj_exist(repy.totalPrincipal)}  {/* 逾期金额 */}
                                                </td>
                                                <td className="r_telPhone" width="10%" title={commonJs.is_obj_exist(repy.totalOverdueDays)}>
                                                    {commonJs.is_obj_exist(repy.totalOverdueDays)}  {/* 逾期天数 */}
                                                </td>
                                                <td width="10%" title={commonJs.is_obj_exist(repy.processingChildState)}>
                                                    {commonJs.is_obj_exist(repy.processingChildState)}  {/* 末次案例状态 */}
                                                </td>
                                                <td width="10%" title={commonJs.is_obj_exist(repy.promiseRepaymentTime)}>
                                                    {commonJs.is_obj_exist(repy.promiseRepaymentTime)}  {/* 承诺还款时间 */}
                                                </td>
                                                <td width="10%" title={commonJs.is_obj_exist(repy.latestProcessingTime)}>
                                                    {commonJs.is_obj_exist(repy.latestProcessingTime)}  {/* 最近处理时间 */}
                                                </td>
                                                <td width="10%" title={commonJs.is_obj_exist(repy.recentOperatorName)}>
                                                    {commonJs.is_obj_exist(repy.recentOperatorName)}  {/* 最近处理人 */}
                                                </td>
                                                <td className="r_ownerName" width="10%" title={commonJs.is_obj_exist(repy.ownerName)}>
                                                    {commonJs.is_obj_exist(repy.ownerName)}  {/* 任务所有者 */}
                                                </td>
                                                <td width="5%"><i className="myCheckbox myCheckbox-normal" id={'trCheck'+i}></i></td>
                                                <td width=""></td>
                                            </tr>
                                    }
                                }):<tr><td colSpan="3" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }  
                            </tbody>
                        </table>
                    </div>
                    <div className="cdt-th th-bg clearfix pl20 pt5 pb5 pr20">
                        <div className="paageNo left" id='pageAtion'>
                            <Pagination
                                showQuickJumper
                                showSizeChanger
                                onShowSizeChange={this.onShowSizeChange.bind(this)}
                                defaultPageSize={this.state.barsNum}
                                defaultCurrent={1}
                                total={this.state.upfrontFeeInfoDTOList?this.state.upfrontFeeInfoDTOList.length : 0}
                                onChange={this.gotoPageNum.bind(this)}
                                pageSizeOptions={['10','25','50','100']}
                            />
                        </div>
                        {
                            (this.state.upfrontFeeInfoDTOList && this.state.upfrontFeeInfoDTOList.length>0) ? <a href={"/RemColt/upfrontFeEexport?1=1"+(this.getConditions()?commonJs.toHrefParams(this.getConditions()):"")} id='downRecord' className="downRecord right mt2" data-btn-rule="COLLECTION:TOP"> 导出记录</a> :""
                        }
                        
                    </div>
                    <div className="cdt cdt2" onClick={this.showSearchList.bind(this)} id='toggleList'><i className="cdtIcon cdt-on"></i></div>
                </div>
                {/* 搜索条件下面的信息栏 */}
                <AccountBar
                    accountId={this.state._params}
                    haveFinishLoan={this.state.haveFinishLoan}
                    userName={this.state.userName}
                    sex={this.state.sex}
                    isBarUpdata={this.state.isBarUpdata}
                    loanNumberChange={this.changeDetLoanNo.bind(this)}
                />

                <div className="mt20 clearfix">
                    <div className="left cont-left content-toggle">
                        <div className="bar title-box Csearch-left-page clearfix relative">
                            <i className="auto-box-shade Cs-auto-box-shade"></i>
                            <ul className="left ml10 mt5 nav">
                                <li className="on" data-id="0" onClick={this.changeLeft.bind(this,0,null)} data-btn-rule="RULE:DETAIL:USERINFO:DIV" id='USERINFO'>账户详情</li>
                                <li data-id="1" onClick={this.changeLeft.bind(this,1,null)} data-btn-rule="RULE:DETAIL:CASE:TOP" id='CASE'>案例</li>
                                <li data-id="2" onClick={this.changeLeft.bind(this,2,null)} data-btn-rule="RULE:DETAIL:LOAN:TOP" id='LOAN'>合同列表</li>
                                <li data-id="3" onClick={this.changeLeft.bind(this,3,null)} data-btn-rule="RULE:DETAIL:FILE:TOP" id='FILE'>附件</li>
                                {/* <li data-id="4" onClick={this.changeLeft.bind(this,4,null)} data-btn-rule="RULE:DETAIL:OCR:TOP">OCR</li> */}
                                <li data-id="5" onClick={this.changeLeft.bind(this,5,null)} data-btn-rule="RULE:JXL:OPERATION:DETAIL" id='OPERATION'>电话详情</li>
                                <li data-id="8" onClick={this.changeLeft.bind(this,8,null)} data-btn-rule="RULE:TREE:JXLSEARCH" id='JXLSEARCH'>运营商</li>
                                <li data-id="11" onClick={this.changeLeft.bind(this,11,null)} data-btn-rule="RULE:TREE:JXLSEARCH:NEW" id='JXLSEARCHNEW'>运营商新</li>
                                <li data-id="6" onClick={this.changeLeft.bind(this,6,null)} data-btn-rule="LOAN:RULE:MQUERY:CONTACTSLIST" id='CONTACTSLIST'>通讯录</li>
                                <li data-id="7" onClick={this.changeLeft.bind(this,7,null)} data-btn-rule="RULE:TREE:MANUALCALL" id='MANUALCALL'>拨打记录</li>
                                <li data-id="9" onClick={this.changeLeft.bind(this,9,null)} data-btn-rule="RULE:DETAIL:MANAGER:SOCIAL:INFO" id='SOCIAL'>社保</li>
                                <li data-id="10" onClick={this.changeLeft.bind(this,10,null)} data-btn-rule="RULE:DETAIL:MANAGER:BANK:INFO" id='BANK'>银行</li>
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={commonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        {this.state.lef_page}
                    </div>
                    <div className="right cont-right content-toggle">
                        <div className="bar title-box Csearch-right-page clearfix relative">
                            <i className="auto-box-shade Cs-auto-box-shade"></i>
                            <ul className="left ml10 mt5 nav">
                                <li data-id="0" onClick={this.changeRight.bind(this,0)} data-btn-rule="RULE:TREE:COMPANY" id='COMPANY'>公司搜索</li>
                                {/* <li data-id="3" onClick={this.changeRight.bind(this,3)} data-btn-rule="RULE:TREE:OCR">OCR</li> */}
                                <li data-id="6" onClick={this.changeRight.bind(this,6)} data-btn-rule="RULE:TREE:FRAUD" id='FRAUD'>Fraud</li>
                                <li data-id="5" onClick={this.changeRight.bind(this,5)} data-btn-rule="RULE:TREE:APPROVE" id='APPROVE'>Approve</li>
                                <li data-id="7" onClick={this.changeRight.bind(this,7)} data-btn-rule="RULE:TREE:REMIND" id='REMIND'>Reminder</li>
                                <li data-id="8" onClick={this.changeRight.bind(this,8)} data-btn-rule="RULE:TREE:COLLECTION" id='COLLECTION'>Collection</li>
                                <li data-id="9" onClick={this.changeRight.bind(this,9)} data-btn-rule="RULE:TREE:UPFRONTFEE" id='UPFRONTFEE'>
                                {this.state.right_tab9}
                                </li>
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={commonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        {this.state.rig_page}
                    </div>
                </div>
                {/*改派弹窗*/}
                <div className="dispatch-pop hidden tanc">
                    <div className="tanc_bg"></div>
                    <div className="dispatch-box clearfix">
                        <div className="left search-box clearfix mr10 dispathToName" id='dispathToName'>
                            {/* <SimpleSelect
                                placeholder = "请输入"
                                onValueChange = {function(obj){
                                    if(obj && typeof(obj)!="undefined"){
                                        $(".dispathToName").attr("data-selected",obj.value);
                                    }
                                }}
                            >
                            {
                                (adminNameMaps && adminNameMaps.length>0) ? adminNameMaps.map((repy,i)=>{
                                    return <option value = {repy.code} key={i}>{repy.name}</option>
                                }):<option value = "">没有数据</option>
                            }
                            </SimpleSelect> */}
                        </div>
                        <a id='sureDispath' className="btn-deep-yellow left mr10" onClick={this.sureDispath.bind(this)}>改派</a>
                        <i className="close left mt5 pointer" id='sureDispathClose' onClick={this.closetanc.bind(this)}></i>
                    </div>
                </div>
                {/*委外*/}
                <div className="outcouce-pop hidden tanc">
                    <div className="tanc_bg"></div>
                    <div className="dispatch-box clearfix">
                        <select name="" id="couseCompany" className="select-gray mr10 couseCompany">
                            <option value="" hidden>请选择委外公司</option>
                            {
                                (this.state.topBindNumber.outsourcingCompanyList && this.state.topBindNumber.outsourcingCompanyList.length>0)?this.state.topBindNumber.outsourcingCompanyList.map((repy,i)=>{
                                    return <option key={i} value={repy.value} name={repy.name}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                }):<option value="" ></option>
                            }
                        </select>
                        <a id='sureOute' className="btn-deep-yellow left mr10" onClick={this.sureDispath.bind(this)}>委外</a>
                        <i className="close left mt5 pointer" id='sureOuteClose' onClick={this.closetanc.bind(this)}></i>
                    </div>
                </div>
            </div>
        )
    }
};

export default CollectionIndex;  //ES6语法，导出模块