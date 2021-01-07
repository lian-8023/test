// 上报数据
import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination,DatePicker,Select,Button } from 'antd';  //页码
const { Option } = Select;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class ReportCheck extends React.Component{
    constructor(props){
        super(props);
        this.state={
            barsNum:10,  //每页显示多少条
            currentPage:1,  //当前页码
            current:1,
            reportTime: null,
            list:[]  //页面数据
        }
    }
    componentDidMount(){
        commonJs.reloadRules();
        var h = document.documentElement.clientHeight;
        $("#content").height(h-40);
    }
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            currentPage:1,
            current: 1,
            barsNum:pageSize
        },()=>{
            this.getList();
        })
    }
    //快速跳转到某一页。
    gotoPageNum(pageNumber) {
        this.setState({
            currentPage:pageNumber
        },()=>{
            this.getList();
        })
    }
    pageChange(page){
        this.setState({
            current: page
        },()=>{
            this.getList();
        });
    }
    // 切换时间
    timeChange(value, dateString){
        this.setState({reportTime: dateString});
    }
    //   搜索方法
    searchFn(){
        let that=this;
        let _params={};
        let status=this.state.reportType;
        if(status){
            _params.status=status;
        }
        let uploadFileDate=this.state.reportTime;
        if(!uploadFileDate || uploadFileDate==""){
            alert("请选择上报时间！");
            return;
        }
        _params.uploadFileDate=uploadFileDate;
        $.ajax({
            type:"post",
            url:"/node/file/financial",
            async:true,
            dataType: "JSON",
            data:_params,
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        list:[]
                    })
                    return;
                }
                var _getData = res.data;
                that.setState({
                    list:_getData.fileInfoDTOS?_getData.fileInfoDTOS:[]
                })
            }
        })
    }
    //
    handleChange=(value)=>{
        this.setState({
            reportType:value
        })
    }
    render() {
        const {list}=this.state;
        return (
            <div className="content" id="content">
                <div className="bar clearfix flow-auto dU-condi pl20 pb10">
                    <div className="left mt15">上报时间：</div>
                    <div className="left mt10 mr10" id='reportTime'>
                        <DatePicker format='YYYY-MM-DD' onChange={this.timeChange.bind(this)} />
                    </div>
                    <div className="left mt15">上报状态：</div>
                    <div id="reportType" className='left mt10 mr10'>
                        <Select style={{ width: 220 }} placeholder='请选择' onChange={this.handleChange}>
                            <Option value="0">新建</Option>
                            <Option value="1">系统内部待处理</Option>
                            <Option value="2">系统内部处理中</Option>
                            <Option value="3">系统内部处理失败</Option>
                            <Option value="4">待上报</Option>
                            <Option value="5">已提交上报</Option>
                            <Option value="6">上报成功</Option>
                            <Option value="7">上报失败</Option>
                        </Select>
                    </div>
                    <div className="left mt10 mr10" id="searchBtn">
                        <Button type="primary" onClick={this.searchFn.bind(this)}>搜索</Button>
                    </div>
                </div>
                <div className="bar mt20">
                    <table className="pt-table data-update-list">
                        <thead>
                            <tr className="th-bg">
                                <th>操作名称</th>
                                <th>拆分文件名称</th>
                                <th>上报文件类型名称</th>
                                <th>原始文件名称</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (list && list.length>0)?list.map((repy,i)=>{
                                    return <tr key={i}>
                                            <td className="blue-half relative">{commonJs.is_obj_exist(repy.actionName)}</td>
                                            <td className="blue-half relative">{commonJs.is_obj_exist(repy.fileName)}</td>
                                            <td className="blue-half relative">{commonJs.is_obj_exist(repy.fileTypeName)}</td>
                                            <td className="blue-half relative">{commonJs.is_obj_exist(repy.orginalFileName)}</td>
                                            <td className="blue-half relative">{commonJs.is_obj_exist(repy.status)}</td>
                                        </tr>
                                }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                            
                            {/* <tr className="th-bg">
                                <td colSpan="2">
                                    <Pagination
                                        showQuickJumper
                                        showSizeChanger
                                        onShowSizeChange={this.onShowSizeChange.bind(this)}
                                        defaultPageSize={this.state.barsNum}
                                        defaultCurrent={1}
                                        current={this.state.current}
                                        total={totalCount}
                                        onChange={this.pageChange.bind(this)}
                                        pageSizeOptions={['10','25','50','100']}
                                    />
                                </td>
                            </tr> */}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
};

export default ReportCheck;  //ES6语法，导出模块