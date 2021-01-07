// 短信业务管理
import React from 'react';
import $ from 'jquery';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Modal, Select,Form, Input,Table, Divider } from 'antd';
const { Option } = Select;
import axios from '../../axios';
import qs from 'Qs'

import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class NoteBusiness extends React.Component {
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore;
        this.state = {
            visible: false,   //新增弹窗是否可见
            pagination:{
                pageSize:10,
                current:1,
                showSizeChanger:true
            },
            STemplate:[],
            channelList:[],
            searchRult:[]
        };
    }
    componentDidMount(){
        this.init();
    }
    init(){
        let that=this;
        axios({
            method: 'POST',
            data: {josnParam:JSON.stringify({
                method:'get',
                url:'/STemplate/simpleQuery'
            })},
            url:'/node/sms/manager'
        })
        .then(function (res) {
            let response=res.data;  //from node response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    STemplate:[]
                })
                return;
            }
            let data=response.data;  //from java response
            let jdata=data.data;
            that.setState({
                STemplate:jdata
            })
        })
        .catch(function (error) {
            console.log(error);
        });
        axios({
            method: 'POST',
            data: {josnParam:JSON.stringify({
                method:'get',
                url:'/SMSTemplate/channelList'
            })},
            url:'/node/sms/manager'
        })
        .then(function (res) {
            let response=res.data;  //from node response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    channelList:[]
                })
                return;
            }
            let data=response.data;  //from java response
            let jdata=data.data;
            that.setState({
                channelList:jdata
            })
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    // 新增弹窗
    showModal = () => {
        this.setState({
          visible: true,
          modalType:'add',
          isbizType:false
        });
    };
    closeModal=(e)=>{
        this.props.form.resetFields();
        this.setState({
            visible: false,
        });
    }
    //   新增模板 提交
      handleSubmit = e => {
        let that=this;
        e.preventDefault();
        let parem={};
        this.props.form.validateFields((err, values) => {
          if (!err) {
            parem=values;
          }
        });
        if(Object.keys(parem)<=0){
            alert('请填入正确的数据再保存！');
            return;
        }
        parem.method='post';
        parem.operator=this.commonStore.loginname;
        let modalType=this.state.modalType;
        if(modalType=='add'){
            parem.url='/SBizConfig/save';
        }else if(modalType=='edit'){
            parem.url='/SBizConfig/update';
        }
        axios({
            method: 'POST',
            data: {josnParam:JSON.stringify(parem)},
            url:'/node/sms/manager'
        })
        .then(function (res) {
            let response=res.data;  //from node response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            let data=response.data;  //from java response
            alert(data.message);
            that.closeModal();
            that.searchHandle();
        })
        .catch(function (error) {
            console.log(error);
        });
      };
    //编辑
    editHandle=(text, record, index)=>{
        let searchRult=this.state.searchRult;
        let currentData=searchRult[parseInt(index)];
        this.setState({
            visible: true,  //隐藏弹窗
            modalType:'edit',
            isbizType:true
        });
        let statusNo=currentData.status;
        let channelId=currentData.channelId;
        this.props.form.setFieldsValue({
            productNo:currentData.bizSourceSystem,
            templateId:currentData.templateId,
            bizType:currentData.bizType,
            channelId:channelId.toString(),
            status:statusNo.toString(),
        })
    }
    //搜索
    searchHandle=(pagination, filters, sorter)=>{
        let that=this;
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        });
        let templateId=$('.top .templateId').val();
        if(templateId) templateId=templateId.replace(/^\s+|\s+$/g,'');
        let bizType=$('.top .bizType').val();
        if(bizType) bizType=bizType.replace(/^\s+|\s+$/g,'');
        let channelId=$('.top .channelId option:selected').attr('value');
        let status=$('.top .status option:selected').attr('value');
        let pageNum=1;
        let pageSize=10;
        if(pagination&&pagination.current){
            pageNum=pagination.current;
            pageSize=pagination.pageSize;
        }
        let url='/SBizConfig/query';
        let method='get';
        let parem={
            templateId,bizType,channelId,status,pageNum,pageSize,url,method
        }
        axios({
            method: 'POST',
            data: {josnParam:JSON.stringify(parem)},
            url:'/node/sms/manager'
        })
        .then(function (res) {
            let response=res.data;  //from node response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    pagination:{
                        pageSize:10,
                        current:1,
                        total:0,
                    },
                    searchRult:[]
                })
                return;
            }
            let data=response.data;  //from java response
            let jdata=data.data;
            that.setState({
                pagination:{
                    pageSize:jdata.pageSize,
                    current:jdata.pageNum,
                    total:jdata.totalNum,
                },
                searchRult:jdata.dataList
            })
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    render() {
        let {STemplate,channelList}=this.state;
        const { getFieldDecorator } = this.props.form;
        const columns = [
            {
              title: '业务类型',
              dataIndex: 'bizType',
              key: 'bizType',
              width: '10%',
            },
            {
              title: '业务来源',
              dataIndex: 'bizSourceSystem',
              key: 'bizSourceSystem',
              width: '5%',
            },
            {
              title: '短信发送类型',
              dataIndex: 'bizSendType',
              key: 'bizSendType',
              width: '10%',
              render: (text, record, index)=>{
                  if(text=='IMMEDIATELY'){
                        return '立即发送';
                  }else if(text=='TIMESHARING'){
                        return '分时发送';
                  }else{
                      return '';
                  }
              },
            },
            {
              title: '短信模板编号',
              dataIndex: 'templateId',
              key: 'templateId',
              width: '10%',
            },
            {
              title: '短信渠道描述',
              dataIndex: 'channelDesc',
              key: 'channelDesc',
              width: '10%',
            },
            {
              title: '是否有效',
              dataIndex: 'status',
              key: 'status',
              width: '10%',
              render: (text, record, index)=>{
                  if(text==1){
                        return '正常';
                  }else if(text==2){
                        return '停用';
                  }else{
                      return '';
                  }
              },
            },
            {
              title: '最近编辑',
              dataIndex: 'operator',
              key: 'operator',
              width: '5%',
            },
            {
              title: '对应模板内容',
              dataIndex: 'templateContent',
              key: 'templateContent',
              width: '20%',
            },
            {
                title: '操作',
                key: '操作',
                width: '10%',
                render: (text, record, index)=><button className="btn-blue" onClick={this.editHandle.bind(this,text, record, index)}>编辑</button>,
              },
          ];
        return (
            <div  className="content" id="content">
                <div className="bar pt5 pb5 clearfix">
                    <button className="right mr15 btn-blue" id='addNoteBusiness' onClick={this.showModal}>新增短信业务</button>
                </div>
                <div data-isresetdiv="yes" className="bar top clearfix mt10">
                    <input type="text" name="" placeholder="短信编号" className="input left mr10 mt10 templateId input_w" id='templateId' />
                    <input type="text" name="" placeholder="业务类型" className="input left mr10 mt10 bizType input_w" id='bizType' />
                    <select name="" id="channelId" className='select-gray left mr10 mt10 channelId'>
                        <option value="" hidden data-show='no'>短信渠道</option>
                        <option value="">请选择</option>
                        {
                            channelList.map((repy,i)=>{
                                return <option key={i} value={commonJs.is_obj_exist(repy.channelId)}>{commonJs.is_obj_exist(repy.channelDesc)}</option>
                            })
                        }
                    </select>
                    <select name="" id="status" className='select-gray left mr10 mt10 status'>
                        <option value="" hidden data-show='no'>是否有效</option>
                        <option value="">请选择</option>
                        <option value="1">正常</option>
                        <option value="2">停用</option>
                    </select>
                    <button className="left mr10 btn-blue mt10" id='searchBtn' onClick={this.searchHandle}>搜索</button>
                    <button className="left btn-white mr10 mt10" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                </div>
                <div className="mt10 bar">
                    <Table rowKey={record => record.bizType} columns={columns} dataSource={this.state.searchRult} scroll={{ x: 1700 }} onChange={this.searchHandle} pagination={this.state.pagination} />
                </div>
                
                <Modal
                    title={this.state.modalType=='edit'?'编辑短信业务':'新增短信业务'}
                    visible={this.state.visible}
                    onCancel={this.closeModal}
                    maskClosable={false}
                    okText="确定"
                    onOk={this.handleSubmit}
                    >
                    <Form layout='vertical'>
                        <Form.Item label="业务类型">
                            {getFieldDecorator('bizType', {
                                rules: [{ required: true, message: '请填写短信业务名称!' }],
                            })(
                                <Input placeholder="请输入" id='bizType' disabled={this.state.isbizType} />,
                            )}
                        </Form.Item>
                        <Form.Item label="短信渠道：">
                        {getFieldDecorator('channelId', {
                                rules: [{ required: true, message: '请选择短信渠道!' }],
                            })(
                                <Select
                                    placeholder="请选择"
                                    >
                                    {
                                        channelList.map((repy,i)=>{
                                            return <Option key={i} value={commonJs.is_obj_exist(repy.channelId)}>{commonJs.is_obj_exist(repy.channelDesc)}</Option>
                                        })
                                    }
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item label="短信模板编号：">
                        {getFieldDecorator('templateId', {
                                rules: [{ required: true, message: '请选择短信模板编号!' }],
                            })(
                                <Select
                                    showSearch
                                    placeholder="请选择"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                {
                                    STemplate.map((repy,i)=>{
                                        return <Option key={i} value={commonJs.is_obj_exist(repy.templateId)}>{commonJs.is_obj_exist(repy.description)}</Option>
                                    })
                                }
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item label="是否有效：">
                        {getFieldDecorator('status', {
                                rules: [{ required: true, message: '请选择是否有效!' }],
                            })(
                                <Select
                                    placeholder="请选择"
                                    >
                                    <Option value="1">正常</Option>
                                    <Option value="2">停用</Option>
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item label="业务来源 or 产品号：">
                            {getFieldDecorator('productNo', {
                                rules: [{ required: true, message: '请填写业务来源 or 产品号!' }],
                            })(
                                <Input placeholder="请输入" id='productNo' disabled={this.state.isbizType} />,
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
};
NoteBusiness = Form.create()(NoteBusiness);

export default NoteBusiness;