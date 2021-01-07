// 实时看板  cp-portal
import React,{PureComponent} from 'react';
import $ from 'jquery';
import { DatePicker,Pagination } from 'antd';  
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})
import Channel from '../cp-module/channel'; //选择合作方select

@inject('allStore') @observer
class RTboard extends React.Component{
    constructor(props){
        super(props);
        this.state={
            T1currentpage:1,  //初始化页码
            T1pageLength:10,  
            SVcurrentpage:1,  //初始化页码
            SVpageLength:10,  

            T1startValue: null,
            T1endValue: null,
            T1endOpen: false,
            SVstartValue: null,
            SVendValue: null,
            SVendOpen: false,

            T1conditions:{},
            SVconditions:{}
        }
    }
    componentDidMount(){
        this.getMsg();
        this.getChanel();
    }
    //快速跳转到某一页
    T1ChangePage(pageNumber) {
        this.setState({
            T1currentpage:pageNumber
        },()=>{
           
        })
    }
    SVChangePage(pageNumber) {
        this.setState({
            SVcurrentpage:pageNumber
        },()=>{
           
        })
    }
    //修改每页显示条数
    T1ChangeLength(current, pageSize){
        this.setState({
            T1currentpage:1
        },()=>{
            this.setState({
                T1pageLength:pageSize
            })
        })
    }
    SVChangeLength(current, pageSize){
        this.setState({
            SVcurrentpage:1
        },()=>{
            this.setState({
                SVpageLength:pageSize
            })
        })
    }
    //获取产品类型列表
    getChanel(){
        let that=this;
        $.ajax({
            type:"get", 
            url:"/node/real/productNoEnums", 
            async:true,
            dataType: "JSON", 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        channelArr:[]
                    })
                    return;
                }
                var _data=res.data;
                that.setState({
                    channelArr:_data.productEnums?_data.productEnums:[]
                })
           }
       })
    }
    //获取页面数据
    getMsg(){
        let that=this;
        $.ajax({
            type:"post",
            url:"/node/real/board",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        realByProductData:[],  //产品内容
                        titles:[],  //产品表头
                        realByRepData:[],  //rep
                        repTitles:[],  //rep表头
                    })
                    return;
                }
                let _data=res.data;
                that.setState({
                    realByProductData:_data.realByProductData?_data.realByProductData:[],  //产品内容
                    titles:_data.titles?_data.titles:[],  //产品表头
                    realByRepData:_data.realByRepData?_data.realByRepData:[],  //rep
                    repTitles:_data.repTitles?_data.repTitles:[],  //rep表头
                })
            }
        })
    }
    
    T1search(){
        let that=this;
        let _productTypeCode=$(".T1ProductNo select option:selected").attr("value");
        if(!_productTypeCode){
            alert("请选择合作方！");
            return;
        }
        let _startTime=commonJs.dateToString2(this.state.T1startValue);
        if(_startTime=="1970-01-01"){
            alert("请选择开始时间！");
            return;
        }
        let _endTime=commonJs.dateToString2(this.state.T1endValue);
        if(_endTime=="1970-01-01"){
            alert("请选择结束时间！");
            return;
        }
        let _parems={
            productTypeCode:_productTypeCode,
            startTime:_startTime,
            endTime:_endTime,
            type:"loan"
        };
        $.ajax({
            type:"post",
            url:"/node/real/loanOrServiceSize",
            async:true,
            data:{josnParam:JSON.stringify(_parems)},
            dataType: "JSON",
            beforeSend:function(XMLHttpRequest){
                let loading_html='<div id="loading">'+
                                        '<div class="tanc_bg"></div>'+
                                        '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                    '</div>';
                $("body").append(loading_html);       
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        T1searchData:{},
                        T1conditions:{}
                    });
                    return;
                }
                that.setState({
                    T1searchData:res.data,
                    T1conditions:_parems
                });
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        });
        $(".T1content").removeClass("hidden");
        $(".T1DIV").find(".bar-tit-toggle").removeClass("bar-tit-toggle-down").addClass("bar-tit-toggle-up");
    }
    SVsearch(){
        let that=this;
        let _productTypeCode=$(".SVProductNo select option:selected").attr("value");
        if(!_productTypeCode){
            alert("请选择合作方！");
            return;
        }
        let _startTime=commonJs.dateToString2(this.state.SVstartValue);
        if(_startTime=="1970-01-01"){
            alert("请选择开始时间！");
            return;
        }
        let _endTime=commonJs.dateToString2(this.state.SVendValue);
        if(_endTime=="1970-01-01"){
            alert("请选择结束时间！");
            return;
        }
        let _parems={
            productTypeCode:_productTypeCode,
            startTime:_startTime,
            endTime:_endTime,
            type:"service"
        };
        $.ajax({
            type:"post",
            url:"/node/real/loanOrServiceSize",
            async:true,
            data:{josnParam:JSON.stringify(_parems)},
            dataType: "JSON",
            beforeSend:function(XMLHttpRequest){
                let loading_html='<div id="loading">'+
                                        '<div class="tanc_bg"></div>'+
                                        '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                    '</div>';
                $("body").append(loading_html);       
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        SVsearchData:{},
                        SVconditions:{}
                    });
                    return;
                }
                that.setState({
                    SVsearchData:res.data,
                    SVconditions:_parems
                });
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        });
        $(".SVcontent").removeClass("hidden");
        $(".SVDIV").find(".bar-tit-toggle").removeClass("bar-tit-toggle-down").addClass("bar-tit-toggle-up");
    }
    //重置按钮
    reset(p,sTime,eTime){
        $("."+p+" option").removeProp("selected");
        $("."+p+" option[data-optionId='0']").prop("selected","true");
        $(".bar-tit").find("input").val("");
        this.setState({
            [sTime]: null,
            [eTime]: null
        })
    }
    // 展开||收起 toggle-box
    content_toggle(event){
        let target=$(event.target);
        let _this=target;
        if(target.hasClass("toggle-tit")){
            _this=target;
        }else{
            _this=target.closest(".toggle-tit");
        }
        if(_this.next().hasClass("hidden")){
            _this.parent().siblings().find("h2.bar").find(".bar-tit-toggle").removeClass("bar-tit-toggle-up").addClass("bar-tit-toggle-down");

            _this.find(".bar-tit-toggle").removeClass("bar-tit-toggle-down").addClass("bar-tit-toggle-up");
            _this.nextAll().removeClass("hidden");
            _this.find(".tit").addClass("on");
        }else {
            _this.find(".bar-tit-toggle").removeClass("bar-tit-toggle-up").addClass("bar-tit-toggle-down");
            _this.nextAll().addClass("hidden");
            _this.find(".tit").removeClass("on");
        }
    }

    //T+1贷款量--搜索时间
    onChange = (field, value) => {
      this.setState({
        [field]: value,
      });
    }//--公用
    T1disabledStartDate = (T1startValue) => {
        const T1endValue = this.state.T1endValue;
        if (!T1startValue || !T1endValue) {
          return false;
        }
        return T1startValue.valueOf() <= T1endValue.valueOf()-3542400000;
      }
      T1disabledEndDate = (T1endValue) => {
        const T1startValue = this.state.T1startValue;
        if (!T1endValue || !T1startValue) {
          return false;
        }
        return T1endValue.valueOf() >= T1startValue.valueOf()+3542400000;
      }
      T1onStartChange = (value) => {
        this.onChange('T1startValue', value);
      }
      T1onEndChange = (value) => {
        this.onChange('T1endValue', value);
      }
      T1handleStartOpenChange = (open) => {
        if (!open) {
          this.setState({ T1endOpen: true });
        }
      }
      T1handleEndOpenChange = (open) => {
        this.setState({ T1endOpen: open });
      }
    //客服处理量--搜索时间
    SVdisabledStartDate = (SVstartValue) => {
        const SVendValue = this.state.SVendValue;
        if (!SVstartValue || !SVendValue) {
        return false;
        }
        return SVstartValue.valueOf() <= SVendValue.valueOf()-3542400000;
    }
    SVdisabledEndDate = (SVendValue) => {
        const SVstartValue = this.state.SVstartValue;
        if (!SVendValue || !SVstartValue) {
        return false;
        }
        return SVendValue.valueOf() >= SVstartValue.valueOf()+3542400000;
    }
    SVonStartChange = (value) => {
        this.onChange('SVstartValue', value);
    }
    SVonEndChange = (value) => {
        this.onChange('SVendValue', value);
    }
    SVhandleStartOpenChange = (open) => {
        if (!open) {
        this.setState({ SVendOpen: true });
        }
    }
    SVhandleEndOpenChange = (open) => {
        this.setState({ SVendOpen: open });
    }

    render() {
        const { T1startValue, T1endValue, T1endOpen,SVstartValue, SVendValue, SVendOpen } = this.state;
        const { realByProductData,titles,realByRepData,repTitles} = this.state;  //实时看板数据
        const { T1searchData,SVsearchData} = this.state;  //搜索数据
        return (
            <div className="content" id="content">
                <div>
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit">
                        <span className="tit on">今日数据</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-up" onClick={this.content_toggle.bind(this)}></i>
                        <a className="btn-white right mr20 mt10" id='refreshBtn' onClick={this.getMsg.bind(this)}>刷新数据</a>
                    </h2>
                    <div>
                        <table className="mt5 radius-tab border center rtboard-tab">
                            <tbody>
                                <tr>
                                    <td colSpan="13" className="blue-font" style={{"textAlign":"left"}}>by 产品</td>
                                </tr>
                                <tr className="th-bg">
                                    <th className="slash">
                                        <span className="slash3_01">时间(h)</span><br/>
                                        <span className="slash3_02">处理量</span><br/>
                                        <span className="slash3_03">产品</span>
                                    </th>
                                    {
                                        (titles&&titles.length>0)?titles.map((repy,i)=>{
                                            if(i!=0){
                                                return <th key={i}>{commonJs.is_obj_exist(repy)}</th>
                                            }
                                        }):<th>暂未查到 titles 数据</th>
                                    }
                                </tr>
                                {
                                    (realByProductData&&realByProductData.length>0)?realByProductData.map((repy,i)=>{
                                        return <tr key={i}>
                                            <td className="th-bg">{commonJs.is_obj_exist(repy.product_type_code)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s09)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s10)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s11)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s12)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s13)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s14)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s15)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s16)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s17)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s18)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s19)}</td>
                                            <td>{commonJs.is_obj_exist(repy.total)}</td>
                                        </tr>
                                    }):<tr><td colSpan="12" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                        <table className="mt5 radius-tab border center rtboard-tab">
                            <tbody>
                                <tr>
                                    <td colSpan="16" className="blue-font" style={{"textAlign":"left"}}>by rep</td>
                                </tr>
                                <tr className="th-bg">
                                    <th className="slash">
                                        <span className="slash3_01">时间(h)</span><br/>
                                        <span className="slash3_02">处理量</span><br/>
                                        <span className="slash3_03">操作人</span>
                                    </th>
                                    {
                                        (repTitles&&repTitles.length>0)?repTitles.map((repy,i)=>{
                                            if(i!=0){
                                                return <th key={i}>{commonJs.is_obj_exist(repy)}</th>
                                            }
                                        }):<th>暂未查到 repTitles 数据</th>
                                    }
                                </tr>
                                {
                                    (realByRepData&&realByRepData.length>0)?realByRepData.map((repy,i)=>{
                                        return <tr key={i}>
                                            <td className="th-bg">{commonJs.is_obj_exist(repy.userid)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s09)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s10)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s11)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s12)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s13)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s14)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s15)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s16)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s17)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s18)}</td>
                                            <td>{commonJs.is_obj_exist(repy.s19)}</td>
                                            <td>{commonJs.is_obj_exist(repy.total)}</td>
                                            <td>{commonJs.is_obj_exist(repy.sapp_y)}</td>
                                            <td>{commonJs.is_obj_exist(repy.sdec_y)}</td>
                                            <td>{commonJs.is_obj_exist(repy.pass)}</td>
                                        </tr>
                                    }):<tr><td colSpan="12" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="T1DIV">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit">
                        <span className="left tit">T+1贷款量</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down" onClick={this.content_toggle.bind(this)}></i>
                        <div className="right mr20">
                            <span>产品类型：</span>
                            <div className="mr10 inline-block T1ProductNo" style={{"verticalAlign": "middle"}}>
                                <select name="" id="chaenelSel" className="select-gray left mr10 chaenel">
                                    <option value="" data-optionId="0" hidden>请选择合作方</option>
                                    {
                                        (this.state.channelArr && this.state.channelArr.length>0) ? this.state.channelArr.map((repy,i)=>{
                                            if(!repy){
                                                return <option value="" key={i}></option>
                                            }
                                            return <option value={commonJs.is_obj_exist(repy.value)} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option value=""></option>
                                    }
                                </select>
                            </div>
                            <span>时间段：</span>
                            <span className="mr10" id='T1disabledDate'>
                                <DatePicker
                                    disabledDate={this.T1disabledStartDate.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={T1startValue}
                                    placeholder="Start"
                                    onChange={this.T1onStartChange.bind(this)}
                                    onOpenChange={this.T1handleStartOpenChange.bind(this)}
                                    />
                                    <span className="pl5 pr5">-</span>
                                    <DatePicker
                                    disabledDate={this.T1disabledEndDate.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={T1endValue}
                                    placeholder="End"
                                    onChange={this.T1onEndChange.bind(this)}
                                    open={T1endOpen}
                                    onOpenChange={this.T1handleEndOpenChange.bind(this)}
                                    />
                            </span>
                            <a id='T1search' className="btn-blue inline-block mr5" onClick={this.T1search.bind(this)}>查询</a>
                            <a id='T1searchReset' className="btn-white inline-block" onClick={this.reset.bind(this,"T1ProductNo","T1startValue","T1endValue")}>重置</a>
                        </div>
                    </h2>
                    <div className="hidden bar T1content">
                        <table className="mt5 radius-tab border center rtboard-tab">
                            <tbody>
                                <tr className="th-bg">
                                {
                                    (T1searchData&&T1searchData.titles&& T1searchData.titles.length>0)?T1searchData.titles.map((repy,i)=>{
                                        return <th key={i}>{commonJs.is_obj_exist(repy)}</th>
                                    }):<th>暂未查到 titles 数据</th>
                                }
                                </tr>
                                {
                                    (T1searchData&&T1searchData.loan&& T1searchData.loan.length>0)?T1searchData.loan.map((repy,i)=>{
                                        // let barsNums=this.state.T1pageLength;  //每一页显示条数
                                        // let currentPage=this.state.T1currentpage;  //当前页码
                                        // if(i>=barsNums*(currentPage-1) && i<=(barsNums*currentPage-1)){
                                            return <tr key={i}>
                                            <td>{commonJs.is_obj_exist(repy.dateTime)}</td>
                                            <td>{commonJs.is_obj_exist(repy.pushSize)}</td>
                                            <td>{commonJs.is_obj_exist(repy.apps)}</td>
                                            <td>{commonJs.is_obj_exist(repy.decs)}</td>
                                            <td>{commonJs.is_obj_exist(repy.total)}</td>
                                            <td>{commonJs.is_obj_exist(repy.amount)}</td>
                                            <td>{commonJs.is_obj_exist(repy.avLoanAmount)}</td>
                                            <td>{commonJs.is_obj_exist(repy.untreated18)}</td>
                                            <td>{commonJs.is_obj_exist(repy.coverage18)}</td>
                                            <td>{commonJs.is_obj_exist(repy.untreated24)}</td>
                                            <td>{commonJs.is_obj_exist(repy.coverage24)}</td>
                                            <td>{commonJs.is_obj_exist(repy.pass)}</td>
                                        </tr>
                                        // }
                                    }):<tr><td colSpan="12" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                        {
                            (T1searchData&&T1searchData.loan&& T1searchData.loan.length>0)?
                            <div className="bar">
                                {/* <div className="left ml20 mt5">
                                    <Pagination
                                            showQuickJumper
                                            showSizeChanger
                                            onShowSizeChange={this.T1ChangeLength.bind(this)}
                                            defaultPageSize={this.state.T1pageLength}
                                            defaultCurrent={1}
                                            current={this.state.T1currentpage}
                                            total={(T1searchData&&T1searchData.loan)? T1searchData.loan.length:0}
                                            onChange={this.T1ChangePage.bind(this)}
                                            pageSizeOptions={["10",'50','100','200','500','1000']}
                                        />
                                </div> */}
                                <a id='T1ResultDown' href={"/node/real/export?1=1"+commonJs.toHrefParams(this.state.T1conditions)} target="_blank" className="btn-white right mr20 mt5">导出</a>
                            </div>:""
                        }
                        
                    </div>
                </div>

                <div className="SVDIV">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit">
                        <span className="left tit">客服处理量</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down" id='svCheck' onClick={this.content_toggle.bind(this)}></i>
                        <div className="right mr20">
                            <span>产品类型：</span>
                            <div className="mr10 inline-block SVProductNo" style={{"verticalAlign": "middle"}}>
                                <select name="" id="SVProductNoSel" className="select-gray left mr10 chaenel">
                                    <option value="" data-optionId="0" hidden>请选择合作方</option>
                                    {
                                        (this.state.channelArr && this.state.channelArr.length>0) ? this.state.channelArr.map((repy,i)=>{
                                            if(!repy){
                                                return <option value="" key={i}></option>
                                            }
                                            return <option value={commonJs.is_obj_exist(repy.value)} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option value=""></option>
                                    }
                                </select>
                            </div>
                            <span>时间段：</span>
                            <span className="mr10" id='SVdisabledDate'>
                                <DatePicker
                                    disabledDate={this.SVdisabledStartDate.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={SVstartValue}
                                    placeholder="Start"
                                    onChange={this.SVonStartChange.bind(this)}
                                    onOpenChange={this.SVhandleStartOpenChange.bind(this)}
                                    />
                                    <span className="pl5 pr5">-</span>
                                    <DatePicker
                                    disabledDate={this.SVdisabledEndDate.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={SVendValue}
                                    placeholder="End"
                                    onChange={this.SVonEndChange.bind(this)}
                                    open={SVendOpen}
                                    onOpenChange={this.SVhandleEndOpenChange.bind(this)}
                                />
                            </span>
                            <a id='SVsearchBtn' className="btn-blue inline-block mr5" onClick={this.SVsearch.bind(this)}>查询</a>
                            <a id='SVsearchReset' className="btn-white inline-block" onClick={this.reset.bind(this,"SVProductNo","SVstartValue","SVendValue")}>重置</a>
                        </div>
                    </h2>
                    <div className="hidden bar SVcontent">
                        <table className="mt5 radius-tab border center rtboard-tab">
                            <tbody>
                                <tr className="th-bg SVtitle">
                                    <th width="130" rowSpan="2">日期</th>
                                    {
                                        (SVsearchData&&SVsearchData.userIdList&& SVsearchData.userIdList.length>0)?SVsearchData.userIdList.map((repy,i)=>{

                                            return <th key={i} colSpan="2">{commonJs.is_obj_exist(repy)}</th>
                                        }):<th>暂未查到 userIdList 数据</th>
                                    }
                                </tr>
                                <tr className="SVtitle">
                                    {
                                        (SVsearchData&&SVsearchData.service&& SVsearchData.service.length>0)?SVsearchData.service.map((repy,i)=>{
                                            if(i==0){
                                                let arrays=Object.keys(repy).slice(0,-1);
                                                return arrays.map((objkey,j)=>{
                                                            let titleText="通过率";
                                                            if(j%2==0){
                                                                titleText="总量";
                                                            }
                                                            return <th key={j}>{titleText}</th>
                                                        })
                                            }
                                        }):<th></th>
                                    }
                                </tr>
                                {
                                    (SVsearchData&&SVsearchData.service&& SVsearchData.service.length>0)?SVsearchData.service.map((repy,i)=>{
                                        // let barsNums=this.state.SVpageLength;  //每一页显示条数
                                        // let currentPage=this.state.SVcurrentpage;  //当前页码
                                        // if(i>=barsNums*(currentPage-1) && i<=(barsNums*currentPage-1)){
                                            return <tr key={i}>
                                                {
                                                    Object.keys(repy).map((objkey,j)=>{
                                                        return <td key={j}>{commonJs.is_obj_exist(repy[objkey])}</td>
                                                    })
                                                }
                                            </tr>
                                        // }
                                    }):<tr><td colSpan="3" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                        {
                            (SVsearchData&&SVsearchData.service&& SVsearchData.service.length>0)?
                            <div className="bar">
                                {/* <div className="left ml20 mt5">
                                    <Pagination
                                        showQuickJumper
                                        showSizeChanger
                                        onShowSizeChange={this.SVChangeLength.bind(this)}
                                        defaultPageSize={this.state.SVpageLength}
                                        defaultCurrent={1}
                                        current={this.state.SVcurrentpage}
                                        total={10}
                                        onChange={this.SVChangePage.bind(this)}
                                        pageSizeOptions={["10",'50','100','200','500','1000']}
                                    />
                                </div> */}
                                <a id='SVResultDown' href={"/node/real/export?1=1"+commonJs.toHrefParams(this.state.SVconditions)} target="_blank" className="btn-white right mr20 mt5">导出</a>
                            </div>:""
                        }
                    </div>
                </div>
            </div>
        );
    }
};


export default RTboard;