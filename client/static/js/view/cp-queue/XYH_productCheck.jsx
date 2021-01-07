// 产品审核-审核queue - 小雨花
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
class XYH_productCheck extends React.Component{
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            condition:{},  //存放搜索条件
            merchantStatusEnum:'LOAN_INPUT_EDU',
            installmentConfigDetailResponseList:[],//详情主体list
            installmentConfigDetailResponse:{},//详情主题
            xyhProductCheckDTOList:[],//方案主体list
            checkRecordsList:[],//操作记录list
            xyhProductCheckDTO:{},//方案主体
            tabindex:0,
            searchEnum:'SEARCH'
        }
    }
    @action componentDidMount(){
        commonJs.reloadRules();
        this.getCount();  //处理条数
    }
    //获取绑定条数
    @action getCount(){
        let that=this;
        axios({
            method: 'get',
            url:'/node/xyhproduct/check/getCount',
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    count:{},
                    queueStatusEnum:[]
                })
                return;
            }
            that.setState({
                count:data,
                queueStatusEnum:cpCommonJs.opinitionArray(data.queueStatusEnum)
            })
        });
    }
    //搜索公共方法
    @action searchCommonFn(searchEnum){
        let that=this;
        let productId='';
        let merchantName = '';
        let perams={};
        this.setState({
            searchEnum:searchEnum
        })
        if(searchEnum=='SEARCH'){
            perams.searchEnum=searchEnum;
            productId=$('.productId').val();  //商品ID
            merchantName =$('.merchantName').val();
            if(productId ==''&&merchantName==''){
                alert('请输入产品ID或商户名称!');
                return;
            }
            perams.productId=productId?productId:null;
            perams.merchantName=merchantName?merchantName:null;
        }else if(searchEnum=='RELOAD'){
            perams.searchEnum='SEARCH';
            productId=cpCommonJs.opinitionObj(this.state.xyhProductCheckDTO).productId; //商品id
            perams.productId=productId;
        }else if(searchEnum=='NEXT'){
            perams.searchEnum=searchEnum;
        }
        axios({
            method: 'get',
            url:'/node/xyhproduct/check/getNext',
            params:perams,
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            console.log(data);
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    xyhProductCheckDTO:{},
                    installmentConfigDetailResponseList:[],
                    installmentConfigDetailResponse:{},
                    xyhProductCheckDTOList:[],
                    xyhProductCheckDTO:{},
                    checkRecords:[],
                    tabindex:0,
                })
                return;
            }
            let checkRecords = [];
            if(data.checkRecords.length>0){
                data.checkRecords.forEach((v,i)=>{
                    if(data.xyhProductCheckDTOList[0].productId == v.productId&&data.xyhProductCheckDTOList[0].merchantName == v.merchantName){
                        checkRecords.push(v);
                    }
                })
            }
            let installmentConfigDetailResponse =[];
            if(data.installmentConfigDetailResponseList.length>0){
                data.installmentConfigDetailResponseList.forEach((v,i)=>{
                    if(data.xyhProductCheckDTOList[0].productId == v.installmentConfigNo){
                        installmentConfigDetailResponse = v;
                    }
                })
            }
            /* 设置默认值 */
            that.setState({
                xyhProductCheckDTO:cpCommonJs.opinitionObj(data.xyhProductCheckDTO),
                installmentConfigDetailResponseList:cpCommonJs.opinitionArray(data.installmentConfigDetailResponseList),
                installmentConfigDetailResponse:cpCommonJs.opinitionObj(installmentConfigDetailResponse),
                xyhProductCheckDTOList:cpCommonJs.opinitionArray(data.xyhProductCheckDTOList),
                xyhProductCheckDTO:cpCommonJs.opinitionObj(data.xyhProductCheckDTOList[0]),
                checkRecords:cpCommonJs.opinitionArray(checkRecords),
                checkRecordsList:cpCommonJs.opinitionArray(data.checkRecords),
                tabindex:0,
            })
            that.getCount();  //处理条数
            // console.log(commonJs);
            cpCommonJs.cancleSaveRecord();
        })
    }
    //保存案件记录
    saveRecord(){
        let that=this;
        let parems={};
        let afterOperateId=$('.caseRcord .afterOperateId option:selected').attr('value'); //操作后的Id
        if(!afterOperateId){
            alert('请选择处理结果！')
            return;
        }
        let content=$(".caseRcord .caseContent").val();
        if(!content){
            alert('请填写详情！')
            return;
        }
        let xyhProductCheckDTO=cpCommonJs.opinitionObj(this.state.xyhProductCheckDTO);
        parems={
            searchEnum:'SEARCH',
            productId:xyhProductCheckDTO.productId, //商品id
            versionNo:xyhProductCheckDTO.versionNo,  //版本号
            projectName:xyhProductCheckDTO.projectName,  //方案名称
            merchantName:xyhProductCheckDTO.merchantName,  //商户名称
            merchantNo:xyhProductCheckDTO.merchantNo,  //商户号
            beforeOperateId:xyhProductCheckDTO.queueStatusId,  //处理之前的状态
            operateType:xyhProductCheckDTO.operateType,  //操作类型
            afterOperateId,  //处理之后的状态
            content
        }
        console.log(parems)
        axios({
            method: 'POST',
            url:'/node/xyhproduct/check/saveCheck',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            if(data.errorCode.code == 'SUCCESSFULLY'){
                that.searchCommonFn(that.state.searchEnum)
            }
            //that.searchCommonFn('RELOAD');  //冲载页面数据
        })
    }

    Convert=(str)=>{
        const ary = ["一","二","三","四","五","六","七","八","九"];
        let character = '';
        for(var i = 0;i < ary.length;i++){
            for(var j = 0;j < str.length;j++){
            　　if(str.charAt(j) == i){
                　　character += ary[i];
            　　}
            }
        }
        return 　character;
    }

    render() {

        let {count={},queueStatusEnum=[],xyhProductCheckDTO,xyhProductCheckDTOList,installmentConfigDetailResponseList,installmentConfigDetailResponse,checkRecords=[],checkRecordsList}=this.state;

        let loanRate=cpCommonJs.opinitionArray(installmentConfigDetailResponse.loanRate);
        let repaymentMethod=commonJs.is_obj_exist(installmentConfigDetailResponse.repaymentMethod);  //还款方式
        let tableNo=0;
        if(repaymentMethod=='AVG_CAPITAL_INTEREST'){ //等额本息 
            tableNo=1
        }else if(repaymentMethod=='DISCOUNT_INTEREST'){  //贴息
            tableNo=2
        }else if(repaymentMethod=='X_Y'){
            tableNo=3
        }
        let queueStatusId=xyhProductCheckDTO.queueStatusId;  //初始Id
        let isUndertake=commonJs.is_obj_exist(installmentConfigDetailResponse.isUndertake); //是否兜底
        let isUndertakedesc='-';
        if(isUndertake==1){
            isUndertakedesc='是';
        }else if(isUndertake==0){
            isUndertakedesc='否';
        }
        return (
            <div className="content" id="content">
                {/* 处理条数 */}
                <div className="topBundleCounts gray-bar">
                    <b className="left ml40">待处理数量<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.unCheckCount)}</span><span className="gray-font">条</span></b>
                </div>  
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar check-search clearfix mt10 overflow-auto" data-resetstate='businessType'>
                    <input type="text" name="" placeholder="请输入产品ID" className="input left mr20 productId" id='productId' style={{width:'350px'}} />
                    <input type="text" name="" placeholder="请输入商户名称" className="input left mr20 merchantName" id='merchantName' style={{width:'350px'}} />
                    <button className="left mr15 search-btn" onClick={this.searchCommonFn.bind(this,"SEARCH")} id='searchNext'>搜索</button>
                    <button className="left mr15 search-next-btn" onClick={this.searchCommonFn.bind(this,"NEXT")} id='searchNext'>搜索下一条</button>
                </div>
                {/* 搜索条件 end */}
                <div className="mt20 clearfix">
                    <div className="left cont-left content-toggle  relative">
                        {/* tit-shadow */}
                        <div className="bar title-box Csearch-left-page clearfix">
                            <ul className="left ml10 mt5 nav">
                                {
                                    xyhProductCheckDTOList.length==0?<li className="on" >方案一</li>:''
                                }
                                {
                                   xyhProductCheckDTOList.map((v,i)=>{
                                        return <li ref={'list'+i} className={i==this.state.tabindex?'on':''} key={i} onClick={()=>{
                                            const productId = v.productId;
                                            const merchantName = v.merchantName;
                                            let installmentConfigDetailResponse = {};
                                            installmentConfigDetailResponseList.forEach(element => {
                                                if(element.installmentConfigNo == productId){
                                                    installmentConfigDetailResponse = element;
                                                    return;
                                                };
                                            });
                                            let checkRecords = [];
                                            if(checkRecordsList.length>0){
                                                checkRecordsList.forEach((v,i)=>{
                                                    if(productId == v.productId&&merchantName == v.merchantName){
                                                        checkRecords.push(v);
                                                    }
                                                })
                                            }
                                            this.setState({
                                                xyhProductCheckDTO:xyhProductCheckDTOList[i],
                                                installmentConfigDetailResponse:installmentConfigDetailResponse,
                                                tabindex:i,
                                                checkRecords:cpCommonJs.opinitionArray(checkRecords),
                                            })
                                            //console.log(this.state.installmentConfigDetailResponse)
                                        }} >方案{this.Convert(JSON.stringify(i))}</li>
                                   })
                                }
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={cpCommonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        <div className="mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                                商户名称：{commonJs.is_obj_exist(xyhProductCheckDTO.merchantName)}
                                <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                            </h2>
                            <ul className='cp-info-ul bar'>
                                <li>
                                    <p className="msg-tit">方案名称</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.installmentConfigName)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">产品方案ID</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.installmentConfigNo)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">还款方式</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.repaymentMethodDesc)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">单笔订单贷款贷款最小限额（元）</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.minPerLoanAmount)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">单笔订单贷款贷款最大限额（元）</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.maxPerLoanAmount)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">退货犹豫期(天)</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.refundHesitateDay)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">免息期(天)</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.interestFreeDay)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">罚息费率(%)</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.overdueRate)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">提前还款费率(%)</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.advanceRepaymentRate)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">利率水平</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.rateLevelDesc)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">兜底强弱</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.undertakeLevelDesc)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">是否兜底</p>
                                    <b className="msg-cont">{isUndertakedesc}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">全额代偿规则</p>
                                    <b className="msg-cont">
                                    {installmentConfigDetailResponse.depositDay?
                                        ('T+'+installmentConfigDetailResponse.depositDay+'天')
                                        :'-'
                                    }
                                    </b>
                                </li>
                                <li>
                                    <p className="msg-tit">当期代偿规则</p>
                                    <b className="msg-cont">
                                    {installmentConfigDetailResponse.singleDepositDay?
                                        ('T+'+installmentConfigDetailResponse.singleDepositDay+'天')
                                        :'-'
                                    }
                                    </b>
                                </li>
                                <li>
                                    <p className="msg-tit">保证金比例</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.depositRate)}</b>
                                </li>
                                <li className='height-auto' style={{width:'100%'}}>
                                    <p className="msg-tit">借款费率</p>
                                    <b className="msg-cont" style={{width:'100%'}}>
                                    {
                                    tableNo==1?
                                    <table className="pt-table boder-table bar mt3 mr5 left" style={{width:"20%"}}>
                                        <tbody>
                                            <tr>
                                                <th>期数</th>
                                                <th>APR</th>
                                            </tr>
                                            {
                                                loanRate.map((repy,i)=>{
                                                    return <tr key={i}>
                                                                <td>{commonJs.is_obj_exist(repy.period)}</td>
                                                                <td>{commonJs.is_obj_exist(repy.apr)}%</td>
                                                            </tr>
                                                })
                                            }
                                        </tbody>
                                    </table>:''
                                }
                                {
                                    tableNo==2? 
                                    <table className="pt-table boder-table bar mt3 mr5 left" style={{width:"30%"}}>
                                        <tbody>
                                            <tr>
                                                <th>期数</th>
                                                <th>APR</th>
                                            </tr>
                                            {
                                                loanRate.map((repy,i)=>{
                                                    return <tr key={i}>
                                                                <td>{commonJs.is_obj_exist(repy.period)}</td>
                                                                <td>{commonJs.is_obj_exist(repy.apr)}%</td>
                                                            </tr>
                                                })
                                            }
                                        </tbody>
                                    </table>:''
                                }
                                {
                                    tableNo==3? 
                                    <table className="pt-table boder-table bar mt3 left" style={{width:"40%"}}>
                                        <tbody>
                                            <tr>
                                                <th>期数（X+Y）</th>
                                                <th>月利率（X）</th>
                                                <th>APR（Y）</th>
                                            </tr>
                                            {
                                                loanRate.map((repy,i)=>{
                                                    return <tr key={i}>
                                                                <td>{commonJs.is_obj_exist(repy.period)}</td>
                                                                <td>{commonJs.is_obj_exist(repy.xrate)}%</td>
                                                                <td>{commonJs.is_obj_exist(repy.apr)}%</td>
                                                            </tr>
                                                })
                                            }
                                        </tbody>
                                    </table>:''
                                }
                                    </b>
                                </li>
                                <li>
                                    <p className="msg-tit">操作员</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.operator)}</b>
                                </li>
                                <li>
                                    <p className="msg-tit">操作时间</p>
                                    <b className="msg-cont">{commonJs.is_obj_exist(installmentConfigDetailResponse.operateTimeStr)}</b>
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
                                    checkRecords.length>0 ? checkRecords.map((repy,i)=>{
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
                                                        {commonJs.is_obj_exist(repy.afterOperateDescr)}
                                                    </dd>
                                                </dl>
                                                <dl>
                                                    <dt>提交时间</dt>
                                                    <dd className="">
                                                        {commonJs.is_obj_exist(xyhProductCheckDTO.createdAt)}
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
                            queueStatusId==1 ?
                            <div className="mt10">
                                <div className="bar clearfix bar-tit pl20 pr20 toggle-tit">审核</div>
                                <table className="radius-tab mt5 CPS-edit-div QrecordInfo caseRcord flow-auto" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                    <tbody>
                                        <tr>
                                            <th className="no-border">处理结果</th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <select className='select-gray afterOperateId' name="" id="afterOperateId" style={{"width":"50%"}}>
                                                    <option value="" data-show='no' hidden>请选择</option>
                                                    {
                                                        queueStatusEnum.map((repy,i)=>{
                                                            return <option key={i} value={commonJs.is_obj_exist(repy.value)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                        })
                                                    }
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className="detail-t">案件记录</span>
                                            </td>
                                        </tr>
                                        <tr className="recordDetail">
                                            <td>
                                                <textarea name="" id="caseContent" cols="30" rows="10" className="commu-area textarea caseContent" style={{"width":"95%","height":"80px"}}></textarea>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
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
export default XYH_productCheck;  //ES6语法，导出模块