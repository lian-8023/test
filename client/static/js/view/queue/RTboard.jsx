// 实时看板
import React from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import $ from 'jquery';
import { Pagination,DatePicker } from 'antd';  //页码

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

import SortTimeJs from '../../source/common/sortTime';
var sortTimeJs=new SortTimeJs;

class RTboard extends React.Component{
    constructor(props){
        super(props);
        this.state={
        }
    }

    componentDidMount(){
        this.getData();
    }
    //加载当月数据
    getData=()=>{
        let that=this;
        $.ajax({
            type:"post",
            url:"/node/statistics",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        list :[],
                        startDate:'',
                        endDate:'',
                    })
                    return;
                }
                var _getData = res.data;
                that.setState({
                    list :_getData.list ?_getData.list :[],
                    startDate:_getData.startDate,
                    endDate:_getData.endDate,
                })
            }
        })
    }
    render() {
        const{list,startDate,endDate}=this.state;
        return (
            <div className="content" id="content">
                <div className="bar clearfix pt10 pl10 pb10">
                    <b style={this.thistyle} className='blue-font'>当前为 {commonJs.is_obj_exist(startDate)} 到 {commonJs.is_obj_exist(endDate)} 数据</b>
                </div>
                <div className="cdt-result bar mt20 relative">
                    <div className="toggle-div" style={{"overflow":"scroll"}}>
                        <div className="th-bg">
                            <table className="pt-table layout-fixed workAllot-list">
                                <tbody>
                                    <tr className="th-bg">
                                        <th>催收员</th>
                                        <th>处理量</th>
                                        <th>承诺还款量</th>
                                        <th>还款户数</th>
                                        <th>还款金额</th>
                                    </tr>
                                    {
                                        (list && list.length>0)?list.map((repy,i)=>{
                                            return <tr key={i}>
                                                        <td>{commonJs.is_obj_exist(repy.userName)}</td>
                                                        <td>{commonJs.is_obj_exist(repy.hasDoneCount)}</td>
                                                        <td>{commonJs.is_obj_exist(repy.cimmitCount)}</td>
                                                        <td>{commonJs.is_obj_exist(repy.payCount)}</td>
                                                        <td>{commonJs.is_obj_exist(repy.payAmount)}</td>
                                                    </tr>
                                        }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    thistyle={
        fontSize:'16px',
    }
};
export default RTboard;  