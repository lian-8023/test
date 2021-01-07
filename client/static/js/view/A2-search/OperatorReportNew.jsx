// 运营商新
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import $ from 'jquery';
import { Pagination } from 'antd';  //页码
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";
import { Table, Column, HeaderCell, Cell ,TablePagination} from 'rsuite-table';   //table自定义调整列宽；

@inject('allStore') @observer
class OperatorReportNew extends React.Component {
    constructor(props){
        super(props);
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息
        this.state={
            callListcurrentpage:1,  //初始化页码
            callListpageLength:10,  
            netListcurrentpage:1,  //初始化页码
            netListpageLength:10,    
            smsListcurrentpage:1,  //初始化页码
            smsListpageLength:10,     
            transactionListcurrentpage:1,  //初始化页码
            transactionListpageLength:10,
            jxlData:{},    //页面数据
            newCallList:[]
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
        let _nationalId=this.userInfo2AStore.userInfo.nationalId;
        let _customerId=this.userInfo2AStore.customerId;
        if(!_nationalId||!_customerId){
            return;
        }
        if(!_customerId){
            return;
        }
        $.ajax({
			type:"get",
			url:"/node/jxl/search_new",
            async:true,
			dataType:"JSON",
            timeout : 30000, //超时时间设置，单位毫秒
            data:{
                nationalId:_nationalId,
                customerId:_customerId
            },
            beforeSend:function(XMLHttpRequest){
                let loading_html='<div id="loading">'+
                                        '<div class="tanc_bg"></div>'+
                                        '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                    '</div>';
                $("body").append(loading_html);       
            },
			success:function(res){
                $("#loading").remove();
                var _getData = res.data;
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        jxlData:{},
                        callList:[]
                    })
                    return;
                }
                let detail=_getData.detail?_getData.detail:{};
                let callList=detail.callList?detail.callList:[];
                that.setState({
                    jxlData:_getData,
                    callList:callList  //通话清单
                });
                that.dealCallList(callList,that);
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
    //快速跳转到某一页
    callListChangePage(pageNumber) {
        let callList=this.state.callList;
        let newCallList=[];
        let barsNums=this.state.callListpageLength;  //每一页显示条数
        for(let i=0;i<callList.length;i++){
            if(i>=barsNums*(pageNumber-1) && i<=(barsNums*pageNumber-1)){
                newCallList.push(callList[i])
            }
        }
        this.setState({
            callListcurrentpage:pageNumber,
            newCallList:newCallList
        })
    }
    netListChangePage(pageNumber) {
        this.setState({
            netListcurrentpage:pageNumber
        },()=>{
        
        })
    }
    smsListChangePage(pageNumber) {
        this.setState({
            smsListcurrentpage:pageNumber
        },()=>{
        
        })
    }
    transactionListChangePage(pageNumber) {
        this.setState({
            transactionListcurrentpage:pageNumber
        },()=>{
        
        })
    }
    //修改每页显示条数 
    callListChangeLength(current, pageSize){
        let callList=this.state.callList;
        let newCallList=[];
        let currentPage=this.state.callListcurrentpage;  //当前页码
        for(let i=0;i<callList.length;i++){
            if(i>=pageSize*(currentPage-1) && i<=(pageSize*currentPage-1)){
                newCallList.push(callList[i])
            }
        }
        this.setState({
            callListcurrentpage:1,
            newCallList:newCallList
        })
    }
    //处理电话清单数据
    dealCallList(data,that){
        if(!data||data.length==0)return;
        let barsNums=this.state.callListpageLength;  //每一页显示条数
        let currentPage=this.state.callListcurrentpage;  //当前页码
        let newCallList=[];
        for(let i=0;i<data.length;i++){
            if(i>=barsNums*(currentPage-1) && i<=(barsNums*currentPage-1)){
                newCallList.push(data[i]);
            }
        }
        that.setState({
            newCallList:newCallList
        })
    }
    netListChangeLength(current, pageSize){
        this.setState({
            netListcurrentpage:1
        },()=>{
            this.setState({
                netListpageLength:pageSize
            })
        })
    }
    smsListChangeLength(current, pageSize){
        this.setState({
            smsListcurrentpage:1
        },()=>{
            this.setState({
                smsListpageLength:pageSize
            })
        })
    }
    transactionListChangeLength(current, pageSize){
        this.setState({
            transactionListcurrentpage:1
        },()=>{
            this.setState({
                transactionListpageLength:pageSize
            })
        })
    }
    render() {
        let jxlData=this.state.jxlData?this.state.jxlData:{};
        let datatType=jxlData.data?jxlData.data:{};  //数据类型
        let detail=jxlData.detail?jxlData.detail:{};  
        let basic=detail.basic?detail.basic:{};  //基本信息
        let basicBasic=detail.basicBasic?detail.basicBasic:{};  //个人信息
        let {newCallList}=this.state;
        return (
            <div className="auto-box pr5">
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit on" onClick={commonJs.content_toggle.bind(this)}>
                    是否授权
                        <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                    </h2>
                    <div className="bar mt5 clearfix">
                        <ul className="info-ul no-border">
                            <li>
                                <p className="msg-tit">授权时间</p>
                                <b className="msg-cont elli" title={commonJs.is_obj_exist(jxlData.authDate)}>
                                {commonJs.is_obj_exist(jxlData.authDate)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">授权状态</p>
                                <b className="msg-cont elli" title={commonJs.is_obj_exist(jxlData.authStatus)}>
                                {commonJs.is_obj_exist(jxlData.authStatus)}
                                </b>
                            </li>
                        </ul>
                    </div>
                </div>
                {/*数据类型*/}
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                    数据类型
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="bar mt5 hidden clearfix">
                        <ul className="info-ul no-border">
                            <li>
                                <p className="msg-tit">类型</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(datatType.category)}>
                                    {commonJs.is_obj_exist(datatType.category)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">类型名称</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(datatType.category_name)}>
                                    {commonJs.is_obj_exist(datatType.category_name)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">消息</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(datatType.message)}>
                                    {commonJs.is_obj_exist(datatType.message)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">report版本</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(datatType.report_version)}>
                                    {commonJs.is_obj_exist(datatType.report_version)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">VIP类型</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(datatType.vip_type)}>
                                    {commonJs.is_obj_exist(datatType.vip_type)}
                                </b>
                            </li>
                        </ul>
                    </div>
                </div>
                {/*基本信息*/}
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                    基本信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="bar mt5 hidden clearfix">
                        <ul className="info-ul no-border">
                            <li>
                                <p className="msg-tit">数据来源</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(basic.data_source)}>
                                    {commonJs.is_obj_exist(basic.data_source)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">版本</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(basic.version)}>
                                    {commonJs.is_obj_exist(basic.version)}
                                </b>
                            </li>
                        </ul>
                    </div>
                </div>
                {/*个人信息*/}
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                    个人信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="bar mt5 hidden clearfix">
                        <ul className="info-ul no-border">
                            <li>
                                <p className="msg-tit">电话号码</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(basicBasic.cell_phone)}>
                                    {commonJs.is_obj_exist(basicBasic.cell_phone)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">身份证号</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(basicBasic.idcard)}>
                                    {commonJs.is_obj_exist(basicBasic.idcard)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">真实姓名</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(basicBasic.real_name)}>
                                    {commonJs.is_obj_exist(basicBasic.real_name)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">入网时间</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(basicBasic.reg_time)}>
                                    {commonJs.is_obj_exist(basicBasic.reg_time)}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">数据获取时间</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(basicBasic.update_time)}>
                                    {commonJs.is_obj_exist(basicBasic.update_time)}
                                </b>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/*通话清单*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        通话清单
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className='bar mt5'>
                    <Table 
                        bordered 
                        locale={
                            {emptyMessage: '暂未查到相关数据...'}
                          }
                        height={300}
                        data={newCallList}
                    >
                        <Column width={100} resizable>
                            <HeaderCell>通话类型</HeaderCell>
                            <Cell dataKey="call_type" />
                        </Column>

                        <Column width={100} resizable>
                            <HeaderCell>本机号码</HeaderCell>
                            <Cell dataKey="cell_phone" />
                        </Column>

                        <Column width={100} resizable>
                            <HeaderCell>呼叫类型</HeaderCell>
                            <Cell dataKey="init_type" />
                        </Column>

                        <Column width={100} resizable>
                            <HeaderCell>对方号码</HeaderCell>
                            <Cell dataKey="other_cell_phone" />
                        </Column>

                        <Column width={50} resizable>
                            <HeaderCell>通话地点</HeaderCell>
                            <Cell dataKey="place" />
                        </Column>
                        
                        <Column width={50} resizable>
                            <HeaderCell>通话时间</HeaderCell>
                            <Cell dataKey="start_time" />
                        </Column>

                        <Column width={90} resizable>
                            <HeaderCell>本次通话花费/元</HeaderCell>
                            <Cell dataKey="subtotal" />
                        </Column>

                        <Column width={100} resizable>
                            <HeaderCell>数据获取时间</HeaderCell>
                            <Cell dataKey="update_time" />
                        </Column>

                        <Column width={100} resizable>
                            <HeaderCell>通话时长/秒</HeaderCell>
                            <Cell dataKey="use_time" />
                        </Column>
                    </Table>
                    </div>
                    <div className='bar pl20 pb5 pt5'>
                        <Pagination
                            showQuickJumper
                            showSizeChanger
                            onShowSizeChange={this.callListChangeLength.bind(this)}
                            defaultPageSize={this.state.callListpageLength}
                            defaultCurrent={1}
                            current={this.state.callListcurrentpage}
                            total={detail.callList?detail.callList.length:0}
                            onChange={this.callListChangePage.bind(this)}
                            pageSizeOptions={["10",'50','100','200']}
                        />
                    </div>
                </div>

                {/*网络清单*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        网络清单
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <table className="pt-table bar mt5 hidden">
                        <tbody>
                            <tr>
                                <th width="10%">本机号码</th>
                                <th width="10%">流量类型</th>
                                <th width="10%">通话地点</th>
                                <th width="10%">通话时间</th>
                                <th width="15%">流量使用量/KB</th>
                                <th width="15%">本次通话花费/元</th>
                                <th width="15%">数据获取时间</th>
                                <th width="15%">通话时长/秒</th>
                            </tr>
                            <tr>
                                <td colSpan="8" className="no-padding-left">
                                    {
                                        (detail.netList&&detail.netList.length>0) ? detail.netList.map((repy,i)=>{ 
                                            let barsNums=this.state.netListpageLength;  //每一页显示条数
                                            let currentPage=this.state.netListcurrentpage;  //当前页码
                                            if(i>=barsNums*(currentPage-1) && i<=(barsNums*currentPage-1)){
                                                return <table className="pt-table phone-invent layout-fixed border-bottom flow-auto" key={i}>
                                                            <tbody>
                                                                <tr>
                                                                    <td width="10%" title={commonJs.is_obj_exist(repy.cell_phone)}>{commonJs.is_obj_exist(repy.cell_phone)}</td>
                                                                    <td width="10%" title={commonJs.is_obj_exist(repy.net_type)}>{commonJs.is_obj_exist(repy.net_type)}</td>
                                                                    <td width="10%" title={commonJs.is_obj_exist(repy.place)}>{commonJs.is_obj_exist(repy.place)}</td>
                                                                    <td width="10%" title={commonJs.is_obj_exist(repy.start_time)}>{commonJs.is_obj_exist(repy.start_time)}</td>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.subflow)}>{commonJs.is_obj_exist(repy.subflow)}</td>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.subtotal)}>{commonJs.is_obj_exist(repy.subtotal)}</td>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.update_time)}>{commonJs.is_obj_exist(repy.update_time)}</td>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.use_time)}>{commonJs.is_obj_exist(repy.use_time)}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                            }
                                        }):<span className="gray-tip-font pl20">暂未查到相关数据...</span>
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="8">
                                    <Pagination
                                        showQuickJumper
                                        showSizeChanger
                                        onShowSizeChange={this.netListChangeLength.bind(this)}
                                        defaultPageSize={this.state.netListpageLength}
                                        defaultCurrent={1}
                                        current={this.state.netListcurrentpage}
                                        total={detail.netList?detail.netList.length:0}
                                        onChange={this.netListChangePage.bind(this)}
                                        pageSizeOptions={["10",'50','100','200']}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/*短信清单*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        短信清单
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <table className="pt-table bar mt5 hidden">
                        <tbody>
                            <tr>
                                <th width="15%">本机号码</th>
                                <th width="10%">呼叫类型</th>
                                <th width="15%">对方号码</th>
                                <th width="15%">通话地点</th>
                                <th width="15%">通话时间</th>
                                <th width="15%">本次通话花费/元</th>
                                <th width="15%">数据获取时间</th>
                            </tr>
                            <tr>
                                <td colSpan="7" className="no-padding-left">
                                    {
                                        (detail.smsList&&detail.smsList.length>0) ? detail.smsList.map((repy,i)=>{ 
                                            let barsNums=this.state.smsListpageLength;  //每一页显示条数
                                            let currentPage=this.state.smsListcurrentpage;  //当前页码
                                            if(i>=barsNums*(currentPage-1) && i<=(barsNums*currentPage-1)){
                                                return <table className="pt-table phone-invent layout-fixed border-bottom flow-auto" key={i}>
                                                            <tbody>
                                                                <tr>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.cell_phone)}>{commonJs.is_obj_exist(repy.cell_phone)}</td>
                                                                    <td width="10%" title={commonJs.is_obj_exist(repy.init_type)}>{commonJs.is_obj_exist(repy.init_type)}</td>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.other_cell_phone)}>{commonJs.is_obj_exist(repy.other_cell_phone)}</td>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.place)}>{commonJs.is_obj_exist(repy.place)}</td>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.start_time)}>{commonJs.is_obj_exist(repy.start_time)}</td>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.subtotal)}>{commonJs.is_obj_exist(repy.subtotal)}</td>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.update_time)}>{commonJs.is_obj_exist(repy.update_time)}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                            }
                                        }):<span className="gray-tip-font pl20">暂未查到相关数据...</span>
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="7">
                                    <Pagination
                                        showQuickJumper
                                        showSizeChanger
                                        onShowSizeChange={this.smsListChangeLength.bind(this)}
                                        defaultPageSize={this.state.smsListpageLength}
                                        defaultCurrent={1}
                                        current={this.state.smsListcurrentpage}
                                        total={detail.smsList?detail.smsList.length:0}
                                        onChange={this.smsListChangePage.bind(this)}
                                        pageSizeOptions={["10",'50','100','200']}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                {/*交易清单*/}
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        交易清单
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <table className="pt-table bar mt5 hidden">
                        <tbody>
                            <tr>
                                <th width="10%">账单月份</th>
                                <th width="15%">本机号码</th>
                                <th width="15%">实际缴费金额/元</th>
                                <th width="20%">套餐及固定费/元</th>
                                <th width="20%">总费用/元</th>
                                <th width="20%">数据获取时间</th>
                            </tr>
                            <tr>
                                <td colSpan="6" className="no-padding-left">
                                    {
                                        (detail.transactionList&&detail.transactionList.length>0) ? detail.transactionList.map((repy,i)=>{ 
                                            let barsNums=this.state.transactionListpageLength;  //每一页显示条数
                                            let currentPage=this.state.transactionListcurrentpage;  //当前页码
                                            if(i>=barsNums*(currentPage-1) && i<=(barsNums*currentPage-1)){
                                                return <table className="pt-table phone-invent layout-fixed border-bottom flow-auto" key={i}>
                                                            <tbody>
                                                                <tr>
                                                                    <td width="10%" title={commonJs.is_obj_exist(repy.bill_cycle)}>{commonJs.is_obj_exist(repy.bill_cycle)}</td>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.cell_phone)}>{commonJs.is_obj_exist(repy.cell_phone)}</td>
                                                                    <td width="15%" title={commonJs.is_obj_exist(repy.pay_amt)}>{commonJs.is_obj_exist(repy.pay_amt)}</td>
                                                                    <td width="20%" title={commonJs.is_obj_exist(repy.plan_amt)}>{commonJs.is_obj_exist(repy.plan_amt)}</td>
                                                                    <td width="20%" title={commonJs.is_obj_exist(repy.total_amt)}>{commonJs.is_obj_exist(repy.total_amt)}</td>
                                                                    <td width="20%" title={commonJs.is_obj_exist(repy.update_time)}>{commonJs.is_obj_exist(repy.update_time)}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                            }
                                        }):<span className="gray-tip-font pl20">暂未查到相关数据...</span>
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="6">
                                    <Pagination
                                        showQuickJumper
                                        showSizeChanger
                                        onShowSizeChange={this.transactionListChangeLength.bind(this)}
                                        defaultPageSize={this.state.transactionListpageLength}
                                        defaultCurrent={1}
                                        current={this.state.transactionListcurrentpage}
                                        total={detail.transactionList?detail.transactionList.length:0}
                                        onChange={this.transactionListChangePage.bind(this)}
                                        pageSizeOptions={["10",'50','100','200']}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
};
export default OperatorReportNew;