// Ast
import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import ModuleMsg from './ModuleMsg'
import Communication_select from '../module/Communication_select'
import SendMessage from '../module/sendMessage'; //发送短信弹窗
import RepaymentList from '../module/repaymentList'; //还款列表板块

class CpyApprove extends React.Component {
    constructor(props){
        super(props);
        this.state={
            ApproveData:"",
            reasonParent:"",
            reasonSubs:"",
            PactList:[],
            change_loanNumber_acount: "",
            change_loanNumber_loanNumber: "",
            conditionParam:{},
            approveModule:{},//对应模型结果-数据来源queue
            nowStatusId:"",
        }
    }
    UNSAFE_componentWillMount(){
        this.setState({
            conditionParam:{
                _acount:this.props._acount,
                _loanNumber:this.props._loanNumber
            }
        },()=>{
            this.getMsg("RELOAD",true);
        });
        this.initCount();
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps==this.props){
            return;
        }
        var _oper_type = nextProps._oper_type_props;
        if(_oper_type=="search"){
            this.setState({
                ApproveData:{},
                approveModule:{},
                conditionParam:nextProps
            },()=>{
                this.getMsg("SEARCH",true);
            });
        }else if(_oper_type=="next"){
            if(nextProps._approve_Q_ajax&&nextProps._approve_Q_ajax!=""){
                var moduleMsg = this.parseApproveModule(nextProps._approve_Q_ajax);
                this.setState({
                    ApproveData:nextProps._approve_Q_ajax,
                    approveModule:moduleMsg,
                    smsTemplateEnums:nextProps._approve_Q_ajax.smsTemplateEnums,  //短信模板
                    conditionParam:{
                        _phoneNo:{},
                        _acount:nextProps._approve_Q_ajax.accountId,
                        _loanNumber:nextProps._approve_Q_ajax.loanNumber
                    }
                },()=>{
                    if(this.state.isSave){
                        this.getMsg("SEARCH");
                    }
                });
            }
        }else if(_oper_type=="change_loanNumber"){
            this.setState({
                change_loanNumber_acount: nextProps._acount,
                change_loanNumber_loanNumber: nextProps._loanNumber,
                conditionParam:{
                    _acount:nextProps._acount,
                    _loanNumber:nextProps._loanNumber
                }
            },()=>{
                this.pub_getMsg(this.state.change_loanNumber_acount,this.state.change_loanNumber_loanNumber,"SEARCH",true);
            });
        }
        this.initCount();
    }

    componentDidMount(){
        $(".topBundleCounts").removeClass("hidden");
        $(".fraudCounts").addClass("hidden");

        let params_rigPage=this.props._params_rigPage;
        // if(params_rigPage!="Approve"){
        //     $(".AP-edit-div").addClass("hidden");
        // }else {
        //     $(".AP-edit-div").removeClass("hidden");
        // }

        if(this.props._params_rigPage!="reminder" && this.props._params_rigPage!="collection"){
            var h = document.documentElement.clientHeight;
            $(".auto-box").css("height", h - 200);
        }  
    }
    //组件将被卸载  
  componentWillUnmount(){ 
    //重写组件的setState方法，直接返回空
    this.setState = (state,callback)=>{
      return;
    };  
}
    initCount(){
        var _that=this;
        //获取数据处理情况
        $.ajax({
            type:"get",
            url:"/companySearch/getApproveQueueCount",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                if(!_getData.executed){
                    console.log("approve数据处理情况 获取数据 失败");
                    return;
                }
                _that.props._topBindNumber_fn(_getData);
                _that.setState({
                    repaymentType:false
                })
            }
        })
    }
    getMsg(operType){
        var _phone=this.state.conditionParam._phoneNo;
        var _accountId=this.state.conditionParam._acount;
        var _loanNumber=this.state.conditionParam._loanNumber;
        this.pub_getMsg(_accountId,_loanNumber,operType);
    }
    //获取页面数据
    pub_getMsg(_accountId,_loanNumber,operType){
        let _that=this;
        commonJs.cancelSaveQ(); //初始化queue操作框
        if( (typeof(_accountId)=="undefined" || _accountId=="") || (typeof(_loanNumber)=="undefined"|| _loanNumber=="")){
            return;
        }
        // this.getRefoundList();
        //获取approve页面数据
        $.ajax({
            type: "get",
            url: "/companySearch/getApproveQueueByLoanNumber",
            async: false,
            dataType: "JSON",
            scriptCharset: 'utf-8',
            data: {
                accountId:_accountId,
                loanNumber:_loanNumber,
                queueReloadEnum:operType
            },
            success: function (res) {
                commonJs.ajaxGetCode(res);
                var _getData = res.data;
                var moduleMsg = _that.parseApproveModule(_getData);
                if(!_getData.executed){
                    _that.setState({
                        ApproveData:_getData,
                        approveModule:moduleMsg,
                        smsTemplateEnums:[]
                    })
                    return;
                }
                if(_getData.status=="blind"){
                    alert("当前queue已被"+_getData.user+"绑定！");
                    $(".reloadModeMsg").addClass("hidden");
                }
                _that.setState({
                    ApproveData:_getData,
                    approveModule:moduleMsg,
                    smsTemplateEnums:_getData.smsTemplateEnums,  //短信模板
                    repaymentType:true
                })
            }
        })
    }
    

    parseApproveModule(approveData){
        var moduleMsg = {};
        if(approveData&&approveData!=""){
            moduleMsg._source=approveData.source; //模型来源
            moduleMsg._grade=approveData.grade; //CreditModel等级
            moduleMsg._result=approveData.result;  //结果
            moduleMsg._loanAmount3=approveData.modelAmount3; //选择金额/3
            moduleMsg._loanAmount12=approveData.modelAmount12; //选择金额/12
            moduleMsg._loanAmount18=approveData.modelAmount18; //选择金额/18
            moduleMsg._loanAmount24=approveData.modelAmount24; //选择金额/24
            moduleMsg._loanAmount36=approveData.modelAmount36; //选择金额/36
            moduleMsg._selected_amount=approveData.selectedAmount; //选择金额
            moduleMsg._periods=approveData.installments ; //期数
            moduleMsg._contract_expiring_date=approveData.contractExpiringDate; //合同过期日 
            moduleMsg._module_date=approveData.modeldt; //模型时间
            moduleMsg._isStu=approveData.isStu; //是否在校学生 check_edu
            moduleMsg._simpleTest=approveData.simpleTest; 
        }
        return moduleMsg;
    }


    //保存Approve数据
    saveApprove(event){
        let _that=this;
        let $this=$(event.target);
        let ApproveData=this.state.ApproveData;
        let _installments=ApproveData.installments;  //期数
        
        let _afterQueueStatusId=$(".contactResultsInfo .commu-select option:selected").attr("data-queuestatusid");
        if((!_afterQueueStatusId || _afterQueueStatusId==0) && ApproveData.approveStatusID!=2){
            alert("处理状态为必填项！");
            return;
        }
        let _contactMethodId=$(".contactMethods .commu-select option:selected").attr("id");
        let _contactResultId=$(".contactResultsInfo option:selected").attr("id");
        let _contactResult=$(".contactResultReasonsInfo .reason_select option:selected").attr("id");
        let _beforeQueueStatusId=$(".queueStatu").attr("data-queueStatusId");
        let _beforeOperateStatus=$(".queueStatu").attr("data-queueStatus");
        let loanAmount = ApproveData.selectedAmount;
        let _caseContent=$(".approveQdetail").val();
        if((!_contactMethodId || _contactMethodId=="0") && ApproveData.approveStatusID!=2){
            alert("请选择沟通方式!");
            return;
        }
        
        var _data={
                accountId:ApproveData.accountId,
                afterApproveStatusId:_afterQueueStatusId?_afterQueueStatusId:0,   //操作后状态ID --处理状态id
                afterQueueStatusId:_afterQueueStatusId?_afterQueueStatusId:0,   //操作后状态ID --处理状态id
                beforeApproveStatusId:_beforeQueueStatusId,  //操作前状态ID -- ApproveQueueRecordDTO.queueStatusId
                caseContent:_caseContent,  //内容-详情
                contactMethodId:_contactMethodId?_contactMethodId:0,  //沟通方式--沟通方式 id
                loanNumber:ApproveData.loanNumber,
                beforeOperateStatus:_beforeOperateStatus,  //操作之前的状态中文 -- ApproveQueueRecordDTO.queueStatus
            };
        _data.contactResultId=_contactResultId?_contactResultId:0; //结果 -- 处理原因 主键id
        _data.whetherChangeInstallment=false;
        let followUpTime_attr=$this.closest("table").find(".contactResultsInfo_time option:selected").attr("data-contactresult");
        
        if(followUpTime_attr=="Withdraw"||followUpTime_attr=="Cancel"||followUpTime_attr=="Decline"){
            if(!_contactResultId||_contactResultId==""||_contactResultId=="0"){
                alert("请选择原因");
                return;
            }
            _data.withdrawOrCancelReasonId=_contactResult?_contactResult:0; //拒绝原因ID
        }else if(followUpTime_attr=="Approve"){  //选择放款
            if(!loanAmount){
                alert("放款金额未获取到数据！");
                return;
            }
            _data.loanAmount=loanAmount;
            if(!_installments){
                alert("期数未获取到数据！");
                return;
            }
            _data.installments=_installments;
        }
        let _url="/companySearch/saveApprove";
        if(ApproveData.approveStatusID==2){ 
            _url="/companySearch/appendLoanRecord";
            _data.queueType="APPROVE";
        }else{
            _data.discountType='无需打折';
            _data.discount='100%';
            _data.bankName=this.props.bankName;
            let _bankCardNumber=this.props.bankCardNumber;
            if(_bankCardNumber){
                _bankCardNumber=_bankCardNumber.substr(-4);
            }
            _data.bankCardNumber=_bankCardNumber;
        }
        if(_afterQueueStatusId==2 && ApproveData.approveStatusID!=2){ 
            let r=confirm("确认放款吗？");
            if(!r){
                return false;
            }
        }
        $.ajax({
            type:"post",
            url:_url,
            async:false,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                commonJs.cancelSaveQ();
                _that.getMsg("RELOAD",true);
                _that.initCount();
                _that.setState({
                    isSave:true
                })
            }
        })
    }


    turnStatus(status_id,status_value){
        $(".customSelect-ul").addClass("hidden");
        $(".customSelect-ul .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        this.setState({
            selectdArray:[],
            _selected:""
        })//初始化审核结论列表end
        $(".followUpTime,.contactResultReasonsInfo,.creditCash-td,.installments,.disCountType,.discountRate").addClass("hidden");
        $(".contactResultsInfo_time .commu-select").css("width","95%");
        if(status_value=="Withdraw"||status_value=="Cancel" ||status_value=="Decline"){
            $(".contactResultReasonsInfo").removeClass("hidden");
        }else if(status_value=="Approve" && this.state.ApproveData.approveStatusID!=2){
            $(".creditCash-td,.installments,.disCountType,.discountRate").removeClass("hidden");
        }
        if(status_id==4){  //处理状态选撤回，显示处理原因contactResultId=10数据
            status_id=10;
        }else if(status_id==5){  //处理状态选取消，显示处理原因contactResultId=11数据
            status_id=11;
        }else if(status_id==3){  //处理状态选拒绝，显示处理原因contactResultId=12数据
            status_id=12;
        }
        this.setState({
            nowStatusId:status_id
        })
    }
    //显示发送短信弹窗
    showSendMsg(){
        $(".sendMessage-pop").removeClass("hidden");
    }
    //关闭计算器弹窗
    counterClose(){
        $(".counter-pop").addClass("hidden");
    }
    render() {
        let moduleMsg=this.state.approveModule;  //模型数据
        let _ApproveQueueRecordDTO=this.state.ApproveData.approveQueueRecordList;

        let communications_array=(this.state.ApproveData && this.state.ApproveData.contactMethodsInfoDTO); //沟通方式 组件需要数据 array
        let contactResults=(this.state.ApproveData && this.state.ApproveData.contactResultsInfoDTO); //处理状态数据 组件需要数据 array
        let dealReasons = (this.state.ApproveData && this.state.ApproveData.reasonEnums); //处理原因 组件需要数据 array
        
        var oneReasons = [];
        if(this.state.ApproveData&&this.state.ApproveData.contactResultReasonsInfoDTO&&this.state.nowStatusId){
            for(var i=0;i<this.state.ApproveData.contactResultReasonsInfoDTO.length;i++){
                var reason_i = this.state.ApproveData.contactResultReasonsInfoDTO[i];
                if(reason_i.contactResultId==this.state.nowStatusId){
                    oneReasons.push(reason_i);
                }
            }
        }
        let _queueStatusId,_queueStatus;
        if(this.state.ApproveData && typeof(this.state.ApproveData)!="undefined"){
            _queueStatusId=this.state.ApproveData.approveStatusID;
            _queueStatus=this.state.ApproveData.approveStatus;
        }
        //分析当前记录是否被其他人绑定，即status=blind标识被绑定了，则只能查看不能操作
        var blind_status = this.state.ApproveData.status;
        let counterData=this.state.counterData?this.state.counterData:{};  //计算器弹窗数据
        let _installments=commonJs.is_obj_exist(counterData.installments);//计算器弹窗数据--根据 期数 得到 月利率
        let interestrRate;//计算器弹窗数据--月利率
        if(_installments==12){
            interestrRate="1.71%";
        }else if(_installments==18){
            interestrRate="1.72%";
        }else if(_installments==24){
            interestrRate="1.74%";
        }else{
            interestrRate="-"
        }
        return (
            <div className="auto-box pr5">
                <ModuleMsg 
                    _ModuleMsgs={moduleMsg} 
                    insuranceRate_3={this.state.ApproveData.insuranceRate_3}
                    insuranceRate_12={this.state.ApproveData.insuranceRate_12}
                    _queueType="approve" 
                    _accountId={this.state.conditionParam._acount} 
                    _loanNumber={this.state.conditionParam._loanNumber} 
                    _queueStatusId={_queueStatusId}
                    _getMsg={this.getMsg.bind(this)}
                />
                <RepaymentList accountId={this.state.conditionParam._acount} loanNumber={this.state.conditionParam._loanNumber} type={this.state.repaymentType} />
                <table className={(blind_status=="blind"||(_queueStatusId!=1 && _queueStatusId!=2 && _queueStatusId!=8))?"radius-tab mt10 AP-edit-div QrecordInfo bind_hidden hidden":"radius-tab mt10 AP-edit-div QrecordInfo"} cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                        <tr>
                            {this.state.ApproveData.approveStatusID==2?"":<th>沟通方式</th>}
                            <th>状态</th>
                            {this.state.ApproveData.approveStatusID==2?"":<th className="dealStates">处理状态</th>}
                            <th className="contactResultReasonsInfo hidden">处理原因</th>
                            <th></th>
                        </tr>
                        <tr>
                            {this.state.ApproveData.approveStatusID==2?"":
                                <td className="contactMethods">
                                    {
                                        communications_array ? <Communication_select _communications={this.state.ApproveData.contactMethodsInfoDTO} type="communications_select" id='contactMethods' />:<select name="" id="" className="select-gray"><option value="">请选择</option></select>
                                    }
                                </td>
                            }
                            <td className="queueStatu" data-queueStatusId={_queueStatusId?_queueStatusId:""} data-queueStatus={_queueStatus?_queueStatus:""}>{_queueStatus}</td>
                            {this.state.ApproveData.approveStatusID==2?"":
                                <td className="contactResultsInfo dealStates">
                                    {
                                        contactResults ? <Communication_select _turnStatus={this.turnStatus.bind(this)} _contactResults={this.state.ApproveData.contactResultsInfoDTO} type="contactResults_select" id='dealStates' />:<select name="" id="" className="select-gray"><option value="">请选择</option></select>
                                    }
                                </td>
                            }
                            <td className="contactResultReasonsInfo hidden">
                                {oneReasons ? <Communication_select _dealReasons={oneReasons} type="dealReason_select" id='contactResultReasonsInfo' /> : <select name="" id="" className="select-gray"><option value="">请选择</option></select>}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="6">
                                <span className="detail-t">详情</span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="6">
                                <textarea name="" id="" cols="30" rows="10" className="commu-area textarea approveQdetail" id='approveQdetail'></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="6">
                                <button className="btn-white block mr20 right" onClick={this.showSendMsg.bind(this)} id='showSendMsg'><i className="send-msg-icon"></i>发送短信</button>
                                <button className="left block ml20 edit btn-blue" onClick={this.saveApprove.bind(this)} id='saveApprove'>保存</button>
                                <button className="btn-white left block ml20 cancle_edit" onClick={commonJs.cancelSaveQ.bind(this)} id='saveApproveCancle'>取消</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table className="pt-table mt10 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                        <tr>
                            <th width="20%">沟通方式</th>
                            <th width="20%">状态</th>
                            <th width="20%">处理状态</th>
                            <th width="20%">撤回原因</th>
                            <th>放款金额</th>
                        </tr>
                        {
                            (_ApproveQueueRecordDTO && _ApproveQueueRecordDTO.length>0) ? _ApproveQueueRecordDTO.map((repy,i)=>{
                                return <tr key={i}>
                                    <td colSpan="5" className="no-padding-left">
                                        <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                            <tbody>
                                            <tr>
                                                <td width="20%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                <td width="20%" title={commonJs.is_obj_exist(repy.beforeApproveStatus)}>{commonJs.is_obj_exist(repy.beforeApproveStatus)}</td>
                                                <td width="20%" title={commonJs.is_obj_exist(repy.afterApproveStatus)}>{commonJs.is_obj_exist(repy.afterApproveStatus)}</td>
                                                <td width="20%" title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                                <td title={commonJs.is_obj_exist(repy.loanAmount)}>{commonJs.is_obj_exist(repy.loanAmount)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="5" className="short-border-td">
                                                    <div className="short-border"></div>
                                                    <p className="left pt5 pb5 word-break pre-wrap" style={{"width":"65%"}} title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                                    <div className="left ext-source-tip word-break" style={{"width":"30%","marginTop":"5px","paddingRight":"0"}} title={commonJs.is_obj_exist(repy.createdBy)+commonJs.is_obj_exist(repy.createdAt)}>
                                                        {commonJs.is_obj_exist(repy.createdBy)} <br/>{commonJs.is_obj_exist(repy.createdAt)}
                                                    </div>
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
                <SendMessage _userPhoneNo={this.props._userPhoneNo} sendToUrl="/common/sendLpApproveSms" msgMode={this.state.smsTemplateEnums} />
                {/* 计算器弹窗 */}
                <div className="counter-pop hidden">
                    <div className="tanc_bg"></div>
                    <div className="counter-box">
                        <i className="counter-close block" onClick={this.counterClose.bind(this)}></i>
                        <div style={{"maxHeight":"600px","overflow":"scroll"}}>
                            <table className="table radius-tab">
                                <tbody>
                                    <tr>
                                        <th colSpan="8" className="align-center">小雨点信用贷</th>
                                    </tr>
                                    <tr>
                                        <th>年利率</th>
                                        <th>期数</th>
                                        <th>前期费利率</th>
                                        <th>贷款金额</th>
                                        <th>手续费</th>
                                        <th>总利息</th>
                                        <th>月利率</th>
                                        <th>到账金额</th>
                                    </tr>
                                    <tr>
                                        <td>{commonJs.is_obj_exist(counterData.yearRate)}</td>
                                        <td>{commonJs.is_obj_exist(counterData.installments)}</td>
                                        <td>{commonJs.is_obj_exist(counterData.upfrontFeeRate)}</td>
                                        <td>{commonJs.is_obj_exist(counterData.loanAmount)}</td>
                                        <td>{commonJs.is_obj_exist(counterData.upfrontFeeTotal)}</td>
                                        <td>{commonJs.is_obj_exist(counterData.interestTotal)}</td>
                                        <td>{interestrRate}</td>
                                        <td>
                                            {
                                                (commonJs.is_obj_exist(counterData.loanAmount,0) - commonJs.is_obj_exist(counterData.upfrontFeeTotal,0)).toFixed(2)
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="8"></td>
                                    </tr>
                                    <tr>
                                        <th>期数</th>
                                        <th>还款日期</th>
                                        <th>每月还款额</th>
                                        <th>剩余本金</th>
                                        <th>利息</th>
                                        <th>本金</th>
                                        <th></th>
                                    </tr>
                                    {
                                    (this.state.amortizationList && this.state.amortizationList.length>0)?this.state.amortizationList.map((repy,i)=>{
                                            return <tr key={i}>
                                                        <td>{commonJs.is_obj_exist(repy.installmentNumber)}</td>
                                                        <td>{commonJs.is_obj_exist(repy.dueDate)}</td>
                                                        <td>{commonJs.is_obj_exist(repy.amount)}</td>
                                                        <td>{commonJs.is_obj_exist(repy.remainingBalance)}</td>
                                                        <td>{commonJs.is_obj_exist(repy.interest)}</td>
                                                        <td>{commonJs.is_obj_exist(repy.principle)}</td>
                                                        <td></td>
                                                    </tr>
                                        }):<tr><td>暂未查到数据</td></tr>
                                    }
                                    
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
;

export default CpyApprove;