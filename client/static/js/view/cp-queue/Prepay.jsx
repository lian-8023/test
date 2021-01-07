
// 预付金页面
import React from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Tag ,Modal,Select,Table,Row, Col ,DatePicker,Input} from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const { Option } = Select;
import axios from '../../axios';
import qs from 'Qs';

import {observer,inject} from "mobx-react";
@inject('allStore') @observer

class Prepay extends React.Component {
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
    componentDidMount(){
        this.init();
        this.store.ChannelStore.getChanel();
        this.advanceAll();
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
    // 展示弹窗
    showModal = (visible,index) => {
        this.setState({
            [visible] : true,
        });
        if(commonJs.is_obj_exist(index)){
            this.setState({
                currentTr: index
            });
        }
    };
    // 关闭弹窗
    closeModal=(visible)=>{
        this.setState({
            [visible] : false,
            rechargeTime:undefined,
            rechargeAmount:undefined,

            productNo_sel:undefined,
            acountType_value:'',
            acountType:undefined,
        });
    }
    // 确定增加合作方
    sureAddCoorp=()=>{
        let {productNo_sel,acountType_value}=this.state;
        let that=this;
        if(!productNo_sel){
            alert('请选择产品号！');
            return;
        }
        if(!acountType_value){
            alert('请选择账户类型！');
            return;
        }
        axios({
            method: 'POST',
            url:'/node/advance/create',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify({
                productNo:productNo_sel,
                type:acountType_value
            }),
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.advanceAll();
            that.closeModal('addCooP');
        })
    }
    // 确认充值======未做
    sureRecharge=()=>{
        let that=this;
        let _parem={};
        let {advanceInfoDTO,currentTr}=this.state;
        let advanceInfoDTO_tr=advanceInfoDTO[currentTr];
        _parem.amount=this.state.rechargeAmount;
        _parem.productNo=this.state.productNo;
        axios({
            method: 'POST',
            url:'/node/advance/records/update',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(_parem),
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            that.props.searchHandle('RELOAD',true);
        })
    }
    //slect框选中
    productNo_sel=(val)=>{
        this.setState({
            productNo_sel:`${val}`
        })
    }
    productNo_cdt=(val)=>{
        console.log('productNo_cdt',val)
        this.setState({
            productNo_cdt:`${val}`
        })
    }
    acountType_sel=(val,option)=>{
        console.log('acountType_sel',option.props.name)
        this.setState({
            acountType:`${val}`,
            acountType_value:option.props.name
        })
    }
    // 充值时间
    rechargeTime=(date, dateString)=>{
        this.setState({
            rechargeTime:date
        })
    }
    select_month=(date, dateString)=>{
        this.setState({
            month_cdt:date
        })
    }
    //重置
    reset_cdt=()=>{
        this.setState({
            productNo_cdt:undefined,
            month_cdt:undefined
        })
    }
    //获取所有预付金账户
    advanceAll=()=>{
        let that=this;
        axios({
            method: 'get',
            url:'/node/advance/all'
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            const pager = { ...that.state.pagination };
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    advanceInfoDTO:[]
                })
                pager.total=0;
                return;
            }
            let advanceInfoDTO=cpCommonJs.opinitionArray(data.data);
            let getIdObj={};
            for(let i=0;i<advanceInfoDTO.length;i++){
                let _i=advanceInfoDTO[i];
                getIdObj[_i.productNo+_i.type]=_i.id
            }
            that.commonStore.getIdObj=getIdObj;
            pager.total=data.totalSize;
            that.setState({
                advanceInfoDTO:advanceInfoDTO,
                pagination:pager,
            })
        })
    }
    //获取预付金余额
    searchBalance=()=>{
        let that=this;
        let {productNo_cdt,month_cdt}=this.state;
        if(!productNo_cdt){
            alert('请选择合作方！');
            return;
        }
        if(!month_cdt){
            alert('请选择时间！');
            return;
        }
        axios({
            method: 'get',
            url:'/node/advance/balance',
            params:{
                productNo:productNo_cdt,  //产品号
                currentMonth:month_cdt.format('YYYY-MM'),  //年月(yyyy-MM格式)
            }
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
                balance:commonJs.is_obj_exist(data.balance)
            })
        })
    }
    toPrepay_det=(record)=>{
        this.commonStore.record=record;
    }

    //表格切换页码以及排序
    handleTableChange=(pagination, filters, sorter)=>{
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        pager.pageSize = pagination.pageSize;
        this.setState({
        pagination: pager,
        });
      }
    //充值金额
    rechargeAmount=e => {
        this.setState({ 
            rechargeAmount:e.target.value
         });
    };
    render() {
        const {balance,advanceInfoDTO=[],rechargeTime,rechargeAmount,currentTr,chargeEnums=[], typeEnums=[],pagination}=this.state;
        const {channelArr=[]}=this.store.ChannelStore;
        let advanceInfoDTO_tr=cpCommonJs.opinitionObj(advanceInfoDTO[currentTr]);  //编辑的当条数据
        let currentState='';
        if(commonJs.is_obj_exist(advanceInfoDTO_tr.normal)==1){
            currentState= '正常';
        }else if(commonJs.is_obj_exist(advanceInfoDTO_tr.normal)==-1){
            currentState= '不正常';
        }else{
            currentState= commonJs.is_obj_exist(advanceInfoDTO_tr.normal)
        }
        const columns = [
            {
              title: '合作方产品',
              width:'10%',
              key:'productName',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.productName)}
            },
            {
              title: '产品编号',
              width:'10%',
              key:'productNo',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.productNo)}
            },
            {
              title: '预付金类型',
              width:'10%',
              key:'typeName',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.typeName)}
            },
            {
              title: '当前预付金（元）',
              width:'15%',
              key:'totalAmountString',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.totalAmountString)}
            },
            {
              title: '最小预付金（元）',
              width:'15%',
              key:'safeAmountString',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.safeAmountString)}
            },
            {
              title: '预付金账户状态',
              width:'10%',
              key:'normal',
              render: (text,record,index) => {
                if(commonJs.is_obj_exist(record.normal)==1){
                    return '正常';
                }else if(commonJs.is_obj_exist(record.normal)==-1){
                    return '不正常';
                }else{
                    return commonJs.is_obj_exist(record.normal)
                }
              }
            },
            {
              title: '创建时间',
              width:'10%',
              key:'gmtCreateStr',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.gmtCreateStr)}
            },
            {
              title: '更新时间',
              width:'10%',
              key:'gmtModifyStr',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.gmtModifyStr)}
            },
            {
              title: '操作',
              width:'10%',
              key:'highAm2ount',
              render: (text,record,index) => (
                <div>
                    {/* <Tag color="#87d068" style={{marginRight:'10px'}} onClick={this.showModal.bind(this,'recharge',index)}>充值</Tag> */}
                    <Tag color="#87d068" onClick={this.toPrepay_det.bind(this,record)}><Link to={`/Prepay_det`}>明细</Link></Tag>
                </div>
              )
            },
        ];
        return (
            <div  className="content" id="content">
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar check-search clearfix overflow-auto">
                    <Row>
                        <Col span={6}>
                            合作方 ：
                            <Select
                                showSearch
                                value={this.state.productNo_cdt}
                                style={{ width: 200 }}
                                placeholder="请选择"
                                optionFilterProp="children"
                                onChange={this.productNo_cdt}
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {
                                    channelArr.map((repy,i)=>{
                                        return <Option value={repy.value} key={i}>{repy.displayName}</Option>
                                    })
                                }
                            </Select>
                        </Col>
                        <Col span={5}>时间：<MonthPicker onChange={this.select_month} format="YYYY-MM" value={this.state.month_cdt} placeholder="Select month" />
                        </Col>
                        <Col span={4}>
                            <button className="left reset mr10" id='reset' onClick={this.reset_cdt}>重置</button>
                            <button className="left mr10 search-btn" id='searchBtn' onClick={this.searchBalance}>查询</button>
                        </Col>
                        <Col span={9}>
                            {/* <button className="right search-btn" id='prepay_det'><Link to='/Prepay_det' style={{'color':'#fff'}}>查看详情</Link></button> */}
                            <button className="right search-btn mr5" id='addCoorp' onClick={this.showModal.bind(this,'addCooP')}>增加合作方</button>
                        </Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col span={24}>
                            <b style={{"fontSize":"16px",color:'#1890ff'}}>当前预付金月余额:{commonJs.is_obj_exist(balance)}</b>
                        </Col>
                    </Row>
                </div>
                {/* 搜索条件 end */}
                <div className="bar mt10 searchResult_H">
                    <Table rowKey={(record, index) => index} pagination={pagination} size="middle" scroll={{ y: 1500 }} columns={columns} dataSource={advanceInfoDTO} onChange={this.handleTableChange} />
                </div>
                {/* 增加合作方弹窗 */}
                <Modal
                  title="增加合作方"
                  visible={this.state.addCooP}
                  onOk={this.sureAddCoorp}
                  onCancel={this.closeModal.bind(this,'addCooP')}
                >
                  <div>
                    <Row>
                        <Col span={24}>
                            产 品 号 ：
                            <Select
                                showSearch
                                style={{ width: 200 }}
                                value={this.state.productNo_sel}
                                placeholder="请选择"
                                optionFilterProp="children"
                                onChange={this.productNo_sel}
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                            {
                                channelArr.map((repy,i)=>{
                                    return <Option value={repy.value} key={i}>{repy.displayName}</Option>
                                })
                            }
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={[0,10]}>
                        <Col span={24}>
                            账户类型：
                            <Select
                                showSearch
                                style={{ width: 200 }}
                                placeholder="请选择"
                                value={this.state.acountType}
                                optionFilterProp="children"
                                onChange={this.acountType_sel}
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                            {
                                typeEnums.map((repy,i)=>{
                                    return <Option value={repy.name} name={repy.value} key={i}>{repy.displayName}</Option>
                                })
                            }
                            </Select>
                        </Col>
                    </Row>
                </div>
                </Modal>
                
                
                {/* 充值弹窗=====未做 */}
                <Modal
                  title="充值"
                  visible={this.state.recharge}
                  onOk={this.sureRecharge}
                  onCancel={this.closeModal.bind(this,'recharge')}
                >
                  <div>
                    <Row>
                        <Col span={8}>
                            充值流水号 :
                        </Col>
                        <Col span={16}>
                            xxxx
                        </Col>
                    </Row>
                    <Row gutter={[0,10]}>
                        <Col span={8}>
                            预付金额当前 :
                        </Col>
                        <Col span={16}>
                            ￥{commonJs.is_obj_exist(advanceInfoDTO_tr.totalAmountString)}
                        </Col>
                    </Row>
                    <Row gutter={[0,10]}>
                        <Col span={8}>
                            预付金额额度(最低) :
                        </Col>
                        <Col span={16}>
                            ￥{commonJs.is_obj_exist(advanceInfoDTO_tr.safeAmountString)}
                        </Col>
                    </Row>
                    <Row gutter={[0,10]}>
                        <Col span={8}>
                            当前状态 :
                        </Col>
                        <Col span={16}>
                            { currentState }
                        </Col>
                    </Row>
                    <Row gutter={[0,10]}>
                        <Col span={8}>
                        产品编号 :
                        </Col>
                        <Col span={16}>
                            {commonJs.is_obj_exist(advanceInfoDTO_tr.productNo)}
                        </Col>
                    </Row>
                    <Row gutter={[0,10]}>
                        <Col span={8}>
                        账户类型 :
                        </Col>
                        <Col span={16}>
                            
                        </Col>
                    </Row>
                    <Row gutter={[0,10]}>
                        <Col span={8}>
                        充值金额 :
                        </Col>
                        <Col span={16}>
                            <Input prefix="￥" suffix="RMB" style={{width:'180px'}} value={rechargeAmount} onChange={this.rechargeAmount} />
                        </Col>
                    </Row>
                    <Row gutter={[0,10]}>
                        <Col span={8}>
                        合作方转账时间 :
                        </Col>
                        <Col span={16}>
                            <DatePicker onChange={this.rechargeTime} value={rechargeTime} />
                        </Col>
                    </Row>
                </div>
                </Modal>
            </div>
        );
    }
};

export default Prepay;