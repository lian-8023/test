// 人行征信
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { Pagination,Descriptions,Select } from 'antd'; 
const { Option } = Select;
// 页面
import CommonJs from '../../source/common/common';
let commonJs=new CommonJs;
import axios from '../../axios';
import qs from 'Qs'
import Channel from '../cp-module/channel'; //选择合作方select
import CpCommonJs from '../../source/cp-portal/common';
import "babel-polyfill";
var cpCommonJs=new CpCommonJs;

import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

@inject('allStore') @observer
class CreditInvestigation extends React.Component{
    constructor(props){
        super(props);
        this.channelStore=this.props.allStore.ChannelStore;
        this.state={
            channelSelectedObj:{},
            iframeHeight:0,
            channelDefaultValue:''
        }
    }
    componentDidMount (){
        let h = document.documentElement.clientHeight;
        let iframeHeight=h-150;
        $('.result').height(iframeHeight)
        this.setState({
            iframeHeight:iframeHeight
        });
        let _query=cpCommonJs.opinitionObj(this.props.location.query);
        let toRout=_query.toRout;
        let _name=commonJs.is_obj_exist(_query.name);
        let _nationalId=commonJs.is_obj_exist(_query.nationalId);
        let _queryReason=commonJs.is_obj_exist(_query.queryReason);
        let _productNo=commonJs.is_obj_exist(_query.productNo);
        if(toRout=='creditInvestigation'){
            // this.searchFn(true);
            this.setState({
                channelSelectedObj:{ value:_productNo},
                channelDefaultValue:_productNo
            });
            $('.top .name').val(_name);
            $('.top .nationalId').val(_nationalId);
            $('.top .queryReason option').removeProp('selected');
            $('.top .queryReason option[value='+_queryReason+']').prop('selected',true);
        }
    }
    /**
     * 搜索
     * @param {*} hrefCondition 条件从地址栏获取
     */
    searchFn(hrefCondition){
        let that=this;
        let parem={};
        if(hrefCondition){
            parem=this.props.location.query;
        }else{
            let productNo=this.state.channelSelectedObj.value;
            let name=$('.top .name').val();
            let nationalId=$('.top .nationalId').val();
            let initiator=$('.top .initiator').val();
            let verifier=$('.top .verifier').val();
            let loanNumber= $('.top .loanNumber').val();
            let queryReason=$('.top .queryReason option:selected').attr('value');
            if(!productNo||!productNo.replace(/\s/g,'')){
                alert('请选择合作方！');
                return;
            }
            if(!name||!name.replace(/\s/g,'')){
                alert('请输入姓名！');
                return;
            }
            if(productNo!=='1G'&&(!loanNumber||!loanNumber.replace(/\s/g,''))){
                alert('请输入合同号！');
                return;
            }
            if(!nationalId||!nationalId.replace(/\s/g,'')){
                alert('请输入身份证号码！');
                return;
            }
            if(!queryReason||!queryReason.replace(/\s/g,'')){
                alert('请选择查询原因！');
                return;
            }
            parem={productNo,name,nationalId,queryReason,loanNumber};
            if(initiator&&initiator.replace(/\s/g,'')) parem.initiator=initiator;
            if(verifier&&verifier.replace(/\s/g,'')) parem.verifier=verifier;
        }
        console.log(parem);
        axios({
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(parem),
            url:'/node/credit/query-report'
        })
        .then(function (res) {
            let response=res.data;  //from node response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    msg:'',
                    randomCode:'',
                    showDownFlieBtn:false
                })
                return;
            }
            let data=response.data;  //from java response
            let searchResult=cpCommonJs.opinitionArray(data.creditInfoDTOS);
            let curr_credit=cpCommonJs.opinitionObj(searchResult[0]);
            console.log('curr_credit',curr_credit)
            that.setState({
                searchResult:searchResult,
                curr_credit:curr_credit,
                showDownFlieBtn:true
            })
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    //渠道切换事件
    channelChange(channelSelectedObj){
        this.setState({
            channelSelectedObj:channelSelectedObj
        })
    }
    changeCredit=(i,e)=>{
        let {searchResult}=this.state;
        let curr_credit=searchResult[i];
        this.setState({
            curr_credit:curr_credit
        });
        $(e.target).closest('ul').find('li').css('color','#1890ff');
        $(e.target).closest('ul').find('a').css('color','#1890ff');
        $(e.target).css('color','#ff7711');
    }
    render() {
        let {searchResult=[],curr_credit={}}=this.state;
        return (
            <div className="content" id="content">
                <div data-isresetdiv="yes" className="bar top clearfix pb5 return-visit-condition" data-resetstate="realityRepaystartValue,realityRepayendValue,fundDate,guarantorName,complate_val">
                    <dl className="left mt10">
                        <dt className="left">合作方</dt>
                        <dd><Channel onChange={this.channelChange.bind(this)} channelDefaultVal={this.state.channelDefaultValue} /></dd>  {/* 合作方 */}
                    </dl>
                    <dl className="left mt10">
                        <dt>合同号</dt>
                        <dd>
                            <input style={{"width":"100%"}} type="text" className="input loanNumber" id='name' placeholder="请输入"/>
                        </dd>
                    </dl> 
                    <dl className="left mt10">
                        <dt>姓名</dt>
                        <dd>
                            <input style={{"width":"100%"}} type="text" className="input name" id='name' placeholder="请输入"/>
                        </dd>
                    </dl> 
                    <dl className="left mt10">
                        <dt>身份证</dt>
                        <dd>
                            <input style={{"width":"100%"}} type="text" className="input nationalId" id='nationalId' placeholder="请输入"/>
                        </dd>
                    </dl> 
                    <dl className="left mt10">
                        <dt>查询原因</dt>
                        <dd>
                            <select className="select-gray queryReason" name="" id="queryReason">
                                <option value="" hidden>请选择</option>
                                <option value="">全部</option>
                                <option value="01">贷后管理</option>
                                <option value="02">贷款审批</option>
                                <option value="08">担保人资格查询</option>
                            </select>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt>发起人</dt>
                        <dd>
                            <input style={{"width":"100%"}} type="text" className="input initiator" id='initiator' placeholder="请输入"/>
                        </dd>
                    </dl> 
                    <dl className="left mt10">
                        <dt>审核人</dt>
                        <dd>
                            <input style={{"width":"100%"}} type="text" className="input verifier" id='verifier' placeholder="请输入"/>
                        </dd>
                    </dl> 
                    <dl className="left mt10">
                        <dd>
                            {
                                this.state.showDownFlieBtn?
                                <a href={'/node/credit/download-report?randomCode='+curr_credit.randomCode} id='randomCode' target='_blank' className="btn-yellow right mr5">下载当前页面</a>
                                :''
                            }
                            <button className="btn-white right mr5" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                            <button className="btn-blue right mr5" id='searchBtn' onClick={this.searchFn.bind(this,false)}>搜索</button>
                        </dd>
                    </dl>
                </div>
                <div className='bar mt10 pl5 pt5'>
                    <ul>
                        {
                            searchResult.map((repy,i)=>{
                                return <li key={i} className='pointer left mr20 content-text' onClick={this.changeCredit.bind(this,i)}>
                                            <a>&diams;&nbsp;{repy.querySuccessAt}</a>
                                        </li>
                            })
                        }
                    </ul>
                </div>
                <div className="result bar mt10">
                    <iframe 
                        srcDoc={commonJs.is_obj_exist(curr_credit.htmlMsg)}
                        style={{width:'100%', height:'100%', overflow:'scroll'}}
                        ref="iframe" 
                        width="100%" 
                        height={this.state.iframeHeight}
                        frameBorder="0">
                        <p>Your browser does not support iframes.</p>
                    </iframe>
                </div>
                
            </div>
        )
    }
};

export default CreditInvestigation;  //ES6语法，导出模块