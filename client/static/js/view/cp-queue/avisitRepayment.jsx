// 回访还款
import React from 'react';
import $ from 'jquery';
import { Pagination,DatePicker,Select } from 'antd';  
import {observer,inject} from "mobx-react";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import Channel from '../cp-module/channel'; //选择合作方select
import SortTimeJs from '../../source/common/sortTime';
var sortTimeJs=new SortTimeJs;

@inject('allStore') @observer
class AvisitRepayment extends React.Component {
    constructor(props){
        super(props);
        // this.store=this.props.allStore.SearchResultTrStore;
        this.state = {
            visitDataInfoDtos:[],  //搜索结果
            channelSelectedObj:{},  //条件区选中的渠道
            barsNum:10,  //每页显示多少条
            current:1,
            totalSize:0,
            creditExtensionstartValue:null,
            creditExtensionendValue:null,
            realityRepaystartValue:null,
            realityRepayendValue:null
        };
    }
    componentDidMount() {
        this.init();
        cpCommonJs.getRuleGroup(this);  //获取权限用户组数据
    }
    //初始化金额-回访
    init(){
        let that=this;
        $.ajax({
            type:"get", 
            url:"/node/reV/init", 
            async:true,
            dataType: "JSON", 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        authAmountEnums:[]
                   })
                }
               let _data=res.data;
               that.setState({
                    authAmountEnums:_data.authAmountEnums?_data.authAmountEnums:[]
               })
           }
       })
    }
    //时间组件，通用
    onChange = (field, value) => {
        this.setState({
          [field]: value,
        });
      }
    //授信时间--搜索时间
    creditExtensionStartDate = (creditExtensionstartValue) => {
        const creditExtensionendValue = this.state.creditExtensionendValue;
        if (!creditExtensionstartValue || !creditExtensionendValue) {
        return false;
        }
        return creditExtensionstartValue.valueOf() > creditExtensionendValue.valueOf();
    }
    creditExtensionEndDate = (creditExtensionendValue) => {
        const creditExtensionstartValue = this.state.creditExtensionstartValue;
        if (!creditExtensionendValue || !creditExtensionstartValue) {
        return false;
        }
        return creditExtensionendValue.valueOf() <= creditExtensionstartValue.valueOf();
    }
    creditExtensionStartChange = (value) => {
        this.onChange('creditExtensionstartValue', value);
    }
    creditExtensionEndChange = (value) => {
        this.onChange('creditExtensionendValue', value);
    }
    creditExtensionStartOpenChange = (open) => {
        if (!open) {
        this.setState({ creditExtensionOpen: true });
        }
    }
    creditExtensionEndOpenChange = (open) => {
        this.setState({ creditExtensionOpen: open });
    }
    
    //还款时间--搜索时间
    realityRepayStartDate = (realityRepayValue) => {
        const visitendValue = this.state.visitendValue;
        if (!realityRepayValue || !visitendValue) {
        return false;
        }
        return realityRepayValue.valueOf() > visitendValue.valueOf();
    }
    realityRepayEndDate = (visitendValue) => {
        const realityRepayValue = this.state.realityRepayValue;
        if (!visitendValue || !realityRepayValue) {
        return false;
        }
        return visitendValue.valueOf() <= realityRepayValue.valueOf();
    }
    realityRepayStartChange = (value) => {
        this.onChange('realityRepaystartValue', value);
    }
    realityRepayEndChange = (value) => {
        this.onChange('realityRepayendValue', value);
    }
    realityRepayStartOpenChange = (open) => {
        if (!open) {
        this.setState({ realityRepayOpen: true });
        }
    }
    realityRepayEndOpenChange = (open) => {
        this.setState({ realityRepayOpen: open });
    }
    // 全选
    selectAll(event){
        let $this=$(event.target);
        if($this.hasClass("myCheckbox-visited")){
            $this.closest("table").find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }else {
            $this.closest("table").find(".myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }   
        event.stopPropagation();
    }
    myCheckbox_fn(event){
        let $this=$(event.target);
        let $table=$this.closest("table");
        if($this.hasClass("myCheckbox-normal")){
            $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }else {
            $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }
        let notAll=$table.find("tbody").find(".myCheckbox-normal").length;  //tbody 未选中的checkbox个数
        let selected=$table.find("tbody").find(".myCheckbox-visited").length;  //tbody 已经选中的checkbox个数
        let trLength=$table.find("tbody").find("tr").length;  //tbody tr的个数
        if(notAll>0){
            $table.find("thead").find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }
        if(selected==trLength){
            $table.find("thead").find(".myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }
    }
    //渠道切换事件
    channelChange(channelSelectedObj){
        commonJs.resetCondition(this,false);
        this.setState({
            channelSelectedObj:channelSelectedObj,
            taskOwner:"",
            creditExtensionstartValue:null,
            creditExtensionendValue:null,
            realityRepaystartValue:null,
            realityRepayendValue:null
        })
        let _pathName=this.props.location?this.props.location.pathname:"";
        $(".avisitType option").removeProp("selected");
        $(".avisitType option[value='"+_pathName+"']").prop("selected","true");
    }
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        $(".pt-table .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        this.setState({
            current: 1,
            barsNum:pageSize
        });
        this.searchHandle(true,1,pageSize);
    }
    //快速跳转到某一页。
    pageChange(page){
        $(".pt-table .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        this.setState({
            current: page
        });
        this.searchHandle(true,page,this.state.barsNum);
    }
    //获取条件
    getConditions(){
        let _parems={};  //条件
        let channelVal=this.state.channelSelectedObj.value;
        let judgeChannelVal=cpCommonJs.judgeChannelCondition(channelVal);
        if(judgeChannelVal=='A_F'){
            let _authTimeBegin=commonJs.dateToString2(this.state.creditExtensionstartValue);   //授信时间-开始
            if(_authTimeBegin!="1970-01-01" && _authTimeBegin!='NaN-aN-aN')_parems.authTimeBegin=_authTimeBegin;  
            let _authTimeEnd=commonJs.dateToString2(this.state.creditExtensionendValue);   //授信时间-结束
            if(_authTimeEnd!="1970-01-01" && _authTimeEnd!='NaN-aN-aN')_parems.authTimeEnd=_authTimeEnd;  
            let _authAmount=$(".authAmount option:selected").attr("value");   //授信金额
            if(_authAmount)_parems.authAmount=_authAmount;
            let _extractTimes=$(".extractTimes option:selected").attr("value");   //已提取次数
            if(_extractTimes)_parems.extractTimes=_extractTimes;
            let _recentlyPayType=$(".recentlyPayType option:selected").attr("value");   //还款方式
            if(_recentlyPayType)_parems.recentlyPayType=_recentlyPayType;
        }else if(judgeChannelVal=="24A"){ 
            let _recentlyPayType=$(".recentlyPayType option:selected").attr("value");   //还款方式
            if(_recentlyPayType)_parems.recentlyPayType=_recentlyPayType;
        }else if(judgeChannelVal=="3C"){
            let _customerType=$(".customerType").hasClass("myCheckbox-visited");   //3C 是否医美
            if(_customerType)_parems.customerType='1';
        }else if(judgeChannelVal=="6C"){
            let _loanPurpose=$(".loanPurpose").hasClass("myCheckbox-visited");   //6C 通信消费
            if(_loanPurpose)_parems.loanPurpose='1';
        }else if(judgeChannelVal=="17C"){
            let _botFlag=$(".botFlag").hasClass("myCheckbox-visited");   //17C 机器人办单
            if(_botFlag)_parems.botFlag='1';
        }
        let _recentlyPayType=$(".recentlyPayType option:selected").attr("value");   //还款方式
        if(_recentlyPayType)_parems.recentlyPayType=_recentlyPayType;
        let _overdueDaysBegin=$(".overdueDaysStart").val();   //逾期天数-开始
        let _overdueDaysEnd=$(".overdueDaysEnd").val();   //逾期天数-结束
        if(_overdueDaysBegin)_parems.overdueDaysBegin=_overdueDaysBegin;
        if(_overdueDaysEnd)_parems.overdueDaysEnd=_overdueDaysEnd;
        let _actualPayTimeBegin=commonJs.dateToString2(this.state.realityRepaystartValue);   //还款日期-开始
        if(_actualPayTimeBegin!="1970-01-01" && _actualPayTimeBegin!='NaN-aN-aN')_parems.actualPayTimeBegin=_actualPayTimeBegin;  
        let _actualPayTimeEnd=commonJs.dateToString2(this.state.realityRepayendValue);   //还款日期-结束
        if(_actualPayTimeEnd!="1970-01-01" && _actualPayTimeEnd!='NaN-aN-aN')_parems.actualPayTimeEnd=_actualPayTimeEnd; 
        let _extractType=$(".extractType option:selected").attr("value");   //抽取方式
        if(_extractType)_parems.extractType=_extractType;
        let _extractPercent=$(".extractPercent").val();   //抽取比例
        let _whetherRevisit=$(".whetherRevisit option:selected").attr("value");   //是否回访
        if(_whetherRevisit)_parems.whetherRevisit=_whetherRevisit;
        if(_extractPercent && _extractPercent.replace(/\s/g,""))_parems.extractPercent=_extractPercent;  //需保留，做是否有填写条件用
        let _taskOwner=this.state.taskOwner;  //任务所有者
        if(_taskOwner)_parems.code=_taskOwner;
        let _installmentsOrder=this.state._installmentsOrder;   //是否排序
        if(_installmentsOrder==0||_installmentsOrder==1){
            _parems.installmentsOrder=_installmentsOrder;
        }
        this.setState({
            conditions:_parems
        });
        return _parems;
    }
    //搜索 oldConditions等于true获取已经存在的条件，否则重新获取搜索条件  installmentsOrder 是否排序，还款期数排序 1升序 0降序 不传不参与排序
    searchHandle(oldConditions,pageNumber,pagesize,installmentsOrder){
        this.setState({
            current:pageNumber,
            _installmentsOrder:""
        })
        $(".pt-table .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        let that=this;
        let _parems={};
        if(oldConditions){
            _parems=this.state.conditions;
            if(installmentsOrder==0||installmentsOrder==1){
                _parems.installmentsOrder=installmentsOrder;   //是否排序
            }
        }else{
            _parems=this.getConditions();
        }
        let channelVal=this.state.channelSelectedObj.value;
        let merchantOrNot=$('.return-visit-condition .merchantOrNot option:selected').attr('value');
        if(channelVal=='2C'&&merchantOrNot){
            _parems.merchantOrNot=merchantOrNot;
        }
        if(!_parems||Object.keys(_parems).length<=0){
            alert("请选填搜索条件！")
            return;
        }
        if(!channelVal){
            alert("请选择合作方！")
            return;
        }
        if(channelVal)_parems.cooperationFlag=channelVal;   //合作方
        let _overdueDaysBegin=$(".overdueDaysStart").val();   //逾期天数-开始
        let _overdueDaysEnd=$(".overdueDaysEnd").val();   //逾期天数-结束
        if(isNaN(_overdueDaysBegin)){
            alert("逾期天数必须需是数字！");
            return;
        }
        if(_overdueDaysBegin&&_overdueDaysBegin!=parseInt(_overdueDaysBegin)){
            alert("逾期天数开始值必须是整数！");
            return;
        }
        if(_overdueDaysEnd&&_overdueDaysEnd!=parseInt(_overdueDaysEnd)){
            alert("逾期天数结束值必须是整数！");
            return;
        }
        if(isNaN(_overdueDaysEnd)){
            alert("逾期天数必须需是数字！");
            return;
        }
        if((typeof(_overdueDaysBegin)=="number"&&_overdueDaysBegin==0)||(typeof(_overdueDaysEnd)=="number"&&_overdueDaysEnd==0)){
            alert("逾期天数不能为0！");
            return;
        }
        if(_overdueDaysBegin&&_overdueDaysEnd&&parseInt(_overdueDaysEnd)<=parseInt(_overdueDaysBegin)){
            alert("逾期天数结束时间必须大于开始时间！");
            return;
        }
        _parems.pageNumber=pageNumber;
        _parems.pagesize=pagesize;
        var obj2 = Object.assign({}, _parems);   //将_parems的可枚举的属性值复制到{}中,赋值给obj2,后期操作obj2对象不影响原来的_parems对象
        if(obj2.extractPercent&&(obj2.extractPercent!=parseInt(obj2.extractPercent)||(isNaN(obj2.extractPercent)))){
            alert("抽取比例只能是整数！");
            return;
        }
        if(obj2.extractPercent>50){
            alert("抽取比例不能大于50！");
            return;
        }
        if(obj2.extractPercent)obj2.extractPercent=obj2.extractPercent/100;  //重新计算，传小数给后端
        $.ajax({
             type:"post", 
             url:"/node/reV/searchPaid", 
             async:true,
             dataType: "JSON", 
             data:obj2, 
             beforeSend:function(XMLHttpRequest){
                let loading_html='<div id="loading">'+
                                        '<div class="tanc_bg"></div>'+
                                        '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                    '</div>';
                $("body").append(loading_html);       
            },
             success:function(res){
                $("#loading").remove();
                 if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        visitDataInfoDtos:[]
                    })
                     return;
                 }
                 let _data=res.data;
                 let _visitDataInfoDtos=_data.paidDataInfoDTOS?_data.paidDataInfoDTOS:[]; //搜索结果list
                 that.setState({
                    visitDataInfoDtos:_visitDataInfoDtos,
                    totalSize:_data.totalSize?_data.totalSize:0 //总条数
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
    //关闭弹窗
    closeDispatchPop(e){
        let doms_normal=$(".pt-table .myCheckbox");
        doms_normal.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        let $this=$(e.target);
        $this.closest(".dispatch-pop").addClass("hidden");
        $(".dispatch-pop .ant-select-selection-selected-value").text("请选择");
        this.setState({
            dispathCode:""
        })
    }
    // 分配弹窗
    showDistributePop(){
        let pop=$(".dispatch-pop");
        if($(".pt-table tbody").find(".myCheckbox-visited").length<=0){
            alert("请选择分配内容！");
            return;
        }
        pop.removeClass("hidden");
    }
    //分配
    distribute(){
        let _obj={};
        let _arr = [];
        let that=this;
        let data=this.state.visitDataInfoDtos;  //搜索获取的数据
        $(".pt-table tbody tr").each(function(){
            let n=""; //用 myCheckbox-visited 的tr下标去获取搜索数据的下标
            let checkBox=$(this).find(".myCheckbox");
            if(checkBox.hasClass("myCheckbox-visited")){
                n=$(this).index();
                _arr.push(data[n]);
            }
        });
        let _code=this.state.dispathCode;
        if(!_code){
            alert("请选择分配对象！");
            return;
        }
        let _bindBy=this.state.dispathEmail;
        if(!_bindBy){
            alert("请选择分配对象！");
            return;
        }
        _obj={
            assignInfoDTOS:_arr,
            code:_code,
            bindBy:_bindBy,
            fromWhere:"paid"
        };
        $.ajax({
            type:"post", 
            url:"/node/reV/assignPaid", 
            async:true,
            dataType: "JSON", 
            data:{josnParam:JSON.stringify(_obj)}, 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _data=res.data;
                alert(_data.message);
                let doms_normal=$(".pt-table .myCheckbox");
                doms_normal.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                $(".dispatch-pop").addClass("hidden");
                $(".dispatch-pop .ant-select-selection-selected-value").text("请选择");
                let _pathName=that.props.location?that.props.location.pathname:"";
                $(".avisitType option").removeProp("selected");
                $(".avisitType option[value='"+_pathName+"']").prop("selected","true");
                that.setState({
                    dispathCode:""
                });
                that.searchHandle(true,that.state.current,that.state.barsNum);
           }
       });
    }
    
    //选择分配人员弹窗
    handleChange(value,option) {
        this.setState({
            dispathCode:option.props?option.props.value:"",
            dispathEmail:option.props?option.props.children:""
        })
        let adminNameMaps=this.state.adminNameMaps;
        for(let i=0;i<adminNameMaps.length;i++){
            if(adminNameMaps[i].code==value){
                $(".dispatch-pop .ant-select-selection-selected-value").text(adminNameMaps[i].name);
            }
        }
    }
    //清空分配人员选择
    distributeDeselect(value){
        if(value==undefined){
            this.setState({
                dispathCode:"",
                dispathEmail:""
            })
        }
    }
    //条件区任务所有者
    taskOwnerFn(value,option){
        this.setState({
            taskOwner:value
        })
        let adminNameMaps=this.state.adminNameMaps;
        for(let i=0;i<adminNameMaps.length;i++){
            if(adminNameMaps[i].code==value){
                $(".return-visit-condition .ant-select-selection-selected-value").text(adminNameMaps[i].name);
            }
        };
        $(".return-visit-condition .ant-select-selection__placeholder").css("display","none");
    }
    //清除条件区任务所有者
    TaskOwnerDeselect(value){
        if(value==undefined){
            this.setState({
                taskOwner:""
            })
        }
    }
    // 排序
    sort(event){
        let $this=$(event.target);
        if($this.hasClass("left")||$this.hasClass("sort-icon")){
            $this=$(event.target).parent();
        }
        let dataSort=$this.attr("data-sort");
        if(dataSort=="invert"){   //倒序
            $this.attr("data-sort","order");
            $this.find(".sort-icon").removeClass("sort-normal").removeClass("sort-order").addClass("sort-invert");
            this.searchHandle(true,this.state.current,this.state.barsNum,0);
        }else{
            $this.attr("data-sort","invert");
            $this.find(".sort-icon").removeClass("sort-normal").removeClass("sort-invert").addClass("sort-order");
            this.searchHandle(true,this.state.current,this.state.barsNum,1);
        }
    }
    render() {
        let {creditExtensionstartValue,creditExtensionendValue,creditExtensionOpen,
            realityRepaystartValue,realityRepayendValue,realityRepayOpen,
        } = this.state;  //搜索条件区的日期
        let visitDataInfoDtos=this.state.visitDataInfoDtos?this.state.visitDataInfoDtos:[];
        let adminNameMaps=this.state.adminNameMaps;
        const Option = Select.Option;
        let selectedChannelVal=this.state.channelSelectedObj.value;  //条件区选中的渠道
        let channelYype=cpCommonJs.judgeChannelAvist(selectedChannelVal);  //判断属于哪个合作方类型
        return (
            <div  className="content" id="content">
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar return-visit-condition clearfix pb10 pl20 pr20" data-resetstate="creditExtensionstartValue,creditExtensionendValue,realityRepaystartValue,realityRepayendValue">
                    <dl className="left mt10">
                        <dt className="left">产品</dt>
                        <dd><Channel onChange={this.channelChange.bind(this)} /></dd>  {/* 合作方 */}
                    </dl>  
                    {
                        (selectedChannelVal=="2C")?
                        <dl className="left mt10">
                            <dt>商户分类</dt>
                            <dd>
                                <select className="select-gray merchantOrNot" name="" id="merchantOrNot">
                                    <option value="" hidden>请选择</option>
                                    <option value="">全部</option>
                                    <option value="1">大商户</option>
                                    <option value="0">小商户</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal=="3C")?
                        <div className="left mt10">
                            <i className="myCheckbox myCheckbox-normal left customerType mt3" id='customerType' onClick={commonJs.myCheckbox.bind(this)}></i>
                            是否医美
                        </div>:""
                    } 
                    {
                        (selectedChannelVal=="6C")?
                        <div className="left mt10">
                            <i className="myCheckbox myCheckbox-normal left loanPurpose mt3" id='loanPurpose' onClick={commonJs.myCheckbox.bind(this)}></i>
                            通信消费
                        </div>:""
                    }                
                    {
                        channelYype=="F9_14A"?
                        <dl className="left mt10">
                            <dt>授信日期</dt>
                            <dd id='creditExtensionDate'>
                                <div style={{"width":"45%","display":"inline-block"}}>
                                    <DatePicker
                                        disabledDate={this.creditExtensionStartDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={creditExtensionstartValue}
                                        placeholder="Start"
                                        onChange={this.creditExtensionStartChange.bind(this)}
                                        onOpenChange={this.creditExtensionStartOpenChange.bind(this)}
                                    />
                                </div>
                                <span className="pl5 pr5">-</span>
                                <div style={{"width":"45%","display":"inline-block"}}>
                                    <DatePicker
                                        disabledDate={this.creditExtensionEndDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={creditExtensionendValue}
                                        placeholder="End"
                                        onChange={this.creditExtensionEndChange.bind(this)}
                                        open={creditExtensionOpen}
                                        onOpenChange={this.creditExtensionEndOpenChange.bind(this)}
                                    />
                                </div>
                            </dd>
                        </dl>:""
                    }
                    
                    {
                        (selectedChannelVal)?
                        <dl className="left mt10">
                            <dt>还款日期</dt>
                            <dd id='realityRepayDate'>
                                <div style={{"width":"45%","display":"inline-block"}}>
                                    <DatePicker
                                        disabledDate={this.realityRepayStartDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={realityRepaystartValue}
                                        placeholder="Start"
                                        onChange={this.realityRepayStartChange.bind(this)}
                                        onOpenChange={this.realityRepayStartOpenChange.bind(this)}
                                    />
                                </div>
                                <span className="pl5 pr5">-</span>
                                <div style={{"width":"45%","display":"inline-block"}}>
                                    <DatePicker
                                        disabledDate={this.realityRepayEndDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={realityRepayendValue}
                                        placeholder="End"
                                        onChange={this.realityRepayEndChange.bind(this)}
                                        open={realityRepayOpen}
                                        onOpenChange={this.realityRepayEndOpenChange.bind(this)}
                                    />
                                </div>
                            </dd>
                        </dl>:""
                    }
                    
                    {
                        channelYype=="F9_14A"?
                        <dl className="left mt10">
                            <dt>授信金额</dt>
                            <dd>
                                <select className="select-gray authAmount" name="" id="authAmount">
                                    <option value="" hidden>请选择</option>
                                    <option value="">全部</option>
                                    {
                                        (this.state.authAmountEnums&&this.state.authAmountEnums.length>0)?this.state.authAmountEnums.map((repy,i)=>{
                                            return <option key={i} value={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option value=""></option>
                                    }
                                </select>
                            </dd>
                        </dl>:""
                    }
                    
                    {
                        channelYype=="F9_14A"?
                        <dl className="left mt10">
                            <dt>已提取次数</dt>
                            <dd>
                                <select className="select-gray extractTimes" name="" id="extractTimes">
                                    <option value="" hidden>请选择</option>
                                    <option value="">全部</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">≧6</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal)?
                        <dl className="left mt10">
                            <dt>逾期天数</dt>
                            <dd>
                                <input style={{"width":"40%"}} type="number" className="input overdueDaysStart" id='overdueDaysStart' placeholder="开始时间"/>
                                <span>&nbsp;-&nbsp;</span>
                                <input style={{"width":"40%"}} width="40%" type="number" className="input overdueDaysEnd" id='overdueDaysEnd' placeholder="结束时间"/>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal)?
                        <dl className="left mt10">
                            <dt>还款方式</dt>
                            <dd>
                                <select className="select-gray recentlyPayType" name="" id="recentlyPayType">
                                    <option value="" hidden>请选择</option>
                                    <option value="">全部</option>
                                    <option value="offline_paid">offline_paid</option>
                                    <option value="paid">paid</option>
                                    <option value="blind">blind</option>
                                    <option value="deposits">deposits</option>
                                    <option value="prepayment">prepayment</option>
                                    <option value="other">other</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal)?
                        <dl className="left mt10">
                            <dt>抽取方式</dt>
                            <dd>
                                <select className="select-gray extractType" name="" id="extractType">
                                    <option value="" hidden>请选择</option>
                                    <option value="">全部</option>
                                    <option value="random">随机</option>
                                    <option value="">顺序</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal)?
                        <dl className="left mt10">
                            <dt>抽取比例</dt>
                            <dd>
                                <input type="text" className="input extractPercent" id='extractPercent' placeholder="请输入" style={{"width":"93%","textAlign":"right"}} />%
                            </dd>
                        </dl>:""
                    }
                    <dl className="left mt10">
                        <dt>是否回访</dt>
                        <dd>
                            <select className="select-gray whetherRevisit" name="" id="whetherRevisit">
                                <option value="" hidden>请选择</option>
                                <option value="">全部</option>
                                <option value="1">是</option>
                                <option value="0">否</option>
                            </select>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt>任务所有者</dt>
                        <dd id='taskOwner'>
                            <Select
                                    showSearch
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="请选择"
                                    optionFilterProp="children"
                                    onSelect={this.taskOwnerFn.bind(this)}
                                    onChange={this.TaskOwnerDeselect.bind(this)}
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {
                                        (adminNameMaps && adminNameMaps.length>0) ? adminNameMaps.map((repy,i)=>{
                                            return <Option value={repy.code} key={i}>{repy.name}</Option>
                                        }):<option value = "">没有数据</option>
                                    }
                                </Select>
                        </dd>
                    </dl>
                    {
                        (selectedChannelVal=="17C")?
                        <div className="left mt10 mr10">
                            <i className="myCheckbox myCheckbox-normal left botFlag mt3" id='botFlag' onClick={commonJs.myCheckbox.bind(this)}></i>
                            机器人办单
                        </div>:""
                    } 
                    <div className="left mt10 mr10">
                        <button className="btn-blue left mr5" id='searchBtn' onClick={this.searchHandle.bind(this,false,1,this.state.barsNum)}>搜索</button>
                        <button className="btn-white left" id='reset' onClick={commonJs.resetCondition.bind(this,this,false)}>重置</button>
                    </div>
                </div>
                {/* 搜索条件 end */}
                <div  className="mt20 search-result" style={{"background":"#f5f5f5"}}>
                    <table className="pt-table layout-fixed workAllot-list">
                        <thead>
                            <tr className="th-bg">
                                <th width="3%">序号</th>
                                <th width="15%">合同号</th>
                                <th width="5%">姓名</th>
                                <th width="5%">信用评分</th>
                                <th width="10%">还款日期</th>
                                <th width="5%">还款方式</th>
                                <th width="5%" data-sort="invert"  className="pointer" onClick={this.sort.bind(this)}>
                                    <span className="left mr5">还款期数</span>
                                    <i className="sort-icon sort-normal mt19"></i>
                                </th>
                                <th width="5%">逾期天数</th>
                                <th width="5%">是否回访</th>
                                {
                                    channelYype=="C_24A"?
                                    <th width="10%">放款日期</th>:<th className="width-0"></th>
                                }
                                {
                                    channelYype=="F9_14A"?
                                    <th width="10%">授信时间</th>:<th className="width-0"></th>
                                }
                                {
                                    channelYype=="F9_14A"?
                                    <th width="5%">授信金额</th>:<th className="width-0"></th>
                                }
                                {
                                    channelYype=="F9_14A"?
                                    <th width="10%">提取时间</th>:<th className="width-0"></th>
                                }
                                {
                                    channelYype=="F9_14A"?
                                    <th width="8%">已提取次数</th>:<th className="width-0"></th>
                                }
                                {
                                    channelYype=="C"?
                                    <th width="5%">商品名</th>:<th className="width-0"></th>
                                }
                                {
                                    channelYype=="C"?
                                    <th width="5%">门店</th>:<th className="width-0"></th>
                                }
                                {
                                    channelYype=="C"?
                                    <th width="5%">业务员</th>:<th className="width-0"></th>
                                }
                                <th width="10%">任务所有者</th>
                                <th width="10%">
                                    <i className="myCheckbox myCheckbox-normal left mr5" id='selectAll' onClick={this.selectAll.bind(this)}></i>
                                    <a  data-btn-rule="RULE:PAID:ASSIGN:TREE" className="btn-blue left" style={{marginTop:'-5px'}} onClick={this.showDistributePop.bind(this)}>分配</a>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (visitDataInfoDtos && visitDataInfoDtos.length>0)?visitDataInfoDtos.map((repy,i)=>{
                                    return <tr key={i}>
                                                <td width="3%">{i+1}</td>
                                                <td width="15%" title={commonJs.is_obj_exist(repy.loanNumber)}>{commonJs.is_obj_exist(repy.loanNumber)}</td>
                                                <td width="5%" title={commonJs.is_obj_exist(repy.custName)}>{commonJs.is_obj_exist(repy.custName)}</td>
                                                <td width="5%" title={commonJs.is_obj_exist(repy.creditmodelGrade)}>{commonJs.is_obj_exist(repy.creditmodelGrade)}</td>
                                                <td width="10%" title={commonJs.is_obj_exist(repy.completeTime)}>{commonJs.is_obj_exist(repy.completeTime)}</td>
                                                <td width="5%" title={commonJs.is_obj_exist(repy.debitingChannel)}>{commonJs.is_obj_exist(repy.debitingChannel)}</td>
                                                <td width="5%" title={commonJs.is_obj_exist(repy.installmentNumber)}>{commonJs.is_obj_exist(repy.installmentNumber)}</td>
                                                <td width="5%" title={commonJs.is_obj_exist(repy.daysInDefault)}>{commonJs.is_obj_exist(repy.daysInDefault)}</td>
                                                <td width="5%" title={commonJs.is_obj_exist(repy.revisitOrNot)}>{commonJs.is_obj_exist(repy.revisitOrNot)}</td>
                                                {  //放款日期
                                                    channelYype=="C_24A"?
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.fundingSuccessDate)}>{commonJs.is_obj_exist(repy.fundingSuccessDate)}</td>:<td className="width-0"></td>
                                                }
                                                {  //授信时间
                                                    channelYype=="F9_14A"?
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.authTime)}>{commonJs.is_obj_exist(repy.authTime)}</td>:<td className="width-0"></td>
                                                }
                                                {  //授信金额
                                                    channelYype=="F9_14A"?
                                                    <td width="5%" title={commonJs.is_obj_exist(repy.authAmount)}>{commonJs.is_obj_exist(repy.authAmount)}</td>:<td className="width-0"></td>
                                                }
                                                {  //提取时间
                                                    channelYype=="F9_14A"?
                                                    <td width="10%" title={commonJs.is_obj_exist(repy.fundingSuccessDate)}>{commonJs.is_obj_exist(repy.fundingSuccessDate)}</td>:<td className="width-0"></td>
                                                }
                                                {  //已提取次数
                                                    channelYype=="F9_14A"?
                                                    <td width="8%" title={commonJs.is_obj_exist(repy.extractNum)}>{commonJs.is_obj_exist(repy.extractNum)}</td>:<td className="width-0"></td>
                                                }
                                                {  //商品名
                                                    channelYype=="C"?
                                                    <td width="5%" title={commonJs.is_obj_exist(repy.commodityName)}>{commonJs.is_obj_exist(repy.commodityName)}</td>:<td className="width-0"></td>
                                                }
                                                {  //门店
                                                    channelYype=="C"?
                                                    <td width="5%" title={commonJs.is_obj_exist(repy.storeName)}>{commonJs.is_obj_exist(repy.storeName)}</td>:<td className="width-0"></td>
                                                }
                                                {  //业务员
                                                    channelYype=="C"?
                                                    <td width="5%" title={commonJs.is_obj_exist(repy.employeeName)}>{commonJs.is_obj_exist(repy.employeeName)}</td>:<td className="width-0"></td>
                                                }
                                                <td width="10%" title={commonJs.is_obj_exist(repy.bindBy)}>{commonJs.is_obj_exist(repy.bindBy)}</td>
                                                <td>
                                                    <i className="myCheckbox myCheckbox-normal" id={`check${i}`} onClick={this.myCheckbox_fn.bind(this)}></i>
                                                </td>
                                            </tr>
                                }):<tr><td colSpan="3" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
                <div className="cdt-th th-bg clearfix pl20 pt5 pb5 pr20">
                    {(visitDataInfoDtos&&visitDataInfoDtos.length>0)?
                        <div className="left" id='pageAtion'>
                            <Pagination
                                showQuickJumper
                                showSizeChanger
                                onShowSizeChange={this.onShowSizeChange.bind(this)}
                                defaultPageSize={this.state.barsNum}
                                defaultCurrent={1}
                                current={this.state.current}
                                total={this.state.totalSize}
                                onChange={this.pageChange.bind(this)}
                                pageSizeOptions={['10','25','50','100','200','500','1000']}
                            />
                        </div>
                    :""}
                </div>
                
                {/*分配弹窗*/}
                <div className="dispatch-pop hidden">
                    <div className="tanc_bg"></div>
                    <div className="dispatch-box clearfix">
                        <div className="left search-box clearfix mr10 dispathToName" id='dispathToName'>
                            <Select
                                showSearch
                                allowClear
                                style={{ width: 200 }}
                                placeholder="请选择"
                                optionFilterProp="children"
                                onSelect={this.handleChange.bind(this)}
                                onChange={this.distributeDeselect.bind(this)}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {
                                    (adminNameMaps && adminNameMaps.length>0) ? adminNameMaps.map((repy,i)=>{
                                        return <Option value={repy.code} key={i}>{repy.name}</Option>
                                    }):<option value = "">没有数据</option>
                                }
                            </Select>
                        </div>
                        <a className="btn-deep-yellow left mr10" id='distribute' style={{"height":"30px","lineHeight":"30px"}} onClick={this.distribute.bind(this)}>确定</a>
                        <a className="btn-white left" id='closeDispatchPop' style={{"height":"28px","lineHeight":"28px"}} onClick={this.closeDispatchPop.bind(this)}>取消</a>
                    </div>
                </div>
            </div>
        );
    }
};

export default AvisitRepayment;