// 还款计划修改
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import {  Table,Button,DatePicker,Modal,Input } from 'antd';
const { confirm } = Modal;
import Channel from '../cp-module/channel'; //选择合作方select
import axios from '../../axios';

import qs from 'Qs';
@inject('allStore') @observer
class RefundAdjust extends React.Component{
    constructor(props){
        super(props);
        this.state={
            visible:false,
            modifyArr:[],
            amount:'',
        }
    }
    componentDidMount(){
    }
    // 搜索
    searchHandle=() =>{
        let that=this;
        let _chenel=$(".check-search .chaenel option:selected").val();  //合作方
        let _loanNumber=$(".check-search .loanNumber").val();  //合同号

        if(!_chenel){
            alert('请选择合作方！');
            return;
        }
        if(!_loanNumber){
            alert('请输入合同号！');
            return;
        }
        axios({
            method: 'get',
            url:'/node/identity/new/getDebitingInfo',
            params:{loanNumber:_loanNumber}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    installments:[],
                    chenel:'',
                    loanNumber:''
                })
                return;
            }
            let installments=cpCommonJs.opinitionArray(data.installments);
            // --------修改前的 installments 数据--------
            for (let i = 0; i < installments.length; i++) {
                const element = installments[i];
                installments[i].lateFeeNotPaid=that.show0(element.lateFeeNotPaid);  //逾期费 没有返回的情况下，重置数据为0，方便修改后数据对比
                installments[i].principalNotPaid=that.show0(element.principalNotPaid);  //当前剩余本金 
                installments[i].interestNotPaid=that.show0(element.interestNotPaid);  //当前剩余利息
                installments[i].serviceChargeNotPaid=that.show0(element.serviceChargeNotPaid);  //当前剩余服务费
                installments[i].installmentNumber=that.show0(element.installmentNumber); //期数
                that.valueIninput(installments,i);
            }
            that.setState({
                installments:installments,
                chenel:_chenel,
                loanNumber:_loanNumber,
                repayDate:null
            })
        });
    }
    //如果没有值就展示0
    show0=(data)=> data ? data : 0;
    //input 赋值
    valueIninput=(data,n)=>{
        let theTr=$(`#refundSearchList .ant-table-tbody .ant-table-row:eq(${n})`);
        theTr.find('.principalNotPaid').find('.editInp').val(this.show0(data[n].principalNotPaid));   //当前剩余本金
        theTr.find('.interestNotPaid').find('.editInp').val(this.show0(data[n].interestNotPaid));  //当前剩余利息
        theTr.find('.serviceChargeNotPaid').find('.editInp').val(this.show0(data[n].serviceChargeNotPaid));  //当前剩余服务费
        if(this.state.chenel!='2A'){
            theTr.find('.lateFeeNotPaid').find('input').val(this.show0(data[n].lateFeeNotPaid));  //当前剩余罚息
        }
    }
    // 展示二次确认提示框
    showConfirm=()=>{
        let that=this;
        let {info}=this.state;
        confirm({
            title: '本次修改金额如下',
            content: <div><p>本金：{commonJs.is_obj_exist(info.principal)}元 利息：{commonJs.is_obj_exist(info.interest)}元 逾期费：{commonJs.is_obj_exist(info.lateFee)}元 </p> <p>合计：{commonJs.is_obj_exist(info.amount)}元</p></div>,
            onOk() {
                that.modifyPlan(1);
            },
            onCancel() {
              console.log('取消');
            },
        });
    }
    // 保存修改  2A的 逾期费 不能修改,queryOrEnsure 查询还款计划金额传 0 确认修改还款计划传1 
    modifyPlan=(queryOrEnsure)=>{
        let that=this;
        let parems={},newData=[],judgedList=[];
        let {installments,repayDate,loanNumber}=this.state;
        // --------循环获取操作后的整个数据 list--------
        $('#refundSearchList .ant-table-tbody .ant-table-row').each(function(e){
            let newObj={};
            newObj.principalNotPaid=that.show0($(this).find('.principalNotPaid').find('.editInp').val());  //当前剩余本金
            newObj.interestNotPaid=that.show0($(this).find('.interestNotPaid').find('input').val());  //当前剩余利息
            newObj.serviceChargeNotPaid=that.show0($(this).find('.serviceChargeNotPaid').find('input').val());  //当前剩余服务费
            if(that.state.chenel=='2A'){
                let _lateFeeNotPaid=$(this).find('.lateFeeNotPaid').text();
                newObj.lateFeeNotPaid=_lateFeeNotPaid;  //当前剩余逾期费
            }else{
                newObj.lateFeeNotPaid=that.show0($(this).find('.lateFeeNotPaid').find('input').val());  //当前剩余逾期费
            }
            newObj.installmentNumber=$(this).find('.breakdowns').text();  //期数
            newData.push(newObj);   
        })
        // --------对比获取仅修改的数据 list--------
        for (let i = 0; i < installments.length; i++) {
            let installments_i = installments[i];
            let newData_i=newData[i];
            if(commonJs.is_obj_exist(newData_i.principalNotPaid) != commonJs.is_obj_exist(installments_i.principalNotPaid) ||
                commonJs.is_obj_exist(newData_i.interestNotPaid) != commonJs.is_obj_exist(installments_i.interestNotPaid) ||
                commonJs.is_obj_exist(newData_i.serviceChargeNotPaid) != commonJs.is_obj_exist(installments_i.serviceChargeNotPaid) ||
                commonJs.is_obj_exist(newData_i.lateFeeNotPaid) != commonJs.is_obj_exist(installments_i.lateFeeNotPaid))
            { 
                judgedList.push(newData_i);
            }
        }
        if(judgedList.length<=0){
            alert('您未做任何修改！');
            return;
        }
        parems.installments=judgedList;  //更新后的还款计划
        parems.queryOrEnsure=queryOrEnsure;  //
        if(!repayDate){
            alert('请选择还款日期！');
            return;
        }
        parems.repayDate=repayDate.format('YYYY-MM-DD');  //还款日期 yyyy-MM-dd
        parems.loanNumber=loanNumber;  //合同号
        axios({
            method: 'POST',
            url:'/node/charge/operate/modify-plan',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    info:data
                })
                return;
            }
            that.setState({
                info:data
            })
            if(queryOrEnsure==0){
                that.showConfirm();
            }else{
                alert(info.message);
                that.searchHandle();
            }
        })
    }
    //减免已入账金额
    breaks = ()=>{
        let _chenel=$(".check-search .chaenel option:selected").val();  //合作方
        let _loanNumber=$(".check-search .loanNumber").val();  //合同号
        let parems = {};
        if(this.state.amount == ''){
            alert('请输入减免总金额！');
            return
        }
        parems.productNo = _chenel;
        parems.loanNumber = _loanNumber;
        parems.amount = this.state.amount;
        axios({
            method: 'POST',
            url:'/node/account/upfrontfee/breaks',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            // let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert('成功');
            this.setState({
                visible:false
            })
        })
    }
    //取消减免入账
    deduction =()=>{
        let that = this;
        let _loanNumber=$(".check-search .loanNumber").val();  //合同号
        let parems = {};
        parems.loanNumber = _loanNumber;
        if(_loanNumber == ''){
            alert('请输入合同号！');
            return
        }
        axios({
            method: 'POST',
            url:'/node/account/cancel/deduction',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            // let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert('成功，金额'+response.data.amount+'元');
            that.searchHandle();
        })
    }
    //用户还款日
    timeChange=(date, dateString)=>{
        this.setState({
            repayDate:date
        })
    }
    //
    handleKeyPress=(e)=>{
        let str=e.target.value;
        if(str.substr(str.indexOf('.')).length>=4){
            alert('只能输入两位小数！');
            $(e.target).addClass('warnBg');
        }else{
            $(e.target).removeClass('warnBg');
        }
    }
    render() {
        let {installments=[],chenel,repayDate=null}=this.state;
        const columns = [
            {
              title: '期数',
              key: 'breakdowns',
              className:'breakdowns',
              width:10,
              render: (text,record,index) => {
                return this.show0(record.installmentNumber)
              }
            },{
                title: '本金',
                key: 'principalNotPaid',
                className:'principalNotPaid',
                width:15,
                render: (text, record,index) => {
                    return <input className='input editInp' type="number" defaultValue ={this.show0(record.principalNotPaid)} onBlur={this.handleKeyPress.bind(this)} />;
                },
            },{
                title: '利息',
                key: 'interestNotPaid',
                className:'interestNotPaid',
                width:15,
                render: (text, record,index) => {
                    return <input className='input editInp' type="number" defaultValue ={this.show0(record.interestNotPaid)} onBlur={this.handleKeyPress.bind(this)} />
                },
            },{
                title: '服务费',
                key: 'serviceChargeNotPaid',
                className:'serviceChargeNotPaid',
                width:15,
                render: (text, record,index) => {
                    return <input className='input editInp' type="number" defaultValue ={this.show0(record.serviceChargeNotPaid)} onBlur={this.handleKeyPress.bind(this)} />
                },
            },{
                title: '逾期费',
                key: 'lateFeeNotPaid',
                className:'lateFeeNotPaid',
                width:15,
                render: (text,record,index) => {
                    if(chenel && chenel=='2A'){
                        return this.show0(record.lateFeeNotPaid)
                    }else{
                        return <input className='input editInp' type="number" defaultValue ={this.show0(record.lateFeeNotPaid)} onBlur={this.handleKeyPress.bind(this)} />
                    }
                }
            },{
                title: '起息日',
                key: 'installmentInterestStartDate',
                width:15,
                render: (text,record,index) => {return commonJs.is_obj_exist(record.installmentInterestStartDate )}
            },{
                title: '还款日',
                key: 'originalDueDate',
                width:15,
                render: (text,record,index) => {return commonJs.is_obj_exist(record.originalDueDate)}
            }
        ]
        return (
            <div className="content" id="content">
               <div data-isresetdiv="yes" className="bar check-search clearfix">
                    <Channel />  {/* 合作方 */}
                    {/* defaultValue='2017CQS555947809131800342A'  26有列表数据 */}
                    <input type="text" placeholder="请输入合同号" className="input left mr10 loanNumber" id='loanNumber' style={{width:'300px'}} />
                    <button className="left mr15 search-btn" onClick={this.searchHandle} id='searchBtn'>搜索</button>
                    <Button type="primary" style={{color: '#fff',float: 'right'}} onClick={()=>{
                        let _chenel=$(".check-search .chaenel option:selected").val();  //合作方
                        let _loanNumber=$(".check-search .loanNumber").val();  //合同号
                        let parems = {};
                        if(_chenel == ''){
                            alert('请选择合作方！');
                            return
                        }
                        if(_loanNumber == ''){
                            alert('请输入合同号！');
                            return
                        }
                        this.setState({
                            visible:true
                        })
                    }}>减免已入账金额</Button>
                    <Button style={{marginRight: '15px',float: 'right'}} onClick={()=>{
                        this.deduction();
                    }}>取消减免入账</Button>
                </div>
               <div className="mt10 bar" id='refundSearchList'>
                <Table
                    rowKey={(record, index) => index} 
                    columns={columns} 
                    dataSource={installments}
                    pagination={false}
                />
               </div>
               <div className="bar mt5 pt10 pr10 pb10">
                    <div className="right" id='saveRefundAdjust'>
                        <Button type="primary" onClick={this.modifyPlan.bind(this,0)}>提交修改</Button>
                    </div>
                    <div className="right mr10" id='refundDate'>
                        <DatePicker onChange={this.timeChange} format="YYYY-MM-DD" value={repayDate} />
                    </div>
                    <b className='right mr10 content-text' style={{lineHeight:'30px'}}>用户还款日：</b>
               </div>
               <Modal
                    title="减免总金额"
                    visible={this.state.visible}
                    onOk={()=>{
                        this.breaks();
                    }}
                        onCancel={()=>this.setState({visible:false})}
                    >
                    <Input placeholder="请输入减免总金额" value={this.state.amount} onChange={(v)=>this.setState({amount:v.currentTarget.value})} />
                </Modal>
            </div>
        )
    }
};

export default RefundAdjust;  //ES6语法，导出模块