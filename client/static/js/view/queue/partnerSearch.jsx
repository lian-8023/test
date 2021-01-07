// 合作方客户查询
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import { Table,Button,Input } from 'antd';
const { Search } = Input;
import axios from '../../axios';

class PartnerSearch extends React.Component{
    constructor(props){
        super(props);
        this.state={
            loanedUserinfosDTOS:[],
        }
    }
    //搜索按钮
    searchHandle=(value)=>{
        let parems=value.replace(/\s/g,"");
        if(!parems){
            alert('搜索条件不能为空！');
            return;
        }
        let that=this;
        axios({
            method: 'get',
            url:'/node/corpSeach',
            params:{params:parems}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    loanedUserinfosDTOS:[]
                })
                return;
            }
            that.setState({
                loanedUserinfosDTOS:cpCommonJs.opinitionArray(data.loanedUserinfosDTOS)
            })
        })
    }
    render() {
        const {loanedUserinfosDTOS}=this.state;
        const columns=[
            { title: '合作方', key: 'productNo' ,width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.productNo)} },
            { title: '姓名', key: 'name' ,width:'10%',render: (text,record,index) => { return commonJs.is_obj_exist(record.name)} },
            { title: '手机号码', key: 'phone' ,width:'10%',render: (text,record,index) => { return commonJs.is_obj_exist(record.phone)} },
            { title: '身份证', key: 'nationalId' ,width:'15%',render: (text,record,index) => { return commonJs.is_obj_exist(record.nationalId)} },
            { title: '合同号', key: 'loanNumber' ,width:'15%',render: (text,record,index) => { return commonJs.is_obj_exist(record.loanNumber)},ellipsis: true, },
            { title: '期数', key: 'installments' ,width:'10%',render: (text,record,index) => { return commonJs.is_obj_exist(record.installments)} },
            { title: '贷款状态', key: 'loanStatus' ,width:'10%',render: (text,record,index) => { return commonJs.is_obj_exist(record.loanStatus)} },
            { title: '放款日期', key: 'loanDate' ,width:'10%',render: (text,record,index) => { return commonJs.is_obj_exist(record.loanDate)} },
            { title: '放款金额', key: 'loanAmount' ,width:'10%',render: (text,record,index) => { return commonJs.is_obj_exist(record.loanAmount)} },
        ];
        return (
            <div className="content" id="content">
                <div className="bar pt20 pr10 pb10 pl10">
                    <div style={searchDiv}>
                        <Search
                            placeholder="请输入手机号码或者身份证号码"
                            enterButton="搜索"
                            allowClear
                            onSearch={this.searchHandle}
                        />
                    </div>
                    <div className="mt20">
                        <Table rowKey={(record, index) => index} columns={columns} dataSource={loanedUserinfosDTOS} />
                    </div>
                </div>
            </div>
        )
    }
};
const searchDiv={
    width:'400px'
}
export default PartnerSearch;  //ES6语法，导出模块