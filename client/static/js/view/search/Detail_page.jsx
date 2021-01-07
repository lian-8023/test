import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import axios from '../../axios';
import UserMsg from '../module/UserMsg';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import File from './File';  //=>附件
import Case from './Case';   //=>案例
import Pact from './Pact';   //=>合同列表
import MessageList from './messageList';   //=>通讯录
import OCR from './OCR';   //=>OCR  
import PhoneMsg from '../search/PhoneMsg';   //=>PhoneMsg
import OperatorReport from '../search/OperatorReport';   //=>运营商报告
import OperatorReportNew from '../search/OperatorReportNew';   //=>运营商报告
import CallRecord from '../search/callRecord';   //=>拨打记录  
import SecurityRcord from '../search/SecurityRcord';   //=>社保记录  
import BankList from '../search/bankList';   //=>银行流水  
import GuaranteeRapayList from '../module/guaranteeRapayList'; //担保费还款计划table展示
import DeductionRecordsList from '../module/deductionRecordsList'; //担保费还款记录table展示

class Detail_file extends React.Component {
    constructor(props){
        super(props);
        this.state={
            _oper_type:"",//操作类型：noload表示不重新加载数据
            _oper_case_type:"",
            _params:this.props.params.id, //portal账号，对应用户ID
            haveFinishLoan:"NO", //是否有已完成的合同YES、NO
            rig_page:<Case />,  //右边组件切换
            registrationId:"",  //用户注册表t_registration对应的id
            loanNumber:"",       //贷款号
            loanNumber_array:"",  //合同列表
            nationalId:"", //身份证--给子组件用
            deductionRecordsList:{},
            productNo:'',
        }
    }
    // select框切换合同号
    changeLoanNo(event){
        let $this=$(event.target);
        let n=$(".search-rig-page .on").attr("id");
        var theText=$this.find("option:selected").text();
        this.setState({
            loanNumber:theText,
            _oper_type:"reload",
            _oper_case_type:"reload1",
        },()=>{
            this.getGuranteeList();
            let pageData = {
                pageSize:'10',
                pageNum:'1'
            }
            this.deductionRecords(pageData);
            // this.changeRig(n);
        })
    }
    //右边组件切换
    changeRig(index){
        var companet_page="";
        if(index==1){
            companet_page=<Case prev_registrationId={this.state.registrationId} prev_params={this.state._params} prev_loanNumber={this.state.loanNumber} _oper_case_type={this.state._oper_case_type}/>
        }else if(index==2){
            companet_page=<Pact _params={this.state._params} _customerId={this.state.customerId} _nationalId={this.state.nationalId} />
        }else if(index==3){
            companet_page=<File prev_userPhoneNo={this.state.userPhoneNo} prev_registrationId={this.state.registrationId} prev_params={this.state._params} prev_loanNumber={this.state.loanNumber} prev_customerId={this.state.customerId} />
        }else if(index==4){
            companet_page=<OCR prev_params={this.state._params} prev_loanNumber={this.state.loanNumber} />
        }else if(index==5){
            companet_page=<PhoneMsg prev_params={this.state._params} _nationalId={this.state.nationalId} />;
        }else if(index==6){
            companet_page=<MessageList _customerId={this.state.customerId} />;
        }else if(index==7){
            companet_page=<CallRecord _params={this.state._params} />;
        }else if(index==8){
            companet_page=<OperatorReport _customerId={this.state.customerId} prev_params={this.state._params} _nationalId={this.state.nationalId} _sourceQuotient={this.state.sourceQuotient} />;
        }else if(index==9){
            companet_page=<SecurityRcord prev_params={this.state._params} _nationalId={this.state.nationalId} />;
        }else if(index==10){
            companet_page=<BankList prev_params={this.state._params} _nationalId={this.state.nationalId} />;
        }else if(index==11){
            companet_page=<OperatorReportNew _customerId={this.state.customerId} prev_params={this.state._params} _nationalId={this.state.nationalId} _sourceQuotient={this.state.sourceQuotient} />;
        }else if(index==12){
            companet_page=<div><GuaranteeRapayList guaranteeFeePayInfoList={this.state.guaranteeFeePayInfoList} /><DeductionRecordsList 
            deductionRecords ={this.deductionRecords}
            deductionRecordsList={this.state.deductionRecordsList}
        /></div>;
        }
        $(".search-rig-page li").removeClass("on");
        $(".search-rig-page li[id='"+index+"']").addClass("on");
        this.setState({
            rig_page:companet_page,
            _oper_type:"noload",
            _oper_case_type:"noload"
        })
    }
    callbackFunc(bankName,bankCardNumber,_registrationId,_loanNumber,_nationalId,_company,_companyPhone,_userPhoneNo,_cardNo,_customerId,_userName,_sex,_allPhoneNo,_sourceQuotient,_haveFinishLoan){
        this.setState({
            registrationId:_registrationId,
            loanNumber:_loanNumber,
            nationalId:_nationalId, //身份证号
            haveFinishLoan:_haveFinishLoan,
            customerId:_customerId,
            userPhoneNo:_userPhoneNo,
            sourceQuotient:_sourceQuotient,
            _oper_type:"noload",
            _oper_case_type:"noload"
        },()=>{
            this.getGuranteeList();
            let pageData = {
                pageSize:'10',
                pageNum:'1'
            }
            this.deductionRecords(pageData);
        })
    }
    componentDidMount(){
        commonJs.reloadRules();
        var h = document.documentElement.clientHeight;
        $(".auto-box").css("height",h-105);
        $(".tree li:eq(0)").addClass("on");
        this.getLoanNuber_array();
    }
    UNSAFE_componentWillReceiveProps(){
        $(".tree li:eq(0)").addClass("on");
    }
    //根据合同号查询担保费还款列表-lyf
    getGuranteeList=()=>{
        let that=this;
        let _loanNumber=this.state.loanNumber;
        let productNo=this.state.productNo;
        axios({
            method: 'get',
            url:'/node/upfrontFee/query/gurantee',
            params:{loanNumber:_loanNumber,productNo:productNo}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if(!response.executed){
                that.setState({
                    guaranteeFeePayInfoList:[]
                })
            }
            that.setState({
                guaranteeFeePayInfoList:cpCommonJs.opinitionArray(data.guaranteeFeePayInfoList)
            })
        })
    }
    //担保费扣款记录查询-lyf
    deductionRecords=(pageData)=>{
        let that=this;
        let _loanNumber=this.state.loanNumber;
        let productNo=this.state.productNo;
        let params = {};
        let n=$(".search-rig-page .on").attr("id");
        params = pageData;
        params.loanNumber = _loanNumber;
        params.productNo = productNo;
        $.ajax({
            type:"post",
            url:"/node/upfrontFee/gurantee/pay",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(params)},
            success:function(res) {
                let response=res.data;  //from node response
                let data=response.data;  //from java response 
                if(!response.executed){
                    that.setState({
                        deductionRecordsList:{}
                    })
                }
                that.setState({
                    deductionRecordsList:cpCommonJs.opinitionArray(response)
                });
                that.changeRig(n);
            }
        })
    }
    //获取合同列表
    getLoanNuber_array(){
        let _that=this;
        $.ajax({
            type:"get",
            url:"/node/pactList",
            async:false,
            dataType: "JSON",
            data:{
                accountId:_that.state._params
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    console.log("合同列表数据获取失败");
                    return;
                }
                var _getData = res.data;
                _that.setState({
                    loanNumber_array:_getData.loanInfoDTOs?_getData.loanInfoDTOs:[],
                    loanNumber:(_getData.loanInfoDTOs && _getData.loanInfoDTOs.length>0)?_getData.loanInfoDTOs[0].loanNumber:"",
                    productNo:(_getData.loanInfoDTOs && _getData.loanInfoDTOs.length>0)?_getData.loanInfoDTOs[0].productNO:"",
                    _oper_type:"noload",
                    _oper_case_type:"reload2"
                },()=>{
                   _that.changeRig(1);
                })
            }
        })
    }
    
    render() {
        return (
            <div className="content" id="content">
                <div className="clearfix">
                    <div className="left cont-left content-toggle">
                        <div className="bar title-box clearfix relative">
                            <i className="auto-box-shade Cs-auto-box-shade"></i>
                            <ul className="left ml10 mt5 nav">
                                <li className="on">详情</li>
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={commonJs.all_content_toggle.bind(this)}></i> */}
                            <b className="right current-acount arail">＃{this.state._params}  {this.state.haveFinishLoan=="YES"?"老客户":""}</b>
                        </div>
                        <UserMsg _params={this.state._params} _oper_type_props={this.state._oper_type} callbackFunc={this.callbackFunc.bind(this)} />
                    </div>
                    <div className="right cont-right content-toggle">
                        <div className="bar title-box clearfix relative">
                            <i className="auto-box-shade Cs-auto-box-shade"></i>
                            <ul className="left ml10 mt5 nav search-rig-page">
                                <li id="1" className="on" onClick={this.changeRig.bind(this,1)} data-btn-rule="RULE:DETAIL:CASE:TOP">案例</li>
                                <li id="2" onClick={this.changeRig.bind(this,2)} data-btn-rule="RULE:DETAIL:LOAN:TOP">合同列表</li>
                                <li id="3" onClick={this.changeRig.bind(this,3)} data-btn-rule="RULE:DETAIL:FILE:TOP">附件</li>
                                {/* <li id="4" onClick={this.changeRig.bind(this,4)} data-btn-rule="RULE:DETAIL:OCR:TOP">OCR</li> */}
                                <li id="5" onClick={this.changeRig.bind(this,5)} data-btn-rule="RULE:JXL:OPERATION:DETAIL">电话详情</li>
                                <li id="8" onClick={this.changeRig.bind(this,8)} data-btn-rule="RULE:TREE:JXLSEARCH">运营商</li>
                                <li id="11" onClick={this.changeRig.bind(this,11)} data-btn-rule="RULE:TREE:JXLSEARCH:NEW">运营商新</li>
                                <li id="6" onClick={this.changeRig.bind(this,6)} data-btn-rule="LOAN:RULE:MQUERY:CONTACTSLIST">通讯录</li>
                                <li id="7" onClick={this.changeRig.bind(this,7)} data-btn-rule="RULE:TREE:MANUALCALL">拨打记录</li>
                                <li id="9" onClick={this.changeRig.bind(this,9)} data-btn-rule="RULE:DETAIL:MANAGER:SOCIAL:INFO">社保</li>
                                <li id="10" onClick={this.changeRig.bind(this,10)} data-btn-rule="RULE:DETAIL:MANAGER:BANK:INFO">银行</li>
                                <li id="12" onClick={this.changeRig.bind(this,12)}>担保费</li>
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={commonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        <div className="bar mt10 detail-top-select-bar">
                                <select name="" id="detailTopSelect" className="select-blue left mt5 ml20 detail-top-select" style={{"width":"200px"}} onChange={this.changeLoanNo.bind(this)}>
                                    {
                                        this.state.loanNumber_array.length>0 ? this.state.loanNumber_array.map((repy,i)=>{
                                            return <option value="" key={i}>{repy.loanNumber}</option>
                                        }):<option value="">没有数据</option>
                                    }
                                </select>
                            </div>
                        {this.state.rig_page}
                    </div>
                </div>
            </div>
    );
    }
}
;
export default Detail_file;