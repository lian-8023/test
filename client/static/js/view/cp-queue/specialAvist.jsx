// 特殊回访
import React from 'react';
import $ from 'jquery';
import { Pagination,DatePicker,Select } from 'antd';  
import {observer,inject} from "mobx-react";
import { Table, Column, HeaderCell, Cell ,TablePagination} from 'rsuite-table';   //table自定义调整列宽；
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import Channel from '../cp-module/channel'; //选择合作方select
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;

@inject('allStore') @observer
class SpecialAvist extends React.Component {
    constructor(props){
        super(props);
        // this.store=this.props.allStore.SearchResultTrStore;
        this.state = {
            visitDataInfoDtos:[],  //搜索结果
            channelSelectedObj:{},  //条件区选中的渠道
            barsNum:10,  //每页显示多少条
            current:1,
            totalSize:0,
            creditExtensionstartValue:null,
            creditExtensionendValue:null,
            paystartValue:null,
            payendValue:null
        };
    }
    componentDidMount() {
        this.init();
        cpCommonJs.getRuleGroup(this);  //获取权限用户组数据
        $(".rsuite-table.table-hover .rsuite-table-row-header .rsuite-table-cell").css("background","#f0f5fd");
        $(".rsuite-table .rsuite-table-body-info").css("background","#fff");
        
    }
    
    //初始化金额-回访
    init(){
        let that=this;
        $.ajax({
            type:"get", 
            url:"/node/reV/init", 
            async:true,
            dataType: "JSON", 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        authAmountEnums:[]
                   })
                }
               let _data=res.data;
               that.setState({
                    authAmountEnums:_data.authAmountEnums?_data.authAmountEnums:[]
               })
           }
       })
    }
    //时间组件，通用
    onChange = (field, value) => {
        this.setState({
          [field]: value,
        });
      }
      //放款日期
      paydisabledStartDate = (paystartValue) => {
          const payendValue = this.state.payendValue;
          if (!paystartValue || !payendValue) {
            return false;
          }
          return paystartValue.valueOf() > payendValue.valueOf();
        }
        paydisabledEndDate = (payendValue) => {
          const paystartValue = this.state.paystartValue;
          if (!payendValue || !paystartValue) {
            return false;
          }
          return payendValue.valueOf() <= paystartValue.valueOf();
        }
        payonStartChange = (value) => {
          this.onChange('paystartValue', value);
        }
        payonEndChange = (value) => {
          this.onChange('payendValue', value);
        }
        payhandleStartOpenChange = (open) => {
          if (!open) {
            this.setState({ payendOpen: true });
          }
        }
        payhandleEndOpenChange = (open) => {
          this.setState({ payendOpen: open });
        }
    //授信时间--搜索时间
    creditExtensionStartDate = (creditExtensionstartValue) => {
        const creditExtensionendValue = this.state.creditExtensionendValue;
        if (!creditExtensionstartValue || !creditExtensionendValue) {
        return false;
        }
        return creditExtensionstartValue.valueOf() > creditExtensionendValue.valueOf();
    }
    creditExtensionEndDate = (creditExtensionendValue) => {
        const creditExtensionstartValue = this.state.creditExtensionstartValue;
        if (!creditExtensionendValue || !creditExtensionstartValue) {
        return false;
        }
        return creditExtensionendValue.valueOf() <= creditExtensionstartValue.valueOf();
    }
    creditExtensionStartChange = (value) => {
        this.onChange('creditExtensionstartValue', value);
    }
    creditExtensionEndChange = (value) => {
        this.onChange('creditExtensionendValue', value);
    }
    creditExtensionStartOpenChange = (open) => {
        if (!open) {
        this.setState({ creditExtensionOpen: true });
        }
    }
    creditExtensionEndOpenChange = (open) => {
        this.setState({ creditExtensionOpen: open });
    }
    //全选
    selectAll(event){
        let $this=$(event.target);
        if($this.hasClass("myCheckbox-visited")){
            $this.closest(".search-result").find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }else {
            $this.closest(".search-result").find(".myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }   
        event.stopPropagation();
    }
    myCheckbox_fn(event){
        let $this=$(event.target);
        let $table=$this.closest(".search-result");
        if($this.hasClass("myCheckbox-normal")){
            $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }else {
            $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }
        let notAll=$table.find(".rsuite-table-body-row-wrapper").find(".myCheckbox-normal").length;  //tbody 未选中的checkbox个数
        let selected=$table.find(".rsuite-table-body-row-wrapper").find(".myCheckbox-visited").length;  //tbody 已经选中的checkbox个数
        let trLength=$table.find(".rsuite-table-body-row-wrapper").find(".rsuite-table-row").length;  //tbody tr的个数
        if(notAll>0){
            $table.find(".rsuite-table-header-row-wrapper").find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }
        if(selected==trLength){
            $table.find(".rsuite-table-header-row-wrapper").find(".myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }
    }
    //渠道切换事件
    channelChange(channelSelectedObj){
        this.setState({
            channelSelectedObj:channelSelectedObj,
        })
        let _pathName=this.props.location?this.props.location.pathname:"";
        $(".avisitType option").removeProp("selected");
        $(".avisitType option[value='"+_pathName+"']").prop("selected","true");
    }
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        $(".pt-table .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        this.setState({
            current: 1,
            barsNum:pageSize
        });
        this.searchHandle(true,1,pageSize);
    }
    //快速跳转到某一页。
    pageChange(page){
        $(".pt-table .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        this.setState({
            current: page
        });
        this.searchHandle(true,page,this.state.barsNum);
    }
    //获取条件
    getConditions(){
        let _parems={};  //条件
        let channelVal=this.state.channelSelectedObj.value;
        if(channelVal)_parems.productNo=channelVal;  
        let _fundTimeBegin=commonJs.dateToString2(this.state.paystartValue);   //放款时间-开始
        if(_fundTimeBegin!="1970-01-01" && _fundTimeBegin!='NaN-aN-aN')_parems.fundTimeBegin=_fundTimeBegin;  
        let _fundTimeEnd=commonJs.dateToString2(this.state.payendValue);   //放款时间-结束
        if(_fundTimeEnd!="1970-01-01" && _fundTimeEnd!='NaN-aN-aN')_parems.fundTimeEnd=_fundTimeEnd; 
        let _store=$(".return-visit-condition .store").val();  //门店
        if(_store)_parems.store=_store.replace(/\s/g,"");
        let _employee=$(".return-visit-condition .employee").val();  //消费代理人
        if(_employee)_parems.employee=_employee.replace(/\s/g,"");
        let _whetherRevisit=$(".whetherRevisit option:selected").attr("value");   //是否回访
        if(_whetherRevisit)_parems.whetherRevisit=_whetherRevisit;
        let _taskOwner=this.state.taskOwner;  //任务所有者
        if(_taskOwner&&_taskOwner!="-")_parems.code=_taskOwner;
        this.setState({
            conditions:_parems
        });
        return _parems;
    }
    //搜索 oldConditions等于true获取已经存在的条件，否则重新获取搜索条件
    searchHandle(oldConditions,pageNumber,pagesize){
        this.setState({
            current:pageNumber
        })
        $(".search-result .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        let that=this;
        let _parems={};
        if(oldConditions){
            _parems=this.state.conditions;
        }else{
            _parems=this.getConditions();
        }
        let _batchNumber=$(".return-visit-condition .batchNumber").val();  //批次号
        if(!_batchNumber){
            alert("请填写批次号！")
            return;
        }
        if(_batchNumber)_parems.batchNumber=_batchNumber.replace(/\s/g,"");   //批次号
        if(!_parems||Object.keys(_parems).length<=0){
            alert("请选填搜索条件！")
            return;
        }
        _parems.pageNumber=pageNumber;
        _parems.pagesize=pagesize;
        $.ajax({
             type:"post", 
             url:"/node/reV/search-special", 
             async:true,
             dataType: "JSON", 
             data:_parems, 
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
                 let _visitDataInfoDtos=_data.specialRevisitInfoDTOS?_data.specialRevisitInfoDTOS:[]; //搜索结果list
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
    //关闭弹窗
    closeDispatchPop(e){
        let doms_normal=$(".search-result .myCheckbox");
        doms_normal.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        let $this=$(e.target);
        $this.closest(".dispatch-pop").addClass("hidden");
        $(".dispatch-pop .ant-select-selection-selected-value").text("请选择");
        this.setState({
            dispathCode:""
        })
    }
    // 分配弹窗
    showDistributePop(){
        let pop=$(".dispatch-pop");
        if($(".search-result .rsuite-table-body-row-wrapper").find(".myCheckbox-visited").length<=0){
            alert("请选择分配内容！");
            return;
        }
        pop.removeClass("hidden");
    }
    //分配
    distribute(){
        let _obj={};
        let _arr = [];
        let that=this;
        let data=this.state.visitDataInfoDtos;  //搜索获取的数据
        $(".search-result .rsuite-table-body-wheel-area .rsuite-table-row").each(function(){
            let n=""; //用 myCheckbox-visited 的tr下标去获取搜索数据的下标
            let checkBox=$(this).find(".myCheckbox");
            if(checkBox.hasClass("myCheckbox-visited")){
                n=$(this).index();
                data[n].custName=data[n].name;
                _arr.push(data[n]);
            }
        });
        let _code=this.state.dispathCode;
        if(!_code){
            alert("请选择分配对象！");
            return;
        }
        let _bindBy=this.state.dispathEmail;
        if(!_bindBy){
            alert("请选择分配对象！");
            return;
        }
        _obj={
            assignInfoDTOS:_arr,
            code:_code,
            bindBy:_bindBy,
            fromWhere:"special"
        };
        $.ajax({
            type:"post", 
            url:"/node/reV/assignSpecial", 
            async:true,
            dataType: "JSON", 
            data:{josnParam:JSON.stringify(_obj)}, 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _data=res.data;
                alert(_data.message);
                let doms_normal=$(".search-result .myCheckbox");
                doms_normal.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                $(".dispatch-pop").addClass("hidden");
                $(".dispatch-pop .ant-select-selection-selected-value").text("请选择");
                let _pathName=that.props.location?that.props.location.pathname:"";
                $(".avisitType option").removeProp("selected");
                $(".avisitType option[value='"+_pathName+"']").prop("selected","true");
                that.setState({
                    dispathCode:""
                });
                that.searchHandle(true,that.state.current,that.state.barsNum);
           }
       });
    }
    //选择分配人员弹窗
    handleChange(value,option) {
        this.setState({
            dispathCode:option.props?option.props.value:"",
            dispathEmail:option.props?option.props.children:""
        })
        let adminNameMaps=this.state.adminNameMaps;
        for(let i=0;i<adminNameMaps.length;i++){
            if(adminNameMaps[i].code==value){
                $(".dispatch-pop .ant-select-selection-selected-value").text(adminNameMaps[i].name);
            }
        }
    }
    //清空分配人员选择
    distributeDeselect(value){
        if(value==undefined){
            this.setState({
                dispathCode:"",
                dispathEmail:""
            })
        }
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
        let { paystartValue, payendValue, payendOpen} = this.state;  //搜索条件区的日期
        let adminNameMaps=this.state.adminNameMaps;
        const Option = Select.Option;
        let TableHeight=80;
        let visitDataInfoDtos=this.state.visitDataInfoDtos?this.state.visitDataInfoDtos:[];
        let dataLenght=visitDataInfoDtos.length;
        if(visitDataInfoDtos){
            if(dataLenght>0&&dataLenght<10){
                TableHeight=dataLenght*80;
            }else if(dataLenght>=10){
                TableHeight=360;
            }
        }
        // 是否回访
        const RevisitOrNotCell = ({ rowData, dataKey, ...props }) => (
            <Cell {...props}>
                {rowData[dataKey]?"是":"否"}
            </Cell>
        );
        return (
            <div  className="content" id="content">
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar return-visit-condition clearfix pb10 pr20 pl20" data-resetstate="paystartValue,payendValue,creditExtensionstartValue,creditExtensionendValue">
                    <dl className="left mt10">
                        <dt>批次号</dt>
                        <dd>
                            <input type="text" className="input batchNumber" id='batchNumber' placeholder="批次号"/>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt className="left">产品</dt>
                        <dd><Channel onChange={this.channelChange.bind(this)} /></dd>  {/* 合作方 */}
                    </dl>
                    <dl className="left mt10">
                        <dt>放款日期</dt>
                        <dd>
                            <div style={{"width":"45%","display":"inline-block"}} id='paystartValue'>
                                <DatePicker
                                    disabledDate={this.paydisabledStartDate.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={paystartValue}
                                    placeholder="Start"
                                    onChange={this.payonStartChange.bind(this)}
                                    onOpenChange={this.payhandleStartOpenChange.bind(this)}
                                />
                            </div>
                                <span className="pl5 pr5">-</span>
                                <div style={{"width":"45%","display":"inline-block"}} id='payendValue'>
                                    <DatePicker
                                        disabledDate={this.paydisabledEndDate.bind(this)}
                                        format="YYYY-MM-DD"
                                        value={payendValue}
                                        placeholder="End"
                                        onChange={this.payonEndChange.bind(this)}
                                        open={payendOpen}
                                        onOpenChange={this.payhandleEndOpenChange.bind(this)}
                                    />
                                </div>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt>门店</dt>
                        <dd>
                            <input type="text" className="input store" id='store' placeholder="门店"/>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt>消费代理人</dt>
                        <dd>
                            <input type="text" className="input employee" id='employee' placeholder="消费代理人"/>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt>是否回访</dt>
                        <dd>
                            <select className="select-gray whetherRevisit" name="" id="whetherRevisit">
                                <option value="" hidden>请选择</option>
                                <option value="">全部</option>
                                <option value="1">是</option>
                                <option value="0">否</option>
                            </select>
                        </dd>
                    </dl>
                    <dl className="left mt10">
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
                                            return <Option value={repy.code} key={i} >{repy.name}</Option>
                                        }):<option value = "">没有数据</option>
                                    }
                                </Select>
                        </dd>
                    </dl>
                    <div className="left ml10 mt10">
                        <button className="btn-blue left mr5" id='searchBtn' onClick={this.searchHandle.bind(this,false,1,this.state.barsNum)}>搜索</button>
                        <button className="btn-white left" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                    </div>
                </div>
                {/* 搜索条件 end */}
                <div  className="mt20 search-result bar" style={{"background":"#f5f5f5"}}>
                    <Table 
                        bordered 
                        locale={
                            {emptyMessage: '暂未查到相关数据...'}
                          }
                        height={TableHeight}
                        data={visitDataInfoDtos}
                    >
                        <Column width={250} resizable>
                            <HeaderCell>合同号</HeaderCell>
                            <Cell dataKey="loanNumber" />
                        </Column>
                        <Column width={250} resizable>
                            <HeaderCell>订单号</HeaderCell>
                            <Cell dataKey="orderNo" />
                        </Column>
                        <Column width={100} resizable>
                            <HeaderCell>产品号</HeaderCell>
                            <Cell dataKey="productNo" />
                        </Column>
                        <Column width={200} resizable>
                            <HeaderCell>门店</HeaderCell>
                            <Cell dataKey="store" />
                        </Column>
                        <Column width={80} resizable>
                            <HeaderCell>是否已回访</HeaderCell>
                            <RevisitOrNotCell dataKey="revisitOrNot" />
                        </Column>
                        <Column width={200} resizable>
                            <HeaderCell>放款时间</HeaderCell>
                            <Cell dataKey="fundingSuccessDate" />
                        </Column>
                        <Column width={200} resizable>
                            <HeaderCell>服务代理商</HeaderCell>
                            <Cell dataKey="employee" />
                        </Column>
                        <Column width={120} resizable>
                            <HeaderCell>客户名称</HeaderCell>
                            <Cell dataKey="name" />
                        </Column>
                        <Column width={200} resizable>
                            <HeaderCell>分配人</HeaderCell>
                            <Cell dataKey="bindBy" />
                        </Column>

                        <Column width={100} resizable>
                            <HeaderCell>
                                <i className="myCheckbox myCheckbox-normal left mr5" id='selectAll' onClick={this.selectAll.bind(this)}></i>
                                <a  data-btn-rule="RULE:FUND:ASSIGN:TREE" id='dispatchBtn' className="btn-blue left" style={{marginTop:'-5px'}} onClick={this.showDistributePop.bind(this)}>分配</a>
                            </HeaderCell>
                            <Cell>
                                <i className="myCheckbox myCheckbox-normal" onClick={this.myCheckbox_fn.bind(this)}></i>
                            </Cell>   
                        </Column>
                    </Table>
                </div>
                <div className="cdt-th th-bg clearfix pl20 pt5 pb5 pr20">
                    {(visitDataInfoDtos&&visitDataInfoDtos.length>0)?
                        <div>
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
                        </div>
                    :""}
                </div>
                {/*分配弹窗*/}
                <div className="dispatch-pop hidden">
                    <div className="tanc_bg"></div>
                    <div className="dispatch-box clearfix">
                        <div className="left search-box clearfix mr10 dispathToName" id='dispathToName'>
                            <Select
                                showSearch
                                allowClear
                                style={{ width: 200 }}
                                placeholder="请选择"
                                optionFilterProp="children"
                                onSelect={this.handleChange.bind(this)}
                                onChange={this.distributeDeselect.bind(this)}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {
                                    (adminNameMaps && adminNameMaps.length>0) ? adminNameMaps.map((repy,i)=>{
                                        return <Option value={repy.code} key={i}>{repy.name}</Option>
                                    }):<option value = "">没有数据</option>
                                }
                            </Select>
                        </div>
                        <a id='distribute' className="btn-deep-yellow left mr10" style={{"height":"30px","lineHeight":"30px"}} onClick={this.distribute.bind(this)}>确定</a>
                        <a id='distributeClose' className="btn-white left" style={{"height":"28px","lineHeight":"28px"}} onClick={this.closeDispatchPop.bind(this)}>取消</a>
                    </div>
                </div>
            </div>
        );
    }
};

export default SpecialAvist;