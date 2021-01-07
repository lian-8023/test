// 公司搜索=>公司搜索
import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import OutsideSearchList from './OutsideSearchList';
import Communication_select from '../module/Communication_select';
import WebSearch from '../module/WebSearch';  //网络搜索

class CpySearch extends React.Component {
    constructor(props){
        super(props);
        this.state={
            CpyData:"",   //页面数据
            selectdArray:[],//审核结论选中数据
            change_loanNumber_acount: "",
            change_loanNumber_loanNumber: "",
            conditionParam:{},
            user_workInfo_company:this.props._workInfo_company, //数据来源-单位名称
            tyurl:"http://www.tianyancha.com/search",  //天眼查精确查询调整路径
            networkSearchInfo:{},
            allPhoneNo:this.props.allPhoneNo
        }
    }

    UNSAFE_componentWillMount (){
        this.setState({
            conditionParam:{
                _acount:this.props._acount,
                _loanNumber:this.props._loanNumber
            }},()=>{
            this.getMsg("RELOAD",true);
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps==this.props){
            return;
        }
        var _oper_type = nextProps._oper_type_props;
        if(_oper_type=="search"){
            this.setState({
                CpyData:{},
                user_workInfo_company:nextProps._workInfo_company, //数据来源-单位名称
                conditionParam:nextProps,
            },()=>{
                this.getMsg("SEARCH",true);
            });
        }else if(_oper_type=="next"){
            this.outSearchMsg(nextProps._cpy_Q_ajax.companySearchRecordsInfoDTO);
            this.setState({
                CpyData:nextProps._cpy_Q_ajax,
                user_workInfo_company:nextProps._workInfo_company, //数据来源-单位名称
                selectdArray:[],
                _selected:[],
                conditionParam:{
                    _phoneNo:{},
                    _acount:nextProps._cpy_Q_ajax.companySearchQueueInfoDTO?nextProps._cpy_Q_ajax.companySearchQueueInfoDTO.accountId:"",
                    _loanNumber:nextProps._cpy_Q_ajax.companySearchQueueInfoDTO?nextProps._cpy_Q_ajax.companySearchQueueInfoDTO.loanNumber:""
                 }
            },()=>{
                $(".customSelect-ul .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                $(".SoureCpy-inp").val(commonJs.is_obj_exist(this.state.user_workInfo_company));
            });
        }else if(_oper_type=="change_loanNumber"){
             this.setState({
                 change_loanNumber_acount: nextProps._acount,
                 change_loanNumber_loanNumber: nextProps._loanNumber,
            },()=>{
                $(".SoureCpy-inp").val(commonJs.is_obj_exist(this.state.user_workInfo_company));
                this.pub_getCpyMsg(this.state.change_loanNumber_acount,this.state.change_loanNumber_loanNumber,"SEARCH",true);
            });
        }
        this.setState({
            allPhoneNo:nextProps.allPhoneNo
        })
        this.initCount();
    }
    componentDidMount(){
        this.initCount();
        $(".topBundleCounts").removeClass("hidden");
        $(".fraudCounts").addClass("hidden");
        var params_rigPage=this.props._params_rigPage;
        if(params_rigPage!="CpySearch"){
            $(".CPS-edit-div").addClass("hidden");
        }else {
            $(".CPS-edit-div").removeClass("hidden");
        }

        if(this.props._params_rigPage!="reminder" && this.props._params_rigPage!="collection"){
            var h = document.documentElement.clientHeight;
            $(".auto-box").css("height", h - 200);
        }        

        //点击页面隐藏 审核结论 弹窗
        $(document).bind('click',function(e){ 
            var e = e || window.event; //浏览器兼容性 
            var elem = e.target || e.srcElement; 
            while (elem) { //循环判断至跟节点，防止点击的是div子元素 
                if (elem.id && elem.id=='customSelect-ul') { 
                    return; 
                } 
                if($(elem).closest(".customSelect").length>0){
                    return;
                }
            elem = elem.parentNode; 
            } 
            $("#customSelect-ul").addClass("hidden");
            $("#customSelect-icon").removeClass("cs-icon-on");
        }); 
    }
    
    /**
     * 循环数组获取外部查询展示信息
     * @param {*} dataArray 后端给的外部查询信息数组
     */
    outSearchMsg(dataArray){
        if(dataArray){
            let outSearchCont="";
            for(let i=0;i<dataArray.length;i++){
                let dataArray_i=dataArray[i];
                if(dataArray_i.dataFrom=="大蜂"){
                    outSearchCont=dataArray_i
                }
            }
            let o_registerNumber=commonJs.is_obj_exist(outSearchCont.registerNumber);
            $(".registerNumber").text(o_registerNumber).attr("title",o_registerNumber);
            let o_companyRegisterStatus=commonJs.is_obj_exist(outSearchCont.companyRegisterStatus);
            $(".companyRegisterStatus").text(o_companyRegisterStatus).attr("title",o_companyRegisterStatus);
            let o_companyRegisterTime=commonJs.is_obj_exist(outSearchCont.companyRegisterTime);
            $(".companyRegisterTime").text(o_companyRegisterTime).attr("title",o_companyRegisterTime);
            let o_corporation=commonJs.is_obj_exist(outSearchCont.corporation);
            $(".corporation").text(o_corporation).attr("title",o_corporation);
            let o_companyRegisterAddress=commonJs.is_obj_exist(outSearchCont.companyRegisterAddress);
            $(".companyRegisterAddress").text(o_companyRegisterAddress).attr("title",o_companyRegisterAddress);
            let o_companyPhone=commonJs.is_obj_exist(outSearchCont.companyPhone);
            $(".companyPhone").text(o_companyPhone).attr("title",o_companyPhone);
            let o_companyName=commonJs.is_obj_exist(outSearchCont.companyName);
            $(".SoureCpy-inp").val(o_companyName);
        }else{
            $(".registerNumber").text(commonJs.is_obj_exist("")).attr("title","");
            $(".companyRegisterStatus").text(commonJs.is_obj_exist("")).attr("title","");
            $(".companyRegisterTime").text(commonJs.is_obj_exist("")).attr("title","");
            $(".corporation").text(commonJs.is_obj_exist("")).attr("title","");
            $(".companyRegisterAddress").text(commonJs.is_obj_exist("")).attr("title","");
            $(".companyPhone").text(commonJs.is_obj_exist("")).attr("title","");
            $(".SoureCpy-inp").val(commonJs.is_obj_exist(this.state.user_workInfo_company)).attr("title","");
        }
    }
   
    //保存公司搜索queue操作记录
    saveQsearchNotes(event){
        let _that=this;
        let $this=$(event.target);
        let _afterQueueStatusId=$(".contactResultsInfo .commu-select option:selected").attr("id");
        if(!_afterQueueStatusId || typeof(_afterQueueStatusId)=="undefined"){
            alert("处理状态为必填项！");
            return;
        }
        let _contactMethodId=$(".contactMethods .commu-select option:selected").attr("id");
        if(!_contactMethodId || _contactMethodId=="0"){
            alert("请选择沟通方式!");
            return;
        }
        let _beforeQueueStatusId=$(".queueStatu").attr("data-queueStatusId");
        let _beforeOperateStatus=$(".queueStatu").attr("data-queueStatus");
        let _caseContent=$(".cpyQdetail").val();
        let checkResultIds_selected=[]; //选择的审核结论
        $(".queueCheckResultsInfoDTOS .customSelect-ul li").each(function(){
            let this_cbox=$(this).find(".myCheckbox");
            let this_id=$(this).find("span").attr("id");
            if(this_cbox.hasClass("myCheckbox-visited")){
                checkResultIds_selected.push(this_id)
            }
        })
        if(checkResultIds_selected.length<=0){
            alert("请选择审核结论！");
            return;
        }

        var _data={};
        _data={
            accountId:_that.state.CpyData.companySearchQueueInfoDTO.accountId,
            afterQueueStatusId:_afterQueueStatusId,   //操作后状态ID --处理状态id
            beforeQueueStatusId:_beforeQueueStatusId,  //操作前状态ID -- companySearchQueueInfoDTO.queueStatusId
            caseContent:_caseContent,  //内容-详情
            contactMethodId:_contactMethodId?_contactMethodId:0,  //沟通方式--沟通方式 id
            loanNumber:_that.state.CpyData.companySearchQueueInfoDTO.loanNumber,
            beforeOperateStatus:_beforeOperateStatus,  //操作之前的状态中文 -- companySearchQueueInfoDTO.queueStatus
            checkResultIds:checkResultIds_selected,  //审核结论
        }
        let followUpTime_attr=$this.closest("table").find(".contactResultsInfo_time option:selected").attr("data-contactresult");
        let _scheduledTime=$(".contactResultsInfo_time").attr("data-time");  //跟进时间--当处理状态选择 跟进时 获取时间
        if(followUpTime_attr=="default_follow_up"){
            if(_scheduledTime!=""){
                _data.scheduledTime=_scheduledTime;  //	跟进时间--当处理状态选择 跟进时 获取时间 ps：用户没选则不传字段
            }
            // if(_scheduledTime!=""){
            //     _data.scheduledTime=_scheduledTime  //	跟进时间--当处理状态选择 跟进时 获取时间 ps：用户没选则不传字段
            // }else{
            //     alert("请选择跟进时间！");
            //     return;
            // }
        }else{
            let _contactResultId=$(".contactResultReasonsInfo .commu-select option:selected").attr("id");
            if(!_contactResultId||_contactResultId==""||_contactResultId=="0"){
                alert("请选择原因");
                return;
            }
            _data.contactResultId=_contactResultId?_contactResultId:0;  //结果 -- 处理原因 id
            _data.withdrawOrCancelReasonId=_contactResultId?_contactResultId:0;  //拒绝原因ID
        }
        if(_afterQueueStatusId==0 && _contactMethodId==0){
            alert("请输入需要保存的内容！");
            return;
        }
        $.ajax({
            type:"get",
            url:"/companySearch/saveCompanyQueueRecord",
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
                _that.setState({
                    _selected:[],
                    selectdArray:[]
                })
                $(".customSelect-ul .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            }
        })
    }
    
    initCount(){
         var _that=this;
         $.ajax({
            type:"get",
            url:"/companySearch/getCompanySearchCount",
            async:true,
            dataType: "JSON",
            success:function(res) {
                let _getData = res.data;
                if(!_getData.executed){
                    console.log("公司搜索数据处理情况 获取数据 失败");
                    return;
                }
                if(_that.props._topBindNumber_fn){
                    _that.props._topBindNumber_fn(_getData);
                }
            }
        })
    }
    /**
     * 搜索
     * @param {*} operType 后端需要的获取数据类型
     */
    getMsg(operType){
         var _phone=this.state.conditionParam._phoneNo;
         var _accountId=this.state.conditionParam._acount;
         var _loanNumber=this.state.conditionParam._loanNumber;
        this.pub_getCpyMsg(_accountId,_loanNumber,operType);
     }
    // 根据合同号查询公司搜索queue -- 保存时调用此方法更新UI
    pub_getCpyMsg(_accountId,_loanNumber,operType){
        var _that=this;
        commonJs.cancelSaveQ(); //初始化queue操作框
        $(".SoureCpy-inp").val(commonJs.is_obj_exist(this.state.user_workInfo_company));
        if(typeof(_loanNumber)=="undefined"|| _loanNumber==""){
            return;
        }
        $.ajax({
            type:"get",
            url:"/companySearch/searchCompanyQByLoanNumber",
            async:false,
            dataType: "JSON",
            data:{
                accountId:_accountId,
                loanNumber:_loanNumber,
                queueReloadEnum:operType,
            },
            success:function(res) {
                commonJs.ajaxGetCode(res);
                var _getData = res.data;
                if(!_getData.executed){
                    _that.setState({
                        CpyData:{}
                    });
                    return;
                }
                _that.outSearchMsg(_getData.companySearchRecordsInfoDTO);
                if(_getData.status=="blind"){
                    alert("当前queue已被"+_getData.user+"绑定！");
                }
                _that.setState({
                    CpyData:_getData,
                })
                // _that.initCount();
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
        $(".followUpTime").addClass("hidden");
        $(".contactResultReasonsInfo,.checkResult").addClass("hidden");
        $(".contactResultsInfo_time .commu-select").css("width","95%");
        if(status_value=="default_follow_up"){   //设置跟进时间-显示时间控件
            $(".contactResultsInfo_time .commu-select").css("width","40%");
            $(".followUpTime").removeClass("hidden");
        }else if(status_value=="complete"){ 
            $(".contactResultReasonsInfo,.checkResult").removeClass("hidden");
        }
    }
    // 审核结论获取焦点
    selectTriger(event){
        let $this=$(event.target);
        let $parent=$this.closest(".customSelect");
        let $ul=$parent.find(".customSelect-ul");
        let $icon=$parent.find(".cs-icon");
        if($ul.hasClass("hidden")){
            $ul.removeClass("hidden");
            $icon.addClass("cs-icon-on");
        }else{
            $ul.addClass("hidden");
            $icon.removeClass("cs-icon-on");
        }
    }
    //审核结论选择li
    selectedLi(event){
        let $this=$(event.target);
        let _selectdArray=this.state.selectdArray;
        let thisText=$this.parent().find("span").text();
        
        if($this.hasClass("myCheckbox-normal")){
            $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            _selectdArray.push(thisText);
            this.setState({
                selectdArray:_selectdArray,
                _selected:_selectdArray.join(",")
            })
        }else{
            $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            let index =_selectdArray.indexOf(thisText);
            if (index > -1) {
                _selectdArray.splice(index, 1);
            }
            this.setState({
                selectdArray:_selectdArray,
                _selected:_selectdArray.join(",")
            })
        }
    }
    
    render() {
        let CpyDatas=this.state.CpyData?this.state.CpyData:{};  //页面数据
        let communications=(CpyDatas && CpyDatas.contactMethodsInfoDTO); //沟通方式 组件需要数据 array
        let contactResults=(CpyDatas && CpyDatas.contactResultsInfoDTO); //处理状态数据 组件需要数据 array
        let dealReasons=(CpyDatas && CpyDatas.contactResultReasonsInfoDTO); //处理原因组件 需要数据 array
        let queueCheckResultsInfoDTOS=(CpyDatas && CpyDatas.queueCheckResultsInfoDTOS); //审核结论 需要数据 array
        let companySearchQueueInfoDTO=CpyDatas.companySearchQueueInfoDTO?CpyDatas.companySearchQueueInfoDTO:{}
        let outSearchCont={}; //外部查询列表信息
        if(CpyDatas && CpyDatas.companySearchRecordsInfoDTO){
            outSearchCont=CpyDatas.companySearchRecordsInfoDTO;
        }
        let RecordsInfo=""; //公司搜索queue记录
        if(CpyDatas && CpyDatas.companySearchQueueRecordsInfoDTO){
            RecordsInfo=CpyDatas.companySearchQueueRecordsInfoDTO;
        }
        
        let _queueStatusId,_queueStatus;
        if(CpyDatas && CpyDatas.companySearchQueueInfoDTO && typeof(CpyDatas.companySearchQueueInfoDTO)!="undefined"){
            _queueStatusId=CpyDatas.companySearchQueueInfoDTO.queueStatusId;
            _queueStatus=CpyDatas.companySearchQueueInfoDTO.queueStatus;
        }
        //分析当前记录是否被其他人绑定，即status=blind标识被绑定了，则只能查看不能操作
        let blind_status = CpyDatas.status;
        let isHideOper = (blind_status=="blind"||_queueStatusId==4||_queueStatusId==6||_queueStatusId==7||_queueStatusId==8||_queueStatusId==10);
        return (
            <div className="auto-box pr5">
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit on" onClick={commonJs.content_toggle.bind(this)}>
                        外部查询
                        <span className="pl20">simpleTest：{commonJs.is_obj_exist(companySearchQueueInfoDTO?companySearchQueueInfoDTO.simpleTest:"")}</span>
                        {
                            companySearchQueueInfoDTO.result=="LP_Decline"?
                            <span className="pl20">LP_Decline</span>
                            :""
                        }
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <OutsideSearchList 
                        queueStatusId={commonJs.is_obj_exist(_queueStatusId)} 
                        _accountId={commonJs.is_obj_exist(companySearchQueueInfoDTO.accountId)}
                        _loanNumber={commonJs.is_obj_exist(companySearchQueueInfoDTO.loanNumber)}
                        _customerId={commonJs.is_obj_exist(companySearchQueueInfoDTO.customerId)}
                        _user_workInfo_company={this.state.user_workInfo_company}
                         />
                </div>
                <WebSearch loanNumber={this.props._loanNumber} defaultCondition={this.state.user_workInfo_company} allPhoneNo={this.state.allPhoneNo} />
                <table className={isHideOper?"radius-tab mt10 CPS-edit-div QrecordInfo flow-auto bind_hidden hidden":"radius-tab mt10 CPS-edit-div QrecordInfo flow-auto"} cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                        <tr>
                            <th width="20%">沟通方式</th>
                            <th width="10%">状态</th>
                            <th width="20%">处理状态</th>
                            <th width="20%" className="hidden contactResultReasonsInfo">处理原因</th>
                            <th width="20%"><span className="checkResult hidden">审核结论</span></th>
                        </tr>
                        <tr>
                            <td className="contactMethods">
                                {
                                    communications ? <Communication_select _communications={CpyDatas.contactMethodsInfoDTO} type="communications_select" />: <select name="" id="" className="select-gray" disabled><option value="">请选择</option></select>
                                }
                            </td>
                            <td className="queueStatu" data-queueStatusId={_queueStatusId?_queueStatusId:""} data-queueStatus={_queueStatus?_queueStatus:""}>{_queueStatus}</td>
                            <td className="contactResultsInfo">
                                {
                                    contactResults ? <Communication_select  _turnStatus={this.turnStatus.bind(this)} _contactResults={CpyDatas.contactResultsInfoDTO} type="contactResults_select" />:<select name="" id="" className="select-gray" disabled><option value="">请选择</option></select>
                                }
                            </td>
                            <td className="hidden contactResultReasonsInfo">
                                {
                                    dealReasons?<Communication_select _dealReasons={CpyDatas.contactResultReasonsInfoDTO} type="dealReason_select" />:<select name="" id="" className="select-gray" disabled><option value="">请选择</option></select>
                                }
                            </td>
                            <td className="queueCheckResultsInfoDTOS">
                                <div className="customSelect clearfix left relative checkResult hidden">
                                    <input type="text" className="left cs-inp" value={this.state._selected} placeholder="请选择" onClick={this.selectTriger.bind(this)}/>
                                    <i className="right cs-icon" id="customSelect-icon"></i>
                                    <div className="cleavr"></div>
                                    <ul className="customSelect-ul absolute hidden" id="customSelect-ul">
                                        {
                                            (queueCheckResultsInfoDTOS && queueCheckResultsInfoDTOS.length>0) ? queueCheckResultsInfoDTOS.map((repy,i)=>{
                                                return <li key={i}>
                                                            <span className="left"  id={commonJs.is_obj_exist(repy.id)} data-type={commonJs.is_obj_exist(repy.type)}>{commonJs.is_obj_exist(repy.result)}</span>
                                                            <i className="myCheckbox myCheckbox-normal right mr3" onClick={this.selectedLi.bind(this)}></i>
                                                        </li>
                                            }):<li></li>
                                        }
                                    </ul>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="5">
                                <span className="detail-t">详情</span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="5">
                                <textarea name="" id="" cols="30" rows="10" className="commu-area textarea cpyQdetail"></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="5">
                                <button className="left block ml20 btn-blue" onClick={this.saveQsearchNotes.bind(this)}>保存</button>
                                <button className="btn-white left block ml20" onClick={commonJs.cancelSaveQ.bind(this)}>取消</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table className="pt-table mt10 commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                        <tr>
                            <th width="15%">沟通方式</th>
                            <th width="10%">状态</th>
                            <th width="20%">处理状态</th>
                            <th width="20%">处理原因</th>
                            <th width="15%">审核结论</th>
                            <th width="20%"></th>
                        </tr>
                        {
                            RecordsInfo ? RecordsInfo.map((repy,index)=>{
                                return <tr key={index}>
                                    <td colSpan="6" className="no-padding-left">
                                        <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                            <tbody>
                                                <tr>
                                                    <td width="15%" title={commonJs.is_obj_exist(repy.contactMethod)}>{commonJs.is_obj_exist(repy.contactMethod)}</td>
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.beforeQueueStatus)}>{commonJs.is_obj_exist(repy.beforeQueueStatus)}</td>
                                                    <td width="20%" title={commonJs.is_obj_exist(repy.afterQueueStatus)}>{commonJs.is_obj_exist(repy.afterQueueStatus)}</td>
                                                    <td width="20%" title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                                    <td width="15%" title={commonJs.is_obj_exist(repy.checkResult)}>{commonJs.is_obj_exist(repy.checkResult)}</td>
                                                    <td width="20%">
                                                        <div className="ext-source-tip word-break" title={commonJs.is_obj_exist(repy.createdBy)+commonJs.is_obj_exist(repy.createdAt)}>
                                                            {commonJs.is_obj_exist(repy.createdBy)} <br/>{commonJs.is_obj_exist(repy.createdAt)}
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="6" className="short-border-td">
                                                        <div className="short-border"></div>
                                                        <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                }):<tr><td colSpan="6" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                    </tbody>
                </table>
            </div>
        )
    }
}
;

export default CpySearch;