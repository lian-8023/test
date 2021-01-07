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

class CpyLP extends React.Component {
    constructor(props){
        super(props);
        this.state={
            lpData:{},
            VOE_isSus:"",  //summary voe可以状态
            reasonSubs:[],
            change_loanNumber_acount: "",
            change_loanNumber_loanNumber: "",
            conditionParam:{},
            lpModule:{},//lp对应模型结果-数据来源queue
            nowStatusId:"",
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
                lpData: {},
                lpModule:{},
                conditionParam:nextProps
                },()=>{
                    this.getMsg("SEARCH",true);
                });
        }else if(_oper_type=="next"){
            if(nextProps._lp_Q_ajax&&nextProps._lp_Q_ajax!=""&&nextProps._lp_Q_ajax.lpUltimateQueueInfoDTO&&nextProps._lp_Q_ajax.lpUltimateQueueInfoDTO!="") {
                var moduleMsg = commonJs.parseLPModule(nextProps._lp_Q_ajax);
                let new_contactResultsInfoDTO=this.isShowLoan(nextProps._lp_Q_ajax.showLpLoan,nextProps._lp_Q_ajax.contactResultsInfoDTO);
                this.setState({
                    lpData: nextProps._lp_Q_ajax,
                    lpModule:moduleMsg,
                    contactResultsInfoDTO:new_contactResultsInfoDTO,
                    smsTemplateEnums:nextProps._lp_Q_ajax.smsTemplateEnums,  //短信模板
                    conditionParam: {
                        _phoneNo: {},
                        _acount: nextProps._lp_Q_ajax.lpUltimateQueueInfoDTO.accountId,
                        _loanNumber: nextProps._lp_Q_ajax.lpUltimateQueueInfoDTO.loanNumber
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
                change_loanNumber_loanNumber: nextProps._loanNumber
            },()=>{
                this.pub_getMsg(this.state.change_loanNumber_acount,this.state.change_loanNumber_loanNumber,"SEARCH",true);
            });
        }
        this.initCount();
    }

    componentDidMount(){
        $(".topBundleCounts").removeClass("hidden");
        $(".fraudCounts").addClass("hidden");
        
        if(this.props._params_rigPage!="reminder" && this.props._params_rigPage!="collection"){
            var h = document.documentElement.clientHeight;
            $(".auto-box").css("height", h - 200);
        }  
        
        let params_rigPage=this.props._params_rigPage;
        if(params_rigPage!="LP"){
            $(".LP-edit-div").addClass("hidden");
        }else {
            $(".LP-edit-div").removeClass("hidden");
        }
    }
    initCount(){
        let _url="/companySearch/getLpCount";
        let parentModule=this.props._parentIsDecline_LP;  //父组件是Decline_LP时，parentModule等于true；为其他时parentModule不存在；
        if(parentModule){
            _url="/companySearch/getDeclineLpCount"
        }
        let _that=this;
        $.ajax({
            type:"get",
            url:_url,
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
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
        let _url="/companySearch/getLpQueueInfoByLoanNumber";
        let parentModule=this.props._parentIsDecline_LP;  //父组件是Decline_LP时，parentModule等于true；为其他时parentModule不存在；
        if(parentModule){
            _url="/companySearch/getDeclineLpQueueInfoByLoanNumber"
        }
        let _that=this;
        commonJs.cancelSaveQ(); //初始化queue操作框
        if( (typeof(_accountId)=="undefined" || _accountId=="") || (typeof(_loanNumber)=="undefined"|| _loanNumber=="")){
            return;
        }
        $.ajax({
            type: "get",
            url: _url,
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
                var moduleMsg = commonJs.parseLPModule(_getData);
                if (!_getData.executed) {
                    _that.setState({
                        lpData:{},
                        lpModule:{},
                        smsTemplateEnums:[]
                    })
                    return;
                }
                if(_getData.status=="blind"){
                    alert("当前queue已被"+_getData.user+"绑定！");
                    $(".reloadModeMsg").addClass("hidden");
                }
                let new_contactResultsInfoDTO=_that.isShowLoan(_getData.showLpLoan,_getData.contactResultsInfoDTO);
                _that.setState({
                    lpData:_getData,
                    lpModule:moduleMsg,
                    contactResultsInfoDTO:new_contactResultsInfoDTO,
                    smsTemplateEnums:_getData.smsTemplateEnums,  //短信模板
                    repaymentType:true
                })
                _that.initCount();
            }
        })
    }

    /**
     * 跟进接口 showLpLoan 字段，是否显示record处理状态的 LP放款
     * @param {*} judge 传入的showLpLoan字段  true or false
     * @param {*} oldArray 接口传回的原始处理状态数组
     */
    isShowLoan(judge,oldArray){
        let newArray=[];
        if(!judge){
            for(let i=0;i<oldArray.length;i++){
                if(oldArray[i].id!=16){
                    newArray.push(oldArray[i])
                }
            }
        }else{
            newArray=oldArray
        }
        return newArray;
    }
    // lp queue保存操作 saveLpQueue
    saveLpQueueHandler(event){
        var _that=this;
        let $this=$(event.target);
        let lpData=this.state.lpData;
        var _data={};//请求参数   data-queuestatusid
        let _afterQueueStatusId=$(".contactResultsInfo .commu-select option:selected").attr("id");  //处理状态
        if((!_afterQueueStatusId || typeof(_afterQueueStatusId)=="undefined") && lpData.lpUltimateQueueInfoDTO.queueStatusId!=11){
            alert("处理状态为必填项！");
            return;
        }
        let _contactMethodId=$(".contactMethods .commu-select option:selected").attr("id");
        let _contactResultId=$(".contactResultsInfo .commu-select option:selected").attr("id");
        _data.contactResultId=_contactResultId?_contactResultId:0; //结果 -- 处理原因 id
        let _contactResult=$(".contactResultReasonsInfo option:selected").attr("id");
        let _beforeQueueStatusId=$(".queueStatu").attr("data-queueStatusId");
        let _beforeOperateStatus=$(".queueStatu").attr("data-queueStatus");
        let _caseContent=$(".lpQdetail").val();
        if((!_contactMethodId || _contactMethodId=="0") && lpData.lpUltimateQueueInfoDTO.queueStatusId!=11){
            alert("请选择沟通方式!");
            return;
        }
        if(_beforeQueueStatusId==4||_beforeQueueStatusId==6||_beforeQueueStatusId==7||_beforeQueueStatusId==8||_beforeQueueStatusId==10){
            alert("当前queue状态为"+_beforeOperateStatus+"不能操作");
            return;
        }
        let _discountType=$(".QrecordInfo").find(".disCountType option:selected").text();  //打折类型
        let _whetherChangeInstallment=false;
        let _discount=$(".QrecordInfo").find(".discountRate option:selected").text();  //打折率
        let _url="/companySearch/saveLpQueue";
        let parentModule=this.props._parentIsDecline_LP;  //父组件是Decline_LP时，parentModule等于true；父组件为其他时parentModule不存在；
        if(parentModule){
            _url="/companySearch/saveDeclineLpQueue"
        }
        if(lpData.lpUltimateQueueInfoDTO.queueStatusId==11){ //处理状态选择 确认放款
            _url="/companySearch/appendLoanRecord";
            _data.queueType="LP";
        }else{
            if(_afterQueueStatusId && _afterQueueStatusId==16){  //处理状态选择lp放款时，需要选择期数
                _data.discountType='无需打折';
                _data.discount='100%';
                if(!lpData.installments){
                    alert("期数未获取到数据！");
                    return;
                }
                _data.installments=lpData.installments;
                if(!lpData.selected_amount){
                    alert("放款金额未获取到数据！");
                    return;
                }
                _data.loanAmount=lpData.selected_amount;
            //     let _installments=$(".QrecordInfo").find(".installments option:selected").text();  //期数
            //     if(!_installments){
            //         alert("请选择期数！");
            //         return;
            //     }
            //     let _approveMoney=$(".creditCash-td .loanAmount").val(); //处理状态选择 LP放款
            //     if(!_approveMoney){
            //         alert("LP放款金额不能为空！");
            //         return;
            //     }
            //     if(isNaN(parseInt(_approveMoney))){
            //         alert("LP放款金额必须是数字！");
            //         return;
            //     }
            //     if(this.state.lpData.installments==_installments){  //选择期数和模型信息中期数对比，判断是否分期
            //         _whetherChangeInstallment=false;
            //     }else{
            //         _whetherChangeInstallment=true;
            //     }
            //     _data.discountType=_discountType;
            //     _data.installments=_installments;
            //     _data.discount=_discount;
            //     _data.loanAmount=_approveMoney;
            }
        }
            _data.accountId=_that.state.lpData.lpUltimateQueueInfoDTO.accountId;
            _data.afterQueueStatusId=_afterQueueStatusId?_afterQueueStatusId:0;   //操作后状态ID --处理状态id
            _data.beforeQueueStatusId=_beforeQueueStatusId;  //操作前状态ID -- companySearchQueueInfoDTO.queueStatusId
            _data.caseContent=_caseContent;  //内容-详情
            _data.contactMethodId=_contactMethodId?_contactMethodId:0;  //沟通方式--沟通方式 id
            _data.loanNumber=_that.state.lpData.lpUltimateQueueInfoDTO.loanNumber;
            _data.beforeOperateStatus=_beforeOperateStatus;  //操作之前的状态中文 -- companySearchQueueInfoDTO.queueStatus
            _data.whetherChangeInstallment=_whetherChangeInstallment;
            _data.selected_amount=lpData.selected_amount

        let _scheduledTime=$(".contactResultsInfo_time").attr("data-time");  //跟进时间--当处理状态选择 跟进时 获取时间
        let followUpTime_attr=$this.closest("table").find(".contactResultsInfo_time option:selected").attr("data-contactresult");
        if(_scheduledTime!=""){
            _data.scheduledTime=_scheduledTime  //	跟进时间--当处理状态选择 跟进时 获取时间 ps：用户没选则不传字段
        }
        if(followUpTime_attr=="withdraw"||followUpTime_attr=="cancel"||followUpTime_attr=="decline"){
            if(!_contactResultId||_contactResultId==""||_contactResultId=="0"){
                alert("请选择原因");
                return;
            }
            _data.withdrawOrCancelReasonId=_contactResult?_contactResult:0; //拒绝原因ID
        }
        if(_afterQueueStatusId==16 && lpData.lpUltimateQueueInfoDTO.queueStatusId!=11){
            let r=confirm("确认放款吗？");
            if(!r){
                return false;
            }
        }
        
        $.ajax({
            type:"post",
            url:_url,
            async:true,
            dataType: "JSON",
            data:_data,
            timeout : 30000, //超时时间设置，单位毫秒
            success:function(res) {
                commonJs.ajaxGetCode(res);
                var _getData = res.data;
                if(!_getData.executed){
                    $("#loading").remove();
                    return;
                }
                alert(_getData.message);
                $("#loading").remove();
                commonJs.cancelSaveQ();
                _that.getMsg("RELOAD",true);
                _that.setState({
                    isSave:true
                })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        })
    }
    //切换打折率
    selectDiscount(event){
        var moduleMsg=this.state.lpModule;  //模型数据
        var periodAmount = moduleMsg && moduleMsg.periodAmount;
        let $this=$(event.target);
        let discountVal=$this.find("option:selected").val();
        $(".approveMoney").text(periodAmount*discountVal);
    }
    //显示发送短信弹窗
    showSendMsg(){
        $(".sendMessage-pop").removeClass("hidden");
    }

    turnStatus(status_id,status_value){
        $(".customSelect-ul").addClass("hidden");
        $(".customSelect-ul .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        this.setState({
            selectdArray:[],
            _selected:""
        })//初始化审核结论列表end
        $(".followUpTime,.contactResultReasonsInfo,.creditCash-td,.disCountType,.discountRate,.installments,.discount").addClass("hidden");
        $(".contactResultsInfo_time .commu-select").css("width","95%");
        if(status_value=="default_follow_up"){   //设置跟进时间-显示时间控件
            $(".contactResultsInfo_time .commu-select").css("width","35%");
            $(".followUpTime").removeClass("hidden");
        }else if(status_value=="withdraw"||status_value=="cancel" || status_value=="decline"){
            $(".contactResultReasonsInfo").removeClass("hidden");
        }else if(status_value=="lp_loan" && this.state.lpData.lpUltimateQueueInfoDTO.queueStatusId!=11){
            $(".disCountType,.discountRate,.installments,.creditCash-td").removeClass("hidden");
        }
        if(status_id==6){  //处理状态选撤回，显示处理原因contactResultId=10数据
            status_id=10;
        }else if(status_id==8){  //处理状态选取消，显示处理原因contactResultId=11数据
            status_id=11;
        }else if(status_id==7){  //处理状态选拒绝，显示处理原因contactResultId=12数据
            status_id=12;
        }
        this.setState({
            nowStatusId:status_id
        })
    }

    turnReasonParent(parentValue){
        var reaonSubs = this.state.lpData.reaonSubs;
        if(reaonSubs){
            var reaonSubs_array = reaonSubs[parentValue];
            if(reaonSubs_array&&reaonSubs_array.length>0){
                this.setState({
                    reasonSubs:reaonSubs_array
                });
            }
        }
    }
    //计算器
    counterHandle(event){
        let that=this;
        let $this=$(event.target);
        let _parent=$this.closest(".QrecordInfo");
        let _param={};
        _param.loanNumber=this.state.conditionParam._loanNumber;
        _param.accountId=this.state.conditionParam._acount;
        _param.customerId=this.state.lpData.lpUltimateQueueInfoDTO.customerId;
        let _loanAmount=_parent.find(".loanAmount").val();
        _param.loanAmount=_loanAmount;  
        _param.disCountType=_parent.find(".disCountType option:selected").text();  //打折类型
        let _installments=_parent.find(".installments option:selected").text();  //期数
        if(!_installments){
            alert("请选择期数！");
            return;
        }
        _param.installments=_installments;
        if(!_loanAmount){
            alert("请输入放款金额！");
            return;
        }
        $.ajax({
            type:"post",
            url:"/companySearch/calculator",
            async:true,
            dataType: "JSON",
            data:_param,
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _getData = res.data;
                let amortizationOBJInfoDTO=_getData.amortizationOBJInfoDTO;
                let amortizationList=_getData.amortizationOBJInfoDTO?_getData.amortizationOBJInfoDTO.amortizationList:"";
                if((!amortizationOBJInfoDTO || typeof(amortizationOBJInfoDTO)==undefined) && (!amortizationList || typeof(amortizationList)==undefined)){
                    alert("没有查询到数据！");
                    return;
                }
                that.setState({
                    counterData:_getData.amortizationOBJInfoDTO?_getData.amortizationOBJInfoDTO:{},
                    amortizationList:_getData.amortizationOBJInfoDTO?_getData.amortizationOBJInfoDTO.amortizationList:[]
                })
                $(".counter-pop").removeClass("hidden");
            }
        })
    }
    //关闭计算器弹窗
    counterClose(){
        $(".counter-pop").addClass("hidden");
    }
    //切换期数计算出放款金额
    qs_toLoanAmount(event){
        let _parent=$(event.target).closest(".QrecordInfo");
        let selected_val=parseFloat($(event.target).find("option:selected").text());
        let discount=_parent.find(".discountRate option:selected").text();//选择的打折率
        let discount_float=(discount.replace("%",""))/100;
        let loanAmount=""; //放款金额
        let _loanAmount3=this.state.lpData.lpUltimateQueueInfoDTO.loanAmount3;  //模型信息中12期对应的放款金额
        let _loanAmount12=this.state.lpData.lpUltimateQueueInfoDTO.loanAmount12;  //模型信息中12期对应的放款金额
        let _loanAmount18=this.state.lpData.lpUltimateQueueInfoDTO.loanAmount18;  //模型信息中18期对应的放款金额
        let _loanAmount24=this.state.lpData.lpUltimateQueueInfoDTO.loanAmount24;  //模型信息中24期对应的放款金额
        let _loanAmount36=this.state.lpData.lpUltimateQueueInfoDTO.loanAmount36;  //模型信息中36期对应的放款金额
        switch(selected_val)
        {
            case 3:
                loanAmount=_loanAmount3*discount_float;
                break;
            case 12:
                loanAmount=_loanAmount12*discount_float;
                break;
            case 18:
                loanAmount=_loanAmount18*discount_float;
                break;
            case 24:
                loanAmount=_loanAmount24*discount_float;
                break;
            case 36:
                loanAmount=_loanAmount36*discount_float;
                break;
        } 
        _parent.find(".loanAmount").val(loanAmount);
    }
    //切换打折率计算出放款金额
    dzl_toLoanAmount(event){
        let that=this;
        let _parent=$(event.target).closest(".QrecordInfo");
        let discount=$(event.target).find("option:selected").text();
        let installments=parseFloat(_parent.find(".installments option:selected").text());//选择的期数
        let discount_float=(discount.replace("%",""))/100;
        let loanAmount=""; //放款金额
        let installments_money=""; //选择期数对应的金额
        switch(installments)
        {
            case 3:
                installments_money=that.state.lpData.lpUltimateQueueInfoDTO.loanAmount3
                break;
            case 12:
                installments_money=that.state.lpData.lpUltimateQueueInfoDTO.loanAmount12
                break;
            case 18:
                installments_money=that.state.lpData.lpUltimateQueueInfoDTO.loanAmount18
                break;
            case 24:
                installments_money=that.state.lpData.lpUltimateQueueInfoDTO.loanAmount24
                break;
            case 36:
                installments_money=that.state.lpData.lpUltimateQueueInfoDTO.loanAmount36
                break;
        } 
        loanAmount=installments_money*discount_float;
        _parent.find(".loanAmount").val(loanAmount);
    }
    //切换打折类型
    changeCountType(event){
        let _selected=$(event.target).find("option:selected").attr("value");
        $(".discountRate option").removeProp("selected");
        $(".discountRate option[value='100%']").prop("selected",true)
        if(_selected=="noNeedDiscount"){
            $(".discountRate select").attr("disabled","disabled");
        }else{
            $(".discountRate select").removeAttr("disabled");
        }
    }
    render() {
        let moduleMsg=this.state.lpModule;  //模型数据

        let summaryDataDTO=this.state.lpData.lpUltimateQueueInfoDTO; //summary数据
        let communications=this.state.lpData.lpUltimateQueueRecordsInfoDTOS;

        let communications_array=(this.state.lpData && this.state.lpData.contactMethodsInfoDTO); //沟通方式 组件需要数据 array
        let contactResults=this.state.contactResultsInfoDTO?this.state.contactResultsInfoDTO:[]; //处理状态数据 组件需要数据 array
        let dealReasons = (this.state.lpData && this.state.lpData.reasonEnums); //处理原因 组件需要数据 array

        let oneReasons = [];
        if(this.state.lpData&&this.state.lpData.contactResultReasonsInfoDTO&&this.state.nowStatusId){
            for(let i=0;i<this.state.lpData.contactResultReasonsInfoDTO.length;i++){
                let reason_i = this.state.lpData.contactResultReasonsInfoDTO[i];
                if(reason_i.contactResultId==this.state.nowStatusId){
                    oneReasons.push(reason_i);
                }
            }
        }
        let _queueStatusId,_queueStatus;
        if(this.state.lpData && this.state.lpData.lpUltimateQueueInfoDTO && typeof(this.state.lpData.lpUltimateQueueInfoDTO)!="undefined"){
            _queueStatusId=this.state.lpData.lpUltimateQueueInfoDTO.queueStatusId;
            _queueStatus=this.state.lpData.lpUltimateQueueInfoDTO.queueStatus;
        }

        //分析当前记录是否被其他人绑定，即status=blind标识被绑定了，则只能查看不能操作
        let blind_status = this.state.lpData.status;
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
                    insuranceRate_3={this.state.lpData.insuranceRate_3}
                    insuranceRate_12={this.state.lpData.insuranceRate_12}
                    _queueType={this.props._showDecline_LP?"decline-lp":"lp"}
                    _accountId={this.state.conditionParam._acount} 
                    _loanNumber={this.state.conditionParam._loanNumber} 
                    _queueStatusId={_queueStatusId}
                    _getMsg={this.getMsg.bind(this)}
                    _showDecline_LP={this.props._showDecline_LP}
                    _Decline_LP={this.state.lpData.lpUltimateQueueInfoDTO?this.state.lpData.lpUltimateQueueInfoDTO.modelGrade:""}  //Decline_LP等级,仅Decline_LP queue展示
                />
                <RepaymentList accountId={this.state.conditionParam._acount} loanNumber={this.state.conditionParam._loanNumber} type={this.state.repaymentType} />
                <table className={(blind_status=="blind"||_queueStatusId==4||_queueStatusId==6||_queueStatusId==7||_queueStatusId==8||_queueStatusId==10)?"radius-tab mt10 LP-edit-div QrecordInfo  bind_hidden hidden":"radius-tab mt10 LP-edit-div QrecordInfo"} cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                        <tr>
                            {(summaryDataDTO && summaryDataDTO.queueStatusId==11)?"":<th>沟通方式</th>}
                            <th>状态</th>
                            {(summaryDataDTO && summaryDataDTO.queueStatusId==11)?"":<th>处理状态</th>}
                            {/* <th className="disCountType hidden">打折类型</th>
                            <th className="discountRate hidden">打折率</th> */}
                            <th className="discount hidden">批准金额</th>
                            <th className="contactResultReasonsInfo hidden">处理原因</th>
                            <th className="installments hidden">期数</th>
                            <th className="creditCash-td hidden">放款金额</th>
                            <th></th>
                        </tr>
                        <tr>
                            {(summaryDataDTO && summaryDataDTO.queueStatusId==11)?"":
                                <td className="contactMethods">
                                {
                                    communications_array ? <Communication_select _communications={this.state.lpData.contactMethodsInfoDTO} type="communications_select" id='contactMethods' />:<select name="" id="" className="select-gray"><option value="">请选择</option></select>
                                }
                            </td>}
                            <td className="queueStatu elli" style={{"width":"80px"}} data-queueStatusId={_queueStatusId?_queueStatusId:""} data-queueStatus={_queueStatus?_queueStatus:""}>
                                <div className="elli" style={{"width":"80px"}} title={_queueStatus}>{_queueStatus}</div>
                            </td>
                            {(summaryDataDTO && summaryDataDTO.queueStatusId==11)?"":
                                <td className="contactResultsInfo">
                                {
                                    contactResults ? <Communication_select  _turnStatus={this.turnStatus.bind(this)} _contactResults={contactResults} type="contactResults_select" id='contactResultsInfo' />:<select name="" id="" className="select-gray"><option value="">请选择</option></select>
                                }
                            </td>}
                            {/* <td className="disCountType hidden">
                                <select name="" id="" className="select-gray" onChange={this.changeCountType.bind(this)}>
                                    <option value="discounted">已打折</option>
                                    <option value="noNeedDiscount">无需打折</option>
                                    <option value="notDiscount">最终未打折</option>
                                </select>
                            </td>
                            <td className="discountRate hidden">
                                <select name="" id="" className="select-gray" onChange={this.dzl_toLoanAmount.bind(this)}>
                                    <option value="10%">10%</option>
                                    <option value="20%">20%</option>
                                    <option value="30%">30%</option>
                                    <option value="40%">40%</option>
                                    <option value="50%">50%</option>
                                    <option value="60%">60%</option>
                                    <option value="70%">70%</option>
                                    <option value="80%">80%</option>
                                    <option value="90%">90%</option>
                                    <option value="100%">100%</option>
                                </select>
                            </td> */}
                            <td className="discount hidden">
                                <input type="text" className="input approveMoney" id='approveMoney' placeholder="批准金额" />
                            </td>
                            <td className="contactResultReasonsInfo hidden">
                                {oneReasons ? <Communication_select _dealReasons={oneReasons} type="dealReason_enum" id='contactResultReasonsInfo' /> : <select name="" id="" className="select-gray"><option value="">请选择</option></select>}
                            </td>
                            <td className="installments hidden">
                                <select name="" id="installments" className="select-gray" onChange={this.qs_toLoanAmount.bind(this)} disabled>
                                    <option value="" selected>{commonJs.is_obj_exist(this.state.lpData.installments)}</option>
                                    {/* <option value="" hidden></option>
                                    { (summaryDataDTO && summaryDataDTO.loanAmount3)?<option value="">3</option>:""}
                                    { (summaryDataDTO && summaryDataDTO.loanAmount12)?<option value="">12</option>:""}
                                    { (summaryDataDTO && summaryDataDTO.loanAmount18)?<option value="">18</option>:""}
                                    { (summaryDataDTO && summaryDataDTO.loanAmount24)?<option value="">24</option>:""}
                                    { (summaryDataDTO && summaryDataDTO.loanAmount36)?<option value="">36</option>:""} */}
                                </select>
                            </td>
                            <td className="creditCash creditCash-td hidden">
                                <input type="text" className="input loanAmount left mr10" id='loanAmount' value={commonJs.is_obj_exist(this.state.lpData.selected_amount)} disabled />
                                {/* <i className="counter left block" onClick={this.counterHandle.bind(this)}></i> */}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="6">
                                <span className="detail-t">详情</span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="6">
                                <textarea name="" id="" cols="30" rows="10" className="commu-area textarea lpQdetail" id='lpQdetail'></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="6">
                                <button className="btn-white block mr20 right" id='showSendMsg' onClick={this.showSendMsg.bind(this)}><i className="send-msg-icon"></i>发送短信</button>
                                <button className="left block ml20 edit btn-blue" id='saveLpQueueHandler' onClick={this.saveLpQueueHandler.bind(this)}>保存</button>
                                <button className="btn-white left block ml20 cancle_edit" id='saveLpQueueHandlerCancle' onClick={commonJs.cancelSaveQ.bind(this)}>取消</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table className="pt-table mt10 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                        <tr>
                            <th>沟通方式</th>
                            <th>状态</th>
                            <th>处理状态</th>
                            <th>撤回原因</th>
                            <th>打折类型</th>
                            <th>打折率</th>
                            <th>期数</th>
                            <th>放款金额</th>
                        </tr>
                        {
                            (communications && communications.length>0) ? communications.map((repy,i)=>{
                                return <tr key={i}>
                                    <td colSpan="8" className="no-padding-left">
                                        <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                            <tbody>
                                            <tr>
                                                <td title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                <td title={commonJs.is_obj_exist(repy.beforeQueueStatus)}>{commonJs.is_obj_exist(repy.beforeQueueStatus)}</td>
                                                <td title={commonJs.is_obj_exist(repy.afterQueueStatus)}>{commonJs.is_obj_exist(repy.afterQueueStatus)}</td>
                                                <td title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                                <td title={commonJs.is_obj_exist(repy.discountType)}>{commonJs.is_obj_exist(repy.discountType)}</td>
                                                <td title={commonJs.is_obj_exist(repy.discount)}>{commonJs.is_obj_exist(repy.discount)}</td>
                                                <td title={commonJs.is_obj_exist(repy.installments)}>{commonJs.is_obj_exist(repy.installments)}</td>
                                                <td title={commonJs.is_obj_exist(repy.approveMoney)}>{commonJs.is_obj_exist(repy.approveMoney)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="8" className="short-border-td">
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
                                }): <tr><td colSpan="8" className="gray-tip-font">暂未查到相关数据...</td></tr>
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

export default CpyLP;