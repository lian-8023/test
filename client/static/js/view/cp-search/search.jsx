// 搜索 cp-portal
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import {observer,inject} from "mobx-react";

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import Channel from '../cp-module/channel'; //选择合作方select

@inject('allStore') @observer
class Search extends React.Component {
    constructor(props){
        super(props);
        this.store=this.props.allStore.SearchResultTrStore;
        this.commonStore=this.props.allStore.CommonStore;
        this.state = {
            checkQueueInfoDTOS:[],  //搜索结果
        };
    }
    componentDidMount() {
    }
    
    //搜索
    searchHandle(){
        let that=this;
        let _chenel=$(".check-search .chaenel option:selected").val();
        let _orderNumber=$(".check-search .orderNumber").val();  //订单号
        let _loanNumber=$(".check-search .loanNumber").val();  //合同号
        let _phoneNo=$(".check-search .phoneNo").val();  //手机号
        let _name=$(".check-search .name").val();  //姓名
        if(!_orderNumber && !_loanNumber && !_phoneNo && !_name){
            alert("请输入任一搜索条件！");
            return;
        }
        let _parem={};  //请求参数
        if(_chenel)_parem.cooperationFlag=_chenel;
        if(_orderNumber){
            _orderNumber=_orderNumber.replace(/\s/g,"");
            _parem.orderNo=_orderNumber;
        }
        if(_loanNumber){
            _loanNumber=_loanNumber.replace(/\s/g,"");
            _parem.loanNo=_loanNumber;
        }
        if(_phoneNo){
            _phoneNo=_phoneNo.replace(/\s/g,"");
            _parem.phone=_phoneNo;
        }
        if(_name){
            _name=_name.replace(/\s/g,"");
            _parem.name=_name;
        }
        $.ajax({
             type:"post", 
             url:"/node/search/info", 
             async:false,
             dataType: "JSON", 
             data:_parem, 
             success:function(res){
                 if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        checkQueueInfoDTOS:[]
                    })
                     return;
                 }
                 let _data=res.data;
                 let _checkQueueInfoDTOS=_data.checkQueueInfoDTOS; //搜索结果list
                 if(_checkQueueInfoDTOS && _checkQueueInfoDTOS.length<=0){
                    that.setState({
                        checkQueueInfoDTOS:_checkQueueInfoDTOS
                    })
                    alert("没有数据！");
                    return;
                 }
                 that.setState({
                    checkQueueInfoDTOS:_checkQueueInfoDTOS?_checkQueueInfoDTOS:[]
                 })
            }
        })
    }
    toDetail=(i)=>{
        let {checkQueueInfoDTOS=[]}=this.state;
        this.commonStore.rowData=checkQueueInfoDTOS[i];
        this.commonStore.rowData.loanNo=checkQueueInfoDTOS[i].loanNumber;
    }
    render() {
        const channelArr=this.state.channelArr?this.state.channelArr:[];
        const checkQueueInfoDTOS=this.state.checkQueueInfoDTOS?this.state.checkQueueInfoDTOS:[];
        return (
            <div  className="content" id="content">
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar check-search clearfix">
                    <Channel />  {/* 合作方 */}
                    <input type="text" name="" placeholder="订单号" className="input left mr10 orderNumber" id='orderNumber' />
                    <input type="text" name="" placeholder="合同号" className="input left mr10 loanNumber" id='loanNumber' />
                    <input type="text" name="" placeholder="手机号码" className="input left mr10 phoneNo" id='phoneNo' />
                    <input type="text" name="" placeholder="姓名" className="input left mr20 name" id='name' />
                    <button className="left mr15 search-btn" onClick={this.searchHandle.bind(this)} id='searchBtn'>搜索</button>
                    <button className="left reset" onClick={commonJs.resetCondition.bind(this,this)} id='reset'>重置</button>
                </div>
                {/* 搜索条件 end */}
                <div  className="mt20 search-result" id="search_result_list">
                    <table  className="pt-table" width="100%">
                        <tbody>
                        <tr>
                            <th>渠道</th>
                            <th>订单号</th>
                            <th>合同号</th>
                            <th>手机号码</th>
                            <th>姓名</th>
                            <th>模型结果</th>
                            <th>放款结果</th>
                        </tr>
                        {
                            checkQueueInfoDTOS.length>0 ? checkQueueInfoDTOS.map((repy,i)=>{  
                                let trData={
                                    loanNo:commonJs.is_obj_exist(repy.loanNumber),
                                    loanNumber:commonJs.is_obj_exist(repy.loanNumber),
                                    orderNo:commonJs.is_obj_exist(repy.orderNo),
                                    cooperationFlag:commonJs.is_obj_exist(repy.cooperationFlag),
                                    fromFlag:commonJs.is_obj_exist(repy.fromFlag),
                                    platformFlag:commonJs.is_obj_exist(repy.platformFlag),
                                    customerId:commonJs.is_obj_exist(repy.customerId),
                                    stuCheck:commonJs.is_obj_exist(repy.stuCheck),
                                    isRefresh:true
                                };                      
                                let path = {
                                    pathname:'/detail',
                                    query:trData
                                }
                                return <tr key={i} className="pointer" onClick={this.toDetail.bind(this,i)}>
                                            <td>
                                                <Link to={path}>
                                                    {commonJs.is_obj_exist(repy.cooperationFlag)}
                                                </Link>
                                            </td>
                                            <td>
                                                <Link to={path}>
                                                    {commonJs.is_obj_exist(repy.orderNo)}
                                                </Link>
                                            </td>
                                            <td>
                                                <Link to={path}>
                                                    {commonJs.is_obj_exist(repy.loanNumber)}
                                                </Link>
                                            </td>
                                            <td>
                                                <Link to={path}>
                                                    {commonJs.is_obj_exist(repy.phone)}
                                                </Link>
                                            </td>
                                            <td>
                                                <Link to={path}>
                                                    {commonJs.is_obj_exist(repy.name)}
                                                </Link>
                                            </td>
                                            <td>
                                                <Link to={path}>
                                                    {commonJs.is_obj_exist(repy.approveModelResult)}
                                                </Link>
                                            </td>
                                            <td>
                                                <Link to={path}>
                                                    {commonJs.is_obj_exist(repy.loanResult)}
                                                </Link>
                                            </td>
                                        </tr>
                            }) : <tr><td colSpan="6" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
};

export default Search;