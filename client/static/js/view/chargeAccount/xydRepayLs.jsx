// 记账宝还款管理-小雨点还款管理
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
const { TabPane } = Tabs;
import './chargeAccount.less';
import DataTable from './dataTable';
import axios from '../../axios';
import { Tabs,Row, Col ,DatePicker,Table, Pagination } from 'antd';
import {formatCurrency} from '../../source/common/formatCurrency';
const {  RangePicker } = DatePicker;

class XydRepayLs extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            cdt_time1:[undefined,undefined],  //时间
            pageSize:10,
            current1:1,
        };
    }
    componentDidMount() {
      this.init();
      let that=this;
      $('.cBtnUl1 li').on('click',function(){
        let index=$(this).index();
        if($(this).hasClass('active')){
          $(this).removeClass('active');
          that.setState({
            cBtnIndex:99,    // 当 cBtnIndex == 4 ，则为选择时间
            cdt_time:[undefined,undefined]
          });
          that.sureBtn();
          return;
        }
        that.setState({
          cBtnIndex:index,    // 当 cBtnIndex == 4 ，则为选择时间
          cdt_time:[undefined,undefined]
        })
        $(this).parent().find('li').removeClass('active');
        $(this).parent().find('li').eq(index).addClass('active');
        that.setState({
          pageSize:10,
          current1:1,
        },()=>{
          that.sureBtn();
        })
      })
    }
    //初始化信息
    init(){
      let that=this;
      axios({
        method: 'get',
        url:'/node/charge/xyd/pay/manage',
        params:{customerId:0}
      })
      .then(function (res) {
          let response=res.data;  //from node response
          let data=response.data;  //from java response
          if (!commonJs.ajaxGetCode(response)) {
              that.setState({
                  initData:{}
              })
              return;
          }
          that.setState({
            initData:cpCommonJs.opinitionObj(data.jzbxydAccountInfoDTO)
          })
      })
    }
    //搜索
    searchHandle=(dataKey,conditions)=>{
      let that=this;
      let activeKey=this.state.activeKey;
      let parems={};
      if(activeKey==1){
        parems.isDeduct='';
        parems.accountDetailFlow = 1;
      }else if(activeKey==2){
        parems.isDeduct=0;
        parems.accountDetailFlow = 0;
      }else{
        parems.accountDetailFlow = 1;
      }
      parems.customerId=0;
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
                ['detailData'+dataKey]:{},
                  renderType:'search',
                  conditions:{},
                  showLoadExcel:false
              })
              return;
          }
          that.setState({
              ['detailData'+dataKey]:data,
              renderType:'search',
              conditions:parems,
              showLoadExcel:true
          })
      })
    }
    setActiveKey=(activeKey)=>{
      let accountDetailFlow = 1;
      if(activeKey==1){
        accountDetailFlow = 1;
      }else if(activeKey==2){
        accountDetailFlow = 0;
      }else if(activeKey==3){
        this.repatyAmountDay();
      }
      let conditions = this.state.conditions;
      if(conditions){
        conditions.accountDetailFlow = accountDetailFlow;
      }
      this.setState({
        activeKey:activeKey,
        renderType:'changeTab',
        accountDetailFlow:accountDetailFlow,
        conditions:conditions
      })
    }
    //未还款入账金额（每日结算）
    repatyAmountDay=()=>{
        let that=this;
        axios({
          method: 'get',
          url:'/node/charge/xyd/day/amount',
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                  repamentDayAmounts:[]
                })
                return;
            }
            that.setState({
              repamentDayAmounts:data.treasureDayInfoDTOS
            })
        })
    }
    
    //-------------------账户明细流水----------------------
    // 搜索时间切换事件
    TimeOnChange=(date,dateString)=>{
      this.setState({
        cdt_time1:date,
        cBtnIndex:99
      },()=>{
        this.sureBtn(true)
      });
      $('.cBtnUl1').find('li').removeClass('active');
    }
    //确认按钮
    sureBtn=(fromSureBtn)=>{
      let conditions={};
      let index=this.state.cBtnIndex;
      if(fromSureBtn){
        this.setState({
          current1:1
        })
        conditions.pageNumber=1;
      }else{
        conditions.pageNumber=this.state.current1;
      }
      conditions.pagesize=this.state.pageSize;
      let timeBegin=this.state.cdt_time1[0];
      let timeEnd=this.state.cdt_time1[1];
      if(index==0){
        conditions.time='today';  //今天
      }else if(index==1){
        conditions.time='yesterday';  //昨天
      }else if(index==2){
        conditions.time='currentSenven';  //最近七天
      }else if(index==3){
        conditions.time='currentThirty';  //最近30天
      }else if(timeBegin && timeEnd){
        conditions.timeBegin=timeBegin.format('YYYY-MM-DD');  //时间段
        conditions.timeEnd=timeEnd.format('YYYY-MM-DD');  //时间段
      }
      this.searchHandle(1,conditions);
    }
    onShowSizeChange1=(current, pageSize)=>{
      this.setState({
        pageSize:pageSize,
        current1:1
      },()=>{
        this.sureBtn();
      })
    }
    pageChange1=(pageNumber)=>{
      this.setState({
        current1:pageNumber
      },()=>{
        this.sureBtn();
      })
    }
    render() {
      let {detailData1={},detailData2={},initData={},cdt_time1,conditions,showLoadExcel,repamentDayAmounts}=this.state;
      const tableColumns = [
          {
            title: '类型', dataIndex: 'isDeduct', key: 'isDeduct', width:'10%',
            render: (text,record,index) => {
                if(record.isDeduct==0){
                    return <span>充值</span>
                }else if(record.isDeduct==2||record.isDeduct==1){
                    return <span>支出</span>
                }
            },
          },
          { title: '发生金额（元）', dataIndex: 'amount', key: 'amount',width:'15%' },
          { title: '发生时间', dataIndex: 'tradeTime', key: 'tradeTime',width:'10%' },
          { title: '流水号', dataIndex: 'tradeNo', key: 'tradeNo',width:'20%' },
          // { title: '扣款合同', dataIndex: 'loanNumber', key: 'loanNumber',width:'20%' },
          { title: '备注信息', dataIndex: 'comment', key: 'comment',width:'25%' }
        ];
        const tableColumns1 = [
          {
            title: '类型', dataIndex: 'isDeduct', key: 'isDeduct', width:'10%',
            render: (text,record,index) => {
                if(record.isDeduct==0){
                    return <span>充值</span>
                }else if(record.isDeduct==2||record.isDeduct==1){
                    return <span>支出</span>
                }
            },
          },
          { title: '发生金额（元）', dataIndex: 'amount', key: 'amount',width:'15%' },
          { title: '发生时间', dataIndex: 'tradeTime', key: 'tradeTime',width:'10%' },
          { title: '流水号', dataIndex: 'tradeNo', key: 'tradeNo',width:'20%' },
          { title: '扣款合同', dataIndex: 'loanNumber', key: 'loanNumber',width:'20%' },
          { title: '备注信息', dataIndex: 'comment', key: 'comment',width:'25%' }
        ];
        const tableColumns3=[
          { title: '日期', dataIndex: 'createdAt', key: 'createdAt',width:'25%' },
          { title: '当前账户总金额(元)', dataIndex: 'currentTotalAmount', key: 'currentTotalAmount',width:'25%' },
          { title: '当前账户已入账金额(元)', dataIndex: 'currentCreditedAmount', key: 'currentCreditedAmount',width:'25%' },
          { title: '当前账户未入账金额(元)', dataIndex: 'currentValidAmount', key: 'currentValidAmount',width:'25%' },
        ];
        return (
            <div>
              <h3 className="cardTit">账户基本信息</h3>
              <div className="mt15">
                <Row gutter={16}>
                  <Col span={6}>
                    <div className="act_bar xydActBar">
                      <p className="pt25">小雨点记账宝还款账户</p>
                      <p>一般账户</p>
                      <p className="cardNo pt20">123907429910404</p>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="act_bar">
                      <p className='actBarTit'>账户总金额</p>
                      <p className='act elli'><sup>¥</sup>{formatCurrency(commonJs.is_obj_exist(initData.totalAmount))}</p>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="act_bar">
                      <p className='actBarTit'>当前可转出金额(已还款入账)</p>
                      <p className='act elli'><sup>¥</sup>{formatCurrency(commonJs.is_obj_exist(initData.validAmount))}</p>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="act_bar">
                      <p className='actBarTit'>累计已还款入账</p>
                      <p className='act elli'><sup>¥</sup>{formatCurrency(commonJs.is_obj_exist(initData.creditedAmount))}</p>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="mt20" id='customerRepayTab'>
                <Tabs defaultActiveKey="1" onChange={this.setActiveKey}>
                    <TabPane tab="账户明细流水" key="1">
                      {/* <DataTable_zh columns={tableColumns} searchHandle={this.searchHandle} data={cpCommonJs.opinitionArray(detailData.payments)} total={detailData.count} type={this.state.renderType} scroll={{ y: 240 }} /> */}
                      <div>
                        <ul className="pt20 pb20 overflow-hide cBtnUl cBtnUl1 left">
                            <li className='c_btn' id="today">今天</li>
                            <li className='c_btn' id='yesterday'>昨天</li>
                            <li className='c_btn' id='currentSenven'>最近7天</li>
                            <li className='c_btn' id='currentThirty'>最近30天</li>
                        </ul>
                        {
                          showLoadExcel?
                          <div className="right pt20 pb20">
                            <a href={"/node/charge/xyd/down/detail?1=1"+commonJs.toHrefParams(conditions)} target='_bland' className="searchBtn downLoadExcel" id='downLoadExcel'>导出EXCEL</a>
                          </div>:''
                        }
                        <div className="right mr15 pt20 pb20" id='c-time'>
                          <RangePicker onChange={this.TimeOnChange} value={cdt_time1} />
                        </div>
                        <div className="clearfix"></div>
                        <Table
                            rowKey={(record, index) => `rowKey${index}`}
                            columns={tableColumns}
                            dataSource={cpCommonJs.opinitionArray(detailData1.payments)}
                            scroll={{ y: 240 }}
                            pagination={false}
                        />
                        <div className="right pt20">
                          <Pagination
                              showSizeChanger
                              onShowSizeChange={this.onShowSizeChange1.bind(this)}
                              current={this.state.current1}
                              total={detailData1.count}
                              onChange={this.pageChange1.bind(this)}
                              pageSizeOptions={['10','25','50','100']}
                          />
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tab="还款入账明细" key="2">
                      <DataTable conditions={conditions} columns={tableColumns1} showLoadExcel={showLoadExcel} searchHandle={this.searchHandle} data={cpCommonJs.opinitionArray(detailData2.payments)} total={detailData2.count} type={this.state.renderType} scroll={{ y: 240 }} />
                    </TabPane>
                    <TabPane tab="未还款入账金额（每日结算）" key="3">
                      <Table
                            rowKey={(record, index) => `rowKey${index}`}
                            columns={tableColumns3}
                            dataSource={cpCommonJs.opinitionArray(repamentDayAmounts)}
                            scroll={{ y: 240 }}
                            pagination={false}
                        />
                    </TabPane>
                </Tabs>
              </div>
            </div>
        );
    }
}
;

export default XydRepayLs;