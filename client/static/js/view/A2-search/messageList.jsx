// 通讯录
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import '../../../js/source/dataTables/dataTables.jqueryui.min.css';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import '../../source/dataTables/jquery.dataTables.min';
import $ from 'jquery';
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class MessageList extends React.Component {
    constructor(props){
        super(props);
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息
        this.state={
            contactslist:[]
        }
    }
    componentDidMount (){
        this.getMsg();
        var h = document.documentElement.clientHeight;
        $(".auto-box").css("height",h-105);
        $(".detail-top-select,.detail-top-select-bar").addClass("hidden");  //隐藏切换合同select
         //搜索
        if(this.state.contactslist && this.state.contactslist.length>0){
            $('#contactslistTable').dataTable({
                paging: true,
                retrieve: true,
                "pagingType":   "full_numbers",
                searching: true,  //是否搜索
                "ordering": true,  //是否排序
                language: {
                    "sProcessing": "处理中...",
                    "sLengthMenu": "显示 _MENU_ 项结果",
                    "sZeroRecords": "没有匹配结果",
                    "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                    "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
                    "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
                    "sInfoPostFix": "",
                    "sSearch": "搜索:",
                    "sUrl": "",
                    "sEmptyTable": "表中数据为空",
                    "sLoadingRecords": "载入中...",
                    "sInfoThousands": ",",
                    "oPaginate": {
                        "sFirst": "首页",
                        "sPrevious": "上页",
                        "sNext": "下页",
                        "sLast": "末页"
                    }
                }
            });
        }
    }
    //获取页面数据
    getMsg(){
        var _that=this;
        var customerId = this.userInfo2AStore.customerId;
        if(!customerId||customerId==''){
            return;
        }
        $.ajax({
            type:"get",
            url:"/node/Contactslist",
            async:true,
            dataType: "JSON",
            data:{customerId:customerId},
            success:function(res) {
                var _getData = res.data;
                if(!commonJs.ajaxGetCode(res)){
                    _that.setState({
                        contactslist:[]  //通讯录数组
                    })
                    return;
                }
                _that.setState({
                    contactslist:_getData.contactsInfoDTOList?_getData.contactsInfoDTOList:[]
                })
            }
        })
    }
    

    render() {
        return (
            <div className="mt10 auto-box pr5">
                <div className="">
                    <table className="pt-table taskBundle-tab" id="contactslistTable">
                        <thead>
                            <tr>
                                <th width="25%" title="">姓名</th>
                                <th width="25%" title="">号码</th>
                                <th width="25%" title="">customer_id</th>
                                <th width="25%" title="">raw_update_time</th>
                            </tr>
                        </thead> 
                        <tbody> 
                            {
                                (this.state.contactslist && this.state.contactslist.length>0)?this.state.contactslist.map((repy,i)=>{
                                    return <tr key={i}>
                                                <td width="25%">{commonJs.is_obj_exist(repy.name)}</td>
                                                <td width="25%">{commonJs.is_obj_exist(repy.phone)}</td>
                                                <td width="25%">{commonJs.is_obj_exist(repy.customerId)}</td>
                                                <td width="25%">{commonJs.is_obj_exist(repy.rawUpdateTime)}</td>
                                            </tr>
                                }):<tr><td colSpan="4" className="gray-tip-font">暂时没有数据...</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
};
export default MessageList;