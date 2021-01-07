
// 合同查询页面
import React from 'react';
import { PDFObject } from 'react-pdfobject'
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Table,Modal,Form, Input,Button} from 'antd';
import axios from '../../axios';

import {observer,inject} from "mobx-react";
@inject('allStore') @observer
@Form.create() 
class PactCheck extends React.Component {
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
    // 搜索
    handleSearch=(e)=>{
        if(e){
            e.preventDefault();
          }
          this.props.form.validateFields((err, values) => {
            console.log('Received values of form values: ', values);
            if(err){
              return;
            }
            let that=this;
            axios({
                method: 'get',
                url:'/node/loan/get/contract',
                params:{loanNumber:values.loanNumber}
            })
            .then(function (res) {
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                if (!commonJs.ajaxGetCode(response)) {
                    that.setState({
                        pacts:[]
                    })
                    return;
                }
                that.setState({
                    pacts:cpCommonJs.opinitionArray(data.data)
                })
            })
        })
    }

    opintState = (key,val,fileId) => {
        this.setState({
            [key]:val,
            fileId:fileId  //下载路径
        })
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
        const {pagination,pacts}=this.state;
        let advanceInfoDTO2=[{}];
        const { getFieldDecorator } = this.props.form;
        const columns = [
            {
              title: '合同号',
              width:'25%',
              key:'loanNumber',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.loanNumber)}
            },
            {
              title: '合同类型',
              width:'20%',
              key:'contractType',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.contractType)}
            },
            {
              title: '签约时间',
              width:'20%',
              key:'signAt',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.signAt)}
            },
            {
              title: '是否有效',
              width:'15%',
              key:' isvalid',
              render: (text,record,index) => {return commonJs.is_obj_exist(record. isvalid)}
            },
            {
              title: '文件地址',
              width:'',
              key:'totalAmou78ntString',
              render: (text,record,index) => (
                    <a onClick={this.opintState.bind(this,'fileView',true,record.fileId)}>预览</a>
              )
            }
        ];
        return (
            <div  className="content" id="content">
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar clearfix mt10 pt5 pl10 pr10">
                    <Form layout='inline'>
                        <Form.Item label='合同号：'>
                                {getFieldDecorator(`loanNumber`, {
                                rules: [
                                    {
                                    required: true,
                                    message: '请输入',
                                    },
                                ],
                                })(<Input placeholder="请输入" allowClear />)}
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" onClick={this.handleSearch}>搜索</Button>
                        </Form.Item>
                    </Form>
                </div>
                {/* 搜索条件 end */}
                <div className="bar mt10 searchResult_H">
                    <Table rowKey={(record, index) => index} pagination={pagination} size="middle" scroll={{ y: 1500 }} columns={columns} dataSource={pacts} onChange={this.handleTableChange} />
                </div>
                {/* 预览 */}
                <Modal
                    title="预览"
                    width='80%'
                    visible={this.state.fileView}
                    onCancel={this.opintState.bind(this,'fileView',false)}
                    footer={null}
                    >
                    {/* 用路径 this.state.fileId 打开文件======== */}
                    <PDFObject 
                    url={`/node/file/down?fileId=${this.state.fileId}&fileName=xxx.pdf&isDown=NO`} 
                    supportRedirect
                    height={"700px"}
                    pdfOpenParams={{
                    view: 'FitV',
                    page: '1',   //默认显示第一页
                    scrollbars: '0',
                    toolbar: 1,  //工具栏
                    statusbar: '1'
                    }}/>
                </Modal>
            </div>
        );
    }
};

export default PactCheck;