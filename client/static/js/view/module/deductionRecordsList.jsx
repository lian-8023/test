// 担保费扣款记录table展示
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import {Table } from 'antd';

class DeductionRecordsList extends React.Component {
    constructor(props){
        super(props);
        this.state={
            pageSize:10,
            pageNum:1,
            deductionRecordsList:{},
            loging:false,
        }
    }
    componentDidMount(){
        if(this.props.pageFlag){
            this.deductionRecords(this.state,this.props.that);
        }
    }
    //担保费扣款记录查询-lyf
    deductionRecords=(pageData,that)=>{
        let _that=this;
        let loanNumber = '';
        let cooperationFlag = '';
        if(this.props.pageFlag == 'CP2F'){
            loanNumber=that.userinfoStore.platforIdentityInfo.platformLoanInfoDTO?that.userinfoStore.platforIdentityInfo.platformLoanInfoDTO.acceptNo:'';
            cooperationFlag=that.userinfoStore.cooperationFlag;
        }else{
            loanNumber=that.labelBoxStore.rowData?that.labelBoxStore.rowData.loanNumber:"";//接口返回的合同号
            cooperationFlag=that.labelBoxStore.rowData?that.labelBoxStore.rowData.cooperationFlag:"";//接口返回的合同号
        }
        let params = {};
        params = pageData;
        params.loanNumber = loanNumber;
        params.productNo = cooperationFlag;
        _that.setState({loging:true});
        $.ajax({
            type:"post",
            url:"/node/upfrontFee/gurantee/pay",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(params)},
            success:function(res) {
                _that.setState({loging:false});
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                if(!response.executed){
                    _that.setState({
                        deductionRecordsList:{},
                    }) 
                }
                _that.setState({
                    deductionRecordsList:response,
                }) 
            }
        })
    }
    render() {
        let paymentInfos= '';
        let totalSize= '';
        if(this.props.pageFlag){
            paymentInfos = this.state.deductionRecordsList.paymentInfos;
            totalSize = this.state.deductionRecordsList.totalSize;
        }else{
            paymentInfos=this.props.deductionRecordsList.paymentInfos;
            totalSize=this.props.deductionRecordsList.totalSize;
        }
        let columns=[
            {
                title: '扣款金额',
                key:'amount',
                widt:'20%',
                render: (text,record,index) => {return commonJs.is_obj_exist(record.amount)}
            },{
                title: '扣款时间',
                key:'createdAt',
                widt:'10%',
                render: (text,record,index) => {return commonJs.is_obj_exist(record.createdAt)}
            },{
                title: '扣款状态',
                key:'description',
                widt:'10%',
                render: (text,record,index) => {return commonJs.is_obj_exist(record.description)}
            },{
                title: '失败原因',
                key:'message',
                widt:'20%',
                render: (text,record,index) => {return commonJs.is_obj_exist(record.message)}
            },
        ];
        return (
            <div data-btn-rule="RULE:TREE:GURANTEE:SEARCH:URL" >
                <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                    担保费扣款记录
                    <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                </h2>
                <div className="processing-cont-div mt5 clearfix bar">
                    <Table loading={this.state.loging} rowKey={(record, index) => index} dataSource={paymentInfos} columns={columns} pagination={{total:totalSize,pageSize: this.state.pageSize,current:this.state.pageNum,onChange:(page, pageSize)=>{
                        this.setState({
                            pageNum:page
                        })
                        let pageData = {
                            pageSize:this.state.pageSize,
                            pageNum:page
                        }
                        const that =  this.props.that?this.props.that:{};
                        if(this.props.pageFlag){
                            this.deductionRecords(pageData,this.props.that);
                        }else{
                            this.props.deductionRecords(pageData,that);
                        }
                }}} />
                </div>
            </div>
        );
    }
};

export default DeductionRecordsList;
