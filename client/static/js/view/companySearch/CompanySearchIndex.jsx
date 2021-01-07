import React,{PureComponent} from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import $ from 'jquery';
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
import CpySearch from './CpySearch';
import CpyOCR from './CpyOCR';
import CpyLP from './CpyLP';
import CpyApprove from './CpyApprove';
import CpyFraud from './CpyFraud';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import AccountBar from '../module/AccountBar'  // 搜索条件下面的信息栏

class CompanySearchIndex extends React.Component{
    constructor(props){
        super(props);
        this.state={
            _oper_type:"search",//操作类型，search=搜索按钮、next=下一条、bar导航
            _params:"",  //账号
            _userMsg_reload:"",//操作类型：noload表示不重新加载数据
            isBarUpdata:"noload",  //操作类型：noload表示AccountBar不重新加载数据
            haveFinishLoan:"NO",//是否有已完成的合同YES、NO
            getQueue:[], //顶部获取到的合同号 array
            topBindNumber:{},  //顶部绑定条数
            top_phoneNo:"",  //用户输入的电话号码
            top_acount:"",  //用户输入账号
            top_loanNumber:"",  //用户选择的合同号--右侧页面切换用
            case_ocr_loanNumber:"",//用户选择的合同号--左侧页面案例||ocr切换用
            outSearchCont:[],  //外部查询信息
            RecordsInfo:[],  //公司搜索queue记录
            cpy_Q_ajax:"", //公司搜索数据
            voe_Q_ajax: "",  //voe搜索数据
            vor_Q_ajax: "",  //vor搜索数据
            ocr_Q_ajax:"",  //ocr搜索数据
            lp_Q_ajax:"",  //lp搜索数据
            approve_Q_ajax:"",  //approve搜索数据
            fraud_Q_ajax:"",  //fraud搜索数据
            params_rigPage:this.props.params.rigPage,  //右侧页面对应的路由值
            lef_page:<UserMsg _oper_type_props="noload" />,  //左边页面组件
            rig_page:<CpySearch />,  //右边页面组件
            workInfo_company:"",  //工作单位--给子组件用
            userPhoneNo:"",  //个人信息手机号码--给ocr件用
            nationalId:"", //身份证--给子组件用
            companyPhone:"",//单位电话-VOE工作信息核实-预留模块使用
            _location:"",//当前打开queue对应唯一标识
            registrationId:"",
            fraudCounts:"",
            a:"",
            b:"",
        }
    }

    callbackFunc(bankName,bankCardNumber,_registrationId,_loanNumber,_nationalId,_company,_companyPhone,_userPhoneNo,_cardNo,_customerId,_userName,_sex,_allPhoneNo,_sourceQuotient,_haveFinishLoan){
        this.setState({
            bankName:bankName,
            bankCardNumber:bankCardNumber,
            registrationId:_registrationId,
            loanNumber:_loanNumber,
            haveFinishLoan:_haveFinishLoan,
            nationalId:_nationalId,
            workInfo_company:_company,
            companyPhone:_companyPhone,
            customerId:_customerId,
            userPhoneNo:_userPhoneNo,
            userName:_userName,
            sex:_sex,
            allPhoneNo:_allPhoneNo,
            sourceQuotient:_sourceQuotient,
            isBarUpdata:"reload"
        },()=>{
            var rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
            this.changeRight(parseInt(rig_current_page));
        })
        this.setState({isBarUpdata:"noload"})
    }

    UNSAFE_componentWillMount(){
        let _location=this.state.params_rigPage;
        this.guideLinkToRigPage(_location);
    }
    componentDidMount(){
        commonJs.reloadRules();
        this.afterDate();

        let _location=this.state.params_rigPage;
        this.guideLinkToRigPage(_location);  //页面刷新还原页面
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        var _action = nextProps.location.action;
        if(_action=="POP"){
            return;
        }
        let rigParams=nextProps.params.rigPage;
        this.guideLinkToRigPage(rigParams);
    }

    //页面数据处理
    afterDate(){
        var _that=this;
        // 根据手机号、accountId查询当前账户的合同号 -- 搜索
        $(".getCQ-btn").click(function () {
            let n=$(".Csearch-left-page .on").attr("data-id");
            var acount=$(".acount").val().replace(/\s/g,"");
            var phoneNo=$(".phoneNo").val().replace(/\s/g,"");
            if(isNaN(phoneNo)) {
                alert("手机号码必须是数字!");
                return;
            }
            if(isNaN(acount)) {
                alert("账号必须是数字!");
                return;
            }
            if(acount=="" && phoneNo==""){
                alert("请输入需要查询的条件!");
                return;
            }
            if(acount.length>0 && acount.length>9){
                alert("您输入的portal号有误，请重新输入！");
                return;
            }
            var server_ajax_url_obj = {
                "7":"/companySearch/getCQLoanNumber",//公司搜索
                "1":"/companySearch/getVOELoanNumber",//voe
                "2":"/companySearch/getVORLoanNumber",//vor
                "3":"/companySearch/getOCRLoanNumber",//ocr
                "4":"/companySearch/getLPLoanNumber",//lp
                "5":"/companySearch/getApproveLoanNumber",//approve
                "6":"/companySearch/getFRAUDLoanNumber",//fraud
            }
            var rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
            var getLoanNumber_url=server_ajax_url_obj[rig_current_page];
            $.ajax({
                type:"get",
                url:getLoanNumber_url,
                async:true,
                dataType: "JSON",
                data:{
                    phone:phoneNo,
                    accountId:acount
                },
                success:function(res) {
                    if (!commonJs.ajaxGetCode(res)) {
                        _that.setState({
                            top_phoneNo:phoneNo,
                            top_acount:acount,
                            top_loanNumber:"",
                            getQueue:[],
                            _params:"",
                            _oper_type:"search",
                            _userMsg_reload:"reload",
                            isBarUpdata:"reload"
                        },()=>{
                            _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                        })
                        return;
                    }
                    var _getData = res.data;
                    //查询到合同号数据
                    if(_getData && _getData.loanNumber && _getData.loanNumber.length>0){
                        let getloanNumbers=_getData.loanNumber;
                        _that.setState({
                            top_phoneNo:phoneNo,
                            top_acount:_getData.accountId,
                            getQueue:getloanNumbers,
                            _params:_getData.accountId,
                            _oper_type:"search",
                            top_loanNumber:getloanNumbers[0],
                            _userMsg_reload:"reload",
                            isBarUpdata:"reload"
                        },()=>{
                            // _that.getLoanNuber_array();
                            _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                        })
                        
                    }
                }
            })
        });

        //查询下一条数据
        $(".search-next").click(function(){
            commonJs.cancelSaveQ(); //初始化queue操作框
            var searchNext_url="";
            var rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
            var n=$(".Csearch-left-page").find(".on").attr("data-id");
            _that.setState({
                _oper_type:"next",
                _userMsg_reload:"reload",
                isBarUpdata:"noload"
            });
            if(rig_current_page=="7"){  //公司搜索
                $(".source-select-tab .SoureCpy-inp,.source-select-tab .area-code,.source-select-tab .phone-No,.source-select-tab .phone-wh").val("");
                searchNext_url="/companySearch/companySearchNext";
                let CpnSearchNextData=_that.searchNext_fn(searchNext_url);
                if(!CpnSearchNextData || !CpnSearchNextData.companySearchQueueInfoDTO){   
                    return;
                }
                _that.setState({
                    cpy_Q_ajax:CpnSearchNextData,
                    _params:CpnSearchNextData.companySearchQueueInfoDTO?CpnSearchNextData.companySearchQueueInfoDTO.accountId:"",
                    top_acount:CpnSearchNextData.companySearchQueueInfoDTO?CpnSearchNextData.companySearchQueueInfoDTO.accountId:"",
                    top_loanNumber:CpnSearchNextData.companySearchQueueInfoDTO?CpnSearchNextData.companySearchQueueInfoDTO.loanNumber:"",
                    getQueue:[CpnSearchNextData.companySearchQueueInfoDTO.loanNumber],
                    isBarUpdata:"reload"
                },()=>{
                    // _that.getLoanNuber_array();
                    _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                })
            }
            if(rig_current_page=="1"){  //voe
                searchNext_url="/companySearch/voeQueueNext";
                let voeSearchNextData=_that.searchNext_fn(searchNext_url);
                if(!voeSearchNextData || !voeSearchNextData.voeQueueInfoDTO){
                    return;
                }
                _that.setState({
                    voe_Q_ajax:voeSearchNextData,
                    a:rig_current_page,
                    _params:voeSearchNextData.voeQueueInfoDTO?voeSearchNextData.voeQueueInfoDTO.accountId:"",
                    top_acount:voeSearchNextData.voeQueueInfoDTO?voeSearchNextData.voeQueueInfoDTO.accountId:"",
                    top_loanNumber:voeSearchNextData.voeQueueInfoDTO?voeSearchNextData.voeQueueInfoDTO.loanNumber:"",
                    getQueue:[voeSearchNextData.voeQueueInfoDTO.loanNumber]
                },()=>{
                    // _that.getLoanNuber_array();
                    _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                })
            }
            if(rig_current_page=="2"){  //vor
                searchNext_url="/companySearch/vorQueueNext";
                let vorSearchNextData=_that.searchNext_fn(searchNext_url);
                if(!vorSearchNextData || !vorSearchNextData.vorQueueInfoDTO){
                    return;
                }
                _that.setState({
                    vor_Q_ajax:vorSearchNextData,
                    a:rig_current_page,
                    _params:vorSearchNextData.vorQueueInfoDTO?vorSearchNextData.vorQueueInfoDTO.accountId:"",
                    top_acount:vorSearchNextData.vorQueueInfoDTO?vorSearchNextData.vorQueueInfoDTO.accountId:"",
                    top_loanNumber:vorSearchNextData.vorQueueInfoDTO?vorSearchNextData.vorQueueInfoDTO.loanNumber:"",
                    getQueue:[vorSearchNextData.vorQueueInfoDTO.loanNumber]
                },()=>{
                    // _that.getLoanNuber_array();
                    _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                })
            }
            if(rig_current_page=="3"){  //ocr
                searchNext_url="/companySearch/ocrQueueNext";
                let ocrSearchNextData=_that.searchNext_fn(searchNext_url);
                if(!ocrSearchNextData || !ocrSearchNextData.ocrQueueInfoDTO){
                    return;
                }
                _that.setState({
                    ocr_Q_ajax:ocrSearchNextData,
                    a:rig_current_page,
                    _params:ocrSearchNextData.ocrQueueInfoDTO?ocrSearchNextData.ocrQueueInfoDTO.accountId:"",
                    top_acount:ocrSearchNextData.ocrQueueInfoDTO?ocrSearchNextData.ocrQueueInfoDTO.accountId:"",
                    top_loanNumber:ocrSearchNextData.ocrQueueInfoDTO?ocrSearchNextData.ocrQueueInfoDTO.loanNumber:"",
                    getQueue:[ocrSearchNextData.ocrQueueInfoDTO.loanNumber]

                },()=>{
                    // _that.getLoanNuber_array();
                    _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                })
            }
            if(rig_current_page=="4"){  //lp
                searchNext_url="/companySearch/lpQueueNext";
                let lpSearchNextData=_that.searchNext_fn(searchNext_url);
                if(!lpSearchNextData || !lpSearchNextData.lpUltimateQueueInfoDTO){
                    return;
                }
                _that.setState({
                    lp_Q_ajax:lpSearchNextData,
                    a:rig_current_page,
                    _params:lpSearchNextData.lpUltimateQueueInfoDTO?lpSearchNextData.lpUltimateQueueInfoDTO.accountId:"",
                    top_acount:lpSearchNextData.lpUltimateQueueInfoDTO?lpSearchNextData.lpUltimateQueueInfoDTO.accountId:"",
                    top_loanNumber:lpSearchNextData.lpUltimateQueueInfoDTO?lpSearchNextData.lpUltimateQueueInfoDTO.loanNumber:"",
                    getQueue:[lpSearchNextData.lpUltimateQueueInfoDTO.loanNumber]
                },()=>{
                    // _that.getLoanNuber_array();
                    _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                })
            }
            if(rig_current_page=="5"){  //approve
                searchNext_url="/companySearch/approveQueueNext";
                let approveSearchNextData=_that.searchNext_fn(searchNext_url);
                if(!approveSearchNextData){
                    return;
                }
                _that.setState({
                    approve_Q_ajax:approveSearchNextData,
                    a:rig_current_page,
                    _params:approveSearchNextData.accountId,
                    top_acount:approveSearchNextData.accountId,
                    top_loanNumber:approveSearchNextData.loanNumber,
                    getQueue:[approveSearchNextData.loanNumber]
                },()=>{
                    // _that.getLoanNuber_array();
                    _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                })
            }
            if(rig_current_page=="6"){  //fraud
                searchNext_url="/companySearch/fraudQueueNext";
                let fraudSearchNextData=_that.searchNext_fn(searchNext_url);
                if(!fraudSearchNextData){
                    return;
                }
                _that.setState({
                    fraud_Q_ajax:fraudSearchNextData,
                    a:rig_current_page,
                    _params:fraudSearchNextData.accountId,
                    top_acount:fraudSearchNextData.accountId,
                    top_loanNumber:fraudSearchNextData.loanNumber,
                    getQueue:[fraudSearchNextData.loanNumber]
                },()=>{
                    // _that.getLoanNuber_array();
                    _that.changeLeft(parseInt(0),parseInt(rig_current_page));
                })
            }
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
            // _oper_type:"bar",
            _userMsg_reload:"reload",
            cpy_Q_ajax:"", //公司搜索数据
            voe_Q_ajax: "",  //voe搜索数据
            vor_Q_ajax: "",  //vor搜索数据
            ocr_Q_ajax:"",  //ocr搜索数据
            lp_Q_ajax:"",  //lp搜索数据
            approve_Q_ajax:"",  //approve搜索数据
            fraud_Q_ajax:"",  //fraud搜索数据
            lef_page:<UserMsg callbackFunc={this.callbackFunc.bind(this)} />,  //左边页面组件
            rig_page:'',  //右边页面组件
            _location:rigComponent,
            case_ocr_loanNumber:"",
            isBarUpdata:"reload"
        },()=>{
            // this.changeLeft(0);
            switch (rigComponent){
                case "CpySearch":
                    this.changeRight(7);
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
            }
        })
    }
    //设置顶部绑定数据 state
    topBindNumber_fn(_val,_fraudCounts){
        this.setState({
            topBindNumber:_val,
            fraudCounts:_fraudCounts?_fraudCounts:"",
        })
    }
    //搜索下一条ajax公共方法，并返回值给对应state用
    searchNext_fn(_url){
        var searchNext_data={};
        var _that=this;
        var rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
        var nowDate = new Date().getTime();
        $(".phoneNo,.acount").val("");
        $.ajax({
            type:"get",
            url:_url+"?time="+nowDate,
            async:false,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                _that.setState({
                    isBarUpdata:"noload"
                })
                var _getData = res.data;
                searchNext_data=_getData;
            }
        })
        return searchNext_data;
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
            lef_page:leftHtml,
            isBarUpdata:"noload"
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
                            get_location={this.state._location}
                            />;
                break;
            case 1:
                left_page=<Case prev_registrationId={this.state.registrationId} prev_params={this.state._params} prev_loanNumber={this.state.case_ocr_loanNumber} _oper_case_type="reload"/>;
                break;
            case 2:
                left_page=<Pact _params={this.state._params} _location={this.state._location} _nationalId={this.state.nationalId} _customerId={this.state.customerId} />;
                break;
            case 3:
                left_page=<File prev_userPhoneNo={this.state.userPhoneNo} prev_customerId={this.state.customerId} prev_registrationId={this.state.registrationId} prev_loanNumber={this.state.loanNumber} />;
                break;
            case 4:
                left_page=<OCR prev_params={this.state._params}  prev_loanNumber={this.state.case_ocr_loanNumber} />;
                break;
            case 5:
                left_page=<PhoneMsg _nationalId={this.state.nationalId} prev_params={this.state._params} _location={this.state._location} />;
                break;
            case 6:
                left_page=<MessageList _customerId={this.state.customerId} />;
                break;
            case 7:
                left_page=<CallRecord _params={this.state._params} />;
                break;
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
            case "OCR":
                this.changeRightAndHideButton(index,".OCR-edit-div");
                break;
            case "Approve":
                this.changeRightAndHideButton(index,".AP-edit-div");
                break;
            case "Fraud":
                this.changeRightAndHideButton(index,".FR-edit-div");
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
            case 7:
                right_page=<CpySearch 
                            _oper_type_props={this.state._oper_type} 
                            _params_rigPage={this.state.params_rigPage} 
                            _acount={this.state.top_acount} 
                            _phoneNo={this.state.top_phoneNo} 
                            _loanNumber={this.state.top_loanNumber}  
                            _cpy_Q_ajax={this.state.cpy_Q_ajax} 
                            _topBindNumber_fn={this.topBindNumber_fn.bind(this)} 
                            _workInfo_company={this.state.workInfo_company}
                            _nationalId={this.state.nationalId}
                            allPhoneNo={this.state.allPhoneNo}
                            />;
                break;
            case 3:
                right_page=<CpyOCR _oper_type_props={this.state._oper_type}
                                   _params_rigPage={this.state.params_rigPage}
                                   _acount={this.state.top_acount}
                                   _phoneNo={this.state.top_phoneNo}
                                   _loanNumber={this.state.top_loanNumber}
                                   _userPhoneNo={this.state.userPhoneNo}
                                   _ocr_Q_ajax={this.state.ocr_Q_ajax}
                                   _nationalId={this.state.nationalId}
                                   _topBindNumber_fn={this.topBindNumber_fn.bind(this)} />;
                break;
            case 4:
                right_page=<CpyLP _oper_type_props={this.state._oper_type}
                                  _params_rigPage={this.state.params_rigPage}
                                  _acount={this.state.top_acount}
                                  _phoneNo={this.state.top_phoneNo}
                                  _loanNumber={this.state.top_loanNumber}
                                  _userPhoneNo={this.state.userPhoneNo}
                                  _lp_Q_ajax={this.state.lp_Q_ajax}
                                  _nationalId={this.state.nationalId}
                                  _topBindNumber_fn={this.topBindNumber_fn.bind(this)} />;
                break;
            case 5:
                right_page=<CpyApprove _oper_type_props={this.state._oper_type}
                                       _params_rigPage={this.state.params_rigPage}
                                       _acount={this.state.top_acount}
                                       _phoneNo={this.state.top_phoneNo}
                                       _userPhoneNo={this.state.userPhoneNo}
                                       _loanNumber={this.state.top_loanNumber}
                                       _approve_Q_ajax={this.state.approve_Q_ajax}
                                       _nationalId={this.state.nationalId}
                                       _customerId={this.state.customerId}
                                        bankName={this.state.bankName}
                                        bankCardNumber={this.state.bankCardNumber}
                                       _topBindNumber_fn={this.topBindNumber_fn.bind(this)} />;
                break;
            case 6:
                right_page=<CpyFraud _oper_type_props={this.state._oper_type}
                                     _params_rigPage={this.state.params_rigPage}
                                     _acount={this.state.top_acount}
                                     _phoneNo={this.state.top_phoneNo}
                                     _userPhoneNo={this.state.userPhoneNo}
                                     _loanNumber={this.state.top_loanNumber}
                                     _fraud_Q_ajax={this.state.fraud_Q_ajax}
                                    bankName={this.state.bankName}
                                    bankCardNumber={this.state.bankCardNumber}
                                     _topBindNumber_fn={this.topBindNumber_fn.bind(this)} />;
                break;
        }
        
        this.setState({
            rig_page:right_page,
            isBarUpdata:"noload"
        },()=>{
            $(".Csearch-right-page li").removeClass("on");
            $(".Csearch-right-page li[data-id='"+index+"']").addClass("on");

            if(showButton && showButton!=""){
                $(".CPS-edit-div,.OCR-edit-div,.LP-edit-div,.AP-edit-div,.FR-edit-div").addClass("hidden");
                $(showButton).removeClass("hidden");
                $(showButton).each(function(){
                    if($(this).hasClass("bind_hidden")){
                        $(showButton).addClass("hidden");
                    }
                })
                // if($(showButton).hasClass("bind_hidden")){
                //     $(showButton).addClass("hidden");
                //     // $(showButton).removeClass("bind_hidden");
                // }  
            }

        })
    }
    //顶部--选择合同号更新公司搜索页面
    selectLoanNo_fn(event){
        var _that = this;
        let selectLoanNo=$(event.target).find("option:selected").text();
        var rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
        this.setState({
            top_loanNumber:selectLoanNo,
            _oper_type:"change_loanNumber"
        },()=>{
            _that.changeLeft(0,parseInt(rig_current_page));
            _that.changeRight(parseInt(rig_current_page));
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

    render() {
        return (
            <div className="content" id="content">
                <div className="top">
                    <div className="clearfix" data-isresetdiv="yes" data-resetstate="getQueue">
                        <input type="text" name="" placeholder="手机号" className="input left mr15 mt20 phoneNo" id='phoneNo' />
                        <input type="text" name="" placeholder="账号" className="input left mr15 mt20 acount" id='acount' />
                        <select name="" className="select-blue left mt20 mr15 seralNo getCQLoanNumber-select" id='getCQLoanNumber' onChange={this.selectLoanNo_fn.bind(this)} style={{"width":"20%"}}>
                            {
                                (this.state.getQueue && this.state.getQueue.length>0) ? this.state.getQueue.map((types,index)=>{
                                        return <option value="" key={index}>{types}</option>
                                    }):<option value="" className="defaultOption">暂未查到数据</option>
                            }
                        </select>
                        <button className="left mr15 mt20 btn-white getCQ-btn" id='searchBtn'>搜索</button>
                        <button className="left mr15 mt20 btn-blue search-next" id='searchNext'>查询下一条</button>
                        <button className="left mt20 btn-white" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                    </div>
                    <div className="clearfix mt10" style={{"height":"22px"}}>
                        <div className="topBundleCounts">
                            <b className="left mr20">截至当日未完成<span className="deep-yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(this.state.topBindNumber.cutCurrentUnComplete)}</span>条</b>
                            <b className="left mr20">当日已完成<span className="yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(this.state.topBindNumber.todayCompleteAll)}</span>条</b>
                            <b className="left mr20">当前绑定<span className="yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(this.state.topBindNumber.selfHandled)}</span>条</b>
                            {
                                (this.state._location=="Approve" ||this.state._location=="Fraud")?
                                <b className="left mr20">需跟进<span className="yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(this.state.topBindNumber.needFollow)}</span>条</b>
                                :""
                            }
                        </div>
                        {/* <div className="fraudCounts">
                            <b className="left mr20">所有未处理<span className="deep-yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(this.state.fraudCounts.allUnhandled)}</span>条</b>
                            <b className="left mr20">今天已完成<span className="yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(this.state.fraudCounts.todayCompleteAll)}</span>条</b>
                        </div> */}
                    </div>
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
                                <li data-id="7" onClick={this.changeRight.bind(this,7)} data-btn-rule="RULE:TREE:COMPANY" id='COMPANY'>公司搜索</li>
                                {/* <li data-id="3" onClick={this.changeRight.bind(this,3)} data-btn-rule="RULE:TREE:OCR">OCR</li> */}
                                <li data-id="6" onClick={this.changeRight.bind(this,6)} data-btn-rule="RULE:TREE:FRAUD" id='FRAUD'>Fraud</li>
                                <li data-id="5" onClick={this.changeRight.bind(this,5)} data-btn-rule="RULE:TREE:APPROVE" id='APPROVE'>Approve</li>
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={commonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        {this.state.rig_page}
                    </div>
                </div>
            </div>
        )
    }
};

export default CompanySearchIndex;  //ES6语法，导出模块