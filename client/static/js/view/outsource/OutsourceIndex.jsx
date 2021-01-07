// 委外页面
import React from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import $ from 'jquery';
import { Pagination, Modal, Button, DatePicker,Select,Form } from 'antd'; 
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const { Option } = Select;
import FileUpload from 'react-fileupload';
import LabelBody from '../common/labelBody';

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import ChangeLabel2A from '../../source/common/changeLabel2A';
let changeLabel2A=new ChangeLabel2A;
import ChangeLabelCP from '../../source/common/changeLabelCP';
let changeLabelCP=new ChangeLabelCP;
import AccountBar from '../A2-module/AccountBar'  // 横向的信息栏

import SortTimeJs from '../../source/common/sortTime';
var sortTimeJs=new SortTimeJs;
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
@Form.create() 
class OutsourceIndex extends React.Component{
    constructor(props){
        super(props);
        this.userInfoCP=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.topBindNumberStore=this.props.allStore.TopBindNumberStore;  //顶部绑定（完成）数显示-通用 2A portal
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息  
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2A PORTAL用户详情-UserMsg组件信息 
        this.state={
            params_rigPage:this.props.params.rigPage,  //右侧页面对应的路由值
            rowData:{},//给labelBody.jsx组件的数据
            clickNextNumber:0,
            pageSize:10,  //每页显示多少条
            pageNum:1,  //当前页码
            outsourceTimeS: null,  //委外时间
            outsourceTimeE: null,
            outsourceTimeO: false,
            orderType:'asc',  //排序字段方式
            externalInfoDTOList:[],
            pageType:'2Fseach',
            backFundVisible:false
        }
    }
    @action UNSAFE_componentWillMount(){
        this.labelBoxStore.lef_page="";
        this.labelBoxStore.rig_page="";
        this.userInfo2AStore.resetUserInfo2a();
    }
    componentDidMount(){
        var that=this;
        this.init();
        commonJs.reloadRules();
        var h = document.documentElement.clientHeight;
        if(this.props._params_rigPage!="outsource"){
            $("#content").height(h-40);
        }
        // this.topBindNumberStore.initCount("/RemColt/initial");
        $(".cdt-list").on('click','.myCheckbox',function(event){
            let self=$(event.target);
            $('#selectAll,#selectCurrentpage').removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            self.parent().siblings().find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            let _state=self.hasClass("myCheckbox-normal");
            if(_state){
                self.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            }else {
                self.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            }
            event.stopPropagation();
        })
        //修改state
        $(".cdt-list").on('click','tr',function(){
            $(".cdt-list tr").removeClass("tr-on");
            $(this).addClass("tr-on");
            let n=$(this).index();
            let _rowData=that.state.externalInfoDTOList[n];
            if(!_rowData){
                return;
            }
            let _productNo=_rowData.productNo; //合作方，3C.4A...;
            that.setState({
                productNo:_productNo,
                rowData:_rowData,
                isRight2ADetail:{isChange:true,changeNo:9},  //当右侧组件为case、file....时，isChange是否切换，changeNo需要切换的板块对应的label data-id
                isRightCPDetail:{isChange:true,changeNo:1},
            },()=>{
                //刷新labelBox组件
                commonJs.changeLabelBoxFn(that,_rowData,changeLabel2A,changeLabelCP,{isChange:true,changeNo:9},{isChange:true,changeNo:1},{pageType:'Collection',nationalId:_rowData.nationalId});
                $(".labelBodyDiv").removeClass("hidden");
            });
        })
    }
    init(){
        let that=this;
        $.ajax({
            type:"get",
            url:"/RemColt/companyLIst",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        companyLIst:[],  //公司list
                        caseSettleEnum:[],  //结案list
                        productNoEnums:[]  //合作方数据
                    })
                    return;
                }
                var _getData = res.data;
                that.setState({
                    companyLIst:cpCommonJs.opinitionArray(_getData.externalCompanyInfoDTOList),  //公司list
                    caseSettleEnum:cpCommonJs.opinitionArray(_getData.caseSettleEnum),  //结案list
                    productNoEnums:cpCommonJs.opinitionArray(_getData.productNoEnums)  //合作方列表
                })
            }
        })
    }
    //逾期勾选
    overdueHandle(event){
        let $this=$(event.target);
        if($this.hasClass("myCheckbox-visited")){
            $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            $this.next(".externalStatus").removeClass("blue-font");
        }else{
            $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            $this.next(".externalStatus").addClass("blue-font");
        }
    }
    //展开收起搜索结果列表
    showSearchList(e){
        let $this=$(e.target);
        let $parent=$this.closest(".cdt-result").find(".cdt-list");
        if($this.hasClass("cdtIcon")){
            $this=$this.parent();
        }
        let cdtIcon=$this.find(".cdtIcon");
        if(cdtIcon.hasClass("cdt-off")){
            cdtIcon.removeClass("cdt-off").addClass("cdt-on");
            $(".cdt-list").animate({"max-height":"245px"});
        }else{
            cdtIcon.removeClass("cdt-on").addClass("cdt-off");
            $(".cdt-list").animate({"max-height":"42px"});
        }
    }
    // 改变每页显示条目数
    onShowSizeChange(pageNum, pageSize) {
        this.setState({
            pageNum:1,
            pageSize:pageSize
        },()=>{
            this.RmdSearch();
        })
    }
    //快速跳转到某一页。
    gotoPageNum(pageNumber) {
        this.setState({
            pageNum:pageNumber
        },()=>{
            this.RmdSearch();
        })
    }
    
    //获取搜索条件
    getConditions(){
        let data={};
        let loanNumber=$(".top .loanNumber").val().replace(/\s/g,"");   //用户合同号
        let phone=$(".top .phoneNo").val().replace(/\s/g,"");   //手机号
        let userName=$(".top .name").val().replace(/\s/g,"");  //姓名
        let accountId=$(".top .acount").val().replace(/\s/g,"");   //用户账号
        let overdueDaysStart=$(".top .overdueDaysStart").val().replace(/\s/g,"");   //逾期天数开始
        let overdueDaysEnd=$(".top .overdueDaysEnd").val().replace(/\s/g,"");   //逾期天数结束
        let overduePrincipalInterestStart=$(".top .overduePrincipalInterestStart").val().replace(/\s/g,"");   //逾期金额开始
        let overduePrincipalInterestEnd=$(".top .overduePrincipalInterestEnd").val().replace(/\s/g,"");   //逾期金额结束
        let companyName=$(".top .companyName option:selected").attr("data-companycode");   //外催公司
        let externalStatus=$(".top .overdue").hasClass("myCheckbox-visited")?"true":"false";   //逾期状态(逾期：目前状态为非委外，不逾期：已经委外)
        let externalStartTime=commonJs.dateToString2(this.state.outsourceTimeS);   //委外时间起
        let externalEndTime=commonJs.dateToString2(this.state.outsourceTimeE);   //委外时间止
        let uploadData=$(".top .uploadData").hasClass("myCheckbox-visited")?"true":"false";  //是仅搜索导入文件数据
        let _productNo=$(".top .productNoEnums option:selected").attr("value");//合作方
        if(_productNo)data.productNo=_productNo;
        
        if(overdueDaysStart) data.overdueDaysStart=overdueDaysStart;
        if(overdueDaysEnd) data.overdueDaysEnd=overdueDaysEnd;
        if(overduePrincipalInterestStart) data.overduePrincipalInterestStart=overduePrincipalInterestStart;
        if(overduePrincipalInterestEnd) data.overduePrincipalInterestEnd=overduePrincipalInterestEnd;
        if(loanNumber) data.loanNumber=loanNumber;
        if(phone) data.telPhone=phone;
        if(userName) data.userName=userName;
        if(accountId) data.accountId=accountId;
        if(companyName) data.companyName=companyName;
        if(externalStatus) data.externalStatus=externalStatus;
        if(uploadData) data.uploadData=uploadData;
        if(externalStartTime!="1970-01-01" && externalStartTime!='NaN-aN-aN') data.externalStartTime=externalStartTime;
        if(externalEndTime!="1970-01-01" &&  externalEndTime!='NaN-aN-aN') data.externalEndTime=externalEndTime;
        data.needOrderField='external_time';  //需要排序的字段名称
        data.orderType=this.state.orderType;  //排序字段方式
        data.pageSize=this.state.pageSize;
        data.pageNum=this.state.pageNum;
        return data;
    }
    /**
     * 搜索
     * @param {*} fromBtn 点击搜索按钮
     * @param {*} isSort 是否排序
     */
    RmdSearch(fromBtn){
        let _that=this;
        let _data=this.getConditions();
        let _productNo=$(".top .productNoEnums option:selected").attr("value");//合作方
        if(!_productNo){
            alert("请选择合作方！");
            return;
        }else{
            _data.productNo=_productNo;
        }
        $(".labelBodyDiv").addClass("hidden");
        $(".pt-table tr").removeClass("tr-on");
        if(fromBtn){
            _data.pageNum=1;
        }
        console.log(_data);
        $.ajax({
            type:"post",
            url:"/RemColt/externalList?time="+new Date().getTime(),
            async:true,
            dataType: "JSON",
            data:_data,
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);       
             },
            success:function(res) {
                $("#loading").remove();
                commonJs.ajaxGetCode(res);
                let _getData = res.data;
                if(!_getData){
                    _that.setState({
                        externalInfoDTOList: [],
                        totalSize:0,
                        pageNum:1
                    });
                    return;
                }
                if(fromBtn){
                    $(".labelBodyDiv").addClass("hidden");
                }
                _that.setState({
                    externalInfoDTOList:_getData.externalInfoDTOList ? _getData.externalInfoDTOList : [],
                    totalSize:_getData.totalSize,
                    pageNum:_getData.pageNum
                })
                
                if(_getData.externalInfoDTOList && _getData.externalInfoDTOList.length<7){
                    $(".cdt-list").css("padding-right","18px");
                }else{
                    $(".cdt-list").css("padding-right","0");
                }
                $('.cdt-result').find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　},
        })
    }
    //关闭弹窗
    closetanc(event){
        let $this=$(event.target);
        this.reset_pop();
        $this.closest(".tanc").addClass("hidden");
    }
    //确认结案
    sureSettle(){
        let _that=this;

        let _data={};
        let _productNo=$(".top .productNoEnums option:selected").attr("value");//合作方
        _data.productNo=_productNo;
        let loanNumberList=this.state.loanNumberList;
        let accountIds=this.state.accountIdArray
        let caseSettle=$(".settle-pop .caseSettle option:selected").attr("data-value");
        if(!caseSettle){
            alert('请选择结案结果!');
            return;
        }
        if(_productNo == ''){
            alert('请选择合作方!');
            return;
        }
        _data.caseSettle=caseSettle;
        if($('#selectAll').hasClass('myCheckbox-visited')){
            _data.externalRequestDTO=this.getConditions();
        }
        if($(".outsourceList .myCheckbox").length>0){  //全选当页
            _data.loanNumberList=loanNumberList;
            _data.accountIds=accountIds;
        }
        $.ajax({
            type:"post",
            url:"/RemColt/externalSettle",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);       
             },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                _that.reset_pop();
                $(".settle-pop").addClass("hidden");
                alert(_getData.message);
                $(".cdt-result .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                _that.RmdSearch();
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
            },
        })
    }
    //委外时间
    onChange(field, value){
        this.setState({
            [field]: value,
        });
    }
    outsourceTimeSdis(outsourceTimeS){
        const outsourceTimeE = this.state.outsourceTimeE;
        if (!outsourceTimeS || !outsourceTimeE) {
            return false;
        }
        return outsourceTimeS.valueOf() > outsourceTimeE.valueOf()-1;
    }
    outsourceTimeEdis(outsourceTimeE){
        const outsourceTimeS = this.state.outsourceTimeS;
        if (!outsourceTimeE || !outsourceTimeS) {
            return false;
        }
        return outsourceTimeE.valueOf() <= outsourceTimeS.valueOf()-1;
    }
    outsourceTimeSchange(value){
        this.onChange('outsourceTimeS', value);
    }
    outsourceTimeEchange(value){
        this.onChange('outsourceTimeE', value);
    }
    outsourceTimeSOC(open){
        if (!open) {
            this.setState({ outsourceTimeO: true });
        }
    }
    outsourceTimeEOC(open){
        this.setState({ outsourceTimeO: open });
    }
    /**
     * 详情--select框切换合同号
     */
    changeDetLoanNo(){
        changeLabel2A.changeLeft2A(1,this);  //重新加载案列页面
        this.setState({
            _labelBody_reload:"noload",
        })
    }
    //弹窗
    dispatchPop(event){
        let _accountArray=[];
        let _loanNumberArray=[];
        let externalInfoDTOList=this.state.externalInfoDTOList?this.state.externalInfoDTOList:[];  //总的数据
        let $this=$(event.target);
        let pop=$(".outcouce-pop");
        if($this.text()=="结案"){
            pop=$(".settle-pop");
        }else{
            pop=$(".outcouce-pop");
        }

        if(this.state.externalInfoDTOList.length<=0){
            alert('请先搜索数据！');
            return;
        }
        if($(".pt-table").find(".myCheckbox-visited").length<=0 && $('#selectAll').hasClass('myCheckbox-normal')){
            alert("请选择操作内容！");
            return;
        }
        $(".cdt-result .cdt-list tr").each(function(){
            if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                _accountArray.push($(this).find(".r_accountId").text());
                _loanNumberArray.push($(this).find(".r_loanNumber").text());
            }
        })
        pop.removeClass("hidden");
        this.setState({
            accountIdArray:_accountArray,
            loanNumberList:_loanNumberArray
        })
    }
    //确认改派
    sureDispath(event){
        let _that=this;
        let _data={};
        let _productNo=$(".top .productNoEnums option:selected").attr("value");//合作方
        _data.productNo=_productNo;
        let loanNumberList=this.state.loanNumberList;
        let accountIdList=this.state.accountIdArray;
        let _couseCompany=$(".outcouce-pop .couseCompany option:selected").attr("data-companycode");
        if(!_couseCompany){
            alert("请选择改派对象！");
            return;
        }
        if(!this.state.caseTime){
            alert('请选择留案时间!');
            return;
        }
        if(_productNo == ''){
            alert('请选择合作方!');
            return;
        }
        _data.preCaseSettleDate=this.state.caseTime.format('YYYY-MM-DD');
        if($('#selectAll').hasClass('myCheckbox-visited')){
            _data.externalRequestDTO=this.getConditions();
        }
        if($(".outsourceList .myCheckbox").length>0){  //全选当页
            _data.loanNumberList=loanNumberList;
            _data.accountId=accountIdList;
            _data.companyName=_couseCompany;
        }
        $.ajax({
            type:"post",
            url:"/RemColt/external/reassignCompany",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);       
             },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                _that.reset_pop();
                $(".outcouce-pop").addClass("hidden");
                $(".cdt-result .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                alert(_getData.message);
                _that.RmdSearch();
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
            },
        })
    }
    // 重置改派和结案弹窗
    reset_pop=()=>{
        $(".outcouce-pop .couseCompany option").removeProp('selected');
        $(".outcouce-pop .couseCompany option[data-show='0']").prop("selected","selected");
        $(".settle-pop .caseSettle option").removeProp('selected');
        $(".settle-pop .caseSettle option[data-show='0']").prop("selected","selected");
        this.setState({
            caseTime:null
        })
    }
    // 上传成功
    _handleUploadSuccess(type,obj) {
        if(type == 'F'){
            alert(obj.data.message);
            $(".top .uploadData").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            this.RmdSearch(true);
        }else{
            alert(obj.data.errorCode.descr);
        }
    }
    // 上传失败
    _handleUploadFailed(type,obj) {
        console.log(type)
        if(type=='F'){
            alert(obj.data.message);
        }else{
            alert(obj.data.errorCode.descr);
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
    //排序
    Tsort(e){
        let $this=$(e.target);
        if($this.hasClass('st')){
            $this=$this.parent();
        }
        let dataSort=$this.attr('data-sort');
        let orderType='';
        if(dataSort=='asc'){
            orderType='desc';
            $this.attr('data-sort','desc');
            $this.find(".sort-icon").removeClass("sort-normal sort-order").addClass("sort-invert");
        }else{
            orderType='asc';
            $this.attr('data-sort','asc');
            $this.find(".sort-icon").removeClass("sort-normal sort-invert").addClass("sort-order");
        }
        this.setState({
            orderType:orderType
        },()=>{
            this.RmdSearch();
        })
    }
    //全选当页
    selectCurrentpage=(e)=>{
        let $this=$(e.target);
        $('#selectAll').removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        if($this.hasClass("myCheckbox-visited")){
            $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal")
            $('.cdt-result tbody').find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }else {
            $('.cdt-result tbody').find(".myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        } 
    }
    //全选
    selectAll=(e)=>{
        commonJs.myCheckbox(e);
        $('.cdt-result tbody').find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        $('#selectCurrentpage').removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
    }
    //留案时间
    caseTime=(value, dateString)=>{
        this.setState({
            caseTime:value
        })
    }
    // 新增回款&结算明细下载
    backFund=()=>{
        this.setState({
            backFundVisible: true,
        });
    }
    handleCancel = e => {
        console.log(e);
        this.setState({
            backFundVisible: false,
        });
        this.props.form.resetFields();
        this.setState({
            backFundVisible: false,
        });
    };
    // 新增回款&结算明细下载
    backFundDownLoand=()=>{
        this.props.form.validateFields((err, values) => {
            console.log('Received values of form values: ', values);
            if(err){
              return;
            }
            let beginDate=values.time[0].format('YYYY-MM-DD');
            let endDate=values.time[1].format('YYYY-MM-DD');
            window.open(`/node/external/payment/settlement?beginDate=${beginDate}&endDate=${endDate}&companies=${values.companies.toString()}`);
            // this.props.form.resetFields();
            // this.setState({
            //     backFundVisible: false,
            // });
        })
        
    }
    resetBackFund=()=>{
        this.props.form.resetFields();
    }
    render() {
        const { outsourceTimeS, outsourceTimeE, outsourceTimeO,externalInfoDTOList,totalSize,pageNum,companyLIst=[],productNoEnums=[] } = this.state;
        const { getFieldDecorator } = this.props.form;
        let fileOption={
            uploadOptions:{
                baseUrl: '/RemColt/external/upload',
                multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
                fileFieldName:"ws",
                numberLimit: 3,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
                accept: 'excel/*',  //限制选择文件的类型（后缀）
                chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
                wrapperDisplay: 'inline-block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
                beforeUpload: this._checkUploadImg,  //beforeUpload(files,mill) 进行上传动作之前执行，返回true继续，false阻止文件上传
                uploading: this._handleUploading,    //在文件上传中的时候，浏览器会不断触发此函数，IE9-为虚拟的进度
                uploadSuccess: this._handleUploadSuccess.bind('F',this),  //上传成功后执行的回调（针对AJAX而言）
                uploadFail: this._handleUploadFailed.bind('F',this),  //上传失败后执行的回调（针对AJAX而言）
                uploadError: this._handleUploadFailed.bind('F',this)  //上传错误后执行的回调（针对AJAX而言）
            }
        };
        let fileOption1={
            uploadOptions:{
                baseUrl: '/Qport/collection/bulkImportOutSourcing',
                param: {
                    // channel:this.state.channel_selected
                },
                // multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
                fileFieldName:"ws",
                // numberLimit: 1,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
                accept: '.xls,.xlsx',  //限制选择文件的类型（后缀）
                chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
                wrapperDisplay: 'block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
                beforeUpload: this._checkUploadImg,  //beforeUpload(files,mill) 进行上传动作之前执行，返回true继续，false阻止文件上传
                uploading: this._handleUploading,    //在文件上传中的时候，浏览器会不断触发此函数，IE9-为虚拟的进度
                uploadSuccess: this._handleUploadSuccess.bind('F1',this),  //上传成功后执行的回调（针对AJAX而言）
                uploadFail: this._handleUploadFailed.bind('F1',this),  //上传失败后执行的回调（针对AJAX而言）
                uploadError: this._handleUploadFailed.bind('F1',this)  //上传错误后执行的回调（针对AJAX而言）
            }
        }
        return (
            <div className="content" id="content">
                <div className="top" data-isresetdiv="yes" data-resetstate="outsourceTimeS,outsourceTimeE">
                    <div className="clearfix">
                        <select name="" id="productNoEnums" className="select-gray productNoEnums mr15 mt10" style={{"width":"160px"}}>
                            <option value="" hidden>合作方</option>
                            {
                                productNoEnums.length > 0?productNoEnums.map((repy,i)=>{
                                    return <option value={commonJs.is_obj_exist(repy.value)} key={i}>{commonJs.is_obj_exist(repy.displayName)+'-'+commonJs.is_obj_exist(repy.value)}</option>
                                }):<option value="">全部</option>
                            }
                        </select>
                        <input type="text" name="" placeholder="手机号" className="input left mr10 mt10 phoneNo input_w" id='phoneNo' />
                        <input type="text" name="" placeholder="姓名" className="input left mr10 mt10 name input_w" id='name' />
                        <input type="text" name="" placeholder="账号" className="input left mr10 mt10 acount input_w" id='acount' />
                        <input type="text" name="" placeholder="合同号" className="input left mr10 mt10 loanNumber input_w" id='loanNumber' />
                        <select name="" id="companyName" className="companyName select-gray left mt10 mr10" style={{"width":"150px"}}>
                            <option value="" hidden>请选择</option>
                            <option value="">全部</option>
                            {
                                (companyLIst && companyLIst.length>0)?companyLIst.map((repy,i)=>{
                                    return <option key={i} id={repy.id} data-companycode={repy.companyCode}>{commonJs.is_obj_exist(repy.companyName)}</option>
                                }):<option value=""></option>
                            }
                        </select>
                        <div className="left" style={{"height":"36px"}}>
                            <i className="myCheckbox myCheckbox-normal left mt18 overdue" id='overdue' onClick={commonJs.myCheckboxSingle.bind(this)}></i>
                            <b className=" left mt15 mr10 externalStatus">逾期</b>
                        </div>
                        <dl className="left outsouceTime mt10">
                            <dt>委外日期：</dt>
                            <dd id='outsouceTime'>
                                <DatePicker
                                    disabledDate={this.outsourceTimeSdis.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={outsourceTimeS}
                                    placeholder="Start"
                                    onChange={this.outsourceTimeSchange.bind(this)}
                                    onOpenChange={this.outsourceTimeSOC.bind(this)}
                                />
                                <span> - </span>
                                <DatePicker
                                    disabledDate={this.outsourceTimeEdis.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={outsourceTimeE}
                                    placeholder="End"
                                    onChange={this.outsourceTimeEchange.bind(this)}
                                    open={outsourceTimeO}
                                    onOpenChange={this.outsourceTimeEOC.bind(this)}
                                />
                            </dd>
                        </dl>
                        <dl className="left outsouceTime mt10" style={{width:'295px'}}>
                            <dt>逾期天数：</dt>
                            <dd>
                                <input type="number" onKeyPress={commonJs.handleKeyPress.bind(this,['.'])} className='input left overdueDaysStart' style={{width:'100px'}} />
                                <span className='left ml3 mr3' style={{lineHeight:'32px'}}> - </span>
                                <input type="number" onKeyPress={commonJs.handleKeyPress.bind(this,['.'])} className='input left overdueDaysEnd' style={{width:'100px'}} />
                            </dd>
                        </dl>
                        <dl className="left outsouceTime mt10" style={{width:'295px'}}>
                            <dt>逾期金额：</dt>
                            <dd>
                                <input type="number" onKeyPress={commonJs.handleKeyPress.bind(this,['.'])} className='input left overduePrincipalInterestStart' style={{width:'100px'}} />
                                <span className='left ml3 mr3' style={{lineHeight:'32px'}}> - </span>
                                <input type="number" onKeyPress={commonJs.handleKeyPress.bind(this,['.'])} className='input left overduePrincipalInterestEnd' style={{width:'100px'}} />
                            </dd>
                        </dl>
                        <div className="left" style={{"height":"42px"}}>
                            <i className="myCheckbox myCheckbox-normal left mt18 uploadData" id='uploadData' onClick={commonJs.myCheckboxSingle.bind(this)}></i>
                            <b className=" left mt15 mr10 externalStatus">仅搜导入文件数据</b>
                        </div>
                        <button className="left mr15 mt10 btn-blue getCQ-btn" onClick={this.RmdSearch.bind(this,true)} id='searchBtn'>搜索</button>
                        <button className="left mt10 btn-white mr15" onClick={commonJs.resetCondition.bind(this,this)} id='reset'>重置</button>
                        <button className="right mr15 mt10 btn-blue getCQ-btn" onClick={this.backFund} id='backFund'>结算明细下载</button>
                    </div>
                </div>
                
                <div className="cdt-result bar mt20 relative">
                    <div className="bar pr20 pt5">
                        <button className="dispatch right mr2" id='dispatchPop' onClick={this.dispatchPop.bind(this)}>改派</button>
                        <button className="dispatch right mr2" id='external' data-btn-rule="EXTERNAL:SETTLE" onClick={this.dispatchPop.bind(this)}>结案</button>
                        <FileUpload className={'right'} options={fileOption1.uploadOptions}  ref="fileUpload">
                            <button ref="chooseAndUpload" className="dispatch right mr2">批量导入</button>
                        </FileUpload>
                        
                        <b className="right pointer blue-font mr10"><i className="myCheckbox myCheckbox-normal" id='selectAll' onClick={this.selectAll.bind(this)}></i>全选</b>
                        <b className="right pointer blue-font mr10"><i className="myCheckbox myCheckbox-normal" id='selectCurrentpage' onClick={this.selectCurrentpage.bind(this)}></i>全选当页</b>
                    </div>
                    <div className="cdt-th">
                        <table className="pt-table outsourceList">
                            <thead>
                                <tr className='th-bg'>
                                    <th width="5%">账号</th>
                                    <th width="15%">贷款号码</th>
                                    <th width="5%">姓名</th>
                                    <th width="10%">逾期天数</th>
                                    <th width="10%" className="pointer" data-sort="asc" onClick={this.Tsort.bind(this)}>
                                        <span className="left mr5 st">委外日期</span>
                                        <i className="sort-icon sort-normal mt19 st"></i>
                                    </th>
                                    <th width="5%">委外公司</th>
                                    <th width="10%">委外金额</th>
                                    <th width="10%">逾期本息</th>
                                    <th width="7%">逾期罚息</th>
                                    <th width="7%">结清金额</th>
                                    <th width="3%"></th>
                                </tr>
                            </thead>
                            <tbody className="pt-table layout-fixed cdt-list">
                            {
                                (externalInfoDTOList && externalInfoDTOList.length>0) ? externalInfoDTOList.map((repy,i)=>{
                                    return <tr key={i} id={commonJs.is_obj_exist(repy.id)}>
                                            <td className="r_accountId" width="5%" title={commonJs.is_obj_exist(repy.accountId)}>{commonJs.is_obj_exist(repy.accountId)}</td>
                                            <td className="r_loanNumber" width="15%" title={commonJs.is_obj_exist(repy.loanNumber)}>{commonJs.is_obj_exist(repy.loanNumber)}</td>
                                            <td className="r_name" width="5%" title={commonJs.is_obj_exist(repy.userName)}>{commonJs.is_obj_exist(repy.userName)}</td>
                                            <td width="10%" title={commonJs.is_obj_exist(repy.overduDay)}>{commonJs.is_obj_exist(repy.overduDay)}</td>
                                            <td width="10%" title={commonJs.is_obj_exist(repy.externalTime)}>{commonJs.is_obj_exist(repy.externalTime)}</td>
                                            <td width="5%" title={commonJs.is_obj_exist(repy.externalCompany)}>{commonJs.is_obj_exist(repy.externalCompany)}</td>{/* 委外公司 */}
                                            <td width="10%" title={commonJs.is_obj_exist(repy.amount)}>{commonJs.is_obj_exist(repy.amount)}</td> {/* 委外金额 */}
                                            <td width="10%" title={commonJs.is_obj_exist(repy.overduePrincipalInterest)}>{commonJs.is_obj_exist(repy.overduePrincipalInterest)}</td> {/* 逾期本息 */}
                                            <td width="7%" title={commonJs.is_obj_exist(repy.overduePenalty)}>{commonJs.is_obj_exist(repy.overduePenalty)}</td> {/* 逾期罚息 */}
                                            <td width="7%" title={commonJs.is_obj_exist(repy.settlementAmount)}>{commonJs.is_obj_exist(repy.settlementAmount)}</td> {/* 结清金额 */}
                                            <td width="3%"><i className="myCheckbox myCheckbox-normal" id={'myCheckbox'+i}></i></td>
                                        </tr>
                                }):<tr><td colSpan="3" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }  
                            </tbody>
                        </table>
                    </div>
                    <div className="cdt-th th-bg clearfix pl20 pt5 pb5 pr20">
                            <div className="paageNo left" id='pageAtion'>
                                <Pagination
                                    showQuickJumper
                                    showSizeChanger
                                    onShowSizeChange={this.onShowSizeChange.bind(this)}
                                    defaultPageSize={this.state.barsNum}
                                    defaultCurrent={1}
                                    current={pageNum}
                                    total={totalSize}
                                    onChange={this.gotoPageNum.bind(this)}
                                    pageSizeOptions={['10','50','100','200','500','1000']}
                                />
                            </div>
                        <span className="pl10 left mt2">共 {totalSize} 条数据</span>
                        <div className="right mr10 mt3">
                            {/* <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                                <button className="btn-blue" ref="chooseAndUpload" id='externalUpload' data-btn-rule="external:upload:key">导入</button>
                            </FileUpload> */}
                        </div>
                        {
                            (externalInfoDTOList && externalInfoDTOList.length>0) ? <a href={"/RemColt/exportExternalList?1=1"+(this.getConditions()?commonJs.toHrefParams(this.getConditions()):"")} id='downRecord' className="downRecord right mt2 mr10" data-btn-rule="EXTERNAL:EXPORT">导出记录</a> :""
                        }
                    </div>
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
                        updateList={this.RmdSearch.bind(this)} //搜索方法
                        rowData={this.state.rowData}
                        isRight2ADetail={this.state.isRight2ADetail} //2a portal当右侧组件为case、file....时，isChange是否切换，changeNo需要切换的板块对应的label data-id
                        isRightCPDetail={this.state.isRightCPDetail} //cp portal当右侧组件为文件、还款列表....时，isChange是否切换，changeNo需要切换的板块对应的label data-id
                        A2LeftComponent={[ 'userMsg']}  //2A portal-左侧页面需要显示的组件配置
                        A2RightComponent={['case','packList','file','phoneMsg','operatorReportNew','messageList','callRecord','securityRcord','bankList']}  //2A portal-右侧页面需要显示的组件配置
                        CPLeftComponent={['userMsg']}  //cooperation portal-左侧页面需要显示的组件配置
                        CPRightComponent={['file','repaymentList','withholdList','InAcount']}  //cooperation portal-右侧页面需要显示的组件配置
                    />
                </div>
                
                {/* 结案弹窗 */}
                <div className="settle-pop hidden tanc">
                    <div className="tanc_bg"></div>
                    <div className="settle-cont clearfix" style={{"width":"350px"}}>
                        <select name="" id="caseSettle" className="select-gray mr10 caseSettle" style={{"width":"200px"}}>
                            <option value="" data-show='0' hidden>请选择结案结果</option>
                            {
                                (this.state.caseSettleEnum && this.state.caseSettleEnum.length>0)?this.state.caseSettleEnum.map((repy,i)=>{
                                    return <option key={i} data-value={commonJs.is_obj_exist(repy.value)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                }):<option value=""></option>
                            }
                        </select>
                        <a className="btn-deep-yellow left mr10 btn_yello_h30" id='sureSettle' onClick={this.sureSettle.bind(this)}>结案</a>
                        <i className="close right mt8 pointer" id='sureSettleClose' onClick={this.closetanc.bind(this)}></i>
                    </div>
                </div>
                {/* 改派弹窗 */}
                <div className="outcouce-pop hidden tanc">
                    <div className="tanc_bg"></div>
                    <div className="dispatch-box clearfix" style={{width:'525px'}}>
                        <select name="" id="couseCompany" className="select-gray mr10 couseCompany left" style={{"width":"200px"}}>
                            <option value="" data-show='0' hidden>请选择改派公司</option>
                            {
                                (companyLIst && companyLIst.length>0)?companyLIst.map((repy,i)=>{
                                    return <option key={i} data-companycode={commonJs.is_obj_exist(repy.companyCode)}>{commonJs.is_obj_exist(repy.companyName)}</option>
                                }):<option value="" ></option>
                            }
                        </select>
                        <div className="left mr10">
                            <DatePicker placeholder='请选择留案时间' format="YYYY-MM-DD" value={this.state.caseTime} onChange={this.caseTime} />
                        </div>
                        <a id='sureDispath' className="btn-deep-yellow left mr10 btn_yello_h30" onClick={this.sureDispath.bind(this)}>改派</a>
                        <i className="close right mt8 pointer" id='sureDispathClose' onClick={this.closetanc.bind(this)}></i>
                    </div>
                </div>
                {/* 新增回款&结算明细下载 */}
                <div>
                    <Modal
                        title="结算明细下载"
                        visible={this.state.backFundVisible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        footer={null}
                        >
                        <Form layout='vertical'>
                            <Form.Item label='公司：'>
                                {getFieldDecorator(`companies`, {
                                rules: [
                                    {
                                    required: true,
                                    message: '请选择',
                                    },
                                ],
                                })(<Select
                                        showSearch
                                        mode="multiple"
                                        allowClear
                                        style={{ width: 200 }}
                                        placeholder="请选择"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {
                                            companyLIst.map((repy,i)=>{
                                                return <Option value={repy.companyCode} key={i}>{repy.companyName}</Option>
                                            })
                                        }
                                    </Select>)}
                            </Form.Item>
                            <Form.Item label='时间：'>
                                {getFieldDecorator(`time`, {
                                rules: [
                                    {
                                    required: true,
                                    message: '请选择',
                                    },
                                ],
                                })(<RangePicker />)}
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" onClick={this.backFundDownLoand}>下载</Button>
                                <Button style={{ marginLeft: 10,marginRight: 10 }} onClick={this.resetBackFund}>重置</Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            </div>
        )
    }
};

export default OutsourceIndex;  //ES6语法，导出模块