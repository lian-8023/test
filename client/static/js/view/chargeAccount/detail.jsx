import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import { Breadcrumb, Icon ,Modal,Row, Col,Select,Button,Table,Tag} from 'antd';
const { Option } = Select;
import DataTable from './dataTable';
import axios from '../../axios';
import BeforSettle from './beforSettle';
import {observer,inject} from "mobx-react";

@inject('allStore') @observer
class Detail extends React.Component {
    constructor(props){
        super(props);
        this.customerRepayLs=this.props.allStore.CustomerRepayLs;
        this.state = {
            reimburseModal:false,
            sureReimburse:false,
            showBeforSettle:false,
            userBank:{},
            pagination:{
                pageSize:10,
                current:1,
                showSizeChanger:true
            },
        };
    }
    componentDidMount() {
        commonJs.reloadRules();
      let getCustomerId=this.props.location.query.customerId;
      let customerId=getCustomerId?getCustomerId:0;  //记账宝还款管理customerId动态获取，小雨点还款管理customerId固定传0；
      this.setState({
        customerId:customerId
      },()=>{
          this.searchHandle(2,{pageNumber:1,pagesize:10});
      })
    }
    recoveryAccount=()=>{
        this.setState({
            recoveryAccount: true,
        });
    }
    // 提前结清弹出
    showBeforSettle=()=>{
        this.getBalanceList();
        this.setState({
            showBeforSettle: true,
        });
    }
    hideBeforSettle=()=>{
        this.setState({
            showBeforSettle: false,
        });
    }
    // 展示退款弹窗
    showModal1 = () => {
        this.getBalanceList();
        this.getBank();
        this.setState({
            reimburseModal: true,
        });
    };
    
    handleCancel1 = e => {
        this.setState({
            reimburseModal: false,
        });
      };
    //展示第二次确认弹窗
    showModal2 = () => {
        let {refundMoney,userBank}=this.state;
        if(!refundMoney){
            alert('请输入需要退款给客户的金额！');
            return;
        }
        if(!userBank.label){
            alert('请选择退款到客户的银行卡账号！');
            return;
        }
        this.setState({
            sureReimburse: true,
        });
    };
    handleCancel2 = e => {
        this.setState({
            sureReimburse: false,
            recoveryAccount:false
        });
        $('.Recovery_newDmanbr').val('');
        $('.Recovery_amount').val('');
      };
    //搜索
    searchHandle=(dataKey,conditions)=>{
        let that=this;
        let parems={};
        parems.customerId=this.state.customerId;
        if(conditions){
            parems=Object.assign(parems,conditions);  //获取从 DataTable 传的搜索参数，并合并 customerId；
        }
        axios({
            method: 'POST',
            url:'/node/charge/xyd/account/detail',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    ['detailData'+dataKey]:{}
                })
                return;
            }
            that.setState({
                ['detailData'+dataKey]:data
            })
        })
    }
    //记账宝显示未结清的列表
    getBalanceList=()=>{
        // let balanceInfoDTOS=this.state.balanceInfoDTOS;
        // if(balanceInfoDTOS && balanceInfoDTOS.length>0){
        //     return;
        // }
        let that=this;
        axios({
            method: 'get',
            url:'/node/charge/query/balance',
            params:{customerId:this.state.customerId}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if(!data.executed){
                that.setState({
                    balanceInfoDTOS:[]
                })
                return;
            }
            // if (!commonJs.ajaxGetCode(response)) {
            //     that.setState({
            //         balanceInfoDTOS:[]
            //     })
            //     return;
            // }
            that.setState({
                balanceInfoDTOS:cpCommonJs.opinitionArray(data.balanceInfoDTOS)
            })
        })
    }
    //记账宝获取银行列表-lyf
    getBank=()=>{
        let bankList=this.state.bankList;
        if(bankList && bankList.length>0){
            return;
        }
        let that=this;
        axios({
            method: 'get',
            url:'/node/charge/query/bank',
            params:{customerId:this.state.customerId}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            let responseDTO=cpCommonJs.opinitionObj(data.responseDTO);
            let bankList=cpCommonJs.opinitionArray(responseDTO.data);
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    bankList:[]
                })
                return;
            }
            that.setState({
                bankList:bankList
            })
        })
    }
    //退款到客户的银行卡账号
    handleChange=(value)=> {
        this.setState({
            userBank:value   // { key: 0, label: "6897878797980909090909090" }
        })
      }
      //退款金额
      refundChange=(e)=>{
        this.setState({
            refundMoney:e.target.value
        })
    }
    //确认退款
    sureRefund=()=>{
        let that=this;
        let detailData2=this.state.detailData2;
        let bankValueNo=this.state.userBank.key;
        let bankObj=this.state.bankList[bankValueNo];  //用户选择的银行卡对应信息
        let parems={};
        parems.bankCardUserName=bankObj.name;  //银行卡开户人姓名/query/bank/
        parems.bankName=bankObj.returnBankName;  //银行名称
        parems.bankBranchName=bankObj.bankBranch?bankObj.bankBranch:bankObj.returnBankName;  //银行卡开户支行名称
        parems.bankCertNo=bankObj.idCard;  //银行卡开户人身份证
        parems.bankMobileNo=bankObj.bankMobile;  //银行绑定手机号
        parems.bankCardNo=bankObj.returnBankCard;  //银行卡号
        parems.dmanbr=detailData2.dmanbr;  //虚拟账户 
        parems.bankProvince='';  //开户行省 
        parems.bankCity='';  //开户行市
        parems.amount=this.state.refundMoney; //退款金额
        parems.customerId=this.state.customerId;
        axios({
            method: 'POST',
            url:'/node/charge/refund',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.searchHandle(2,{pageNumber:1,pagesize:10});
            that.setState({
                reimburseModal:false,
                sureReimburse:false,
            });
        })
    }
    // 确认纠错转账
    sureRecoveryAccount=()=>{
        let parem={},that=this;
        let detailData2=cpCommonJs.opinitionObj(this.state.detailData2);
        let dmanbr=detailData2.dmanbr;
        if(!dmanbr){
            alert('未获取到转出账号！');
            return;
        }
        parem.oldDmanbr=dmanbr;
        let Recovery_newDmanbr=$('.Recovery_newDmanbr').val();
        if(!Recovery_newDmanbr){
            alert('请输入转入账号！');
            return;
        }
        parem.newDmanbr=Recovery_newDmanbr;
        let Recovery_amount=$('.Recovery_amount').val();
        if(!Recovery_amount){
            alert('请输入转账金额！');
            return;
        }
        parem.amount=Recovery_amount;
        axios({
            method: 'POST',
            url:'/node/charge/correction/refund',
            data:{josnParam:JSON.stringify(parem)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.handleCancel2();
        })

    }
    render() {
        let {detailData2={},balanceInfoDTOS=[],bankList=[],userBank={},recoveryAccount}=this.state;
        const tableColumns = [
            {
                title: '类型',
                dataIndex: 'isDeduct',
                key: 'isDeduct',
                width:'10%',
                render: (text,record,index) => {
                    if(record.isDeduct==0){
                        return <span>充值</span>
                    }else if(record.isDeduct==2||record.isDeduct==1){
                        return <span>支出</span>
                    }
                },
              },
            { title: '发生金额（元）', dataIndex: 'amount', key: 'amount',width:'10%' },
            { title: '发生时间', dataIndex: 'tradeTime', key: 'tradeTime',width:'20%' },
            { title: '流水号', dataIndex: 'tradeNo', key: 'tradeNo',width:'20%' },
            { title: '扣款合同', dataIndex: 'loanNumber', key: 'loanNumber',width:'10%' },
            { title: '备注信息', dataIndex: 'comment', key: 'comment',width:'30%' }
          ];
        const borrowColumns = [
            {
              title: '未结清借款(合同号)',
              dataIndex: 'loanNumber',
              key: 'loanNumber',
            },
            {
              title: '未结清金额(元)',
              dataIndex: 'principalNotPaid',
              key: 'principalNotPaid',
            }
        ];
        return (
            <div  className="content" id="content">
                <div className="bar pl20 pt10" id='bread'>
                    <Icon type="environment" style={{color:'#1890FF',fontSize:'16px',marginRight:'15px',float:'left',marginTop:'3px'}} />
                    <Breadcrumb separator=">">
                        <Breadcrumb.Item href="/cp-portal#/chargeAccount">记账宝还款管理</Breadcrumb.Item>
                        <Breadcrumb.Item href="/cp-portal#/chargeAccountDetail">账户详情</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                
                <div className="mt20 bar pl20 pb20 pr20">
                    <h3 className='cardTit pt20 pb10'>账户基本详情</h3>
                    <div className="clearfix"></div>
                    <div className="left mr20 cardInfo infoBox">
                        <p className="cardNo elli">{commonJs.is_obj_exist(detailData2.realDmanbr)}</p>
                        <p>还款虚拟账号</p>
                        <div className="blueLine mt10"></div>
                        <dl className="mt10 identityInfo">
                            <dt>姓名</dt>
                            <dd title=''>{commonJs.is_obj_exist(detailData2.name)}</dd>
                            <dt>身份证号码</dt>
                            <dd title=''>{commonJs.is_obj_exist(detailData2.nationalId)}</dd>
                            <dt>手机号</dt>
                            <dd title=''>{commonJs.is_obj_exist(detailData2.phone)}</dd>
                            <dt>开户时间</dt>
                            <dd title=''>{commonJs.is_obj_exist(detailData2.createTime)}</dd>
                        </dl>
                    </div>
                    <div className="left mr20 accountInfo infoBox">
                        <p className='mt20'>账户余额</p>
                        <p className='pt15 elli'><b className='money'><sup>¥</sup>{commonJs.is_obj_exist(detailData2.balance)}</b></p>
                        <div className="blueLine mt15"></div>
                        <br/>
                        <div>
                            <span className='reimburseBtn' data-btn-rule='RULE:TREE:JZB:REFUD' id='reimburseBtn'>
                                <Tag color="#87d068" onClick={this.showModal1}>退款</Tag>
                            </span>
                            <span id="beforSettle">
                                <Tag color="#f50" onClick={this.showBeforSettle}>提前还款</Tag>
                            </span>
                            <span id="recoveryAccount">
                                <Tag color="#108ee9" onClick={this.recoveryAccount}>纠错转账</Tag>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt20 bar pl20 pb20 pr20">
                    <h3 className='cardTit border-bottom pt20 pb10'>账户明细流水</h3>
                    <DataTable columns={tableColumns} searchHandle={this.searchHandle} data={cpCommonJs.opinitionArray(detailData2.payments)} total={detailData2.count} />
                </div>
                <div>
                    <Modal
                        title="退款"
                        width={'60%'}
                        visible={this.state.reimburseModal}
                        onCancel={this.handleCancel1}
                        footer={null}
                        >
                        <p className='pb15'>* 系统建议在两种情况下可以发起给客户的退款操作：</p>
                        <p>1.客户所有借款都已全被结清、但虚拟账户中还有多余资金时，由运营部门核实并申请，可以给客户进行退款；</p>
                        <p className='pb20'>2.客户在还款转账到404账户、出现异常操作时，由客户申请，运营部门核实，可以给客户进行退款。</p>
                        <div className='pb10'>
                            <Row>
                                <Col span={12}><b>客户虚拟账户里面剩余资金为(元)：</b></Col>
                                <Col span={12}>¥{commonJs.is_obj_exist(detailData2.balance)}</Col>
                            </Row>
                        </div>
                        <div className='pb30'>
                            <Row>
                                <Col span={12}><b>客户的借款结清情况：</b></Col>
                                <Col span={12}>
                                {
                                    balanceInfoDTOS.length>0 ? 
                                    <div>存在 {balanceInfoDTOS.length} 笔未结清借款</div>:
                                    '无未结清借款'
                                }
                                </Col>
                            </Row>
                        </div>

                        {/* 当客户存在未结清借款时，此处显示信息为如下样式： */}
                        {
                            balanceInfoDTOS.length>0 ?
                            <div className="mb20 borrowTable">
                                <Table rowKey={(record, index) => index} pagination={false} size="middle" scroll={{ y: 250 }} columns={borrowColumns} dataSource={balanceInfoDTOS} />
                            </div>:''
                        }

                        <b>退款给客户的金额(元)：</b>
                        <p className='pb15'>
                            <input type="number" placeholder='请输入' onChange={this.refundChange} className="input_w input" onKeyPress={commonJs.handleKeyPress.bind(this,null)} />
                        </p>
                        <b>退款到客户的银行卡账号：</b>
                        <p></p>
                        <Select 
                        placeholder='请选择' 
                        style={{ width: 200 }} 
                        onChange={this.handleChange}
                        labelInValue
                        >
                        {
                            bankList.map((repy,i)=>{
                                return <Option key={i}>{repy.returnBankCard}</Option>
                            })
                        }
                        </Select>
                        <div className="text-center">
                            <Button type="primary" size='large' onClick={this.showModal2}>发起退款</Button>
                        </div>
                    </Modal>
                    {/* 第二次确认退款 */}
                    <Modal
                        title="提示"
                        okText='确认退款'
                        cancelText='返回修改'
                        visible={this.state.sureReimburse}
                        onCancel={this.handleCancel2}
                        onOk={this.sureRefund}
                        >
                        <p>请确认以下退款操作信息：</p>
                        <p>退款对象：{commonJs.is_obj_exist(detailData2.name)}（身份证号：{commonJs.is_obj_exist(detailData2.nationalId)}）</p>
                        <p>退款金额：{this.state.refundMoney}元</p>
                        <p>退款目标账户：{cpCommonJs.opinitionObj(bankList[userBank.key]).returnBankName},{this.state.userBank.label}</p>
                    </Modal>

                    
                    {/* 纠错转账 */}
                    <Modal
                        title="纠错转账"
                        okText='确认转账'
                        cancelText='取消'
                        visible={recoveryAccount}
                        onCancel={this.handleCancel2}
                        onOk={this.sureRecoveryAccount}
                        >
                        <p className='content-text'>账户余额(元)：<span style={{fontSize:'18px'}}>{commonJs.is_obj_exist(detailData2.balance)}</span></p>
                        <p className='mt10'>目标账号：</p>
                        <p><input type="text" className="input Recovery_newDmanbr" placeholder='请输入'/></p>
                        <p className='mt20'>转账金额：</p>
                        <p><input type="number" className="input Recovery_amount" placeholder='请输入' onKeyPress={commonJs.handleKeyPress.bind(this,['e'])}/></p>
                    </Modal>
                </div>
                <BeforSettle 
                    showBeforSettle={this.state.showBeforSettle} 
                    hideBeforSettle={this.hideBeforSettle} 
                    detailData2={detailData2}
                    balanceInfoDTOS={balanceInfoDTOS}
                    searchHandle={this.searchHandle}
                    getBalanceList={this.getBalanceList}
                />
            </div>
        );
    }
}
;

export default Detail;