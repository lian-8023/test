// 商品审核-审核queue - 小雨花
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import axios from '../../axios';

import {observer,inject} from "mobx-react"; 
import { action,runInAction} from "mobx";

@inject('allStore') @observer
class XYH_goodsCheck extends React.Component{
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            condition:{},  //存放搜索条件
            // businessCode:'LOAN_INPUT_EDU', // LOAN_INPUT_EDU：教育分期；LOAN_INPUT_OPERATOR：运营商3C分期；LOAN_INPUT_COSMETOLOGY：医疗美容分期
        }
    }
    @action componentDidMount(){
        this.commonStore.checkData={};
        commonJs.reloadRules();
        this.getCount();  //处理条数
    }
    //获取绑定条数
    @action getCount(){
        let that=this;
        axios({
            method: 'get',
            url:'/node/commodity/check/getInit',
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    count:{},
                    queueStatusEnum:[],
                    goodsLevel:[]
                })
                return;
            }
            that.setState({
                count:data.count,
                queueStatusEnum:data.queueStatusEnum, //审核结果列表
                goodsLevel:data.goodsLevel //项目等级
            })
        });
    }
    //搜索公共方法
    @action searchCommonFn(queueStatusEnum){
        let that=this;
        let commodityNo='';
        let perams={};
        if(queueStatusEnum=='SEARCH'){
            commodityNo=$('.commodityNo').val();  //商品ID
            if(!commodityNo){
                alert('请输入商品ID!');
                return;
            }
            perams={ commodityNo }
        }else if(queueStatusEnum=='RELOAD'){
            commodityNo=cpCommonJs.opinitionObj(this.state.queueInfo).commodityNo; //商品id
            perams={ commodityNo }
        }
        perams.queueStatusEnum=queueStatusEnum;
        axios({
            method: 'get',
            url:'/node/commodity/check/search',
            params:perams,
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    shopExamineInfo:{},
                    records:[],
                    businessCode:'',
                    merchantNo:'',
                    models:[],
                    queueInfo:{},
                })
                return;
            }
            let shopExamineInfo=cpCommonJs.opinitionObj(data.shopExamineInfo);
            let businessCode=commonJs.is_obj_exist(shopExamineInfo.businessCode);  //业务类型
            let queueInfo=cpCommonJs.opinitionObj(data.queueInfo);
            that.setState({
                shopExamineInfo:shopExamineInfo,
                records:cpCommonJs.opinitionArray(data.records),
                businessCode:businessCode,
                models:shopExamineInfo.models?shopExamineInfo.models:[],  //商品详情
                queueInfo:queueInfo,
            })
            that.getCount();  //处理条数
            commonJs.cancleSaveRecord();
        })
    }
    //保存案件记录
    saveRecord(){
        let that=this;
        let parems={};
        let content=$(".caseRcord .caseContent").val();
        if(!content){
            alert('请填写案件记录！')
            return;
        }
        let queueInfo=cpCommonJs.opinitionObj(this.state.queueInfo);
        let commodityNo=queueInfo.commodityNo;;  //商品id
        let beforeQueueStatusId=queueInfo.queueStatusId;  //初始Id
        let afterQueueStatusId=$('.caseRcord .afterQueueStatusId option:selected').attr('value'); //操作后的Id
        let level=$('.caseRcord .level option:selected').attr('value'); //等级
        parems={
            content,commodityNo,beforeQueueStatusId,afterQueueStatusId,level
        }
        axios({
            method: 'POST',
            url:'/node/commodity/check/saveCheck',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.searchCommonFn('RELOAD');  //冲载页面数据
        })
    }
    render() {
        let {businessCode='',queueStatusEnum=[],goodsLevel=[],count={},shopExamineInfo={},records=[],models=[],queueInfo={}}=this.state;
        let beforeQueueStatusId=queueInfo.queueStatusId;  //初始Id
        return (
            <div className="content" id="content">
                {/* 处理条数 */}
                <div className="topBundleCounts gray-bar">
                    <b className="left ml40">待处理数量<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.unCheckCount)}</span><span className="gray-font">条</span></b>
                </div>  
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar check-search clearfix mt10 overflow-auto" data-resetstate='businessType'>
                    <input type="text" name="" placeholder="请输入商品ID" className="input left mr20 commodityNo" id='commodityNo' style={{width:'350px'}} />
                    <button className="left mr15 search-btn" onClick={this.searchCommonFn.bind(this,"SEARCH")} id='searchNext'>搜索</button>
                    <button className="left mr15 search-next-btn" onClick={this.searchCommonFn.bind(this,"NEXT")} id='searchNext'>搜索下一条</button>
                </div>
                {/* 搜索条件 end */}
                <div className="mt20 clearfix">
                    <div className="left cont-left content-toggle  relative">
                        {/* tit-shadow */}
                        <div className="bar title-box Csearch-left-page clearfix">
                            <ul className="left ml10 mt5 nav">
                                <li className="on" >详情</li>
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={cpCommonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        <div className="mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                                商户名称：{commonJs.is_obj_exist(shopExamineInfo.merchantName)}
                                <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                            </h2>
                            <ul className='cp-info-ul bar mt5'>
                                <li>
                                    <p className="msg-tit">商品名称：</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(shopExamineInfo.name)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">业务类型</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(shopExamineInfo.businessCodeDesc)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">商品品牌</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(shopExamineInfo.brand)}</b>
                                </li>
                                {
                                    businessCode=='LOAN_INPUT_COSMETOLOGY'?
                                    <li>
                                        <p className="msg-tit">商户是否确认打款</p>
                                        <b className="msg-cont">
                                        {
                                            commonJs.is_obj_exist(shopExamineInfo.confirmPayment)==true?'是':'否'
                                        }
                                        </b>
                                    </li>:''
                                }
                                {
                                    businessCode=='LOAN_INPUT_COSMETOLOGY'?
                                    <li>
                                        <p className="msg-tit">美容类型</p>
                                        <b className="msg-cont">{commonJs.is_obj_exist(shopExamineInfo.goodsClassDesc)}</b>
                                    </li>:''
                                }
                                {
                                    businessCode=='LOAN_INPUT_COSMETOLOGY'?
                                    <li>
                                        <p className="msg-tit">项目等级</p>
                                        <b className="msg-cont">{commonJs.is_obj_exist(shopExamineInfo.levelDesc)}</b>
                                    </li>:''
                                }
                                <li className='height-auto' style={{width:'100%'}}>
                                    <p className="msg-tit">商品详情</p>
                                    <b className="msg-cont" style={{width:'100%'}}>
                                        <table className='pt-table boder-table bar mt3'>
                                            <thead>
                                                <tr>
                                                    <th>规格型号</th>
                                                    <th>价格（元）</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                models.map((repy,i)=>{
                                                    return <tr key={i}>
                                                                <td>{commonJs.is_obj_exist(repy.name)}</td>
                                                                <td>{commonJs.is_obj_exist(repy.price)}</td>
                                                            </tr>
                                                })
                                            }
                                            </tbody>
                                        </table>
                                    </b>
                                </li>
                                <li>
                                    <p className="msg-tit">操作员</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(shopExamineInfo.operator)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">操作时间</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(shopExamineInfo.operatorTime)}</b>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="right cont-right content-toggle">
                        {/* record list */}
                        <div className="toggle-box">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={commonJs.content_toggle.bind(this)}>
                            操作记录
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <div className='bar mt10 coll-edit-div'>
                                {
                                    records.length>0 ? records.map((repy,i)=>{
                                        return <div key={i} className="border-bottom-3 pb5">
                                                <dl className="border-bottom">
                                                    <dt>序号</dt>
                                                    <dd className="">
                                                        {i}
                                                    </dd>
                                                </dl>
                                                <dl>
                                                    <dt>处理结果</dt>
                                                    <dd className="">
                                                        {commonJs.is_obj_exist(repy.queueStatus)}
                                                    </dd>
                                                </dl>
                                                <dl>
                                                    <dt>提交时间</dt>
                                                    <dd className="">
                                                        {commonJs.is_obj_exist(repy.submitTime)}
                                                    </dd>
                                                </dl>
                                                <div className="clearfix ml10 mr10 record-detail-div">
                                                    <div className="record-detail left">
                                                        <span className="left block pr10">详情</span>
                                                        <div className="left detail elli">{commonJs.is_obj_exist(repy.content)}</div>
                                                    </div>    
                                                    <div className="left toggle-record-detail on" onClick={commonJs.toggle_record_detail.bind(this)}><i></i></div>
                                                </div>
                                                <div className="clearfix ml10 border-top">
                                                    <span className="left pr10">{commonJs.is_obj_exist(repy.createdBy)}</span>
                                                    <div className="left">{commonJs.is_obj_exist(repy.createdAt)}</div>
                                                </div>
                                            </div>
                                    }): <div className="pt10 pl20 gray-tip-font">暂未查到相关记录...</div>
                                }
                            </div>
                            
                        </div>
                        {/* Record */}
                        {
                            beforeQueueStatusId==1 ?
                            <div className="mt10">
                                <div className="bar clearfix bar-tit pl20 pr20 toggle-tit">审核</div>
                                <table className="radius-tab mt5 CPS-edit-div QrecordInfo caseRcord flow-auto" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                    <tbody>
                                        <tr>
                                            <th className="no-border">处理结果</th>
                                            {
                                                businessCode=='LOAN_INPUT_COSMETOLOGY'?
                                                <th className="no-border">项目等级</th>:<th></th>
                                            }
                                        </tr>
                                        <tr>
                                            <td>
                                                <select className='select-gray afterQueueStatusId' name="" id="afterQueueStatusId" style={{"width":"50%"}}>
                                                    <option value="" data-show='no' hidden>请选择</option>
                                                    {
                                                        queueStatusEnum.map((repy,i)=>{
                                                            return <option key={i} value={commonJs.is_obj_exist(repy.value)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                        })
                                                    }
                                                </select>
                                            </td>
                                            {
                                                businessCode=='LOAN_INPUT_COSMETOLOGY'?
                                                <td>
                                                    <select className='select-gray level' name="" id="level" style={{"width":"50%"}}>
                                                        <option value="" data-show='no' hidden>请选择</option>
                                                        {
                                                            goodsLevel.map((repy,i)=>{
                                                                return <option key={i} value={commonJs.is_obj_exist(repy.code)}>{commonJs.is_obj_exist(repy.desc)}</option>
                                                            })
                                                        }
                                                    </select>
                                                </td>:<td></td>
                                            }
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className="detail-t">案件记录</span>
                                            </td>
                                        </tr>
                                        <tr className="recordDetail">
                                            <td colSpan={businessCode=='LOAN_INPUT_COSMETOLOGY'?'2':'0'}>
                                                <textarea name="" id="caseContent" cols="30" rows="10" className="commu-area textarea caseContent" style={{"width":"95%","height":"80px"}}></textarea>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={businessCode=='LOAN_INPUT_COSMETOLOGY'?'2':'0'}>
                                                <button className="left block btn-blue" onClick={this.saveRecord.bind(this)}>保存</button>
                                                <button className="btn-white left block ml20" onClick={cpCommonJs.cancleSaveRecord.bind(this)}>取消</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>:''
                        }
                        
                    </div>
                </div>
            </div>
        )
    }
};
export default XYH_goodsCheck;  //ES6语法，导出模块