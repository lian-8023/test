// 历史记录
import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination,DatePicker } from 'antd';  //页码

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class HistoryList extends React.Component{
    constructor(props){
        super(props);
        this.state={
            historyRecordsInfoDTOS:[],
            barsNum:10,  //每页显示多少条
            current:1
        }
    }

    UNSAFE_componentWillMount(){
        this.init(this.state.barsNum,this.state.current);
    }
    componentDidMount(){

    }

    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            current: 1,
            barsNum:pageSize
        },()=>{
            this.init(pageSize,1);
        })
    }
    
    //快速跳转到某一页。
    pageChange(page){
        this.setState({
            current: page
        },()=>{
            this.init(this.state.barsNum,page);
        });
      }
    //搜索按钮
    init(barsNum,currentPage){
        let that=this;
        $.ajax({
            type:"post",
            url:"/node/searchHistory",
            async:false,
            dataType: "JSON",
            data:{
                pageSize:barsNum,
                pageNum:currentPage
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        historyRecordsInfoDTOS:[],
                        current:1,
                        barsNum:10
                    })
                    return;
                }
                var _getData = res.data;
                that.setState({
                    historyRecordsInfoDTOS:_getData.historyRecordsInfoDTOS?_getData.historyRecordsInfoDTOS:[],
                    pageNum:_getData.pageNum,
                    totalSize:_getData.totalSize
                })
            }
        })
    }
    render() {
        return (
            <div className="content" id="content">
                <div className="bar mt20">
                    <table className="pt-table history-list layout-fixed">
                        <thead>
                            <tr className="th-bg">
                                <th width="15%">操作人</th>
                                <th width="40%">请求参数</th>
                                <th width="15%">操作时间</th>
                                <th width="30%">操作功能</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (this.state.historyRecordsInfoDTOS && this.state.historyRecordsInfoDTOS.length>0)?this.state.historyRecordsInfoDTOS.map((repy,i)=>{
                                return <tr key={i}>
                                        <td width="15%" className="word-break" title={commonJs.is_obj_exist(repy.user)}>{commonJs.is_obj_exist(repy.user)}</td>
                                        <td width="40%" className="word-break" title={commonJs.is_obj_exist(repy.params)}>{commonJs.is_obj_exist(repy.params)}</td>
                                        <td width="15%" className="word-break" title={commonJs.is_obj_exist(repy.gmtCreatedAt)}>{commonJs.is_obj_exist(repy.gmtCreatedAt)}</td>
                                        <td width="30%" className="word-break" title={commonJs.is_obj_exist(repy.remark)}>{commonJs.is_obj_exist(repy.remark)}</td>
                                    </tr>
                                }):<tr><td colSpan="4" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                            <tr className="th-bg">
                                <td colSpan="4">
                                    <div className="left">
                                        <Pagination
                                            showQuickJumper
                                            showSizeChanger
                                            onShowSizeChange={this.onShowSizeChange.bind(this)}
                                            defaultPageSize={this.state.barsNum}
                                            defaultCurrent={1}
                                            current={this.state.current}
                                            total={this.state.totalSize?this.state.totalSize:0}
                                            onChange={this.pageChange.bind(this)}
                                            pageSizeOptions={['10','25','50','100']}
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
};

export default HistoryList;  //ES6语法，导出模块