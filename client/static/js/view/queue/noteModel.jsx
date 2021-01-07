// 短信模版管理
import React from 'react';
import $ from 'jquery';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Modal, Select,Form, Input,Table, Divider } from 'antd';
const { TextArea } = Input;
const { Option } = Select;
import axios from '../../axios';
import qs from 'Qs'

import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class NoteModel extends React.Component {
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore; 
        this.state = {
            visible: false,   //弹窗是否可见
            pagination:{
                pageSize:10,
                current:1,
                showSizeChanger:true
            },
            searchRult:[]
        };
    }
    // 新增弹窗
    showModal = () => {
        this.setState({
          visible: true,
          modalType:'add',
          istemplateId:false
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
            parem.url='/STemplate/save';
        }else if(modalType=='edit'){
            parem.url='/STemplate/update';
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
            visible: true,  //显示弹窗
            modalType:'edit',
            istemplateId:true
        });
        let statusNo=currentData.status;
        this.props.form.setFieldsValue({
            templateId:currentData.templateId,
            description:currentData.description,
            content:currentData.content,
            status:statusNo.toString(),
        })
    }
    //搜索
    searchHandle=(pagination)=>{
        let that=this;
        let templateId=$('.top .templateId').val();
        if(templateId) templateId=templateId.replace(/^\s+|\s+$/g,'');
        let description=$('.top .description').val();
        if(description) description=description.replace(/^\s+|\s+$/g,'');
        let content=$('.top .contentKey').val();
        if(content) content=content.replace(/^\s+|\s+$/g,'');
        let status=$('.top .status option:selected').attr('value');
        let pageNum=1;
        let pageSize=10;
        if(pagination&&pagination.current){
            pageNum=pagination.current;
            pageSize=pagination.pageSize;
        }
        let url='/STemplate/query';
        let method='get';
        let parem={
            templateId,description,content,status,pageNum,pageSize,url,method
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
            console.log(jdata)
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
        const { getFieldDecorator } = this.props.form;
        const columns = [
            {
              title: '短信模板编号',
              dataIndex: 'templateId',
              key: 'templateId',
              width: '10%',
            },
            {
              title: '短信模板功能描述',
              dataIndex: 'description',
              key: 'description',
              width: '20%',
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
              title: '操作人员',
              dataIndex: 'operator',
              key: 'operator',
              width: '10%',
            },
            {
              title: '短信模板内容',
              dataIndex: 'content',
              key: '4',
              width: '40%',
            },
            {
                title: '操作',
                key: '操作',
                width: '10%',
                render: (text, record, index)=><button className="btn-blue" onClick={this.editHandle.bind(this,text, record, index)}>编辑</button>,
              },
          ];
        const pagination = { position: 'bottom' };
        return (
            <div  className="content" id="content">
                <div className="bar pt5 pb5 clearfix">
                    <button className="right mr15 btn-blue" id='addModal' onClick={this.showModal}>新增模板</button>
                </div>
                <div data-isresetdiv="yes" className="bar top clearfix mt10">
                    <input type="text" name="" placeholder="模板编号" className="input left mr10 mt10 templateId input_w" id='templateId' />
                    <input type="text" name="" placeholder="模板描述" className="input left mr10 mt10 description input_w" id='description' />
                    <input type="text" name="" placeholder="内容关键字" className="input left mr10 mt10 contentKey input_w" id='contentKey' />
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
                    <Table rowKey={record => record.templateId} columns={columns} scroll={{ x: 1300 }} dataSource={this.state.searchRult} onChange={this.searchHandle} pagination={this.state.pagination} />
                </div>
                
                <Modal
                    title={this.state.modalType=='edit'?'编辑模板':'新增模板'}
                    visible={this.state.visible}
                    onCancel={this.closeModal}
                    maskClosable={false}
                    okText="确定"
                    onOk={this.handleSubmit}
                    >
                    <Form layout='vertical'>
                        <Form.Item label="短信编号：">
                        {getFieldDecorator('templateId', {
                            rules: [{ required: true, message: '请输入短信编号!' }],
                        })(
                            <Input type='input' id='istemplateId' placeholder='请输入' disabled={this.state.istemplateId} />,
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
                        <Form.Item label="功能描述：">
                            {getFieldDecorator('description', {
                                rules: [{ required: true, message: '请填写功能描述!' }],
                            })(
                                <Input placeholder='请输入' id='description' />,
                            )}
                        </Form.Item>
                        <Form.Item label="短信内容编辑 （请使用{}代表需要填写的信息）：">
                            {getFieldDecorator('content', {
                                rules: [{ required: true, message: '请填写短信内容!' }],
                            })(
                                <TextArea id='content' rows={3} placeholder='请输入' />
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
};
NoteModel = Form.create()(NoteModel);

export default NoteModel;