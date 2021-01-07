
// 扣款查询
import React from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Table,Select,Form, Input,Button} from 'antd';
import axios from '../../axios';
import qs from 'Qs';

import {observer,inject} from "mobx-react";
@inject('allStore') @observer
@Form.create() 
class RetainageCheck extends React.Component {
    constructor(props){
        super(props);
        this.store=this.props.allStore;  //渠道-合作方数据
        this.commonStore=this.props.allStore.CommonStore; 
        this.state = {
            pagination:{
                pageSize:10,
                current:1,
                showSizeChanger:true
            },
            searchResult:[{
                loanNumber:78
            }]
        };
    }

    UNSAFE_componentWillMount(){
        this.store.ChannelStore.getChanel();
    }

    // 搜索
    handleSearch=()=>{
        let that=this;
        this.props.form.validateFields((err, values) => {
            console.log('Received values of form values: ', values);
            if(err){
              return;
            }
            axios({
                method: 'POST',
                url:'/node/debit/queryPendingList',
                data:{josnParam:JSON.stringify(values)}
            })
            .then(function (res) {
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                if (!commonJs.ajaxGetCode(response)) {
                    that.setState({
                        debitPendingInfos:[]
                    })
                    return;
                }
                that.setState({
                    debitPendingInfos:cpCommonJs.opinitionArray(data.debitPendingInfos)
                })
            })
        })
        
    }

    render() {
        const {pagination,debitPendingInfos}=this.state;
        const { getFieldDecorator } = this.props.form;
        const {channelArr=[]}=this.store.ChannelStore;
        const columns = [
            {
              title: '产品号',
              width:'25%',
              key:'productNo',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.productNo)}
            },
            {
              title: '合同号',
              width:'25%',
              key:'loanNumber',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.loanNumber)}
            },
            {
              title: '金额',
              width:'25%',
              key:'loanAmount',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.loanAmount)}
            },
            {
              title: '时间',
              width:'25%',
              key:'debitTimeStr',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.debitTimeStr)}
            }
        ];
        return (
            <div  className="content" id="content">
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar clearfix mt10 pt5 pl10 pr10">
                    <Form layout='inline'>
                        <Form.Item label='产品号：'>
                                {getFieldDecorator(`productNo`, {
                                rules: [
                                    {
                                    required: true,
                                    message: '请选择',
                                    },
                                ],
                                })(<Select
                                    showSearch
                                    allowClear
                                    style={{ width: 200 }}
                                    placeholder="请选择"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {
                                        channelArr.map((repy,i)=>{
                                            return <Option value={repy.value} key={i}>{repy.displayName}</Option>
                                        })
                                    }
                                </Select>)}
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" onClick={this.handleSearch}>搜索</Button>
                        </Form.Item>
                    </Form>
                </div>
                {/* 搜索条件 end */}
                <div className="bar mt10 searchResult_H">
                    <Table rowKey={(record, index) => index} pagination={pagination} size="middle" columns={columns} dataSource={debitPendingInfos} onChange={this.handleTableChange} />
                </div>
            </div>
        );
    }
};

export default RetainageCheck;