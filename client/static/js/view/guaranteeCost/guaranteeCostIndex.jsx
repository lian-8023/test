// 担保费 index
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;import ChangeLabel2A from '../../source/common/changeLabel2A';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
let changeLabel2A=new ChangeLabel2A;
import ChangeLabelCP from '../../source/common/changeLabelCP';
let changeLabelCP=new ChangeLabelCP;
import LabelBody from '../common/labelBody';
import AccountBar from '../A2-module/AccountBar'  // 横向的信息栏
import { Select,Button,Table } from 'antd';
const { Option } = Select;
import axios from '../../axios';
import qs from 'Qs';
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class GuaranteeCostIndex extends React.Component{
    constructor(props){
        super(props);
        this.userInfoCP=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.topBindNumberStore=this.props.allStore.TopBindNumberStore;  //顶部绑定（完成）数显示-通用 2A portal
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息  
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2A PORTAL用户详情-UserMsg组件信息 
        this.commonStore=this.props.allStore.CommonStore;
        this.state={
            productNo:'2A',
            pagination:{
                current:1,
                pageSize:10,
                showSizeChanger:true,
                pageSizeOptions:['10','30','50','100']
            }
        }
    }
    @action UNSAFE_componentWillMount(){
        this.labelBoxStore.lef_page="";
        this.labelBoxStore.rig_page="";
    }
    componentDidMount(){
        commonJs.reloadRules();
    }

    /**
     * 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    changeLeft(index,right_index){
        var leftHtml = this.getLeftHtml(parseInt(index));
        this.setState({
            lef_page:leftHtml
        },()=>{
            $(".Csearch-left-page li").removeClass("on");
            $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
        })
    }

    selectChange=(value)=>{
        this.setState({
            productNo:value
        })
    }
    //搜索
    searchFn=(btn)=>{
        let productNo=this.state.productNo;
        if(!productNo){
            alert('请选择搜索条件！')
            return;
        }
        const getPager = { ...this.state.pagination };
        if(btn){
            getPager.current=1;
            this.setState({
                pagination:getPager
            })
        }
        let params={
            pageNum:getPager.current,
            pageSize:getPager.pageSize,
            productNo:productNo,
            feeType:'guaranteefee',
        };
        let loanNumber=$(".top .loanNumber").val();
        if(loanNumber && loanNumber.replace(/\s/g,'')){
            params.loanNumber=loanNumber.replace(/^\s+|\s+$/g, '');
        }
        let that=this;
        axios({
            method: 'POST',
            url:'/node/upfrontFee/getUpfrontFeeList',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(params),
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            const pager = { ...that.state.pagination };
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    guaranteeFeeInfoDTOS:[]
                });
                pager.total=0;
                return;
            }
            let guaranteeFeeResponseDTO=cpCommonJs.opinitionObj(data.guaranteeFeeResponseDTO);
            pager.total=guaranteeFeeResponseDTO.total;
            that.setState({
                guaranteeFeeInfoDTOS:cpCommonJs.opinitionArray(guaranteeFeeResponseDTO.guaranteeFeeInfoDTOS),
                pagination:pager
            });
        })
    }
    //任务绑定列表表格切换页码以及排序
    handleTableChange=(pagination, filters, sorter)=>{
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        pager.pageSize = pagination.pageSize;
        this.setState({
        pagination: pager,
        },()=>{
            this.searchFn();
        });
    }
    //  详情--select框切换合同号
    changeDetLoanNo(){
        changeLabel2A.changeLeft2A(1,this);  //重新加载案列页面
    }
    //点击表格行
    onRow=(record)=>{
        this.setState({
            _params:record.accountId,
            rowData:record
        });
        let _rowData=Object.assign({},record);
        _rowData.productNo='2A';
        commonJs.changeLabelBoxFn(this,_rowData,changeLabel2A,changeLabelCP,{isChange:true,changeNo:22},{isChange:true,changeNo:2});
        $(".labelBodyDiv").removeClass("hidden");
    }
    /**
     * 2A PORTAL切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    @action changeLeft2A(index){
        $(".Csearch-left-page li").removeClass("on");
        $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
        var lef_current_page=$(".Csearch-left-page .nav").find(".on").attr("data-id");
        changeLabel2A.changeLeft2A(parseInt(lef_current_page),this);
    }
    /** coopration 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    @action changeLeftCP(index,right_index){
        var leftHtml = changeLabelCP.getLeftHtml(parseInt(index),this);
        this.labelBoxStore.lef_page=leftHtml;
        $(".Csearch-left-page li").removeClass("on");
        $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
    }
    render() {
        let {rowData={},guaranteeFeeInfoDTOS=[]}=this.state;
        const columns = [
            { title: '全部担保费', dataIndex: 'amount', key: 'amount',width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.amount)}},
            { title: '未结清担保费', dataIndex: 'amountNotPaid', key: 'amountNotPaid' ,width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.amountNotPaid)}},
            { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt',width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.createdAt)} },
            { title: '应还款时间', dataIndex: 'dueDate', key: 'dueDate',width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.dueDate)} },
            { title: '期数', dataIndex: 'installmentNumber', key: 'installmentNumber',width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.installmentNumber)} },
            { title: '合同号', dataIndex: 'loanNumber', key: 'loanNumber',width:'20%',render: (text,record,index) => {return commonJs.is_obj_exist(record.loanNumber)} },
            { title: '产品号', dataIndex: 'productNo', key: 'productNo',width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.productNo)} },
            { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt',width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.updatedAt)} },
        ];
        return (
            <div className="content" id="content">
                <div className="top pt10">
                    <div className="left mr5">
                        <Select style={{ width: 200 }} defaultValue='2A' placeholder='请选择' onChange={this.selectChange}>
                            <Option value="2A">小雨点-2A</Option>
                        </Select>
                    </div>
                    <input type="text" className="left loanNumber input input_w mr3" placeholder='请输入合同号' />
                    <Button type="primary" onClick={this.searchFn.bind(this,true)}>搜索</Button>
                </div>
                
                <div className="cdt-result bar mt20 relative">
                    <Table 
                        rowKey={(record, index) => index} 
                        columns={columns} 
                        dataSource={guaranteeFeeInfoDTOS} 
                        onRow={record => {
                            return { onClick:this.onRow.bind(this,record), };
                        }}
                        onChange={this.handleTableChange} 
                        scroll={{ x: '600px', y: 500 }} 
                        pagination={this.state.pagination} 
                    />
                </div>
                {/* 搜索条件下面的信息栏 */}
                {
                    rowData.productNo=="2A"?
                    <AccountBar loanNumberChange={this.changeDetLoanNo.bind(this)} pagination={this.state.pagination} />
                    :""
                }
                <div className="mt20 clearfix labelBodyDiv hidden">
                    <LabelBody 
                        rigPage={this.props.params.rigPage} 
                        _oper_type={this.state._oper_type}
                        _labelBody_reload={this.state._labelBody_reload}
                        updateList={this.searchFn.bind(this)}   //搜索方法
                        rowData={rowData}
                        A2LeftComponent={['userMsg','case','packList','file','phoneMsg','callRecord']}  //2A portal-左侧页面需要显示的组件配置
                        A2RightComponent={['guarantee']}  //2A portal-右侧页面需要显示的组件配置
                        CPLeftComponent={['userMsg','file','repaymentList','withholdList']}  //cooperation portal-左侧页面需要显示的组件配置
                        CPRightComponent={['reminder']}  //cooperation portal-右侧页面需要显示的组件配置
                    />
                </div>
            </div>
        )
    }
};

export default GuaranteeCostIndex;  //ES6语法，导出模块