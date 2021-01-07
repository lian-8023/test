
// 虚拟资金池
import React from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Modal,Select,Table,Form, Input,InputNumber,Button,Typography,DatePicker} from 'antd';
const { Paragraph } = Typography;
import {formatCurrency} from '../../source/common/formatCurrency';
const { Option } = Select;
import axios from '../../axios';
import qs from 'Qs';

import {observer,inject} from "mobx-react";
@inject('allStore') @observer
@Form.create() 
class VirtualFund extends React.Component {
    constructor(props){
        super(props);
        this.store=this.props.allStore;  //渠道-合作方数据
        this.commonStore=this.props.allStore.CommonStore; 
        this.state = {
            pagination:{
                pageSize:10,
                current:1,
                showSizeChanger:true
            }
        };
    }
    componentDidMount(){
        this.store.ChannelStore.getChanel();
        this.getBalance();
        this.handleSearch();
    }
    // 虚拟资金池余额查询
    getBalance=()=>{
        let that=this;
        axios({
            method: 'get',
            url:'/node/virtual/search/balance',
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    balance:''
                })
                return;
            }
            that.setState({
                balance:data.balance
            })
        })
    }
    // 展示弹窗
    showModal = (visible,index) => {
        let {virtualPoolInfoDTOS}=this.state;
        let crrentTr=cpCommonJs.opinitionObj(virtualPoolInfoDTOS[index]);
        this.setState({
            [visible] : true,
            currentTr_i:index
        },()=>{
            $('.serialNumber').val(commonJs.is_obj_exist(crrentTr.serialNumber));
        });
    };
    // 关闭弹窗
    closeModal=(visible)=>{
        this.setState({
            [visible] : false,
            reserveDate:undefined
        });
        $('.amount').val("");
    }
    // 搜索
    handleSearch=(fromBtn)=>{
        this.props.form.validateFields((err, values) => {
            console.log('Received values of form values: ', values);
            if(err){
              return;
            }
            const getPager = { ...this.state.pagination };
            if(fromBtn){
                getPager.current=1;
                this.setState({
                    pagination:getPager
                })
            };
            let that=this;
            values.pageNumber=getPager.current;
            values.pagesize=getPager.pageSize;
            axios({
                method: 'POST',
                url:'/node/virtual/search/list',
                data:{josnParam:JSON.stringify(values)}
            })
            .then(function (res) {
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                const pager = { ...that.state.pagination };
                if (!commonJs.ajaxGetCode(response)) {
                    pager.total=0;
                    that.setState({
                        virtualPoolInfoDTOS:[]
                    })
                    return;
                }
                pager.total=data.count;
                that.setState({
                    pagination:pager,
                    virtualPoolInfoDTOS:data.virtualPoolInfoDTOS,
                    conditions:values
                });
            })
        })
    }

    //表格切换页码以及排序
    handleTableChange=(pagination, filters, sorter)=>{
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        pager.pageSize = pagination.pageSize;
        this.setState({
          pagination: pager,
        },()=>{
            this.handleSearch();
        });
      }
    handleReset = () => {
        this.props.form.resetFields();
    };
    reserveDateHandle=(date, dateString)=>{
        this.setState({
            reserveDate:date
        })
    }
    // 确认入账
    modalOk=()=>{
        let creditType=$('.creditType option:selected').attr('value');  //入账类型
        let amount=$('.amount').val();  //原始金额
        let serialNumber=$('.serialNumber').val();  //流水号
        let reserveDate=this.state.reserveDate;  //清算日
        let parems={};
        parems.creditType=creditType;
        if(!serialNumber){
            alert('未获取到流水号！');
            return;
        }
        parems.serialNumber=serialNumber;
        if(!reserveDate){
            alert('请选择清算日！');
            return;
        }
        parems.reserveDate=reserveDate.format('YYYY-MM-DD HH:mm:ss');
        if(!amount){
            alert('请输入金额！');
            return;
        }
        parems.amount=amount;
        let that=this;
        axios({
            method: 'POST',
            url:'/node/virtual/ensure',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.handleSearch();
            that.closeModal('editModal');
        })
    }
    render() {
        const {balance,currentTr_i, virtualPoolInfoDTOS=[],pagination}=this.state;
        const {channelArr=[]}=this.store.ChannelStore;
        const { getFieldDecorator } = this.props.form;
        let crrentTr=cpCommonJs.opinitionObj(virtualPoolInfoDTOS[currentTr_i]);
        let statusEnums=[
            {
                value:'all',
                dis:'全部'
            },{
                value:'uncomplete',
                dis:'需处理'
            },{
                value:'complete',
                dis:'已处理'
            },
        ]
        const columns = [
            {
              title: '产品号',
              width:'5%',
              key:'productNo',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.productNo)}
            },
            {
              title: '原始金额',
              width:'10%',
              key:'amount',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.amount)}
            },
            {
              title: '余额',
              width:'10%',
              key:'balance',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.balance)}
            },
            {
              title: '合同号',
              width:'15%',
              key:'loanNumber',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.loanNumber)}
            },
            {
              title: '流水号',
              width:'20%',
              key:'serialNumber',
              render: (text,record,index) => {
                  return <Paragraph copyable>{commonJs.is_obj_exist(record.serialNumber)!='-' ? commonJs.is_obj_exist(commonJs.is_obj_exist(record.serialNumber)) : '-'}</Paragraph>
                }
            },
            {
              title: '状态',
              width:'10%',
              key:'normal',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.creditTypeDesc) }
            },
            {
              title: '来源',
              width:'10%',
              key:'source',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.source)}
            },
            {
              title: '最近操作时间',
              width:'10%',
              key:'operateTime',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.operateTime)}
            },
            {
              title: '操作',
              width:'10%',
              key:'highAm2ount',
              render: (text,record,index) => {
                  if(record.amount>0){
                    return <Button onClick={this.showModal.bind(this,'editModal',index)}>资金操作</Button>
                  }else{
                      return '-'
                  }
              }
            },
        ];
        return (
            <div  className="content" id="content">
                <div className="bar pt10 pr20">
                    <b className='right' style={{"fontSize":"16px",color:'#1890ff'}}>资金池总余额：{formatCurrency(commonJs.is_obj_exist(balance))}</b> 
                </div>
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar clearfix mt10 pt5 pl10 pr10">
                    <Form layout='inline'>
                        <Form.Item label='合作方：'>
                            {getFieldDecorator(`productNo`, {
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
                                        channelArr.map((repy,i)=>{
                                            return <Option value={repy.value} key={i}>{repy.displayName}</Option>
                                        })
                                    }
                                </Select>)}
                        </Form.Item>
                        <Form.Item label='状态：'>
                                {getFieldDecorator(`status`, {
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
                                            statusEnums.map((repy,i)=>{
                                                return <Option value={repy.value} key={i}>{repy.dis}</Option>
                                            })
                                        }
                                    </Select>)}
                        </Form.Item>
                        <Form.Item label='合同号：'>
                                {getFieldDecorator(`loanNumber`, {
                                rules: [
                                    {
                                    required: false,
                                    message: '请输入',
                                    },
                                ],
                                })(<Input placeholder="请输入" allowClear />)}
                        </Form.Item>
                        <Form.Item label={`原始金额：`}>
                            {getFieldDecorator(`amount`, {
                            rules: [
                                {
                                required: false,
                                message: '请输入!',
                                },
                            ],
                            })(<InputNumber placeholder="请输入" allowClear />)}
                        </Form.Item>
                        <Form.Item label={`流水号：`}>
                            {getFieldDecorator(`serialNumber`, {
                            rules: [
                                {
                                required: false,
                                message: '请输入!',
                                },
                            ],
                            })(<Input placeholder="请输入" allowClear />)}
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" onClick={this.handleSearch.bind(this,true)}>搜索</Button>
                            <Button style={{ marginLeft: 10,marginRight: 10 }} onClick={this.handleReset}>重置</Button>
                            <a href={'/node/virtual/down/list?isDown=YES'+commonJs.toHrefParams(this.state.conditions)} target='_blank' className="block btn-yellow right mt5">下载当前查询结果</a>
                        </Form.Item>
                    </Form>
                </div>
                {/* 搜索条件 end */}
                <div className="bar mt10 searchResult_H">
                    <Table rowKey={(record, index) => index} pagination={pagination} size="middle" scroll={{ y: 1500 }} columns={columns} dataSource={virtualPoolInfoDTOS} onChange={this.handleTableChange} />
                </div>
                {/* 资金操作弹窗 */}
                <div>
                    <Modal
                    title="资金池操作"
                    okText="确定提交"
                    visible={this.state.editModal}
                    onOk={this.modalOk}
                    onCancel={this.closeModal.bind(this,'editModal')}
                    >
                        <b>本笔资金余额：{commonJs.is_obj_exist(crrentTr.balance)}</b>
                        <p className='mt10'>请选择资金去向：</p>
                        <select name="" id="" className='select-gray mt5 creditType' style={{width:'70%'}}>
                            <option value="RETURN_AMOUNT">退款(客户)</option>
                            <option value="DEPOSIT_CHARGE">保证金充值</option>
                            <option value="CANCEL_CREDIT">取消&抹除</option>
                        </select>
                        <p className='mt10'>流水号：</p>
                        <div className='mt5'>
                            <input type="text" className='input mr5 serialNumber' style={{width:'70%'}} disabled/>
                        </div>
                        <p className='mt10'>清算日：</p>
                        <div className='mt5'>
                            <DatePicker showTime onChange={this.reserveDateHandle} value={this.state.reserveDate} style={{width:'70%'}} />
                        </div>
                        <p className='mt10'>金额：</p>
                        <div className='mt5'>
                            <input type="number" className='input mr5 amount' placeholder='请输入' onKeyPress={commonJs.handleKeyPress.bind(this,['e'])} style={{width:'70%'}}/>
                        </div>
                    </Modal>
                </div>
            </div>
        );
    }
};

export default VirtualFund;