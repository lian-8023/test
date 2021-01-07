
// 预付金页面-详情
import React from 'react';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Tag ,Modal,Select,Table,Row, Col ,DatePicker,Breadcrumb,Form, Input, Button, InputNumber } from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const { Option } = Select;
import axios from '../../axios';

import {observer,inject} from "mobx-react";
@inject('allStore') @observer

@Form.create() 
class Prepay_det extends React.Component {
    constructor(props){
        super(props);
        this.store=this.props.allStore;  //渠道-合作方数据
        this.chargeEnums=this.props.allStore.CommonStore.chargeEnums;   //类型
        this.getIdObj=this.props.allStore.CommonStore.getIdObj;     //根据合作方和类型，得出id 从上一个页面list获取
        this.record=this.props.allStore.CommonStore.record;         //上一个页面list操作的当前数据
        this.state = {
            expand: false,
            pagination:{
              pageSize:10,
              current:1,
              showSizeChanger:true
          },
        };
    }
    componentDidMount(){
        let query=cpCommonJs.opinitionObj(this.props.location.query);
        let query_id=query.id;
        let query_ProductNo=query.productNo;
        this.setState({
          query_id:query_id,
          query_ProductNo:query_ProductNo,
        },()=>{
          this.handleSearch();
          this.store.ChannelStore.getChanel();
          this.init();
        });
    }
    UNSAFE_componentWillReceiveProps(nextProps){
    }
    // 初始化
    init=()=>{
      let that=this;
      axios({
          method: 'POST',
          url:'/node/advance/init',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
      })
      .then(function (res) {
          let response=res.data;  //from node response
          let data=response.data;  //from java response
          if (!commonJs.ajaxGetCode(response)) {
              that.setState({
                  chargeEnums:[], 
                  typeEnums:[] 
              })
              return;
          }
          that.setState({
              chargeEnums:cpCommonJs.opinitionArray(data.chargeEnums),   //充值/扣款类别，充值时使用
              typeEnums:cpCommonJs.opinitionArray(data.typeEnums)   //账户类型，创建账户时使用
          })
      })
  }
    //搜索
    handleSearch = e => {
      let that=this;
      if(e){
        e.preventDefault();
      }
      this.props.form.validateFields((err, values) => {
        console.log('Received values of form values: ', values);
        if(err){
          return;
        }
        let {getIdObj}=this;
        // values.advanceId=getIdObj[values.productNo+values.type];  //预付金ID
        values.advanceId=1;  //预付金ID
        if(values.time && values.time.length>0){
          values.startTimeStr=values.time[0].format('YYYY-MM-DD');  //开始时间
          values.endTimeStr=values.time[1].format('YYYY-MM-DD');  //结束时间
        }
        delete values.time;
        axios({
            method: 'get',
            url:'/node/advance/records',
            params:values
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            const pager = { ...that.state.pagination };
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                  searchResult:[]
                })
                pager.total=0;
                return;
            }
            pager.total=data.totalSize;
            that.setState({
              searchResult:cpCommonJs.opinitionObj(data.data),
              conditions:values,
              pagination:pager,
            })
        })
      });
    };
    
    handleReset = () => {
      this.props.form.resetFields();
    };
    //表格切换页码以及排序
    handleTableChange=(pagination, filters, sorter)=>{
      const pager = { ...this.state.pagination };
      pager.current = pagination.current;
      pager.pageSize = pagination.pageSize;
      this.setState({
        pagination: pager,
      });
    }
    render() {
        let {record={},conditions}=this;
        const { getFieldDecorator } = this.props.form;
        const { chargeEnums=[],searchResult,pagination } = this.state;
        const {channelArr=[]}=this.store.ChannelStore;
        const columns = [
            {
              title: '序列号',
              width:80,
              key:'sourceSerialNumber',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.sourceSerialNumber)}
            },
            {
              title: '创建时间',
              width:80,
              key:'gmtCreate',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.gmtCreate)}
            },
            {
              title: '更新时间',
              width:80,
              key:'gmtModify',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.gmtModify)}
            },
            {
              title: '到账时间',
              width:80,
              key:'gmtTransfer',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.gmtTransfer)}
            },
            {
              title: '流水类型',
              width:50,
              key:'typeName',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.typeName)}
            },
            {
              title: '发生金额',
              width:50,
              key:'amountString',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.amountString)}
            },
            {
              title: '合作方产品',
              width:80,
              key:'productName',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.productName)}
            },
            {
              title: '产品号',
              width:50,
              key:'productNo',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.productNo)}
            },
            {
              title: '合同号',
              width:100,
              key:'loanNumber',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.loanNumber)}
            },
            {
              title: '当前余额',
              width:80,
              key:'banlceString',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.banlceString)}
            },
            {
              title: '收取方式',
              width:50,
              key:'paymentStatus',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.paymentStatus)}
            },
            {
              title: '渠道卡号',
              width:150,
              key:'merId',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.merId)}
            },
            {
              title: '收取渠道',
              width:50,
              key:'repaymentMethodDesc',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.repaymentMethodDesc)}
            },
            {
              title: '备注',
              width:100,
              key:'note',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.note)}
            },
        ];
        return (
            <div  className="content" id="content">
                <div className='bar pt10 pl10'>
                    <Breadcrumb separator=">">
                        <Breadcrumb.Item href="/cp-portal#/Prepay">合作方列表</Breadcrumb.Item>
                        <Breadcrumb.Item>详情</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="mt10 bar pt10 pl10 pr10">
                    <Form layout='inline'>
                        <Form.Item label='时间段：'>
                            {getFieldDecorator(`time`, {
                            rules: [
                                {
                                required: false,
                                message: '请选择',
                                },
                            ],
                            })(<RangePicker />)}
                        </Form.Item>
                        <Form.Item label='合作方：'>
                            {getFieldDecorator(`productNo`, {
                            rules: [
                                {
                                required: true,
                                message: '请选择',
                                },
                            ],
                            initialValue:commonJs.is_obj_exist(record.productNo)!='-'?record.productNo:undefined
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
                        <Form.Item label='类型：'>
                                {getFieldDecorator(`type`, {
                                rules: [
                                    {
                                    required: false,
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
                                          chargeEnums.map((repy,i)=>{
                                                return <Option value={repy.value} key={i}>{repy.displayName}</Option>
                                            })
                                        }
                                    </Select>)}
                        </Form.Item>
                        <Form.Item label='loanNumber：'>
                                {getFieldDecorator(`loanNumber`, {
                                rules: [
                                    {
                                    required: false,
                                    message: '请输入',
                                    },
                                ],
                                })(<Input placeholder="请输入" allowClear />)}
                        </Form.Item>
                        <Form.Item label={`sourceSerialNumber：`}>
                            {getFieldDecorator(`sourceSerialNumber`, {
                            rules: [
                                {
                                required: false,
                                message: 'Input something!',
                                },
                            ],
                            })(<Input placeholder="请输入" allowClear />)}
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" onClick={this.handleSearch}>搜索</Button>
                            <Button style={{ marginLeft: 10,marginRight: 10 }} onClick={this.handleReset}>重置</Button>
                            <a href={'/node/advance/records/downExcel?1=1'+commonJs.toHrefParams(this.state.conditions)} target='_blank' className="block btn-yellow right mt5">下载</a>
                        </Form.Item>
                    </Form>
                </div>
                <div className="bar mt10">
                    <Table rowKey={(record, index) => index} pagination={pagination} size="middle" scroll={{ x: 2000 }} columns={columns} dataSource={searchResult} onChange={this.handleTableChange} />
                </div>
            </div>
        );
    }
};
export default Prepay_det;