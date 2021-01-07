import React,{PureComponent} from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import UserMsg from '../module/UserMsg';
import Case from '../search/Case';   //=>案例
import File from '../search/File';  //=>附件
import $ from 'jquery';
//发送短信弹窗
import SendMessage from '../module/sendMessage'; 

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
//input校验
import VerifyJs from '../../source/common/verify';
var verifyJs=new VerifyJs;
//获取所有短信模板
import GetAllMsg from '../../source/common/getAllMsg';
var getAllMsg=new GetAllMsg;
//时间组件
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;

// 组件
import AstSteps from './AstSteps';

class AstIndex extends React.Component{
    constructor(props){
        super(props);
        this.state={
            astAcounts:"",       //数据处理情况
            searchResult:{},     //搜索出的数据
            page:{},    //未完成第四步时显示AstSteps组件=>steps，完成后显示UserMsg组件 (当完成page.value大于等于4时，跳转到个人详情板块)
            _primaryPhone:"",    //电话号码，从子组件获取，用于保存queue
            _userMsg_reload:"noload",  //操作类型：noload表示不重新加载数据 个人中心
            _stepsMsg_reload:"load",  //操作类型：noload表示不重新加载数据 steps
            accountId:"",
            lef_page:"",  //左边页面组件
        }
    }
    componentDidMount(){
        this.resetData();
        this.initAcount();
        var h = document.documentElement.clientHeight;
        $(".auto-box").css("height", h - 200);
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps.location.action=='POP'||nextProps.location.action=="REPLACE"){
            this.initAcount();
        }
        this.resetData();
        commonJs.resetCondition(this);
    }
    //请空数据
    resetData(){
        this.setState({
            astAcounts:'',
            searchResult:'',
            astQueueRecordInfoDTOS:'',
            page:'',
            _primaryPhone:"",    //电话号码，从子组件获取，用于保存queue
            _userMsg_reload:"reload",  //操作类型：noload表示不重新加载数据 个人中心
            _stepsMsg_reload:"load",  //操作类型：noload表示不重新加载数据 steps
            accountId:"",
            lef_page:"",  //左边页面组件
        })
    }
    //从子组件获取电话号码--steps
    stepsCallBack(phoneNo,_page,_accountId){
        this.setState({
            _primaryPhone:phoneNo,
            page:_page,
            accountId:_accountId,
            _stepsMsg_reload:"noload",
            _userMsg_reload:"load"
        },()=>{
            if((_page && _page.value>=4)){
                this.changeLeft(0);
                this.changeLeft(0);
            }
        })
    }
    //从子组件获取电话号码--userMsg
    callbackFunc(bankName,bankCardNumber,_registrationId,_loanNumber,_nationalId,_company,_companyPhone,_userPhoneNo,_userName,_sex,_allPhoneNo,_sourceQuotient,_haveFinishLoan){
        this.setState({
            _primaryPhone:_userPhoneNo,
            _loanNumber:_loanNumber,
            userPhoneNo:_userPhoneNo,
            _userMsg_reload:"noload"
        })
    }
    //显示发送短信弹窗
    showSendMsg(){
        let data=getAllMsg.getAllMsg();
        this.setState({
            msgTypeList:data.templateList
        })
        $(".sendMessage-pop").removeClass("hidden");
    }
    //获取AST数据处理情况
    initAcount(){
        var _that=this;
        let resource=this.props.location.query?this.props.location.query.resource:'';
        let parem='';
        if(resource){
            parem={resource:'ast_insurance'}
        };
        $.ajax({
            type:"get",
            url:"/node/getAstCount",
            async:true,
            dataType: "JSON",
            data:parem,
            success:function(res) {
                commonJs.ajaxGetCode(res);
                var getData = res.data;
                if(!getData.executed){
                    _that.setState({
                        astAcounts:{}
                    });
                    return;
                }
                _that.setState({
                    astAcounts:getData
                })
            }
        })
    }
    
    //通过条件查询ast -- 搜索
    search(){
        let phoneNo=$(".astTop .phoneNo").val();
        let astId=$(".astTop .astId").val();
        let acountId=$(".astTop .acountId").val();
        let name=$(".astTop .name").val();
        this.resetMsg(false);  //还原数据
        if(isNaN(phoneNo)) {
            alert("手机号码必须是数字!");
            return;
        }
        if(isNaN(acountId)) {
            alert("portal账号必须是数字!");
            return;
        }
        if(isNaN(astId)) {
            alert("astId必须是数字!");
            return;
        }
        if(astId=="" && acountId=="" && phoneNo=="" && name==""){
            alert("请输入需要查询的条件!");
            return;
        }
        if(acountId.length>0 && acountId.length>9){
            alert("您输入的portal号有误，请重新输入！");
            return;
        }
        if(phoneNo.length>0 && phoneNo.length>12){
            alert("您输入的手机号有误，请重新输入！");
            return;
        }
        this.pub_search(phoneNo,astId,acountId,name,"SEARCH");
    }
    pub_search(phoneNo,astId,acountId,name,queueReloadEnum){
        var _that=this;
        $.ajax({
            type:"post",
            url:"/node/searchAst",
            async:true,
            dataType: "JSON",
            data:{
                primaryPhone:phoneNo,
                ast1Id:astId,
                accountId:acountId,
                name:name,
                queueReloadEnum:queueReloadEnum
            },
            beforeSend:function(XMLHttpRequest){
               $("body").append(loading_html);       
            },
            success:function(res) {
                $("#loading").remove();
                commonJs.ajaxGetCode(res);
                var getData = res.data;
                if(!getData.executed){
                    _that.setState({
                        page:{},
                        searchResult:{},
                        accountId:"",
                        _userMsg_reload:"load",
                        _stepsMsg_reload:"load"
                    })
                    return;
                }
                _that.setState({
                    page:{},
                    accountId:getData.astQueueInfoDTO?getData.astQueueInfoDTO.accountId:"",
                    searchResult:getData,
                    _stepsMsg_reload:"load"
                })
                _that.initAcount();
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        })
    }
    // 点击搜索或者下一条时清空搜索条件、文件识别信息、步骤显示信息 点击搜索按钮时search为false
    resetMsg(search){
        if(search){
            $(".astTop .phoneNo").val("");
            $(".astTop .astId").val("");
            $(".astTop .acountId").val("");
            $(".astTop .name").val("");
        }

        $(".stepTie li").removeClass("on");
        $(".stepTie li:eq(0)").addClass("on");
        $(".ast-content-box .ast-content").addClass("hidden");
        $(".ast-content-box .ast-content:eq(0)").removeClass("hidden");

        $(".ast-content-box .ast-msg .btn-white").removeClass("reup-file").addClass("up-file");
        $(".ast-content-box .ast-msg .btn-white").find(".upfiletext").text("");
        $(".ast-content-box input").val("");
        $(".ast-content-box select option").removeProp("selected");
        $(".ast-content-box select option[0]").prop("selected","true");
    }
    //搜索下一条
    nextAstQueue(){
        var _that=this;
        this.resetMsg();
        let resource=this.props.location.query?this.props.location.query.resource:'';
        let parem='';
        if(resource){
            parem={resource:'ast_insurance'}
        };
        $.ajax({
            type:"get",
            url:"/node/nextAstQueue",
            async:true,
            dataType: "JSON",
            data:parem,
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);       
             },
            success:function(res) {
                $("#loading").remove();
                commonJs.ajaxGetCode(res);
                var getData = res.data;
                if(!getData.executed){
                    _that.setState({
                        page:{},
                        searchResult:{},
                        accountId:"",
                        _userMsg_reload:"load",
                        _stepsMsg_reload:"load"
                    })
                    return;
                }
                _that.setState({
                    page:{},
                    accountId:getData.astQueueInfoDTO?getData.astQueueInfoDTO.accountId:"",
                    searchResult:getData,
                    _userMsg_reload:"load",
                    _stepsMsg_reload:"load",
                })
                _that.initAcount();
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        })
    }
        
    //获取跟进时间
    selectTime(value, dateString) {
        $(".astQueue .followUpTime").attr("data-time",dateString);
    }
    //保存ast
    saveAstQueue(event){
        let _that=this;
        let $this=$(event.target);
        let $parent=$this.closest(".astQueue");
        let astQueueInfoDTO=this.state.searchResult.astQueueInfoDTO;

        let _data={};
        _data.ast1Id=astQueueInfoDTO.id;
        _data.accountId=this.state.accountId;
        _data.page=astQueueInfoDTO.page;
        _data.customerId=astQueueInfoDTO.customerId;
        _data.registrationId=astQueueInfoDTO.registrationId;
        _data.beforeQueueStatus=astQueueInfoDTO.queueStatus;
        _data.beforeQueueStatusId=astQueueInfoDTO.queueStatusId;
        let _contactMethodId=$parent.find(".contactMethods option:selected").attr("id");      //沟通方式
        let _contactResultId=$parent.find(".contactResultsInfo option:selected").attr("id");  //沟通结果
        _data.afterQueueStatusId=$parent.find(".contactResultsInfo option:selected").attr("id");  //必传 操作后的状态
        let _withdrawOrCancelReasonId=$parent.find(".contactResultReasonsInfo option:selected").attr("id");  //原因
        let _caseContent=$parent.find(".commu-area").val();  //内容
        if(!_caseContent){
            alert("请输入详情！");
            return;
        }
        _data.caseContent=_caseContent;
        _data.primaryPhone=this.state._primaryPhone;  //电话号码

        let contactResult=$parent.find(".contactResultsInfo option:selected").attr("data-contactresult");  
        if(contactResult=="default_follow_up"){
            let followUpTime=$parent.find(".followUpTime").attr("data-time");
            if(followUpTime!=""){
                _data.scheduledTime=followUpTime;  //跟进时间
            }
        }
        if(_contactMethodId=="0"){
            alert("请选择沟通方式！");
            return;
        }else{
            _data.contactMethodId=_contactMethodId;
        }
        if(_contactResultId=="0"){
            alert("请选择沟通结果！");
            return;
        }else{
            _data.contactResultId=_contactResultId;
        }
        if((_contactResultId=="10" || _contactResultId=="11")){
            if(_withdrawOrCancelReasonId=="0"){
                alert("请选择原因！");
                return;
            }else if(_withdrawOrCancelReasonId!="0"){
                _data.withdrawOrCancelReasonId=_withdrawOrCancelReasonId;
            }
        }
        let resource=this.props.location.query?this.props.location.query.resource:'';
        if(resource){
            _data.resource='ast_insurance';
        };
        $.ajax({
            type:"post",
            url:"/node/saveAstQueue",
            async:false,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                commonJs.ajaxGetCode(res);
                var getData = res.data;
                if(getData.executed==true){
                    alert(getData.message);
                }
                let phoneNo=_that.primaryPhone;
                let searchResult=_that.state.searchResult; //搜索结果
                let astQueueInfoDTO=searchResult.astQueueInfoDTO ? searchResult.astQueueInfoDTO : {};
                let _id=astQueueInfoDTO.id?astQueueInfoDTO.id:"";
                _that.pub_search(null,_id,null,null,"RELOAD");  //重载页面
                _that.resetRecord(event);
            }
        })
    }
    //还原record界面
    resetRecord(event){
        let $this=$(event.target);
        let $parent=$this.closest(".astQueue");
        $parent.find(".contactMethods").find("select option").removeProp("selected");
        $parent.find(".contactMethods").find("select option[id='0']").prop("selected","selected");
        $parent.find(".contactResultsInfo").find("select option").removeProp("selected");
        $parent.find(".contactResultsInfo").find("select option[id='0']").prop("selected","selected");  
        $parent.find(".contactResultsInfo").find(".followUpTime").addClass("hidden");  
        $parent.find(".contactResultReasonsInfo").find("select option").removeProp("selected");
        $parent.find(".contactResultReasonsInfo").find("select option[id='0']").prop("selected","selected");   
        $parent.find(".contactresultTd").addClass("hidden");
        $parent.find(".commu-area").val("");
    }
    resionchange(event){
        let $this=$(event.target);
        let selectedVal=$this.find("option:selected").attr("data-contactresult");
        if(selectedVal=="withdraw"){  //沟通结果选择 撤回
            $(".contactresultTd").removeClass("hidden");
            $(".followUpTime").addClass("hidden");
            $(".contactresultTd option[data-contactresultid='11']").addClass("hidden");
            $(".contactresultTd option[data-contactresultid='10']").removeClass("hidden");
            $(".contactresultTd option").removeProp("selected");
            $(".contactresultTd option[id='0']").prop("selected","selected");
        }else if(selectedVal=="cancel"){  //沟通结果选择 取消
            $(".contactresultTd").removeClass("hidden");
            $(".followUpTime").addClass("hidden");
            $(".contactresultTd option[data-contactresultid='11']").removeClass("hidden");
            $(".contactresultTd option[data-contactresultid='10']").addClass("hidden");
            $(".contactresultTd option").removeProp("selected");
            $(".contactresultTd option[id='0']").prop("selected","selected");
        }else if(selectedVal=="default_follow_up"){  //沟通结果选择默认跟进
            $(".contactresultTd").addClass("hidden");
            $(".followUpTime").removeClass("hidden");
            $(".contactresultTd option").removeProp("selected");
            $(".contactresultTd option[id='0']").prop("selected","selected");
        }else{
            $(".contactresultTd").addClass("hidden");
            $(".followUpTime").addClass("hidden");
            $(".contactresultTd option").removeProp("selected");
            $(".contactresultTd option[id='0']").prop("selected","selected");
        }
    }
    /**
     * 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     */
    changeLeft(index){
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
        let thisAcountId=this.state.accountId;
        let astQueueInfoDTO=this.state.searchResult ? this.state.searchResult.astQueueInfoDTO : {};
        let left_page="";
        switch (index){
            case 0:
                left_page=<UserMsg 
                            _params={thisAcountId} 
                            _oper_type_props={this.state._userMsg_reload}
                            callbackFunc={this.callbackFunc.bind(this)}
                            _location={this.props.location.pathname}
                            get_location={this.props.location.pathname}
                            />;
                break;
            case 1:
                left_page=<Case prev_params={thisAcountId} prev_loanNumber={this.state._loanNumber} prev_registrationId={astQueueInfoDTO.registrationId} _oper_case_type="reload" _location={this.props.location.pathname} />;
                break;
            case 2:
                left_page=<File prev_userPhoneNo={this.state.userPhoneNo} prev_customerId={astQueueInfoDTO.customerId} prev_registrationId={astQueueInfoDTO.registrationId} prev_loanNumber={this.state._loanNumber} _location={this.props.location.pathname} />;
                break;
        }
        return left_page;
    }
    render() {
        let RecordsInfo =[];
        let searchResult=this.state.searchResult; //搜索结果
        let astQueueInfoDTO=searchResult.astQueueInfoDTO ? searchResult.astQueueInfoDTO : {};
        let contactMethodsInfoDTO=searchResult.contactMethodsInfoDTO ? searchResult.contactMethodsInfoDTO : []; //沟通方式
        let contactResultsInfoDTO=searchResult.contactResultsInfoDTO ? searchResult.contactResultsInfoDTO : []; //沟通结果
        let contactResultReasonsInfoDTO=searchResult.contactResultReasonsInfoDTO ? searchResult.contactResultReasonsInfoDTO : []; //原因
        let _queueStatusId=astQueueInfoDTO.queueStatusId;
        let isQueueShow=(_queueStatusId==4||_queueStatusId==6||_queueStatusId==7||_queueStatusId==8||_queueStatusId==10);
        let astQueueRecordInfoDTOS=searchResult.astQueueRecordInfoDTOS ? searchResult.astQueueRecordInfoDTOS : [];  //queue展示数据

        let pageType=(this.state.page && this.state.page.value>=4);
        return (
            <div className="content" id="content">
                <div className="top astTop">
                    <div className="clearfix" data-isresetdiv="yes">
                        <input type="text" name="" placeholder="手机号" className="input left mr15 mt20 phoneNo input_w" id='phoneNo' onBlur={verifyJs.verify("cellPhone","allowNull","isNaN","手机号码")} />
                        <input type="text" name="" placeholder="astID" className="input left mr15 mt20 astId input_w" id='astId' />
                        <input type="text" name="" placeholder="Portal 账号" className="input left mr15 mt20 acountId input_w" id='acountId' />
                        <input type="text" name="" placeholder="姓名" className="input left mr15 mt20 name input_w" id='name' />
                        
                        <button className="left mr15 mt20 btn-white getCQ-btn" id='searchBtn' onClick={this.search.bind(this)}>搜索</button>
                        <button className="left mr15 mt20 btn-blue search-next" id='searchNextBtn' onClick={this.nextAstQueue.bind(this)}>查询下一条</button>
                        <button className="left mt20 btn-white" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                    </div>
                    <div className="clearfix mt10" style={{"height":"22px"}}>
                        <div className="topBundleCounts">
                            <b className="left mr20">所有未绑定<span className="deep-yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(this.state.astAcounts.allUnhandled)}</span>条</b>
                            <b className="left mr20">我的绑定<span className="yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(this.state.astAcounts.selfHandled)}</span>条</b>
                            <b className="left mr20">今日须跟进<span className="light-blue-font mr10 ml10 arail">{commonJs.is_obj_exist(this.state.astAcounts.todayNeedFollow)}</span>条</b>
                            <b className="left mr20">今日共完成<span className="blue-font mr10 ml10 arail">{commonJs.is_obj_exist(this.state.astAcounts.todayCompleteAll)}</span>条</b>
                        </div>
                    </div>
                </div>
                
                <div className="mt20 clearfix">
                    <div className="left cont-left content-toggle">
                        <div className="bar clearfix">                            
                            <dl className="astMsg left">
                                <dt>当前步骤：</dt>
                                <dd>{commonJs.is_obj_exist(this.state.page.displayName)}</dd>
                                <dt>渠道来源</dt>
                                <dd>{commonJs.is_obj_exist(astQueueInfoDTO.channel)}</dd>
                                <dt>数据来源</dt>
                                <dd>{commonJs.is_obj_exist(astQueueInfoDTO.resource)}</dd>
                                <dt>astID</dt>
                                <dd className="blue-font">{commonJs.is_obj_exist(astQueueInfoDTO.id)}</dd>
                                <dt>PortalID</dt>
                                <dd className="blue-font">{commonJs.is_obj_exist(this.state.accountId)}</dd>
                            </dl>
                        </div>
                        <div className="changeMount">
                            {pageType ? 
                                <div className="mt5">
                                    <div className="bar title-box Csearch-left-page clearfix relative">
                                        <i className="auto-box-shade Cs-auto-box-shade"></i>
                                        <ul className="left ml10 mt5 nav">
                                            <li className="on" data-id="0" onClick={this.changeLeft.bind(this,0,null)} data-btn-rule="RULE:DETAIL:USERINFO:DIV">账户详情</li>
                                            <li data-id="1" onClick={this.changeLeft.bind(this,1,null)} data-btn-rule="RULE:DETAIL:CASE:TOP">案例</li>
                                            <li data-id="2" onClick={this.changeLeft.bind(this,2,null)} data-btn-rule="RULE:DETAIL:FILE:TOP">附件</li>
                                        </ul>
                                        {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={commonJs.all_content_toggle.bind(this)}></i> */}
                                    </div>
                                    {this.state.lef_page}
                                </div>
                                :
                                <AstSteps 
                                    _registrationId={astQueueInfoDTO.registrationId?astQueueInfoDTO.registrationId:""} 
                                    _stepsMsg_reload={this.state._stepsMsg_reload} 
                                    _stepsCallBack={this.stepsCallBack.bind(this)} 
                                    _location={this.props.location.pathname}
                                />}
                        </div>
                    </div>
                    <div className="right cont-right content-toggle">
                        <div className="bar title-box clearfix">
                            <h2 className="tit-font-on ml10">Record</h2> 
                        </div>
                        <div className="auto-box">
                            <table className={isQueueShow ? "radius-tab mt20 astQueue hidden" : "radius-tab mt20 astQueue"}>
                                <tbody>
                                    <tr>
                                        <th width="25%">沟通方式</th>
                                        <th width="10%">状态</th>
                                        <th width="40%">沟通结果</th>
                                        <th width="25%" className="contactresultTd hidden">原因</th>
                                        <th></th>
                                    </tr>
                                    <tr>
                                        <td className="contactMethods">
                                            <select name="" id="contactMethods" className="select-gray" style={{"width":"90%"}}>
                                                <option id="0" data-contactMethod="" hidden>请选择</option>
                                                {
                                                    contactMethodsInfoDTO.length>0 ? contactMethodsInfoDTO.map((repy,i)=>{
                                                        return <option id={repy.id} data-contactMethod={repy.contactMethod} key={i}>{commonJs.is_obj_exist(repy.contactMethodChinese)}</option>
                                                    }):<option id="" data-contactMethod="">请选择</option>
                                                }
                                            </select>
                                        </td>
                                        <td className="queueStatu" data-queueStatusId={astQueueInfoDTO.queueStatusId?astQueueInfoDTO.queueStatusId:""} data-queueStatus={astQueueInfoDTO.queueStatus ? astQueueInfoDTO.queueStatus : ""}>{commonJs.is_obj_exist(astQueueInfoDTO.queueStatus)}</td>
                                        <td className="contactResultsInfo">
                                            <select name="" id="contactResultsInfo" className="select-gray mr5 left" style={{"display":"inline-block"}} onChange={this.resionchange.bind(this)}>
                                                <option id="0" data-contactResult="" data-queueStatusId="" hidden>请选择</option>
                                                {
                                                    contactResultsInfoDTO.length>0 ? contactResultsInfoDTO.map((repy,i)=>{
                                                        return <option id={repy.id} data-contactResult={repy.contactResult} data-queueStatusId={repy.queueStatusId} key={i}>{commonJs.is_obj_exist(repy.contactResultChinese)}</option>
                                                    }):<option id="" data-contactResult="" data-queueStatusId="">请选择</option>
                                                }
                                            </select>
                                            <div className="followUpTime left hidden" data-time="">
                                                <DatePicker format="YYYY-MM-DD HH:mm:ss" onChange={this.selectTime.bind(this)} disabledDate={disabledDate} showTime />
                                            </div>
                                        </td>
                                        <td className="contactResultReasonsInfo contactresultTd hidden">
                                            <select name="" id="contactresultTd" className="select-gray" style={{"width":"90%"}}>
                                                <option id="0" data-contactResultId="" data-queueType="" hidden>请选择</option>
                                                {
                                                    contactResultReasonsInfoDTO.length>0 ? contactResultReasonsInfoDTO.map((repy,i)=>{
                                                        if(repy.contactResultId!=1){
                                                            return <option id={repy.id} data-contactResultId={repy.contactResultId} data-queueType={repy.queueType} key={i}>{commonJs.is_obj_exist(repy.contactResultReason)}</option>
                                                        }
                                                    }):<option id="" data-contactResultId="" data-queueType="">请选择</option>
                                                }
                                            </select>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5">
                                            <span className="detail-t">详情</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5">
                                            <textarea name="" id="detail" cols="30" rows="10" className="commu-area textarea"></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="4">
                                            <button className="left block ml20 btn-blue" id='saveAstQueue' onClick={this.saveAstQueue.bind(this)}>保存</button>
                                            <button className="btn-white left block ml20" id='resetRecord' onClick={this.resetRecord.bind(this)}>取消</button>
                                            <button className="btn-white block ml20 left" id='showSendMsg' onClick={this.showSendMsg.bind(this)}><i className="send-msg-icon"></i>发送短信</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className="pt-table mt10 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                <tbody>
                                    <tr>
                                        <th width="15%">沟通方式</th>
                                        <th width="20%">状态</th>
                                        <th width="20%">处理状态</th>
                                        <th width="20%">处理原因</th>
                                        <th width="25%"></th>
                                    </tr>
                                    {
                                        astQueueRecordInfoDTOS.length>0 ? astQueueRecordInfoDTOS.map((repy,index)=>{
                                            return <tr key={index}>
                                                <td colSpan="5" className="no-padding-left">
                                                    <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                        <tbody>
                                                            <tr>
                                                                <td width="15%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                                <td width="20%" title={commonJs.is_obj_exist(repy.beforeQueueStatus)}>{commonJs.is_obj_exist(repy.beforeQueueStatus)}</td>
                                                                <td width="20%" title={commonJs.is_obj_exist(repy.afterQueueStatus)+commonJs.is_obj_exist(repy.followTime)}>
                                                                    {commonJs.is_obj_exist(repy.afterQueueStatus)}
                                                                    <br />
                                                                    {commonJs.is_obj_exist(repy.followTime)}
                                                                </td>
                                                                <td width="20%" title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                                                <td width="25%">
                                                                    <div className="ext-source-tip word-break" title={commonJs.is_obj_exist(repy.createdBy)+commonJs.is_obj_exist(repy.createdAt)}>
                                                                        {commonJs.is_obj_exist(repy.createdBy)} <br/>{commonJs.is_obj_exist(repy.createdAt)}
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
                                            }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/*发送短信弹窗*/}
                <SendMessage templateEnumType={this.props.location.pathname} _userPhoneNo={this.state._primaryPhone} sendToUrl="/common/sendSMS" msgMode={this.state.msgTypeList} />
            </div>
        )
    }
};

export default AstIndex;  //ES6语法，导出模块

function disabledDate(current) {
        // can not select days before today and today
        return current && current.valueOf() < Date.now()-86400;
}