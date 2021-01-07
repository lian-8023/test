// 已完成任务-回访案列
import React from 'react';
import $ from 'jquery';
import { Pagination,DatePicker,Select } from 'antd';  
import {observer,inject} from "mobx-react";
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import Channel from '../cp-module/channel'; //选择合作方select
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;

class avisitCase extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            visitDataInfoDtos:[],  //搜索结果
            channelSelectedObj:{},  //条件区选中的渠道
            barsNum:10,  //每页显示多少条
            current:1,
            totalSize:0,
        };
    }
    componentDidMount() {
        cpCommonJs.getRuleGroup(this);  //获取权限用户组数据
        commonJs.reloadRules();
    }
    //渠道切换事件
    channelChange(channelSelectedObj){
        commonJs.resetCondition(this,false);
        this.setState({
            channelSelectedObj:channelSelectedObj,
            taskOwner:"",
        })
        let _pathName=this.props.location?this.props.location.pathname:"";
        $(".avisitType option").removeProp("selected");
        $(".avisitType option[value='"+_pathName+"']").prop("selected","true");
    }
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            current: 1,
            barsNum:pageSize
        });
        this.searchHandle(1,pageSize);
    }
    //快速跳转到某一页。
    pageChange(page){
        this.setState({
            current: page
        });
        this.searchHandle(page,this.state.barsNum);
    }
    
    //搜索 oldConditions等于true获取已经存在的条件，否则重新获取搜索条件
    searchHandle(current,barsNum,fromBtn){
        let parems={};
        parems.pageNumber=current;
        parems.pagesize=barsNum;
        let _productNo=this.state.channelSelectedObj.value;
        if(_productNo)parems.productNo=_productNo;//产品号
        let _debitingChannel=$(".return-visit-condition .debitingChannel option:selected").attr("value");
        if(_debitingChannel)parems.debitingChannel=_debitingChannel;//还款方式
        let _store=$(".return-visit-condition .store").val();
        if(_store)parems.store=_store;//门店
        let _employeeName=$(".return-visit-condition .employeeName").val();
        if(_employeeName)parems.employeeName=_employeeName;//业务员
        let _taskOwner=this.state.taskOwner;  //任务所有者
        if(_taskOwner)parems.createdBy=_taskOwner;
        let that=this;
        if(fromBtn){
            this.setState({
                current:1
            })
        }
        $.ajax({
             type:"post", 
             url:"/node/reV/re-record", 
             async:true,
             dataType: "JSON", 
             data:parems, 
             beforeSend:function(XMLHttpRequest){
                let loading_html='<div id="loading">'+
                                        '<div class="tanc_bg"></div>'+
                                        '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                    '</div>';
                $("body").append(loading_html);       
            },
             success:function(res){
                $("#loading").remove();
                 if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        visitDataInfoDtos:[]
                    })
                     return;
                 }
                 let _data=res.data;
                 let _visitDataInfoDtos=_data.queueRecordInfoDTOS?_data.queueRecordInfoDTOS:[]; //搜索结果list
                 that.setState({
                    visitDataInfoDtos:_visitDataInfoDtos,
                    totalSize:_data.totalSize?_data.totalSize:0  //总条数
                 })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        })
    }
    
    //条件区任务所有者
    taskOwnerFn(value,option){
        this.setState({
            taskOwner:value
        })
        let adminNameMaps=this.state.adminNameMaps;
        for(let i=0;i<adminNameMaps.length;i++){
            if(adminNameMaps[i].code==value){
                $(".return-visit-condition .ant-select-selection-selected-value").text(adminNameMaps[i].name);
            }
        };
        $(".return-visit-condition .ant-select-selection__placeholder").css("display","none");
    }
    //清除条件区任务所有者
    TaskOwnerDeselect(value){
        if(value==undefined){
            this.setState({
                taskOwner:""
            })
        }
    }
    render() {
        let visitDataInfoDtos=this.state.visitDataInfoDtos?this.state.visitDataInfoDtos:[];
        let adminNameMaps=this.state.adminNameMaps;
        const Option = Select.Option;
        let selectedChannelVal=this.state.channelSelectedObj.value;  //条件区选中的渠道
        return (
            <div  className="content" id="content">
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar return-visit-condition clearfix pb5" data-resetstate="paystartValue,payendValue,creditExtensionstartValue,creditExtensionendValue">
                    <dl className="left mt10">
                        <dt className="left">产品</dt>
                        <dd><Channel onChange={this.channelChange.bind(this)} /></dd>  {/* 合作方 */}
                    </dl>
                    <dl className="left mt10">
                        <dt>还款方式</dt>
                        <dd>
                            <select className="select-gray debitingChannel" name="" id="debitingChannel">
                                <option value="" hidden>请选择</option>
                                <option value="">全部</option>
                                <option value="offline_paid">offline_paid</option>
                                <option value="paid">paid</option>
                                <option value="blind">blind</option>
                                <option value="deposits">deposits</option>
                                <option value="prepayment">prepayment</option>
                                <option value="other">other</option>
                            </select>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt>门店</dt>
                        <dd>
                            <input type="text" className="input store" id='store' placeholder="请输入" style={{"textAlign":"right"}} />
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt>业务员</dt>
                        <dd>
                            <input type="text" className="input employeeName" id='employeeName' placeholder="请输入" style={{"textAlign":"right"}} />
                        </dd>
                    </dl>
                    <dl className="left mt10" data-btn-rule="RULE:REVISIT:RT:CODE:KEY">
                        <dt>任务所有者</dt>
                        <dd id='taskOwner'>
                            <Select
                                    showSearch
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="请选择"
                                    optionFilterProp="children"
                                    onSelect={this.taskOwnerFn.bind(this)}
                                    onChange={this.TaskOwnerDeselect.bind(this)}
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {
                                        (adminNameMaps && adminNameMaps.length>0) ? adminNameMaps.map((repy,i)=>{
                                            return <Option value={repy.loginname} key={i} >{repy.name}</Option>
                                        }):<Option value = "">没有数据</Option>
                                    }
                                </Select>
                        </dd>
                    </dl>
                    <div className="left mt10 mr10">
                        <button className="btn-blue left mr5" id='searchBtn' onClick={this.searchHandle.bind(this,1,this.state.barsNum,true)}>搜索</button>
                        <button className="btn-white left" id='reset' onClick={commonJs.resetCondition.bind(this,this,false)}>重置</button>
                    </div>
                </div>
                {/* 搜索条件 end */}
                <div  className="mt20 search-result" style={{"background":"#f5f5f5"}}>
                    <table className="pt-table layout-fixed workAllot-list">
                        <thead>
                            <tr className="th-bg">
                                <th width="5%">产品号</th>
                                <th width="15%">合同号</th>
                                <th width="5%">姓名</th>
                                <th width="10%">手机号</th>
                                <th width="10%">放款日期</th>
                                <th width="10%">还款方式</th>
                                <th width="5%">还款期数</th>
                                <th width="5%">门店</th>
                                <th width="5%">业务员</th>
                                <th width="10%">结论</th>
                                <th width="10%">原因分类</th>
                                <th width="10%">任务所有者</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (visitDataInfoDtos && visitDataInfoDtos.length>0)?visitDataInfoDtos.map((repy,i)=>{
                                    return <tr key={i}>
                                                <td title={commonJs.is_obj_exist(repy.productNo)}>{commonJs.is_obj_exist(repy.productNo)}</td>
                                                <td title={commonJs.is_obj_exist(repy.loanNumber)}>{commonJs.is_obj_exist(repy.loanNumber)}</td>
                                                <td title={commonJs.is_obj_exist(repy.custName)}>{commonJs.is_obj_exist(repy.custName)}</td>
                                                <td title={commonJs.is_obj_exist(repy.custPhone)}>{commonJs.is_obj_exist(repy.custPhone)}</td>
                                                <td title={commonJs.is_obj_exist(repy.fundingSuccessDate)}>{commonJs.is_obj_exist(repy.fundingSuccessDate)}</td>
                                                <td title={commonJs.is_obj_exist(repy.debitingChannel)}>{commonJs.is_obj_exist(repy.debitingChannel)}</td>
                                                <td title={commonJs.is_obj_exist(repy.installmentNumber)}>{commonJs.is_obj_exist(repy.installmentNumber)}</td>
                                                <td title={commonJs.is_obj_exist(repy.store)}>{commonJs.is_obj_exist(repy.store)}</td>
                                                <td title={commonJs.is_obj_exist(repy.employeeName)}>{commonJs.is_obj_exist(repy.employeeName)}</td>
                                                <td title={commonJs.is_obj_exist(repy.reasonDivFirst)}>{commonJs.is_obj_exist(repy.reasonDivFirst)}</td>
                                                <td title={commonJs.is_obj_exist(repy.reasonDiv)}>{commonJs.is_obj_exist(repy.reasonDiv)}</td>
                                                <td title={commonJs.is_obj_exist(repy.createdBy)}>{commonJs.is_obj_exist(repy.createdBy)}</td>
                                            </tr>
                                }):<tr><td colSpan="13" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
                <div className="cdt-th th-bg clearfix pl20 pt5 pb5 pr20">
                    {(visitDataInfoDtos&&visitDataInfoDtos.length>0)?
                        <div className="left" id='pageAtion'>
                            <Pagination
                                showQuickJumper
                                showSizeChanger
                                onShowSizeChange={this.onShowSizeChange.bind(this)}
                                defaultPageSize={this.state.barsNum}
                                defaultCurrent={1}
                                current={this.state.current}
                                total={this.state.totalSize}
                                onChange={this.pageChange.bind(this)}
                                pageSizeOptions={['10','25','50','100','200']}
                            />
                        </div>
                    :""}
                </div>
            </div>
        );
    }
};

export default avisitCase;