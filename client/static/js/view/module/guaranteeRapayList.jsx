// 担保费还款计划table展示
import React from 'react';
import $ from 'jquery';
import axios from '../../axios';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {Table } from 'antd';

class GuaranteeRapayList extends React.Component {
    constructor(props){
        super(props);
        this.state={
            guaranteeFeePayInfoList:[]
        }
    }
    componentDidMount(){
        if(this.props.pageFlag&&this.props.pageFlag=="CP2F"){
            this.getGuranteeList(this.props.that);
        }
    }
    //根据合同号查询担保费还款列表-lyf
    getGuranteeList=(that)=>{
        let _loanNumber=that.userinfoStore.platforIdentityInfo.platformLoanInfoDTO?that.userinfoStore.platforIdentityInfo.platformLoanInfoDTO.acceptNo:'';
        let productNo=that.userinfoStore.cooperationFlag;
        let _that = this;
        axios({
            method: 'get',
            async:true,
            url:'/node/upfrontFee/query/gurantee',
            params:{loanNumber:_loanNumber,productNo:productNo}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if(!response.executed){
                _that.setState({
                    guaranteeFeePayInfoList:[]
                })
            }
            _that.setState({
                guaranteeFeePayInfoList:cpCommonJs.opinitionArray(data.guaranteeFeePayInfoList)
            })
        })
    }
    render() {
        let guaranteeFeePayInfoList = []
        if(this.props.pageFlag&&this.props.pageFlag=="CP2F"){
            guaranteeFeePayInfoList = this.state.guaranteeFeePayInfoList;
        }else{
            guaranteeFeePayInfoList = this.props.guaranteeFeePayInfoList;
        }
        let columns=[
            {
                title: '贷款号',
                key:'loan_number',
                widt:'20%',
                render: (text,record,index) => {return commonJs.is_obj_exist(record.loan_number)}
            },{
                title: '金额',
                key:'amount',
                widt:'10%',
                render: (text,record,index) => {return commonJs.is_obj_exist(record.amount)}
            },{
                title: '未付金额',
                key:'amount_not_paid',
                widt:'10%',
                render: (text,record,index) => {return commonJs.is_obj_exist(record.amount_not_paid)}
            },{
                title: '最后一次扣款成功时间',
                key:'clearance_date',
                widt:'20%',
                render: (text,record,index) => {return commonJs.is_obj_exist(record.clearance_date)}
            },{
                title: '应还款日',
                key:'due_date',
                widt:'20%',
                render: (text,record,index) => {return commonJs.is_obj_exist(record.due_date)}
            },{
                title: '期数',
                key:'installment_number',
                widt:'10%',
                render: (text,record,index) => {return commonJs.is_obj_exist(record.installment_number)}
            },{
                title: '是否结清',
                key:'paid_off',
                widt:'10%',
                render: (text,record,index) => {
                    if(record.paid_off==1){
                        return '是';
                    }else if(record.paid_off==0){
                        return '否';
                    }else{
                        return '-';
                    }
                }
            }
        ];
        return (
            <div>
                <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                    担保费还款计划
                    <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                </h2>
                <div className="processing-cont-div mt5 clearfix bar">
                    <Table rowKey={(record, index) => index} dataSource={guaranteeFeePayInfoList} columns={columns} scroll={{ x: 1000 }} />
                </div>
            </div>
        );
    }
};

export default GuaranteeRapayList;
