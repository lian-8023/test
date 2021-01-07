
// 合同查询页面
import React from 'react';
import { PDFObject } from 'react-pdfobject'
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Table,Modal,Form, Select,Button,Row,Col,Tag} from 'antd';
const { Option } = Select;
import axios from '../../axios';
import FileUpload from 'react-fileupload';

import {observer,inject} from "mobx-react";
@inject('allStore') @observer
@Form.create() 
class AMCdebt extends React.Component {
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
    handleSearch=(btn)=>{
        this.props.form.validateFields((err, values) => {
            console .log('Received values of form values: ', values);
            if(err){
                return;
            }
            let that=this;
            const getPager = { ...this.state.pagination };
            if(btn){
                getPager.current=1;
                this.setState({
                    pagination:getPager
                })
            };
            values.pageNumber=getPager.current;
            values.pagesize=getPager.pageSize;
            axios({
                method: 'post',
                url:'/node/amc/search',
                data:{josnParam:JSON.stringify(values)}
            })
            .then(function (res) {
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                const pager = { ...that.state.pagination };
                if (!commonJs.ajaxGetCode(response)) {
                    that.setState({
                        records:[]
                    })
                    pager.total=0;
                    return;
                }
                pager.total=data.totalSize;
                that.setState({
                    records:cpCommonJs.opinitionArray(data.records),
                    pagination:pager
                })
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
            this.handleSearch(false);
        });
    }
    _beforeUpload=()=>{
        this.setState({
            loading:true
        })
    }
    // 上传成功
    _handleUploadSuccess=(obj)=>{
        this.setState({
          loading:false
        },()=>{
          let _data=cpCommonJs.opinitionObj(obj.data);
          alert(_data.message);
        })
        
      }
    // 上传失败
    _handleUploadFailed=(err)=>{
        this.setState({
          loading:false
        },()=>{
          let _data=err.data?err.data:{};
          if(typeof(_data.resultStatus)!="undefined" && _data.resultStatus==1){
              alert(_data.resultMessage?_data.resultMessage:"失败");
              return;
          }
          if(typeof(_data.executed)!="undefined" && !_data.executed){
              alert(_data.message?_data.message:"失败");
          }
        })
    }

    render() {
        const {pagination,records=[],loading=false,currentErrorMsg}=this.state;
        const { getFieldDecorator } = this.props.form;
        let uploadOptions={
            baseUrl: '/cpQueue/amc/upload',
            accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
            fileFieldName:"ws",
            numberLimit: 5,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
            chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
            wrapperDisplay: 'inline-block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
            beforeUpload:this._beforeUpload,  //执行上传之前
            uploadSuccess: this._handleUploadSuccess,  //上传成功后执行的回调（针对AJAX而言）
            uploadFail: this._handleUploadFailed,  //上传失败后执行的回调（针对AJAX而言）
          }
        const columns = [
            {
                title: '合同号',
                width:'15%',
                key:'loanNumber',
                render: (text,record,index) => {return commonJs.is_obj_exist(record.loanNumber)}
              },
            {
              title: '批次号',
              width:'15%',
              key:'serialNo',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.serialNo)}
            },
            {
              title: 'Excel文件名',
              width:'15%',
              key:'fileName',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.fileName)}
            },
            {
              title: '创建时间',
              width:'15%',
              key:'createdAt',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.createdAt)}
            },
            {
              title: '债转时间',
              width:'15%',
              key:'transferDate',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.transferDate)}
            },
            {
              title: '债转状态',
              width:'10%',
              key:' status',
              render: (text,record,index) => {
                  if(commonJs.is_obj_exist(record.status)==0){
                      return '债转失败';
                  }else if(commonJs.is_obj_exist(record.status)==1){
                        return '债转成功';
                  }else{
                      return '-';
                  }
              }
            },
            {
                title: '失败原因',
                width:'10%',
                key:'errorMsg',
                render: (text,record,index) => {
                    if(commonJs.is_obj_exist(record.status)==0){
                        return <Tag color="green" 
                                    onClick={()=>{this.setState({showErrorMsg:true,currentErrorMsg:record.errorMsg})}}
                                >详情</Tag>
                    }else{
                        return '-';
                    }
                }
              }
        ];
        return (
            <div  className="content" id="content">
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar clearfix mt10 pt5 pl10 pr10">
                    <Form layout='inline'>
                        <Row>
                            <Col span={18}>
                                <Form.Item label='债转状态：'>
                                    {getFieldDecorator(`status`, {
                                    rules: [
                                        {
                                        required: false,
                                        message: '请输入',
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
                                        <Option value='1'>债转成功</Option>
                                        <Option value='0'>债转失败</Option>
                                    </Select>)}
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" onClick={this.handleSearch.bind(this,true)}>搜索</Button>
                                </Form.Item>
                            </Col>
                            <Col span={6} style={{ textAlign: 'right' }}>
                                <Form.Item>
                                    <FileUpload options={uploadOptions} ref="fileUpload">
                                        <Button  type="primary"  ref="chooseAndUpload" loading={loading}>我要债转</Button>
                                    </FileUpload>
                                </Form.Item>
                                <Form.Item>
                                    <a href='/node/amc/down/template?isDown=YES' target='_blank' className="block btn-blue right mr10 mt5">债转模板下载</a>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </div>
                {/* 搜索条件 end */}
                <div className="bar mt10 searchResult_H">
                    <Table rowKey={(record, index) => index} pagination={pagination} size="middle" scroll={{ y: 1500 }} columns={columns} dataSource={records} onChange={this.handleTableChange} />
                </div>
                <Modal
                    title="失败原因"
                    footer={null}
                    visible={this.state.showErrorMsg}
                    onCancel={()=>{this.setState({showErrorMsg:false})}}
                    >
                    <p>{commonJs.is_obj_exist(currentErrorMsg)}</p>
                    </Modal>
            </div>
        );
    }
};

export default AMCdebt;