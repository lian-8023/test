// 合同列表
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import Approve_prop from './approve_record_list';
import OverdueMsg_pop from './overdueMsg_pop';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

import $ from 'jquery';
import { DatePicker } from 'antd';
const RangePicker = DatePicker.RangePicker;
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class Pact extends React.Component {
    constructor(props){
        super(props);
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2A PORTAL用户详情-UserMsg组件信息
        this.state={
            loanInfoDTOs:[], //接口数组
            pactList:[], //合同列表信息
            loanMap:{},  //PROSEESING
            loanMap_temp:{},  //PROSEESING
            creditModel:{},  //creditModel结果
            approve:{},  //approve 是否显示接口数据
            time_value:null,
            showProp2:false,
            _currentList:1,
            _currentList2:1,
            current_productNO:"",   //点击页面合同列表获得的产品号
            setupDate:"YYYY-MM-DD HH:mm:ss",
            setupDateSecond:false
        }
    }
    //初始化滞纳金减免类型-lyf
    overdueInit(){
        let that=this;
        $.ajax({
            type:"get",
            url:"/node/overdueInit",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _getData = res.data;
                that.setState({
                    overdueTypes:_getData.types
                })
            }
        })
    }
    //获取页面数据
    getMsg(){
        var _that=this;
        var accountId = this.userInfo2AStore.acountId;
        var nationalId=this.userInfo2AStore.userInfo.nationalId;
        if(!accountId||accountId=='' || !nationalId||nationalId==""){
            return;
        }
        $.ajax({
            type:"get",
            url:"/node/pactList_detail",
            async:true,
            dataType: "JSON",
            data:{
                accountId:accountId,
                identyNo:nationalId,
            },
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    _that.setState({
                        loanInfoDTOs:[],
                        pactList:[],
                        loanMap_temp:{}
                    })
                    return;
                }
                var _getData = res.data;
                if(_getData.loanInfoDTOs && _getData.loanInfoDTOs.length>0){
                    let _loanInfoDTOs=_getData.loanInfoDTOs;
                    let new_pactList=[];
                    let _loanMap = {};
                    for (let i=0;i<_loanInfoDTOs.length;i++){
                        let new_pactList_obj={};
                        let _loanInfoDTOs_i=_loanInfoDTOs[i];
                        new_pactList_obj.loanNumber=_loanInfoDTOs_i.loanNumber; //合同号
                        new_pactList_obj.productNO=_loanInfoDTOs_i.productNO; //产品号
                        new_pactList_obj.createdAt=_loanInfoDTOs_i.processingInfoDTO.esign_date; //签订时间
                        new_pactList_obj.loanStatus=_loanInfoDTOs_i.loanStatus?_loanInfoDTOs_i.loanStatus.name:""; //贷款状态
                        if(_loanInfoDTOs_i.esignInfoDTOs && _loanInfoDTOs_i.esignInfoDTOs.length>0){ //重签情况
                            new_pactList_obj.esignInfoDTOs="重签"
                        }else {
                            new_pactList_obj.esignInfoDTOs=""
                        }
                        new_pactList.push(new_pactList_obj);
                        _loanMap[_loanInfoDTOs_i.loanNumber]=_loanInfoDTOs_i;
                    }
                    _that.setState({
                        loanInfoDTOs:_loanInfoDTOs,
                        pactList:new_pactList,
                        loanMap_temp:_loanMap
                    },()=>{
                        _that.loanDetail(_loanInfoDTOs[0].loanNumber);
                    })
                }
            }
        })
    }
    // 点击贷款号码在 PROSEESING 显示详情
    loanDetail(loannumber,event){
        $(".cctor_loanNo").val(loannumber?loannumber:"");
        // $(".processing-tab li[data-type='transfer'],.processing-tab li[data-type='setup'],.processing-tab li[data-type='adjustment'],.withhold-btn").removeClass("hidden");
        $(".processing-tab li[data-type='transfer'],.processing-tab li[data-type='setup'],.withhold-btn").removeClass("hidden");
        commonJs.reloadRules();
        let _productNO="";
        if(event && event.target){
            let $this=$(event.target);
            _productNO=$this.closest("tr").find(".productNO").text();
        }

        if(this.state.loanMap_temp[loannumber]){
            let loan_info = this.state.loanMap_temp[loannumber];
            this.setState({
                    loanMap:loan_info,
                    loanNumber:loannumber,
                    current_productNO:loan_info.productNO
            });
        //  按钮的隐藏||显示
        let processingStatus = loan_info.processingInfoDTO?loan_info.processingInfoDTO.loanProcessingStatus.name:"";
        let loanStatus = loan_info.loanStatus?loan_info.loanStatus.name:"";
        let dataDuIsShow=(processingStatus&&processingStatus=="APPROVE");
        let dataIsShow=(dataDuIsShow&&(loanStatus=="current" || loanStatus=="past_due"));
        let aa=$(".processing-tab li[data-type='transfer']").attr("class");
        let transfer_btn=$(".processing-tab li[data-type='transfer']");
        let setup_btn=$(".processing-tab li[data-type='setup']");
        // let adjustment_btn=$(".processing-tab li[data-type='adjustment']");
        let withhold_btn=$(".withhold-btn");

        if(!transfer_btn.hasClass("hidden") && dataIsShow){  //转账设定付款
            transfer_btn.removeClass("hidden")
        }else{
            transfer_btn.addClass("hidden")
        }
        if(!setup_btn.hasClass("hidden") && dataIsShow){  //设定付款
            setup_btn.removeClass("hidden")
        }else{
            setup_btn.addClass("hidden")
        }
        // if(!adjustment_btn.hasClass("hidden") && dataIsShow){  //设定调帐
        //     adjustment_btn.removeClass("hidden")
        // }else{
        //     adjustment_btn.addClass("hidden")
        // }
        if(!withhold_btn.hasClass("hidden") && dataDuIsShow){  //扣款列表
            withhold_btn.removeClass("hidden")
        }else{
            withhold_btn.addClass("hidden")
        }
        }
        
    }

    // 获取creditModel结果
    get_creditModel(even){
        let _next=$(even.target).next();
        let _that=this;
        let accountId = this.userInfo2AStore.acountId;
        let loanNumber=this.acountBarStore.currentLoanNumber;
        if(!accountId && !loanNumber){
            return;
        }
        if(_next.hasClass("hidden")){ //显示 creditModel结果
            $.ajax({
                type:"get",
                url:"/node/underwrittingresult",
                async:true,
                dataType: "JSON",
                data:{
                    accountId:accountId,
                    loannumber:loanNumber
                },
                success:function(res) {
                    if(!commonJs.ajaxGetCode(res)){
                        return;
                    }
                    let _creditModel = res.data;
                    _that.setState({
                        creditModel:_creditModel
                    })
                }
            })
            _next.removeClass("hidden");
        }else {
            _next.addClass("hidden");
        }
        return false;
    }
    resetLoansBox=()=>{
        let ctrDiv=$('.ctrDiv');
        ctrDiv.find('input').val('');
        ctrDiv.find('select option').removeProp('selected');
        ctrDiv.find('select option[data-show="hide"]').prop('selected',true);
        this.setState({
            time_value:null
        })
    }
    componentDidMount (){
        this.getMsg();
        this.overdueInit();
        commonJs.reloadRules();
        var h = document.documentElement.clientHeight;
        if(this.props._location!="reminder" && this.props._location!="collection" && this.props._location!="outsource"){
            $(".auto-box").css("height", h - 105);
        }
        $(".detail-top-select,.detail-top-select-bar").addClass("hidden");
        var that=this;
        //贷款信息点击
        $(".loansBox li").click(function () {
            let n=$(this).index();
            let ctrDiv=$(this).closest(".bar").find(".processing-cont-div");
            var all_li=$(this).parent().find("li");
            that.resetLoansBox();
            $('.processing-cont .set_type,.processing-cont .setChannel').addClass("hidden");
            if(n==0 || n==1){
                $('.processing-cont .set_type').removeClass("hidden");
            }
            if(n==1){
                $('.processing-cont .setChannel').removeClass("hidden");
            }
            if(n==0 || n==3 || n==4){    //转账设定付款 和 执行设定付款 显示流水号和收款账号
                ctrDiv.find(".processing-cont").find(".seria_credit").removeClass("hidden");
            }else{
                ctrDiv.find(".processing-cont").find(".seria_credit").addClass("hidden");
            }
            if(n==2){
                ctrDiv.find(".processing-cont").find(".proc-type").removeClass("hidden");
                $(".proc-type").removeClass("hidden");
            }else {
                ctrDiv.find(".processing-cont").find(".proc-type").addClass("hidden");
                $(".proc-type").addClass("hidden");
            }
            all_li.removeClass("on");
            all_li.eq(n).addClass("on");
            if(n==3||n==4){
                that.setState({
                    setupDate:"YYYY-MM-DD",
                    setupDateSecond:false
                })
            }else{
                that.setState({
                    setupDate:"YYYY-MM-DD  HH:mm:ss",
                    setupDateSecond:true
                })
            }
            let _accountId=that.userInfo2AStore.acountId;
            let _loannumber=that.state.loanMap.loanNumber;
            if(!_accountId){
                alert('未获取到_accountId！');
                return;
            }
            if(!_loannumber){
                alert('未获取到合同号！');
                return;
            }
            $.ajax({
                type:"get",
                url:"/node/approveStatus",
                async:true,
                dataType: "JSON",
                data:{
                    accountId:_accountId,
                    loannumber:_loannumber
                },
                success:function(res) {
                    if(!commonJs.ajaxGetCode(res)){
                        return;
                    }
                    var _getData = res.data;
                    if(_getData.isExist&&_getData.isExist.name=="NO"){
                        ctrDiv.removeClass("hidden");
                    }else if(_getData.isExist&&_getData.isExist.name=="YES"){
                        alert(_getData.message);
                        ctrDiv.addClass("hidden");
                    }
                    that.setState({
                        approve:_getData.typs
                    })
                }
            })
        })
        //逾期费信息点击
        $(".overdueBox li").click(function(){
            $(this).closest(".bar").find(".processing-cont-div").removeClass("hidden");
        })
        //点击页面隐藏 creditModel结果 弹窗
        $(document).bind('click',function(e){ 
            var e = e || window.event; //浏览器兼容性 
            var elem = e.target || e.srcElement; 
            while (elem) { //循环判断至跟节点，防止点击的是div子元素 
                if (elem.id && elem.id=='creditModel-ctrl-cont') { 
                    return; 
                } 
                if($(elem).closest(".creditModel-ctrl-cont").length>0){
                    return;
                }
            elem = elem.parentNode; 
            } 
            $(".creditModel-ctrl-cont").addClass("hidden");
        }); 
    }

    // 转账设定付款 保存
    transferHandle(event){
        let approve_ul=$(event.target).closest('.processing-cont');
        let req_url='',_adjustmentType="";
        let processing_type=$(event.target).closest(".processing-cont-div").prev(".loansBox").find("li.on").attr("data-type");
        let _set_amount=approve_ul.find(".newamount-inp").val();
        let _set_serialNumber=approve_ul.find(".serialNumber-inp").val();  //流水号
        let _set_creditedNumber=approve_ul.find(".creditedNumber-inp option:selected").attr('value');  //收款账号
        let set_type=approve_ul.find(".set_type option:selected").attr('value');  //转账设定付款 设定付款 type
        let set_type_text=approve_ul.find(".set_type option:selected").text();  //转账设定付款 设定付款 type 中文
        let setChannel=approve_ul.find(".setChannel option:selected").attr('value');  //设定付款 扣款渠道
        let setChannel_text=approve_ul.find(".setChannel option:selected").text();  //设定付款 扣款渠道 中文
        let _time=this.state.time_value;
        let _time_mm=new Date(_time).getTime();
        let now_time_mm=new Date().getTime();
        let _setType='';
        let _ajaxType='get';
        let data={};  //接口参数
        if(!_set_amount){
            alert("请设置金额！");
            return;
        }
        if(!_time){
            alert("请设置时间！");
            return;
        }
        if(processing_type=="transfer"){   //转账设定付款
            req_url='/node/transfer';
            _adjustmentType="";
            if(!set_type){
                alert("请选择tpye类型！");
                return;
            }
            if(_time_mm && _time_mm>now_time_mm){
                alert("设置时间不能超过当前时间！");
                return;
            }
            var result = confirm("设定扣款时间为"+_time.format('YYYY-MM-DD HH:mm:ss')+"，金额为"+_set_amount+"，请确认！");  
            if(!result){  
                return false;
            }

            if(!_set_serialNumber){
                alert("请输入流水号！");
                return;
            }
            
            if(!_set_creditedNumber){
                alert("请选择收款账号！");
                return;
            }
            data.serialNumber=_set_serialNumber;
            data.creditedNumber=_set_creditedNumber;
            data.set_type=set_type;
        }else if(processing_type=="setup"){
            req_url='/node/setup';
            _adjustmentType="";
            if(!set_type){
                alert("请选择tpye类型！");
                return;
            }
            data.set_type=set_type;
            if(!setChannel){
                alert("请选择扣款渠道！");
                return;
            }
            data.setChannel=setChannel;
            if(_time_mm && _time_mm<now_time_mm+300000){
                alert("当前可设置最早时间为"+new Date(now_time_mm+300000).getFullYear()+"-"+(new Date(now_time_mm+300000).getMonth()+1)+"-"+new Date(now_time_mm+300000).getDate()+" "+new Date(now_time_mm+300000).getHours()+":"+new Date(now_time_mm+300000).getMinutes()+":"+new Date(now_time_mm+300000).getSeconds());
                return;
            }
            var result = confirm("设定扣款时间为"+_time.format('YYYY-MM-DD HH:mm:ss')+"，金额为"+_set_amount+"，type类型为："+set_type_text+"，扣款渠道为"+setChannel_text+"，请确认！"); 
            if(!result){  
                return false;
            }
        }else if(processing_type=="adjustment"){
            _adjustmentType=approve_ul.find(".type-slct option:selected").val();
            if(!_adjustmentType){
                alert("请选择类型！");
                return;
            }
            req_url='/node/adjustment';
        }else if(processing_type=='lawsuit'){
            if(_time_mm && _time_mm>now_time_mm){
                alert("设置时间不能超过当前时间！");
                return;
            }
            var result = confirm("诉讼设定付款时间为"+_time.format('YYYY-MM-DD')+"，金额为"+_set_amount+"，请确认！");  
            if(!result){  
                return false;
            }
            req_url='/node/loan/payment/LawsuitSetup';
            _setType='litigation';
            _ajaxType='post';

            if(!_set_serialNumber){
                alert("请输入流水号！");
                return;
            }
            if(!_set_creditedNumber){
                alert("请选择收款账号！");
                return;
            }
            data.serialNumber=_set_serialNumber;
            data.creditedNumber=_set_creditedNumber;
        }else if(processing_type=='execute'){   //执行设定付款
            if(_time_mm && _time_mm>now_time_mm){
                alert("设置时间不能超过当前时间！");
                return;
            }
            var result = confirm("执行设定付款时间为"+_time.format('YYYY-MM-DD')+"，金额为"+_set_amount+"，请确认！");  
            if(!result){  
                return false;
            }
            req_url='/node/loan/payment/LawsuitSetup';
            _setType='execution';
            _ajaxType='post';

            if(!_set_serialNumber){
                alert("请输入流水号！");
                return;
            }
            if(!_set_creditedNumber){
                alert("请选择收款账号！");
                return;
            }
            data.serialNumber=_set_serialNumber;
            data.creditedNumber=_set_creditedNumber;
        }
        
        data.accountId=this.userInfo2AStore.acountId;
        data.loannumber=this.state.loanMap.loanNumber;
        data.loanNumber=this.state.loanMap.loanNumber;  //诉讼和执行保存用
        data.productNo=this.state.loanMap.productNO;  //诉讼和执行保存用
        data.set_amount=_set_amount;
        data.set_date=_time.format('YYYY-MM-DD HH:mm:ss');
        data.transferDate=_time.format('YYYY-MM-DD'); //诉讼和执行保存用
        data.adjustmentType=_adjustmentType;
        data.setAmount=_set_amount;  //诉讼和执行保存用
        data.setType=_setType //诉讼和执行保存用
        let that=this;
        $.ajax({
            type:_ajaxType,
            url:req_url,
            async:true,
            dataType: "JSON",
            data:data,
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _getData = res.data;
                alert(_getData.message);
                that.resetLoansBox();
            }
        })
    }
    //逾期费信息保存
    reduceOverdue(event){
        let that=this;
        let _parent=$(event.target).closest(".processing-cont-div");
        let _amount=_parent.find(".amount-inp").val().replace(/\s/g,"");
        if(!_amount){
            alert("请输入减免金额！");
            return;
        }
        if(_amount && isNaN(_amount)){
            alert("金额必须是数字！");
            return;
        }
        let _loannumber=this.acountBarStore.currentLoanNumber;
        if(!_loannumber){
            alert("请选择合同号！");
            return;
        }
        let _setBy=_parent.find(".setby-name").text().replace(/\s/g,"");
        if(!_setBy){
            alert("请先登录！");
            return;
        }
        let _type=_parent.find(".overdu-types option:selected").attr("name");
        let _type_text=_parent.find(".overdu-types option:selected").text();
        if(!_type){
            alert("请选择类型！");
            return;
        }
        if(_type!="CANCEL" && _amount && _amount>this.state.loanMap.totalLateFeeNotPaid){
            alert("减免金额不能大于当前逾期费剩余应还金额！");
            return;
        }
        var result = confirm("减免类型为："+_type_text+"，金额为："+_amount+"，请确认！");  
            if(!result){  
                return false;
            }
        $.ajax({
            type:"post",
            url:"/node/reduceOverdue",
            async:true,
            dataType: "JSON",
            data:{
                loanNumber:_loannumber,
                amount:_amount,
                setBy:_setBy,
                type:_type
            },
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                that.getMsg();
            }
        })
    }

    //获取跟进时间
    selectTime(value, dateString) {
        this.setState({time_value: value});
    }
    //获取罚息计算器选择时间
    cctor_selectTime(value, dateString) {
        this.setState({cctor_time: dateString});
    }
    setShowProp(val){
        this.setState({
            showProp:val,
            showProp2:val
        })
    }

    showProp(order){
        this.setState({
            showProp:true,
            _currentList:order
        })
    }
    showProp2(order){
        this.setState({
            showProp2:true,
            _currentList2:order
        })
    }
    //编辑合同状态
    editPactstatus(event){
        let $this=$(event.target);
        let $parent=$this.closest("li");
        $parent.find(".pack-status,.editPactstatus").addClass("hidden");
        $parent.find(".pack-status-select,.savePactstatus,.cancelEditPactstatus").removeClass("hidden");
    }
    //取消编辑合同状态
    cancelEditPactstatus(event){
        let $this=$(event.target);
        let $parent=$this.closest("li");
        $parent.find(".pack-status-select,.savePactstatus,.cancelEditPactstatus").addClass("hidden");
        $parent.find(".pack-status,.editPactstatus").removeClass("hidden");
    }
    //保存合同状态
    savePactstatus(type,event){
        let _that=this;
        let _data={},_url,_type;
        _data.loannumber=this.state.loanMap.loanNumber;
        let _selectedVal=$(event.target).closest("li").find(".pack-status-select option:selected").attr("value");
        if(type=="ProcessingStatus"){   //Processing状态
            _url="/node/changeProcessingStatus";
            _data.status=_selectedVal;
            _type="post";
            _data.customerId=this.userInfo2AStore.customerId;
            _data.accountId=this.userInfo2AStore.acountId;
            if(this.state.loanMap && this.state.loanMap.loan_principal){
                _data.amount=this.state.loanMap.loan_principal;
            }
        }
        if(type=="PhoneLoanPurpose"){   //电核目的
            _url="/node/savePhoneLoanPurpose";
            _data.phoneLoanPurpose=_selectedVal;
            _type="get";
        }
        
        $.ajax({
            type:_type,
            url:_url,
            async:true,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _getData = res.data;
                alert(_getData.message);
                _that.getMsg();
            }
        });
        this.cancelEditPactstatus(event);
    }
    //罚息计算
    showCalculator(){
        $(".calculator-pop").removeClass("hidden");
    }
    //
    hideCalculator(){
        $(".calculator-pop").addClass("hidden");
    }
    //计算
    calculatorHandle(){
        let _loannumber=$(".calculator .cctor_loanNo").val();
        let _periods=$(".calculator .cctor_periods").val();
        let _time=this.state.cctor_time;
        if(!_loannumber){
            alert("请输入贷款号！");
            return;
        }
        if(!_periods || isNaN(_periods)){
            alert("请输入期数，且必须是数字！");
            return;
        }
        if(!_time){
            alert("请输入日期！");
            return;
        }
        let that=this;
        $.ajax({
            type:"post",
            url:"/node/calculate",
            async:true,
            dataType: "JSON",
            data:{
                loanNumber:_loannumber,
                targetDate:_time,
                installNumber:_periods
            },
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        overdueFee:""
                    })
                    return;
                }
                let _getData = res.data;
                that.setState({
                    overdueFee:_getData.overdueFee
                })
            }
        });
    }
    render() {
        var _loanMap = this.state.loanMap;
        let loanInfoDTOs=this.state.loanInfoDTOs;
        var processingStatus = _loanMap.processingInfoDTO?_loanMap.processingInfoDTO.loanProcessingStatus.name:"";
        let phoneLoanPurpose=_loanMap.processingInfoDTO?_loanMap.processingInfoDTO.phoneLoanPurpose:"";  //电核目的
        var loanStatus = _loanMap.loanStatus?_loanMap.loanStatus.name:"";
        var userName=$(".menu-botton .adminCtrl .ctrl-t").text();
        let current_productNO=this.state.current_productNO?this.state.current_productNO:"";

        let accountId = this.userInfo2AStore.acountId;
        let {loanNumber}=this.state;
        let customerId=this.userInfo2AStore.customerId;
        return (
            <div className="mt10 auto-box pr5">
                <div className="bar">
                    <table width="100%" className="loan-table">
                        <tbody>
                            <tr>
                                <th>贷款号码</th>
                                <th>产品</th>
                                <th>签订时间</th>
                                <th></th>
                                <th></th>
                            </tr>
                            {
                                (loanInfoDTOs&&loanInfoDTOs.length>0)?loanInfoDTOs.map((rpy,index)=>{
                                    return <tr key={index} onClick={this.loanDetail.bind(this,rpy.loanNumber)}>
                                                <td>{commonJs.is_obj_exist(rpy.loanNumber)}</td>
                                                <td className="productNO">{commonJs.is_obj_exist(rpy.productNO)}</td>
                                                <td>{commonJs.is_obj_exist(rpy.createdAt)}</td>
                                                <td className="yellow-font">{(rpy.esignInfoDTOs && rpy.esignInfoDTOs.length>0)?"重签":"-"}</td>
                                                <td className="yellow-font">
                                                    <a target="_blank" className="mr10" href={"/node/down/loan?accountId="+this.userInfo2AStore.acountId+"&loannumber="+rpy.loanNumber}>下载</a>
                                                    {
                                                        (rpy.loanStatus&&rpy.loanStatus.name=="paid_off")?<a target="_blank" 
                                                            href={"/node/loan/settle/proof?accountId="+this.userInfo2AStore.acountId+"&loanNumber="+rpy.loanNumber+"&productNo="+rpy.productNO}>结清</a>:""
                                                    }
                                                </td>
                                            </tr>
                                }):<tr><td>暂未查到数据...</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 on">
                        PROSEESING
                    </h2>
                    <div className="bar mt5 clearfix auto">
                        <ul className="pact-msg">
                            <li className="pact-date">
                                <p className="msg-tit">合同签订日期</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.processingInfoDTO?_loanMap.processingInfoDTO.esign_date:"")}>
                                    {commonJs.is_obj_exist(_loanMap.processingInfoDTO?_loanMap.processingInfoDTO.esign_date:"")}
                                </b>
                            </li>
                            <li style={{"overflow":"visible"}}>
                                <p className="msg-tit">underWrittingResult</p>
                                <div className="creditModel-ctrl-div relative">
                                    <b className="btn-white creditModel-ctrl-btn block" id="creditModel-ctrl-cont" onClick={this.get_creditModel.bind(this)}>获取creditModel结果</b>
                                    <ul className="creditModel-ctrl-cont absolute hidden ul-list">
                                        <li>
                                            <p className="cred-tit">结果</p>
                                            <strong className="cred-cont" title={commonJs.is_obj_exist(this.state.creditModel.result)}>
                                                {commonJs.is_obj_exist(this.state.creditModel.result)}
                                            </strong>
                                        </li>
                                        <li>
                                            <p className="cred-tit">等级</p>
                                            <strong className="cred-cont" title={commonJs.is_obj_exist(this.state.creditModel.grade)}>{commonJs.is_obj_exist(this.state.creditModel.grade)}</strong>
                                        </li>
                                        <li>
                                            <p className="cred-tit">原因</p>
                                            <strong className="cred-cont" title={commonJs.is_obj_exist(this.state.creditModel.reason)}>{commonJs.is_obj_exist(this.state.creditModel.reason)}</strong>
                                        </li>
                                        <li>
                                            <p className="cred-tit">最大金额/12</p>
                                            <strong className="cred-cont" title={commonJs.is_obj_exist(this.state.creditModel.loan_amount_12)}>{commonJs.is_obj_exist(this.state.creditModel.loan_amount_12)}</strong>
                                        </li>
                                        <li>
                                            <p className="cred-tit">最大金额/18</p>
                                            <strong className="cred-cont" title={commonJs.is_obj_exist(this.state.creditModel.loan_amount_18)}>{commonJs.is_obj_exist(this.state.creditModel.loan_amount_18)}</strong>
                                        </li>
                                        <li>
                                            <p className="cred-tit">最大金额/24</p>
                                            <strong className="cred-cont" title={commonJs.is_obj_exist(this.state.creditModel.loan_amount_24)}>{commonJs.is_obj_exist(this.state.creditModel.loan_amount_24)}</strong>
                                        </li>
                                        <li>
                                            <p className="cred-tit">最大金额/36</p>
                                            <strong className="cred-cont" title={commonJs.is_obj_exist(this.state.creditModel.loan_amount_36)}>{commonJs.is_obj_exist(this.state.creditModel.loan_amount_36)}</strong>
                                        </li>
                                        <li>
                                            <p className="cred-tit">选择金额/期数</p>
                                            <strong className="cred-cont">
                                                {commonJs.is_obj_exist(this.state.creditModel.selected_amount)}/{commonJs.is_obj_exist(this.state.creditModel.period)}
                                            </strong>
                                        </li>
                                        <li>
                                            <p className="cred-tit">模型结果时间</p>
                                            <strong className="cred-cont">
                                                {commonJs.is_obj_exist(this.state.creditModel.model_dt)}
                                            </strong>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <li>
                                <p className="msg-tit">合同号</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.loanNumber)}>{commonJs.is_obj_exist(_loanMap.loanNumber)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">更改时间</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.processingInfoDTO?_loanMap.processingInfoDTO.update_date:"")}>{commonJs.is_obj_exist(_loanMap.processingInfoDTO?_loanMap.processingInfoDTO.update_date:"")}</b>
                            </li>
                            <li>
                                <p className="msg-tit">贷款金额</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.loan_principal)}>{commonJs.is_obj_exist(_loanMap.loan_principal)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">贷款状态</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(loanStatus)}>{commonJs.is_obj_exist(loanStatus)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">放款成功日期</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.fundingSuccessDate)}>{commonJs.is_obj_exist(_loanMap.fundingSuccessDate)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">当前剩余本金</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.total_principal)}>{commonJs.is_obj_exist(_loanMap.total_principal)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">当前剩余利息</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.total_interest)}>{commonJs.is_obj_exist(_loanMap.total_interest)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">当前逾期费剩余应还</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.totalLateFeeNotPaid)}>{commonJs.is_obj_exist(_loanMap.totalLateFeeNotPaid)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">当前总逾期费</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.totalLateFee)}>{commonJs.is_obj_exist(_loanMap.totalLateFee)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">当前总逾期金额</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.total_past_due_amount)}>{commonJs.is_obj_exist(_loanMap.total_past_due_amount)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">当前总逾期本金</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.total_past_due_principal)}>{commonJs.is_obj_exist(_loanMap.total_past_due_principal)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">当前总逾期利息</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.total_past_due_interest)}>{commonJs.is_obj_exist(_loanMap.total_past_due_interest)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">提前结清金额</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.max_amount)}>{commonJs.is_obj_exist(_loanMap.max_amount)}</b>
                            </li>
                            {/* <li>
                                <p className="msg-tit">当前最大设定还款额</p>
                                <b className="msg-cont" title={(_loanMap.max_amount&&_loanMap.totalLateFeeNotPaid)?(_loanMap.max_amount+_loanMap.totalLateFeeNotPaid):"-"}>
                                    {(typeof(_loanMap.max_amount)!="undefind"&&typeof(_loanMap.totalLateFeeNotPaid)!="undefind")
                                    ?
                                    ((_loanMap.max_amount+_loanMap.totalLateFeeNotPaid)>0?((_loanMap.max_amount+_loanMap.totalLateFeeNotPaid).toFixed(2)):(_loanMap.max_amount+_loanMap.totalLateFeeNotPaid))
                                    :
                                    "-"}
                                </b>
                            </li> */}
                            <li>
                                <p className="msg-tit">前期费金额</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.upfront_fee)}>{commonJs.is_obj_exist(_loanMap.upfront_fee)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">扣款状态</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.upfront_fee_status)}>{commonJs.is_obj_exist(_loanMap.upfront_fee_status)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">前期费扣款时间</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(_loanMap.upfrontFeeUpdatedAt)}>{commonJs.is_obj_exist(_loanMap.upfrontFeeUpdatedAt)}</b>
                            </li>
                            <li data-btn-rule="LOAN:RULE:MODIFY:PROCESSING:STATUS">
                                <p className="msg-tit">Processing状态</p>
                                <b className="msg-cont">
                                    <span className="left mr10 pack-status" title={commonJs.is_obj_exist(_loanMap.phoneLoanPurpose)}>{commonJs.is_obj_exist(_loanMap.phoneLoanPurpose)}</span>
                                    <a className="left editPactstatus" id='editPactstatus1' onClick={this.editPactstatus.bind(this)}><i></i></a>
                                    <select name="" id="packStatusSelect1" className="left select-gray pack-status-select mr10 hidden" style={{"width":"80px"}}>
                                        <option value="WITHDRAW">撤销</option>
                                        <option value="DECLINE">拒绝</option>
                                        <option value="CANCEL">取消</option>
                                    </select>
                                    <a className="left savePactstatus mr10 hidden" id='ProcessingStatus' onClick={this.savePactstatus.bind(this,"ProcessingStatus")}><i></i></a>
                                    <a className="left cancelEditPactstatus hidden" id='ProcessingStatusCancle' onClick={this.cancelEditPactstatus.bind(this)}><i></i></a>
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">贷款目的</p>
                                <b className="msg-cont" title={_loanMap.processingInfoDTO?commonJs.is_obj_exist(_loanMap.processingInfoDTO.purpose):"-"}>
                                    {_loanMap.processingInfoDTO?commonJs.is_obj_exist(_loanMap.processingInfoDTO.purpose):"-"}
                                </b>
                            </li>
                            <li>
                                <p className="msg-tit">电核目的</p>
                                <b className="msg-cont">
                                    <span className="left mr10 pack-status" title={commonJs.is_obj_exist(phoneLoanPurpose)}>{commonJs.is_obj_exist(phoneLoanPurpose)}</span>
                                    <a className="left editPactstatus" id='editPactstatus2' onClick={this.editPactstatus.bind(this)}><i></i></a>
                                    <select name="" id="packStatusSelect2" className="left select-gray pack-status-select mr10 hidden" style={{"width":"80px"}}>
                                        {
                                            (_loanMap.creditPurposesEnum && _loanMap.creditPurposesEnum.length>0)?_loanMap.creditPurposesEnum.map((repy,i)=>{
                                                return <option key={i} name={commonJs.is_obj_exist(repy.name)} value={commonJs.is_obj_exist(repy.value)} title={commonJs.is_obj_exist(repy.displayName)}>
                                                    {commonJs.is_obj_exist(repy.displayName)}
                                                </option>
                                            }):<option>无数据</option>
                                        }
                                        
                                    </select>
                                    <a className="left savePactstatus mr10 hidden" id='PhoneLoanPurpose' onClick={this.savePactstatus.bind(this,"PhoneLoanPurpose")}><i></i></a>
                                    <a className="left cancelEditPactstatus hidden" id='PhoneLoanPurposeCancle' onClick={this.cancelEditPactstatus.bind(this)}><i></i></a>
                                </b>
                            </li>
                        </ul>
                    </div>
                    <div className="bar mt5 clearfix">
                        <div className="loan-tit">
                            <span className="loan_number left pl20 pr20">贷款信息 |</span>
                        </div>
                        {/* <ul className={(current_productNO=="1A" || current_productNO=="2A")?"processing-tab loansBox ml20":"hidden"}> */}
                        <ul className='processing-tab loansBox ml20'>
                            <li className="border-top-left-radius border-bottom-left-radius" data-type="transfer" id='transfer' data-btn-rule="RULE:DETAIL:LOAN:TRANSFER:CHARGE">转账设定付款</li>
                            <li data-type="setup" data-btn-rule="RULE:DETAIL:LOAN:SET:CHARGE" id='setup'>设定付款</li>
                            <li className="border-top-right-radius border-bottom-right-radius" data-type="adjustment" id='adjustment' data-btn-rule="RULE:DETAIL:LOAN:SET:ADJUST">设定调帐</li>
                            <li className="border-top-right-radius border-bottom-right-radius" data-type="lawsuit" id='lawsuit' data-btn-rule='LOAN:PAYMENT:LAWSUITSETUP'>诉讼设定付款</li>
                            <li className="border-top-right-radius border-bottom-right-radius" data-type="execute" id='execute' data-btn-rule='LOAN:PAYMENT:LAWSUITSETUP'>执行设定付款</li>
                        </ul>
                        <div className="processing-cont-div ctrDiv clearfix hidden">
                            <ul className="processing-cont ml20">
                            <li className='seria_credit'>
                                    <p className="proc-cont-tit">流水号</p>
                                    <input type="text" className="input serialNumber-inp" id='serialNumber' placeholder="请输入" />
                                </li>
                                <li className='seria_credit'>
                                    <p className="proc-cont-tit">收款账号</p>
                                    <select name="" id="creditedNumber" className="select-gray creditedNumber-inp" style={{width:'180px'}}>
                                        <option value="" data-show="hide">请选择</option>
                                        <option value="123907429910313">123907429910313</option>
                                        <option value="123907429910708">123907429910708</option>
                                    </select>
                                </li>
                                <li className='set_type'>
                                    <p className="proc-cont-tit">tpye</p>
                                    <select name="" id="set_type" className="select-gray" style={{width:'180px'}}>
                                        <option value="" data-show="hide">请选择</option>
                                        <option value="prepayment">提前还清</option>
                                        <option value="active">按期还款</option>
                                    </select>
                                </li>
                                <li className='setChannel'>
                                    <p className="proc-cont-tit">扣款渠道</p>
                                    <select name="" id="setChannel" className="select-gray" style={{width:'180px'}}>
                                        <option value="" data-show="hide">请选择</option>
                                        <option value="cpcnDebit">中金支付</option>
                                        <option value="kftDebit">快付通扣款</option>
                                        <option value="jdDebit">京东扣款</option>
                                        <option value="default">默认渠道</option>
                                        <option value="cpcnSignDebit">中金支付工行协议扣款</option>
                                    </select>
                                </li>
                                <li>
                                    <p className="proc-cont-tit">new amount</p>
                                    <input type="text" className="input newamount-inp" id='newamount' placeholder="请输入" />
                                </li>
                                <li>
                                <p className="proc-cont-tit">setup date</p>
                                    <DatePicker
                                        onChange={this.selectTime.bind(this)}
                                        format={this.state.setupDate}
                                        showTime={this.state.setupDateSecond}
                                        value={this.state.time_value}
                                    />
                                </li>
                                <li className="proc-type hidden">
                                    <p className="proc-cont-tit">type</p>
                                    <select name="" id="typeSlct" className="select-gray type-slct">
                                        <option value="" data-show="hide">请选择</option>
                                        {
                                            this.state.approve.length>0 ? this.state.approve.map(function (types,index) {
                                                    return <option value={types.name} key={index}>{types.displayName}</option>
                                                },this) : ""
                                        }
                                    </select>
                                </li>
                                <li><button className="btn-blue mr20 mt30" id='transferSave' onClick={this.transferHandle.bind(this)}>保存</button></li>
                            </ul>
                        </div>
                        <div className="bar border-top clearfix">
                            <a href={"/deductions?accountID="+accountId+"&loannumber="+loanNumber+"&customerId="+customerId+"&type="+0+"&processingStatus="+processingStatus} target="_bank" className="likes-btn left ml15 ml20 mt7 withhold-btn" data-btn-rule="RULE:DETAIL:LOAN:CHARGE:LIST">扣款列表</a>
                            <a href={"/deductions?accountID="+accountId+"&loannumber="+loanNumber+"&customerId="+customerId+"&type="+1+"&processingStatus="+processingStatus} target="_bank" className="likes-btn left ml15 mt7" data-btn-rule="RULE:DETAIL:LOAN:ADJUST:RECORD">调账历史记录</a>
                            <a href={"/deductions?accountID="+accountId+"&loannumber="+loanNumber+"&customerId="+customerId+"&type="+2+"&processingStatus="+processingStatus} target="_bank" className="likes-btn left ml15 mt7" data-btn-rule="RULE:DETAIL:LOAN:BLIND:RECORD">blind记录</a>
                            <a href={"/deductions?accountID="+accountId+"&loannumber="+loanNumber+"&customerId="+customerId+"&type="+3+"&processingStatus="+processingStatus} target="_bank" className="likes-btn left ml15 mt7" data-btn-rule='LOAN:LAWSUITPAYMENT:RECORD'>诉讼扣款记录</a>
                            <a href={"/deductions?accountID="+accountId+"&loannumber="+loanNumber+"&customerId="+customerId+"&type="+4+"&processingStatus="+processingStatus} target="_bank" className="likes-btn left ml15 mt7" data-btn-rule='LOAN:LAWSUITPAYMENT:RECORD'>执行扣款记录</a>
                        </div>
                    </div>
                    <div className="bar mt5 clearfix">
                        <div className="loan-tit">
                            <span className="loan_number left pl20 pr20">逾期费信息 |</span>
                        </div>
                        <ul className={(current_productNO=="1A" || current_productNO=="2A")?"processing-tab overdueBox ml20":"processing-tab overdueBox ml20 hidden"}>
                            <li className="border-radius" data-btn-rule="RULE:DETAIL:LOAN:OVERDUE:SUB">滞纳金减免</li>
                        </ul>
                        <div className="processing-cont-div clearfix hidden">
                            <ul className="processing-cont ml20">
                                <li>
                                    <p className="proc-cont-tit">金额</p>
                                    <input type="text" className="input amount-inp" id='amount2' placeholder="请输入" />
                                </li>
                                <li>
                                <p className="proc-cont-tit">类型</p>
                                    <select className="select-gray overdu-types" name="" id="overduTypes" style={{"width":"150px"}}>
                                        <option value="" hidden>请选择类型</option>
                                        {
                                            (this.state.overdueTypes && this.state.overdueTypes.length>0) ? this.state.overdueTypes.map((repy,i)=>{
                                                return <option key={i} value={commonJs.is_obj_exist(repy.value)} name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                            }) : <option value="" name=""> </option>
                                        }
                                    </select>
                                </li>
                                <li>
                                    <p className="proc-cont-tit">set_by</p>
                                    <span className="setby-name content-text">{userName}</span>
                                </li>
                            </ul>
                            <button className="btn-blue right mr20 mt30" id='reduceOverdueSave' onClick={this.reduceOverdue.bind(this)}>保存</button>
                        </div>
                        <div className="bar border-top clearfix">
                            <a className="likes-btn left ml15 ml20 mt7" data-btn-rule="RULE:DETAIL:LOAN:OVERDUE:LIST" onClick={this.showProp2.bind(this,1)}>逾期费列表</a>
                            <a className="likes-btn left ml15 mt7" data-btn-rule="RULE:DETAIL:LOAN:OVERDUE:SET:RECORD" onClick={this.showProp2.bind(this,2)}>设定记录</a>
                            <a className="likes-btn left ml15 mt7" data-btn-rule="RULE:DETAIL:LOAN:OVERDUE:CHARGE:RECORD" onClick={this.showProp2.bind(this,3)}>逾期费扣款记录</a>
                            <a className="likes-btn left ml15 mt7" data-btn-rule="RULE:OVERDUE:FEE:CALCULATOR" onClick={this.showCalculator.bind(this)}>罚息计算</a>
                        </div>
                        {
                            this.state.showProp2 ? <OverdueMsg_pop _loannumber={_loanMap.loanNumber} showApprove={this.setShowProp.bind(this)} currentList={this.state._currentList2} />:""
                        }
                    </div>
                </div>
                {/* 罚息计算 弹窗 */}
                <div className="calculator-pop hidden">
                        <div className="tanc_bg"></div>
                        <div className="calculator bar">
                            <i className="close-cctor" onClick={this.hideCalculator.bind(this)}></i>
                            <dl className="caltor-dl mt40">
                                <dt>贷款号：</dt>
                                <dd><input className="input cctor_loanNo" id='cctorLoanNo' type="text" style={{"width":"274px"}} /></dd>
                            </dl>
                            <dl className="caltor-dl mt10">
                                <dt>期&nbsp;&nbsp;&nbsp;数：</dt>
                                <dd><input className="input cctor_periods" id='cctorPeriods' type="number" style={{"width":"274px"}} /></dd>
                            </dl>
                            <dl className="caltor-dl mt10">
                                <dt>日&nbsp;&nbsp;&nbsp;期：</dt>
                                <dd>
                                    <DatePicker
                                        onChange={this.cctor_selectTime.bind(this)}
                                        format="YYYY-MM-DD"
                                    />
                                </dd>
                            </dl>
                            <button className="block btn-blue ml20 mt10" id='calculatorHandle' style={{"width":"334px"}} onClick={this.calculatorHandle.bind(this)}>计算</button>
                            <dl className="caltor-dl mt10">
                                <dt>结&nbsp;&nbsp;&nbsp;果：</dt>
                                <dd><div className="input cctor_result" style={{"width":"274px"}}>{(this.state.overdueFee || this.state.overdueFee==0)?this.state.overdueFee:"-"}</div></dd>
                            </dl>
                        </div>
                </div>
            </div>
        );
    }
};
function range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
export default Pact;