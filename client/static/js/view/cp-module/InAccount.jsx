//collection && 委外 设定扣款及入账功能（还款入账，设定付款等功能模块）
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import {configure} from "mobx";
import { DatePicker,Tabs } from 'antd';
const { TabPane } = Tabs;
configure({enforceActions:true})

@inject('allStore') @observer
class InAcount extends React.Component {
    constructor(props){
        super(props);
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.topBindNumberStore=this.props.allStore.TopBindNumberStore;  //顶部绑定（完成）数显示-通用 2A portal
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2a portal accountid白色信息条bar展示
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息 
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            squareAmount:''
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.resetInAcount();
    }
    thisOnChange(event){
        if(this.props.onChange){  //正常切换select传值selected的对象到指定组件
            let _val=$(event.target).find("option:selected").attr("value");
            let _name=$(event.target).find("option:selected").attr("name");
            let _text=$(event.target).find("option:selected").text();
            let _selectedObj={
                displayName:_text,
                name:_name,
                value:_val
            }
            this.props.onChange(_selectedObj);
        }
    }
    TabsChange=()=>{
        this.resetInAcount();
    }
    // 设定付款选择时间
    selectPayTime(value, dateString) {
        this.setState({time_value: value});
    }
    // 线下还款部分入账
    chargeTime(value, dateString) {
        this.setState({chargeTime: value});
    }
    //实际到账日期
    inAcountTime(value, dateString) {
        this.setState({actualDueDate: value});
    }
    //保存设定付款
    transferHandle(event){
        let that=this;
        let approve_ul=$(event.target).closest('.processing-cont');
        let _set_amount=approve_ul.find(".newamount-inp").val();
        let installmentNumber=approve_ul.find(".installmentNumber-inp").val();

        let setChannel=approve_ul.find(".setChannel option:selected").attr('value');  //设定付款 扣款渠道
        let setChannel_text=approve_ul.find(".setChannel option:selected").text();  //设定付款 扣款渠道 中文
        
        let _time=this.state.time_value;

        let _time_mm=new Date(_time).getTime();
        let now_time_mm=new Date().getTime();
        let _setType=this.state.setType;
        let _setTypeName=this.state.setTypeName;
        var result=true;
        let _parems={};
        if(!_setType){
            alert("请选择设定的类型！");
            return;
        }
        if((_setType=='active'||_setType=='security_cost') && !_set_amount){
            alert("请设置金额！");
            return;
        }
        if(_setType=='security_cost' && !installmentNumber){
            alert("请填写期数！");
            return;
        }
        if(_setType!='security_cost' && !_time_mm){
            alert("请设置时间！");
            return;
        }
        if(!setChannel){
            alert("请选择扣款渠道！");
            return;
        }
        if(_time_mm && _time_mm<=now_time_mm+600000){
            alert('所选时间必须大于当前时间10分钟！');
            return;
        }
        let rowData=this.labelBoxStore.rowData?this.labelBoxStore.rowData:{};
        _parems={
            accountId:rowData.accountId,
            productNo:rowData.cooperationFlag,
            loannumber:rowData.loanNumber,
            set_date:(_setType!='security_cost') && _time?_time.format('YYYY-MM-DD HH:mm:ss'):'',
            set_type:_setType,
            installmentNumber:installmentNumber,
            isCooperation:true,
            setChannel:setChannel
        }
        if(_setType=='active'){
            result= confirm("设定扣款时间为"+_time.format('YYYY-MM-DD HH:mm:ss')+"，金额为"+_set_amount+"，扣款渠道为"+setChannel_text+"，请确认！");  
            _parems.set_amount=_set_amount
        }else if(_setType=='security_cost'){
            result= confirm("设定扣款金额为"+_set_amount+"，期数为"+installmentNumber+"，扣款渠道为"+setChannel_text+"，请确认！");  
            _parems.set_amount=_set_amount
        }else{
            result= confirm("设定扣款时间为"+_time.format('YYYY-MM-DD HH:mm:ss')+"，设定类型为"+_setTypeName+"，扣款渠道为"+setChannel_text+"，请确认！");  
        }
        if(!result){  
            return false;
        }
        $.ajax({
            type:"get",
            url:'/node/setup',
            async:true,
            dataType: "JSON",
            data:_parems,
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _getData = res.data;
                alert(_getData.message);
                approve_ul.find(".newamount-inp").val("");
                that.resetInAcount();
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //设定扣款类型
    setTyprHandle=(event)=>{
        let $val=$(event.target).find('option:selected').attr("value");
        let $valName=$(event.target).find('option:selected').text();
        this.setState({
            setType:$val,
            setTypeName:$valName
        })
    }
    //重置tab框数据
    resetInAcount(){
        this.setState({
            chargeTime:null,
            actualDueDate:null,
            time_value:null,
            squareAmount:''
        })
        $('.processing-cont input').val('');
        $('.processing-cont').find("option").removeProp("selected");
        $('.processing-cont').find("option:eq(0)").prop("selected","selected");
        $('.creditedNumber').find("option").removeProp("selected");
        $('.creditedNumber').find("option[data-show='hide']").prop("selected","selected");
        
    }
    //确认入账
    chargeSure(){
        let repaymentTypeEnums=$('.repaymentTypeEnums option:selected').attr('data-name');
        if(!repaymentTypeEnums){
            alert('请先选择入账类型！');
            return;
        }
        let mount=$('.chargeMount').val();
        let chargeTime=this.state.chargeTime;
        if(!mount){
            alert('请填写还款金额！');
            return;
        }
        let serialNumber=$('.serialNumber').val();
        if(!serialNumber){
            alert('请输入流水号！');
            return;
        }
        let creditedNumber=$('.creditedNumber option:selected').attr('value');
        if(!creditedNumber){
            alert('请选择收款账号！');
            return;
        }
        if(!chargeTime){
            alert('请选择入账时间！');
            return;
        }
        let actualDueDate=this.state.actualDueDate;
        if(!actualDueDate){
            alert('请选择实际到账时间！');
            return;
        }
        let that=this;
        let _chargeTime=chargeTime.format('YYYY-MM-DD');
        let _actualDueDate=actualDueDate.format('YYYY-MM-DD');
        let _now=new Date().getTime();
        let _chargeTime_time=new Date(_chargeTime).getTime();
        if(_chargeTime_time>_now){
            alert("所选时间必须小于当前时间！");
            return;
        }
        let result= confirm(`还款入账时间为${_chargeTime}，金额为${mount}，实际到账时间${_actualDueDate}请确认！`);  
        if(!result){  
            return;
        }
        $.ajax({
            type:"post",
            url:'/node/collection/offLinePayment',
            async:true,
            dataType: "JSON",
            data:{
                amount:mount,
                repayDate:_chargeTime,
                actualDueDate:_actualDueDate,
                loanNumber:this.acountBarStore.currentLoanNumber,
                repaymentTypeEnum:repaymentTypeEnums,
                serialNumber:serialNumber,
                creditedNumber:creditedNumber
            },
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _getData = res.data;
                alert(_getData.message);
                that.resetInAcount();
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //取消线下还款入账
    cancleInAcount(){
        let amount=$('.cancleAmount').val();
        if(!amount){
            alert('请填写取消金额！');
            return;
        }
        $.ajax({
            type:"post",
            url:'/node/collection/cancelPayment',
            async:true,
            dataType: "JSON",
            data:{
                amount:amount,
                loanNumber:this.acountBarStore.currentLoanNumber,
            },
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _getData = res.data;
                alert(_getData.message);
                that.resetInAcount();
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //结清金额查询
    squareAmount(){
        let that=this;
        let rowData=cpCommonJs.opinitionArray(this.labelBoxStore.rowData);
        $.ajax({
            type:"post",
            url:'/node/collection/searchRepaymentAmount',
            async:true,
            dataType: "JSON",
            data:{
                product_no:rowData.productNo,
                loan_number:rowData.loanNumber,
                name:rowData.userName,
                phone:this.userInfo2AStore.primaryPhone,
            },
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _getData = res.data;
                let data=cpCommonJs.opinitionArray(_getData.data);
                that.setState({
                    squareAmount:data?data:''
                })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    render() {
        let topBindNumberStore=this.topBindNumberStore.bindNumberData;
        let _hash=window.location.hash;
        let isShow=Boolean(_hash=='#/Collection/collection');
        let inClude17c='';
        let loginName=this.commonStore.loginname;
        loginName=loginName.toLowerCase();
        if(loginName.indexOf('17c')>=0){
            inClude17c=true;
        }else{
            inClude17c=false;
        }
        return (
            <div className="bar mt10" id='inAcount'>
                <Tabs defaultActiveKey={(isShow && inClude17c)?'2':'1'} onChange={this.TabsChange}>
                    {
                        (isShow && inClude17c) ? '':
                        <TabPane tab="还款入账" key="1">
                        <div className="processing-cont-div mt5 clearfix bar">
                            <ul className="processing-cont ml20 clearfix">
                                <li>
                                    <p className="proc-cont-tit">类型</p>
                                    <select className="select-gray repaymentTypeEnums" id='repaymentTypeEnums' style={{"width":"100px"}} >
                                        <option value="" hidden>请选择</option>
                                        {
                                            (topBindNumberStore && topBindNumberStore.repaymentTypeEnums && topBindNumberStore.repaymentTypeEnums.length>0) ? topBindNumberStore.repaymentTypeEnums.map((repy,i)=>{
                                            return <option key={i} data-name={repy.name} data-value={repy.value}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                            }):<option data-name=""> </option>
                                        }
                                    </select>
                                </li>
                                <li>
                                    <p className="proc-cont-tit">还款金额</p>
                                    <input type="number" className="input chargeMount" id='chargeMount' onKeyPress={commonJs.handleKeyPress.bind(this,null)} placeholder="请输入" />
                                </li>
                                <li>
                                    <p className="proc-cont-tit">流水号</p>
                                    <input type="text" className="input serialNumber" id='serialNumber' placeholder="请输入" />
                                </li>
                                <li>
                                    <p className="proc-cont-tit">收款账号</p>
                                    <select name="" id="creditedNumber" className="select-gray creditedNumber" style={{width:'180px'}}>
                                        <option value="" data-show="hide">请选择</option>
                                        <option value="123907429910313">123907429910313</option>
                                        <option value="123907429910708">123907429910708</option>
                                    </select>
                                </li>
                                <li id='chargeTime'>
                                    <p className="proc-cont-tit">入账日期</p>
                                    <DatePicker
                                        onChange={this.chargeTime.bind(this)}
                                        value={this.state.chargeTime}
                                        format="YYYY-MM-DD"
                                    />
                                </li>
                                <li id='actualDueDate'>
                                    <p className="proc-cont-tit">实际到账时间</p>
                                    <DatePicker
                                        onChange={this.inAcountTime.bind(this)}
                                        value={this.state.actualDueDate}
                                        format="YYYY-MM-DD"
                                    />
                                </li>
                                <li>
                                    <button className="btn-blue mt30" id='chargeSure' onClick={this.chargeSure.bind(this)}>确定</button>
                                </li>
                            </ul>
                            </div>
                        </TabPane>
                    }
                    <TabPane tab="设定付款" key="2">
                        <div className="processing-cont-div mt5 clearfix bar">
                            <ul className="processing-cont ml20">
                            <li>
                                <p className="proc-cont-tit">设定的类型</p>
                                <select className="select-gray set_type" id='setTypr' style={{"width":"100px"}} onChange={this.setTyprHandle}>
                                    <option value="" hidden>请选择</option>
                                    <option value="prepayment">提前还清</option>
                                    <option value="active">主动还款</option>
                                    <option value="security_cost">担保费扣款</option>
                                </select>
                            </li>
                            {
                                (this.state.setType&&(this.state.setType=="active"|| this.state.setType=='security_cost'))?
                                    <li>
                                        <p className="proc-cont-tit">new amount</p>
                                        <input type="text" className="input newamount-inp" id='newamount' placeholder="请输入" />
                                    </li>
                                :""
                            }
                            {
                                (this.state.setType&&this.state.setType=="security_cost")?
                                    <li>
                                        <p className="proc-cont-tit">期数</p>
                                        <input type="text" className="input installmentNumber-inp" id='installmentNumber' placeholder="请输入" />
                                    </li>
                                :""
                            }
                            {
                                (this.state.setType&&this.state.setType!="security_cost")?
                                <li id='payTime'>
                                    <p className="proc-cont-tit">setup date</p>
                                    <DatePicker
                                        onChange={this.selectPayTime.bind(this)}
                                        value={this.state.time_value}
                                        format="YYYY-MM-DD HH:mm:ss"
                                        showTime
                                    />
                                </li>:''
                            }

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
                                    <button className="btn-blue right mr20 mt30" id='transfer' onClick={this.transferHandle.bind(this)}>保存</button>
                                </li>
                            </ul>
                        </div>
                    </TabPane>
                    {
/*                         (isShow && inClude17c) ? '':
                        <TabPane tab="取消入账" key="3">
                            <div className="processing-cont-div mt5 clearfix bar">
                                <ul className="processing-cont ml20 clearfix">
                                    <li>
                                        <p className="proc-cont-tit">金额</p>
                                        <input type="number" className="input cancleAmount" id='cancleAmount' onKeyPress={commonJs.handleKeyPress.bind(this,null)} placeholder="请输入" />
                                    </li>
                                    <li>
                                        <button className="btn-blue mt30" id='cancleInAcount' onClick={this.cancleInAcount.bind(this)}>确定</button>
                                    </li>
                                </ul>
                            </div>
                        </TabPane> */
                    }
                    {
                        (isShow && inClude17c) ? '':
                        <TabPane tab="查询结清金额" key="4">
                            <div className="processing-cont-div mt5 clearfix bar">
                                <button className="btn-blue ml20 left mr20" id='squareAmount' onClick={this.squareAmount.bind(this)}>查询</button>
                                <span className='left mt5'>结清金额：{commonJs.is_obj_exist(this.state.squareAmount)}</span>
                            </div>
                        </TabPane>
                    }
                </Tabs>
            </div>
        );
    }
};


export default InAcount;