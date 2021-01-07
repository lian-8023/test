import React,{PureComponent} from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import Communication_select from '../A2-module/Communication_select'
import FraudDesList from '../cp-module/fraudDesList';  //反欺诈描述
import RepaymentList from '../module/repaymentList'; //还款列表板块
// import SendMessage from '../module/sendMessage'; //发送短信弹窗
import { Checkbox,Select,Button,Modal } from 'antd';
import ModelVisualization from '../cp-module/modelVisualization';//反欺诈模型可视化
class CpyFraud extends React.Component {
    constructor(props){
        super(props);
        this.state={
            FraudData:{},
            a:"",
            change_loanNumber_acount: "",
            change_loanNumber_loanNumber: "",
            conditionParam:{},
        }
    }
    UNSAFE_componentWillMount (){
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
                FraudData:{},
                smsTemplateEnums:nextProps._fraud_Q_ajax.smsTemplateEnums,  //短信模板
                conditionParam:nextProps,
                },()=>{
                    this.getMsg("SEARCH",true);
                });
        }else if(_oper_type=="next"){
            if(nextProps._fraud_Q_ajax&&nextProps._fraud_Q_ajax!="") {
                this.setState({
                    FraudData: nextProps._fraud_Q_ajax,
                    conditionParam: {
                        _phoneNo: {},
                        _acount: nextProps._fraud_Q_ajax.accountId,
                        _loanNumber: nextProps._fraud_Q_ajax.loanNumber
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
    }
    
    componentDidMount(){
        this.initCount();

        let params_rigPage=this.props._params_rigPage;
        if(params_rigPage!="Fraud"){
            $(".FR-edit-div").addClass("hidden");
        }else {
            $(".FR-edit-div").removeClass("hidden");
        }

        if(this.props._params_rigPage!="reminder" && this.props._params_rigPage!="collection"){
            var h = document.documentElement.clientHeight;
            $(".auto-box").css("height", h - 200);
        }  

    }
    initCount(){
        var _that=this;
        $.ajax({
            type:"get",
            url:"/companySearch/getFraudCount",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                if(!_getData.executed){
                    console.log("LP数据处理情况 获取数据 失败");
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
        //获取fraud页面数据
        $.ajax({
            type: "get",
            url: "/companySearch/getFraudQueueByLoanNumber",
            async: false,
            dataType: "JSON",
            data: {
                accountId: _accountId,
                loanNumber: _loanNumber,
                queueReloadEnum:operType
            },
            success: function (res) {
                commonJs.ajaxGetCode(res);
                var _getData = res.data;
                if (!_getData.executed) {
                    _that.setState({
                        FraudData:{},
                        smsTemplateEnums:[]
                    })
                    return;
                }
                if(_getData.status=="blind"){
                    alert("当前queue已被"+_getData.user+"绑定！");
                }
                _that.setState({
                    FraudData:_getData,
                    smsTemplateEnums:_getData.smsTemplateEnums,  //短信模板
                    repaymentType:true
                })
            }
        })
        this.initCount();
    }
    //显示发送短信弹窗
    showSendMsg(){
        $(".sendMessage-pop").removeClass("hidden");
    }
    //保存Fraud数据
    saveFraud(){
        let _that=this;
        let FraudData=this.state.FraudData;
        if(!FraudData||!FraudData.accountId){
            alert("没有数据需要操作");
            return ;
        }
        let parems={};
        let _contactMethodId=$(".contactMethods .commu-select option:selected").attr("id");  //沟通方式
        let _afterQueueStatusId=$(".contactResultsInfo .commu-select option:selected").attr("id");  //处理状态-id
        parems.contactResultId=_afterQueueStatusId?_afterQueueStatusId:0; //结果 -- 处理原因 主键id
        let afterQueueStatusId_en=$(".contactResultsInfo .commu-select option:selected").attr("data-contactresult");  //处理状态-data-contactresult
        if((!_afterQueueStatusId || _afterQueueStatusId==0) && FraudData.fraudQueueStatusID!=2){
            alert("处理状态为必填项！");
            return;
        }
        let _contactResultId=$(".contactResultReasonsInfo .commu-select option:selected").attr("id");  //处理原因
        if(afterQueueStatusId_en=="Withdraw"||afterQueueStatusId_en=="Cancel"||afterQueueStatusId_en=="Decline"){
            if(!_contactResultId||_contactResultId==""||_contactResultId=="0"){
                alert("请选择处理原因");
                return;
            }
            parems.withdrawOrCancelReasonId=_contactResultId?_contactResultId:0;  
        }
        let loanAmount = FraudData.selectedAmount;
        if(afterQueueStatusId_en=='Approve'){
            if(!loanAmount){
                alert("放款金额未获取到数据！");
                return;
            }
            parems.loanAmount=loanAmount;
        }
        let _beforeQueueStatusId=$(".queueStatu").attr("data-queueStatusId");
        let _beforeOperateStatus=$(".queueStatu").attr("data-queueStatus");
        if((!_contactMethodId || _contactMethodId=="0") && FraudData.fraudQueueStatusID!=2){
            alert("请选择沟通方式!");
            return;
        }
        
        let _caseContent=$(".fraudQdetail").val();
        parems.caseContent=_caseContent;
        parems.accountId=FraudData.accountId;
        parems.afterStatusId=_afterQueueStatusId;   //操作后状态ID --处理状态id
        parems.beforeStatusId=_beforeQueueStatusId;  //操作前状态ID -- companySearchQueueInfoDTO.queueStatusId
        parems.loanNumber=FraudData.loanNumber;
        parems.contactMethodId=_contactMethodId?_contactMethodId:0;  //沟通方式--沟通方式 id
        parems.bankName=this.props.bankName;
        let _bankCardNumber=this.props.bankCardNumber;
        if(_bankCardNumber){
            _bankCardNumber=_bankCardNumber.substr(-4);
        }
        parems.bankCardNumber=_bankCardNumber;
        parems.installments=FraudData.installments;  //期数
        $.ajax({
            type:"get",
            url:"/companySearch/saveFraud",
            async:false,
            dataType: "JSON",
            data:parems,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                if(!_getData.executed){
                    console.log("保存Fraud数据 失败");
                    return;
                }
                alert(_getData.message);
                _that.getMsg("RELOAD",true);
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
        }else if(status_value=="Approve" && this.state.FraudData.fraudQueueStatusID!=2){
            $(".creditCash-td,.installments,.disCountType,.discountRate").removeClass("hidden");
        }
        if(status_id==4){  //处理状态选撤回，显示处理原因contactResultId=10数据
            status_id=10;
        }else if(status_id==5){  //处理状态选取消，显示处理原因contactResultId=11数据
            status_id=11;
        }else if(status_id==3){  //处理状态选拒绝，显示处理原因contactResultId=12数据
            status_id=12;
        }

        let oneReasons = [];
        let {FraudData={}}=this.state;  //fraud数据
        let dealReasons = FraudData.contactResultReasonsInfoDTO; //处理原因 组件需要数据 array
        if(dealReasons&&status_id){
            for(let i=0;i<dealReasons.length;i++){
                let reason_i = dealReasons[i];
                if(reason_i.contactResultId==status_id){
                    oneReasons.push(reason_i);
                }
            }
        }
        this.setState({
            oneReasons:oneReasons
        })
    }
    render() {
        let {FraudData={},oneReasons=[]}=this.state;  //fraud数据
        let _fraudQueueRecordList=FraudData.fraudQueueRecordList;
        let is_fraudQueueRecordList=(_fraudQueueRecordList && _fraudQueueRecordList.length>0);
        
        let communications_array=FraudData.contactMethodsInfoDTO; //沟通方式 组件需要数据 array
        let contactResults=FraudData.contactResultsInfoDTO;//处理状态数据 组件需要数据 array

        let _queueStatusId=commonJs.is_obj_exist(FraudData.fraudQueueStatusID);
        //分析当前记录是否被其他人绑定，即status=blind标识被绑定了，则只能查看不能操作 
        var isCtrlShow=(_queueStatusId==8 || _queueStatusId==1);
        let fraudMsg=FraudData.responseDTO?FraudData.responseDTO.listMap:"";  //反欺诈描述信息
        let fraudResult=FraudData.responseDTO?FraudData.responseDTO.fraudResult:"";  //反欺诈描述信息
        return (
            <div className="auto-box pr5">
                <div className="bar recall mt10 pl20">
                    <div className="mr10 left">
                        <span className="">account_id:</span>
                        <b className=" blue-font">
                            {commonJs.is_obj_exist(FraudData.backtracksrc)}
                        </b>
                    </div>
                    <div className="mr10 left">
                        <span className="">金额:</span>
                        <b className=" blue-font">
                            {commonJs.is_obj_exist(FraudData.selectedAmount)}
                        </b>
                    </div>
                    <div className="mr10 left">
                        <span className="">期数:</span>
                        <b className=" blue-font">
                            {commonJs.is_obj_exist(FraudData.installments)}
                        </b>
                    </div>
                </div>
                <div className="mt10">
                    <FraudDesList data={fraudMsg} fraudResult={fraudResult} />   {/*反欺诈描述*/}
                </div>
                {/* <div className="mt10" >
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit">
                        反欺诈图形可视化
                        {
                            FraudData.orderNo&&<Button style={{float: 'right',marginTop:'8px'}} type="primary" onClick={()=>this.setState({visible:true})} >查看</Button>
                        }
                    </h2>
                </div> */}
                <RepaymentList accountId={this.state.conditionParam._acount} loanNumber={this.state.conditionParam._loanNumber} type={this.state.repaymentType} />
                <table className={isCtrlShow ?"radius-tab mt10 FR-edit-div QrecordInfo":"radius-tab mt10 FR-edit-div QrecordInfo bind_hidden hidden"} cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                    <tr>
                        {_queueStatusId==2?'':<th width="20%">沟通方式</th>}
                        <th width="10%">状态</th>
                        {_queueStatusId==2?'':<th width="20%">处理状态</th>}
                        <th width="20%" className="contactResultReasonsInfo hidden">处理原因</th>
                        <th></th>
                    </tr>
                    <tr>
                        {_queueStatusId==2?'':
                            <td className="contactMethods">
                                {
                                    communications_array ? <Communication_select _communications={communications_array} type="communications_select" id='contactMethods' />:<select name="" id="" className="select-gray"><option value="">请选择</option></select>
                                }
                            </td>
                        }
                        <td className="queueStatu" data-queuestatusid={_queueStatusId} data-queuestatus="">{commonJs.is_obj_exist(this.state.FraudData.fraudQueueStatus)}</td>
                        {_queueStatusId==2?'':
                            <td className="contactResultsInfo dealStates">
                                {
                                    contactResults ? <Communication_select _turnStatus={this.turnStatus.bind(this)} _contactResults={contactResults} type="contactResults_select" id='dealStates' />:<select name="" id="" className="select-gray"><option value="">请选择</option></select>
                                }
                            </td>
                        }
                        <td className="contactResultReasonsInfo hidden">
                            {oneReasons ? <Communication_select _dealReasons={oneReasons} type="dealReason_select" id='contactResultReasonsInfo' /> : <select name="" id="" className="select-gray"><option value="">请选择</option></select>}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="5">
                            <textarea name="" id="" cols="30" rows="10" className="commu-area textarea fraudQdetail" id='fraudQdetail'></textarea>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="5">
                            <button className="btn-white block mr20 right" onClick={this.showSendMsg.bind(this)} id='showSendMsg'><i className="send-msg-icon"></i>发送短信</button>
                            <button className="left block edit btn-blue mr10" id='saveFraud' onClick={this.saveFraud.bind(this)}>保存</button>
                            <button className="left btn-white block cancle_edit" id='cancelSaveQ' onClick={commonJs.cancelSaveQ.bind(this)}>取消</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <table className="pt-table mt10 replay-list" cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                    <tr>
                        <th width="20%">沟通方式</th>
                        <th width="20%">状态</th>
                        <th width="20%">处理状态</th>
                        <th width="20%">撤回原因</th>
                        <th></th>
                    </tr>
                    {
                        is_fraudQueueRecordList ? _fraudQueueRecordList.map((repy,i)=>{
                                return <tr key={i}>
                                    <td colSpan="5" className="no-padding-left">
                                        <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                            <tbody>
                                            <tr>
                                                <td width="20%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                <td width="20%" title={commonJs.is_obj_exist(repy.beforeFraudStatus)}>{commonJs.is_obj_exist(repy.beforeFraudStatus)}</td>
                                                <td width="20%" title={commonJs.is_obj_exist(repy.afterFraudStatus)}>{commonJs.is_obj_exist(repy.afterFraudStatus)}</td>
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
                <Modal
                    title="反欺诈图形可视化"
                    width="1000px"
                    destroyOnClose = {true}
                    // height="1000px"
                    visible={this.state.visible}
                    onOk={()=>this.setState({visible:false})}
                    onCancel={()=>this.setState({visible:false})}
                    >
                        {/* <ModelVisualization parms={{cooperationFlag:infoDTO.cooperationFlag,orderNo:infoDTO.orderNo}} /> */}
                </Modal>
                {/*发送短信弹窗*/}
                {/* <SendMessage _userPhoneNo={this.props._userPhoneNo} sendToUrl="/common/sendLpApproveSms" msgMode={this.state.smsTemplateEnums} /> */}
            </div>
        )
    }
}
;

export default CpyFraud;