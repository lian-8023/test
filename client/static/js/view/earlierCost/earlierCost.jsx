// 服务费
import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import Communication_select from '../module/Communication_select';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;

class EarlierCost extends React.Component {
    constructor(props){
        super(props);
        this.state={
            coltnData:{},
            reasonSubs:[],
            _acount: this.props._acount,
            _loanNumber: this.props._loanNumber,
            _ownerId:this.props._ownerId, //任务所有者
            _communicateName:this.props._communicateName,  //电话详情界面回传的沟通姓名
            _newPhoneNo:this.props._newPhoneNo,  //电话详情回传的新号码记录
            allPhoneNo:this.props.allPhoneNo, 
            customerId:this.props.customerId
        }
    }

    UNSAFE_componentWillMount (){
        this.setState({
            _acount:this.props._acount,
            _loanNumber:this.props._loanNumber,
        },()=>{
            this.getMsg("RELOAD",true);
        });
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        var _oper_type = nextProps._oper_type_props;
        if(_oper_type=="search"){
            this.setState({
                coltnData: {},
                _acount: nextProps._acount,
                _loanNumber: nextProps._loanNumber
                },()=>{
                    this.getMsg("SEARCH",true,true);
                });
        }else if(_oper_type=="next"){
            this.setState({
                coltnData: {},
                _acount: "",
                _loanNumber: "",
            })
            if(nextProps._coltn_Q_ajax) {
                this.setState({
                    coltnData: nextProps._coltn_Q_ajax,
                    _acount: nextProps._coltn_Q_ajax.accountId,
                    _loanNumber: nextProps._loanNumber,
                    _clickNextNumber:nextProps._clickNextNumber
                });
            }
            this.initCount();
        }else if(_oper_type=="getPhoneList"){
            this.setState({
                _communicateName:nextProps._communicateName,
                _newPhoneNo:nextProps._newPhoneNo
            });
            this.initCount();
        }
        this.setState({
            _ownerId:nextProps._ownerId,
            allPhoneNo:nextProps.allPhoneNo,
            customerId:nextProps.customerId
        })
    }

    componentDidMount(){
        $(".topBundleCounts").removeClass("hidden");
        var h = document.documentElement.clientHeight;

        let params_rigPage=this.props._params_rigPage;
        if(params_rigPage!="LP"){
            $(".LP-edit-div").addClass("hidden");
        }else {
            $(".LP-edit-div").removeClass("hidden");
        }

        $(".contactResultsInfo select").change(function(){
            let _attr=$(this).find("option:selected").attr("data-name");
            if(_attr=="SET_TIME_FOLLOW_UP"){
                $(".followUpTime").removeClass("hidden");
                $(".COMMITMENT_REPAY_TIME").addClass("hidden");
                return;
            }
            if(_attr=="COMMITMENT_REPAY"){
                $(".followUpTime").addClass("hidden");
                $(".COMMITMENT_REPAY_TIME").removeClass("hidden");
                return;
            }
            $(".followUpTime,.COMMITMENT_REPAY_TIME").addClass("hidden");
        })
        this.initCount();
    }
    //组件将被卸载  
  componentWillUnmount(){ 
        //重写组件的setState方法，直接返回空
        this.setState = (state,callback)=>{
        return;
        };  
    }
    initCount(){
        //获取枚举初始值
        let _that=this;
        let feeTypeObj={}
        if(this.props.feeType){
            feeTypeObj={feeType:this.props.feeType}
        }
        $.ajax({
            type:"get",
            url:"/RemColt/getUpfrontFeeInitEnum",
            async:true,
            data:feeTypeObj,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                } 
                let _getData=res.data;
                let processStatusList=_getData?_getData.processStatusList:[];  //处理状态
                let new_processStatusList=[];  //record 处理状态列表 
                for(let i=0;i<processStatusList.length;i++){
                    if(processStatusList[i].name!="NEW_ADD"){
                        new_processStatusList.push(processStatusList[i]);
                    }
                }
                _that.setState({
                    initialData:_getData,
                    new_processStatusList:new_processStatusList
                })
                _that.props._topBindNumber_fn(_getData);
            }
        })
    }
    getMsg(operType,shouldAlert){
        var _accountId=this.state._acount;
        var _loanNumber=this.state._loanNumber;
        this.pub_getMsg(_accountId,_loanNumber,operType,shouldAlert);
    }
    //获取页面数据
    pub_getMsg(_accountId,_loanNumber,operType,shouldAlert){
        let _that=this;
        commonJs.cancelSaveQ(); //初始化queue操作框
        if(typeof(_loanNumber)=="undefined"|| _loanNumber==""){
            return;
        }
        $.ajax({
            type: "get",
            url: "/RemColt/getUpfrontFeeDetail",
            async: true,
            dataType: "JSON",
            data: {
                loanNumber: _loanNumber,
                feeType:this.props.feeType
            },
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success: function (res) {
                $("#loading").remove();
                commonJs.ajaxGetCode(res);
                var _getData = res.data;
                if (!_getData.executed) {
                    _that.setState({
                        coltnData:_getData
                    })
                    return;
                }
                
                if(_getData.status && shouldAlert){
                    alert(_getData.statusMessage);
                }
                _that.setState({
                    coltnData:_getData
                })
                let upfrontFeeInfoDTO=_getData.upfrontFeeInfoDTO?_getData.upfrontFeeInfoDTO:{}; //修改当前条数的逾期金额/天数
                let tr_Principal=$(".cdt-list tr").eq(_that.state._clickNextNumber).find(".r_Principal");
                tr_Principal.html(commonJs.is_obj_exist(upfrontFeeInfoDTO.totalPrincipal)+ "/" + commonJs.is_obj_exist(upfrontFeeInfoDTO.totalOverdueDays));
                _that.initCount();
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }

    // queue保存操作
    savecoltnQueueHandler(event){
        var _that=this;
        let $this=$(event.target);
        let _parent=$this.closest(".QrecordInfo");
        let _data={};
        _data.accountId=this.state._acount;
        _data.loanNumber=this.state._loanNumber;
        _data.ownerName=this.state._ownerId;
        let allPhoneNo=this.state.allPhoneNo;  //来自个人详情
        let _contactPersonId=_parent.find(".communicateObjectList option:selected").attr("data-name");  //沟通对象
        if(!_contactPersonId){
            alert("请选择沟通对象!");
            return;
        }
        if(_contactPersonId=="ONESELF_FIRST"){  //本人第二号码
            _data.customerId=this.state.customerId;
            if(allPhoneNo.thirdTelNo && allPhoneNo.thirdTelNo!="-"){
                _data.phoneNumber=allPhoneNo.thirdTelNo
            }
        }
        if(_contactPersonId=="ONESELF_SECOND"){  //本人第三号码
            _data.customerId=this.state.customerId;
            if(allPhoneNo.secondTelNo && allPhoneNo.secondTelNo!="-"){
                _data.phoneNumber=allPhoneNo.secondTelNo
            }
        }
        _data.contactPersonId=_contactPersonId;
        let _processingState=_parent.find(".contactResultsInfo option:selected").attr("data-name");  //处理状态
        if(!_processingState){
            alert("处理状态为必填项！");
            return;
        }
        _data.processingState=_processingState;
        let _scheduledTime=_parent.find(".contactResultsInfo").attr("data-time");  //跟进时间--当处理状态选择 跟进时 获取时间
        if(_scheduledTime!="" && _processingState=="SET_TIME_FOLLOW_UP"){
            _data.planTime=_scheduledTime  //	跟进时间--当处理状态选择 跟进时 获取时间 ps：用户没选则不传字段
        }
        let _promiseRepaymentTime=_parent.find(".COMMITMENT_REPAY_TIME").attr("data-time");  //承诺还款时间--当处理状态选择 承诺还款 获取时间
        if((!_promiseRepaymentTime || _promiseRepaymentTime=="") && _processingState=="COMMITMENT_REPAY"){
            alert("请选择承诺还款时间！");
            return;
        }
        if(_promiseRepaymentTime!="" && _processingState=="COMMITMENT_REPAY"){
            _data.promiseRepaymentTime=_promiseRepaymentTime  //ps：用户没选则不传字段
        }
        let _newMoblieRecord=_parent.find(".newMoblieRecord").val();  //新号码记录
        if(!_newMoblieRecord || _newMoblieRecord=="-"){
            alert("请输入新号码记录！");
            return;
        }
        if(isNaN(_newMoblieRecord)){
            alert("新号码记录必须为纯数字!");
            return;
        }
        _data.newMoblieRecord=_newMoblieRecord;
        
        let _contact_person_name=_parent.find(".communicateName").val();  //沟通姓名
        if(!_contact_person_name || _contact_person_name=="-"){
            alert("请输入沟通姓名！");
            return;
        }
        _data.contactPersonName=_contact_person_name;
        
        let _caseContent=_parent.find(".CollQdetail").val();
        if(_caseContent!=""){
            _data.caseContent=_caseContent;  //内容
        }
        if(this.props.feeType){_data.feeType=this.props.feeType}
        $.ajax({
            type:"get",
            url:"/RemColt/saveQrecord",
            async:true,
            dataType: "JSON",
            data:_data,
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                _that.getMsg("RELOAD",false,true);
                if(_that.props.updataList_fn){
                    _that.props.updataList_fn(false,true);
                }
                _that.cancelSaveQ();
                //保存本人第二号码和本人第三号码需要更新个人信息板块数据
                if(_contactPersonId=="ONESELF_FIRST" || _contactPersonId=="ONESELF_SECOND"){  
                    _that.props.reloadUserMsg();
                }
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //取消保存record
    cancelSaveQ(){
        let _parent=$(".coll-edit-div");
        _parent.find(".communicateObjectList").find("select option").removeProp("selected");
        _parent.find(".communicateObjectList").find("select option:eq(0)").prop("selected","selected");
        _parent.find(".communicateName").val("");
        _parent.find(".newMoblieRecord").val("");
        _parent.find(".contactResultsInfo").find("select option").removeProp("selected");
        _parent.find(".contactResultsInfo").find("select option:eq(0)").prop("selected","selected");
        _parent.find(".followUpTime,.COMMITMENT_REPAY_TIME").addClass("hidden");
    }

    //获取跟进时间
    selectTime(value, dateString) {
        $(".contactResultsInfo").attr("data-time",dateString);
    }
    //获取承诺还款时间
    selectTime_crt(value, dateString) {
        $(".COMMITMENT_REPAY_TIME").attr("data-time",dateString);
    }
    //沟通对象切换
    communicateObjectFn(event){
        let $this=$(event.target);
        let $parent=$this.closest(".QrecordInfo");
        let _selected=$this.find("option:selected").attr("data-name");
        let allPhoneNo=this.state.allPhoneNo;  //来自个人详情
        switch(_selected)
        {
            case "ONESELF":  //本人注册
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(allPhoneNo.userName));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(allPhoneNo.primaryPhone));
                break;
            case "ONESELF_FIRST": //本人第二号码
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(allPhoneNo.userName));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(allPhoneNo.secondTelNo));
                break;
            case "ONESELF_SECOND": //本人第三号码
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(allPhoneNo.userName));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(allPhoneNo.thirdTelNo));
                break;
            case "COMPANY": //公司电话
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(allPhoneNo.company));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(allPhoneNo.companyPhone));
                break;
            case "FIRST_CONTACT": //第一联系人
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(allPhoneNo.directReferenceName));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(allPhoneNo.directReferencePhone));
                break;
            case "SECOND_CONTACT": //第二联系人
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(allPhoneNo.twoName));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(allPhoneNo.twoPhone));
                break;
            case "THIRD_CONTACT": //第三联系人
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(allPhoneNo.otherReferenceName2));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(allPhoneNo.otherReferencePhone2));
                break;
            case "MAIL_LIST": //通讯录
                $(".QrecordInfo .communicateName").val(commonJs.is_obj_exist(this.state._communicateName));
                $(".QrecordInfo .newMoblieRecord").val(commonJs.is_obj_exist(this.state._newPhoneNo));
                break;
        }
    }
    render() {
        let _periods,_recordeQueueStatus;
        let coltnData=this.state.coltnData;  //页面数据
        if(coltnData){
            _periods=coltnData.periods;
            _recordeQueueStatus=coltnData.recordeQueueStatus?coltnData.recordeQueueStatus:"";
        }
        let newRemindQueueInfoDTO=coltnData.newRemindQueueInfoDTO?coltnData.newRemindQueueInfoDTO:{};
        let upfrontFeeRecordsInfoDTOS=coltnData.upfrontFeeRecordsInfoDTOS ? coltnData.upfrontFeeRecordsInfoDTOS :[]  //操作记录列表
        let upfrontFeeDetailInfoDTOS=coltnData.upfrontFeeDetailInfoDTOS?coltnData.upfrontFeeDetailInfoDTOS[0]:[]; //前期费信息
        let upfrontFeeInfoDTO=coltnData.upfrontFeeInfoDTO?coltnData.upfrontFeeInfoDTO:{};  //单条记录对应信息
        let new_processStatusList=this.state.new_processStatusList;
        return (
            <div className="auto-box pr5">
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit">
                        {this.props.feeType=='upfrontfee'?'前期费信息':'服务费信息'}
                    </h2>
                    <div className="bar pl20 pt10 mt5">
                        <span className="left">天数：</span>
                        <b className="left red pr10">
                            {commonJs.is_obj_exist(upfrontFeeDetailInfoDTOS.overdueDays)}
                        </b>
                        <span className="left">金额：</span>
                        <b className="left blue-font pr10">
                            {commonJs.is_obj_exist(upfrontFeeDetailInfoDTOS.upfrontFeeAmount)}
                        </b>
                        <span className="left">状态：</span>
                        <b className="left content-font pr10">
                            {commonJs.is_obj_exist(upfrontFeeDetailInfoDTOS.paymentStatusId)}
                        </b>
                    </div>
                </div>
                {/* record 操作 */}
                <div className={(upfrontFeeInfoDTO.payOffStatusEnum&&upfrontFeeInfoDTO.payOffStatusEnum.value=="1")?"bar mt10 coll-edit-div pb10 QrecordInfo  bind_hidden hidden":"bar mt10 coll-edit-div pb10 QrecordInfo"}>
                    <dl>
                        <dt>沟通对象</dt>
                        <dd className="communicateObjectList">
                            <select name="" id='communicate' className="select-gray commu-select" onChange={this.communicateObjectFn.bind(this)}>
                                <option data-name="" id="0" hidden>请选择</option>
                                {
                                    (this.state.initialData && this.state.initialData.communicateObjectList && this.state.initialData.communicateObjectList.length>0) ? this.state.initialData.communicateObjectList.map((repy,i)=>{
                                        return <option key={i} data-name={repy.name} data-value={repy.value}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                    }):<option data-name=""> </option>
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl>
                        <dt>沟通姓名</dt>
                        <dd className="">
                            <input type="text" className="input communicateName" id='communicateName' placeholder="请输入"/>
                        </dd>
                    </dl>
                    <dl>
                        <dt>处理状态</dt>
                        <dd className="contactResultsInfo">
                            <select name="" id='contactResultsInfo' className="select-gray commu-select left mr5">
                                <option data-name="" id="0" hidden>请选择</option>
                                {
                                    (new_processStatusList && new_processStatusList.length>0) ? new_processStatusList.map((repy,i)=>{
                                        return <option key={i} data-name={repy.name} data-value={repy.value}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                    }):<option data-name=""> </option>
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl className="followUpTime hidden">
                        <dt>跟进时间</dt>
                        <dd id='followUpTime'>
                            <DatePicker format="YYYY-MM-DD HH:mm:ss" onChange={this.selectTime.bind(this)} disabledDate={disabledDate} showTime />
                        </dd>
                    </dl>
                    <dl className="COMMITMENT_REPAY_TIME hidden">
                        <dt>承诺还款时间</dt>
                        <dd id='commitmentRepayTime'>
                            <DatePicker format="YYYY-MM-DD HH:mm:ss" onChange={this.selectTime_crt.bind(this)} disabledDate={disabledDate} showTime />
                        </dd>
                    </dl>
                    <dl>
                        <dt>新号码记录</dt>
                        <dd className="">
                            <input type="text" id='newMoblieRecord' className="input newMoblieRecord" placeholder="请输入"/>
                        </dd>
                    </dl>
                    <div className="clearfix"></div>
                    <dl className="through-dl">
                        <dt>详情</dt>
                        <dd className="">
                            <textarea name="" id="CollQdetail" cols="30" rows="10" className="commu-area textarea CollQdetail"></textarea>
                        </dd>
                    </dl>
                    <div>
                        <button className="left block ml10 edit btn-blue" id='savecoltnQueue' onClick={this.savecoltnQueueHandler.bind(this)}>保存</button>
                        <button className="btn-white left block ml20 cancle_edit" id='savecoltnQueueCancle' onClick={commonJs.cancelSaveQ.bind(this)}>取消</button>
                    </div>
                </div>
                {/* record 记录 */}
                <div className={(upfrontFeeRecordsInfoDTOS && upfrontFeeRecordsInfoDTOS.length>0)?"bar mt10 coll-edit-div":"bar mt10 coll-edit-div hidden"}>
                {
                    (upfrontFeeRecordsInfoDTOS && upfrontFeeRecordsInfoDTOS.length>0) ? upfrontFeeRecordsInfoDTOS.map((repy,i)=>{
                    let recordTime="";
                    if(repy.processingState){
                        if(repy.processingState=="承诺还款"){
                            recordTime=commonJs.is_obj_exist(repy.promiseRepaymentTime);
                        }else if(repy.processingState=="需跟进"){
                            recordTime=commonJs.is_obj_exist(repy.scheduledTime);
                        }else{
                            recordTime=""
                        }
                    }else{recordTime=""}
                    return <div key={i} className="border-bottom-3 pb5">
                            <dl className="border-bottom">
                                <dt>沟通对象</dt>
                                <dd className="">
                                    {commonJs.is_obj_exist(repy.contactPersonId)}
                                </dd>
                            </dl>
                            <dl>
                                <dt>沟通姓名</dt>
                                <dd className="">
                                    {commonJs.is_obj_exist(repy.contactPersonName)}
                                </dd>
                            </dl>
                            <dl>
                                <dt>案列状态</dt>
                                <dd className="">
                                    <span className="left mt2 mr2">{commonJs.is_obj_exist(repy.processingState)} </span>
                                    <span className="showRecordTime" title={recordTime}>{recordTime}</span>
                                </dd>
                            </dl>
                            <dl>
                                <dt>新号码记录</dt>
                                <dd className="">
                                    {commonJs.is_obj_exist(repy.newMoblieRecord)} 
                                </dd>
                            </dl>
                            <div className="clearfix ml10 mr10 record-detail-div">
                                <div className="record-detail left">
                                    <span className="left block pr10">详情</span>
                                    <div className="left detail elli">{commonJs.is_obj_exist(repy.caseContent)}</div>
                                </div>
                                <div className="right toggle-record-detail on" onClick={commonJs.toggle_record_detail.bind(this)}><i></i></div>
                            </div>
                            <div className="clearfix ml10 border-top">
                                <span className="left pr10">{commonJs.is_obj_exist(repy.userName)}</span>
                                <div className="left">{commonJs.is_obj_exist(repy.updatedTime)}</div>
                            </div>
                        </div>
                    }): ""
                }
                </div>
            </div>
        )
    }
};
function range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
function disabledDate(current) {
        // can not select days before today and today
        return current && current.valueOf() < Date.now()-86400;
}

export default EarlierCost;