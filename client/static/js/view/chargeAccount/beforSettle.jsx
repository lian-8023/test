// 记账宝-详情 提前结清
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import './chargeAccount.less';
import {observer,inject} from "mobx-react";
import { Icon ,Modal,Alert,Button,Table,Radio,DatePicker} from 'antd';
import moment from 'moment';
import axios from '../../axios';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;

@inject('allStore') @observer
class BeforSettle extends React.Component {
    constructor(props){
        super(props);
        this.state={
            repayDate:moment(new Date()).format('YYYY-MM-DD'),
            isClick:false,
            amount_allow:0
        }
    }
    //整笔结清 or 部分还款 切换
    radioChange=(e)=>{
        let {selectedRows}=this.state;
        if(Object.keys(selectedRows).length<=0){
            alert('请先选择需要操作的数据！');
            return;
        }
        let radioValue=e.target.value;
        this.setState({
            radioValue: radioValue,
            showEnough:false,  //隐藏余额是否够本次结清提示
            isEnough:false,
            amount:''
        },()=>{
            if(radioValue=='FULL_PREPAYMENT'){
                this.prepamentInfo();
            }
        });
    }
    //部分还款-查询合计应还金额
    checkShuldRepay=()=>{
        let {amount}=this.state;
        if(!amount){
            alert('请输入客户想要部分提前还款的本金！');
            return;
        }
        this.prepamentInfo();
    }
    
    // 查询提前结清所需金额详情 FULL_PREPAYMENT 
    prepamentInfo=()=>{
        let that=this;
        let {selectedRows,radioValue,amount}=this.state;
        let loanNumber=selectedRows.loanNumber;
        let parems={
            productNo:selectedRows.productNo,
            loanNumber:loanNumber,
            typeEnum:radioValue,  //挂帐类型 FULL_PREPAYMENT 整笔 || PART_PAYMENT 部分
            repaymentAt:this.state.repayDate
        };
        
        let lastInstallment=selectedRows.lastInstallment;
        if(radioValue=='FULL_PREPAYMENT'){
            parems.amount=lastInstallment; //试算金额，部分还款试算不能为空 （剩余应还本金）   
            parems.principal=0; 
        }else{
            if(loanNumber.substr(loanNumber.length-1)=='H'){   //合同号H结尾的情况(农业)，amount传后端返回带prin...
                parems.principal=amount; 
                parems.amount=0; 
            }else{
                parems.principal=amount; 
                parems.amount=amount; //用户填写的金额
            }
        }
        axios({
            method: 'POST',
            url:'/node/charge/query/prepayment/info',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    prepamentInfo:{},
                    showEnough:false
                })
                return;
            }
            let setRepay=data.totalAmount; //结算总金额
            let prepamentInfo=cpCommonJs.opinitionObj(data);
            let allAmount=commonJs.is_obj_exist(prepamentInfo.allAmount);
            that.setState({
                prepamentInfo:prepamentInfo,
                showEnough:true,
                totalAmount:setRepay,
                amount_allow:amount,
                part_totoAmount:allAmount  //部分还款-合计应还
            });
            //判断余额是否够此次结清
            let {detailData2={}}=that.props;
            let balance=commonJs.is_obj_exist(detailData2.balance);  //账户余额
            if(balance && balance!='-' && setRepay && (balance-setRepay>=0)){
                that.setState({
                    isEnough:true
                });
            }else{
                that.setState({
                    isEnough:false
                });
            }
        })
    }
    // 不分结清需要填写的金额
    setAmount=(e)=>{
        let _value=e.target.value;
        this.setState({
            amount:_value?_value.replace(/\s/g,''):'',
            prepamentInfo:{}
        })
    }
    //确认提前结清--提交任意金额入账整笔/部分入账
    sureSettle=()=>{
        let parems={};
        let {selectedRows,radioValue,amount,prepamentInfo,amount_allow,part_totoAmount}=this.state;
        parems.accountType=(radioValue=='FULL_PREPAYMENT'?1:0); //选择整笔 1 OR 部分入账 0
        parems.loanNumber=selectedRows.loanNumber;
        parems.amount=(radioValue=='FULL_PREPAYMENT' ? prepamentInfo.totalAmount : part_totoAmount ); //还款金额
        parems.principal=(radioValue=='FULL_PREPAYMENT' ? selectedRows.lastInstallment : amount_allow );  //本金
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }
        let nowDate = year + "-" + month + "-" + day;
        parems.repayDate=this.state.repayDate;
        if(this.state.repayDate == ''){
            parems.repayDate = nowDate;
        }
        let that=this;
        axios({
            method: 'POST',
            url:'/node/charge/anyamount/account',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.props.getBalanceList();
            that.props.searchHandle(2,{pageNumber:1,pagesize:10});
            that.countDown();
            that.setState({
                radioValue:'',
                prepamentInfo:{},
                amount:'',
                isEnough:false,
                showEnough:false,
                currentLoanNo:selectedRows.loanNumber,
                selectedRowKeys: [],
                selectedRows:{}
            })
        })
    }
    //确认提前结清后弹窗显示结果（如没有手动关闭，则该窗口6秒钟后自动淡出…）
    countDown=()=>{
        let secondsToGo = 5;
        let {selectedRows,radioValue}=this.state;
        const modal = Modal.success({
          title: '提示',
        //   content: `This modal will be destroyed after ${secondsToGo} second.`,
        content:`借款合同 ${selectedRows.loanNumber} 已通过「记账宝」账户完成${radioValue=='FULL_PREPAYMENT'?'提前全额结清':'提前部分还款'}！`
        });
        const timer = setInterval(() => {
          secondsToGo -= 1;
        }, 1000);
        setTimeout(() => {
          clearInterval(timer);
          modal.destroy();
        }, secondsToGo * 1000);
    }
    tableRadioChange=(selectedRowKeys) => {
        let {balanceInfoDTOS}=this.props;
        let selectedRows=balanceInfoDTOS[selectedRowKeys];
        this.setState({
            selectedRowKeys,
            selectedRows:selectedRows,
            prepamentInfo:{},
            radioValue:'',
            isEnough:false,
            showEnough:false,
            isClick:true,
            amount:'',
            repayDate:moment(new Date()).format('YYYY-MM-DD')

        },()=>{
            let productNo=commonJs.is_obj_exist(selectedRows.productNo);
            if(productNo.substr(productNo.length-1)!='H'){
                this.setState({isFarmer:true})
            }else{
                this.setState({isFarmer:false})
            }
            if(!this.state.radioValue){
                this.setState({isEnough:false})
            }else{
                this.setState({isEnough:true})
            }
        })
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    }
    
    render() {
        const {detailData2={},balanceInfoDTOS=[]}=this.props;  //详情数据，未结清列表
        let {amount,radioValue,prepamentInfo={},isEnough,showEnough,selectedRows=[],selectedRowKeys=[],isFarmer,isClick,amount_allow='',part_totoAmount}=this.state;
        let balanceInfoDTOS2=[   //==================测试数据=======
            {
                loanNumber:'32432423432',
                productNo:'333333',
                lastInstallment:'111',
                principalNotPaid:888,
                amount:43
            },{
                loanNumber:'32432423432',
                productNo:'333333',
                lastInstallment:'111',
                principalNotPaid:999,
                amount:43,
                installments:8989
            }
        ]
        const columns = [
            {
              title: '借款合同号',
              width:'20%',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.loanNumber)}
            },
            {
              title: '借款金额(元) / 剩余应还本金(元)',
              width:'20%',
              render: (text,record,index) => {return `${commonJs.is_obj_exist(record.amount)}/${commonJs.is_obj_exist(record.principalNotPaid)}`}
            },
            {
              title: '借款期数 / 剩余未还期数',
              width:'20%',
              render: (text,record,index) => {return `${commonJs.is_obj_exist(record.installments)}/${commonJs.is_obj_exist(record.lastInstallment)}`}
            },
            {
              title: '借款时间',
              width:'20%',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.createdTime)}
            },
            {
              title: '最后还款时间',
              width:'20%',
              render: (text,record,index) => {return commonJs.is_obj_exist(record.latePayTime)}
            },
        ];
        const rowSelection = {
            type:'radio',
            selectedRowKeys,
            onChange: this.tableRadioChange
        };
        return (
            <div>
                <Modal
                    title="提前结清"

                    width={'90%'}
                    visible={this.props.showBeforSettle}
                    onCancel={()=>{
                        this.setState({repayDate:moment(new Date()).format('YYYY-MM-DD')});
                        this.props.hideBeforSettle();
                    }}
                    footer={null}
                    >
                    <p><b>当前账户余额(元)：<span style={{fontSize:'20px'}}>{commonJs.is_obj_exist(detailData2.balance)}</span></b></p>
                    <p className='pt10'><b>选择下方贷款进行提前结还款操作：</b></p>
                    <div className='mt10'><span className="left">* 提前结清需确保还款账户里有足够的金额。</span></div>

                    <div className="border clearfix mt10" id='settleTable'>
                        <Table rowSelection={rowSelection} rowKey={(record, index) => index} pagination={false} size="middle" scroll={{ y: 150 }} columns={columns} dataSource={balanceInfoDTOS} />
                    </div>
                    <div className='clearfix border'>
                        <Radio.Group onChange={this.radioChange} value={radioValue}>
                            <div className="left pl30 pt20 pb20 border-right" style={this.w}>
                                <p><Radio value={'FULL_PREPAYMENT'}>该借款需要全额提前结清</Radio>    到账时间：<DatePicker disabled={radioValue!=='FULL_PREPAYMENT'}  format="YYYY-MM-DD" value={moment(this.state.repayDate)} allowClear={false} showTime onChange={(v)=>{this.setState({repayDate:moment(v).format('YYYY-MM-DD')});}} onOk={(v)=>{this.setState({repayDate:moment(v).format('YYYY-MM-DD')});this.prepamentInfo();}} /></p>
                                <p className="pt20">以上选中的借款，提前结清所需还款金额为：{commonJs.is_obj_exist(prepamentInfo.totalAmount)} 元</p>
                                <p className="pt20">
                                    （ 本金 {commonJs.is_obj_exist(balanceInfoDTOS[selectedRowKeys]?balanceInfoDTOS[selectedRowKeys].principalNotPaid:'-')} + 利息 {commonJs.is_obj_exist(prepamentInfo.totalInterest)} + 罚息 {commonJs.is_obj_exist(prepamentInfo.totalLateFee)}  + 违约金 {commonJs.is_obj_exist(prepamentInfo.penalty)}）
                                </p>
                            </div>
                            <div className="left pl30 pt20 pb10" style={this.w}>
                                <p><Radio value={'PART_PAYMENT'} disabled={isFarmer}>该借款需要部分提前还款（当前仅支持农业相关贷款产品）</Radio></p>
                                <p className="pt20 clearfix">
                                    <span className="left">客户想要部分提前还款的本金：</span>
                                    <input type="number" placeholder='请输入' disabled={radioValue=='PART_PAYMENT'?false:true} className='input left' style={{width:'100px',marginTop:'-6px'}} value={amount} onChange={this.setAmount} onKeyPress={commonJs.handleKeyPress.bind(this)} />
                                    <span className="left ml5">元</span>
                                </p>
                                <p className="pt20">
                                    <span className="left mr5">合计应还：{part_totoAmount}元</span>
                                    {
                                        amount?
                                        <button className="btn-white inline-block left mr3" style={{marginTop:'-5px'}} onClick={this.checkShuldRepay}>查询</button>:''
                                    }
                                    （ 本金 {commonJs.is_obj_exist(amount_allow)} + 利息 {commonJs.is_obj_exist(prepamentInfo.totalInterest)} + 罚息 {commonJs.is_obj_exist(prepamentInfo.totalLateFee)} + 违约金 {commonJs.is_obj_exist(prepamentInfo.penalty)} ）
                                </p>
                            </div>
                        </Radio.Group>
                    </div>
                    {
                        showEnough?
                        <div className="pt10 pl20 pb10 border">
                        {
                            isEnough ? 
                            <div><Icon type="check-circle" style={{color:'#38dc04',marginRight:'5px'}} />该客户「记账宝」还款账户余额足够本次提前结清。</div>
                            :
                            <div><Icon type="check-circle" style={{color:'#f50303',marginRight:'5px'}} />还款账户余额不足，无法完成本次提前结清。</div>
                        }
                        </div>:''
                    }
                    
                    <div className="text-center mt10">
                        <Button type="primary" size='large' disabled={!isClick} onClick={this.sureSettle}>确认结清入账</Button>
                    </div>
                </Modal>

            </div>
        );
    }
    w={
        width:'45%'
    }
};

export default BeforSettle;