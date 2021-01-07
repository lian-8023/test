
// 优选贷管理页面
import React from 'react';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CountMix from '../../source/common/countMix';
var countMix=new CountMix;
import { Tag ,Modal,Select,Table,Row, Col ,DatePicker,Breadcrumb,Form, Input, Button, InputNumber } from 'antd';
const { MonthPicker, RangePicker, WeekPicker,Alert } = DatePicker;
const { Option } = Select;
import axios from '../../axios';
import qs from 'Qs';

import {observer,inject} from "mobx-react";
@inject('allStore') @observer

@Form.create() 
class BestLoansManage extends React.Component {
    constructor(props){
        super(props);
        this.store=this.props.allStore;  //渠道-合作方数据
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
        this.store.ChannelStore.getChanel();
        this.search(true);
    }
    //确认排序
    sureSort=()=>{
      let that=this;
      let flowPackage=$('#flowPackage').val().replace(/^\s+|\s+$/g, '');
      if(!flowPackage){
        alert('请输入需要修改的顺序！');
        return;
      }
      axios({
        method: 'POST',
        url:'/node/opt/sort',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({flowPackage:flowPackage})
        })
        .then(function (res) {
          let response=res.data;  //from node response
          let data=response.data;  //from java response
          if (!commonJs.ajaxGetCode(response)) {
              return;
          }
          alert(data.message);
          $('#flowPackage').val('');
          that.search(true);
          that.setState({
            sortModal:false
          })
      })
    }
    // 确认编辑
    sureEdit = e => {
      let that=this;
      e.preventDefault();
      let {loanInfoDTOS,editNo}=this.state;
      let loanInfoDTOS_cur=loanInfoDTOS[editNo];
      this.props.form.validateFields((err, values) => {
        
        console.log('Receivede values of values: ', values);
        if(err){
          return;
        }
        values.marker=loanInfoDTOS_cur.marker;
        values.rawAddTime=loanInfoDTOS_cur.rawAddTime;
        values.rawUpdateTime=loanInfoDTOS_cur.rawUpdateTime;
        values.showLevel=loanInfoDTOS_cur.showLevel;
        values.id=loanInfoDTOS_cur.id;
        values.lowYearApr=countMix.accDiv(values.lowYearApr,100);
        console.log('lowYearApr',values.lowYearApr)
        axios({
          method: 'POST',
          url:'/node/opt/edit',
          data:{josnParam:JSON.stringify(values)}
          })
          .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.search(false);
            that.modalState('editModal',false);
        })
      });
    };
    productNo_cdt_h=(e)=>{
      this.setState({
        productNo_cdt:e.target.value
      })
    }
    channelNo_cdt_h=(e)=>{
      this.setState({
        channelNo_cdt:e.target.value
      })
    }
    isUsed_cdt_h=(value)=>{
      this.setState({
        isUsed_cdt:value
      })
    }
    reset_cdt=()=>{
      this.setState({
        productNo_cdt:'',
        channelNo_cdt:'',
        isUsed_cdt:'',
      })
    }
    //搜索
    search=(btn)=>{
      let {productNo_cdt,channelNo_cdt,isUsed_cdt}=this.state;
      const getPager = { ...this.state.pagination };
      if(btn){
        getPager.current=1;
        this.setState({
            pagination:getPager
        })
      };
      let that=this;
      let parems={};
      if(productNo_cdt){
        parems.flowName=productNo_cdt.replace(/^\s+|\s+$/g, '');
      }
      if(channelNo_cdt){
        parems.vendor=channelNo_cdt.replace(/^\s+|\s+$/g, '');
      }
      if(isUsed_cdt){
        parems.valid=isUsed_cdt.replace(/^\s+|\s+$/g, '');
      }
      this.setState({
        condition:parems
      })
      parems.pageNumber=getPager.current;
      parems.pagesize=getPager.pageSize;
      axios({
        method: 'POST',
        url:'/node/opt/queryList',
        data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
          let response=res.data;  //from node response
          let data=response.data;  //from java response
          const pager = { ...that.state.pagination };
          if (!commonJs.ajaxGetCode(response)) {
            that.setState({
              loanInfoDTOS:[],
            })
            pager.total=0;
            return;
          }
          let loanInfoDTOS=cpCommonJs.opinitionArray(data.loanInfoDTOS); //	优选贷列表信息
          pager.total=data.totalSize;
          that.setState({
            loanInfoDTOS:loanInfoDTOS,
            pagination:pager
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
          this.search(false);
      });
    }
    //编辑
    edit=(editNo)=>{
      this.setState({
        editModal:true,
        editNo:editNo
      });
    }
    resetEdit = () => {
      this.props.form.resetFields();
    };
    //调整展示顺序-先调搜索排序接口
    sortList=(visible,on_off)=>{
      let that=this;
      axios({
        method: 'get',
        url:'/node/opt/searchSort',
      })
      .then(function (res) {
          let response=res.data;  //from node response
          let data=response.data;  //from java response
          if (!commonJs.ajaxGetCode(response)) {
              that.setState({
                sortList:''
              })
              return;
          }
          that.setState({
            sortList:commonJs.is_obj_exist(data.flowPackage)
          })
      })
      this.modalState(visible,on_off);
    }
    // 弹窗
    modalState = (visible,on_off) => {
      this.setState({
          [visible] : on_off,
      });
      this.props.form.resetFields();
      $('#flowPackage').val('');
    };

    toFormDom=(ops)=>{
      if(ops.dom=='input'){
        return <Input placeholder="请输入" />
      }else if(ops.dom=='InputNumber'){
        return <InputNumber
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                />
      }else if(ops.dom=='select'){
        return <Select
                  showSearch
                  style={{ width: 200 }}
                  placeholder="请选择"
                  optionFilterProp="children"
                  filterOption={(input, option) =>option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 }>
                  <Option value='false'>禁用</Option>
                  <Option value='true'>可用</Option>
              </Select>
            }
    }
    getFields=()=>{
      const { getFieldDecorator } = this.props.form;
      const children = [];
      let {loanInfoDTOS={},editNo=''}=this.state;
      let currentLoanInfoDTOS=cpCommonJs.opinitionObj(loanInfoDTOS[editNo]);
      console.log('currentLoanInfoDTOS',editNo,currentLoanInfoDTOS);

      const formItemLayout ={
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
      };
      const opss=[
        {
          lab:'产品名称',
          dom:'input',
          require:true,
          defaultVal:'flowName',
          parem:'flowName'
        },{
          lab:'最高可借额度',
          dom:'input',
          require:true,
          defaultVal:'highAmount',
          parem:'highAmount',
          cell:function(rule, value, callback){
            if(!value){
              return callback('必填!');
            }else if(isNaN(value)){
              return callback('必须是数字!');
            }else{
              callback();
            }
          }
        },{
          lab:'最低年化利率',
          dom:'InputNumber',
          require:true,
          defaultVal:'lowYearApr',
          parem:'lowYearApr',
          conversion:'multiplication',
          cell:function(rule, value, callback){
            if(!value){
              return callback('必填!');
            }else if(isNaN(value)){
              return callback('必须是数字!');
            }else{
              callback();
            }
          }
        },{
          lab:'借款期限',
          dom:'input',
          require:true,
          defaultVal:'loanTermRange',
          parem:'loanTermRange'
        },{
          lab:'产品渠道号',
          dom:'input',
          require:true,
          defaultVal:'vendor',
          parem:'vendor'
        },{
          lab:'产品描述',
          dom:'input',
          require:true,
          defaultVal:'flowDesc',
          parem:'flowDesc'
        },{
          lab:'产品链接',
          dom:'input',
          require:true,
          defaultVal:'url',
          parem:'url'
        },{
          lab:'产品图片链接',
          dom:'input',
          require:true,
          defaultVal:'logoImgFileUrl',
          parem:'logoImgFileUrl'
        },{
          lab:'是否可用',
          dom:'select',
          require:true,
          defaultVal:'valid',
          parem:'valid',
          data:[
            {
              dis:'禁用',
              val:'dis'
            },{
              dis:'可用',
              val:'able'
            }
          ]
        },
      ]
      for (let i = 0; i < opss.length; i++) {
        let ops=opss[i];
        children.push(
            <Form.Item label={ops.lab} {...formItemLayout} key={ops.parem}>
              {getFieldDecorator(ops.parem, {
                rules: [
                  {
                    required: ops.require,
                    validator:ops.cell,
                    whitespace:true,
                    message: ops.cell?null:'必填',
                  },
                ],
                initialValue:(ops.conversion && commonJs.is_obj_exist(currentLoanInfoDTOS[ops.defaultVal])!='-') ? countMix.accMul(currentLoanInfoDTOS[ops.defaultVal],100) : currentLoanInfoDTOS[ops.defaultVal]+''
              })(
                this.toFormDom(ops)
              )}
            </Form.Item>
        );
      }
      return children;
    }
    render() {
        let {loanInfoDTOS=[],sortList}=this.state;
        const buttonItemLayout={
          wrapperCol: { span: 14, offset: 6 }
        }
        const columns = [
            {
              title: '产品名称',
              width:80,
              key:'flowName',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.flowName)}
            },
            {
              title: '最高可借额度',
              width:100,
              key:'highAmount',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.highAmount)}
            },
            {
              title: '最低年化利率',
              width:100,
              key:'lowYearApr',
              render: (text,record,index) => {
                return commonJs.is_obj_exist(record.lowYearApr)!='-' ?
                `${countMix.accMul(record.lowYearApr,100)}%`  : '-'
              }
            },
            {
              title: '借款期限',
              width:80,
              key:'loanTermRange',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.loanTermRange)}
            },
            {
              title: '产品描述',
              width:130,
              key:'flowDesc',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.flowDesc)}
            },
            {
              title: '产品渠道号',
              width:100,
              key:'vendor',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.vendor)}
            },
            {
              title: '产品链接',
              width:200,
              key:'url',
              render: (text,record,index) => (
                <span style={{wordWrap:'break-word',wordBreak:'break-word'}}>{commonJs.is_obj_exist(record.url)}</span>
              )
            },
            {
              title: '产品图片链接',
              width:200,
              key:'logoImgFileUrl',
              render: (text,record,index) => (
                <span style={{wordWrap:'break-word',wordBreak:'break-word'}}>{commonJs.is_obj_exist(record.logoImgFileUrl)}</span>
              )
            },
            {
              title: '可用状态',
              width:100,
              key:'valid',
              render: (text,record,index) => {
                if(record.valid){
                  return '可用';
                }else{
                  return '禁用'
                }
              }
            },
            {
              title: '操作',
              width:10,
              render: (text,record,index) => (
                <Tag onClick={this.edit.bind(this,index)}>编辑</Tag>
              )
            }
        ];
        
        return (
            <div  className="content" id="content">
                <div className="mt10 bar pt10 pl10 pr10 pb10">
                  <Row>
                      <Col span={4}>产品名称：<Input placeholder='请输入' value={this.state.productNo_cdt} style={{width:'200px'}} onChange={this.productNo_cdt_h} /></Col>
                      <Col span={4}>渠道号：<Input placeholder='请输入' value={this.state.channelNo_cdt} style={{width:'200px'}}  onChange={this.channelNo_cdt_h} /></Col>
                      <Col span={4}>
                          是否可用：
                          <Select
                              showSearch
                              value={this.state.isUsed_cdt}
                              style={{ width: 200 }}
                              placeholder="请选择"
                              optionFilterProp="children"
                              onChange={this.isUsed_cdt_h}
                          >
                              <Option value=''>全部</Option>
                              <Option value='false'>禁用</Option>
                              <Option value='true'>可用</Option>
                          </Select>
                      </Col>
                      <Col span={10}>
                          <Button onClick={this.reset_cdt} style={{marginRight:'10px'}}>重置</Button>
                          <Button type="primary" id='searchBtn' onClick={this.search}>查询</Button>
                      </Col>
                      <Col span={2}>
                          <Button id='sort' type="primary" onClick={this.sortList.bind(this,'sortModal',true)}>调整展示顺序</Button>
                      </Col>
                  </Row>
                </div>
                <div className="bar mt10">
                    <Table 
                      rowKey={(record, index) => index} 
                      pagination={this.state.pagination} 
                      size="middle" scroll={{ x: 2200 }} 
                      columns={columns} dataSource={loanInfoDTOS}
                      onChange={this.handleTableChange}  
                    />
                </div>


              <Modal
                  title="编辑"
                  visible={ this.state.editModal}
                  footer={false}
                  onCancel={this.modalState.bind(this,'editModal',false)}
                >
                  <Form layout='horizontal'>
                    {this.getFields()}
                    <Form.Item {...buttonItemLayout}>
                        <Button type="primary" onClick={this.sureEdit}>确认</Button>
                        <Button style={{ marginLeft: 8 }} onClick={this.resetEdit}>重置</Button>
                    </Form.Item>
                  </Form>
              </Modal>

              <Modal
                  title="调整展示顺序"
                  visible={ this.state.sortModal}
                  onOk={this.sureSort}
                  onCancel={this.modalState.bind(this,'sortModal',false)}
                >
                    <p>当前展示顺序：{commonJs.is_obj_exist(sortList)}</p>
                    <p className='mt20'>修改后展示顺序：</p>
                    <p>
                      <textarea name="" id="flowPackage" cols="55" rows="5" className='textarea'></textarea>
                    </p>
              </Modal>
            </div>
        );
    }
};
export default BestLoansManage;

