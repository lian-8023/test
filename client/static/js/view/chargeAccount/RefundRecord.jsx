// 记账宝-退款记录查询
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import './chargeAccount.less';
import axios from '../../axios';
import {Table,Input } from 'antd';
const { Search } = Input;

class RefundRecord extends React.Component {
    constructor(props){
        super(props);
        this.state = {
          pagination:{
            current:1,
            pageSize:10,
            searchIputVal:'',
            showSizeChanger:true,
            pageSizeOptions:['10','30','50','100']
        }
        };
    }
    componentDidMount() {
    }
    setCdt=(value)=>{
      this.setState({
        condition:value
      })
      this.searchHandle(value,true)
    }
    //搜索
    searchHandle=(condition,btn)=>{
      let that=this;
      const getPager = { ...this.state.pagination };
      if(btn){
        getPager.current=1;
        this.setState({
            pagination:getPager
        })
      };
      let parems={
        pageNumber:getPager.current,
        pagesize:getPager.pageSize,
        condition:condition,
      };
      axios({
        method: 'POST',
        url:'/node/charge/return/query',
        data:{josnParam:JSON.stringify(parems)}
      })
      .then(function (res) {
          let response=res.data;  //from node response
          let data=response.data;  //from java response
          const pager = { ...that.state.pagination };
          if (!commonJs.ajaxGetCode(response)) {
            that.setState({
              infoDTOS:[]
            });
            pager.total=0;
            return;
          }
          pager.total=data.count;
          that.setState({
            infoDTOS:cpCommonJs.opinitionArray(data.infoDTOS),
            pagination:pager
          })
      })
    }
    //
    onChange=(e)=>{
      const { value } = e.target;
      this.setState({
        searchIputVal:value
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
          this.searchHandle(this.state.condition,false);
      });
  }
    render() {
      let {searchIputVal,infoDTOS=[]}=this.state;
      const tableColumns = [
          { title: '流水号', dataIndex: 'orderNo', key: 'orderNo',width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.orderNo)} },
          { title: '退款金额(元)', dataIndex: 'amount', key: 'amount',width:'15%',render: (text,record,index) => {return commonJs.is_obj_exist(record.amount)} },
          { title: '退款账户虚拟号', dataIndex: 'dmanbr', key: 'dmanbr',width:'15%',render: (text,record,index) => {return commonJs.is_obj_exist(record.dmanbr)} },
          { title: '提交退款时间', dataIndex: 'createdAt', key: 'createdAt',width:'15%',render: (text,record,index) => {return commonJs.is_obj_exist(record.createdAt)} },
          { title: '当前状态', dataIndex: 'paymentStatusId', key: 'paymentStatusId',width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.paymentStatusId)}},
          { title: '回盘时间', dataIndex: 'completeTime', key: 'completeTime',width:'15%',render: (text,record,index) => {return commonJs.is_obj_exist(record.completeTime)} },
          { title: '备注', dataIndex: 'message', key: 'message',width:'20%',render: (text,record,index) => {return commonJs.is_obj_exist(record.message)} },
        ];
        return (
            <div>
              <div className="left mb10" id='searchInpt'>
                  <Search placeholder="按流水号/退款账户虚拟号查询" onSearch={this.setCdt} value={searchIputVal} enterButton onChange={this.onChange} style={{ width: 400 }} />
              </div>
              <div className="clearfix"></div>
              <div className="">
                <Table
                    rowKey={(record, index) => `rowKey${index}`}
                    columns={tableColumns}
                    dataSource={infoDTOS}
                    pagination={this.state.pagination}
                    onChange={this.handleTableChange} 
                />
              </div>
            </div>
        );
    }
};

export default RefundRecord;