// 记账宝还款管理-客户还款账户列表
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import $ from 'jquery';
import { DatePicker,Table, Pagination } from 'antd';
const {  RangePicker } = DatePicker;
import './chargeAccount.less';

class DataTable extends React.Component {
    constructor(props){
        super(props);
        this.state = {
          cdt_time:[undefined,undefined],  //时间
          pageSize:10,
          current:1,
        };
    }
    componentDidMount() {
      if(window.location.hash=='#/chargeAccount'){
        this.setState({
          isXydRepay:true
        })
      }else{
        this.setState({
          isXydRepay:false
        })
      }
      let that=this;
      $('.cBtnUl2 li').on('click',function(){
        let index=$(this).index();
        if($(this).hasClass('active')){
          $(this).removeClass('active');
          that.setState({
            cBtnIndex:99,    // 当 cBtnIndex == 4 ，则为选择时间
            cdt_time:[undefined,undefined]
          })
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
          current:1,
        },()=>{
          that.sureBtn();
        })
      })
    }
    UNSAFE_componentWillReceiveProps(nextProps){
      let type=nextProps.type;
      if(type!='changeTab'){
        this.setState({
          columns:nextProps.columns,
          scroll:nextProps.scroll,
          data:nextProps.data,
        })
      }
    }
    // 搜索时间切换事件
    TimeOnChange=(date,dateString)=>{
        this.setState({
          cdt_time:date,
          cBtnIndex:99
        },()=>{
          this.sureBtn(true);
        });
        $('.cBtnUl2').find('li').removeClass('active');
    }
    //确认按钮
    sureBtn=(fromSureBtn)=>{
      let conditions={};
      let index=this.state.cBtnIndex;
      if(fromSureBtn){
        this.setState({
          current:1
        })
        conditions.pageNumber=1;
      }else{
        conditions.pageNumber=this.state.current;
      }
      conditions.pagesize=this.state.pageSize;
      let timeBegin=this.state.cdt_time[0];
      let timeEnd=this.state.cdt_time[1];
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
      this.props.searchHandle(2,conditions);
    }

    onShowSizeChange=(current, pageSize)=>{
      this.setState({
        pageSize:pageSize,
        current:1
      },()=>{
        this.sureBtn();
      })
    }
    pageChange=(pageNumber)=>{
      this.setState({
        current:pageNumber
      },()=>{
        this.sureBtn();
      })
    }
    render() {        
        const {columns=[],scroll={},data=[],isXydRepay} = this.state;
        return (
            <div>
              <ul className="pt20 pb20 overflow-hide cBtnUl cBtnUl2 left">
                  <li className='c_btn' id="today">今天</li>
                  <li className='c_btn' id='yesterday'>昨天</li>
                  <li className='c_btn' id='currentSenven'>最近7天</li>
                  <li className='c_btn' id='currentThirty'>最近30天</li>
              </ul>
              {
                (isXydRepay && this.props.showLoadExcel) ? 
                <div className="right pt20 pb20">
                  <a href={"/node/charge/xyd/down/detail?1=1"+(this.props.conditions?commonJs.toHrefParams(this.props.conditions):'')} target='_bland' className="searchBtn downLoadExcel" id='downLoadExcel'>导出EXCEL</a>
                </div>:''
              }
              <div className="right mr15 pt20 pb20" id='c-time'>
                <RangePicker onChange={this.TimeOnChange} value={this.state.cdt_time} />
              </div>
              <div className="clearfix"></div>
              <Table
                  rowKey={(record, index) => `rowKey${index}`}
                  columns={columns}
                  dataSource={data}
                  scroll={scroll}
                  pagination={false}
              />
              <div className="right pt20">
                <Pagination
                    showSizeChanger
                    onShowSizeChange={this.onShowSizeChange.bind(this)}
                    current={this.state.current}
                    total={this.props.total}
                    onChange={this.pageChange.bind(this)}
                    pageSizeOptions={['10','25','50','100']}
                />
              </div>
            </div>
            
        );
    }
};

export default DataTable;