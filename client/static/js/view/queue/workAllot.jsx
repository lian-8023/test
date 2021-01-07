// 工作分配-工单系统
import React,{PureComponent} from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import $ from 'jquery';
import { Pagination,DatePicker,Select,Tabs ,Table} from 'antd';  //页码
const Option = Select.Option;
const { TabPane } = Tabs;
import axios from '../../axios';

import CustomSelect from '../module/customSelect';  //自定义select样式
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import SortTimeJs from '../../source/common/sortTime';
var sortTimeJs=new SortTimeJs;
@inject('allStore') @observer
class WorkAllot extends React.Component{
    constructor(props){
        super(props);
        this.topBindNumberStore=this.props.allStore.TopBindNumberStore;  //顶部绑定（完成）数显示-通用 2A portal
        this.state={
            clearCs_inp:true,
            isLoan:false,
            selectedQueueStatusEnums:[],  //已经选择的任务状态数组
            barsNum:10,  //每页显示多少条
            current:1,
            selectdArray:[],//任务状态选中数据
            workOrderInfoDTO:{},  //详情
            conditionShow:true,  //条件是否显示  全部工单显示条件true || 正在进行工单不显示条件false
            startValue: null,
            endValue: null,
            updateAtStart: null,
            updateAtEnd: null,
            endOpen: false,
            updateendOpen:false,
            workOrderInfoDTOList:[],//全部工单列表
            workBindInfoDTOList:[],//进行中的工单列表
            workOrderRecordInfoDTO:{}, //操作历史对应详情
            totalSize:0,
            getOverdueCaseRecordList:[],
            pageNum:0,
            getOverdueCaseRecordListpageNum:1,
            editproductNo:'',
        }
    }

    componentDidMount(){
        commonJs.reloadRules();
        this.init();
        this.getAdminMaps();
        this.getAllPartner();
        this.topBindNumberStore.initCount("/RemColt/initial");
        var h = document.documentElement.clientHeight;
        $("#content").height(h-40);
        $(".wa-edit .myCheckbox").click(function(){
            let _parent=$(this).closest(".wa-edit");
            _parent.find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            $(this).removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        })
        $(".wa-edit-add .myCheckbox").click(function(){
            let _parent=$(this).closest(".wa-edit-add");
            _parent.find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            $(this).removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        })
        // this.theSearch(true);
    }
    trHandle(id,event){
        this.getWorkOrer(id);
        // $(".edit-div").removeClass("hidden");
        $(".workAllot-list tr").removeClass("tr-on");
        let $this=$(event.target).closest("tr");
        $this.addClass("tr-on");
    }
    // 获取所有合作方
    getAllPartner=()=>{
        let that=this;
        axios({
            method: 'get',
            url:'/node/workorder/getWorkOrerEnum',
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    productNoEnums:[]
                })
                return;
            }
            that.setState({
                productNoEnums:cpCommonJs.opinitionArray(data.productNoEnums)
            })
        })
    }
    //初始化选项
    init(){
        let that=this;
        $.ajax({
            type:"get",
            url:"/node/getWorkOrerEnum",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                var edit_workOrderAddStatus = [];
                if(_getData.workOrderStatus){
                    for (var i = 0;i<_getData.workOrderStatus.length;i++) {
                        let _optionCode=_getData.workOrderStatus[i].optionCode;
                        if (_optionCode != "work_order_status_1" && _optionCode != "work_order_status_2") {
                            edit_workOrderAddStatus.push(_getData.workOrderStatus[i]);
                        }
                    }
                }
                that.setState({
                    workOrderType:_getData.workOrderType?_getData.workOrderType:[],  //工单类型
                    workOrderStatus:_getData.workOrderStatus?_getData.workOrderStatus:[],  //工单状态
                    edit_workOrderAddStatus:edit_workOrderAddStatus,//详情编辑-工单状态
                    workOrderLevel:_getData.workOrderLevel?_getData.workOrderLevel:[],  //工单等级 
                    workOrderDealDepartment:_getData.workOrderDealDepartment?_getData.workOrderDealDepartment:[],  //处理部门 
                })
            }
        })
    }
    //查询详情
    getWorkOrer(_jobNumber){
        let that=this;
        if(!_jobNumber){return;}
        $(".edit-div").addClass("hidden");
        $.ajax({
            type:"get",
            url:"/node/getWorkOrer",
            async:false,
            dataType: "JSON",
            data:{'jobNumber':_jobNumber},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        workOrderInfoDTO:{}  //详情数据
                    });
                    $(".edit-div").addClass("hidden");
                    return;
                }
                var _getData = res.data;
                let workOrderInfoDTO=_getData.workOrderInfoDTO?_getData.workOrderInfoDTO:{};
                that.setState({
                    workOrderInfoDTO:workOrderInfoDTO  //详情数据
                });
                if(_getData.edit){
                    $(".edit-div").removeClass("hidden");
                }else{
                    $(".edit-div").addClass("hidden");
                }
                that.showDetail(workOrderInfoDTO);
                //加载该条操作历史
                let jobNumber=workOrderInfoDTO.jobNumber;
                const contactNumber = workOrderInfoDTO.contactNumber
                that.operateList(jobNumber);
                that.getOverdueCaseRecord(contactNumber)
            }
        })
        this.cancle();
    }
    //还原详情数据展示
    showDetail(workOrderInfoDTO){
        $(".WA-detail-div .customerNumber").val(commonJs.is_obj_exist(workOrderInfoDTO.customerNumber));
                $(".WA-detail-div .customerName").val(commonJs.is_obj_exist(workOrderInfoDTO.customerName));
                $(".WA-detail-div .contactNumber").val(commonJs.is_obj_exist(workOrderInfoDTO.contactNumber));
                $(".WA-detail-div .callNumber").val(commonJs.is_obj_exist(workOrderInfoDTO.callNumber));
                $(".WA-detail-div .customerQuestion").val(commonJs.is_obj_exist(workOrderInfoDTO.customerQuestion));
                $(".WA-detail-div .afterDeal").val(commonJs.is_obj_exist(workOrderInfoDTO.afterDeal));
                this.loopSelect(".jobType",workOrderInfoDTO.jobType);
                this.loopSelect(".orderLevel",workOrderInfoDTO.orderLevel);
                this.loopSelect(".jobStatus",workOrderInfoDTO.jobStatus);
                this.loopSelect(".dealDepartment",workOrderInfoDTO.dealDepartment);
                $(".WA-detail-div").attr("id",workOrderInfoDTO.id);
                $(".WA-detail-div").attr("data-jobNumber",workOrderInfoDTO.jobNumber);
                
                $(".WA-detail-div .tryDeal-div .myCheckbox,.WA-detail-div .callBack-div .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");

                this.setState({editproductNo:workOrderInfoDTO.productNo});
                if(workOrderInfoDTO.tryDeal===true){
                    $(".WA-detail-div .tryDeal").text("是");
                    $(".WA-detail-div .tryDeal-div .yes").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
                }else if(workOrderInfoDTO.tryDeal===false){
                    $(".WA-detail-div .tryDeal").text("否");
                    $(".WA-detail-div .tryDeal-div .no").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
                }else{
                    $(".WA-detail-div .tryDeal").text("-");
                }
                if(workOrderInfoDTO.callBack===true){
                    $(".WA-detail-div .callBack").text("是");
                    $(".WA-detail-div .callBack-div .yes").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
                }else if(workOrderInfoDTO.callBack===false){
                    $(".WA-detail-div .callBack").text("否");
                    $(".WA-detail-div .callBack-div .no").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
                }else{
                    $(".WA-detail-div .callBack").text("-");
                }
    }
    /**
     * select默认选中项目
     * @param {*} dom select class
     * @param {*} data 需要显示的数据
     */
    loopSelect(dom,data){
        $(".WA-detail-div").find(dom).find("option").removeProp("selected");
        $(".WA-detail-div").find(dom).find("option").each(function(){
            let _text=$(this).text();
            if(_text==data){
                $(this).prop("selected","selected");
            }
        });
        if(!data){
            $(dom).find("option").eq(0).prop("selected","selected");
        }
    }
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            current: 1,
            barsNum:pageSize
        },()=>{
            this.theSearch();
        })
    }
    //快速跳转到某一页。
    pageChange(page){
        this.setState({
            current: page
        },()=>{
            this.theSearch();
        });
      }

    // 查询时间
    disabledStartDate(startValue,type){
        let endValue = this.state.endValue;
        if(type == 'disable'){
            endValue = this.state.endValue;
        }else{
            endValue = this.state.updateAtEnd;
        }
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf()-1;
    }
    timeOnChange(field, value,type){
        this.setState({
            [field]: value
        });
    }
    disabledEndDate(endValue){
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf()-1;
    }

    onStartChange(type,value){
        let field = '';
        if(type == 'disable'){
            field='startValue';
        }else{
            field='updateAtStart';
        }
        this.timeOnChange(field, value);
    }

    onEndChange(value,type){
        let field = '';
        if(type == 'disable'){
            field='endValue';
        }else{
            field='updateAtEnd';
        }
        this.timeOnChange(field, value);
        $(".createdAtTime").attr("endTime",commonJs.dateToString(value));
    }

    handleStartOpenChange(open,type){
        if(type == 'disable'){
            if (!open) {
                this.setState({ endOpen: true,updateendOpen: false });
            }
        }else{
            if (!open) {
                this.setState({ endOpen: false,updateendOpen: true });
            }
        }
    }

    handleEndOpenChange(open,type){
        if(type == 'disable'){
            this.setState({ endOpen: open});
        }else{
            this.setState({updateendOpen: open });
        }
    }

    //获取搜索条件
    getConditions=()=>{
        let data={};
        let _jobNumber=$(".cdt-cont .jobNumber").val();
        _jobNumber=_jobNumber?_jobNumber.replace(/\s/,""):"";
        if(_jobNumber && isNaN(_jobNumber)){
            alert("工单号必须是数字");
            return;
        }
        if(_jobNumber){
            data.jobNumber=_jobNumber;  //工单号
        }
        let _jobType=$(".cdt-cont .jobType option:selected").attr("data-optionCode");
        _jobType=_jobType?_jobType.replace(/\s/,""):"";
        if(_jobType){
            data.jobType=_jobType;  //订单类型
        }
        let _contactNumber=$(".cdt-cont .contactNumber").val();
        _contactNumber=_contactNumber?_contactNumber.replace(/\s/,""):"";
        if(_contactNumber && isNaN(_contactNumber)){
            alert("电话号码必须是数字");
            return;
        }
        if(_contactNumber){
            data.contactNumber=_contactNumber;  //电话号码
        }

        let customerName=$(".cdt-cont .customerName").val();  //客户姓名
        if(customerName){
            data.customerName=customerName;  //客户姓名
        }
        let dealDepartment=$('.cdt-cont .dealDepartment option:selected').attr("data-optionCode");
        if(dealDepartment){
            data.dealDepartment=dealDepartment;  //处理部门
        }
        let productNo=$('.cdt-cont .cdt_productNo option:selected').attr("value");
        if(productNo){
            data.productNo=productNo;  //产品号
        }

        let _orderLevel=$(".cdt-cont .orderLevel option:selected").attr("data-optionCode");
        _orderLevel=_orderLevel?_orderLevel.replace(/\s/,""):"";
        if(_orderLevel){
            data.orderLevel=_orderLevel;  //订单级别
        }
        let _jobStatus=$(".cdt-cont .jobStatus option:selected").attr("data-optionCode");
        _jobStatus=_jobStatus?_jobStatus.replace(/\s/,""):"";
        if(_jobStatus){
            data.jobStatus=_jobStatus;  //订单状态
        }
        if(this.state.startValue){
            data.selectBeginDate=commonJs.dateToString(this.state.startValue)
        }
        if(this.state.endValue){
            data.selectEndDate=commonJs.dateToString(this.state.endValue)
        }
        if(this.state.updateAtStart){
            data.updateAtStart=commonJs.dateToString(this.state.updateAtStart)
        }
        if(this.state.updateAtEnd){
            data.updateAtEnd=commonJs.dateToString(this.state.updateAtEnd)
        }
        data.pageSize=this.state.barsNum;
        data.pageNum=this.state.current;
        return data;
    }
    // 正在进行工单-绑定人搜索
    bindBySearch=()=>{
        let workBindInfoDTOList=this.state.workBindInfoDTOList;
        let banindby=this.state.banindby;
        if(!banindby){
            this.setState({
                bindByType:false
            })
            return;
        }
        let newAry=[];
        for(let i=0;i<workBindInfoDTOList.length;i++){
            let item=workBindInfoDTOList[i];
            if(item.bindUser==banindby){
                newAry.push(item)
            }
        }
        this.setState({
            bindBySearchResult:newAry,
            bindByType:true,
            workOrderInfoDTO:{},
            workOrderHistroyInfoDTOList:[]
        });
        $('.workAllot-list .myCheckbox').removeClass('myCheckbox-visited').addClass('myCheckbox-normal');
        $(".WA-detail-div .tryDeal").text("-");
        $(".WA-detail-div .callBack").text("-");
        this.cancle();
    }
    //搜索 如果fromBtn存在，点击目标为搜索按钮
    theSearch(fromBtn){
        $(".edit-div").addClass("hidden");
        $(".workAllot-list tr").removeClass("tr-on");
        $(".workAllot-list tr:eq(0)").addClass("tr-on");
        let _that=this;
        if(fromBtn){
            let current = 1;
            if(fromBtn == 'edit'){
                current = this.state.current
            }
            console.log(current);
            this.setState({
                current:current,
                workOrderInfoDTO:{},
                workOrderHistroyInfoDTOList:[]
            },()=>{
                let _data=_that.getConditions();
                this.searFn(_data);
                $(".WA-detail-div .tryDeal").text("-");
                $(".WA-detail-div .callBack").text("-");
            })
        }else{
            let _data=_that.getConditions();
            this.searFn(_data);
        }
    }
    searFn(param){
        let _that=this;
        console.log(param);
        $.ajax({
            type:"post",
            url:"/node/getWorkOrerList",
            async:false,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(param)},
            success:function(res) {
                commonJs.ajaxGetCode(res);
                let _getData = res.data;
                if(!_getData.executed){
                    _that.setState({
                        current:1,  //当前页码
                        totalSize:0,
                        workOrderInfoDTOList:[]
                    });
                    $(".edit-div").addClass("hidden");
                    return;
                }
                _that.setState({
                    workOrderInfoDTOList:_getData.workOrderInfoDTOList ? _getData.workOrderInfoDTOList : [],
                    totalSize:_getData.totalSize?_getData.totalSize:0,
                    pageNum:_getData.pageNum?_getData.pageNum:0
                })
            }
        })
        this.cancle();
    }
    //展开收起搜索结果列表
    showSearchList(e){
        let $this=$(e.target);
        let $table=$this.closest(".cdt-result").find(".toggle-div");
        if($this.hasClass("cdtIcon")){
            $this=$this.parent();
        }
        let cdtIcon=$this.find(".cdtIcon");
        if(cdtIcon.hasClass("cdt-off")){
            cdtIcon.removeClass("cdt-off").addClass("cdt-on");
            $table.css({"height":"auto"});
        }else{
            cdtIcon.removeClass("cdt-on").addClass("cdt-off");
            $table.css({"height":"123px"});
        }
    }
    //编辑
    edit(event){
        let _data={};
        let that=this;
        let $this=$(event.target);
        let _parent=$(".WA-detail-div");
        let _id=$(".WA-detail-div").attr("id");
        let _jobNumber=$(".WA-detail-div").attr("data-jobnumber");
        if($this.text()=="编辑"){
            this.showDetail(this.state.workOrderInfoDTO);
            $(".cancle").removeClass("hidden");
            _parent.find(".wa-show").addClass("hidden");
            _parent.find(".wa-edit").removeClass("hidden");
            _parent.find(".defaultValue").attr("hidden",false);
            $this.text("保存");
            $.ajax({
                type:"post",
                url:"/node/updateWorkOrer",
                async:false,
                dataType: "JSON",
                data:{
                    id:_id
                },
                success:function(res) {
                    if(commonJs.ajaxGetCode(res)){
                        return;
                    }
                }
            })
        }else if($this.text()=="保存"){
            _parent.find(".wa-edit").each(function(){
                var _param=$(this).attr("data-param");
                if($(this).find("input").length>0 && _param){
                    let _val=$(this).find("input").val();
                    if(_val!="-"){
                        _data[_param]=_val;
                    }
                }
                if($(this).find("select").length>0 && _param){
                    let _selecte=$(this).find("option:selected").attr("data-optionCode");
                    if(_selecte!="-"){
                        _data[_param]=_selecte
                    }
                }
                if($(this).find(".myCheckbox").length>0 && _param){
                    if($(this).find(".yes").hasClass("myCheckbox-visited")){
                        _data[_param]=true
                    }else{
                        _data[_param]=false
                    }
                }
                if($(this).find("textarea").length>0 && _param){
                    let _val=$(this).find("textarea").val();
                    if(_val!="-"){
                        _data[_param]=_val;
                    }
                }
            });
            if(_data.jobStatus=="" || !_data.jobStatus){
                alert("工单状态只能是跟进,可处理工单和完成,不可处理工单！");
                return;
            }
            _data.id=_id;
            if(_data.afterDeal && _data.afterDeal.length>512){
                alert("后续处理结果字数最多512个！");
                return;
            }
            $.ajax({
                type:"post",
                url:"/node/saveWorkOrder",
                async:true,
                dataType: "JSON",
                data:_data,
                success:function(res) {
                    commonJs.ajaxGetCode(res);
                    let _getData = res.data;
                    if(!_getData.executed){
                        that.cancle();
                        return;
                    }
                    alert(_getData.message);
                    if(that.state.conditionShow){
                        that.theSearch('edit');
                        that.getWorkOrer(_jobNumber);
                    }else{
                        that.setState({
                            workOrderInfoDTO:{},
                            workOrderHistroyInfoDTOList:[]
                        });
                        $(".WA-detail-div .tryDeal").text("-");
                        $(".WA-detail-div .callBack").text("-");
                        $(".edit-div").addClass("hidden");
                        
                        if(that.state.conditionShow){
                            that.theSearch('edit');  //搜索全部工单接口
                        }else{
                            if(that.state.banindby){
                                that.bindBySearch();
                            }else{
                                that.searchBind();
                            }
                        }
                    }
                    that.cancle();
                }
            })
        }
    }

    //新增工单-lyf
    addWAHandle(){
        $(".addWA").removeClass("hidden");
    }

    //保存新增工单-lyf
    saveNewWorkList(){
        let that = this;
        var _data = {};
        let _parent=$(".tanc-cont");
        _parent.find(".wa-edit-add").each(function(){
            var _param=$(this).attr("data-param");
            if($(this).find(".myCheckbox").length>0 && _param){
                if($(this).find(".yes").hasClass("myCheckbox-visited")){
                    _data[_param]=true
                }else{
                    _data[_param]=false
                }
            }
        });
        //客户名称
        let _customerName = $(".addWA .customerName").val();
        _data.customerName = _customerName;
        //处理部门
        let _dealDepartment = $(".addWA .dealDepartment option:selected").attr("data-optionCode");
        _data.dealDepartment = _dealDepartment;
        let _jobType=$(".addWA .jobType option:selected").attr("data-optionCode");
        _jobType=_jobType?_jobType.replace(/\s/,""):"";
        _data.jobType = _jobType;
        let _customerNumber = $(".addWA .customerNumber").val();//portal号
        _data.customerNumber = _customerNumber;
        let _contactNumber=$(".addWA .contactNumber").val();
        _contactNumber=_contactNumber?_contactNumber.replace(/\s/,""):"";
        _data.contactNumber = _contactNumber;
        let _orderLevel=$(".addWA .orderLevel option:selected").attr("data-optionCode");
        _orderLevel=_orderLevel?_orderLevel.replace(/\s/,""):"";
        _data.orderLevel = _orderLevel;

        let _productNo=$(".addWA .add_productNo option:selected").attr("data-value");
        _productNo=_productNo?_productNo.replace(/\s/,""):"";
        if(_productNo){
            _data.productNo = _productNo;
        }

        _data.jobStatus = "work_order_status_1";
        let _wkaQuesttion = $(".addWA .customer-question").val();        //客户问题
        _data.customerQuestion = _wkaQuesttion;
        let _afterDeal = $(".addWA .afterDeal").val();        //后续处理结果
        _data.afterDeal = _afterDeal;
        let _callNumber = $(".addWA .callNumber").val();
        _data.callNumber = _callNumber;
        axios({
            method: 'POST',
            data: {josnParam:JSON.stringify(_data)},
            url:'/node/addNewWorkOrder'
        })
        .then(function (res) {
            let response=res.data;  //from node response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    STemplate:[]
                })
                return;
            }
            let data=response.data;  //from java response
            alert(data.message);
            if(that.state.conditionShow){
                that.theSearch(true);
            }else{
                that.searchBind();
            }
            let _id=$(".workAllot-list").find(".tr-on").find(".jobNumber").text();
            that.getWorkOrer(_id);
            that.cancleadd();
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    //取消新增-lyf
    cancleadd(){
        let that=this;
        $(".addWA").addClass("hidden");
        //清除历史记录
        $(".addWA .customerName").val("");
        //处理部门
        $(".addWA .dealDepartment option").removeProp("selected");
        $(".addWA .dealDepartment option:eq(0)").prop("selected","true");
        $(".addWA .jobType option").removeProp("selected");
        $(".addWA .jobType option:eq(0)").prop("selected","true");
        $(".addWA .customerNumber").val("");//portal号
        $(".addWA .contactNumber").val("");
        $(".addWA .orderLevel option").removeProp("selected");
        $(".addWA .orderLevel option:eq(0)").prop("selected","true");
        $(".addWA .add_productNo option").removeProp("selected");
        $(".addWA .add_productNo option[data-optionId='0']").prop("selected","true");
        $(".addWA .customer-question").val("");        //客户问题
        $(".addWA .afterDeal").val("");        //后续处理结果
        $(".addWA .callNumber").val("");
    }

    //查询绑定
    searchBind(){
        $(".workAllot-list tr").removeClass("tr-on");
        let _that=this;
        this.setState({
            workOrderInfoDTO:{},
            workOrderHistroyInfoDTOList:[],
            conditionShow:false
        });
        $(".WA-detail-div .tryDeal").text("-");
        $(".WA-detail-div .callBack").text("-");
        $.ajax({
            type:"get",
            url:"/node/searchBind",
            async:false,
            dataType: "JSON",
            success:function(res) {
                commonJs.ajaxGetCode(res);
                let _getData = res.data;
                if(!_getData.executed){
                    _that.setState({
                        workBindInfoDTOList:[]
                    });
                    $(".edit-div").addClass("hidden");
                    return;
                }
                _that.setState({
                    workBindInfoDTOList:_getData.workBindInfoDTOList ? _getData.workBindInfoDTOList : [],
                    bindByType:false
                })
            }
        });
    }

    //取消
    cancle(){
        let _parent=$(".WA-detail-div");
        $(".cancle").addClass("hidden");
        _parent.find(".wa-show").removeClass("hidden");
        _parent.find(".wa-edit").addClass("hidden");
        $(".edit").text("编辑");
        $(".cancle").addClass("hidden");
    }

    //操作历史 工单编码-参数
    operateList(_jobNumber){
        $(".historyBox .historyh3").removeClass("on");
        $(".historyBox .history-detail").addClass("hidden").css("background","#fff");
        let _that=this;
        if(!_jobNumber){
            return;
        }
        $.ajax({
            type:'get',
            url:'/node/workOrderHistory',
            data:{jobNumber:_jobNumber},
            dataType:'json',
            async:false,
            success:
                function (res) {
                    if (!commonJs.ajaxGetCode(res)) {
                        _that.setState({
                            workOrderHistroyInfoDTOList:[]
                        });
                        return;
                    }
                    var _getData = res.data;
                    _that.setState({
                        workOrderHistroyInfoDTOList:_getData.workOrderHistroyInfoDTOList
                    });
                }
        });
    }
    //催收案例记录
    getOverdueCaseRecord(contactNumber){
        /* $(".historyBox .historyh3").removeClass("on");
        $(".historyBox .history-detail").addClass("hidden").css("background","#fff"); */
        let _that=this;
        if(!contactNumber){
            return;
        }
        $.ajax({
            type:'get',
            url:'/node//workorder/getOverdueCaseRecord',
            data:{contactPhone:contactNumber,pageSize:9999,pageNum:1,},
            dataType:'json',
            async:false,
            success:
                function (res) {
                    if (!commonJs.ajaxGetCode(res)) {
                        _that.setState({
                            getOverdueCaseRecord:[]
                        });
                        return;
                    }
                    var _getData = res.data;
                    _that.setState({
                        getOverdueCaseRecordList:_getData.overdueRecordInfoDTOList
                    });
                }
        });
    }
    showConditions(){
        this.setState({
            workOrderInfoDTO:{},
            workOrderHistroyInfoDTOList:[],
            conditionShow:true
        })
        $(".WA-detail-div .tryDeal").text("-");
        $(".WA-detail-div .callBack").text("-");
        this.theSearch(true);
    }
    // 解绑
    deleteWorkBind(event){
        let that=this;
        let {workBindInfoDTOList,bindBySearchResult,bindByType}=this.state;
        let workingOrderList=[];
        let jobNumbers=[];
        let index='';
        if(bindByType){
            workingOrderList=bindBySearchResult;
        }else{
            workingOrderList=workBindInfoDTOList;
        };
        $('.workAllot-list tbody tr').each(function(){
            if($(this).find('.myCheckbox').hasClass('myCheckbox-visited')){
                index=$(this).index();
                jobNumbers.push(workingOrderList[index].bindJobNumber);
            }
        })
        $.ajax({
            type:'post',
            url:'/node/deleteWorkBind',
            data:{josnParam:JSON.stringify({jobNumbers:jobNumbers})},
            dataType:'json',
            async:false,
            success:function (res) {
                    if (!commonJs.ajaxGetCode(res)) {
                        return;
                    }
                    that.setState({
                        workOrderInfoDTO:{},
                        workOrderHistroyInfoDTOList:[]
                    });
                    $(".WA-detail-div .tryDeal").text("-");
                    $(".WA-detail-div .callBack").text("-");
                    alert("成功");
                    $('.workAllot-list .myCheckbox').removeClass('myCheckbox-visited').addClass('myCheckbox-normal');
                    if(that.state.conditionShow){
                        that.theSearch(true);  //搜索全部工单接口
                    }else{
                        if(that.state.banindby){
                            that.bindBySearch();
                        }else{
                            that.searchBind();
                        }
                    }
                }
        });
        event.stopPropagation();
    }
    //操作历史详情
    historyHandle(event){
        let that=this;
        let $this=$(event.target);
        let _tit=$this.closest(".historyh3");
        let _cont=$this.closest(".historyBox").find(".history-detail");
        if(_tit.hasClass("on")){
            _tit.removeClass("on");
            _cont.addClass("hidden").css("background","#fff");
            return;
        }
        $(".historyBox .historyh3").removeClass("on");
        $(".historyBox .history-detail").addClass("hidden").css("background","#fff");
        
        _tit.addClass("on");
        _cont.removeClass("hidden").css("background","#f2f7fe");
        let _id=_tit.attr("id");
        $.ajax({
            type:'get',
            url:'/node/getWorkOrerRecord',
            data:{
                orderHisId:_id
            },
            dataType:'json',
            async:false,
            success:function (res) {
                    if (!commonJs.ajaxGetCode(res)) {
                        return;
                    }
                    let _data=res.data;
                    let workOrderRecordInfoDTO=_data.workOrderRecordInfoDTO?_data.workOrderRecordInfoDTO:{};
                    that.setState({
                        workOrderRecordInfoDTO:workOrderRecordInfoDTO
                    });
                    if(workOrderRecordInfoDTO.tryDeal===true){
                        $(".historyBox .tryDeal").text("是");
                    }else if(workOrderRecordInfoDTO.tryDeal===false){
                        $(".historyBox .tryDeal").text("否");
                    }else{
                        $(".tryDeal").text("-");
                    }
                    if(workOrderRecordInfoDTO.callBack===true){
                        $(".historyBox .callBack").text("是");
                    }else if(workOrderRecordInfoDTO.callBack===false){
                        $(".historyBox .callBack").text("否");
                    }else{
                        $(".callBack").text("-");
                    }
                }
        });
        
    }

    // 获取用户名
    getAdminMaps(){
        let _that=this;
        let _array=[];
        $.ajax({
            type:"get",
            url:"/node/tianrList",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                var keys=[];//定义一个数组用来接受key  
                var values=[];//定义一个数组用来接受value  
                for(var key in _getData.adminNameMaps){  
                    keys.push(key);  
                    _array.push(_getData.adminNameMaps[key]);//取得value   
                }  
                _that.setState({
                    adminNameMaps:_array
                })
            }
        })
    }

    //绑定人事件
    updatedByChange(value) {  
        this.setState({
            banindby:value
        })
    }
    tabsChange=(key)=>{
        if(key==1){
            this.showConditions();
        }else if(key==2){
            this.searchBind();
        }
    }
    render() {
        const {updateendOpen, updateAtStart,updateAtEnd, startValue, endValue, endOpen,workOrderInfoDTO,workOrderRecordInfoDTO,bindByType,bindBySearchResult,workBindInfoDTOList,productNoEnums=[]} = this.state;
        let workingOrderList=[];
        let topBindNumberStore=this.topBindNumberStore.bindNumberData;
        let communicateObjectList=cpCommonJs.opinitionArray(topBindNumberStore.action);  //催收行为
        let actionResult=cpCommonJs.opinitionArray(topBindNumberStore.actionResult);  //催收结果
        if(bindByType){
            workingOrderList=bindBySearchResult;
        }else{
            workingOrderList=workBindInfoDTOList;
        }
        const columns = [
            {
                title: '沟通对象',
                dataIndex: 'contactPersonId',
                key: 'contactPersonId',
                render:(text, record, index)=>{
                    let { communicateObjectList } = this.topBindNumberStore.bindNumberData;
                    let str = '-';
                    communicateObjectList.map((v,i)=>{
                        switch (text) {
                            case v.value:
                                str = v.displayName
                                break;
                            default:
                                break;
                        }
                    })
                    return str;
                }
            },{
                title: '沟通姓名',
                dataIndex: 'contactName',
                key: 'contactName',
            },{
                title: '案列状态',
                dataIndex: 'processingState',
                key: 'processingState',
                render:(text, record, index)=>{
                    let { processStatusList } = this.topBindNumberStore.bindNumberData;
                    let str = '-';
                    processStatusList.map((v,i)=>{
                        switch (text) {
                            case v.value:
                                str = v.displayName
                                break;
                            default:
                                break;
                        }
                    })
                    return str;
                }
            },{
                title: '新号码记录',
                dataIndex: 'telNo',
                key: 'telNo',
            },{
                title: '是否留案',
                dataIndex: 'caseStatus',
                key: 'caseStatus',
                render:(text, record, index)=>{
                    if(text){
                        return '是'
                    }else{
                        return '否'
                    }
                }
            },/* {
                title: '还款方式',
                dataIndex: 'repaymentMethod',
                key: 'repaymentMethod',
            }, */{
                title: '详情',
                dataIndex: 'caseContent',
                key:'caseContent'
            },{
                title: '操作人',
                dataIndex: 'ownerName',
                key:'ownerName'
            },{
                title: '操作时间',
                dataIndex: 'updatedTime',
                key:'updatedTime'
            }
        ];
        return (
            <div className="content" id="content">
                {/*条件*/}
                <div className="conditionBox clearfix" data-isresetdiv="yes" data-resetstate="startValue,endValue">
                    <div className="cdt-cont clearfix pl10 pt10 pb10">
                        <div className="left pr10">
                        <Tabs tabPosition='left' onChange={this.tabsChange}>
                            <TabPane tab="全部工单" key="1" size='small'>
                                <div>
                                    <dl className="left lable-box mt10 mr10">
                                        <dt>电话号码<span></span></dt>
                                        <dd>
                                            <input type="text" className="input contactNumber" id='contactNumber' placeholder="请输入" />
                                        </dd>
                                        <dt>客户姓名<span></span></dt>
                                        <dd>
                                            <input type="text" className="input customerName" id='customerName' placeholder="请输入" />
                                        </dd>
                                        <dt>工单号<span></span></dt>
                                        <dd>
                                            <input type="text" className="input jobNumber" id='jobNumber' placeholder="请输入" />
                                        </dd>
                                        <dt>创建时间<span></span></dt>
                                        <dd className="relative" id='disableDate'>
                                            <DatePicker
                                                    disabledDate={this.disabledStartDate.bind(this,'disable')}
                                                    showTime
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    value={startValue}
                                                    placeholder="Start"
                                                    onChange={this.onStartChange.bind(this,'disable')}
                                                    onOpenChange={(e)=>{this.handleStartOpenChange(e,'disable')}}
                                                />
                                                <span> - </span>
                                                <DatePicker
                                                    disabledDate={this.disabledEndDate.bind(this,'disable')}
                                                    showTime
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    value={endValue}
                                                    placeholder="End"
                                                    onChange={(e)=>{this.onEndChange(e,'disable')}}
                                                    open={endOpen}
                                                    onOpenChange={(e)=>{this.handleEndOpenChange(e,'disable')}}
                                                />
                                        </dd>
                                        <dt>跟进时间<span></span></dt>
                                        <dd className="relative" id='followupDate'>
                                                <DatePicker
                                                    disabledDate={this.disabledStartDate.bind(this,'followup')}
                                                    showTime
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    value={updateAtStart}
                                                    placeholder="Start"
                                                    onChange={this.onStartChange.bind(this,'followup')}
                                                    onOpenChange={(e)=>{this.handleStartOpenChange(e,'followup')}}
                                                />
                                                <span> - </span>
                                                <DatePicker
                                                    disabledDate={this.disabledEndDate.bind(this,'followup')}
                                                    showTime
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    value={updateAtEnd}
                                                    placeholder="End"
                                                    onChange={(e)=>{this.onEndChange(e,'followup')}  }
                                                    open={updateendOpen}
                                                    onOpenChange={(e)=>{this.handleEndOpenChange(e,'followup')}}
                                                />
                                        </dd>
                                    </dl>
                                    <dl className="left lable-box3 mt10 mr10">
                                        <dt>处理部门<span></span></dt>
                                        <dd>
                                            <select name="" id="dealDepartment" className="select-gray left dealDepartment" style={{"width":"100%","height":"20px"}}>
                                                <option value="" hidden>请选择</option>
                                                <option value="">全部</option>
                                                {
                                                    (this.state.workOrderDealDepartment && this.state.workOrderDealDepartment.length>0)?this.state.workOrderDealDepartment.map((repy,i)=>{
                                                        return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                                    }):<option value="" hidden>暂未查到相关数据</option>
                                                }
                                            </select>
                                        </dd>
                                        <dt>工单类型<span></span></dt>
                                        <dd>
                                            <select name="" id="jobType" className="select-gray left jobType" style={{"width":"100%","height":"20px"}}>
                                                <option value="" hidden>请选择</option>
                                                <option value="">全部</option>
                                                {
                                                    (this.state.workOrderType && this.state.workOrderType.length>0)?this.state.workOrderType.map((repy,i)=>{
                                                        return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                                    }):<option value="" hidden>暂未查到相关数据</option>
                                                }
                                            </select>
                                        </dd>
                                        <dt>工单级别<span></span></dt>
                                        <dd>
                                            <select name="" id="orderLevel" className="select-gray left orderLevel" style={{"width":"100%","height":"20px"}}>
                                                <option value="" hidden>请选择</option>
                                                <option value="">全部</option>
                                                {
                                                    (this.state.workOrderLevel && this.state.workOrderLevel.length>0)?this.state.workOrderLevel.map((repy,i)=>{
                                                        return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                                    }):<option value="" hidden>暂未查到相关数据</option>
                                                }
                                            </select>
                                        </dd>
                                        <dt>工单状态<span></span></dt>
                                        <dd>
                                            <select name="" id="jobStatus" className="select-gray left jobStatus" style={{"width":"100%","height":"20px"}}>
                                                <option value="" hidden>请选择</option>
                                                <option value="">全部</option>
                                                {
                                                    (this.state.workOrderStatus && this.state.workOrderStatus.length>0)?this.state.workOrderStatus.map((repy,i)=>{
                                                        return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                                    }):<option value="" hidden>暂未查到相关数据</option>
                                                }
                                            </select>
                                        </dd>
                                    </dl>
                                    <dl className="left lable-box3 mt10 mr10">
                                        <dt>产品号<span></span></dt>
                                        <dd>
                                                {
                                                    <select name="" id="cdt_productNo" className="select-gray left mr10 cdt_productNo" style={{width: '100%', height: '20px'}}>
                                                        <option value="" data-optionId="0" data-show="no" hidden>请选择合作方</option>
                                                        <option value="" data-optionId="">全部</option> 
                                                        {
                                                            (productNoEnums && productNoEnums.length>0) ? productNoEnums.map((repy,i)=>{
                                                                return <option value={commonJs.is_obj_exist(repy.value)} name="" key={i}>{commonJs.is_obj_exist(repy.displayName)+'-'+commonJs.is_obj_exist(repy.value)}</option>
                                                            }):<option value=""></option>
                                                        }
                                                    </select>
                                                }
                                        </dd>
                                    </dl>
                                    <button className="left mt10 mr15 btn-blue RTtsearch" id='searchBtn' onClick={this.theSearch.bind(this,true)}>搜索</button> 
                                    <button className="left mt10 btn-white" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                                </div>
                            </TabPane>
                            <TabPane tab="正在进行的工单" key="2" size='small'>
                            <div>
                                <dl className="left lable-box mt10 mr10">
                                        <dt>绑定人<span></span></dt>
                                        <dd id='bindBy'>
                                        <Select
                                                showSearch
                                                style={{ width: "100%" }}
                                                placeholder="请输入"
                                                allowClear
                                                optionFilterProp="children"
                                                value={this.state.banindby}
                                                onChange={this.updatedByChange.bind(this)}
                                                filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {
                                                    (this.state.adminNameMaps && this.state.adminNameMaps.length>0) ? this.state.adminNameMaps.map((repy,i)=>{
                                                        return <Option value = {repy.loginname} key={i}>{repy.name}</Option>
                                                    }):<Option value = "">没有数据</Option>
                                                }
                                            </Select>
                                        </dd>
                                    </dl>
                                    <button className="left mt10 mr15 btn-blue RTtsearch" id='RTtsearch' onClick={this.bindBySearch.bind(this,true)}>搜索</button> 
                                </div>
                            </TabPane>
                        </Tabs>
                        </div>
                        
                        
                    </div>
                </div>
                {/*条件 end*/}
                
                <div className="cdt-result bar mt20 relative">
                    <div className="toggle-div" style={{"overflow":"scroll"}}>
                        <div className="th-bg">
                            <table className="pt-table layout-fixed workAllot-list">
                                <thead>
                                    <tr className="th-bg">
                                        <th>工单编号</th>
                                        <th>产品号</th>
                                        {this.state.conditionShow?<th>创建时间</th>:""}
                                        {this.state.conditionShow?<th>联系号码</th>:""}
                                        {this.state.conditionShow?<th>客户名称</th>:""}
                                        {this.state.conditionShow?<th>客户Portal号</th>:""}
                                        {this.state.conditionShow?<th>创建人</th>:""}
                                        <th>工单状态</th>
                                        {this.state.conditionShow?"":<th>绑定时间</th>}
                                        {this.state.conditionShow?"":<th>绑定人</th>}
                                        {this.state.conditionShow?"":<th>
                                            <i className="myCheckbox myCheckbox-normal left" id='selectAll' onClick={commonJs.selectAll.bind(this,".cdt-result")}></i>
                                            <button className="btn-yellow" id='deleteWorkBind' onClick={this.deleteWorkBind.bind(this)}>解绑</button>
                                        </th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        (this.state.workOrderInfoDTOList && this.state.workOrderInfoDTOList.length>0 && this.state.conditionShow) ? this.state.workOrderInfoDTOList.map((repy,i)=>{
                                            return <tr key={i} id={commonJs.is_obj_exist(repy.id)} onClick={this.trHandle.bind(this,repy.jobNumber)}>
                                                    <td className="jobNumber" title={commonJs.is_obj_exist(repy.jobNumber)}>{commonJs.is_obj_exist(repy.jobNumber)}</td>
                                                    <td title={commonJs.is_obj_exist(repy.productNo)}>{commonJs.is_obj_exist(repy.productNo)}</td>
                                                    <td title={commonJs.is_obj_exist(repy.createdAt)}>{commonJs.is_obj_exist(repy.createdAt)}</td>
                                                    <td title={commonJs.is_obj_exist(repy.contactNumber)}>{commonJs.is_obj_exist(repy.contactNumber)}</td>
                                                    <td title={commonJs.is_obj_exist(repy.customerName)}>{commonJs.is_obj_exist(repy.customerName)}</td>
                                                    <td title={commonJs.is_obj_exist(repy.customerNumber)}>{commonJs.is_obj_exist(repy.customerNumber)}</td>
                                                    <td title={commonJs.is_obj_exist(repy.createdBy)}>{commonJs.is_obj_exist(repy.createdBy)}</td>
                                                    <td title={commonJs.is_obj_exist(repy.jobStatus)}>{commonJs.is_obj_exist(repy.jobStatus)}</td>
                                                </tr>
                                        }):(
                                            (workingOrderList&& workingOrderList.length>0 && !this.state.conditionShow)?workingOrderList.map((repy,i)=>{
                                                return <tr key={i} id={commonJs.is_obj_exist(repy.id)} onClick={this.trHandle.bind(this,repy.bindJobNumber)}>
                                                            <td className="bindJobNumber" title={commonJs.is_obj_exist(repy.bindJobNumber)}>{commonJs.is_obj_exist(repy.bindJobNumber)}</td>
                                                            <td title={commonJs.is_obj_exist(repy.productNo)}>{commonJs.is_obj_exist(repy.productNo)}</td>
                                                            <td title={commonJs.is_obj_exist(repy.bindJobStatus)}>{commonJs.is_obj_exist(repy.bindJobStatus)}</td>
                                                            <td title={commonJs.is_obj_exist(repy.createdAt)}>{commonJs.is_obj_exist(repy.createdAt)}</td>
                                                            <td title={commonJs.is_obj_exist(repy.bindUser)}>{commonJs.is_obj_exist(repy.bindUser)}</td>
                                                            <td><i className="myCheckbox myCheckbox-normal" id={'trCheck'+i} onClick={commonJs.myCheckbox.bind(this)}></i></td>
                                                        </tr>
                                            }):<tr><td colSpan="" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                        )
                                    } 
                                </tbody>
                            </table>
                        </div>
                        <div className="cdt-th th-bg clearfix pl20 pt5 pb5 pr20">
                            {this.state.conditionShow?
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
                                        pageSizeOptions={['10','25','50','100']}
                                    />
                                </div>
                            :""}
                            <a id='workorderDown' href={"/node/workorder/down?"+commonJs.toHrefParams(this.getConditions())} className="btn-yellow right" style={{"padding":"0 10px"}}>下载搜索结果Excel</a>
                            <a id='addWorkorder' className="btn-white right mr10" style={{"padding":"0 10px"}} onClick={this.addWAHandle.bind()}>+新增工单</a>
                        </div>
                    </div>
                    <div className="cdt cdt2" onClick={this.showSearchList.bind(this)} id='toggleList'><i className="cdtIcon cdt-on"></i></div>
                </div>
                <div className="mt10 clearfix">
                    <div className="left cont-left content-toggle">
                        <div className="toggle-box mt10 WA-detail-div">
                            <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit on">
                                工单详情
                            </h2>
                            <div className="bar mt5">
                                <dl className="workAllot-dl clearfix border-bottom-2 gddt">
                                    <dt>工单编号</dt>
                                    <dd>
                                        <span className="jobNumber">{commonJs.is_obj_exist(workOrderInfoDTO.jobNumber)}</span>
                                    </dd>
                                    <dt>工单类型</dt>
                                    <dd>
                                        <span className="wa-show">{commonJs.is_obj_exist(workOrderInfoDTO.jobType)}</span>
                                        <div className="wa-edit hidden" data-param="jobType">
                                            <select name="" id="" className="select-gray jobType">
                                                <option value="" hidden>{commonJs.is_obj_exist(workOrderInfoDTO.jobType)}</option>
                                                {
                                                    (this.state.workOrderType && this.state.workOrderType.length>0)?this.state.workOrderType.map((repy,i)=>{
                                                        return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                                    }):<option value="" hidden>暂未查到相关数据</option>
                                                }
                                            </select>
                                        </div>
                                    </dd>
                                    <dt>创建人</dt>
                                    <dd>
                                        {commonJs.is_obj_exist(workOrderInfoDTO.createdBy)}
                                    </dd>
                                    <dt>Portal号</dt>
                                    <dd>
                                        <span className="wa-show">{commonJs.is_obj_exist(workOrderInfoDTO.customerNumber)}</span>
                                        <div className="wa-edit hidden" data-param="customerNumber">
                                            <input type="text" className="input customerNumber" onKeyUp={commonJs.onlyNumber.bind(this)} />
                                        </div>
                                    </dd>
                                    <dt>产品号</dt>
                                    <dd>
                                        <span className="wa-show">{commonJs.is_obj_exist(workOrderInfoDTO.productNo)}</span>
                                        <div className="wa-edit hidden" data-param="productNo">
                                            <select name="" id="" value={this.state.editproductNo} onChange={(e)=>{
                                                this.setState({editproductNo:e.currentTarget.value})
                                            }} className="select-gray productNo">
                                                {/* <option className="defaultValue" value="" hidden>{commonJs.is_obj_exist(workOrderInfoDTO.productNo)}</option> */}
                                                {
                                                    (productNoEnums && productNoEnums.length>0)?productNoEnums.map((repy,i)=>{
                                                        return <option value={commonJs.is_obj_exist(repy.value)} key={i} data-optionCode={commonJs.is_obj_exist(repy.value)}>{commonJs.is_obj_exist(repy.displayName)+'-'+commonJs.is_obj_exist(repy.value)}</option>
                                                    }):<option value="" hidden>暂未查到相关数据</option>
                                                }
                                                <option value="其他" data-optionCode="其他">其他</option>
                                            </select>
                                        </div>
                                    </dd>
                                    <dt>工单级别</dt>
                                    <dd>
                                        <span className="wa-show">{commonJs.is_obj_exist(workOrderInfoDTO.orderLevel)}</span>
                                        <div className="wa-edit hidden" data-param="orderLevel">
                                            <select name="" id="" className="select-gray orderLevel">
                                                <option value="" hidden>{commonJs.is_obj_exist(workOrderInfoDTO.orderLevel)}</option>
                                                {
                                                    (this.state.workOrderLevel && this.state.workOrderLevel.length>0)?this.state.workOrderLevel.map((repy,i)=>{
                                                        return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                                    }):<option value="" hidden>暂未查到相关数据</option>
                                                }
                                            </select>
                                        </div>
                                    </dd>
                                    <dt>客户名称</dt>
                                    <dd>
                                        <span className="wa-show">{commonJs.is_obj_exist(workOrderInfoDTO.customerName)}</span>
                                        <div className="wa-edit hidden" data-param="customerName">
                                            <input type="text" className="input customerName"/>
                                        </div>
                                    </dd>
                                    <dt>工单状态</dt>
                                    <dd>
                                        <span className="wa-show">{commonJs.is_obj_exist(workOrderInfoDTO.jobStatus)}</span>
                                        <div className="wa-edit hidden" data-param="jobStatus">
                                            <select name="" id="" className="select-gray jobStatus">
                                                <option value="" hidden>{commonJs.is_obj_exist(workOrderInfoDTO.jobStatus)}</option>
                                                {
                                                    (this.state.edit_workOrderAddStatus && this.state.edit_workOrderAddStatus.length>0)?this.state.edit_workOrderAddStatus.map((repy,i)=>{
                                                        return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                                    }):<option value="" hidden>暂未查到相关数据</option>
                                                }
                                            </select>
                                        </div>
                                    </dd>
                                    <dt>联系号码</dt>
                                    <dd>
                                        <span className="wa-show">{commonJs.is_obj_exist(workOrderInfoDTO.contactNumber)}</span>
                                        <div className="wa-edit hidden" data-param="contactNumber">
                                            <input type="text" className="input contactNumber" onKeyUp={commonJs.myaer.bind(this)}/>
                                        </div>
                                    </dd>
                                    <dt>来电号码</dt>
                                    <dd>
                                        <span className="wa-show">{commonJs.is_obj_exist(workOrderInfoDTO.callNumber)}</span>
                                        <div className="wa-edit hidden" data-param="callNumber">
                                            <input type="text" className="input callNumber" onKeyUp={commonJs.myaer.bind(this)} />
                                        </div>
                                    </dd>
                                    <dt>处理部门</dt>
                                    <dd>
                                        <span className="wa-show">{commonJs.is_obj_exist(workOrderInfoDTO.dealDepartment)}</span>
                                        <div className="wa-edit hidden" data-param="dealDepartment">
                                            <select name="" id="" className="select-gray dealDepartment">
                                                <option value="" hidden>{commonJs.is_obj_exist(workOrderInfoDTO.dealDepartment)}</option>
                                                {
                                                    (this.state.workOrderDealDepartment && this.state.workOrderDealDepartment.length>0)?this.state.workOrderDealDepartment.map((repy,i)=>{
                                                        return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                                    }):<option value="" hidden>暂未查到相关数据</option>
                                                }
                                            </select>
                                        </div>
                                    </dd>
                                    <dt className="wa-show">最后处理</dt>
                                    <dd className="wa-show">{commonJs.is_obj_exist(workOrderInfoDTO.dealPeople)}</dd>
                                    <dt className="wa-show">最后更新</dt>
                                    <dd className="wa-show">{commonJs.is_obj_exist(workOrderInfoDTO.updatedAt)}</dd>
                                </dl>
                                <div className="border-bottom-2 pl20 pt10 pb10">
                                    工单内容&nbsp;&nbsp;|
                                </div>
                                <dl className="workAllot-dl clearfix gdtype border-bottom-2">
                                    <dt>客户问题</dt>
                                    <dd className="wka-question textarea-dd">
                                        <span className="wa-show word-break">{commonJs.is_obj_exist(workOrderInfoDTO.customerQuestion)}</span>
                                        <div className="wa-edit hidden" data-param="customerQuestion">
                                            {/* <input type="text" className="input customerQuestion"/> */}
                                            <textarea className="textarea customerQuestion" style={{"width":"100%","height":"120px"}}></textarea>
                                        </div>
                                    </dd>
                                    <dt>试图处理</dt>
                                    <dd>
                                        <span className="wa-show tryDeal">-</span>
                                        <div className="wa-edit hidden clearfix tryDeal-div" data-param="tryDeal">
                                            <i className={workOrderInfoDTO.tryDeal?"myCheckbox myCheckbox-visited left mr5 yes mt5":"myCheckbox myCheckbox-normal left mr5 yes mt5"}></i>
                                            <span className="left">是</span>
                                            <i className={!workOrderInfoDTO.tryDeal?"myCheckbox myCheckbox-visited left no mt5":"myCheckbox myCheckbox-normal left no mt5"}></i>
                                            <span className="left">否</span>
                                        </div>
                                    </dd>
                                    <dt>是否给客户回电</dt>
                                    <dd>
                                        <span className="wa-show callBack">-</span>
                                        <div className="wa-edit hidden callBack-div" data-param="callBack">
                                            <i className={workOrderInfoDTO.callBack?"myCheckbox myCheckbox-visited left mr5 yes mt5":"myCheckbox myCheckbox-normal left mr5 yes mt5"}></i>
                                            <span className="left">是</span>
                                            <i className={!workOrderInfoDTO.callBack?"myCheckbox myCheckbox-visited left no mt5":"myCheckbox myCheckbox-normal left no mt5"}></i>
                                            <span className="left">否</span>
                                        </div>
                                    </dd>
                                    <dt>后续处理结果</dt>
                                    <dd className="textarea-dd">
                                        <span className="wa-show word-break">{commonJs.is_obj_exist(workOrderInfoDTO.afterDeal)}</span>
                                        <div className="wa-edit hidden" data-param="afterDeal">
                                            {/* <input type="text" className="input afterDeal"/> */}
                                            <textarea className="textarea afterDeal" style={{"width":"100%"}}></textarea>
                                        </div>
                                    </dd>
                                </dl>
                                <div className="pt10 pb10 pl20 clearfix edit-div">
                                    <a className="btn-blue block left mr10 edit" onClick={this.edit.bind(this)}>编辑</a>
                                    <a className="btn-white block left hidden cancle" onClick={this.cancle.bind(this)}>取消</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="right cont-right content-toggle">
                        <div className="toggle-box mt10">
                            <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit on" onClick={commonJs.content_toggle.bind(this)}>
                                操作历史
                                <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                            </h2>
                            {
                                (this.state.workOrderHistroyInfoDTOList && this.state.workOrderHistroyInfoDTOList.length>0) ? this.state.workOrderHistroyInfoDTOList.map((repy,i)=>{
                                    return <div className="historyBox mt5" key={i}>
                                                <ul className="historyh3 bar pointer" onClick={this.historyHandle.bind(this)} id={commonJs.is_obj_exist(repy.id)}>
                                                    <li>
                                                        <b className="left">工单状态：</b>
                                                        <span className="left" title={commonJs.is_obj_exist(repy.jobStatus)}>{commonJs.is_obj_exist(repy.jobStatus)}</span>
                                                    </li>
                                                    <li>
                                                        <b className="left">处理时间：</b>
                                                        <span className="left" title={commonJs.is_obj_exist(repy.createdAt)}>{commonJs.is_obj_exist(repy.createdAt)}</span>
                                                    </li>
                                                    <li>
                                                        <b className="left">处理人：</b>
                                                        <span className="left" title={commonJs.is_obj_exist(repy.createdBy)}>{commonJs.is_obj_exist(repy.createdBy)}</span>
                                                    </li>
                                                </ul>
                                                <div className="bar history-detail hidden">
                                                    <dl className="workAllot-dl clearfix border-bottom-2 gddt mt2">
                                                        <dt>工单编号</dt>
                                                        <dd>
                                                            <span className="jobNumber">{commonJs.is_obj_exist(workOrderRecordInfoDTO.jobNumber)}</span>
                                                        </dd>
                                                        <dt>工单类型</dt>
                                                        <dd>
                                                            <span>{commonJs.is_obj_exist(workOrderRecordInfoDTO.jobType)}</span>
                                                        </dd>
                                                        <dt>创建人</dt>
                                                        <dd>
                                                            {commonJs.is_obj_exist(workOrderRecordInfoDTO.createdBy)}
                                                        </dd>
                                                        <dt>Portal号</dt>
                                                        <dd>
                                                            <span>{commonJs.is_obj_exist(workOrderRecordInfoDTO.customerNumber)}</span>
                                                        </dd>
                                                        <dt>工单级别</dt>
                                                        <dd>
                                                            <span>{commonJs.is_obj_exist(workOrderRecordInfoDTO.orderLevel)}</span>
                                                        </dd>
                                                        <dt>客户名称</dt>
                                                        <dd>
                                                            <span>{commonJs.is_obj_exist(workOrderRecordInfoDTO.customerName)}</span>
                                                        </dd>
                                                        <dt>工单状态</dt>
                                                        <dd>
                                                            <span>{commonJs.is_obj_exist(workOrderRecordInfoDTO.jobStatus)}</span>
                                                        </dd>
                                                        <dt>联系号码</dt>
                                                        <dd>
                                                            <span>{commonJs.is_obj_exist(workOrderRecordInfoDTO.contactNumber)}</span>
                                                        </dd>
                                                        <dt>来电号码</dt>
                                                        <dd>
                                                            <span>{commonJs.is_obj_exist(workOrderRecordInfoDTO.callNumber)}</span>
                                                        </dd>
                                                        <dt>处理部门</dt>
                                                        <dd>
                                                            <span>{commonJs.is_obj_exist(workOrderRecordInfoDTO.dealDepartment)}</span>
                                                        </dd>
                                                        <dt>最后处理</dt>
                                                        <dd>{commonJs.is_obj_exist(workOrderRecordInfoDTO.dealPeople)}</dd>
                                                        <dt>最后更新</dt>
                                                        <dd>{commonJs.is_obj_exist(workOrderRecordInfoDTO.updatedAt)}</dd>
                                                    </dl>
                                                    <div className="border-bottom-2 pl20 pt10 pb10">
                                                        工单内容&nbsp;&nbsp;|
                                                    </div>
                                                    <dl className="workAllot-dl clearfix gdtype border-bottom-2">
                                                        <dt>客户问题</dt>
                                                        <dd className="textarea-dd">
                                                            <span className="word-break">{commonJs.is_obj_exist(workOrderRecordInfoDTO.customerQuestion)}</span>
                                                        </dd>
                                                        <dt>试图处理</dt>
                                                        <dd>
                                                            <span className="tryDeal">-</span>
                                                        </dd>
                                                        <dt>是否给客户回电</dt>
                                                        <dd>
                                                            <span className="callBack">-</span>
                                                        </dd>
                                                        <dt>后续处理结果</dt>
                                                        <dd className="textarea-dd">
                                                            <span className="word-break">{commonJs.is_obj_exist(workOrderRecordInfoDTO.afterDeal)}</span>
                                                        </dd>
                                                    </dl>       
                                                </div>
                                            </div>}):<div className="gray-tip-font bar pl20 mt5">暂未查到相关数据...</div>
                            }
                        </div>
                        <div className="toggle-box mt10">
                            <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit on" onClick={commonJs.content_toggle.bind(this)}>
                                催收案例记录
                                <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                            </h2>
                            {
                                (this.state.getOverdueCaseRecordList && this.state.getOverdueCaseRecordList.length>0) ? <div className="historyBox mt5" style={{background: '#fff'}} ><Table rowKey='id' dataSource={this.state.getOverdueCaseRecordList}  scroll={{ x: 'max-content' }} columns={columns} /></div>:<div className="gray-tip-font bar pl20 mt5">暂未查到相关数据...</div>
                            }
                        </div>
                    </div>
                </div>
                {/* 弹窗 */}
                <div className="addWA hidden">
                    <div className="tanc_bg"></div>
                    <div className="tanc-cont">
                        <dl className="workAllot-dl clearfix border-bottom-2 gddt">
                            <dt>工单类型</dt>
                            <dd>
                                <select name="" id="popJobType" className="select-gray jobType">
                                    {/* <option value="" hidden>请选择</option> */}
                                    {
                                        (this.state.workOrderType && this.state.workOrderType.length>0)?this.state.workOrderType.map((repy,i)=>{
                                            return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                        }):<option value="" hidden>暂未查到相关数据</option>
                                    }
                                </select>
                            </dd>
                            <dt>Portal号</dt>
                            <dd>
                                <input type="text" className="input customerNumber" id='popCustomerNumber' placeholder="请输入" onKeyUp={commonJs.onlyNumber.bind(this)} />
                            </dd>
                            <dt>产品号</dt>
                            <dd>
                                {
                                    <select name="" id="add_productNo" className="select-gray left mr10 add_productNo">
                                        <option value="" data-optionId="0" data-show="no" hidden>请选择</option>
                                        <option value="" data-optionId="">全部</option> 
                                        {
                                            (productNoEnums && productNoEnums.length>0) ? productNoEnums.map((repy,i)=>{
                                                return <option data-value={commonJs.is_obj_exist(repy.value)} name="" key={i}>{commonJs.is_obj_exist(repy.displayName)+'-'+commonJs.is_obj_exist(repy.value)}</option>
                                            }):<option value=""></option>
                                        }
                                        <option data-value='其他'>其他</option> 
                                    </select>
                                }
                            </dd>
                            <dt>工单级别</dt>
                            <dd>
                                <select name="" id="popOrderLevel" className="select-gray orderLevel">
                                    {/* <option value="" hidden>请选择</option> */}
                                    {
                                        (this.state.workOrderLevel && this.state.workOrderLevel.length>0)?this.state.workOrderLevel.map((repy,i)=>{
                                            return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                        }):<option value="" hidden>暂未查到相关数据</option>
                                    }
                                </select>
                            </dd>
                            <dt>客户名称</dt>
                            <dd>
                                <input type="text" className="input customerName" id='popCustomerName' placeholder="请输入" />
                            </dd>
                            <dt>工单状态</dt>
                            <dd>
                                <select name="" id="popJobStatus" className="select-gray jobStatus" disabled="true">
                                    <option value="" hidden>新建,可处理工单</option>
                                    {/* {
                                        (this.state.workOrderAddStatus && this.state.workOrderAddStatus.length>0)?this.state.workOrderAddStatus.map((repy,i)=>{
                                            return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                        }):<option value="" hidden>暂未查到相关数据</option>
                                    } */}
                                </select>
                            </dd>
                            <dt>联系号码</dt>
                            <dd>
                                <input type="text" className="input contactNumber" id='popContactNumber' placeholder="请输入" onKeyUp={commonJs.myaer.bind(this)} />
                            </dd>
                            <dt>来电号码</dt>
                            <dd>
                                <input type="text" className="input callNumber" id='popCallNumber' placeholder="请输入" onKeyUp={commonJs.myaer.bind(this)} />
                            </dd>
                            <dt>处理部门</dt>
                            <dd>
                                <select name="" id="popDealDepartment" className="select-gray dealDepartment">
                                    {/* <option value="" hidden>请选择</option> */}
                                    {
                                        (this.state.workOrderDealDepartment && this.state.workOrderDealDepartment.length>0)?this.state.workOrderDealDepartment.map((repy,i)=>{
                                            return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-optionCode={commonJs.is_obj_exist(repy.optionCode)} data-fromGroup={commonJs.is_obj_exist(repy.fromGroup)}>{commonJs.is_obj_exist(repy.optionName)}</option>
                                        }):<option value="" hidden>暂未查到相关数据</option>
                                    }
                                </select>
                            </dd>
                        </dl>
                        <div className="border-bottom-2 pl20 pt10 pb10">
                            工单内容&nbsp;&nbsp;|
                        </div>
                        <dl className="workAllot-dl clearfix gdtype border-bottom-2">
                            <dt>客户问题</dt>
                            <dd className="wka-question  textarea-dd" data-param="customerQuestion">
                                {/* <input type="text" className="input customer-question" placeholder="请输入"/> */}
                                <textarea name="" className="customer-question textarea" id='customerQues' style={{"width":"100%","height":"120px"}}></textarea>
                            </dd>
                            <dt>试图处理</dt>
                            <dd className="wa-edit-add" data-param="tryDeal">
                                <i id='tryDeal1' className={workOrderInfoDTO.tryDeal?"myCheckbox myCheckbox-visited left mr5 yes mt5":"myCheckbox myCheckbox-normal left mr5 yes mt5"}></i>
                                <span className="left">是</span>
                                <i id='tryDeal0' className={!workOrderInfoDTO.tryDeal?"myCheckbox myCheckbox-visited left no mt5 ml10":"myCheckbox myCheckbox-normal left no mt5 ml10"}></i>
                                <span className="left">否</span>
                            </dd>
                            <dt>是否给客户回电</dt>
                            <dd className="wa-edit-add" data-param="callBack">
                                <i id='callBack1' className={workOrderInfoDTO.callBack?"myCheckbox myCheckbox-visited left mr5 yes mt5":"myCheckbox myCheckbox-normal left mr5 yes mt5"}></i>
                                <span className="left">是</span>
                                <i id='callBack0' className={!workOrderInfoDTO.callBack?"myCheckbox myCheckbox-visited left no mt5 ml10":"myCheckbox myCheckbox-normal left no mt5 ml10"}></i>
                                <span className="left">否</span>
                            </dd>
                            <dt>后续处理结果</dt>
                            <dd data-param="afterDeal" className="textarea-dd" >
                                {/* <input type="text" className="input afterDeal" placeholder="请输入"/> */}
                                <textarea name="" id="afterDeal" className="afterDeal textarea"></textarea>
                            </dd>
                        </dl>
                        <div className="addWa-edit">
                            <a id='addBtn' className="btn-blue block left mr10 edit-add" onClick={this.saveNewWorkList.bind(this)}>新增</a>
                            <a id='addBtnCancle' className="btn-white block left cancle-add " onClick={this.cancleadd.bind(this)}>取消</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
};

export default WorkAllot;  