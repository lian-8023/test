import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Pagination } from 'antd';  //页码

class OverdueMsg_pop extends React.Component {
    constructor(props){
        super(props);
        this.state={
            popData:{},
            barsNum_1:25,  //每页显示多少条
            current_1:1,  //当前页码
            barsNum_2:25,  //每页显示多少条
            current_2:1,  //当前页码
            barsNum_3:25,  //每页显示多少条
            current_3:1,  //当前页码
        }
    }
    UNSAFE_componentWillMount(){
        this.getMsg(this.state.pageNumber,this.state.pageSize_2,2);
    }
    componentDidMount(){
        if(this.props.currentList==1){
            this.getRecordList(0);
        }
        if(this.props.currentList==2){
            this.getRecordList(1);
        }
        if(this.props.currentList==3){
            this.getRecordList(2);
        }
    }
    componentWillUnmount(){
        this.setState({
            barsNum_1:25,  //每页显示多少条
            currentPage_1:1,  //当前页码
            barsNum_2:25,  //每页显示多少条
            currentPage_2:1,  //当前页码
            barsNum_3:25,  //每页显示多少条
            currentPage_3:1,  //当前页码
        })
    }
    getMsg(pageNum,pageSize,paymentStatus){
        let that=this;
        $.ajax({
            type:"post",
            url:"/node/overdueList",
            async:false,
            dataType: "JSON",
            data:{
                loanNumber:this.props._loannumber,
                pageNum:pageNum,  //页码
                pageSize:pageSize,  //当前显示条数
                paymentStatus:paymentStatus  //逾期费扣款列表记录筛选条件 0 失败， 1 成功， 2 全部
            },
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    this.setState({
                        current_1:1,  //当前页码
                        current_2:1,  //当前页码
                        current_3:1,  //当前页码
                    })
                    return;
                }
                var _getData = res.data;
                that.setState({
                    popData:_getData,
                    current_3:pageNum
                })
            }
        })
    }
    //切换窗口
    getRecordList(n){
        let _that=this;
        $(".titBar a").removeClass("on");
        $(".titBar a").eq(n).addClass("on");
        $(".record-list-box").addClass("hidden");
        $(".record-list-box").eq(n).removeClass("hidden");
        switch(n)
        {
            case 0:
                this.getMsg(this.state.currentPage_1,this.state.barsNum_1,2);
                break;
            case 1:
                this.getMsg(this.state.currentPage_2,this.state.barsNum_2,2);
                break;
            case 2:
                this.getMsg(this.state.currentPage_3,this.state.barsNum_3,2);
                break;
        }
    }
    //设定记录 取消按钮
    canCanceRecord(event){
        let that=this;
        let _id=$(event.target).closest(".list-cont").find(".id-li").text();
        $.ajax({
            type:"post",
            url:"/node/cancelLatefee",
            async:false,
            dataType: "JSON",
            data:{
                lateFeeScheduledPaymentId:_id,
                loanNumber:this.props._loannumber
                },
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                that.getMsg(that.state.pageNumber,that.state.pageSize_2,2);
            }
        })
    }
    //快速跳转到某一页。
    gotoPageNum_1(pageNumber) {
        this.setState({
            current_1: pageNumber
        },()=>{
            this.getMsg(pageNumber,this.state.barsNum_1,2)
        })
    }
    onShowSizeChange_1(current_1, pageSize_1) {
        this.setState({
            current_1:1,
            barsNum_1:pageSize_1
        },()=>{
            this.getMsg(current_1,pageSize_1,2)
        })
    }
    //快速跳转到某一页。
    gotoPageNum_2(pageNumber) {
        this.setState({
            current_2: pageNumber
        },()=>{
            this.getMsg(pageNumber,this.state.pageSize_2,2)
        })
    }
    // 改变每页显示条目数
    onShowSizeChange_2(current_2, pageSize_2) {
        this.setState({
            current_2:1,
            barsNum_2:pageSize_2
        },()=>{
            this.getMsg(current_2,pageSize_2,2)
        })
    }
    //快速跳转到某一页。
    gotoPageNum_3(pageNumber) {
        let _select=$(".overd-filtrate option:selected").attr("value");
        this.setState({
            current_3: pageNumber
        },()=>{
            this.getMsg(pageNumber,this.state.pageSize_3,_select)
        })
    }
    // 改变每页显示条目数
    onShowSizeChange_3(current_3, pageSize_3) {
        let _select=$(".overd-filtrate option:selected").attr("value");
        this.setState({
            current_3:1,
            barsNum_3:pageSize_3
        },()=>{
            this.getMsg(current_3,pageSize_3,_select)
        })
    }
    //筛选
    filtrateHandle(event){
        let _select=$(event.target).find("option:selected").attr("value");
        this.getMsg(1,25,_select);
    }
    render() {
        //逾期费列表
        let late_fee_array=[];
        if(this.state.popData && this.state.popData.late_fee_array && this.state.popData.late_fee_array.length>0){
            late_fee_array=this.state.popData.late_fee_array;
        }
        //设定记录
        let late_fee_record_array=[];
        if(this.state.popData && this.state.popData.late_fee_record_array && this.state.popData.late_fee_record_array.length>0){
            late_fee_record_array=this.state.popData.late_fee_record_array;
        }
        //逾期费扣款记录
        let late_fee_payment_array=[];
        if(this.state.popData && this.state.popData.late_fee_payment_array && this.state.popData.late_fee_payment_array.length>0){
            late_fee_payment_array=this.state.popData.late_fee_payment_array;
        }
        return (
            <div className="approve-record-list">
                <div className="tanc_bg"></div>                    
                <div className="overdue-tip">
                    3天减免期，第4天开始计算，当期本金0.1%每逾期一天累加比如：（逾期1、2、3期，每期本金1000，第一期=1000*0.1%*90天，第二期=1000*0.1%*60天，第三期=1000*0.1%*30天）
                </div>
                <div className="titBar clearfix">
                    <a href="javascript:void(0) " className={"record-tab block on"} data-type="debitting" onClick={this.getRecordList.bind(this,0)}>逾期费列表</a>
                    <a href="javascript:void(0) " className="record-tab block" data-type="getadjustment" onClick={this.getRecordList.bind(this,1)}>设定记录</a>
                    <a href="javascript:void(0) " className="record-tab block" data-type="blinds" onClick={this.getRecordList.bind(this,2)}>逾期费扣款记录</a>
                    <div className="close-record-prop right" onClick={this.props.showApprove.bind(this,false)}>
                        <img src="/img/close-record-prop.png" alt=""/>
                    </div>
                </div>
                <div className="record-list-box binds-list overdue-list hidden">   {/*---逾期费列表 .binds-list ---*/}
                    <ul className="list-tit">
                        <li>id</li>
                        <li>逾期天数</li>
                        <li>未还罚息金额</li>
                        <li>期数</li>
                        <li>截止计算罚息日期</li>
                        <li>罚息减免金额</li>
                        <li>应还罚息</li>
                    </ul>
                    <div className="list-content binds-list-content">
                        {
                            late_fee_array.length>0 ? late_fee_array.map((repy,i)=>{
                                return <ul key={i} className="list-cont">
                                            <li title={commonJs.is_obj_exist(repy.late_fee_id )}>{commonJs.is_obj_exist(repy.late_fee_id )}</li>
                                            <li title={commonJs.is_obj_exist(repy.default_days )}>{commonJs.is_obj_exist(repy.default_days )}</li>
                                            <li title={commonJs.is_obj_exist(repy.late_fee_not_paid )}>{commonJs.is_obj_exist(repy.late_fee_not_paid )}</li>
                                            <li title={commonJs.is_obj_exist(repy.installment_number )}>{commonJs.is_obj_exist(repy.installment_number )}</li>
                                            <li title={commonJs.is_obj_exist(repy.dead_line )}>{commonJs.is_obj_exist(repy.dead_line )}</li>
                                            <li title={commonJs.is_obj_exist(repy.waiver_late_fee )}>{commonJs.is_obj_exist(repy.waiver_late_fee )}</li>
                                            <li title={commonJs.is_obj_exist(repy.original_late_fee )}>{commonJs.is_obj_exist(repy.original_late_fee )}</li>
                                        </ul>
                            }):<ul className="list-cont"><li className="gray-tip-font">暂未查到相关数据...</li></ul>
                                
                        }
                    </div>
                    <div className="paageNo left pl10 pt5" style={{"minWidth":"30px"}}>
                        <Pagination
                            showSizeChanger
                            onShowSizeChange={this.onShowSizeChange_1.bind(this)}
                            defaultPageSize={this.state.barsNum_1}
                            defaultCurrent={1}
                            current={this.state.current_1}
                            total={(late_fee_array[0] && late_fee_array[0].total)?late_fee_array[0].total:0}
                            onChange={this.gotoPageNum_1.bind(this)}
                            pageSizeOptions={['25','50','100']}
                        />
                    </div>
                </div>
                
                <div className="record-list-box getadjustment-list settingRcord hidden">   {/*---设定记录 ---*/}
                    <ul className="list-tit">
                        <li>id</li>
                        <li className="loan-li">合同号</li>
                        <li>金额</li>
                        <li>设定扣款时间</li>
                        <li>创建时间</li>
                        <li>创建人</li>
                        <li>更新时间</li>
                        <li>操作</li>
                    </ul>
                    <div className="list-content getadjustment-list-content">
                        {
                            late_fee_record_array.length>0 ? late_fee_record_array.map((repy,i)=>{
                                    return <ul key={i} className="list-cont">
                                                <li className="pactNo id-li pl20" title={commonJs.is_obj_exist(repy.id)}>{commonJs.is_obj_exist(repy.id)}</li>
                                                <li className="pactNo loan-li" title={commonJs.is_obj_exist(repy.loanNumber)}>{commonJs.is_obj_exist(repy.loanNumber)}</li>
                                                <li className="adjustCash" title={commonJs.is_obj_exist(repy.amount)}>{commonJs.is_obj_exist(repy.amount)}</li>
                                                <li className="adjustType" title={commonJs.is_obj_exist(repy.setupTime)}>{commonJs.is_obj_exist(repy.setupTime)}</li>
                                                <li className="founder" title={commonJs.is_obj_exist(repy.createdAt)}>{commonJs.is_obj_exist(repy.createdAt)}</li>
                                                <li className="adjustTime" title={commonJs.is_obj_exist(repy.setBy) }>{commonJs.is_obj_exist(repy.setBy) }</li>
                                                <li className="fundTime pr20" title={commonJs.is_obj_exist(repy.updatedAt)}>{commonJs.is_obj_exist(repy.updatedAt)}</li>
                                                <li className="fundTime pr20" title={commonJs.is_obj_exist(repy.canCance)}>
                                                    {commonJs.is_obj_exist(repy.canCance)=="yes" ? <a onClick={this.canCanceRecord.bind(this)} className="btn-white">取消</a>:""}
                                                </li>
                                            </ul>
                                        }):<ul className="list-cont"><li className="gray-tip-font">暂未查到相关数据...</li></ul>
                        }

                    </div>
                    <div className="paageNo left pl10 pt5" style={{"minWidth":"30px"}}>
                        <Pagination
                            showSizeChanger
                            onShowSizeChange={this.onShowSizeChange_2.bind(this)}
                            defaultPageSize={this.state.barsNum_2}
                            defaultCurrent={1}
                            current={this.state.current_2}
                            total={(late_fee_record_array[0] && late_fee_record_array[0].total)?late_fee_record_array[0].total:0}
                            onChange={this.gotoPageNum_2.bind(this)}
                            pageSizeOptions={['25','50','100']}
                        />
                    </div>
                </div>

                <div className="record-list-box binds-list overdueCharge hidden">   {/*---逾期费扣款记录 .binds-list ---*/}
                    <ul className="list-tit">
                        <li className="loan-li">合同号</li>
                        <li>金额</li>
                        <li>类型</li>
                        <li>完成时间</li>
                        <li>创建时间</li>
                        <li>更新时间</li>
                        <li>错误信息</li>
                        <li className="overd-filtrate">
                            <select name="" id="" className="select-gray" style={{"width":"100%"}} onChange={this.filtrateHandle.bind(this)}>
                                <option value="2" hidden>筛选</option>
                                <option value="2">全部</option>
                                <option value="1">成功</option>
                                <option value="0">失败</option>
                            </select>
                        </li>
                    </ul>
                    <div className="list-content binds-list-content">
                        {
                            late_fee_payment_array.length>0 ? late_fee_payment_array.map((repy,i)=>{
                                return <ul key={i} className="list-cont">
                                            <li className="loan-li" title={commonJs.is_obj_exist(repy.loan_number)}>{commonJs.is_obj_exist(repy.loan_number)}</li>
                                            <li title={commonJs.is_obj_exist(repy.amount)}>{commonJs.is_obj_exist(repy.amount)}</li>
                                            <li title={commonJs.is_obj_exist(repy.payment_status )}>{commonJs.is_obj_exist(repy.payment_status )}</li>
                                            <li title={commonJs.is_obj_exist(repy.complete_time)}>{commonJs.is_obj_exist(repy.complete_time)}</li>
                                            <li title={commonJs.is_obj_exist(repy.createdAt )}>{commonJs.is_obj_exist(repy.createdAt )}</li>
                                            <li title={commonJs.is_obj_exist(repy.updatedAt )}>{commonJs.is_obj_exist(repy.updatedAt )}</li>
                                            <li title={commonJs.is_obj_exist(repy.errMsg )}>{commonJs.is_obj_exist(repy.errMsg )}</li>
                                        </ul>
                            }):<ul className="list-cont"><li className="gray-tip-font">暂未查到相关数据...</li></ul>        
                        }
                    </div>
                    <div className="paageNo left pl10 pt5" style={{"minWidth":"30px"}}>
                        <Pagination
                            showSizeChanger
                            onShowSizeChange={this.onShowSizeChange_3.bind(this)}
                            defaultPageSize={this.state.barsNum_3}
                            defaultCurrent={1}
                            current={this.state.current_3}
                            total={(late_fee_payment_array[0] && late_fee_payment_array[0].total)?late_fee_payment_array[0].total:0}
                            onChange={this.gotoPageNum_3.bind(this)}
                            pageSizeOptions={['25','50','100']}
                        />
                    </div>
                </div>
            </div>
        );
    }
};

export default OverdueMsg_pop;