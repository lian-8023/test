// 案例下载
import React from 'react';
import $ from 'jquery';
import { DatePicker,Select,Button } from 'antd'; 
const { Option } = Select;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import axios from '../../axios';

import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

@inject('allStore') @observer
class CaseDownLoad extends React.Component{
    constructor(props){
        super(props);
        this.ChannelStore=this.props.allStore.ChannelStore;
        this.state={
            startValue: null,
            endValue: null,
            endOpen: false,
        }
    }
    componentDidMount () {
        // console.log(this.props)
        commonJs.reloadRules();
        this.init();
        let channelArr =this.ChannelStore.channelArr;
        if(Object.keys(channelArr).length<=0){
            this.ChannelStore.getChanel();
        }
    }
    //获取案例类别和沟通方式
    init(){
        let that=this;
        axios({
            method: 'POST',
            url:'/node/case/init',
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    caseFromAry:{},
                    caseTypeAry:{}
                })
                return;
            }
            that.setState({
                caseFromAry:data.caseFrom,
                caseTypeAry:data.caseType
            })
        })
    }
    // 案例类别选择
    caseTypeSelect=(value)=>{
        console.log(value);
        this.setState({caseTypeName:value})
    }
    caseFrompeSelect=(value)=>{
        this.setState({caseFrompeName:value})
    }
    // 时间
    disabledStartDate = startValue => {
        const { endValue } = this.state;
        if (!startValue || !endValue) {
          return false;
        }
        return startValue.valueOf() > endValue.valueOf();
      };
    
      disabledEndDate = endValue => {
        const { startValue } = this.state;
        if (!endValue || !startValue) {
          return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
      };
    
      onChange = (field, value) => {
        this.setState({
          [field]: value,
        });
      };
    
      onStartChange = value => {
        this.onChange('startValue', value);
      };
    
      onEndChange = value => {
        this.onChange('endValue', value);
      };
    
      handleStartOpenChange = open => {
        if (!open) {
          this.setState({ endOpen: true });
        }
      };
    
      handleEndOpenChange = open => {
        this.setState({ endOpen: open });
      };
      
      getCDs=()=>{
        let parems={};
        const { caseTypeName,caseFrompeName } = this.state;
        if(!caseTypeName && !caseFrompeName){
            alert('请选择案例类别或者案例来源！');
            return;
        }
        if(caseTypeName) parems.caseType=caseTypeName;
        if(caseFrompeName) parems.caseFrom=caseFrompeName;
        let _startValue=this.state.startValue;
        if(_startValue){
            _startValue=_startValue.format('YYYY-MM-DD HH:mm:ss');
            parems.dateStart=_startValue;
        }else{
            alert("请选择开始时间");
            return;
        };
        let _endValue=this.state.endValue;
        if(_endValue){
            _endValue=_endValue.format('YYYY-MM-DD HH:mm:ss');
            parems.dateEnd=_endValue;
        }else{
            alert("请选择结束时间");
            return;
        };

        let productNos=this.state.productNos;
        if(!productNos){
            alert('请选择产品号！');
            return;
        }
        let productNos_arr=Array.from(productNos);
        let _productNos='';
        for(let i=0;i<productNos_arr.length;i++){
            _productNos+='&productNos='+productNos_arr[i];
        }
        let downUrl='/node/case/downCase?1=1'+_productNos+commonJs.toHrefParams(parems);
        console.log('aaa',downUrl);
        window.open(downUrl);
      }

      handleChange=(value)=>{
        this.setState({
            productNos:value
        })
      }
      resetCondition=()=>{
        commonJs.resetCondition(this);
        this.setState({
            productNos:[]
        })
      }
    render() {
        const {caseFromAry={},caseTypeAry={}}=this.state;
        const { startValue, endValue, endOpen,caseTypeName,caseFrompeName } = this.state;
        const channelArr =this.ChannelStore.channelArr;
        return (
            <div>
                <div data-isresetdiv="yes" className="bar clearfix pl10 pt10 pr10 pb10" id='caseDownCdt' data-resetstate='startValue,endValue,caseTypeName,caseFrompeName'>
                    <Select
                        allowClear
                        mode="multiple"
                        style={myStyle} 
                        placeholder="请选择产品号"
                        value={this.state.productNos}
                        onChange={this.handleChange}
                    >
                        {
                            channelArr.map((repy,i)=>{
                                return <Option key={repy.name} value={repy.value}>{repy.displayName}</Option>
                            })
                        }
                    </Select>
                    <Select 
                        placeholder="案例类别" 
                        style={myStyle} 
                        value={caseTypeName} 
                        onSelect={this.caseTypeSelect}
                    >
                        {
                            (caseTypeAry && caseTypeAry.length>0) ? caseTypeAry.map((repy,i)=>{
                                return <Option key={i} value={repy.name}>{repy.displayName}</Option>
                            }):<Option key='0'></Option>
                        }
                    </Select>
                    {
                        this.state.caseTypeName=="TYPE_COL"||this.state.caseTypeName=="TYPE_CASH"||this.state.caseTypeName=="TYPE_DAY"?
                        <Select 
                            placeholder="案例来源" 
                            style={myStyle} 
                            value={caseFrompeName} 
                            onSelect={this.caseFrompeSelect}
                        >
                        {
                            (caseFromAry && caseFromAry.length>0) ? caseFromAry.map((repy,i)=>{
                                return <Option key={i} value={repy.name}>{repy.displayName}</Option>
                            }):<Option key='0'></Option>
                        }
                        </Select>:""
                    }
                    <DatePicker
                        disabledDate={this.disabledStartDate}
                        style={myStyle}
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        value={startValue}
                        placeholder="开始时间"
                        onChange={this.onStartChange}
                        onOpenChange={this.handleStartOpenChange}
                        />
                        <DatePicker
                        disabledDate={this.disabledEndDate}
                        style={myStyle}
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        value={endValue}
                        placeholder="结束时间"
                        onChange={this.onEndChange}
                        open={endOpen}
                        onOpenChange={this.handleEndOpenChange}
                        />
                    <span id="caseDown" className='mr10'>
                        <Button type="primary" onClick={this.getCDs}>下载</Button>
                    </span>
                    <span id="CaseCdtReset">
                        <Button onClick={this.resetCondition.bind(this)}>重置</Button>
                    </span>
                </div>
            </div>
        )
    }
};
const myStyle={ width:200,float:'left',marginRight:'10px' };
export default CaseDownLoad;  //ES6语法，导出模块