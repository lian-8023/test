import React from 'react';
import $ from 'jquery';
import { Table, Column, HeaderCell, Cell ,TablePagination} from 'rsuite-table';   //table自定义调整列宽；

import Collection from '../Collection/Collection';

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;import ChangeLabel2A from '../../source/common/changeLabel2A';
let changeLabel2A=new ChangeLabel2A;
import ChangeLabelCP from '../../source/common/changeLabelCP';
let changeLabelCP=new ChangeLabelCP;
import LabelBody from '../common/labelBody';
import AccountBar from '../A2-module/AccountBar'  // 横向的信息栏

import SortTimeJs from '../../source/common/sortTime';
var sortTimeJs=new SortTimeJs;

import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";
import CpCommonJs from '../../source/cp-portal/common';

@inject('allStore') @observer
class ReminderIndex extends React.Component{
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
            _oper_type:"search",//操作类型，search=搜索按钮、next=下一条、bar导航
            isBarUpdata:"noload",  //操作类型：noload表示AccountBar不重新加载数据
            getQueue:[], //顶部获取到的合同号 array
            params_rigPage:this.props.params.rigPage,  //右侧页面对应的路由值
            _location:"",//当前打开queue对应唯一标识
            clickNextNumber:0,
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
        var _that=this;
        commonJs.reloadRules();
        // this.topBindNumberStore.initCount("/node/remind/count",'get');
        
        var h = document.documentElement.clientHeight;
        if(this.props._params_rigPage!="reminder" ){
            $("#content").height(h-40);
        }
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

        //点击页面隐藏 任务状态 弹窗
        $(document).bind('click',function(e){ 
            var e = e || window.event; //浏览器兼容性 
            var elem = e.target || e.srcElement; 
            while (elem) { //循环判断至跟节点，防止点击的是div子元素 
                if (elem.id && elem.id=='customSelect-ul') { 
                    return; 
                } 
                if($(elem).closest(".customSelect").length>0){
                    return;
                }
            elem = elem.parentNode; 
            } 
            $("#customSelect-ul").addClass("hidden");
            $("#customSelect-icon").removeClass("cs-icon-on");
        }); 
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
            $table.animate({"max-height":"42px"});
        }
    }
    //改派弹窗
    dispatchPop(){
        let _array=[];
        let pop=$(".dispatch-pop");
        let resultList=this.state.resultList?this.state.resultList:[];  //总的搜索结果数据
        if($(".rsuite-table-body-row-wrapper").find(".myCheckbox-visited").length<=0){
            alert("请选择改派内容！");
            return;
        }
        $(".rsuite-table-body-row-wrapper .rsuite-table-row").each(function(){
            if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                let n=$(this).index();
                _array.push(resultList[n].id);
            }
        })
        if(pop.hasClass("hidden")){
            pop.removeClass("hidden");
            this.setState({
                dispatchArray:_array
            })
        }else{
            pop.addClass("hidden");
        }
    }
    //关闭弹窗
    closeDispatchPop(e){
        let $this=$(e.target);
        $this.closest(".dispatch-pop").addClass("hidden");
    }
    //获取搜索条件
    getConditions(){
        let parem={};
        let district=$('.top .district').val();
        let cooperationFlag = $('.top #productNoEnums').val();
        cooperationFlag?parem.cooperationFlag = cooperationFlag:'';
        if(district&&district.replace(/\s/g,'')) parem.district=district.replace(/\s/g,'');
        let loanNumber=$('.top .loanNumber').val();
        if(loanNumber&&loanNumber.replace(/\s/g,'')) parem.loanNumber=loanNumber.replace(/\s/g,'');
        let orderNumber=$('.top .orderNumber').val();
        if(orderNumber&&orderNumber.replace(/\s/g,'')) parem.orderNumber=orderNumber.replace(/\s/g,'');
        let nationalId=$('.top .nationalId').val();
        if(nationalId&&nationalId.replace(/\s/g,'')) parem.nationalId=nationalId.replace(/\s/g,'');
        let daysInDefault1Start=$('.top .daysInDefault1Start').val();
        if(daysInDefault1Start&&daysInDefault1Start.replace(/\s/g,'')) parem.daysInDefault1Start=daysInDefault1Start.replace(/\s/g,'');
        let daysInDefault1End=$('.top .daysInDefault1End').val();
        if(daysInDefault1End&&daysInDefault1End.replace(/\s/g,'')) parem.daysInDefault1End=daysInDefault1End.replace(/\s/g,'');
        let daysInDefault2Satrt=$('.top .daysInDefault2Satrt').val();
        if(daysInDefault2Satrt&&daysInDefault2Satrt.replace(/\s/g,'')) parem.daysInDefault2Satrt=daysInDefault2Satrt.replace(/\s/g,'');
        let daysInDefault2End=$('.top .daysInDefault2End').val();
        if(daysInDefault2End&&daysInDefault2End.replace(/\s/g,'')) parem.daysInDefault2End=daysInDefault2End.replace(/\s/g,'');
        let daysInDefault3Start=$('.top .daysInDefault3Start').val();
        if(daysInDefault3Start&&daysInDefault3Start.replace(/\s/g,'')) parem.daysInDefault3Start=daysInDefault3Start.replace(/\s/g,'');
        let daysInDefault3End=$('.top .daysInDefault3End').val();
        if(daysInDefault3End&&daysInDefault3End.replace(/\s/g,'')) parem.daysInDefault3End=daysInDefault3End.replace(/\s/g,'');
        let dueDaysStart=$('.top .dueDaysStart').val();
        if(dueDaysStart&&dueDaysStart.replace(/\s/g,'')) parem.dueDaysStart=dueDaysStart.replace(/\s/g,'');
        let dueDaysEnd=$('.top .dueDaysEnd').val();
        if(dueDaysEnd&&dueDaysEnd.replace(/\s/g,'')) parem.dueDaysEnd=dueDaysEnd.replace(/\s/g,'');

        let creditModelGradeStart=$('.top .creditModelGradeStart').val();
        if(creditModelGradeStart&&creditModelGradeStart.replace(/\s/g,'')) parem.creditModelGradeStart=creditModelGradeStart.replace(/\s/g,'');
        let creditModelGradeEnd=$('.top .creditModelGradeEnd').val();
        if(creditModelGradeEnd&&creditModelGradeEnd.replace(/\s/g,'')) parem.creditModelGradeEnd=creditModelGradeEnd.replace(/\s/g,'');
        parem.pageNumber=this.state.r_page;
        parem.pagesize=this.state.displayLength;
        return parem;
    }
    /**
     * 搜索
     * @param {*} fromBtn 是否是点击搜索按钮
     */
    RmdSearch(fromBtn){
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
        console.log(_data);
        if(Object.keys(_data).length<=0){
            alert("至少输入一个搜索条件！");
            return;
        }
        $.ajax({
            type:"post",
            url:'/node/remind/query/conditions',
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
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
                let _resultList=_getData.reminderInfoDTOS;
                let reg = /(.{5}).*(.{5})/;
                for(let i=0;i<_resultList.length;i++){
                    _resultList[i].nationalId_scr=commonJs.is_obj_exist(_resultList[i].nationalId).replace(reg, "$1****$2");
                    if(_resultList[i].productNo == '17C'){
                        _resultList[i].fromFlag == 'TH';
                    }else{
                        _resultList[i].fromFlag == 'AG';
                    }
                }
                _that.setState({
                    resultList:_resultList,
                    totalSize:_getData.totalSize,  //总条数
                    r_page:_getData.pageNum,
                    displayLength:_getData.pageSize
                })
                if(fromBtn){
                    $(".labelBodyDiv").addClass("hidden");  //仅点击搜索按钮时，隐藏下面labelBody页面
                    // let _rowData=_that.labelBoxStore.rowData;
                    // commonJs.changeLabelBoxFn(_that,_rowData,changeLabel2A,changeLabelCP,{isChange:true,changeNo:8},{isChange:true,changeNo:2});
                    _that.setState({
                        clickNextNumber:0,
                        selectedQueueStatusEnums:[],
                    })
                }else{
                    // _that.topBindNumberStore.initCount("/node/remind/count",'get');
                    _that.setState({
                        clickNextNumber:0,
                        selectedQueueStatusEnums:[],
                    })
                }
                // $(".rsuite-table-body-row-wrapper .rsuite-table-row").removeClass("tr-on");
                // $(".rsuite-table-body-row-wrapper .rsuite-table-row:eq("+_that.state.clickNextNumber+")").addClass("tr-on");
                $(".search-next").removeClass("hidden");
                $(".paageNo .ant-pagination-item").removeClass("ant-pagination-item-active");
                $(".paageNo .ant-pagination-item-"+_that.state.r_page+"").addClass("ant-pagination-item-active");
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    // reminder搜索下一条
    RmdSearchNext(isFromBtn){
        let _that=this;
        let rig_current_page=$(".cont-right .nav").find(".on").attr("data-id");
        let _resultList=this.state.resultList;  //搜索结果列表数据
        let _clickNextNumber=this.state.clickNextNumber;  //点击次数
        $(".rsuite-table-body-row-wrapper .rsuite-table-row").removeClass("tr-on");
        $(".rsuite-table-body-row-wrapper .rsuite-table-row:eq("+this.state.clickNextNumber+")").addClass("tr-on");
        if(_clickNextNumber>=_resultList.length){
            $("#loading").remove();
            alert("无数据！");
            this.setState({
                rowData:{},  //存到state，给labelBody.jsx组件用
                Rmd_Q_ajax:{},
                _params:"",
                _userMsg_reload:"reload",
                _oper_type:"next",
                isBarUpdata:"reload",
            });
            //刷新labelBox组件
            if(isFromBtn)commonJs.changeLabelBoxFn(_that,{},this.props.params.rigPage,changeLabel2A,changeLabelCP,{isChange:true,changeNo:8},{isChange:true,changeNo:2});
            return;
        }
        let _r_name=_resultList[_clickNextNumber].name;
        let _r_payDate=_resultList[_clickNextNumber].payDay;
        let _r_amount=_resultList[_clickNextNumber].amount;
        let _currentLoanNo=_resultList[_clickNextNumber].loanNumber;  //用于搜索下一条的合同号
        $.ajax({
            type:"get",
            url:"/node/remind/query/loanNumber",
            async:false,
            dataType: "JSON",
            timeout : 30000, //超时时间设置，单位毫秒
            data:{
                loanNumber:_currentLoanNo,
            },
            success:function(res) {
                commonJs.ajaxGetCode(res);
                $(".labelBodyDiv").removeClass("hidden");
                commonJs.cancelSaveQ();
                let _getData = res.data;
                if(!_getData.executed){
                    _that.setState({
                        rowData:{},  //存到state，给labelBody.jsx组件用
                        _oper_type:"next",
                        clickNextNumber:0,
                        isBarUpdata:"reload"
                    });
                    //刷新labelBox组件
                    if(isFromBtn)commonJs.changeLabelBoxFn(_that,{},changeLabel2A,changeLabelCP,{isChange:true,changeNo:8},{isChange:true,changeNo:2});
                    return;
                }
                if(_getData.status=="blind"){
                    alert("当前queue已被"+_getData.user+"绑定！");
                }
                let _rowData=_resultList[_clickNextNumber];
                _that.setState({
                    rowData:_rowData,  //存到state，给labelBody.jsx组件用
                    _name:_r_name,
                    _payDate:_r_payDate,
                    _amount:_r_amount,
                    _oper_type:"next",
                    clickNextNumber:_clickNextNumber+1,
                });
                _that.commonStore.remanderNextData=_getData;
                //刷新labelBox组件
                _rowData.orderNo=_resultList[_clickNextNumber].orderNumber;
                
                if(_rowData.productNo == '17C'){
                    _rowData.platformFlag = 'TH';
                }else{
                    _rowData.platformFlag = 'AG';
                }
                if(isFromBtn)commonJs.changeLabelBoxFn(_that,_rowData,changeLabel2A,changeLabelCP,{isChange:true,changeNo:8},{isChange:true,changeNo:2});
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
    //任务状态选择li
    selectedLi(event){
        let $this=$(event.target);
        let _selectdArray=this.state.selectdArray;
        let thisText=$this.parent().find("span").text();
        if($this.hasClass("myCheckbox-normal")){
            $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            _selectdArray.push(thisText);
            this.setState({
                selectdArray:_selectdArray,
                _selected:_selectdArray.join(",")
            })
        }else{
            $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            let index =_selectdArray.indexOf(thisText);
            if (index > -1) {
                _selectdArray.splice(index, 1);
            }
            this.setState({
                selectdArray:_selectdArray,
                _selected:_selectdArray.join(",")
            })
        }
    }
    // 任务状态获取焦点
    selectTriger(event){
        let $this=$(event.target);
        let $parent=$this.closest(".customSelect");
        let $ul=$parent.find(".customSelect-ul");
        let $icon=$parent.find(".cs-icon");
        if($ul.hasClass("hidden")){
            $ul.removeClass("hidden");
            $icon.addClass("cs-icon-on");
        }else{
            $ul.addClass("hidden");
            $icon.removeClass("cs-icon-on");
        }
    }
    //切换页码的回调函数
    handleChangePage(dataKey) {
        let remdResultList=this.state.resultList?this.state.resultList:[];
        const { displayLength } = this.state;
        this.setState({
            r_page:dataKey,
        },()=>{
            this.RmdSearch(true);
        });
    }
    //切换显示条目数的回调函数 
    handleChangeLength(dataKey) {
        this.setState({
            displayLength: dataKey,
            r_page:1
        },()=>{
            this.RmdSearch(true);
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
    // 排序
    sort(sortKey,event){
        let that=this;
        $(".cdt-result .rsuite-table-body-row-wrapper .rsuite-table-row").removeClass("tr-on");
        sortTimeJs.sortTime(this.state.resultList,sortKey,"resultList",event,that);
        this.setState({
            updata_remdResultList:_remdResultList,
            clickNextNumber:0
        })
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
    updatedByChange(value) {  //最近处理人事件
        this.setState({
            updatedBy_selected:value
        })
    }
    bindByChange(value) {  //任务所有者
        this.setState({
            bindBy_selected:value
        })
    }
    //  详情--select框切换合同号
    changeDetLoanNo(){
        changeLabel2A.changeLeft2A(1,this);  //重新加载案列页面
    }
    //渠道切换事件
    channelChange(event){
        let channelVal=$(event.target).find("option:selected").attr("value");
        this.setState({
            channelVal:channelVal
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
                <div data-isresetdiv="yes"
                     data-resetstate="_selected,selectdArray,updatedBy_selected,bindBy_selected,updatedAtTimeS,updatedAtTimeE,startValue,endValue,scheduledTimeS,scheduledTimeE,payDayS,payDayE"
                >
                    <div className="top">
                        <div className="clearfix">
                            <select name="" id="productNoEnums" className="left select-gray productNoEnums mr15 mt10" defaultValue={'17C'} style={{"width":"160px"}} onChange={this.channelChange.bind(this)}>
                                <option value="" >合作方</option>
                                <option value="17C">普惠消费贷-17C</option>
                                <option value="30H">农资贷-30H</option>
                                <option value="34H">中化农业农资贷-34H</option>
                                <option value="39H">农机贷-39H</option>
                                <option value="40H">生猪养殖贷-40H</option>
                            </select>
                            <input type="text" name="" placeholder="所属地区" className="input left mr15 mt10 district input_w" id='district' />
                            <input type="text" name="" placeholder="贷款号" className="input left mr15 mt10 loanNumber input_w" id='loanNumber' />
                            <input type="text" name="" placeholder="订单号" className="input left mr15 mt10 orderNumber input_w" id='orderNumber' />
                            <input type="text" name="" placeholder="身份证号" className="input left mr15 mt10 nationalId input_w" id='nationalId' />
                            <div className="left">
                                <input type="number" name="" placeholder="前第三期逾期天数开始值" className="input left mr5 mt10 daysInDefault3Start" id='daysInDefault3Start' style={inpW} onKeyPress={commonJs.handleKeyPress.bind(this,null)} />
                                <span className='left mr5 mt10'>-</span>
                                <input type="number" name="" placeholder="前第三期逾期天数结束值" className="input left mr15 mt10 daysInDefault3End" id='daysInDefault3End' style={inpW} onKeyPress={commonJs.handleKeyPress.bind(this,null)} />
                            </div>
                            <div className="left">
                                <input type="number" name="" placeholder="前第二期逾期天数开始值" className="input left mr5 mt10 daysInDefault2Satrt" id='daysInDefault2Satrt' style={inpW} onKeyPress={commonJs.handleKeyPress.bind(this,null)} />
                                <span className='left mr5 mt10'>-</span>
                                <input type="number" name="" placeholder="前第二期逾期天数结束值" className="input left mr15 mt10 daysInDefault2End" id='daysInDefault2End' style={inpW} onKeyPress={commonJs.handleKeyPress.bind(this,null)} />
                            </div>
                            <div className="left">
                                <input type="number" name="" placeholder="前第一期逾期天数开始值" className="input left mr5 mt10 daysInDefault1Start" id='daysInDefault1Start' style={inpW} onKeyPress={commonJs.handleKeyPress.bind(this,null)} />
                                <span className='left mr5 mt10'>-</span>
                                <input type="number" name="" placeholder="前第一期逾期天数结束值" className="input left mr15 mt10 daysInDefault1End" id='daysInDefault1End' style={inpW} onKeyPress={commonJs.handleKeyPress.bind(this,null)} />
                            </div>
                            <div className="left">
                                <input type="number" name="" placeholder="模型Grad开始值" className="input left mr5 mt10 creditModelGradeStart" id='creditModelGradeStart' style={inpW} onKeyPress={commonJs.handleKeyPress.bind(this,null)} />
                                <span className='left mr5 mt10'>-</span>
                                <input type="number" name="" placeholder="模型Grad结束值" className="input left mr15 mt10 creditModelGradeEnd" id='creditModelGradeEnd' style={inpW} onKeyPress={commonJs.handleKeyPress.bind(this,null)} />
                            </div>
                            <div className="left">
                                <input type="number" name="" placeholder="当前剩余到期天数开始值" className="input left mr5 mt10 dueDaysStart" id='dueDaysStart' style={inpW} onKeyPress={commonJs.handleKeyPress.bind(this,null)} />
                                <span className='left mr5 mt10'>-</span>
                                <input type="number" name="" placeholder="当前剩余到期天数结束值" className="input left mr15 mt10 dueDaysEnd" id='dueDaysEnd' style={inpW} onKeyPress={commonJs.handleKeyPress.bind(this,null)} />
                            </div>
                            <div className="left clearfix">
                                <button className="left mr15 mt10 btn-blue getCQ-btn" id='searchBtn' onClick={this.RmdSearch.bind(this,true)}>搜索</button>
                                <button className="left mr15 mt10 btn-blue search-next hidden" id='searchNext' onClick={this.RmdSearchNext.bind(this,true)}>查询下一条</button>
                                <button className="left mr15 mt10 btn-white" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
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
                                this.setState({
                                    _params:rowData.accountId,
                                    top_loanNumber:rowData.loanNumber,
                                    _installments:rowData.installmentNumber,
                                    _name:rowData.name,
                                    _payDate:rowData.payDay,
                                    _amount:rowData.amount,
                                    _oper_type:"next",  //collection 获取上数据时的搜索类型
                                    productNo:rowData.productNo, //合作方，3C.4A...
                                    rowData:rowData
                                });
                                let _rowData=Object.assign({},rowData);
                                _rowData.orderNo=rowData.orderNumber;
                                
                                if(_rowData.productNo == '17C'){
                                    _rowData.platformFlag = 'TH';
                                }else{
                                    _rowData.platformFlag = 'AG';
                                }
                                commonJs.changeLabelBoxFn(this,_rowData,changeLabel2A,changeLabelCP,{isChange:true,changeNo:7},{isChange:true,changeNo:2});
                                $(".labelBodyDiv").removeClass("hidden");
                                commonJs.cancelSaveQ();
                            }}
                        >
                            <Column width={100} resizable>
                                <HeaderCell>合同号</HeaderCell>
                                <Cell dataKey="loanNumber" />
                            </Column>

                            <Column width={100} resizable>
                                <HeaderCell>身份证号</HeaderCell>
                                <Cell dataKey="nationalId_scr" />
                            </Column>

                            <Column width={100} resizable>
                                <HeaderCell>当前还款日</HeaderCell>
                                <Cell dataKey="originalDueDate" />
                            </Column>

                            <Column width={100} resizable sortable>
                                <HeaderCell>操作状态</HeaderCell>
                                <Cell dataKey="queueStatus" />
                            </Column>

                            <Column width={100} resizable sortable>
                                <HeaderCell>省</HeaderCell>
                                <Cell dataKey="homeProvinceName" />
                            </Column>

                            <Column width={100} resizable sortable>
                                <HeaderCell>市</HeaderCell>
                                <Cell dataKey="homeCityName" />
                            </Column>

                            <Column width={100} resizable sortable>
                                <HeaderCell>区</HeaderCell>
                                <Cell dataKey="homeDistrictName" />
                            </Column>

                            <Column width={150} resizable>
                                <HeaderCell>当前剩余到期天数</HeaderCell>
                                <Cell dataKey="dueDays" />
                            </Column>

                            <Column width={150} resizable>
                                <HeaderCell>前第一期逾期天数</HeaderCell>
                                <Cell dataKey="daysInDefault1" />
                            </Column>

                            <Column width={150} resizable>
                                <HeaderCell>前第二期逾期天数</HeaderCell>
                                <Cell dataKey="daysInDefault2" />
                            </Column>

                            <Column width={150} resizable>
                                <HeaderCell>前第三期逾期天数</HeaderCell>
                                <Cell dataKey="daysInDefault3" />
                            </Column>

                            <Column width={150} resizable>
                                <HeaderCell>风控模型等级</HeaderCell>
                                <Cell dataKey="creditModelGrade" />
                            </Column>

                            <Column width={100} resizable>
                                <HeaderCell>绑定人</HeaderCell>
                                <Cell dataKey="bindBy" />
                            </Column>

                            <Column width={100} resizable>
                                <HeaderCell>绑定时间</HeaderCell>
                                <Cell dataKey="bindTime" />
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
                    this.state.rowData.productNo=="2A"?
                    <AccountBar loanNumberChange={this.changeDetLoanNo.bind(this)} />
                    :""
                }
                <div className="mt20 clearfix labelBodyDiv hidden">
                    <LabelBody 
                        rigPage={this.props.params.rigPage} 
                        _oper_type={this.state._oper_type}
                        _labelBody_reload={this.state._labelBody_reload}
                        updateList={this.RmdSearch.bind(this)}   //搜索方法
                        rowData={this.state.rowData}
                        A2LeftComponent={[
                                'userMsg','case','packList','file','phoneMsg','operatorReportNew','messageList','callRecord','securityRcord','bankList'
                        ]}  //2A portal-左侧页面需要显示的组件配置
                        A2RightComponent={['cpySearch','voe','vor','lp','fraud','approve','reminder']}  //2A portal-右侧页面需要显示的组件配置
                        CPLeftComponent={['userMsg','file','repaymentList','withholdList']}  //cooperation portal-左侧页面需要显示的组件配置
                        CPRightComponent={['reminder']}  //cooperation portal-右侧页面需要显示的组件配置
                    />
                </div>
            </div>
        )
    }
};
let inpW={
    width:'180px'
}
export default ReminderIndex;  //ES6语法，导出模块