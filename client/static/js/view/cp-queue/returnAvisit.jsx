// 回访queue cp-portal
import React from 'react';
import $ from 'jquery';
import { Pagination,DatePicker } from 'antd';  
import {observer,inject} from "mobx-react";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import Channel from '../cp-module/channel'; //选择合作方select

@inject('allStore') @observer
class ReturnAvisit extends React.Component {
    constructor(props){
        super(props);
        // this.store=this.props.allStore.SearchResultTrStore;
        this.state = {
            visitDataInfoDtos:[],  //搜索结果
            channelSelectedObj:{},  //条件区选中的渠道
            barsNum:10,  //每页显示多少条
            current:1,
            totalSize:0,
        };
    }
    componentDidMount() {
        this.init();
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
      paydisabledStartDate = (paystartValue) => {
          const payendValue = this.state.payendValue;
          if (!paystartValue || !payendValue) {
            return false;
          }
          return paystartValue.valueOf() <= payendValue.valueOf()-3542400000;
        }
        paydisabledEndDate = (payendValue) => {
          const paystartValue = this.state.paystartValue;
          if (!payendValue || !paystartValue) {
            return false;
          }
          return payendValue.valueOf() >= paystartValue.valueOf()+3542400000;
        }
        payonStartChange = (value) => {
          this.onChange('paystartValue', value);
        }
        payonEndChange = (value) => {
          this.onChange('payendValue', value);
        }
        payhandleStartOpenChange = (open) => {
          if (!open) {
            this.setState({ payendOpen: true });
          }
        }
        payhandleEndOpenChange = (open) => {
          this.setState({ payendOpen: open });
        }
      //客服处理量--搜索时间
      visitdisabledStartDate = (visitstartValue) => {
          const visitendValue = this.state.visitendValue;
          if (!visitstartValue || !visitendValue) {
          return false;
          }
          return visitstartValue.valueOf() <= visitendValue.valueOf()-3542400000;
      }
      visitdisabledEndDate = (visitendValue) => {
          const visitstartValue = this.state.visitstartValue;
          if (!visitendValue || !visitstartValue) {
          return false;
          }
          return visitendValue.valueOf() >= visitstartValue.valueOf()+3542400000;
      }
      visitonStartChange = (value) => {
          this.onChange('visitstartValue', value);
      }
      visitonEndChange = (value) => {
          this.onChange('visitendValue', value);
      }
      visithandleStartOpenChange = (open) => {
          if (!open) {
          this.setState({ visitendOpen: true });
          }
      }
      visithandleEndOpenChange = (open) => {
          this.setState({ visitendOpen: open });
      }
      
    //授信时间--搜索时间
    creditExtensionStartDate = (creditExtensionstartValue) => {
        const creditExtensionendValue = this.state.creditExtensionendValue;
        if (!creditExtensionstartValue || !creditExtensionendValue) {
        return false;
        }
        return creditExtensionstartValue.valueOf() <= creditExtensionendValue.valueOf()-3542400000;
    }
    creditExtensionEndDate = (creditExtensionendValue) => {
        const creditExtensionstartValue = this.state.creditExtensionstartValue;
        if (!creditExtensionendValue || !creditExtensionstartValue) {
        return false;
        }
        return creditExtensionendValue.valueOf() >= creditExtensionstartValue.valueOf()+3542400000;
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
    //提取时间--搜索时间
    extractStartDate = (extractstartValue) => {
        const extractendValue = this.state.extractendValue;
        if (!extractstartValue || !extractendValue) {
        return false;
        }
        return extractstartValue.valueOf() <= extractendValue.valueOf()-3542400000;
    }
    extractEndDate = (extractendValue) => {
        const extractstartValue = this.state.extractstartValue;
        if (!extractendValue || !extractstartValue) {
        return false;
        }
        return extractendValue.valueOf() >= extractstartValue.valueOf()+3542400000;
    }
    extractStartChange = (value) => {
        this.onChange('extractstartValue', value);
    }
    extractEndChange = (value) => {
        this.onChange('extractendValue', value);
    }
    extractStartOpenChange = (open) => {
        if (!open) {
        this.setState({ extractOpen: true });
        }
    }
    extractEndOpenChange = (open) => {
        this.setState({ extractOpen: open });
    }
    //实际还款时间--搜索时间
    realityRepayStartDate = (realityRepayValue) => {
        const visitendValue = this.state.visitendValue;
        if (!realityRepayValue || !visitendValue) {
        return false;
        }
        return realityRepayValue.valueOf() <= visitendValue.valueOf()-3542400000;
    }
    realityRepayEndDate = (visitendValue) => {
        const realityRepayValue = this.state.realityRepayValue;
        if (!visitendValue || !realityRepayValue) {
        return false;
        }
        return visitendValue.valueOf() >= realityRepayValue.valueOf()+3542400000;
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
    
    //放款时间--搜索时间
    creditStartDate = (creditstartValue) => {
        const creditendValue = this.state.creditendValue;
        if (!creditstartValue || !creditendValue) {
        return false;
        }
        return creditstartValue.valueOf() <= creditendValue.valueOf()-3542400000;
    }
    creditEndDate = (creditendValue) => {
        const creditstartValue = this.state.creditstartValue;
        if (!creditendValue || !creditstartValue) {
        return false;
        }
        return creditendValue.valueOf() >= creditstartValue.valueOf()+3542400000;
    }
    creditStartChange = (value) => {
        this.onChange('creditstartValue', value);
    }
    creditEndChange = (value) => {
        this.onChange('creditendValue', value);
    }
    creditStartOpenChange = (open) => {
        if (!open) {
        this.setState({ creditOpen: true });
        }
    }
    creditEndOpenChange = (open) => {
        this.setState({ creditOpen: open });
    }
    //Table 组件页码
    formatLengthMenu(lengthMenu) {
        return (
            <div className="table-length">
                <span> 每页 </span>
                {lengthMenu}
                <span> 条 </span>
            </div>
        );
    }
    formatInfo(total, activePage) {
        return (
            <span>共 <i>{total}</i> 条数据</span>
        );
    }
    // 全选
    selectAll(){
        let doms_normal=$(".search-result .rsuite-table-body-wheel-area .myCheckbox-normal");
        doms_normal.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
    }
    //渠道切换事件
    channelChange(channelSelectedObj){
        this.setState({
            channelSelectedObj:channelSelectedObj
        })
    }
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            current: 1,
            barsNum:pageSize
        });
        this.searchHandle(true,1,pageSize);
    }
    //快速跳转到某一页。
    pageChange(page){
        this.setState({
            current: page
        });
        this.searchHandle(true,page,this.state.barsNum);
    }
    //获取条件
    getConditions(){
        commonJs.resetCondition(this);
        let _parems={};  //条件
        let channelVal=this.state.channelSelectedObj.value;
        if(channelVal=="9F"||channelVal=="14A"||channelVal=="14F"){
            let _authTimeBegin=commonJs.dateToString2(this.state.creditExtensionstartValue);   //授信时间-开始
            if(_authTimeBegin!="1970-01-01" && _authTimeBegin!='NaN-aN-aN')_parems.authTimeBegin=_authTimeBegin;  
            let _authTimeEnd=commonJs.dateToString2(this.state.creditExtensionendValue);   //授信时间-结束
            if(_authTimeEnd!="1970-01-01" && _authTimeEnd!='NaN-aN-aN')_parems.authTimeEnd=_authTimeEnd;  
            let _extractTimeBegin=commonJs.dateToString2(this.state.extractstartValue);   //提取时间-开始
            if(_extractTimeBegin!="1970-01-01" && _extractTimeBegin!='NaN-aN-aN')_parems.extractTimeBegin=_extractTimeBegin;  
            let _extractTimeEnd=commonJs.dateToString2(this.state.extractendValue);   //提取时间-结束
            if(_extractTimeEnd!="1970-01-01" && _extractTimeEnd!='NaN-aN-aN')_parems.extractTimeEnd=_extractTimeEnd; 
            let _actualPayTimeBegin=commonJs.dateToString2(this.state.realityRepaystartValue);   //实际还款日期-开始
            if(_actualPayTimeBegin!="1970-01-01" && _actualPayTimeBegin!='NaN-aN-aN')_parems.actualPayTimeBegin=_actualPayTimeBegin;  
            let _actualPayTimeEnd=commonJs.dateToString2(this.state.realityRepayendValue);   //实际还款日期-结束
            if(_actualPayTimeEnd!="1970-01-01" && _actualPayTimeEnd!='NaN-aN-aN')_parems.actualPayTimeEnd=_actualPayTimeEnd; 
            let _revisitTimes=$(".revisitTimes option:selected").attr("value");   //回访次数
            if(_revisitTimes)_parems.revisitTimes=_revisitTimes;
            let _authAmount=$(".authAmount option:selected").attr("value");   //授信金额
            if(_authAmount)_parems.authAmount=_authAmount;
            let _extractTimes=$(".extractTimes option:selected").attr("value");   //已提取次数
            if(_extractTimes)_parems.extractTimes=_extractTimes;
            let _overdueDays=$(".overdueDays option:selected").attr("value");   //逾期天数
            if(_overdueDays)_parems.overdueDays=_overdueDays;
            // let _overdueDays1=$(".overdueDays option:selected").attr("value");   //前期费=======================
            // if(_overdueDays1)_parems.overdueDays=_overdueDays1;
            let _recentlyPayType=$(".recentlyPayType option:selected").attr("value");   //最近一次还款方式
            if(_recentlyPayType)_parems.recentlyPayType=_recentlyPayType;
            let _extractType=$(".extractType option:selected").attr("value");   //抽取方式
            if(_extractType)_parems.extractType=_extractType;
            let _extractPercent=$(".extractPercent").val();   //抽取比例
            if(_extractPercent && _extractPercent.replace(/\s/g,""))_parems.extractPercent=_extractPercent;
        }else if(channelVal=="24A"){
            let _fundTimeBegin=commonJs.dateToString2(this.state.paystartValue);   //放款时间-开始
            if(_fundTimeBegin!="1970-01-01" && _fundTimeBegin!='NaN-aN-aN')_parems.fundTimeBegin=_fundTimeBegin;  
            let _fundTimeEnd=commonJs.dateToString2(this.state.payendValue);   //放款时间-结束
            if(_fundTimeEnd!="1970-01-01" && _fundTimeEnd!='NaN-aN-aN')_parems.fundTimeEnd=_fundTimeEnd; 
            let _extractTimeEnd=commonJs.dateToString2(this.state.extractendValue);   //提取时间-结束
            if(_extractTimeEnd!="1970-01-01" && _extractTimeEnd!='NaN-aN-aN')_parems.extractTimeEnd=_extractTimeEnd; 
            let _actualPayTimeBegin=commonJs.dateToString2(this.state.realityRepaystartValue);   //实际还款日期-开始
            if(_actualPayTimeBegin!="1970-01-01" && _actualPayTimeBegin!='NaN-aN-aN')_parems.actualPayTimeBegin=_actualPayTimeBegin;  
            let _actualPayTimeEnd=commonJs.dateToString2(this.state.realityRepayendValue);   //实际还款日期-结束
            if(_actualPayTimeEnd!="1970-01-01" && _actualPayTimeEnd!='NaN-aN-aN')_parems.actualPayTimeEnd=_actualPayTimeEnd; 
            let _revisitTimes=$(".revisitTimes option:selected").attr("value");   //回访次数
            if(_revisitTimes)_parems.revisitTimes=_revisitTimes;
            let _repaymounts=$(".repaymounts option:selected").attr("value");   //放款金额（和授信金额一样参数）
            if(_repaymounts)_parems.authAmount=_repaymounts;
            let _overdueDays=$(".overdueDays option:selected").attr("value");   //逾期天数
            if(_overdueDays)_parems.overdueDays=_overdueDays;
            let _recentlyPayType=$(".recentlyPayType option:selected").attr("value");   //最近一次还款方式
            if(_recentlyPayType)_parems.recentlyPayType=_recentlyPayType;
            let _payoff=$(".payoff option:selected").attr("value");   //是否结清
            if(_payoff)_parems.payoff=_payoff;
            let _extractType=$(".extractType option:selected").attr("value");   //抽取方式
            if(_extractType)_parems.extractType=_extractType;
            let _extractPercent=$(".extractPercent").val();   //抽取比例
            if(_extractPercent && _extractPercent.replace(/\s/g,""))_parems.extractPercent=_extractPercent;
        }else{

        }
        this.setState({
            conditions:_parems
        })
    }
    //搜索 oldConditions等于true则需要获取已经存在的条件，否则重新获取搜索条件
    searchHandle(oldConditions,pageNumber,pagesize){
        let that=this;
        let _parems=this.getConditions();
        if(oldConditions){
            _parems=this.state.conditions;
        }
        if(Object.keys(_parems).length<=0){
            alert("请选择搜索条件！")
            return;
        }
        let channelVal=this.state.channelSelectedObj.value;
        if(!channelVal){
            alert("请选择合作方！")
            return;
        }
        if(channelVal)_parems.cooperationFlag=channelVal;   //合作方
        _parems.pageNumber=pageNumber;
        _parems.pagesize=pagesize;
        $.ajax({
             type:"post", 
             url:"/node/reV/searchDa", 
             async:true,
             dataType: "JSON", 
             data:_parems, 
             success:function(res){
                 if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        visitDataInfoDtos:[]
                    })
                     return;
                 }
                 let _data=res.data;
                 let _visitDataInfoDtos=_data.visitDataInfoDtos; //搜索结果list
                 that.setState({
                    visitDataInfoDtos:_visitDataInfoDtos?_visitDataInfoDtos:[]
                 })
            }
        })
    }
    //分配
    distribute(){
        let that=this;
        let _param = {
            unBinds:_unBinds
        };
        $.ajax({
            type:"post", 
            url:"/cpSearch/reV/assign", 
            async:true,
            dataType: "JSON", 
            data:{josnParam:JSON.stringify(_param)}, 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                   that.setState({
                       checkQueueInfoDTOS:[]
                   })
                    return;
                }
                let _data=res.data;
                let _checkQueueInfoDTOS=_data.checkQueueInfoDTOS; //搜索结果list
                that.setState({
                   checkQueueInfoDTOS:_checkQueueInfoDTOS?_checkQueueInfoDTOS:[]
                })
           }
       })
    }
    render() {
        let { paystartValue, payendValue, payendOpen,
            visitstartValue, visitendValue, visitendOpen,
            creditExtensionstartValue,creditExtensionendValue,creditExtensionOpen,
            extractstartValue,extractendValue,extractOpen,
            realityRepaystartValue,realityRepayendValue,realityRepayOpen,
            creditstartValue,creditendValue,creditOpen,
         } = this.state;  //搜索条件区的日期
        let visitDataInfoDtos=this.state.visitDataInfoDtos?this.state.visitDataInfoDtos:[];
        let selectedChannelVal=this.state.channelSelectedObj.value;  //条件区选中的渠道
        let TableHeight=0;
        if(visitDataInfoDtos){
            let listInfoLength=visitDataInfoDtos.length;
            if(listInfoLength>0 && listInfoLength<10){
                TableHeight=listInfoLength*55;
            }else if(listInfoLength>=10){
                TableHeight=350;
            }
        }
        return (
            <div  className="content" id="content">
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar return-visit-condition clearfix pb5">
                    <dl className="left mt10">
                        <dt className="left">产品</dt>
                        <dd><Channel onChange={this.channelChange.bind(this)} /></dd>  {/* 合作方 */}
                    </dl>
                    {
                        (selectedChannelVal!="9F"&&selectedChannelVal!="14A"&&selectedChannelVal!="24A")?
                        <dl className="left mt10">
                            <dt>放款天数</dt>
                            <dd>
                                <select className="select-gray" name="" id="loanDay">
                                    <option value="" hidden>请选择</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal!="9F"&&selectedChannelVal!="14A"&&selectedChannelVal!="24A")?
                        <dl className="left mt10">
                            <dt>回访状态</dt>
                            <dd>
                                <select className="select-gray" name="" id="avisitType">
                                    <option value="" hidden>是/否</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal!="9F"&&selectedChannelVal!="14A"&&selectedChannelVal!="24A")?
                        <dl className="left mt10">
                            <dt>贷款状态</dt>
                            <dd>
                                <select className="select-gray" name="" id="loanType">
                                    <option value="" hidden>请选择</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal!="9F"&&selectedChannelVal!="14A"&&selectedChannelVal!="24A")?
                        <dl className="left mt10">
                            <dt>逾期天数</dt>
                            <dd>
                                <select className="select-gray overdueDays" name="" id="overdueDays">
                                    <option value="" hidden>请选择</option>
                                    <option value="">0</option>
                                    <option value="">1</option>
                                    <option value="">2</option>
                                    <option value="">3</option>
                                    <option value="">4</option>
                                    <option value="">5</option>
                                    <option value="">≧6</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal!="9F"&&selectedChannelVal!="14A"&&selectedChannelVal!="24A")?
                        <dl className="left mt10">
                            <dt>回访具体状态</dt>
                            <dd>
                                <select className="select-gray" name="" id="avisitSpecificType">
                                    <option value="" hidden>请选择</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal!="9F"&&selectedChannelVal!="14A"&&selectedChannelVal!="24A")?
                        <dl className="left mt10">
                            <dt>放款方式</dt>
                            <dd>
                                <select className="select-gray" name="" id="loanWay">
                                    <option value="" hidden>请选择</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal!="9F"&&selectedChannelVal!="14A"&&selectedChannelVal!="24A")?
                        <dl className="left mt10">
                            <dt>放款日期</dt>
                            <dd>
                                <div style={{"width":"45%","display":"inline-block"}} id='paystartValue'>
                                    <DatePicker
                                        disabledDate={this.paydisabledStartDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={paystartValue}
                                        placeholder="Start"
                                        onChange={this.payonStartChange.bind(this)}
                                        onOpenChange={this.payhandleStartOpenChange.bind(this)}
                                    />
                                </div>
                                    <span className="pl5 pr5">-</span>
                                    <div style={{"width":"45%","display":"inline-block"}} id='payendValue'>
                                        <DatePicker
                                            disabledDate={this.paydisabledEndDate.bind(this)}
                                            format="YYYY-MM-DD"
                                            value={payendValue}
                                            placeholder="End"
                                            onChange={this.payonEndChange.bind(this)}
                                            open={payendOpen}
                                            onOpenChange={this.payhandleEndOpenChange.bind(this)}
                                        />
                                    </div>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal!="9F"&&selectedChannelVal!="14A"&&selectedChannelVal!="24A")?
                        <dl className="left mt10">
                            <dt>上次回访日期</dt>
                            <dd>
                                <div style={{"width":"45%","display":"inline-block"}} id='visitstartValue'>
                                    <DatePicker
                                        disabledDate={this.visitdisabledStartDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={visitstartValue}
                                        placeholder="Start"
                                        onChange={this.visitonStartChange.bind(this)}
                                        onOpenChange={this.visithandleStartOpenChange.bind(this)}
                                    />
                                </div>
                                <span className="pl5 pr5">-</span>
                                <div style={{"width":"45%","display":"inline-block"}} id='visitendValue'>
                                    <DatePicker
                                        disabledDate={this.visitdisabledEndDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={visitendValue}
                                        placeholder="End"
                                        onChange={this.visitonEndChange.bind(this)}
                                        open={visitendOpen}
                                        onOpenChange={this.visithandleEndOpenChange.bind(this)}
                                    />
                                </div>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="14F")?
                        <dl className="left mt10">
                            <dt>授信日期</dt>
                            <dd>
                                <div style={{"width":"45%","display":"inline-block"}} id='creditExtensionstartValue'>
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
                                <div style={{"width":"45%","display":"inline-block"}} id='creditExtensionendValue'>
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
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="14F")?
                        <dl className="left mt10">
                            <dt>提取日期</dt>
                            <dd>
                                <div style={{"width":"45%","display":"inline-block"}} id='extractstartValue'>
                                    <DatePicker
                                        disabledDate={this.extractStartDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={extractstartValue}
                                        placeholder="Start"
                                        onChange={this.extractStartChange.bind(this)}
                                        onOpenChange={this.extractStartOpenChange.bind(this)}
                                    />
                                </div>
                                <span className="pl5 pr5">-</span>
                                <div style={{"width":"45%","display":"inline-block"}} id='extractendValue'>
                                    <DatePicker
                                        disabledDate={this.extractEndDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={extractendValue}
                                        placeholder="End"
                                        onChange={this.extractEndChange.bind(this)}
                                        open={extractOpen}
                                        onOpenChange={this.extractEndOpenChange.bind(this)}
                                    />
                                </div>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="24A"||selectedChannelVal=="14F")?
                        <dl className="left mt10">
                            <dt>实际还款日期</dt>
                            <dd>
                                <div style={{"width":"45%","display":"inline-block"}} id='realityRepaystartValue'>
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
                                <div style={{"width":"45%","display":"inline-block"}} id='realityRepayendValue'>
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
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="24A"||selectedChannelVal=="14F")?
                        <dl className="left mt10">
                            <dt>回访次数</dt>
                            <dd>
                                <select className="select-gray revisitTimes" name="" id="revisitTimes">
                                    <option value="" hidden>请选择</option>
                                    <option value="">全部</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="14F")?
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
                        (selectedChannelVal=="24A")?
                        <dl className="left mt10">
                            <dt>放款金额</dt>
                            <dd>
                                <select className="select-gray repaymounts" name="" id="repaymounts">
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
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="14F")?
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
                                    <option value="≧6">≧6</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="24A"||selectedChannelVal=="14F")?
                        <dl className="left mt10">
                            <dt>逾期天数</dt>
                            <dd>
                                <select className="select-gray" name="" id="overDueDay">
                                    <option value="" hidden>请选择</option>
                                    <option value="">全部</option>
                                    <option value="">0</option>
                                    <option value="">1</option>
                                    <option value="">2</option>
                                    <option value="">3</option>
                                    <option value="">4</option>
                                    <option value="">5</option>
                                    <option value="">≧6</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {/* {
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="14F")?
                        <dl className="left mt10">
                            <dt>前期费</dt>
                            <dd>
                                <select className="select-gray" name="" id="">
                                    <option value="" hidden>请选择</option>
                                    <option value="">全部</option>
                                    <option value="1">有</option>
                                    <option value="0">无</option>
                                </select>
                            </dd>
                        </dl>:""
                    } */}
                    {
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="24A"||selectedChannelVal=="14F")?
                        <dl className="left mt10">
                            <dt>末次还款方式</dt>
                            <dd>
                                <select className="select-gray recentlyPayType" name="" id="recentlyPayType">
                                    <option value="" hidden>请选择</option>
                                    <option value="">全部</option>
                                    <option value="offline paid">offline paid</option>
                                    <option value="paid">paid</option>
                                    <option value="blind">blind</option>
                                    <option value="deposits">deposits</option>
                                    <option value="prepayment">prepayment</option>
                                    <option value="未知渠道">未知渠道</option>
                                    <option value="主动扣款-未知">主动扣款-未知</option>
                                    <option value="线下转账-招行转账">线下转账-招行转账</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="24A"||selectedChannelVal=="14F")?
                        <dl className="left mt10">
                            <dt>抽取方式</dt>
                            <dd>
                                <select className="select-gray extractType" name="" id="extractType">
                                    <option value="" hidden>全部</option>
                                    <option value="随机">随机</option>
                                    {/* <option value="顺序（越晚签约越靠前）">顺序（越晚签约越靠前）</option> */}
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {/* {
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="14F")?
                        <dl className="left mt10">
                            <dt>个数合计</dt>
                            <dd>
                                <input type="text" className="input" placeholder="自动弹出========" style={{"width":"100%"}} />
                            </dd>
                        </dl>:""
                    } */}
                    {
                        (selectedChannelVal=="9F"||selectedChannelVal=="14A"||selectedChannelVal=="24A"||selectedChannelVal=="14F")?
                        <dl className="left mt10">
                            <dt>抽取比例</dt>
                            <dd>
                                <input type="text" className="input extractPercent" id='extractPercent' placeholder="请输入" style={{"width":"93%","textAlign":"right"}} />%
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal=="24A")?
                        <dl className="left mt10">
                            <dt>是否结清</dt>
                            <dd>
                                <select className="select-gray payoff" name="" id="payoff">
                                    <option value="" hidden>请选择</option>
                                    <option value="">全部</option>
                                    <option value="已结清">已结清</option>
                                    <option value="还款中">还款中</option>
                                </select>
                            </dd>
                        </dl>:""
                    }
                    {
                        (selectedChannelVal=="24A")?
                        <dl className="left mt10">
                            <dt>放款日期</dt>
                            <dd>
                                <div style={{"width":"45%","display":"inline-block"}} id='creditstartValue'>
                                    <DatePicker
                                        disabledDate={this.creditStartDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={creditstartValue}
                                        placeholder="Start"
                                        onChange={this.creditStartChange.bind(this)}
                                        onOpenChange={this.creditStartOpenChange.bind(this)}
                                    />
                                </div>
                                <span className="pl5 pr5">-</span>
                                <div style={{"width":"45%","display":"inline-block"}} id='creditendValue'>
                                    <DatePicker
                                        disabledDate={this.creditEndDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={creditendValue}
                                        placeholder="End"
                                        onChange={this.creditEndChange.bind(this)}
                                        open={creditOpen}
                                        onOpenChange={this.creditEndOpenChange.bind(this)}
                                    />
                                </div>
                            </dd>
                        </dl>:""
                    }
                    <div className="right mt10 mr10">
                        <button className="btn-blue left mr5" id='searchBtn' onClick={this.searchHandle.bind(this,false,1,this.state.barsNum)}>搜索</button>
                        <button className="btn-white left" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                    </div>
                </div>
                {/* 搜索条件 end */}
                <div  className="mt20 search-result" style={{"background":"#f5f5f5"}}>
                    <table className="pt-table layout-fixed workAllot-list">
                        <tbody>
                            <tr className="th-bg">
                                <th width="15%">合同号</th>
                                <th width="7%">姓名</th>
                                <th width="10%">订单号</th>
                                <th width="15%">放款日期</th>
                                <th width="15%">还款日期</th>
                                <th width="5%">放款金额</th>
                                <th width="5%">逾期天数</th>
                                <th width="10%">门店</th>
                                <th width="7%">业务员</th>
                                <th>
                                    <a  className="btn-white left mr5" onClick={this.selectAll.bind(this)}>全选</a>
                                    <a  className="btn-blue left">分配</a>
                                </th>
                            </tr>
                            {
                                (visitDataInfoDtos && visitDataInfoDtos.length>0)?visitDataInfoDtos.map((repy,i)=>{
                                    return <tr key={i}>
                                                <td width="15%" title={commonJs.is_obj_exist(repy.loanNumber)}>{commonJs.is_obj_exist(repy.loanNumber)}</td>
                                                <td width="7%" title={commonJs.is_obj_exist(repy.custName)}>{commonJs.is_obj_exist(repy.custName)}</td>
                                                <td width="10%" title={commonJs.is_obj_exist(repy.orderNo)}>{commonJs.is_obj_exist(repy.orderNo)}</td>
                                                <td width="15%" title={commonJs.is_obj_exist(repy.fundingSuccessDate)}>{commonJs.is_obj_exist(repy.fundingSuccessDate)}</td>
                                                <td width="15%" title={commonJs.is_obj_exist(repy.completeTime)}>{commonJs.is_obj_exist(repy.completeTime)}</td>
                                                <td width="5%" title={commonJs.is_obj_exist(repy.loanAmount)}>{commonJs.is_obj_exist(repy.loanAmount)}</td>
                                                <td width="5%" title={commonJs.is_obj_exist(repy.daysInDefault)}>{commonJs.is_obj_exist(repy.daysInDefault)}</td>
                                                <td width="10%" title={commonJs.is_obj_exist(repy.storeName)}>{commonJs.is_obj_exist(repy.storeName)}</td>
                                                <td width="7%" title={commonJs.is_obj_exist(repy.employeeName)}>{commonJs.is_obj_exist(repy.employeeName)}</td>
                                                <td><i className="myCheckbox myCheckbox-normal" onClick={commonJs.myCheckbox.bind(this)}></i></td>
                                            </tr>
                                }):<tr><td colSpan="3" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
                <div className="cdt-th th-bg clearfix pl20 pt5 pb5 pr20">
                            {visitDataInfoDtos?
                                <div className="left" id='pageAtion'>
                                    <Pagination
                                        showQuickJumper
                                        showSizeChanger
                                        onShowSizeChange={this.onShowSizeChange.bind(this)}
                                        defaultPageSize={this.state.barsNum}
                                        defaultCurrent={1}
                                        current={this.state.current}
                                        total={visitDataInfoDtos?visitDataInfoDtos.length:0}
                                        onChange={this.pageChange.bind(this)}
                                        pageSizeOptions={['10','25','50','100']}
                                    />
                                </div>
                            :""}
                        </div>
            </div>
        );
    }
};

export default ReturnAvisit;