import React from 'react';
import $ from 'jquery';
import { Table, Column, HeaderCell, Cell ,TablePagination} from 'rsuite-table';   //table自定义调整列宽；

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import ChangeLabel2A from '../../source/common/changeLabel2A';
let changeLabel2A=new ChangeLabel2A;
import ChangeLabelCP from '../../source/common/changeLabelCP';
let changeLabelCP=new ChangeLabelCP;
import LabelBody from '../common/labelBody';
import AccountBar from '../A2-module/AccountBar'  // 横向的信息栏

import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class Index extends React.Component{
    constructor(props){
        super(props);
        this.userInfoCP=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.topBindNumberStore=this.props.allStore.TopBindNumberStore;  //顶部绑定（完成）数显示-通用 2A portal
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息  
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2A PORTAL用户详情-UserMsg组件信息 
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            rowData:{},//给labelBody.jsx组件的数据
            _labelBody_reload:"reload", //labelBody.jsx组件是否刷新
            isBarUpdata:"noload",  //操作类型：noload表示AccountBar不重新加载数据
            params_rigPage:this.props.params.rigPage,  //右侧页面对应的路由值
            _location:"",//当前打开queue对应唯一标识
            oldConditions:{},  //重复的搜索条件，用于保存record后更新搜索列表

            displayLength: 100,  //默认显示多少行数据
            r_page:1,   //当前页码
            totalSize:0
        }
    }
    @action UNSAFE_componentWillMount(){
        this.labelBoxStore.lef_page="";
        this.labelBoxStore.rig_page="";
    }
    componentDidMount(){
        commonJs.reloadRules();
        $(".cdt-result").on('click','.rsuite-table-body-row-wrapper .myCheckbox',function(event){
            let self=$(event.target);
            self.parent().siblings().find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            let _state=self.hasClass("myCheckbox-normal");
            if(_state){
                self.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            }else {
                self.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            }
            event.stopPropagation();
        })
    }

    /**
     *
     * 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    changeLeft(index,right_index){
        var leftHtml = this.getLeftHtml(parseInt(index));
        this.setState({
            lef_page:leftHtml
        },()=>{
            $(".Csearch-left-page li").removeClass("on");
            $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
        })
    }

    //展开收起搜索结果列表
    showSearchList(e){
        let $this=$(e.target);
        let $table=$this.closest(".cdt-result").find(".rsuite-table");
        if($this.hasClass("cdtIcon")){
            $this=$this.parent();
        }
        let cdtIcon=$this.find(".cdtIcon");
        if(cdtIcon.hasClass("cdt-off")){
            cdtIcon.removeClass("cdt-off").addClass("cdt-on");
            $table.animate({"max-height":"245px"});
        }else{
            cdtIcon.removeClass("cdt-on").addClass("cdt-off");
            $table.animate({"max-height":"90px"});
        }
    }
    //获取搜索条件
    getConditions(){
        let parem={};
        let productNo=$('.top .productNoEnums option:selected').attr('value');
        parem.productNo=productNo;
        let customerId=$('.top .customerId').val();
        if(customerId&&customerId.replace(/\s/g,'')) parem.customerId=customerId.replace(/\s/g,'');
        let loanNumber=$('.top .loanNumber').val();
        if(loanNumber&&loanNumber.replace(/\s/g,'')) parem.loanNumber=loanNumber.replace(/\s/g,'');
        parem.pagesize=this.state.displayLength;
        return parem;
    }
    /**
     * 搜索
     * @param {*} fromBtn 是否是点击搜索按钮
     */
    RmdSearch(fromBtn,pageNumber){
        let _that=this;
        let _data={};
        if(fromBtn){
            _data=this.getConditions();
            this.setState({
                oldConditions:_data,
            })
        }else{
            _data=this.state.oldConditions;
        }
        _data.pageNumber=pageNumber;
        console.log(_data);
        if(!_data.productNo){
            alert("请选择合作方！");
            return;
        }
        $.ajax({
            type:"post",
            url:'/node/remind/searchList',
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                $(".rsuite-table-body-row-wrapper .rsuite-table-row").removeClass("tr-on");
                commonJs.ajaxGetCode(res);
                let _getData = res.data;
                if(!_getData.executed){
                    _that.setState({
                        resultList: [],
                        Rmd_Q_ajax:{},
                        _oper_type:"next",
                        r_page:1,  //当前页码
                        selectedQueueStatusEnums:[],
                        _labelBody_reload:"reload",
                        totalSize:0,  //总条数
                    });
                    return;
                }
                let _resultList=cpCommonJs.opinitionArray(_getData.repaymentReminderInfoDTOS);
                _that.setState({
                    resultList:_resultList,
                    totalSize:_getData.total,  //总条数
                    r_page:_getData.pageNum,
                    get_productNo:_getData.productNo
                })
                if(fromBtn){
                    $(".labelBodyDiv").addClass("hidden");  //仅点击搜索按钮时，隐藏下面labelBody页面
                    _that.setState({
                        selectedQueueStatusEnums:[],
                    })
                }else{
                    _that.setState({
                        selectedQueueStatusEnums:[],
                    })
                }
                $(".paageNo .ant-pagination-item").removeClass("ant-pagination-item-active");
                $(".paageNo .ant-pagination-item-"+_that.state.r_page+"").addClass("ant-pagination-item-active");
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //切换页码的回调函数
    handleChangePage(dataKey) {
        let remdResultList=this.state.resultList?this.state.resultList:[];
        const { displayLength } = this.state;
        this.setState({
            r_page:dataKey,
        },()=>{
            this.RmdSearch(true,dataKey);
        });
    }
    //切换显示条目数的回调函数 
    handleChangeLength(dataKey) {
        this.setState({
            displayLength: dataKey,
            r_page:1
        },()=>{
            this.RmdSearch(true,1);
        })
    }
    formatLengthMenu(lengthMenu) {
        return (
          <div className="table-length">
            <span> 每页 </span>
            {lengthMenu}
            <span>∧ 条 </span>
          </div>
        );
        this.setState({
            r_page:1
        });
    }
    formatInfo(total, activePage) {
        return (
          <span>共 <i>{total}</i> 条数据</span>
        );
    } 
    // 详情--select框切换合同号
    changeDetLoanNo(NO){
        var n=$(".Csearch-left-page .on").attr("data-id");
        this.setState({
            case_ocr_loanNumber:NO
        },()=>{
            this.changeLeft(n,null);
            this.setState({
                isBarUpdata:"noload",
                _userMsg_reload:"noload",
            })
        })
    }
    //渠道切换事件
    channelChange(event){
        let channelVal=$(event.target).find("option:selected").attr("value");
        let platformFlag=$(event.target).find("option:selected").attr("data-platformFlag");
        this.setState({
            channelVal:channelVal,
            platformFlag:platformFlag
        })
        if(channelVal=="2A"){
            $(".conditionBox .sourceQuotient").removeClass("hidden");
        }else{
            $(".conditionBox .sourceQuotient").addClass("hidden");
        }
    }
    /**
     * 2A PORTAL切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    @action changeLeft2A(index){
        $(".Csearch-left-page li").removeClass("on");
        $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
        var lef_current_page=$(".Csearch-left-page .nav").find(".on").attr("data-id");
        changeLabel2A.changeLeft2A(parseInt(lef_current_page),this);
    }
    /** coopration 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    @action changeLeftCP(index,right_index){
        var leftHtml = changeLabelCP.getLeftHtml(parseInt(index),this);
        this.labelBoxStore.lef_page=leftHtml;
        $(".Csearch-left-page li").removeClass("on");
        $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
    }
    render() {
        let resultList=this.state.resultList?this.state.resultList:[]; //搜索结果列表--总条数
        let TableHeight=80;
        let dataLenght=resultList.length;
        if(resultList){
            if(dataLenght>0&&dataLenght<5){
                TableHeight=dataLenght*81;
            }else if(dataLenght>=5&&dataLenght<10){
                TableHeight=dataLenght*41;
            }else if(dataLenght>=10){
                TableHeight=360;
            }
        }
        return (
            <div className="content" id="content">
                <div data-isresetdiv="yes">
                    <div className="top">
                        <div className="clearfix">
                            <select name="" id="productNoEnumsSel" className="left select-gray productNoEnums mr10 mt10" style={{"width":"160px"}} onChange={this.channelChange.bind(this)}>
                                <option value="" hidden>合作方</option>
                                <option value="2A" data-platformFlag='2A'>小雨点-2A</option>
                                <option value="2C" data-platformFlag='XYH'>小雨花-2C</option>
                                <option value="17C" data-platformFlag='TH'>普惠消费贷-17C</option>
                            </select>
                            <input type="text" name="" placeholder="贷款号" className="input left mr10 mt10 loanNumber" id='loanNumber' />
                            <input type="text" name="" placeholder="customerId" className="input left mr10 mt10 customerId" id='customerId' style={{width:'14%'}} />
                            <div className="left">
                                <button className="left mr10 mt10 btn-blue getCQ-btn" id='searchBtn' onClick={this.RmdSearch.bind(this,true,1)}>搜索</button>
                                <button className="left mr10 mt10 btn-white" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="cdt-result bar mt20 relative">
                        <Table 
                            bordered 
                            locale={
                                {emptyMessage: '暂未查到相关数据...'}
                              }
                            height={TableHeight}
                            data={resultList}    
                            onRowClick={(rowData)=>{
                                $(".rsuite-table-body-row-wrapper .rsuite-table-row").removeClass("tr-on");
                                $(".rsuite-table-body-row-wrapper .rsuite-table-row:eq("+resultList.indexOf(rowData)+")").addClass("tr-on");
                                let _rowData=Object.assign({},rowData);
                                _rowData.productNo=this.state.get_productNo;
                                _rowData.platformFlag=this.state.platformFlag;
                                _rowData.cooperationFlag=this.state.get_productNo;
                                if(this.state.platformFlag=='2A'){
                                    _rowData.accountId=_rowData.customerId;
                                }
                                commonJs.changeLabelBoxFn(this,_rowData,changeLabel2A,changeLabelCP,{isChange:true,changeNo:21},{isChange:true,changeNo:4});
                                this.setState({
                                    top_loanNumber:rowData.loanNumber,
                                    _installments:rowData.installmentNumber,
                                    _name:rowData.name,
                                    _payDate:rowData.payDay,
                                    _amount:rowData.amount,
                                    _oper_type:"next",  //collection 获取上数据时的搜索类型
                                    productNo:rowData.productNo, //合作方，3C.4A...
                                    rowData:rowData
                                });
                                $(".labelBodyDiv").removeClass("hidden");
                                commonJs.cancelSaveQ();
                            }}
                        >
                            <Column width={300} resizable>
                                <HeaderCell>合同号</HeaderCell>
                                <Cell dataKey="loanNumber" />
                            </Column>
                            
                            <Column width={300} resizable>
                                <HeaderCell>订单号</HeaderCell>
                                <Cell dataKey="orderNo" />
                            </Column>

                            <Column width={300} resizable>
                                <HeaderCell>还款日</HeaderCell>
                                <Cell dataKey="originalDueDate" />
                            </Column>

                            <Column width={300} resizable>
                                <HeaderCell>借款金额</HeaderCell>
                                <Cell dataKey="amount" />
                            </Column>

                            <Column width={200} resizable>
                                <HeaderCell>CustomerID</HeaderCell>
                                <Cell dataKey="customerId" />
                            </Column>

                            <Column width={300} resizable>
                                <HeaderCell>截至当前未还总金额</HeaderCell>
                                <Cell dataKey="notPaidAmountCurrentDate" />
                            </Column>
                        </Table>
                        <TablePagination
                            formatLengthMenu={this.formatLengthMenu.bind(this)}
                            formatInfo={this.formatInfo.bind(this)}
                            displayLength={this.state.displayLength}
                            activePage={this.state.r_page}
                            total={this.state.totalSize}
                            onChangePage={this.handleChangePage.bind(this)}
                            onChangeLength={this.handleChangeLength.bind(this)}
                        />
                    <div className="cdt cdt2" onClick={this.showSearchList.bind(this)} id='toggleList'><i className="cdtIcon cdt-on"></i></div>
                </div>
                {/* 搜索条件下面的信息栏 */}
                {
                    this.state.get_productNo=="2A"?
                    <AccountBar loanNumberChange={this.changeDetLoanNo.bind(this)} />
                    :""
                }
                <div className="mt20 clearfix labelBodyDiv hidden">
                    <LabelBody 
                        rigPage={this.props.params.rigPage} 
                        _oper_type={this.state._oper_type}
                        _labelBody_reload={this.state._labelBody_reload}
                        // updateList={this.RmdSearch.bind(this)}   //搜索方法
                        rowData={this.state.rowData}
                        A2LeftComponent={['userMsg']}  //2A portal-左侧页面需要显示的组件配置
                        A2RightComponent={['repaymentRemind']}  //2A portal-右侧页面需要显示的组件配置
                        CPLeftComponent={['userMsg','file','repaymentList','withholdList']}  //cooperation portal-左侧页面需要显示的组件配置
                        CPRightComponent={['repaymentRemind']}  //cooperation portal-右侧页面需要显示的组件配置
                    />
                </div>
            </div>
        )
    }
};
let inpW={
    width:'180px'
}
export default Index;  //ES6语法，导出模块