// 记账宝还款管理-客户还款账户列表
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import { Table,Input,Pagination,Tag ,Button ,Modal,Select} from 'antd';
const { Search } = Input;
import './chargeAccount.less';
import axios from '../../axios';
import {observer,inject} from "mobx-react";
import FileUpload from 'react-fileupload';
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

const {Option} = Select;
@inject('allStore') @observer
class CustomerRepayLs extends React.Component {
    constructor(props){
        super(props);
        this.store=this.props.allStore.ChannelStore;  //渠道-合作方数据
        this.state = {
            visible:false,
            searchIputVal:'',
            pageSize:10,
            current:1,
            loading:false
        };
    }
    componentDidMount(){
      this.init();
      this.store.getChanel();
      this.setParems();
    }
    init=()=>{
      let that=this;
      axios({
        method: 'get',
        url:'/node/charge/init/type',
      })
      .then(function (res) {
          let response=res.data;  //from node response
          let data=response.data;  //from java response
          if (!commonJs.ajaxGetCode(response)) {
              that.setState({
                typeEnums:[]
              })
              return;
          }
          that.setState({
            typeEnums:cpCommonJs.opinitionArray(data.typeEnums)
          })
      })
    }
    setParems=()=>{
      let pageNumber=this.state.current;
      let pagesize=this.state.pageSize;
      this.searchHandle(pageNumber,pagesize);
    }
    onChange=(e)=>{
        let { value } = e.target;
        if(value){
          value=value.replace(/^\s+|\s+$/g, '');
        }
        this.setState({
            searchIputVal:value
        })
    }
    typeChange=(e)=>{
      this.setState({
        type:e.target.value
      })
    }
    onShowSizeChange1=(current, pageSize)=>{
        this.setState({
          pageSize:pageSize,
          current:1
        },()=>{
            this.searchHandle(this.state.current,pageSize);
        })
      }
      pageChange1=(pageNumber)=>{
        this.setState({
          current:pageNumber
        },()=>{
            this.searchHandle(pageNumber,this.state.pageSize);
        })
      }

      searchHandle=(pageNumber,pagesize)=>{
        let that=this;
        let parems={};
        parems.params=this.state.searchIputVal;
        parems.type=this.state.type;

        parems.pageNumber=pageNumber;
        parems.pagesize=pagesize;
        axios({
            method: 'POST',
            url:'/node/charge/pay/list', 
            data:{josnParam:JSON.stringify(parems)},
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    jzbCustomerInfoDTOS:[],
                    total:0,
                    searchResult:{}
                })
                return;
            }
            that.setState({
                searchResult:data,
                jzbCustomerInfoDTOS:data.jzbCustomerInfoDTOS,
                total:data.count
            })
        })
      }
    //异常状态显示
    showType=(type)=>{
      let typeArr=type.split(' ');
      if(typeArr.indexOf('异常余额')>-1 && typeArr.indexOf('异常逾期')>-1 && typeArr.indexOf('需退款')>-1){
        return <div>
                <p className='deep-yellow-font mr5'>异常余额</p>
                <p className='red mr5'>异常逾期</p>
                <p className='blue-font mr5'>需退款</p>
              </div>
      }else if(typeArr.indexOf('异常余额')>-1 && typeArr.indexOf('异常逾期')>-1){
        return <div>
                <p className='deep-yellow-font mr5'>异常余额</p>
                <p className='red mr5'>异常逾期</p>
              </div>
      }else if(typeArr.indexOf('异常逾期')>-1 && typeArr.indexOf('需退款')>-1){
        return <div>
                <p className='deep-yellow-font mr5'>异常逾期</p>
                <p className='blue-font mr5'>需退款</p>
              </div>
      }else if(typeArr.indexOf('异常余额')>-1 && typeArr.indexOf('需退款')>-1){
        return <div>
                <p className='deep-yellow-font mr5'>异常余额</p>
                <p className='blue-font mr5'>需退款</p>
              </div>
      }else if(typeArr.indexOf('异常余额')>-1){
        return <div>
                <p className='deep-yellow-font mr5'>异常余额</p>
              </div>
      }else if(typeArr.indexOf('异常逾期')>-1){
        return <div>
                <p className='red mr5'>异常逾期</p>
              </div>
      }else if(typeArr.indexOf('需退款')>-1){
        return <div>
                <p className='blue-font mr5'>需退款</p>
              </div>
      }
    }

    showModal = () => {
      console.log(this.store)
      this.setState({
        visible: true,
      });
    };
  
    handleOk = e => {
      if(this.state.productNo == ''){
        alert('请选择充值产品');
        return;
      }
      $.ajax({
        type:"get",
        url:'/node/account/charge/cash',
        data:{productNo:this.state.productNo},
        async:false,
        dataType: "JSON",
        success:function(res) {
            let response=res.data;  //from node response
            if (!commonJs.ajaxGetCode(res)) {
                return;
            }
            alert(response.message);
            this.setState({
              visible: false,
            });
        }
    })
    };
  
    handleCancel = e => {
      this.setState({
        visible: false,
      });
    };
    _beforeUpload=()=>{
      this.setState({
          loading:true
      })
  }
    // 上传成功
    _handleUploadSuccess(obj) {
      this.setState({
        loading:false
      },()=>{
        let _data=cpCommonJs.opinitionObj(obj.data);
        alert(_data.message);
      })
      
    }
    // 上传失败
    _handleUploadFailed(err) {
      this.setState({
        loading:false
      },()=>{
        let _data=err.data?err.data:{};
        if(typeof(_data.resultStatus)!="undefined" && _data.resultStatus==1){
            alert(_data.resultMessage?_data.resultMessage:"失败");
            return;
        }
        if(typeof(_data.executed)!="undefined" && !_data.executed){
            alert(_data.message?_data.message:"失败");
        }
      })
    }
    render() {
      let {jzbCustomerInfoDTOS=[],total=0,typeEnums=[],searchResult={}}=this.state;
      let uploadOptions={
        baseUrl: '/cpQueue/charge/anyamount/batch',
        accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
        fileFieldName:"ws",
        numberLimit: 5,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
        chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
        wrapperDisplay: 'inline-block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
        beforeUpload:this._beforeUpload,
        uploadSuccess: this._handleUploadSuccess.bind(this),  //上传成功后执行的回调（针对AJAX而言）
        uploadFail: this._handleUploadFailed.bind(this),  //上传失败后执行的回调（针对AJAX而言）
      }
      const columns = [
          { title: '还款虚拟账号', key: 'dmanbr',width:'20%',render: (text,record,index) => {return commonJs.is_obj_exist(record.dmanbr)} },
          { title: '姓名', key: 'name' ,width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.name)}},
          { title: '身份证号', key: 'nationalId',width:'25%',render: (text,record,index) => {return commonJs.is_obj_exist(record.nationalId)} },
          { title: '手机号', key: 'phone',width:'15%',render: (text,record,index) => {return commonJs.is_obj_exist(record.phone)} },
          { title: '账户余额', key: 'balance',width:'10%',render: (text,record,index) => {return commonJs.is_obj_exist(record.balance)} },
          { title: '异常状态', key: 'balancde',width:'10%',render: (text,record,index) => {
            return this.showType(record.type)
          } },
          {
            title: 'Action',
            key: 'customerId',
            width:'10%',
            render: (text,record,index) => <a href={`/cp-portal#/chargeAccountDetail?customerId=${record.customerId}`}>账户详情</a>,
          },
        ];
        return (
            <div>
                <div className="topBundleCounts gray-bar" style={{background:'#eff1f5'}}>
                  <b className="left">全部<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(searchResult.allCount)}</span><span className="gray-font">条</span></b>
                  <b className="left ml40">异常逾期<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(searchResult.pastDueCount)}</span><span className="gray-font">条</span></b>
                  <b className="left ml40">异常余额<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(searchResult.balanceCount)}</span><span className="gray-font">条</span></b>
                  <b className="left ml40">需退款<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(searchResult.returnAmountCount)}</span><span className="gray-font">条</span></b>
              </div>
                <div id='searchCdt' className='mt20'>
                    {/* <Search placeholder="按还款虚拟账号/姓名/手机号/身份证号搜索" onSearch={this.setParems.bind(this)} enterButton onChange={this.onChange} style={{ width: 400 }} /> */}
                    <select className='select-gray left mr5 type' name="" id="type" style={{width:'200px'}} onChange={this.typeChange}>
                      <option value="" hidden>请选择类别</option>
                      {
                        typeEnums.map((repy,i)=>{
                          return <option key={i} value={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                        })
                      }
                    </select>
                    <input type="text" placeholder="按还款虚拟账号/姓名/手机号/身份证号搜索" className="left input input_w mr5" id='perams' value={this.state.searchIputVal} style={{width:'300px'}} onChange={this.onChange} />
                    <a className="left btn-blue inline-block" onClick={this.setParems}>搜索</a>
                    <Button style={{float: 'right'}} onClick={()=>{this.showModal()}} type="primary">充值保证金</Button>
                    <div className='right mr10'>
                      <FileUpload options={uploadOptions} ref="fileUpload">
                          <Button  type="primary"  ref="chooseAndUpload" loading={this.state.loading}>批量结清</Button>
                      </FileUpload>
                    </div>
                    <a href='/node/charge/anyamount/down?isDown=YES' target='_blank' className="block btn-blue right mr10">结清模板</a>
                </div>
                <div className="clearfix"></div>
                <div className="mt20 bar" id='customerRepayLs'>
                    <Table
                      rowKey={record => record.dmanbr}
                      columns={columns}
                      dataSource={jzbCustomerInfoDTOS}
                      pagination={false}
                    />
                    <div className="right pt20">
                        <Pagination
                            showSizeChanger
                            onShowSizeChange={this.onShowSizeChange1.bind(this)}
                            current={this.state.current}
                            total={total}
                            onChange={this.pageChange1.bind(this)}
                            pageSizeOptions={['10','25','50','100']}
                        />
                    </div>
                    <div className="clearfix"></div>
                </div>
                <Modal
                  title="充值保证金"
                  visible={this.state.visible}
                  onOk={this.handleOk}
                  onCancel={this.handleCancel}
                >
                  产品：<Select 
                        placeholder='请选择'
                        value={this.state.productNo} 
                        onChange={e=>{
                          this.setState({productNo:e})
                        }} 
                        style={{width: '220px'}} >
                          {this.store.channelArr?this.store.channelArr.map((v,i)=>{
                            return(<Option key={i} value={v.value} >{v.displayName}</Option>)
                          }):""}
                  </Select>
                </Modal>
            </div>
            
        );
    }
}
;

export default CustomerRepayLs;