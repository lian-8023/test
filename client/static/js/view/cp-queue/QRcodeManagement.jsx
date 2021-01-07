// 催收二维码管理
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs = new CommonJs;
import { Select, Input, Button, Table,Popconfirm ,Modal,Row, Col} from 'antd';
const { Option } = Select;
import FileUpload from 'react-fileupload';
import { observer, inject } from "mobx-react";
import { configure } from "mobx";
configure({ enforceActions: true })

@inject('allStore') @observer
class QRcodeManagement extends React.Component {
    constructor() {
        super();
        // this.ChannelStore=this.props.allStore.ChannelStore;
        this.state = {
            visible:false,
            status:'add',
            queryData: {
                phone: "",
                name:'',
            },
            dataSource:[],
            productEnums:[],
            saveData:{
                productNoAll:[],
                company:'',
                name:'',
                phone:'',
                productNo:'',
                id:''
            }
        }
    }
    componentDidMount(){
        this.getSelectArr();
    }
    getSelectArr = () => {
        const that = this;
        $.ajax({
            type: "get",
            url: "/node/collection/user/init",
            async: true,
            dataType: "JSON",
            data: { josnParam: JSON.stringify({}) },
            success: function (res) {
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                if(response&&response.executed){
                    response.code = 1;
                }else{
                    alert(response.message);
                    return;
                }

                that.setState({
                    productEnums:res.data.productEnums?res.data.productEnums:[]
                })
            },
            complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
                $("#loading").remove();
                if (status == 'timeout') {//超时,status还有success,error等值的情况
                    ajaxTimeOut.abort(); //取消请求
                    alert("请求超时");
                }
            }
        })
    }
    getMsg = () => {
        const that = this;
        let queryData = {};
        if(this.state.queryData.phone){
            queryData.phone = this.state.queryData.phone;
        }
        if(this.state.queryData.name){
            queryData.name = this.state.queryData.name;
        }
        $.ajax({
            type: "post",
            url: "/node/collection/user/select",
            async: true,
            dataType: "JSON",
            data: { josnParam: JSON.stringify(queryData) },
            beforeSend: function (XMLHttpRequest) {
                $("body").append(loading_html);
            },
            success: function (res) {
                $("#loading").remove();
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                if(response&&response.executed){
                    response.code = 1;
                }else{
                    alert(response.message);
                    that.setState({
                        dataSource:[]
                    })
                    return;
                }

                that.setState({
                    dataSource:res.data.data?res.data.data:[]
                })
            },
            complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
                $("#loading").remove();
                if (status == 'timeout') {//超时,status还有success,error等值的情况
                    ajaxTimeOut.abort(); //取消请求
                    alert("请求超时");
                }
            }
        })
    }

    SaveUsers = ()=>{
        let that = this;
        let saveData = {
            company:this.state.saveData.company,
            name:this.state.saveData.name,
            phone:this.state.saveData.phone,
            productNo:this.state.saveData.productNo,
            id:this.state.saveData.id,
        }
        if(!(this.state.saveData.productNo)){
            alert('请选择产品号');
            return;
        }
        if(!(this.state.saveData.name)){
            alert('请输入姓名');
            return;
        }
        if(!(this.state.saveData.company)){
            alert('请输入公司');
            return;
        }
        if(!(this.state.saveData.phone)||!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(this.state.saveData.phone))){
            alert('请输入正确的手机号');
            return;
        }
        let url = '';
        if(this.state.status == 'add'){
            url = "/node/collection/user/add"
        }else{
            
            url = '/node/collection/user/update'
        }
        $.ajax({
            type: "post",
            url: url,
            async: true,
            dataType: "JSON",
            data: { josnParam: JSON.stringify(saveData) },
            beforeSend: function (XMLHttpRequest) {
                $("body").append(loading_html);
            },
            success: function (res) {
                $("#loading").remove();
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                if(response&&response.executed){
                    alert(response.message);
                    that.setState({
                        visible:false,
                        saveData:{
                            productNoAll:[],
                            company:'',
                            name:'',
                            phone:'',
                            productNo:'',
                            id:'',
                        }
                    })
                    that.getMsg();
                }else{
                    alert(response.message);
                    return;
                }

            },
            complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
                $("#loading").remove();
                if (status == 'timeout') {//超时,status还有success,error等值的情况
                    ajaxTimeOut.abort(); //取消请求
                    alert("请求超时");
                }
            }
        })
    }

    delete = v =>{
        let that = this;
        $.ajax({
            type: "post",
            url: '/node/collection/user/delete',
            async: true,
            dataType: "JSON",
            data: { josnParam: JSON.stringify({id:v}) },
            beforeSend: function (XMLHttpRequest) {
                $("body").append(loading_html);
            },
            success: function (res) {
                $("#loading").remove();
                let response=res.data;  //from node response
                let data=response.data;  //from java response
                if(response&&response.executed){
                    alert(response.message);
                    that.getMsg();
                }else{
                    alert(response.message);
                    return;
                }

            },
            complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
                $("#loading").remove();
                if (status == 'timeout') {//超时,status还有success,error等值的情况
                    ajaxTimeOut.abort(); //取消请求
                    alert("请求超时");
                }
            }
        })
    }
    handleOk = e => {
        this.SaveUsers();
        /* this.setState({
          visible: false,
        }); */
    };
    
    handleCancel = e => {
        this.setState({
          visible: false,
          saveData:{
            productNoAll:[],
            company:'',
            name:'',
            phone:'',
            productNo:'',
            id:'',
        }
        });
    };
    render() {
        const {dataSource} = this.state;
        const columns = [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: '手机',
                dataIndex: 'phone',
                key: 'phone',
            },
            {
                title: '姓名',
                dataIndex: 'name',
                key: 'name',
            }, {
                title: '产品',
                dataIndex: 'productNo',
                key: 'productNo',
            }, {
                title: '公司',
                dataIndex: 'company',
                key: 'company',
            },{
                title: '操作',
                key: '操作',
                render: (text, record) => (
                    <span>
                        <a className='operate' style={{marginRight: '30px'}} onClick={()=>{
                            this.setState({
                                visible:true,
                                status:'edit',
                                saveData:{
                                    id:record.id,
                                    productNoAll:record.productNo.split(','),
                                    company:record.company,
                                    name:record.name,
                                    phone:record.phone,
                                    productNo:record.productNo,
                                }
                            })
                        }}>
                            编辑
                        </a>
                        <Popconfirm
                            placement="topRight"
                            title={'确定删除吗?'}
                            onConfirm={()=>{this.delete(record.id)}}
                            okText="确定"
                            cancelText="取消"
                        >
                        <a className='operate'>
                            删除
                        </a>
                        </Popconfirm>
                    </span>
                ),
            },
        ];
        return (
            <div className="content" id="content">
                <div className="clearfix bar-tit pl20 pr20 toggle-tit mb5">
                    <span className="left" style={{ "fontSize": "14px" }}>手机号：</span>
                    <div className="left mr10 mb5" id='chenelSel' style={{ "minWidth": "300px", "maxWidth": "60%" }}>
                        <Input value={this.state.queryData.phone} onChange={e => {
                            let Obj = this.state.queryData;
                            Obj.phone = e.currentTarget.value;
                            this.setState({
                                queryData: Obj
                            })
                        }} />
                    </div>
                    <span className="left" style={{ "fontSize": "14px" }}>姓名：</span>
                    <div className="left mr10 mb5" id='chenelSel' style={{ "minWidth": "300px", "maxWidth": "60%" }}>
                        <Input value={this.state.queryData.name} onChange={e => {
                            let Obj = this.state.queryData;
                            Obj.name = e.currentTarget.value;
                            this.setState({
                                queryData: Obj
                            })
                        }} />
                    </div>
                    <div id="searchBtn">
                        <Button type="primary" onClick={() => { this.getMsg(this, true) }}>搜索</Button>
                        <Button type="primary" style={{ float: 'right',marginTop: '9px'}} onClick={() => this.setState({visible:true,status:'add'})}>新增用户</Button>
                    </div>
                </div>
                <div style={{ background: '#fff' }}>
                    <Table rowKey='id' dataSource={dataSource} columns={columns} />
                </div>
                <Modal
                    title="新增/修改用户"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                    >
                    <Row style={{ minHeight: '60px'}}>
                        <Col style={{ textAlign: 'right'}} span={5}><span style={{color:'red', marginRight: '5px'}} >*</span>产品号：</Col>
                        <Col span={15} offset={2}>
                            <Select
                                defaultValue={this.state.saveData.productNoAll}
                                mode="multiple"
                                style={{width:'100%'}}
                                onChange={(v)=>{
                                    let saveData = this.state.saveData;
                                    saveData.productNoAll = v;
                                    saveData.productNo = v.join(',');
                                    this.setState({
                                        saveData:saveData,
                                    })
                                }}
                            >
                                {
                                    this.state.productEnums.map((v,i)=>{
                                        return(<Option key={i} value={v.value} >{v.displayName}</Option>)
                                    })
                                }
                            </Select>
                        </Col>
                    </Row>
                    <Row style={{ height: '60px'}}>
                        <Col style={{ textAlign: 'right'}} span={5}><span style={{color:'red', marginRight: '5px'}} >*</span>姓名：</Col>
                        <Col span={15} offset={2}>
                            <Input value={this.state.saveData.name} onChange={(v)=>{
                                let saveData = this.state.saveData;
                                saveData.name = v.currentTarget.value;
                                this.setState({
                                    saveData:saveData,
                                })
                            }} />
                        </Col>
                    </Row>
                    <Row style={{ height: '60px'}}>
                        <Col style={{ textAlign: 'right'}} span={5}><span style={{color:'red', marginRight: '5px'}} >*</span>公司：</Col>
                        <Col span={15} offset={2}>
                            <Input value={this.state.saveData.company} onChange={v=>{
                                let saveData = this.state.saveData;
                                saveData.company = v.currentTarget.value;
                                this.setState({
                                    saveData:saveData,
                                })
                            }} />
                        </Col>
                    </Row>
                    <Row style={{ height: '60px'}}>
                        <Col style={{ textAlign: 'right'}} span={5}><span style={{color:'red', marginRight: '5px'}} >*</span>手机号：</Col>
                        <Col span={15} offset={2}>
                            <Input value={this.state.saveData.phone} onChange={v=>{
                                let saveData = this.state.saveData;
                                saveData.phone = v.currentTarget.value;
                                this.setState({
                                    saveData:saveData,
                                })
                            }}  />
                        </Col>
                    </Row>
                </Modal>
            </div>
        )
    }
};
export default QRcodeManagement;  //ES6语法，导出模块