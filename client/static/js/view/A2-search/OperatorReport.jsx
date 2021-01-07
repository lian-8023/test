// 运营商报告
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import $ from 'jquery';
import { Pagination } from 'antd';  //页码
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class OperatorReport extends React.Component {
    constructor(props){
        super(props);
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息
        this.state={
            // nationalId:"350781199611145610",   //身份证号
            currentPage_forLp:1,   //通话清单（for LP 前30条记录）   当前页码  
            currentPage_postL:1,   //通话清单（for post_loan 前30条记录）当前页码
            jxlData:{}    //页面数据
        }
    }
    componentDidMount (){
        this.getMst();
        commonJs.reloadRules();
        var h = document.documentElement.clientHeight;
        if(this.props._location!="reminder" && this.props._location!="collection" && this.props._location!="outsource"){
            $(".auto-box").css("height", h - 200);
        }  
        $(".detail-top-select,.detail-top-select-bar").addClass("hidden");
    }
    //获取页面信息
    getMst(){
        let that=this;
        let _nationalId=this.userInfo2AStore.userInfo.nationalId; //身份证号
        let _sourceQuotient=this.userInfo2AStore.userInfo.sourceQuotient;  //渠道来源
        let _customerId=this.userInfo2AStore.customerId;
        if(!_nationalId||!_sourceQuotient||!_customerId){
            return;
        }
        $.ajax({
			type:"get",
			url:"/node/jxlSearch",
            async:true,
			dataType:"JSON",
            timeout : 30000, //超时时间设置，单位毫秒
            data:{
                nationalId:_nationalId?_nationalId:'undefined',
                sourceQuotient:_sourceQuotient?_sourceQuotient:'undefined',
                customerId:_customerId?_customerId:'undefined'
            },
            beforeSend:function(XMLHttpRequest){
                let loading_html='<div id="loading">'+
                                        '<div class="tanc_bg"></div>'+
                                        '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                    '</div>';
                $("body").append(loading_html);       
            },
			success:function(res){
				commonJs.ajaxGetCode(res);
                var _getData = res.data;
                if(!_getData.executed){
                    $("#loading").remove();
                    return;
                }
                that.setState({
                    jxlData:_getData,
                    authInfos:_getData.authInfos ? _getData.authInfos : []    //来源检测
                },()=>{
                    $("#loading").remove();
                    //加载默认信息源信息
                    $(".source-label li").removeClass("on");
                    $(".source-label li:eq(0)").addClass("on");
                    let _condition=(that.state.authInfos[0] && that.state.authInfos[0].keyValue) ? that.state.authInfos[0].keyValue : "";
                    that.authInfos_handle(_condition);
                })
			},
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        // 　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
		});
    }
    //来源信息处理
    authInfos_handle(condition,event){
        if(event && event.target){
            let $this=$(event.target);
            $this.parent().find("li").removeClass("on");
            $this.addClass("on");
        }
        let authInfo_title=[];    //检测源：button
        let _authInfObj={};   
        let dataArray=this.state.authInfos;
        for(let i=0;i<dataArray.length;i++){
            let dataArray_i=dataArray[i];
            authInfo_title.push( dataArray_i.keyValue );

            if(dataArray_i.keyValue==condition){
                _authInfObj.cont=dataArray_i;
            }
        }
        _authInfObj.title=authInfo_title;
        this.setState({
            authInfObj:_authInfObj
        })
    }
    //行为检测--点击展开详情
    showAllActions(e){
        let $this=$(e.target);
        let actionBar="";
        if($this.hasClass("action-bar")){
            actionBar=$this;
        }else{
            actionBar=$this.closest(".action-bar");
        }
        actionBar.find(".action-detail").css({"height":"auto"});
    }

    //快速跳转到某一页。
    gotoPageNum_forLP(pageNumber) {
        this.setState({
            currentPage_forLp:pageNumber
        })
    }
    gotoPageNum_postL(pageNumber) {
        this.setState({
            currentPage_postL:pageNumber
        })
    }
    render() {
        let jxlData=this.state.jxlData;
        let userInfo=jxlData.userInfo ? jxlData.userInfo : {};    //基本信息
        let authInfObj=jxlData.authInfObj ? jxlData.authInfObj : {};    //信息源数据
        let authInfObj_cont=(this.state.authInfObj && this.state.authInfObj.cont) ? this.state.authInfObj.cont : {};
        let consumeRecords=jxlData.consumeRecords ? jxlData.consumeRecords : [];    //每月消费汇总
        let detectionRecords=jxlData.detectionRecords ? jxlData.detectionRecords : [];    //行为检测
        let areaRecords=jxlData.areaRecords ? jxlData.areaRecords : [];    //区域汇总
        let fLPCalls=jxlData.fLPCalls ? jxlData.fLPCalls : [];    //电话清单 for lp 
        let fPostloanCalls=jxlData.fPostloanCalls ? jxlData.fPostloanCalls : [];    //电话清单 for postloan
        let contactRecords=jxlData.contactRecords ? jxlData.contactRecords : [];    //联系人信息
        let addrRecords=jxlData.addrRecords ? jxlData.addrRecords : [];    //地址信息
        return (
            <div className="auto-box pr5">
                <div className="toggle-box" data-btn-rule="check:info:list">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit on" onClick={commonJs.content_toggle.bind(this)}>
                        信息检查
                        <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                    </h2>
                    <div className="mt5 bar phoneUserMsg">
                        <div className="bar pt15 pb15 clearfix">
                            <div className="left name-label">
                                <span className="tit-font">姓名</span>
                                <p className="content-text elli">{commonJs.is_obj_exist(userInfo.name)}</p>
                            </div>
                            <ul className="msg-rig left">
                                <li>
                                    <span className="tit-font">idcard</span>
                                    <p className="content-text elli">{commonJs.is_obj_exist(userInfo.idcard)}</p>
                                </li>
                                <li>
                                    <span className="tit-font">电话号码</span>
                                    <p className="content-text elli">{commonJs.is_obj_exist(userInfo.phone)}</p>
                                </li>
                                <li>
                                    <span className="tit-font">运营商调用状态</span>
                                    <p className="content-text elli">{commonJs.is_obj_exist(userInfo.queryStatusCode)}</p>
                                </li>
                                <li>
                                    <span className="tit-font">是否授权</span>
                                    <p className="content-text elli">{commonJs.is_obj_exist(jxlData.authStatus)}</p>
                                </li>
                            </ul>
                        </div>
                        <div className="phone-result">
                            <div className="pl20 mt2 border-top-left-radius border-top-right-radius result-tit">result&nbsp;&nbsp;|</div>
                            <div className="mt2 border-bottom-left-radius border-bottom-right-radius result-cont clearfix pb10">
                                <div className="source-div clearfix">
                                    <span className="source-label-t left tit-font pl20">检测源：</span>
                                    <ul className="source-label">
                                    {
                                        (this.state.authInfObj && this.state.authInfObj.title.length>0) ? this.state.authInfObj.title.map((repy,i)=>{
                                            return <li key={i} onClick={this.authInfos_handle.bind(this,repy)}>{commonJs.is_obj_exist(repy)}</li> 
                                        }):""
                                    }
                                    </ul>
                                </div>
                                <dl className="phone-msg-list left pl20 oneThird">
                                    <dt>性别：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.gender)}>{commonJs.is_obj_exist(authInfObj_cont.gender)}</dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 ddhalf">
                                    <dt>年龄：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.age)}>{commonJs.is_obj_exist(authInfObj_cont.age)}</dd>
                                </dl>
                                <div className="clear"></div>
                                <dl className="phone-msg-list left pl20 oneThird">
                                    <dt>地区：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.province)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.province)}
                                    </dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 oneThird">
                                    <dt>城市：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.city)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.city)}
                                    </dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 oneThird">
                                    <dt>出生县：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.region)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.region)}
                                    </dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 oneThird">
                                    <dt>运营商：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.website)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.website)}
                                    </dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 oneThird">
                                    <dt>来源可靠性：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.reliability)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.reliability)}
                                    </dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 oneThird">
                                    <dt>登记时间：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.regTime)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.regTime)}
                                    </dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 through">
                                    <dt>基于名字分析：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.checkName)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.checkName)}
                                    </dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 through">
                                    <dt>基于身份证分析：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.checkIdcard)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.checkIdcard)}
                                    </dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 through">
                                    <dt>基于电商分析：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.checkEbusiness)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.checkEbusiness)}
                                    </dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 through">
                                    <dt>基于地址分析：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.checkAddr)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.checkAddr)}
                                    </dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 oneThird">
                                    <dt>常用联系人名字：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.contactName)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.contactName)}
                                    </dd>
                                </dl>
                                <dl className="phone-msg-list left pl20 ddhalf">
                                    <dt>常用联系人号码：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.checkXiaohao)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.checkXiaohao)}
                                    </dd>
                                </dl>
                                <div className="clear"></div>
                                <dl className="phone-msg-list left pl20 through">
                                    <dt>常用联系人号码分析：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.checkMobile)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.checkMobile)}
                                    </dd>
                                </dl>
                                <div className="clear"></div>
                                <dl className="phone-msg-list left pl20 through">
                                    <dt>黑名单检测：</dt>
                                    <dd title={commonJs.is_obj_exist(authInfObj_cont.blackArised)}>
                                        {commonJs.is_obj_exist(authInfObj_cont.blackArised)+ ";"+commonJs.is_obj_exist(authInfObj_cont.fblackArised)}
                                    </dd>
                                </dl>

                            </div>
                        </div>
                    </div>
                </div>
                {/*每月消费汇总*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)} data-btn-rule="consumption:month:summary">
                        每月消费汇总
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table layout-fixed">
                            <tbody>
                                <tr>
                                    <th width="20%">月份</th>
                                    <th width="20%">呼叫次数</th>
                                    <th width="20%">主叫次数/时间</th>
                                    <th width="20%">被叫次数/时间</th>
                                    <th width="20%">话费消费</th>
                                </tr>
                                {
                                    consumeRecords.length>0 ? consumeRecords.map((repy,i)=>{
                                        return <tr key={i}>
                                                    <td width="20%" title={commonJs.is_obj_exist(repy.cellMth)}>
                                                        {commonJs.is_obj_exist(repy.cellMth)}
                                                    </td>
                                                    <td width="20%" className="blue-font" title={commonJs.is_obj_exist(repy.callCnt)}>
                                                        {commonJs.is_obj_exist(repy.callCnt)}
                                                    </td>
                                                    <td width="20%" className="green-font" title={commonJs.is_obj_exist(repy.callOutCnt) + "/" + commonJs.is_obj_exist(repy.callOutTime)}>
                                                        {commonJs.is_obj_exist(repy.callOutCnt) + " / " + commonJs.is_obj_exist(repy.callOutTime)}
                                                    </td>
                                                    <td width="20%" className="purple-font" title={commonJs.is_obj_exist(repy.callInCnt) + "/" + commonJs.is_obj_exist(repy.callInTime)}>
                                                        {commonJs.is_obj_exist(repy.callInCnt) + " / " + commonJs.is_obj_exist(repy.callInTime)}
                                                    </td>
                                                    <td width="20%" title={commonJs.is_obj_exist(repy.totalAmount)}>
                                                        {commonJs.is_obj_exist(repy.totalAmount)}
                                                    </td>
                                                </tr>
                                    }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                {/*行为检测*/}
                <div className="toggle-box" data-btn-rule="check:behavior">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        行为检测
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        {
                            detectionRecords.length>0 ? detectionRecords.map((repy,i)=>{
                                return <div className="action-bar pl20 pr20 pointer" onClick={this.showAllActions.bind(this)} key={i}>
                                            <div className="clearfix action-label">
                                                <span className="tit-font left elli" title={(i+1) + commonJs.is_obj_exist(repy.checkPointCn)}>
                                                    {(i+1) + commonJs.is_obj_exist(repy.checkPointCn)}
                                                </span>
                                                <strong className="content-text right deep-blue-font elli" title={commonJs.is_obj_exist(repy.result)}>
                                                    {commonJs.is_obj_exist(repy.result)}
                                                </strong>
                                            </div>
                                            <div className="action-detail content-text" title={"· " + commonJs.is_obj_exist(repy.evidence)}>
                                                {"· " + commonJs.is_obj_exist(repy.evidence)}
                                            </div>
                                            <i className="more-icon"></i>
                                        </div>
                            }):<div className="action-bar pl20 pr20 gray-tip-font pt10 pb10">暂未查到相关数据...</div>
                        }
                    </div> 
                </div>
                {/*区域汇总*/}
                <div className="toggle-box" data-btn-rule="region:summary">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        区域汇总
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table layout-fixed">
                            <tbody>
                                <tr>
                                    <th width="20%">地区</th>
                                    <th width="20%">号码次数</th>
                                    <th width="30%">呼入/比率</th>
                                    <th width="30%">呼出/比率</th>
                                </tr>
                                {
                                    areaRecords.length>0 ? areaRecords.map((repy,i)=>{
                                        return <tr key={i}>
                                                    <td width="20%" title={commonJs.is_obj_exist(repy.regionLoc)}>
                                                        {commonJs.is_obj_exist(repy.regionLoc)}
                                                    </td>
                                                    <td width="20%" className="blue-font" title={commonJs.is_obj_exist(repy.regionUniqNumCnt)}>
                                                        {commonJs.is_obj_exist(repy.regionUniqNumCnt)}
                                                    </td>
                                                    <td width="30%" className="green-font two-line-text" title={commonJs.is_obj_exist(repy.regionCallInCnt)+"次 "+commonJs.is_obj_exist(repy.regionCallInCntPct)+" / " +commonJs.is_obj_exist(repy.regionCallInTime)+"分钟 "+commonJs.is_obj_exist(repy.regionCallInTimePct)}>
                                                        {commonJs.is_obj_exist(repy.regionCallInCnt)+"次 "+commonJs.is_obj_exist(repy.regionCallInCntPct)} <br />{commonJs.is_obj_exist(repy.regionCallInTime)+"分钟 "+commonJs.is_obj_exist(repy.regionCallInTimePct)}
                                                    </td>
                                                    <td width="30%" className="two-line-text purple-font" title={commonJs.is_obj_exist(repy.regionCallOutCnt)+"次 "+commonJs.is_obj_exist(repy.regionCallOutCntPct) + " / "+commonJs.is_obj_exist(repy.regionCallOutTime)+"分钟 "+commonJs.is_obj_exist(repy.regionCallOutTimePct)}>
                                                        {commonJs.is_obj_exist(repy.regionCallOutCnt)+"次 "+commonJs.is_obj_exist(repy.regionCallOutCntPct)} <br />{commonJs.is_obj_exist(repy.regionCallOutTime)+"分钟 "+commonJs.is_obj_exist(repy.regionCallOutTimePct)}
                                                    </td>
                                                </tr>
                                    }):<tr><td colSpan="4" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                                
                            </tbody>
                        </table>
                    </div>
                </div>
                {/*通话清单（for LP 前30条记录）*/}
                <div className="toggle-box" data-btn-rule="call:list:lp">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        通话清单（for LP 前30条记录）
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table">
                            <tbody>
                                <tr>
                                    <th width="15%" style={{"minWidth":"100px"}}>号码</th>
                                    <th width="40%">互联网标识</th>
                                    <th width="25%">需求类型</th>
                                    <th width="25%">归属地</th>
                                </tr>
                                <tr>
                                    <td colSpan="4" className="no-padding-left">
                                        {
                                            fLPCalls.length>0 ? fLPCalls.map((repy,i)=>{ 
                                                let currentPage_forLp=this.state.currentPage_forLp;
                                                if(i>=10*(currentPage_forLp-1) && i<=(10*currentPage_forLp-1)){
                                                    return <table className="pt-table phone-invent layout-fixed border-bottom flow-auto" key={i}>
                                                                <tbody>
                                                                    <tr>
                                                                        <td width="25%" className="relative" title={commonJs.is_obj_exist(repy.phoneNum)}>
                                                                            {commonJs.is_obj_exist(repy.phoneNum)}
                                                                            <i className="absolut devision-line"></i>
                                                                        </td>
                                                                        <td width="30%" title={commonJs.is_obj_exist(repy.contactName)}>{commonJs.is_obj_exist(repy.contactName)}</td>
                                                                        <td width="25%" title={commonJs.is_obj_exist(repy.needsType)}>{commonJs.is_obj_exist(repy.needsType)}</td>
                                                                        <td width="20%" title={commonJs.is_obj_exist(repy.phoneNumLoc)}>{commonJs.is_obj_exist(repy.phoneNumLoc)}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td colSpan="4">· 联系<span className="blue-font">{commonJs.is_obj_exist(repy.callCnt)}</span>次,<span className="blue-font">{commonJs.is_obj_exist(repy.callLen)}</span>分钟，主叫<span className="green-font">{commonJs.is_obj_exist(repy.callOutCnt)}</span>次，被叫<span className="purple-font">{commonJs.is_obj_exist(repy.callInCnt)}</span>次</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                }
                                            }):<span className="gray-tip-font pl20">暂未查到相关数据...</span>
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="4">
                                        <Pagination
                                            defaultPageSize={10}
                                            defaultCurrent={1}
                                            total={30}
                                            onChange={this.gotoPageNum_forLP.bind(this)}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {/*通话清单（for post_loan 前30条记录）*/}
                <div className="toggle-box" data-btn-rule="call:list:post:loan">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        通话清单（for post_loan 前30条记录）
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table">
                            <tbody>
                                <tr>
                                    <th width="25%">号码</th>
                                    <th width="30%">互联网标示</th>
                                    <th width="25%">需求类型</th>
                                    <th width="20%">归属地</th>
                                </tr>
                                <tr>
                                    <td colSpan="4" className="no-padding-left">
                                        {
                                            fPostloanCalls.length>0 ? fPostloanCalls.map((repy,i)=>{ 
                                                let currentPage_postL=this.state.currentPage_postL;
                                                if(i>=10*(currentPage_postL-1) && i<=(10*currentPage_postL-1)){
                                                    return <table className="pt-table phone-invent layout-fixed border-bottom flow-auto" key={i}>
                                                                <tbody>
                                                                    <tr>
                                                                        <td width="25%" className="relative" title={commonJs.is_obj_exist(repy.phoneNum)}>
                                                                            {commonJs.is_obj_exist(repy.phoneNum)}
                                                                            <i className="absolut devision-line"></i>
                                                                        </td>
                                                                        <td width="30%" title={commonJs.is_obj_exist(repy.contactName)}>{commonJs.is_obj_exist(repy.contactName)}</td>
                                                                        <td width="25%" title={commonJs.is_obj_exist(repy.needsType)}>{commonJs.is_obj_exist(repy.needsType)}</td>
                                                                        <td width="20%" title={commonJs.is_obj_exist(repy.phoneNumLoc)}>{commonJs.is_obj_exist(repy.phoneNumLoc)}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td colSpan="4">· 联系<span className="blue-font">{commonJs.is_obj_exist(repy.callCnt)}</span>次,<span className="blue-font">{commonJs.is_obj_exist(repy.callLen)}</span>分钟，主叫<span className="green-font">{commonJs.is_obj_exist(repy.callOutCnt)}</span>次，被叫<span className="purple-font">{commonJs.is_obj_exist(repy.callInCnt)}</span>次</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                }
                                            }):<span className="gray-tip-font pl20">暂未查到相关数据...</span>
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="4">
                                        <Pagination
                                            defaultPageSize={10}
                                            defaultCurrent={1}
                                            total={30}
                                            onChange={this.gotoPageNum_postL.bind(this)}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {/*联系人信息（必须电商授权）*/}
                <div className="toggle-box" data-btn-rule="contacts:info">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        联系人信息（必须电商授权）
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table layout-fixed">
                            <tbody>
                                <tr>
                                    <th width="15%">联系人姓名</th>
                                    <th width="25%">最早联系时间</th>
                                    <th width="25%">最晚联系时间</th>
                                    <th width="15%">联系号码</th>
                                    <th width="20%">近半年通话</th>
                                </tr>
                                {
                                    contactRecords.length>0 ? contactRecords.map((repy,i)=>{
                                        return <tr key={i}>
                                                    <td width="15%" title={commonJs.is_obj_exist(repy.contactName)}>{commonJs.is_obj_exist(repy.contactName)}</td>
                                                    <td width="25%" title={commonJs.is_obj_exist(repy.beginDate)}>{commonJs.is_obj_exist(repy.beginDate)}</td>
                                                    <td width="25%" title={commonJs.is_obj_exist(repy.endDate)}>{commonJs.is_obj_exist(repy.endDate)}</td>
                                                    <td width="15%" title={commonJs.is_obj_exist(repy.phoneNum)}>{commonJs.is_obj_exist(repy.phoneNum)}</td>
                                                    <td width="20%">{commonJs.is_obj_exist(repy.callLen)}<span className="tit-font"> 分钟</span></td>
                                                </tr>
                                    }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                {/*地址信息（必须电商授权）*/}
                <div className="toggle-box" data-btn-rule="address:info">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        地址信息（必须电商授权）
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="bar mt5 hidden">
                        <table className="pt-table">
                            <tbody>
                                <tr>
                                    <th width="30%">地址</th>
                                    <th width="20%">地址类型（推测）</th>
                                    <th width="30%">起止送货时间</th>
                                    <th width="20%">累计次数/金额</th>
                                </tr>
                                {
                                    (addrRecords && addrRecords.length>0) ? addrRecords.map((repy,i)=>{
                                        if(!repy){
                                            repy={}
                                        }
                                        return <tr key={i}>
                                                    <td width="30%" className="two-line-text word-break" title={commonJs.is_obj_exist(repy.address)}>
                                                        {commonJs.is_obj_exist(repy.address)}
                                                    </td>
                                                    <td width="20%" className="two-line-text" title={commonJs.is_obj_exist(repy.predictAddrType)}>
                                                        {commonJs.is_obj_exist(repy.predictAddrType)}
                                                    </td>
                                                    <td width="30%" className="two-line-text" title={commonJs.is_obj_exist(repy.beginDate)+commonJs.is_obj_exist(repy.endDate)}>
                                                        {commonJs.is_obj_exist(repy.beginDate)} <br/> {commonJs.is_obj_exist(repy.endDate)}
                                                    </td>
                                                    <td width="20%" className="two-line-text" title={commonJs.is_obj_exist(repy.totalCount) + commonJs.is_obj_exist(repy.totalAmount)}>
                                                        {commonJs.is_obj_exist(repy.totalCount)} <br/> {commonJs.is_obj_exist(repy.totalAmount)}
                                                    </td>
                                                </tr>
                                    }):<tr><td colSpan="4" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>
        );
    }
};
export default OperatorReport;