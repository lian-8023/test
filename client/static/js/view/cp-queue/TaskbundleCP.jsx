// 任务绑定  cp-portal
import React from 'react';
import '../../../js/source/dataTables/dataTables.jqueryui.min.css';
import $ from 'jquery';
import '../../source/dataTables/jquery.dataTables.min';
import CommonJs from '../../source/common/common';
import { Select,Button } from 'antd';
const Option = Select.Option;
var commonJs=new CommonJs;
import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

@inject('allStore') @observer
class TaskBundleCP extends React.Component{
    constructor(props){
        super(props);
        this.store=this.props.allStore.ChannelStore;  //渠道-合作方数据
        this.state={
            bindQueueInfoDTOS:[],  //页面数据
        }
    }
    componentDidMount(){
        this.store.getChanel();
        this.getMsg();
        $("#taskTable tbody").on("click",".myCheckbox",function(){
            let $table=$(this).closest("table");
            if($(this).hasClass("myCheckbox-normal")){
                $(this).removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            }else {
                $(this).removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            }
            let notAll=$table.find("tbody").find(".myCheckbox-normal").length;
            if(notAll>0){
                $table.find("thead").find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            }
        })
        
    }
    myCheckbox_fn(event){
        let $this=$(event.target);
        let $table=$this.closest("table");
        if($this.hasClass("myCheckbox-normal")){
            $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }else {
            $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }
        let notAll=$table.find("tbody").find(".myCheckbox-normal").length;
        if(notAll>0){
            $table.find("thead").find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }
    }
    //获取页面数据
    getMsg(){
        let that=this;
        let channel=this.state.selectedChannel;
        let _param={};
        if(channel && channel.length>0){
            _param={productEnums:channel};
        }
        $('#taskTable').dataTable().fnDestroy();
        $("#taskTable tbody").html("");
        $.ajax({
            type:"post",
            url:"/node/bind/all",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_param)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);       
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    // that.setState({
                    //     bindQueueInfoDTOS:[]
                    // })
                    return;
                }
                var _getData = res.data;
                let bindQueueInfoDTOS=_getData.bindQueueInfoDTOS?_getData.bindQueueInfoDTOS:[];
                let dom='';
                if(bindQueueInfoDTOS.length>0){
                    for(var i=0;i<bindQueueInfoDTOS.length;i++){
                        let repy=bindQueueInfoDTOS[i];
                        dom+='<tr class="task-cont-tr" key={i} data-id='+commonJs.is_obj_exist(repy.id)+'>'+
                                '    <td width="10%" data-name='+commonJs.is_obj_exist(repy.queueType?repy.queueType.name:"")+'>'+commonJs.is_obj_exist(repy.queueType?repy.queueType.displayName:"")+'</td>'+
                                '    <td width="10%">'+commonJs.is_obj_exist(repy.customerId)+'</td>'+
                                '    <td width="30%">'+commonJs.is_obj_exist(repy.loanNumber)+'</td>'+
                                '    <td width="10%">'+commonJs.is_obj_exist(repy.bindUser)+'</td>'+
                                '    <td width="20%">'+commonJs.is_obj_exist(repy.blindTime)+'</td>'+
                                '    <td width="5%"><i class="myCheckbox myCheckbox-normal" data-id={repy.id}></i></td>'+
                                '    <td width="15%"></td>'+
                                '</tr>';
                    }
                    $("#taskTable tbody").append(dom);
                    that.initDataTable();
                }else{
                    $("#taskTable tbody").append('<tr><td colSpan="7" className="gray-tip-font">暂时没有数据...</td></tr>');
                }
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        })
    }
    //初始化datatable
    initDataTable(){
        $('#taskTable').dataTable({
            "pagingType":   "full_numbers",
            paging: true,
            retrieve: true,
            searching: true,  //是否搜索
            "ordering": true,  //是否排序
            "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 5,6 ] }],  //指定第5列和第6列不能排序
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
                },
                "oAria": {
                    "sSortAscending": ": 以升序排列此列",
                    "sSortDescending": ": 以降序排列此列"
                }
            }
        });
        $('#taskTable').on( 'length.dt', function ( e, settings, len ) {
            $('#taskTable').find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        } );
        $('#taskTable').on( 'page.dt', function () {
            $('#taskTable').find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        } );
    }

    //全选
    taskSelectAll(event){
        let $this=$(event.target);
        if($this.hasClass("myCheckbox-visited")){
            $this.closest("table").find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }else {
            $this.closest("table").find(".myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }   
        event.stopPropagation();
    }

    //按id解绑
    unbindById(event){
        let that=this;
        let $this=$(event.target);
        let _unBinds = [];
        let isSelected=$this.closest("table").find(".task-cont-tr .myCheckbox-visited").length;
        if(isSelected<=0){
            alert("请选择需要解绑的数据！");
            return;
        }
        $this.closest("table").find(".myCheckbox-visited").parents(".task-cont-tr").each(function(){
            let unbindType=$(this).find("td").eq(0).attr("data-name");
            let unbindId=$(this).attr("data-id");
            _unBinds.push({"id": unbindId,"queueType": unbindType});
        })

        let _param = {
            unBinds:_unBinds
        };
        $.ajax({
            type:"post",
            url:"/node/bind/unbind/id",
            async:true,
            dataType: "JSON",
            data:{
                josnParam:JSON.stringify(_param)
            },
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);       
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                that.getMsg();
                $this.closest("table").find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        })
    }
    
    channelChange(value) {
        this.setState({
            selectedChannel:value
        })
    }
  
    render() {
        let bindQueueInfoDTOS=this.state.bindQueueInfoDTOS;  //任务绑定列表
        const channelArr = this.store.channelArr;
        const children = [];
        for (let i = 0; i < channelArr.length; i++) {
            let repy=channelArr[i];
            children.push(<Option key={i} value={commonJs.is_obj_exist(repy.value)}>{commonJs.is_obj_exist(repy.displayName)}</Option>);
        }
        return (
            <div className="content" id="content">
                <div className="clearfix bar-tit pl20 pr20 toggle-tit mb5">
                    <span className="left" style={{"fontSize":"14px"}}>渠道：</span>
                    <div className="left mr10 mb5" id='chenelSel' style={{"minWidth":"300px","maxWidth":"60%"}}>
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            allowClear={true}
                            // defaultValue={['a10', 'c12']}
                            onChange={this.channelChange.bind(this)}
                        >
                            {children}
                        </Select>
                    </div>
                    <div id="searchBtn">
                        <Button type="primary" onClick={this.getMsg.bind(this,true)}>搜索</Button>
                    </div>
                </div>
                <table className="table table mt10 bar" id="taskTable">
                   <thead>
                       <tr>
                           <th width="10%" title="按任务类型排序">任务类型</th>
                           <th width="10%" title="按customerId/storeId 排序">customerId/storeId</th>
                           <th width="30%" title="按loan_number/storeName排序">loan_number/storeName</th>
                           <th width="10%" title="按绑定人排序">绑定人</th>
                           <th width="20%" title="按绑定时间排序">绑定时间</th>
                           <th width="5%"><i className="myCheckbox myCheckbox-normal" onClick={this.taskSelectAll.bind(this)}></i></th>
                           <th width="15%"><a className="btn-blue inline-block" onClick={this.unbindById.bind(this)}>解除绑定</a></th>
                       </tr>
                    </thead> 
                    <tbody> 

                   </tbody>
                </table>
            </div>
        );
    }
};

export default TaskBundleCP;