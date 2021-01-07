// 异常数据
import React from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import $ from 'jquery';
import { Pagination,DatePicker } from 'antd';  //页码

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

import SortTimeJs from '../../source/common/sortTime';
var sortTimeJs=new SortTimeJs;

class AbnormalData extends React.Component{
    constructor(props){
        super(props);
        this.state={
            barsNum:10,  //每页显示多少条
            current:1,
            totalSize:0,
        }
    }

    UNSAFE_componentWillMount(){
        this.theSearch(true);  //初始化列表
    }
    componentDidMount(){
        var _that=this;
        commonJs.reloadRules();
    }
    UNSAFE_componentWillReceiveProps(nextProps){
    }

    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            current: 1,
            barsNum:pageSize
        })
        this.cancleSelectAll();
    }
    //快速跳转到某一页。
    pageChange(page){
        this.setState({
            current: page
        });
        this.cancleSelectAll();
    }
    //搜索按钮事件
    searchBtn(){
        let _loanNo=$(".cdt-loanNo").val();
        if(_loanNo){
            _loanNo=_loanNo.replace(/\s/,"");
        }
        if(_loanNo){
            this.theSearch();
        }else{
            this.theSearch(true);
        }
    }

    //搜索 isInit=true 默认加载预警展示Redis数据接口，2.isInit=false根据条件精确查询列表
    theSearch(isInit){
        let that=this;
        let _url=""; 
        let _data={};
        this.cancleSelectAll();
        if(isInit){
            _url="/node/warningPaymentRedis";
            _data={};
        }else{
            let _loanNo=$(".cdt-loanNo").val();
            if(_loanNo){
                _loanNo=_loanNo.replace(/\s/,"");
            }
            _url="/node/queryRedisByLoanNumber";
            _data.loanNumber=_loanNo;
        }
        $.ajax({
            type:"get",
            url:_url,
            async:true,
            data:_data,
            dataType: "JSON",
            beforeSend:function(XMLHttpRequest){
                let loading_html='<div id="loading">'+
                                   '<div class="tanc_bg"></div>'+
                                   '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                               '</div>';
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                that.setState({
                    paymentRedisInfoList:_getData.paymentRedisInfoList?_getData.paymentRedisInfoList:[]
                })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //全选
    selectAll(event){
        let $this=$(event.target);
        let $parent=$this.closest(".workAllot-list");
        if($this.hasClass("myCheckbox-normal")){
            $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            $parent.find(".myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }else{
            $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            $parent.find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }
    }
    //取消全选
    cancleSelectAll(){
        $(".workAllot-list").find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
    }
    //删除
    delHandle(event){
        let _selected=[];
        $(".workAllot-list tr").not(".th-bg").each(function(){
            let _checkbox=$(this).find(".myCheckbox");
            if(_checkbox.hasClass("myCheckbox-visited")){
                let get_key=$(this).find(".paymentRedisKey").attr("data-key");
                _selected.push(get_key);
            }
        })
        if(_selected.length<=0){
            alert("请选择需要删除的数据!");
            return;
        }
        let _redisKey={redisKey:_selected};
        let that=this;
        $.ajax({
            type:"post",
            url:"/node/deleteRedisByRedisKey",
            async:false,
            data:{josnParam:JSON.stringify(_redisKey)},
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                that.searchBtn();
            }
        })
    }
    render() {
        return (
            <div className="content" id="content">
                <div className="bar clearfix pb10">
                    <input type="text" className="input left mr10 ml20 mt10 cdt-loanNo input_w" id='loanNo' placeholder="请输入合同号" />
                    <button className="block btn-blue left mt10" id='searchBtn' onClick={this.searchBtn.bind(this)}>搜索</button>
                </div>
                <div className="cdt-result bar mt20 relative">
                    <div className="toggle-div" style={{"overflow":"scroll"}}>
                        <div className="th-bg">
                            <table className="pt-table layout-fixed workAllot-list">
                                <tbody>
                                    <tr className="th-bg">
                                        {/* <th><span className="pointer" >全选</span></th> */}
                                        <th width="5%"><i className="myCheckbox myCheckbox-normal" id='selectAll' onClick={this.selectAll.bind(this)}></i></th>
                                        <th>用户名称</th>
                                        <th width="20%">合同号</th>
                                        <th>产品号</th>
                                        <th width="20%">redis数据key</th>
                                        <th>扣款方式</th>
                                        <th>扣款状态</th>
                                        <th width="10%">创建时间</th>
                                    </tr>
                                    {
                                        (this.state.paymentRedisInfoList && this.state.paymentRedisInfoList.length>0)?this.state.paymentRedisInfoList.map((repy,i)=>{
                                            let barsNum=this.state.barsNum;  //每一页显示条数
                                            let current=this.state.current;  //当前页码
                                            if(i>=barsNum*(current-1) && i<=(barsNum*current-1)){
                                                return <tr key={i}>
                                                            <td width="5%"><i className="myCheckbox myCheckbox-normal" id={'trCheck'+i} onClick={commonJs.myCheckbox.bind(this)}></i></td>
                                                            <td title={commonJs.is_obj_exist(repy.userName)}>{commonJs.is_obj_exist(repy.userName)}</td>
                                                            <td width="20%" title={commonJs.is_obj_exist(repy.loanNumber)}>{commonJs.is_obj_exist(repy.loanNumber)}</td>
                                                            <td title={commonJs.is_obj_exist(repy.productNo)}>{commonJs.is_obj_exist(repy.productNo)}</td>
                                                            <td width="20%" className="paymentRedisKey" data-key={commonJs.is_obj_exist(repy.paymentRedisKey)} title={commonJs.is_obj_exist(repy.paymentRedisKey )}>{commonJs.is_obj_exist(repy.paymentRedisKey )}</td>
                                                            <td title={commonJs.is_obj_exist(repy.paymentMethod)}>{commonJs.is_obj_exist(repy.paymentMethod)}</td>
                                                            <td title={commonJs.is_obj_exist(repy.paymentStatus)}>{commonJs.is_obj_exist(repy.paymentStatus)}</td>
                                                            <td width="10%" title={commonJs.is_obj_exist(repy.createdAt)}>{commonJs.is_obj_exist(repy.createdAt)}</td>
                                                        </tr>
                                            }
                                        }):<tr><td colSpan="8" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                    }
                                    <tr>
                                        <td colSpan="2"><button className="block btn-white mr20" id='del' onClick={this.delHandle.bind(this)}>删除</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="cdt-th th-bg clearfix pl20 pt5 pb5 pr20">
                            {this.state.paymentRedisInfoList?
                                <div className="left" id='pageAtion'>
                                    <Pagination
                                        showQuickJumper
                                        showSizeChanger
                                        onShowSizeChange={this.onShowSizeChange.bind(this)}
                                        defaultPageSize={this.state.barsNum}
                                        defaultCurrent={1}
                                        current={this.state.current}
                                        total={this.state.paymentRedisInfoList?this.state.paymentRedisInfoList.length:0}
                                        onChange={this.pageChange.bind(this)}
                                        pageSizeOptions={['10','25','50','100']}
                                    />
                                </div>
                            :""}
                        </div>
                    </div>
                </div>
            </div>

        )
    }
};

export default AbnormalData;  