import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Pagination } from 'antd';  //页码

class Approve_prop extends React.Component {
    constructor(props){
        super(props);
        this.state={
            rcord_data:{},        // 扣款列表
            _breakdowns:[],   //扣款列表详情
            barsNum_blind:25,  //每页显示多少条-blind记录
            current_blind:1,  //当前页码-blind记录
            barsNum_withhold:25,  //每页显示多少条-扣款列表
            current_withhold:1,  //当前页码-扣款列表
        }
    }

    getFontColor(ajaxColor) {
        let colorClass="";
        switch (ajaxColor){
            case "RED":
                colorClass="deep-yellow-font";
                break;
            case "GREEN":
                colorClass="green-font";
                break;
            case "YELLOW":
                colorClass="yellow-font";
                break;
            case "BLUE":
                colorClass="blue-font";
                break;
            case "GRAY":
                colorClass="";
                break;
        }
        return colorClass;
    }

    getRecordList(customUrls,n){
        let _that=this;
        $(".titBar a").removeClass("on");
        $(".titBar a").eq(n).addClass("on");
        $(".record-list-box").addClass("hidden");
        $(".record-list-box").eq(n).removeClass("hidden");
        $(".record-detail").addClass("hidden");
        if(!this.props._accountId){
            return;
        }
        if(!this.props._loannumber){
            return;
        }
        let data={};
        if(n==2){
            data={
                accountId:this.props._accountId,
                loannumber:this.props._loannumber,
                customerId:this.props.customerId,
                page:this.state.current_blind-1,
                size:this.state.barsNum_blind
            }
        }else{
            data={
                accountId:this.props._accountId,
                loannumber:this.props._loannumber,
                customerId:this.props.customerId
            }
        }
        $.ajax({
            type:"get",
            url:customUrls,
            async:true,
            dataType: "JSON",
            data:data,
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _getData = res.data;
                _that.setState({
                    rcord_data:_getData
                })
            }
        })
    }

    componentDidMount(){
        if(this.props.currentList==1){
            this.getRecordList('/node/debittingRcord',0);
        }
        if(this.props.currentList==2){
            this.getRecordList('/node/getadjustmentRcord',1);
        }
        if(this.props.currentList==3){
            this.getRecordList('/node/blindsRcord',2);
        }
        // 点击展开
        $(".record-list-box").on("click",".list-cont",function () {
            let condition=$(this).next(".toggle-ul");
            if (condition){
                $(this).addClass("pointer");
                if(condition.hasClass("hidden")){
                    condition.removeClass("hidden");
                }else {
                    condition.addClass("hidden");
                }
            }
        })
    }
    //点击详情
    showDetail_Prop(event){
        let all_rincipal=0;
        let all_interest=0;
        let $this=$(event.target);
        let get_debittings=this.state.rcord_data.debittings;
        let breakdowns_id=$this.closest(".record-div").attr("data-scheduledId");
        $(".record-detail").removeClass("hidden");
        for(let i=0;i<get_debittings.length;i++){
            if(get_debittings[i].scheduled_id==breakdowns_id){
                this.setState({
                    _breakdowns:get_debittings[i].breakdowns
                },()=>{
                    for(let j=0;j<this.state._breakdowns.length;j++){
                        all_rincipal+=this.state._breakdowns[j].principal;
                        all_interest+=this.state._breakdowns[j].interest;
                    }
                    $(".all-principal").text(all_rincipal.toFixed(2));
                    $(".all-interest").text(all_interest.toFixed(2));
                })
            }
        }
        $(".record-detail .wraper-cash").text("￥"+$this.closest("ul").find(".chash").text())  
    }
    close_detail(){
        $(".record-detail").addClass("hidden");
    }
    //扣款列表的取消按钮
    cancelBtn(){
        let that=this;
        $.ajax({
            type:"post",
            url:"/node/cancelDebit",
            async:false,
            dataType: "JSON",
            data:{
                accountId:this.props._accountId,
                loannumber:this.props._loannumber
            },
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _getData = res.data;
                alert(_getData.message);
                that.getRecordList('/node/debittingRcord',0);
            }
        })
    }
    //关闭展期费查询弹窗
    closeEtnPop(){
        $(".extension-pop").addClass("hidden");
    }
    //展期费查询
    extCheck(event){
        let that=this;
        let _param={
            accountId:this.props._accountId,
            loannumber:this.props._loannumber,
            customerId:this.props.customerId
        };
        $.ajax({
            type:"post",
            url:"/node/isQualification",
            async:false,
            dataType: "JSON",
            data:_param,
            success:function(res) {
                let _getData = res.data;
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                $(".extension-pop").removeClass("hidden");
                that.setState({
                    extensionPayInstallmentsInfoDTOS:res.data.extensionPayInstallmentsInfoDTOS,
                    extensionPayPlanInfoDTO:res.data.extensionPayPlanInfoDTO
                })
            }
        })
    }
    // 改变每页显示条目数
    onShowSizeChange_withhold(current_withhold, pageSize_withhold) {
        this.setState({
            barsNum_withhold:pageSize_withhold
        })
    }
    //快速跳转到某一页。
    pageChange_withhold(page_withhold){
        this.setState({
            current_withhold: page_withhold
        });
    }
    // 改变每页显示条目数
    onShowSizeChange_blind(current_blind, pageSize_blind) {
        this.setState({
            current_blind: 1,
            barsNum_blind:pageSize_blind
        },()=>{
            this.getRecordList('/node/blindsRcord',2)
        })
    }
    pageChange_blind(page){
        this.setState({
            current_blind: page
        },()=>{
            this.getRecordList('/node/blindsRcord',2)
        });
    }

    render() {
        // 扣款列表
        let get_debittings=this.state.rcord_data.debittings;
        let debittingRcord_list=(this.state.rcord_data && this.state.rcord_data.debittings && this.state.rcord_data.debittings.length>0);

        //调账历史记录
        let get_getadjustmentRcord_list=this.state.rcord_data.adjustments;
        let getadjustmentRcord_list=(this.state.rcord_data && get_getadjustmentRcord_list && get_getadjustmentRcord_list.length>0);

        //blind记录
        let get_blindsRcord_list=this.state.rcord_data.blinds;
        let binds_total=this.state.rcord_data.count;
        let blindsRcord_list=(this.state.rcord_data && get_blindsRcord_list && get_blindsRcord_list.length>0);

        let breakdowns=this.state._breakdowns;  //详情数据

        let processingStatus = this.props.processingStatus;
        const {extensionPayInstallmentsInfoDTOS,extensionPayPlanInfoDTO}=this.state; //展期费查询结果
        return (
            <div className="approve-record-list">
                <div className="tanc_bg"></div>
                <div className="titBar clearfix">
                    <a href="javascript:void(0) " className={processingStatus&&processingStatus=="APPROVE"?"record-tab block on":"record-tab block on hidden"} data-type="debitting" onClick={this.getRecordList.bind(this,'/node/debittingRcord',0)}>扣款列表</a>
                    <a href="javascript:void(0) " className="record-tab block" data-type="getadjustment" onClick={this.getRecordList.bind(this,'/node/getadjustmentRcord',1)}>调账历史记录</a>
                    <a href="javascript:void(0) " className="record-tab block" data-type="blinds" onClick={this.getRecordList.bind(this,'/node/blindsRcord',2)}>blind记录</a>
                    <a className="record-tab block" onClick={this.extCheck.bind(this)}>查询</a>
                    <div className="close-record-prop right" onClick={this.props.showApprove.bind(this,false)}>
                        <img src="/img/close-record-prop.png" alt=""/>
                    </div>
                </div>
                <div className="record-list-box debitting-list"> {/*---扣款列表 .debitting-list ---*/}
                    <ul className="list-tit">
                        <li className="pl20">ID</li>
                        <li className="periods">期数</li>
                        <li className="setTime">设置日期</li>
                        <li className="refundTime">还款日</li>
                        <li className="chash">金额</li>
                        <li className="principal">本金</li>
                        <li className="interest">利息</li>
                        <li className="extension">展期费</li>
                        <li className="overdue">逾期天数</li>
                        <li className="operator">操作人</li>
                        <li className="operate pr20">操作</li>
                    </ul>
                    <div className="list-content debitting-list-content">
                        {
                            debittingRcord_list ? get_debittings.map((record,index)=>{
                                let _scheduledPayment_normals=record.scheduledPayment_normals;
                                let _fontColor1=this.getFontColor(record.color);
                                if(_scheduledPayment_normals){
                                    var _fontColor2=this.getFontColor(record.scheduledPayment_normals.color );
                                }
                                let isShowCancelBtn="-";
                                if(record.payment_status){
                                     if(record.payment_status.value=="not_debit"){
                                        isShowCancelBtn=<a className="blue-font" onClick={this.cancelBtn.bind(this)}>取消</a>
                                    }else if(record.payment_status.value=="paid" || record.payment_status.value=="offline_paid" || record.payment_status.value=="blind" || record.payment_status.value=="active_debit"){
                                        if(record.breakdown_type && record.breakdown_type!="transferred"){
                                            isShowCancelBtn=<a className="blue-font" onClick={this.showDetail_Prop.bind(this)}>详情</a>;
                                        }
                                    }
                                }
                                let barsNum_withhold=this.state.barsNum_withhold;  //每一页显示条数
                                let current_withhold=this.state.current_withhold;  //当前页码
                                if(index>=barsNum_withhold*(current_withhold-1) && index<=(barsNum_withhold*current_withhold-1)){
                                    return <div key={index} className="record-div" data-scheduledId ={commonJs.is_obj_exist(record.scheduled_id)}>
                                        <ul className={record.type.value=="installment"?("list-cont "+_fontColor1):("list-cont grayBg "+_fontColor1)}>
                                            <li className="pl20">{commonJs.is_obj_exist(record.number)}</li>
                                            <li className={record.type.value=="installment"?"periods":"periods2"} title={record.type.value=="installment"?record.installment_number:"breakdowns"}>
                                                {record.type.value=="installment"?record.installment_number:"breakdowns"}
                                            </li>
                                            <li className="setTime" title={commonJs.is_obj_exist(record.setup_date)}>{commonJs.is_obj_exist(record.setup_date)}</li>
                                            <li className="refundTime" title={commonJs.is_obj_exist(record.due_date) }>{commonJs.is_obj_exist(record.due_date) }</li>
                                            <li className="chash" title={record.amount?record.amount.toFixed(2):"-"}>{record.amount?record.amount.toFixed(2):"-"}</li>
                                            <li className="principal" title={commonJs.is_obj_exist(record.principal)}>{commonJs.is_obj_exist(record.principal)}</li>
                                            <li className="interest" title={commonJs.is_obj_exist(record.interest)}>{commonJs.is_obj_exist(record.interest)}</li>
                                            <li className="extension" title={(record.extension && record.extension==1) ? commonJs.is_obj_exist(record.extension_fee):"-"}>
                                                {(record.extension && record.extension==1) ? commonJs.is_obj_exist(record.extension_fee):"-"}
                                            </li>
                                            <li className="overdue" title={record.days_in_default }>{record.days_in_default }</li>
                                            <li className="operator" title={commonJs.is_obj_exist(record.set_by)+((record.payment_status||record.breakdown_type_special)?"("+(record.payment_status?record.payment_status.displayName:"")+","+(record.breakdown_type_special?record.breakdown_type_special:"")+")":"")}>
                                                {commonJs.is_obj_exist(record.set_by)+((record.payment_status||record.breakdown_type_special)?"("+(record.payment_status?record.payment_status.displayName:"")+","+(record.breakdown_type_special?record.breakdown_type_special:"")+")":"")}
                                            </li>
                                            {/*<li className={record.type.value=="breakdown"?"operate detail-link blue-font":"operate"} onClick={this.showDetail_Prop.bind(this)}>{record.type.value=="breakdown"?"详情":"-"}</li>*/}
                                            <li className={record.type.value=="breakdown"?"operate detail-link blue-font":"operate"}>{isShowCancelBtn}</li>
                                        </ul>
                                        {_scheduledPayment_normals ? <ul className={"toggle-ul grayBg gray-font hidden "+_fontColor2}>
                                                <li className="pl30"></li>
                                                <li className="periods2" title={commonJs.is_obj_exist(record.installment_number) }>
                                                    {commonJs.is_obj_exist(record.installment_number)}
                                                </li>
                                                <li className="setTime" title={commonJs.is_obj_exist(_scheduledPayment_normals.setup_date)}>{commonJs.is_obj_exist(_scheduledPayment_normals.setup_date)}</li>
                                                <li className="refundTime" title={commonJs.is_obj_exist(_scheduledPayment_normals.due_date) }>{commonJs.is_obj_exist(_scheduledPayment_normals.due_date) }</li>
                                                <li className="chash" title={_scheduledPayment_normals.amount}>{_scheduledPayment_normals.amount}</li>
                                                <li className="principal" title={_scheduledPayment_normals.principal}>{_scheduledPayment_normals.principal}</li>
                                                <li className="interest" title={_scheduledPayment_normals.interest}>{_scheduledPayment_normals.interest}</li>
                                                <li className="extension" title={_scheduledPayment_normals.extension_fee}>{_scheduledPayment_normals.extension_fee}</li>
                                                <li className="overdue">-</li>
                                                <li className="operator" title={commonJs.is_obj_exist(_scheduledPayment_normals.set_by)+"("+_scheduledPayment_normals.payment_status.displayName+")"}>
                                                    {commonJs.is_obj_exist(_scheduledPayment_normals.set_by)+"("+_scheduledPayment_normals.payment_status.displayName+")"}
                                                </li>
                                                <li className="operate pointer pr10">-</li>
                                            </ul> : ""}
                                    </div>
                                }
                            }):""
                        }
                    </div>
                    <div className="paageNo left pl10 pt5" style={{"minWidth":"30px"}}>
                        <Pagination
                            showSizeChanger
                            onShowSizeChange={this.onShowSizeChange_withhold.bind(this)}
                            defaultPageSize={this.state.barsNum_withhold}
                            defaultCurrent={1}
                            current={this.state.current_withhold}
                            total={debittingRcord_list?get_debittings.length:0}
                            onChange={this.pageChange_withhold.bind(this)}
                            pageSizeOptions={['25','50','100']}
                        />
                    </div>
                </div>
                {/* 展期费查询弹窗 */}
                <div className="extension-pop hidden">
                    <i className="close-etn-pop absolute block pointer" onClick={this.closeEtnPop.bind(this)}></i>
                    <p className="extensionFee">当前展期费：{extensionPayPlanInfoDTO?commonJs.is_obj_exist(extensionPayPlanInfoDTO.extensionFee):"-"}</p>
                    <div className="eptab">
                        <table className="pt-table">
                            <tbody>
                                <tr>
                                    <th>还款状态</th>
                                    <th>还款期数</th>
                                    <th>当前应还金额</th>
                                    <th>当期剩余应还金额</th>
                                    <th>原始还款日</th>
                                    <th>当期是否延期</th>
                                    <th>起息日</th>
                                </tr>
                                {
                                    (extensionPayInstallmentsInfoDTOS && extensionPayInstallmentsInfoDTOS.length>0)?extensionPayInstallmentsInfoDTOS.map((repy,i)=>{
                                        let paidOffText="-";
                                        if(repy.paidOff && repy.paidOff==1){
                                            if(repy.extension && repy.extension==1){
                                                paidOffText="延期还款"
                                            }else{
                                                paidOffText="已还款"
                                            }
                                        }else{
                                            paidOffText="待还款"
                                        }

                                        return <tr key={i}>  
                                                <td>{paidOffText}</td>
                                                <td>{commonJs.is_obj_exist(repy.installmentNumber)}</td>
                                                <td>{commonJs.is_obj_exist(repy.amount)}</td>
                                                <td>{commonJs.is_obj_exist(repy.installmentNotPaid)}</td>
                                                <td>{commonJs.is_obj_exist(repy.originalDueDate)}</td>
                                                <td>{(repy.extension && repy.extension=="1")?"是":"否"}</td>
                                                <td>{commonJs.is_obj_exist(repy.installmentInterestStartDate)}</td>
                                            </tr>
                                    }):<tr><td colSpan="7" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                                
                            </tbody>
                        </table>
                    </div>
                </div>
                {/*扣款列表详情*/}
                <div className="record-detail hidden">
                    <table className="pt-table">
                        <tbody>
                            <tr>
                                <th width="20%"></th>
                                <th width="20%">本金</th>
                                <th width="20%">利息</th>
                                <th width="10%">期数</th>
                                <th width="20%">日期</th>
                                <th width="10%"><i className="close" onClick={this.close_detail.bind(this)}></i></th>
                            </tr>
                            <tr>
                                <td colSpan="6" className="wraper-cash"></td>
                            </tr>
                            {
                                breakdowns.length>0 ? breakdowns.map((repy,i)=>{
                                    return <tr key={i}>
                                                <td></td>
                                                <td className="principal">{commonJs.is_obj_exist(repy.principal)}</td>
                                                <td className="interest">{commonJs.is_obj_exist(repy.interest)}</td>
                                                <td>{commonJs.is_obj_exist(repy.installment_number)}</td>
                                                <td>{commonJs.is_obj_exist(repy.original_due_date)}</td>
                                                <td></td>
                                            </tr>
                                }): <tr><td colSpan="6" className="gray-tip-font">暂时没有数据...</td></tr>
                            }
                            <tr>
                                <td>总</td>
                                <td className="all-principal"></td>
                                <td className="all-interest" colSpan="3"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="record-list-box getadjustment-list hidden">   {/*---调账历史记录 .getadjustment-list ---*/}
                    <ul className="list-tit">
                        <li className="pactNo pl20">合同编号</li>
                        <li className="adjustCash">调账金额</li>
                        <li className="adjustType">调帐类型</li>
                        <li className="founder">创建人</li>
                        <li className="adjustTime">调帐时间</li>
                        <li className="fundTime pr20">创建时间</li>
                    </ul>
                    <div className="list-content getadjustment-list-content">
                        {
                            getadjustmentRcord_list ? get_getadjustmentRcord_list.map(function (getadjustmentRcord,index) {
                                    return <ul key={index} className="list-cont">
                                                <li className="pactNo pl20" title={commonJs.is_obj_exist(getadjustmentRcord.loanNumber)}>{commonJs.is_obj_exist(getadjustmentRcord.loanNumber)}</li>
                                                <li className="adjustCash" title={commonJs.is_obj_exist(getadjustmentRcord.amount)}>{commonJs.is_obj_exist(getadjustmentRcord.amount)}</li>
                                                <li className="adjustType" title={commonJs.is_obj_exist(getadjustmentRcord.adjustmentTypeId.displayName)}>{commonJs.is_obj_exist(getadjustmentRcord.adjustmentTypeId.displayName)}</li>
                                                <li className="founder" title={commonJs.is_obj_exist(getadjustmentRcord.setBy)}>{commonJs.is_obj_exist(getadjustmentRcord.setBy)}</li>
                                                <li className="adjustTime" title={commonJs.is_obj_exist(getadjustmentRcord.completeTime) }>{commonJs.is_obj_exist(getadjustmentRcord.completeTime) }</li>
                                                <li className="fundTime pr20" title={commonJs.is_obj_exist(getadjustmentRcord.createdAt)}>{commonJs.is_obj_exist(getadjustmentRcord.createdAt)}</li>
                                            </ul>
                                        },this):""
                        }

                    </div>
                </div>
                <div className="record-list-box binds-list hidden">   {/*---获取blind记录 .binds-list ---*/}
                    <ul className="list-tit">
                        <li className="pactNo pl20">合同编号</li>
                        <li className="adjustCash">类型</li>
                        <li className="adjustTime">时间</li>
                        <li className="founder">金额</li>
                        <li className="adjustType">结果</li>
                        <li className="fundTime pr20">原因</li>
                    </ul>
                    <div className="list-content binds-list-content">
                        {
                            blindsRcord_list ? get_blindsRcord_list.map(function (_blinds,index) {
                                return <ul key={index} className="list-cont">
                                            <li className="pactNo pl20" title={commonJs.is_obj_exist(_blinds.loanNumber)}>{commonJs.is_obj_exist(_blinds.loanNumber)}</li>
                                            <li className="adjustCash" title={commonJs.is_obj_exist(_blinds.blindTypeId.displayName)}>{commonJs.is_obj_exist(_blinds.blindTypeId.displayName)}</li>
                                            <li className="adjustTime" title={commonJs.is_obj_exist(_blinds.updatedAt)}>{commonJs.is_obj_exist(_blinds.updatedAt)}</li>
                                            <li className="founder" title={commonJs.is_obj_exist(_blinds.amount)}>{commonJs.is_obj_exist(_blinds.amount)}</li>
                                            <li className="adjustType" title={commonJs.is_obj_exist(_blinds.paymentStatusId.displayName)}>{commonJs.is_obj_exist(_blinds.paymentStatusId.displayName)}</li>
                                            <li className="fundTime pr20" title={commonJs.is_obj_exist(_blinds.msg)}>{commonJs.is_obj_exist(_blinds.msg)}</li>
                                        </ul>
                                },this):""
                        }

                    </div>
                    <div className="paageNo left pl10 pt5" style={{"minWidth":"30px"}}>
                        <Pagination
                            showSizeChanger
                            onShowSizeChange={this.onShowSizeChange_blind.bind(this)}
                            defaultPageSize={this.state.barsNum_blind}
                            defaultCurrent={1}
                            current={this.state.current_blind}
                            total={binds_total}
                            onChange={this.pageChange_blind.bind(this)}
                            pageSizeOptions={['25','50','100']}
                        />
                    </div>
                </div>
            </div>
        );
    }
};

export default Approve_prop;