// 2C商户/门店管理
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import {  Table,Modal } from 'antd';
import axios from '../../axios';

@inject('allStore') @observer
class Store_shop_manage extends React.Component{
    constructor(props){
        super(props);
        this.state={
            letterVisible:false,
            operateVisible:false
        }
    }
    componentDidMount(){
        this.getAllProvince();
    }
    //获取所有省
    getAllProvince(){
        var that=this;
        axios({
            method: 'get',
            url:"/common/getAllProvince",
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    allProvince:[]
                })
                return;
            }
            that.setState({
                allProvince:cpCommonJs.opinitionArray(data.data)
            })
        })
    }
    // 获取所有市
    getCity=(e)=>{
        let provinceCode=e.target.value;
        var that=this;
        axios({
            method: 'get',
            url:"/common/getCities",
            params:{provinceCode:provinceCode}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    allCity:[]
                })
                return;
            }
            that.setState({
                allCity:cpCommonJs.opinitionArray(data.data)
            })
        })
    }
    //获取所有市
    getDistricts=(e)=>{
        let cityCode=e.target.value;
        var that=this;
        axios({
            method: 'get',
            url:"/common/getDistricts",
            params:{cityCode:cityCode}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    allDistricts:[]
                })
                return;
            }
            that.setState({
                allDistricts:cpCommonJs.opinitionArray(data.data)
            })
        })
    }
    // 搜索
    searchHandle=() =>{
        let that=this,parems={};
        let type=$(".return-visit-condition .type option:selected").val();  //类型
        let name=$(".return-visit-condition .name").val();  //商户/门店名称
        let address=$(".return-visit-condition .address").val();  //地址
        let provinceId=$(".return-visit-condition .provinceId option:selected").val();  //省
        let cityId=$(".return-visit-condition .cityId option:selected").val();  //市
        let areaId=$(".return-visit-condition .areaId option:selected").val();  //区
        if(type)parems.type=type;
        if(name)parems.name=name;
        if(address)parems.address=address;
        if(provinceId)parems.provinceId=provinceId;
        if(cityId)parems.cityId=cityId;
        if(areaId)parems.areaId=areaId;
        axios({
            method: 'post',
            url:'/node/xyh/manage/search',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    responseList:[]
                })
                return;
            }
            that.setState({
                responseList:data.responseList,
                condition:parems
            })
        });
    }
    //操作记录modal
    showOperate=(index)=>{
        let {responseList}=this.state;
        let currentData=cpCommonJs.opinitionObj(responseList[index]);
        let recordList=cpCommonJs.opinitionArray(currentData.recordList);
        this.setState({
            operateVisible:true,
            recordList
        })
    }
    operateOk=()=>{

    }
    //停止/恢复进件
    showLetter=(status,index)=>{
        this.setState({
            letterVisible:true,
            status:status,  //标示是点击的恢复进件还是暂停进件
            dataIndex:index
        })
    }
    letterOk=()=>{
        let {condition,dataIndex,status,responseList}=this.state;
        let currentData=cpCommonJs.opinitionObj(responseList[dataIndex]);
        let content=$('.caseContent').val();
        let infoNo=commonJs.is_obj_exist(currentData.infoNo);
        let type=commonJs.is_obj_exist(currentData.infoType);
        if(!infoNo){
            alert('未获取到商户号/门店号！');
            return;
        }
        if(!content){
            alert('请填写案例记录！');
            return;
        }
        let parems={
            type,
            status,
            content,
            infoNo
        }
        let that=this;
        axios({
            method: 'post',
            url:'/node/xyh/manage/update',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.modalCancel();
            that.searchHandle();
        });
    }
    modalCancel=()=>{
        this.setState({
            letterVisible:false,
            operateVisible:false
        });
        $('.caseContent').val('');
    }
    render() {
        let {responseList=[],allProvince=[],allCity=[],allDistricts=[],recordList=[]}=this.state;
        const columns = [
            {
              title: '名称',
              key: 'infoName',
              width:'30%',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.infoName)}
            },{
                title: '类型',
                key: 'infoType',
                width:'10%',
                render: (text, record,index) => {
                    if(record.infoType=='merchant'){
                        return '商户';
                    }else if(record.infoType=='shop'){
                        return '门店';
                    }else{
                        return '-';
                    }
                },
            },{
                title: '地址信息',
                key: 'allAddress',
                width:'30%',
                render: (text, record,index) => {return commonJs.is_obj_exist(record.allAddress)},
            },{
                title: '状态',
                key: 'status',
                width:'10%',
                render: (text, record,index) => {return commonJs.is_obj_exist(record.status)},
            },{
                title: '操作',
                key: 'lateFeeNotPaid',
                width:'20%',
                render: (text,record,index) => {
                    if(record.status=='正常'){
                        return <div>
                                    <a className="accountBtn pointer mr5" onClick={this.showLetter.bind(this,0,index)}>暂停进件</a>
                                    <a className="accountBtn pointer" onClick={this.showOperate.bind(this,index)}>操作记录</a>
                                </div>
                    }else if(record.status=='暂停'){
                        return <div>
                                    <a className="accountBtn pointer mr5" onClick={this.showLetter.bind(this,1,index)}>恢复进件</a>
                                    <a className="accountBtn pointer" onClick={this.showOperate.bind(this,index)}>操作记录</a>
                                </div>
                    }else{
                        return '-';
                    }
                }
            }
        ];
        let columns2=[{
            title: '序号',
            key: 'id',
            width:'10%',
            render: (text, record,index) => {return index},
        },{
            title: '处理结果',
            key: 'resue',
            width:'20%',
            render: (text, record,index) => {
                if(record.dealResult=='ON'){
                    return '恢复进件';
                }else if(record.dealResult=='OFF'){
                    return '暂停进件';
                }else{
                    return '-';
                }
            },
        },{
            title: '案件记录',
            key: 'resfudse',
            width:'40%',
            render: (text, record,index) => {return commonJs.is_obj_exist(record.caseRecord)},
        },{
            title: '处理时间',
            key: 'resdue',
            width:'20%',
            render: (text, record,index) => {return commonJs.is_obj_exist(record.dealTime)},
        },{
            title: '处理人',
            key: 'resufdsse',
            width:'10%',
            render: (text, record,index) => {return commonJs.is_obj_exist(record.operator)},
        }]
        return (
            <div className="content" id="content">
                <div data-isresetdiv="yes" className="bar return-visit-condition clearfix pb10 pl20 pr20" data-resetstate="">
                    <dl className="left mt10">
                        <dt className="left">类型</dt>
                        <dd>
                            <select name="" id="type" className="select-gray left mr10 chaenel type">
                                <option value="" data-optionid="0" data-show="no" hidden>请选择</option>
                                <option value="">全部</option>
                                <option value="merchant">商户</option>
                                <option value="shop">门店</option>
                            </select>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt className="left">商户/门店名称</dt>
                        <dd>
                            <input type="text" id='name' className="input name" placeholder='请输入'/>
                        </dd>
                    </dl>
                    <div className="clearfix"></div>
                    <dl className="left mt10">
                        <dt className="left">省</dt>
                        <dd>
                            <select name="" id="provinceId" className="select-gray left mr10 chaenel provinceId" onChange={this.getCity}>
                                <option value="" data-optionid="0" data-show="no" hidden="">请选择</option>
                                {
                                    allProvince.map((repy,i)=>{
                                        return <option key={i} value={commonJs.is_obj_exist(repy.code)}>{commonJs.is_obj_exist(repy.name)}</option>
                                    })
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt className="left">市</dt>
                        <dd>
                            <select name="" id="cityId" className="select-gray left mr10 chaenel cityId" onChange={this.getDistricts}>
                                <option value="" data-optionid="0" data-show="no" hidden="">请选择</option>
                                {
                                    allCity.map((repy,i)=>{
                                        return <option key={i} value={commonJs.is_obj_exist(repy.code)}>{commonJs.is_obj_exist(repy.name)}</option>
                                    })
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt className="left">区</dt>
                        <dd>
                            <select name="" id="areaId" className="select-gray left mr10 chaenel areaId">
                                <option value="" data-optionid="0" data-show="no" hidden="">请选择</option>
                                {
                                    allDistricts.map((repy,i)=>{
                                        return <option key={i} value={commonJs.is_obj_exist(repy.code)}>{commonJs.is_obj_exist(repy.name)}</option>
                                    })
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt className="left">详细地址</dt>
                        <dd>
                            <input type="text" id='address' className="input address" placeholder='请输入' />
                        </dd>
                    </dl>
                    <div className="left mt10 mr10">
                        <button className="btn-blue left mr5" id="searchBtn" onClick={this.searchHandle}>搜索</button>
                        <button className="btn-white left" id="reset" onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                    </div>
                </div>
                <div className="mt10 bar" id='refundSearchList'>
                <Table
                    rowKey={(record, index) => index} 
                    columns={columns} 
                    dataSource={responseList}
                />
                </div>
                {/* 暂停/恢复进件 */}
                <Modal
                    title="案例记录"
                    width={'60%'}
                    visible={this.state.letterVisible}
                    onOk={this.letterOk}
                    onCancel={this.modalCancel}
                    >
                    <textarea className='textarea caseContent' name="" id="caseContent" style={{width:'100%',height:'120px'}}></textarea>
                </Modal>
                {/* 操作记录 */}
                <Modal
                    title="操作记录"
                    width={'80%'}
                    visible={this.state.operateVisible}
                    onOk={this.operateOk}
                    onCancel={this.modalCancel}
                    footer={null}
                    >
                    <Table
                    rowKey={(record, index) => index} 
                    columns={columns2} 
                    dataSource={recordList}
                />
                </Modal>
            </div>
        )
    }
};

export default Store_shop_manage;  //ES6语法，导出模块