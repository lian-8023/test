import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import { Tabs,Table,Button,Input,Select } from 'antd';
const { Option } = Select;
import axios from '../../axios';
import debounce from 'lodash/debounce';

const { TabPane } = Tabs;
class Taskbundle extends React.Component{
    constructor(props){
        super(props);
        this.state={
            taskData:"",  //页面数据
            taskTypeArray:[],  //任务类型列表--批量解绑
            pagination:{
                current:1,
                pageSize:10,
                showSizeChanger:true,
                pageSizeOptions:['10','30','50','100']
            }
        }
        this.debouncePrint = debounce(this.getMsg, 800);
    }
    componentDidMount(){
        this.getMsg();
        this.getAdminMaps();
    }
    //切换tabs事件
    TabsChange=(key)=>{
        console.log(key);
        this.setState({
            selectedRowKeys:[]
        })
    }

    //绑定人切换
    bindNameChange=(code)=>{
        this.setState({
            bindByCode:code
        })
    }
    //获取页面数据
    getMsg=(fromBtn)=>{
        const getPager = { ...this.state.pagination };
        let {searchType}=this.state;
        if(fromBtn){
            getPager.current=1;
            this.setState({
                pagination:getPager
            })
        }
        let params={
            pageNum:getPager.current,
            pageSize:getPager.pageSize
        };
        let bindByCode=this.state.bindByCode;
        let oterValue=this.state.oterValue;
        if(searchType=='bindNme' && bindByCode){
            params.params=bindByCode;
        }else if(searchType=='other' && oterValue){
            params.params=oterValue;
        }else if(searchType=='AST'){
            params.isAST = true;
        }
        let that=this;
        axios({
            method: 'get',
            url:'/node/Taskbundle',
            params:params
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            const pager = { ...that.state.pagination };
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    taskData:{},
                    taskTypeArray:[]
                });
                pager.total=0;
                return;
            }
            let _taskTypeArray=[];
            let _taskTypeObj = {};
            if(!data.bindQueueInfoDTOs){
                that.setState({
                    taskData:{},
                    taskTypeArray:[]
                });
                pager.total=0;
                return;
            }
            pager.total=data.totalSize;
            that.setState({
                taskData:data,
                taskTypeArray:cpCommonJs.opinitionArray(data.queueTypes),
                searchVal:params.param,  //存模糊搜索条件，供切换页码用
                selectedRowKeys:[],
                pagination:pager
            })
        })
    }
    //任务绑定勾选事件
    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    };
    // 其他搜索条件
    searchFn=(e)=>{
        const { value } = e.target;
        this.setState({
            oterValue:value
        })
    }
    // 获取用户名
    getAdminMaps(){
        let _that=this;
        let _array=[];
        $.ajax({
            type:"get",
            url:"/node/tianrList",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                for(var key in _getData.adminNameMaps){  
                    _array.push(_getData.adminNameMaps[key]);//取得value   
                }  
                _that.setState({
                    adminNameMaps:_array
                })
            }
        })
    }
    //任务绑定列表表格切换页码以及排序
    handleTableChange=(pagination, filters, sorter)=>{
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        pager.pageSize = pagination.pageSize;
        let searchVal=this.state.searchVal;  //模糊搜索条件
        this.setState({
        pagination: pager,
        },()=>{
            this.getMsg(searchVal);
        });
    }
    //任务绑定列表解除绑定-按id解绑
    unBindHandle1=()=>{
        let {selectedRowKeys,taskData}=this.state;
        let bindQueueInfoDTOs=taskData.bindQueueInfoDTOs;
        if(selectedRowKeys.length<=0){
            alert("请选择需要解绑的数据！");
            return;
        }
        let unBinds=[];
        for(let i=0;i<selectedRowKeys.length;i++){
            let dataIndex=selectedRowKeys[i];
            let unbindType=cpCommonJs.opinitionObj(bindQueueInfoDTOs[dataIndex].queueType).name;
            let unbindId=bindQueueInfoDTOs[dataIndex].id;
            unBinds.push({"id": unbindId,"queueType": unbindType});
        }
        let that=this;
        axios({
            method: 'POST',
            url:'/node/unbindById',
            data:{josnParam:JSON.stringify({unBinds:unBinds})}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.setState({
                selectedRowKeys:[]
            });
            that.getMsg();
        })
    }
    unBindHandle2=()=>{
        let {taskTypeArray,selectedRowKeys}=this.state;
        if(selectedRowKeys.length<=0){
            alert("请选择需要解绑的数据！");
            return;
        }
        let types=[];
        for(let i=0;i<selectedRowKeys.length;i++){
            let dataIndex=selectedRowKeys[i];
            let name=taskTypeArray[dataIndex].name;
            types.push(name);
        }
        let that=this;
        axios({
            method: 'POST',
            url:'/node/unbindByType',
            data:{josnParam:JSON.stringify({types:types})}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.setState({
                selectedRowKeys:[]
            });
            that.getMsg();
        })
    }
    //
    searchType=(value)=>{
        this.setState({
            searchType:value
        })
    }
    render() {
        const bindQueueInfoDTOs=cpCommonJs.opinitionArray(this.state.taskData.bindQueueInfoDTOs);
        const { loading=false, selectedRowKeys=[],taskTypeArray=[],searchType='',adminNameMaps=[] } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            columnWidth:'5%'
          };
        const columns1 = [
            {
              title: '任务类型',
              dataIndex: 'queueType',
              key: 'queueType',
              width:'15%',
              render: (text,record,index) => {
                    return record.queueType.displayName
                },
            },
            { title: 'ID', dataIndex: 'id', key: 'id' ,width:'5%',render: (text,record,index) => {return commonJs.is_obj_exist(record.id)}},
            { title: 'ACCOUNT_ID', dataIndex: 'accountId', key: 'accountId' ,width:'15%',render: (text,record,index) => {return commonJs.is_obj_exist(record.accountId)}},
            { title: 'LOAN_NUMBER', dataIndex: 'loannumber', key: 'loannumber' ,width:'25%',render: (text,record,index) => {return commonJs.is_obj_exist(record.loannumber)}},
            { title: '绑定人', dataIndex: 'adminName', key: 'adminName' ,width:'20%',render: (text,record,index) => {return commonJs.is_obj_exist(record.adminName)}},
            { title: '绑定时间', dataIndex: 'blindTime', key: 'blindTime' ,width:'20%',render: (text,record,index) => {return commonJs.is_obj_exist(record.blindTime)}},
        ];

        const columns2=[
            { title: '任务类型', dataIndex: 'displayName', key: 'displayName' ,width:'80%'},
        ];
        return (
            <div className="content bar" id="content">
                <Tabs defaultActiveKey="1" onChange={this.TabsChange}>
                    <TabPane tab="任务绑定列表" key="1">
                        <div className="left pb20 mr20">
                            <div className="left mr10" id='searchType'>
                                <Select placeholder='请选择搜索类型' style={{ width: 200 }} onChange={this.searchType}>
                                    <Option value="bindNme">绑定人</Option>
                                    <Option value="other">合同号或ACCOUNT_ID</Option>
                                    <Option value="AST">AST</Option>
                                </Select>
                            </div>
                            {
                                searchType=='bindNme'? <div className="left mr10">
                                    <Select 
                                    allowClear
                                    placeholder='请选择' 
                                    showSearch 
                                    style={{ width: 200 }} 
                                    onChange={this.bindNameChange} 
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }>
                                        {
                                            adminNameMaps.map((repy,i)=>{
                                                return <Option key={i} value={repy.code}>{repy.name}</Option>
                                            })
                                        }
                                    </Select>
                                </div>:''
                            }
                            {
                                searchType=='other'? <div className="left mr10"><Input placeholder="请输入" onChange={this.searchFn} allowClear /></div>:''
                            }
                        </div>
                        <div className="left mr5" id='searchBtn'>
                            <Button type="primary" onClick={this.getMsg.bind(this,true)}>搜索</Button>
                        </div>
                        <div className="right pb20">
                            <Button type="primary" loading={loading} onClick={this.unBindHandle1}>解除绑定</Button>
                        </div>
                        <div className="clearfix"></div>
                        <Table rowKey={(record, index) => index} rowSelection={rowSelection} columns={columns1} dataSource={bindQueueInfoDTOs} onChange={this.handleTableChange} pagination={this.state.pagination} />
                    </TabPane>
                    <TabPane tab="批量解绑" key="2">
                        <div className="left pb20 mr20">
                            <Button type="primary" loading={loading} onClick={this.unBindHandle2}>解除绑定</Button>
                        </div>
                        <div className="clearfix"></div>
                        <Table rowKey={(record, index) => index} rowSelection={rowSelection} columns={columns2} dataSource={taskTypeArray} pagination={false} />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
};

export default Taskbundle;