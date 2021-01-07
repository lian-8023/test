import React from 'react';
import $ from 'jquery';
import { Pagination,DatePicker,Select,Modal} from 'antd';  
const Option = Select.Option;
import { Table, Column, HeaderCell, Cell ,TablePagination} from 'rsuite-table';   //table自定义调整列宽；
import LabelBody from '../common/labelBody';
// import ReactSelectize from "./react-selectize";
// var SimpleSelect = ReactSelectize.SimpleSelect;

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import ChangeLabel2A from '../../source/common/changeLabel2A';
let changeLabel2A=new ChangeLabel2A;
import ChangeLabelCP from '../../source/common/changeLabelCP';
let changeLabelCP=new ChangeLabelCP;
import AccountBar from '../A2-module/AccountBar'  // 横向的信息栏
 
import SortTimeJs from '../../source/common/sortTime';
var sortTimeJs=new SortTimeJs;
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import moment from 'moment';
@inject('allStore') @observer
class CollectionIndex extends React.Component{
    constructor(props){
        super(props);
        this.userInfoCP=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.topBindNumberStore=this.props.allStore.TopBindNumberStore;  //顶部绑定（完成）数显示-通用 2A portal
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息  
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2A PORTAL用户详情-UserMsg组件信息 
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            _oper_type:"search",//操作类型，search=搜索按钮、next=下一条 获取数据时的搜索类型
            rowData:{},//给labelBody.jsx组件的数据
            _labelBody_reload:"reload", //labelBody.jsx组件是否刷新
            params_rigPage:this.props.params.rigPage,  //右侧页面对应的路由值
            _location:"",//当前打开queue对应唯一标识
            oldConditions:{},  //重复的搜索条件，用于保存record后更新搜索列表
            clickNextNumber:1,
            updatedAtTimeS: null,
            updatedAtTimeE: null,
            updatedAtTimeeO: false,

            settleTimeS: null,
            settleTimeE: null,
            settleTimeO: false,
            loanstotalingVisible:false,
            dueDate:'',
            pageType:'2Fseach',//用来判断2F是否用授信号来查询详情,
            displayLength: 50,  //每页显示多少条
            r_page:1,   //当前页码
            current:1,
            totalSize:0
        }
    }
    @action UNSAFE_componentWillMount(){
        this.labelBoxStore.lef_page="";
        this.labelBoxStore.rig_page="";
    }
    componentDidMount(){
        window.addEventListener('touchmove', { passive: false });
        commonJs.reloadRules();
        this.getAdminMaps();
        this.topBindNumberStore.initCount("/RemColt/initial");
        // changeLabel2A.guideLinkToRigPage(this.state.params_rigPage,this);
        var h = document.documentElement.clientHeight;
        if(this.props._params_rigPage!="collection"){
            $("#content").height(h-40);
        }
        //点击搜索列表复选框
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
        });
    }

    //展开收起条件框
    showCondition(e){
        let $this=$(e.target);
        if($this.hasClass("cdtIcon")){
            $this=$this.parent();
        }
        let $parent=$this.closest(".conditionBox");
        let $cdtCont=$parent.find(".cdt-cont");
        let cdtIcon=$this.find(".cdtIcon");
        if(cdtIcon.hasClass("cdt-on")){
            cdtIcon.removeClass("cdt-on").addClass("cdt-off");
            $cdtCont.slideUp("normal");
        }else{
            cdtIcon.removeClass("cdt-off").addClass("cdt-on");
            $cdtCont.slideDown("normal");
        }
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
            $table.animate({"max-height":"76px"});
        }
    }
    loanstotaling=()=>{
        if($(".rsuite-table-body-row-wrapper").find(".myCheckbox-visited").length<=0){
            alert("请选择操作内容！");
            return;
        }
        if($(".rsuite-table-body-row-wrapper").find(".myCheckbox-visited").length>1){
            alert("只能选择一个");
            return;
        }
        this.setState({loanstotalingVisible:true});
    }
    //宣布合同提前到期确认
    handleOk=()=>{
        if(this.state.dueDate == ''){
            alert('请选择到期时间');
            return;
        }
        let _array= '';
        let collectionOverdueInfoDTOS=this.state.collectionOverdueInfoDTOS?this.state.collectionOverdueInfoDTOS:[];  //总的数据
        $(".rsuite-table-body-row-wrapper .rsuite-table-row").each(function(){
            if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                let n=$(this).index();
                let curr=collectionOverdueInfoDTOS[n]
                _array = curr.loanNumber;
            }
        })
        let obj = {dueDate:moment(this.state.dueDate).format('YYYY-MM-DD'),loanNumber:_array};
        let that=this;
        $.ajax({
            type:"post",
            url:"/node/collection/bringDueDateForward",
            async:false,
            dataType: "JSON",
            data:obj,
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                $(".cdt-result .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                alert(_getData.message);
                that.setState({loanstotalingVisible:'',dueDate:''})
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //催告函下载
    downloads = () =>{
        if($(".rsuite-table-body-row-wrapper").find(".myCheckbox-visited").length<=0){
            alert("请选择操作内容！");
            return;
        }
        let _array=[];
        let collectionOverdueInfoDTOS=this.state.collectionOverdueInfoDTOS?this.state.collectionOverdueInfoDTOS:[];  //总的数据
        $(".rsuite-table-body-row-wrapper .rsuite-table-row").each(function(){
            if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                let n=$(this).index();
                let curr=collectionOverdueInfoDTOS[n]
                _array.push(curr.nationalId)
            }
        })
        _array = _array.join(',');
        let that=this;
        $.ajax({
            type:"get",
            url:"/node/collection/download/file/notice",
            async:false,
            dataType: "JSON",
            data:{nationalIds:_array},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                alert(_getData.message);
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })

    }
    //分配到诉讼
    branchToLawsuit=()=>{
        if($(".rsuite-table-body-row-wrapper").find(".myCheckbox-visited").length<=0){
            alert("请选择操作内容！");
            return;
        }
        let _array=[];
        let collectionOverdueInfoDTOS=this.state.collectionOverdueInfoDTOS?this.state.collectionOverdueInfoDTOS:[];  //总的数据
        $(".rsuite-table-body-row-wrapper .rsuite-table-row").each(function(){
            if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                let n=$(this).index();
                let curr=collectionOverdueInfoDTOS[n]
                _array.push({
                    primaryPhone:curr.telPhone,
                    accountId:curr.accountId,
                    loanNumber:curr.loanNumber,
                    userName:curr.userName,
                    productNo:curr.productNo,
                    orderNo:curr.orderNo,
                    nationalId:curr.nationalId
                })
            }
        })
        let _that=this;
        $.ajax({
            type:"post",
            url:'/node/collection/assign/lawsuit',
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_array)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                $(".cdt-result .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                alert(_getData.message);
                _that.coltnSearch(false,false,false);
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //关闭弹窗
    closetanc(event){
        let $this=$(event.target);
        $this.closest(".tanc").addClass("hidden");
    }
    // 最近处理时间
    updatedAtTimeDisS(updatedAtTimeS){
        const updatedAtTimeE = this.state.updatedAtTimeE;
        if (!updatedAtTimeS || !updatedAtTimeE) {
            return false;
        }
        return updatedAtTimeS.valueOf() > updatedAtTimeE.valueOf()-1;
    }
    updatedAtTimeDisE(updatedAtTimeE){
        const updatedAtTimeS = this.state.updatedAtTimeS;
        if (!updatedAtTimeE || !updatedAtTimeS) {
            return false;
        }
        return updatedAtTimeE.valueOf() <= updatedAtTimeS.valueOf()-1;
    }
    onChange(field, value){
        this.setState({
            [field]: value,
        });
    }
    updatedAtTimeChangeS(value){
        this.onChange('updatedAtTimeS', value);
    }
    updatedAtTimeEchange(value){
        this.onChange('updatedAtTimeE', value);
    }
    updatedAtTimeHSO(open){
        if (!open) {
            this.setState({ updatedAtTimeO: true });
        }
    }
    handleupdatedAtTimeOChange(open){
        this.setState({ updatedAtTimeO: open });
    }
    //
    settleTimeSdis(settleTimeS){
        const settleTimeE = this.state.settleTimeE;
        if (!settleTimeS || !settleTimeE) {
            return false;
        }
        return settleTimeS.valueOf() > settleTimeE.valueOf()-1;
    }
    settleTimeEdis(settleTimeE){
        const settleTimeS = this.state.settleTimeS;
        if (!settleTimeE || !settleTimeS) {
            return false;
        }
        return settleTimeE.valueOf() <= settleTimeS.valueOf()-1;
    }
    settleTimeSchange(value){
        this.onChange('settleTimeS', value);
    }
    settleTimeEchange(value){
        this.onChange('settleTimeE', value);
    }
    settleTimeSOC(open){
        if (!open) {
            this.setState({ settleTimeO: true });
        }
    }
    settleTimeEOC(open){
        this.setState({ settleTimeO: open });
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
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
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
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //获取搜索条件
    getConditions(){
        let data={};
        let loanNumber=$(".top .loanNumber").val().replace(/\s/g,"");   //用户合同号
        let shopName=$(".top .shopName").val().replace(/\s/g,"");   //用户合同号
        let phone=$(".top .phoneNo").val().replace(/\s/g,"");   //手机号
        let userName=$(".top .name").val().replace(/\s/g,"");  //姓名
        let accountId=$(".top .acount").val().replace(/\s/g,"");   //用户账号
        let sourceChannel=$(".conditionBox .sourceQuotient option:selected").attr("value");  //来源渠道
        let processingState=$(".conditionBox .queueStatus option:selected").attr("value");   //任务状态ID
        let processingChildState=$(".conditionBox .processingChildState option:selected").attr("value");   //子状态ID
        let recentOperatorId=this.state.updatedBy_selected?this.state.updatedBy_selected:"";   //最近处理人
        let ownerId=this.state.bindBy_selected?this.state.bindBy_selected:"";   //任务所有者
        let updateStartTime=commonJs.dateToString(this.state.updatedAtTimeS);   //最近处理时间起
        let updateEndTime=commonJs.dateToString(this.state.updatedAtTimeE);   //最近处理时间止

        let settleStartime=commonJs.dateToString(this.state.settleTimeS);   //结案时间起
        let settleEndtime=commonJs.dateToString(this.state.settleTimeE);   //结案时间止

        let overdueDaysStart=$(".conditionBox .overdueDaysStart").val();   //逾期天数起始天数
        let overdueDaysEnd=$(".conditionBox .overdueDaysEnd").val();   //逾期天数结束天数

         
        let totalPrincipalStart=$(".conditionBox .totalPrincipalStart").val();   //逾 期 金 额起始天数
        let totalPrincipalEnd=$(".conditionBox .totalPrincipalEnd").val();   //逾 期 金 额结束天数
        let caseStatus=false;  //留案
        if($(".conditionBox .caseStatus").hasClass("myCheckbox-visited")){
            caseStatus=true;
        }
        data.caseStatus=caseStatus;
        let isValid=$(".conditionBox .isValid option:selected").attr('value');  //绑定
        if(isValid)data.isValid=isValid;
        let _productNo=$(".top .productNoEnums option:selected").attr("value");//合作方
        if(_productNo)data.productNo=_productNo;

        if(loanNumber) data.loanNumber=loanNumber;
        if(shopName) data.shopName=shopName;
        if(phone) data.phone=phone;
        if(userName) data.userName=userName;
        if(accountId) data.accountId=accountId;
        if(this.state.channelVal=="2A"&&sourceChannel.replace(/\s/g,"")){
            data.sourceChannel=sourceChannel;
        }
        if(recentOperatorId.replace(/\s/g,"")) data.recentOperatorId=recentOperatorId;
        if(ownerId.replace(/\s/g,"")) data.ownerId=ownerId;
        if(processingState.replace(/\s/g,"")) data.processingState=processingState;
        if(processingChildState.replace(/\s/g,"")) data.processingChildState=processingChildState;
        if(updateStartTime!="1970-1-1 8:0:0") data.updateStartTime=updateStartTime;
        if(updateEndTime!="1970-1-1 8:0:0") data.updateEndTime=updateEndTime;

        if(settleStartime!="1970-1-1 8:0:0") data.settleStartime=settleStartime;
        if(settleEndtime!="1970-1-1 8:0:0") data.settleEndtime=settleEndtime;
        
        if(overdueDaysStart.replace(/\s/g,"")) data.overdueDaysStart=overdueDaysStart;
        if(overdueDaysEnd.replace(/\s/g,"")) data.overdueDaysEnd=overdueDaysEnd;

        if(totalPrincipalStart.replace(/\s/g,"")) data.totalPrincipalStart=totalPrincipalStart;
        if(totalPrincipalEnd.replace(/\s/g,"")) data.totalPrincipalEnd=totalPrincipalEnd;

        data.pageSize=this.state.displayLength;
        data.pageNum=this.state.current;
        return data;
    }
    //
    /**
     * 搜索
     * @param {*} fromBtn 是否是点击搜索按钮
     * @param {*} useOldCondition 是否重复条件搜索，用于record保存后刷新搜索列表数据
     * @param {*} isUpdate 是否刷新labelBox组件
     */
    coltnSearch(fromBtn,useOldCondition,isUpdate){
        let _data={};
        if(!isUpdate){
            $(".cdt-result .rsuite-table-body-wheel-area .rsuite-table-row").removeClass("tr-on")
        }
        $(".cdt-result .rsuite-table-body-wheel-area .rsuite-table-row").removeClass("red-bg").removeClass("orange-bg");
        $(".cdt-result .myCheckbox").removeClass('myCheckbox-visited').addClass('myCheckbox-normal'); 
        if(fromBtn){
            $('.cdt-result .sort-icon').removeClass("sort-invert sort-order").addClass("sort-normal");
            this.setState({
                current:1
            })
        }
        if(useOldCondition){
            _data=this.state.oldConditions;
        }else{
            _data=this.getConditions();
            if(fromBtn){
                _data.pageNum=1;
            }
            this.setState({
                oldConditions:_data
            },()=>{
                if(!_data.productNo){
                    alert("请选择合作方！");
                    return;
                }
                this.userInfo2AStore.resetUserInfo2a();
                this.searchCommon(_data,fromBtn,isUpdate);
            })
        }
    }
    // 搜索公共方法
    searchCommon(conditons,fromBtn,isUpdate){
        let _that=this;
        if(!fromBtn&&this.state.isSort){
            conditons.needOrderField=this.state.sortKey
            conditons.orderType=this.state.dataSort
        }
        $.ajax({
            type:"get",
            url:"/RemColt/ColtSearch?time="+new Date().getTime(),
            async:false,
            dataType: "JSON",
            data:conditons,
            timeout : 30000, //超时时间设置，单位毫秒
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    _that.setState({
                        collectionOverdueInfoDTOS: [],
                        coltn_Q_ajax:{},
                        current:1,  //当前页码
                        _oper_type:"search",  //collection 获取上数据时的搜索类型
                        _labelBody_reload:"reload",
                        totalSize:0,
                        clickNextNumber:1,
                    });
                    $(".search-next,.labelBodyDiv,.loanNumberListBar").addClass("hidden");
                    return;
                }

                let _getData = res.data;
                let collectionOverdueInfoDTOS=_getData.collectionOverdueInfoDTOS ? _getData.collectionOverdueInfoDTOS: [];
                if(fromBtn){
                    // _that.loadFistList(collectionOverdueInfoDTOS);
                    $(".labelBodyDiv,.loanNumberListBar").addClass("hidden");  //点击搜索按钮,无数据时，隐藏下面labelBody页面
                    _that.setState({
                        isSort:false
                    })
                }else{
                    _that.topBindNumberStore.initCount("/RemColt/initial");
                }
                if(isUpdate){  //更新list数据
                    let _rowData=_that.labelBoxStore.rowData;
                    commonJs.changeLabelBoxFn(_that,_rowData,changeLabel2A,changeLabelCP,{isChange:true,changeNo:8},{isChange:true,changeNo:0});
                }
                _that.setState({
                    collectionOverdueInfoDTOS:collectionOverdueInfoDTOS,
                    coltn_Q_ajax:_getData,
                    current:_that.state.current,  //当前页码
                    _oper_type:"search",  //collection 获取上数据时的搜索类型
                    totalSize:_getData.totalSize,
                    clickNextNumber:1,
                },()=>{
                    _that.addTrColor(collectionOverdueInfoDTOS);
                })
                $(".search-next").removeClass("hidden");
                $(".paageNo .ant-pagination-item").removeClass("ant-pagination-item-active");
                $(".paageNo .ant-pagination-item-"+_that.state.current+"").addClass("ant-pagination-item-active");
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    trOnClick=(rowData)=>{
        let _that=this;
        $("body").append(loading_html);
        $.ajax({
            type:"post",
            url:'/RemColt/collectionNext',
            async:false,
            dataType: "JSON",
            timeout : 30000, //超时时间设置，单位毫秒
            data:{
                loanNumber:rowData.loanNumber,
                productNo:rowData.productNo,
                toBind:true
            },
            success:function(res) {
                $("#loading").remove();
                runInAction(() => {
                    if(!commonJs.ajaxGetCode(res)){
                        _that.setState({
                            coltn_Q_ajax:{},
                            rowData:{},  //存到state，给labelBody.jsx组件用
                            _oper_type:"next", //collection 获取上数据时的搜索类型
                            productNo:"", //合作方，3C.4A...
                            clickNextNumber:1,
                        },()=>{
                            _that.commonStore.collectionNextData={};
                            //刷新labelBox组件
                            commonJs.changeLabelBoxFn(_that,{},changeLabel2A,changeLabelCP,{isChange:true,changeNo:8},{isChange:true,changeNo:0},'Collection');
                        });
                        return;
                    }


                    $(".labelBodyDiv,.loanNumberListBar").removeClass("hidden");
                    let _getData = res.data;
                    if(_getData.status){
                        alert(_getData.statusMessage);
                    }
                    _that.setState({
                        coltn_Q_ajax:_getData,
                        rowData:rowData,  //存到state，给labelBody.jsx组件用
                        _oper_type:"next", //collection 获取上数据时的搜索类型
                        productNo:rowData.productNo, //合作方，3C.4A...
                        clickNextNumber:1,
                    },()=>{
                        _that.commonStore.collectionNextData=_getData;
                        //刷新labelBox组件
                        commonJs.changeLabelBoxFn(_that,rowData,changeLabel2A,changeLabelCP,{isChange:true,changeNo:8},{isChange:true,changeNo:0},{pageType:'Collection',nationalId:rowData.nationalId});
                    });
                })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        })
    }
    // 搜索下一条
    @action coltnSearchNext(toBind,isFromBtn,){  //仅点击下一条按钮和搜索列表的时候传true,刷新数据时不传
        let _that=this;
        let _resultList=this.state.collectionOverdueInfoDTOS;  //搜索结果列表数据
        let _clickNextNumber=this.state.clickNextNumber;  //点击次数
        $(".rsuite-table-body-row-wrapper .rsuite-table-row").removeClass("tr-on");
        $(".rsuite-table-body-row-wrapper .rsuite-table-row:eq("+(_clickNextNumber-1)+")").addClass("tr-on");
        if(_clickNextNumber>_resultList.length){
            alert("无数据！");
            this.setState({
                coltn_Q_ajax:{},
                rowData:{},  //存到state，给labelBody.jsx组件用
                _oper_type:"next", //collection 获取上数据时的搜索类型
                productNo:"", //合作方，3C.4A...
                clickNextNumber:0,  //请求失败已然往下走
            },()=>{
                this.commonStore.collectionNextData={};
                this.commonStore.loanNumberList_array=[];
                //刷新labelBox组件
                if(isFromBtn)commonJs.changeLabelBoxFn(this,{},this.props.params.rigPage,changeLabel2A,changeLabelCP,{isChange:true,changeNo:8},{isChange:true,changeNo:0});
            });
            return;
        }
        let _rowData=_resultList[_clickNextNumber-1];
        let loanNumberList_array=commonJs.is_obj_exist(_rowData.loanNumber).split(',');
        let _currentLoanNo=loanNumberList_array[0];  //用于搜索下一条的合同号

        let _productNo=_rowData.productNo;  //产品号
        let parems={
            loanNumber:_currentLoanNo,
            productNo:_productNo,
            toBind:toBind?toBind:""
        };

        $.ajax({
            type:"post",
            url:'/RemColt/collectionNext',
            async:false,
            dataType: "JSON",
            timeout : 30000, //超时时间设置，单位毫秒
            data:parems,
            success:function(res) {
                runInAction(() => {
                    let _getData = res.data;
                    $(".labelBodyDiv,.loanNumberListBar").removeClass("hidden");
                    if (!commonJs.ajaxGetCode(res)) {
                        _that.setState({
                            coltn_Q_ajax:{},
                            rowData:{},  //存到state，给labelBody.jsx组件用
                            _oper_type:"next", //collection 获取上数据时的搜索类型
                            productNo:"", //合作方，3C.4A...
                            clickNextNumber:_clickNextNumber+1,  //请求失败已然往下走
                        });
                        //刷新labelBox组件
                        if(isFromBtn)commonJs.changeLabelBoxFn(_that,{},changeLabel2A,changeLabelCP,{isChange:true,changeNo:8},{isChange:true,changeNo:0});
                        return;
                    }
                    if(_getData.status){
                        alert(_getData.statusMessage);
                    }
                    _rowData.loanNumber=_currentLoanNo;  //重置掉rowData原对象的合同号，供其他组件传合同号用。
                    _that.setState({
                        coltn_Q_ajax:_getData,
                        rowData:_rowData,  //存到state，给labelBody.jsx组件用
                        _oper_type:"next", //collection 获取上数据时的搜索类型
                        productNo:_productNo, //合作方，3C.4A...
                        clickNextNumber:_clickNextNumber+1,
                        loanNumberList_array:loanNumberList_array
                    },()=>{
                        _that.commonStore.collectionNextData=_getData;
                        _that.commonStore.loanNumberList_array=loanNumberList_array;
                        $('.loanNumberListBar a').removeClass('btn-blue').addClass('btn-white');
                        $(`.loanNumberListBar a:eq(0)`).removeClass('btn-white').addClass('btn-blue');
                        //刷新labelBox组件
                        if(isFromBtn)commonJs.changeLabelBoxFn(_that,_rowData,changeLabel2A,changeLabelCP,{isChange:true,changeNo:8},{isChange:true,changeNo:0});
                    });
                })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        })
    }
    //搜索下十条
    @action searchNextTen(){
        let _that=this;
        $.ajax({
            type:"post",
            url:"/RemColt/collection/bindByTen?time="+new Date().getTime(),
            async:true,
            dataType: "JSON",
            timeout : 30000, //超时时间设置，单位毫秒
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                let _getData = res.data;
                if (!commonJs.ajaxGetCode(res)) {
                    _that.setState({
                        collectionOverdueInfoDTOS: [],
                        coltn_Q_ajax:{},
                        current:1,  //当前页码
                        _oper_type:"search",  //collection 获取上数据时的搜索类型
                        _labelBody_reload:"reload",
                        totalSize:0
                    });
                    $(".search-next").addClass("hidden");
                    return;
                }
                $(".search-next").removeClass("hidden");
                let collectionOverdueInfoDTOS=_getData.collectionOverdueInfoDTOS ? _getData.collectionOverdueInfoDTOS: [];
                $(".labelBodyDiv,.loanNumberListBar").addClass("hidden");  //隐藏下面labelBody页面
                _that.topBindNumberStore.initCount("/RemColt/initial");
                _that.setState({
                    collectionOverdueInfoDTOS:collectionOverdueInfoDTOS,
                    coltn_Q_ajax:_getData,
                    current:_that.state.current,  //当前页码
                    _oper_type:"search",  //collection 获取上数据时的搜索类型
                    totalSize:_getData.totalSize
                },()=>{
                    _that.addTrColor(collectionOverdueInfoDTOS);
                })
                $(".paageNo .ant-pagination-item").removeClass("ant-pagination-item-active");
                $(".paageNo .ant-pagination-item-"+_that.state.current+"").addClass("ant-pagination-item-active");
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }

    //改派弹窗
    dispatchPop(event){
        let _array=[];
        let _loanNumberArray=[];
        let _acountIdArray=[];
        let $this=$(event.target);
        let theType=$this.attr("data-type");
        let collectionOverdueInfoDTOS=this.state.collectionOverdueInfoDTOS?this.state.collectionOverdueInfoDTOS:[];  //总的数据
        let pop="";
        if($this.text()=="改派"){
            pop=$(".dispatch-pop");
        }
        
        if($(".rsuite-table-body-row-wrapper").find(".myCheckbox-visited").length<=0){
            alert("请选择操作内容！");
            return;
        }
        $(".rsuite-table-body-row-wrapper .rsuite-table-row").each(function(){
            if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                let n=$(this).index();
                let n_loanNumber=collectionOverdueInfoDTOS[n].loanNumber;
                if(n_loanNumber){
                    n_loanNumber=n_loanNumber.split(',');
                }
                _loanNumberArray=_loanNumberArray.concat(n_loanNumber);
                _array.push(collectionOverdueInfoDTOS[n].id);
                _acountIdArray.push(collectionOverdueInfoDTOS[n].accountId);
            }
        })
        if(pop.hasClass("hidden")){
            pop.removeClass("hidden");
            this.setState({
                dispatchArray:_array,
                r_loanNumberArray:_loanNumberArray,
                r_acountIdArray:_acountIdArray
            })
        }else{
            pop.addClass("hidden");
        }
    }
    //委外
    outSource=()=>{
        let _that=this;
        let _loanNumberArray=[];
        let _acountIdArray=[];
        let collectionOverdueInfoDTOS=this.state.collectionOverdueInfoDTOS?this.state.collectionOverdueInfoDTOS:[];  //总的数据
        if($(".rsuite-table-body-row-wrapper").find(".myCheckbox-visited").length<=0){
            alert("请选择操作内容！");
            return;
        }
        $(".rsuite-table-body-row-wrapper .rsuite-table-row").each(function(){
            
            if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                let n=$(this).index();
                let n_loanNumber=collectionOverdueInfoDTOS[n].loanNumber;
                if(n_loanNumber){
                    n_loanNumber=n_loanNumber.split(',');
                }
                _loanNumberArray=_loanNumberArray.concat(n_loanNumber);
                _acountIdArray.push(collectionOverdueInfoDTOS[n].accountId);
            }
        })
        let _url="/RemColt/outSourcing";
        let _data={
            loanNumberList:_loanNumberArray,
            companyName:'TO_BE_ALLOCATED',
            accountId:_acountIdArray
        }
        $.ajax({
            type:"post",
            url:_url,
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    $(".dispatch-pop").addClass("hidden");
                    $(".outcouce-pop").addClass("hidden");
                    return;
                }
                let _getData = res.data;
                $(".cdt-result .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                alert(_getData.message);
                _that.coltnSearch(false,false,false);
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //改派
    sureDispath(event){
        let _that=this;
        let $this=$(event.target);
        let _code=$(".dispathToName").attr("data-selected");
        let _r_loanNumber=this.state.r_loanNumberArray;
        let _url="",_data={};
        if($this.closest(".tanc").hasClass("dispatch-pop")){
            _url="/RemColt/reassignment";
            _data={
                loanNumberList:_r_loanNumber,
                ownerId:_code
            }
            if(!_code){
                alert("请选择改派对象！");
                return;
            }
        }
        $.ajax({
            type:"post",
            url:_url,
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    $(".dispatch-pop").addClass("hidden");
                    $(".outcouce-pop").addClass("hidden");
                    return;
                }
                let _getData = res.data;
                $(".dispatch-pop").addClass("hidden");
                $(".outcouce-pop").addClass("hidden");
                $(".cdt-result .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                alert(_getData.message);
                _that.coltnSearch(false,false,false);
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //导出记录
    exportExcile(){
        let _data=this.getConditions();
        $.ajax({
            type:"get",
            url:"/RemColt/exportCollectionList",
            async:true,
            dataType: "JSON",
            data:_data,
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //根据承诺还款时间tr行颜色标识，当天-红色，当天以后到3天（包含第三天）以前-橙色
    addTrColor(data){
        let _color="";
        if(!data || data.length<=0){
            return _color;
        }
        let nowTime0=this.weeTime(new Date(),0);  //今天00:00毫秒数
        let nowTime24=this.weeTime(new Date(),24);  //今天24:00毫秒数
        let over3DayTime=this.weeTime(new Date(),96);  //未来3天24:00毫秒数

        for(let i=0;i<data.length;i++){
            let getTime=new Date(data[i].commitmentTime);  //承诺还款时间
            if(getTime>=nowTime0 && getTime<nowTime24){   
                _color="red-bg";
                $(".cdt-result .rsuite-table-body-wheel-area .rsuite-table-row").eq(i).addClass(_color);
            }else if(getTime>=nowTime24 && getTime<over3DayTime){  
                _color="orange-bg";
                $(".cdt-result .rsuite-table-body-wheel-area .rsuite-table-row").eq(i).addClass(_color);
            }else{
                $(".cdt-result .rsuite-table-body-wheel-area .rsuite-table-row").eq(i).removeClass(_color);
            }
        }
    }
    //设置0点时间
    weeTime(time,hours){
        time.setHours(hours);
        time.setMinutes(0);
        time.setSeconds(0);
        time.setMilliseconds(0);
        return new Date(time).getTime();
    }
    //切换页码的回调函数
    handleChangePage(page){
        $(".cdt-result .rsuite-table-body-wheel-area .rsuite-table-row").removeClass("orange-bg").removeClass("red-bg").removeClass("tr-on");
        $(".cdt-result .myCheckbox").removeClass('myCheckbox-visited').addClass('myCheckbox-normal');
        this.setState({
            current:page
        },()=>{
            this.coltnSearch(false,false,false);
        })
    }
    //切换显示条目数的回调函数 
    handleChangeLength(current, pageSize) {
        $(".cdt-result .rsuite-table-body-wheel-area .rsuite-table-row").removeClass("orange-bg").removeClass("red-bg").removeClass("tr-on");
        $(".cdt-result .myCheckbox").removeClass('myCheckbox-visited').addClass('myCheckbox-normal');
        this.setState({
            displayLength: pageSize,
            current:1
        },()=>{
            this.coltnSearch(false,false,false);
        })
        
    }
    // 排序
    sort(sortKey,event){
        let {collectionOverdueInfoDTOS}=this.state;
        if(!collectionOverdueInfoDTOS || collectionOverdueInfoDTOS.length<=0){
            alert('请先搜索出数据，再进行排序！');
            return;
        }
        let parems=Object.assign({},this.state.oldConditions);
        let $this=$(event.target);
        if($this.hasClass('nost')){
            $this=$this.parent();
        }
        let dataSort=$this.attr("data-sort");
        let _orderType='';
        if(dataSort=="asc"){   //升序
            $this.attr("data-sort","desc");
            $this.find(".sort-icon").removeClass("sort-normal sort-order").addClass("sort-invert");
            _orderType='asc';
        }else{
            $this.attr("data-sort","asc");
            $this.find(".sort-icon").removeClass("sort-normal sort-invert").addClass("sort-order");
            _orderType='desc';
        }
        parems.needOrderField=sortKey;
        parems.orderType=_orderType;
        parems.pageNum=1;
        this.setState({
            current:1,
            isSort:true,
            sortKey:sortKey,
            dataSort:_orderType
        },()=>{
            this.searchCommon(parems,false,false);
        })
    }
 
    
    //  详情--select框切换合同号
    changeDetLoanNo(){
        changeLabel2A.changeLeft2A(1,this);  //重新加载案列页面
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
    //点击合同号获取详情
    @action loanClick=(loanNo,index)=>{ 
        $('.loanNumberListBar a').removeClass('btn-blue').addClass('btn-white');
        $(`.loanNumberListBar a:eq(${index})`).removeClass('btn-white').addClass('btn-blue');
        $(".labelBodyDiv").removeClass("hidden");
        let _rowData=Object.assign({},this.state.rowData); 
        _rowData.loanNumber=loanNo;
        this.trOnClick(_rowData);
    }
    //点击搜索后默认加载第一条 （暂时未用到...）
    loadFistList=(listDTOS)=>{
        if(!listDTOS || listDTOS.length<=0){
            return;
        }
        let rowData=listDTOS[0];
        $(".cdt-result .rsuite-table-body-row-wrapper .rsuite-table-row").removeClass("tr-on");
        $(".rsuite-table-body-row-wrapper .rsuite-table-row:eq(0)").addClass("tr-on");
        $(".loanNumberListBar").removeClass("hidden");
        $('.loanNumberListBar a').removeClass('btn-blue').addClass('btn-white');
        $('.loanNumberListBar a:eq(0)').removeClass('btn-white').addClass('btn-blue');
        let loanNumberList_array=commonJs.is_obj_exist(rowData.loanNumber).split(',');
        this.setState({
            _oper_type:"search",  //collection 获取上数据时的搜索类型
            productNo:rowData.productNo, //合作方，3C.4A...
            rowData:rowData,
            loanNumberList_array:loanNumberList_array
        },()=>{
            this.loanClick(loanNumberList_array[0],0);
        })
    }
    render() {
        const { updatedAtTimeS, updatedAtTimeE, updatedAtTimeO ,loanNumberList_array=[]} = this.state;
        const { settleTimeS, settleTimeE, settleTimeO } = this.state;
        let adminNameMaps=this.state.adminNameMaps;
        let bindNumberData=this.topBindNumberStore.bindNumberData;
        let collectionHandleCount=bindNumberData.collectionHandleCount ? bindNumberData.collectionHandleCount : {};  //顶部绑定条数
        let collectionOverdueInfoDTOS=this.state.collectionOverdueInfoDTOS?this.state.collectionOverdueInfoDTOS:[]; //搜索结果列表--总条数
        let TableHeight=80;
        let dataLenght=collectionOverdueInfoDTOS.length;
        if(collectionOverdueInfoDTOS){
            if(dataLenght>0&&dataLenght<5){
                TableHeight=dataLenght*81;
            }else if(dataLenght>=5&&dataLenght<10){
                TableHeight=dataLenght*41;
            }else if(dataLenght>=10){
                TableHeight=360;
            }
        }
        let productNo=this.state.rowData.productNo;
        if(productNo=="2A"){
            $(".Csearch-right-page li").removeClass("on");
            $(".Csearch-right-page li:contains('Collection')").addClass("on");
            $(".CPS-edit-div,.OCR-edit-div,.LP-edit-div,.AP-edit-div,.FR-edit-div").addClass("hidden");
        }
        return (
            <div className="content" id="content">
                <div data-isresetdiv="yes" 
                    data-resetstate="updatedBy_selected,bindBy_selected,updatedAtTimeS,updatedAtTimeE,startValue,endValue,scheduledTimeS,scheduledTimeE,settleTimeS,settleTimeE"
                    data-resethiddenclass="outcouseCpy"
                    >
                    <div className="top">
                        <div className="clearfix">
                            <select name="" id="productNoEnums" className="select-gray productNoEnums mr15 mt10" style={{"width":"160px"}} onChange={this.channelChange.bind(this)}>
                                <option value="" hidden>合作方</option>
                                {
                                    (bindNumberData.productNoEnums&&bindNumberData.productNoEnums.length>0)?bindNumberData.productNoEnums.map((rpy,i)=>{
                                        return rpy?<option value={commonJs.is_obj_exist(rpy.value)} key={i}>{commonJs.is_obj_exist(rpy.displayName)+'-'+commonJs.is_obj_exist(rpy.value)}</option>:'';
                                    }):<option value="">全部</option>
                                }
                            </select>
                            <input type="text" name="" placeholder="手机号" className="input left mr15 mt10 phoneNo input_w" id='phoneNo' />
                            <input type="text" name="" placeholder="姓名" className="input left mr15 mt10 name input_w" id='name' />
                            <input type="text" name="" placeholder="账号" className="input left mr15 mt10 acount input_w" id='acount' />
                            <input type="text" name="" placeholder="合同号" className="input left mr15 mt10 loanNumber input_w" id='loanNumber' />
                            <input type="text" name="" placeholder="门店" className="input left mr15 mt10 shopName input_w" id='shopName' />
                            <div className="btnBox" style={{float: 'left'}} >
                                <button className="left mr15 mt10 btn-blue getCQ-btn" onClick={this.coltnSearch.bind(this,"fromBtn",false,false)} id='searchBtn'>搜索</button>
                                <button className="left mr15 mt10 btn-blue search-next hidden" onClick={this.coltnSearchNext.bind(this,true,true)} id='searchNext'>查询下一条</button>
                                {
                                    this.state.channelVal=="17C"?
                                    <button className="left mr15 mt10 btn-blue" onClick={this.searchNextTen.bind(this)} id='searchNextTen'>搜索下十条</button>:''
                                }
                                <button className="left mr15 mt10 btn-white" onClick={commonJs.resetCondition.bind(this,this)} id='reset'>重置</button>
                            </div>
                        </div>
                        <div className="clearfix mt10" style={{"height":"22px"}}>
                            <div className="topBundleCounts">
                                <b className="left mr20">所有未绑定<span className="deep-yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(collectionHandleCount.untreatedCount)}</span>条</b>
                                <b className="left mr20">我的绑定<span className="yellow-font mr10 ml10 arail">{commonJs.is_obj_exist(collectionHandleCount.ownorBindCount)}</span>条</b>
                                <b className="left mr20">今日须跟进<span className="light-blue-font mr10 ml10 arail">{commonJs.is_obj_exist(collectionHandleCount.followUpCount)}</span>条</b>
                                <b className="left mr20">今日共完成<span className="blue-font mr10 ml10 arail">{commonJs.is_obj_exist(collectionHandleCount.todayHandleCount)}</span>条</b>
                            </div>
                        </div>
                    </div>
                    {/*条件*/}
                    <div className="conditionBox clearfix">
                        <div className="cdt" onClick={this.showCondition.bind(this)}>
                            <i className="cdtIcon cdt-on"></i>
                        </div>
                        <div className="cdt-cont clearfix pb10">
                            <div className="left select-box"> 
                                <select name="" id="sourceQuotient" className="select-gray sourceQuotient left mt10" style={{"width":"100%"}}>
                                    <option value="" hidden>来源渠道</option>
                                    <option value="">全部</option>
                                    <option value="XYD">小雨点</option>
                                    <option value="int_beijiantou">北建投</option>
                                    <option value="other">其他</option>
                                </select>
                                <select name="" id="queueStatus" className="select-gray left mt5 queueStatus" style={{"width":"100%"}}>
                                    <option value="" hidden>任务状态</option>
                                    <option value="">全部</option>
                                    {
                                        (bindNumberData.queueStatus && bindNumberData.queueStatus.length>0)?
                                        bindNumberData.queueStatus.map((repy,i)=>{
                                            return <option value={commonJs.is_obj_exist(repy.value)} name={commonJs.is_obj_exist(repy.name)} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option value=""></option>
                                    }
                                </select>
                                <select name="" id="processingChildState" className="select-gray left mt5 processingChildState" style={{"width":"100%"}}>
                                    <option value="" hidden>子状态</option>
                                    <option value="">全部</option>
                                    {
                                        (bindNumberData.processStatusList && bindNumberData.processStatusList.length>0)?
                                        bindNumberData.processStatusList.map((repy,i)=>{
                                            return <option value={commonJs.is_obj_exist(repy.value)} name={commonJs.is_obj_exist(repy.name)} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option value=""></option>
                                    }
                                </select>
                            </div>
                            <div className="line left"></div>
                            <dl className="left lable-box mt10 mr10">
                                <dt>最近处理人<span></span></dt>
                                <dd className="relative">
                                    <div className="updatedBy" id='updatedBy'>
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        placeholder="请输入"
                                        allowClear
                                        optionFilterProp="children"
                                        onChange={this.updatedByChange.bind(this)}
                                        filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {
                                            (this.state.adminNameMaps && this.state.adminNameMaps.length>0) ? this.state.adminNameMaps.map((repy,i)=>{
                                                return <Option value = {repy.loginname} name={111} key={i}>{repy.name}</Option>
                                            }):<Option value = "">没有数据</Option>
                                        }
                                    </Select>
                                    </div>
                                </dd>
                                <dt>最近处理时间<span></span></dt>
                                <dd id='updatedAtTime'>
                                    <DatePicker
                                        disabledDate={this.updatedAtTimeDisS.bind(this)}
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={updatedAtTimeS}
                                        placeholder="Start"
                                        onChange={this.updatedAtTimeChangeS.bind(this)}
                                        onOpenChange={this.updatedAtTimeHSO.bind(this)}
                                    />
                                    <span> - </span>
                                    <DatePicker
                                        disabledDate={this.updatedAtTimeDisE.bind(this)}
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={updatedAtTimeE}
                                        placeholder="End"
                                        onChange={this.updatedAtTimeEchange.bind(this)}
                                        open={updatedAtTimeO}
                                        onOpenChange={this.handleupdatedAtTimeOChange.bind(this)}
                                    />
                                </dd>
                                <dt>结案时间<span></span></dt>
                                <dd id='settleTime'>
                                    <DatePicker
                                        disabledDate={this.settleTimeSdis.bind(this)}
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={settleTimeS}
                                        placeholder="Start"
                                        onChange={this.settleTimeSchange.bind(this)}
                                        onOpenChange={this.settleTimeSOC.bind(this)}
                                    />
                                    <span> - </span>
                                    <DatePicker
                                        disabledDate={this.settleTimeEdis.bind(this)}
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={settleTimeE}
                                        placeholder="End"
                                        onChange={this.settleTimeEchange.bind(this)}
                                        open={settleTimeO}
                                        onOpenChange={this.settleTimeEOC.bind(this)}
                                    />
                                </dd>
                            </dl>
                            <dl className="left lable-box lable-box2 mt10 cdt-outcouse">
                                <dt>任务所有者<span></span></dt>
                                <dd className="relative" style={{"width":"185px"}}>
                                    <div className="bindBy" id='bindBy'>
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        placeholder="请输入"
                                        allowClear
                                        optionFilterProp="children"
                                        onChange={this.bindByChange.bind(this)}
                                        filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {
                                            (this.state.adminNameMaps && this.state.adminNameMaps.length>0) ? this.state.adminNameMaps.map((repy,i)=>{
                                                return <Option value = {repy.loginname} name={111} key={i}>{repy.name}</Option>
                                            }):<Option value = "">没有数据</Option>
                                        }
                                    </Select>
                                    </div>
                                </dd>
                                <div className="clearfix"></div>
                                <dt>逾&nbsp;期&nbsp;天&nbsp;数<span></span></dt>
                                <dd>
                                    <input type="number" onKeyPress={commonJs.handleKeyPress.bind(this,['.'])} className="input half overdueDaysStart" id='overdueDaysStart' placeholder="start" />
                                    <span> - </span>
                                    <input type="number" onKeyPress={commonJs.handleKeyPress.bind(this,['.'])} className="input half overdueDaysEnd" id='overdueDaysEnd' placeholder="end" />
                                </dd>
                                <div className="clearfix"></div>
                                <dt>逾&nbsp;期&nbsp;金&nbsp;额<span></span></dt>
                                <dd>
                                    <input type="number" onKeyPress={commonJs.handleKeyPress.bind(this,['.'])} className="input half totalPrincipalStart" id='totalPrincipalStart' placeholder="start" />
                                    <span> - </span>
                                    <input type="number" onKeyPress={commonJs.handleKeyPress.bind(this,['.'])} className="input half totalPrincipalEnd" id='totalPrincipalEnd' placeholder="end" />
                                </dd>
                            </dl>  
                            <dl className="left lable-box lable-box2 mt10 cdt-outcouse">
                                <dt>是否绑定<span></span></dt>
                                <dd>
                                    <select name="" id="isValid" className="select-gray left isValid" style={{"width":"100%",'fontSize':'12px'}}>
                                        <option value="" hidden>请选择</option>
                                        <option value="">全部</option>
                                        <option value="0">是</option>
                                        <option value="1">否</option>
                                    </select>
                                </dd>

                                <div className="clearfix"></div>
                                <dt><b className="yellow-font">*留案*</b> <i className="myCheckbox myCheckbox-normal caseStatus" id='caseStatus' onClick={commonJs.myCheckbox.bind(this)}></i></dt>
                            </dl>
                        </div>
                    </div>
                    {/*条件 end*/}
                </div>

                <div className='mt20 clearfix bar pb5 pl10'>
                    <a  className="dispatch left mr5 btn-yellow mt5" data-type="dispath" id='dispath' data-btn-rule="COLLECTION:OUT" onClick={this.dispatchPop.bind(this)}>改派</a>
                    <a  className="dispatch left mr5 btn-yellow mt5" data-type="outsource" id='outsource' data-btn-rule="COLLECTION:REASSIGNMENT" onClick={this.outSource.bind(this)}>委外</a>
                    <a  className="dispatch left mr5 btn-yellow mt5" data-type="" id='branchToLawsuit' data-btn-rule="COLLECTION:ASSIGN:LAWSUIT" onClick={this.branchToLawsuit.bind(this)}>分配到诉讼</a>
                    <a  className="dispatch left mr5 btn-yellow mt5" data-type="" id='downloads' onClick={()=>{this.downloads()}}>催告函下载</a>
                    {this.state.channelVal == '2A'&&<a  className="dispatch left mr5 btn-yellow mt5" data-type="" id='loanstotaling' onClick={()=>{this.loanstotaling()}}>宣布贷款提前到期</a>}
                </div>
                <div className="cdt-result bar relative" id='cdtResult'>
                    <Table 
                        bordered 
                        locale={
                            {emptyMessage: '暂未查到相关数据...'}
                          }
                        height={TableHeight}
                        data={collectionOverdueInfoDTOS} 
                        onRowClick={(rowData)=>{
                            $(".cdt-result .rsuite-table-body-row-wrapper .rsuite-table-row").removeClass("tr-on");
                            $(".rsuite-table-body-row-wrapper .rsuite-table-row:eq("+collectionOverdueInfoDTOS.indexOf(rowData)+")").addClass("tr-on");
                            $(".loanNumberListBar").removeClass("hidden");
                            $('.loanNumberListBar a').removeClass('btn-blue').addClass('btn-white');
                            let loanNumberList_array=commonJs.is_obj_exist(rowData.loanNumber).split(',');
                            this.setState({
                                _oper_type:"search",  //collection 获取上数据时的搜索类型
                                productNo:rowData.productNo, //合作方，3C.4A...
                                rowData:rowData,
                                loanNumberList_array:loanNumberList_array
                            },()=>{
                                this.loanClick(loanNumberList_array[0],0);
                                this.commonStore.loanNumberList_array=loanNumberList_array;
                            })
                        }}
                    >
                        <Column width={37} resizable>
                            <HeaderCell>
                                <i className="myCheckbox myCheckbox-normal" id='selectAll' onClick={commonJs.selectAll.bind(this,".cdt-result")}></i>
                            </HeaderCell>
                            <Cell>
                                <i className="myCheckbox myCheckbox-normal"></i>
                            </Cell>
                        </Column>

                        <Column width={100} resizable>
                            <HeaderCell>身份证号</HeaderCell>
                            <Cell dataKey="nationalId" />
                        </Column>
                        <Column width={100} resizable>
                            <HeaderCell>产品号</HeaderCell>
                            <Cell dataKey="productNo" />
                        </Column>
                        <Column width={100} resizable>
                            <HeaderCell>姓名</HeaderCell>
                            <Cell dataKey="userName" />
                        </Column>
                        <Column width={100} resizable>
                            <HeaderCell>门店</HeaderCell>
                            <Cell dataKey="shopName" />
                        </Column>

                        <Column width={150} resizable>
                            <HeaderCell>
                                <div data-sort="asc" onClick={this.sort.bind(this,"last_principal")} id='lastPrincipal'>
                                    <span className="left mr5 nost">剩余应还本金</span>
                                    <i className="sort-icon sort-normal nost" style={{"marginTop":"5px"}}></i>
                                </div>
                            </HeaderCell>
                            <Cell dataKey="lastPrincipal" />
                        </Column>
                        <Column width={100} resizable>
                            <HeaderCell>逾期总金额</HeaderCell>
                            <Cell dataKey="overdueTotalAmount" />
                        </Column>
                        <Column width={100} resizable>
                            <HeaderCell>服务费</HeaderCell>
                            <Cell dataKey="serviceChargeNotPaid" />
                        </Column>
                        <Column width={150} resizable>
                            <HeaderCell>
                                <div data-sort="asc" onClick={this.sort.bind(this,"late_fee_not_paid")} id='lateFeeNotPaid'>
                                    <span className="left mr5 nost">剩余应还罚息</span>
                                    <i className="sort-icon sort-normal nost" style={{"marginTop":"5px"}}></i>
                                </div>
                            </HeaderCell>
                            <Cell dataKey="lateFeeNotPaid" />
                        </Column>
                        <Column width={150} resizable>
                            <HeaderCell>
                                {/* <div data-sort="invert" onClick={sortTimeJs.sortTime.bind(this,this.state.collectionOverdueInfoDTOS,"commitmentTime","collectionOverdueInfoDTOS",event,this)}> */}
                                <div data-sort="asc" onClick={this.sort.bind(this,"total_principal")} id='totalPrincipal'>
                                    <span className="left mr5 nost">逾期本金</span>
                                    <i className="sort-icon sort-normal nost" style={{"marginTop":"5px"}}></i>
                                </div>
                            </HeaderCell>
                            <Cell dataKey="totalPrincipal" />
                        </Column>
                        <Column width={150} resizable>
                            <HeaderCell>
                                {/* <div data-sort="invert" onClick={sortTimeJs.sortTime.bind(this,this.state.collectionOverdueInfoDTOS,"commitmentTime","collectionOverdueInfoDTOS",event,this)}> */}
                                <div data-sort="asc" onClick={this.sort.bind(this,"total_interest")} id='totalInterest'>
                                    <span className="left mr5 nost">逾期利息</span>
                                    <i className="sort-icon sort-normal nost" style={{"marginTop":"5px"}}></i>
                                </div>
                            </HeaderCell>
                            <Cell dataKey="totalInterest" />
                        </Column>
                        <Column width={150} resizable>
                            <HeaderCell>
                                <div data-sort="asc" onClick={this.sort.bind(this,"remaining_interest")} id='remainingInterest'>
                                    <span className="left mr5 nost">剩余应还利息</span>
                                    <i className="sort-icon sort-normal nost" style={{"marginTop":"5px"}}></i>
                                </div>
                            </HeaderCell>
                            <Cell dataKey="remainingInterest" />
                        </Column>
                        <Column width={150} resizable>
                            <HeaderCell>
                                {/* <div data-sort="invert" onClick={sortTimeJs.sortTime.bind(this,this.state.collectionOverdueInfoDTOS,"commitmentTime","collectionOverdueInfoDTOS",event,this)}> */}
                                <div data-sort="asc" onClick={this.sort.bind(this,"overdue_days")} id='overdueDays'>
                                    <span className="left mr5 nost">逾期天数</span>
                                    <i className="sort-icon sort-normal nost" style={{"marginTop":"5px"}}></i>
                                </div>
                            </HeaderCell>
                            <Cell dataKey="overdueDays" />
                        </Column>
                        <Column width={200} resizable sortable>
                            <HeaderCell>
                                {/* <div data-sort="invert" onClick={sortTimeJs.sortTime.bind(this,this.state.collectionOverdueInfoDTOS,"updatedTime","collectionOverdueInfoDTOS",event,this)}> */}
                                <div data-sort="asc" onClick={this.sort.bind(this,"latest_processing_time")} id='updatedTime'>
                                    <span className="left mr5 nost">最近处理时间</span>
                                    <i className="sort-icon sort-normal nost" style={{"marginTop":"5px"}}></i>
                                </div>
                            </HeaderCell>
                            <Cell dataKey="updatedTime" />
                        </Column>

                        <Column width={200} resizable>
                            <HeaderCell>最近处理人</HeaderCell>
                            <Cell dataKey="recentOperatorId" />
                        </Column>

                        <Column width={200} resizable>
                            <HeaderCell>任务所有者</HeaderCell>
                            <Cell dataKey="ownerId" />
                        </Column>

                    </Table>
                    {
                        (collectionOverdueInfoDTOS && collectionOverdueInfoDTOS.length>0) ?
                        <div className="pl20 left pt5 pb5" id='pageAtion'>
                            <Pagination
                                showQuickJumper
                                showSizeChanger
                                onShowSizeChange={this.handleChangeLength.bind(this)}
                                defaultPageSize={this.state.displayLength}
                                defaultCurrent={this.state.r_page}
                                current={this.state.current}
                                total={this.state.totalSize}
                                onChange={this.handleChangePage.bind(this)}
                                pageSizeOptions={['50','100','200','500','1000']}
                            />
                        </div>    
                        :""
                    }  
                    <span className="pl10 left mt2 mt7">共 {this.state.totalSize} 条数据</span>
                    <div className="cdt-th th-bg clearfix pl20 pt5 pb5 pr20">
                        {
                            (collectionOverdueInfoDTOS && collectionOverdueInfoDTOS.length>0) ? <a href={"/RemColt/exportCollectionList?1=1"+(this.getConditions()?commonJs.toHrefParams(this.getConditions()):"")} className="downRecord right mt2" id='downRecord' data-btn-rule="COLLECTION:TOP" target="_blank"> 导出记录</a> :""
                        }
                    </div>
                    <div className="cdt cdt2" onClick={this.showSearchList.bind(this)} id='toggleList'><i className="cdtIcon cdt-on"></i></div>
                </div>
                {/* 搜索条件下面的信息栏 */}
                {/* {
                    this.state.rowData.productNo=="2A"?
                    <AccountBar loanNumberChange={this.changeDetLoanNo.bind(this)} />
                    :""
                } */}
                <div className="bar mt10 pl20 pr20 pb10 loanNumberListBar hidden">
                    {
                        loanNumberList_array.map((repy,i)=>{
                            return <a key={i} className="left mt10 mr10 btn-white" style={{width:'24%'}} onClick={this.loanClick.bind(this,repy,i)}>{repy}</a>
                        })
                    }
                </div>

                <div className="mt20 clearfix labelBodyDiv hidden">
                    <LabelBody 
                        rigPage={this.props.params.rigPage} 
                        _oper_type={this.state._oper_type}
                        _labelBody_reload={this.state._labelBody_reload}
                        updateList={this.coltnSearch.bind(this)}   //搜索方法
                        rowData={this.state.rowData}
                        A2LeftComponent={[
                                'userMsg','case','packList','file','phoneMsg','operatorReportNew','messageList','callRecord','securityRcord','bankList'
                        ]}  //2A portal-左侧页面需要显示的组件配置
                        A2RightComponent={['cpySearch','voe','vor','lp','fraud','approve','reminder','collection']}  //2A portal-右侧页面需要显示的组件配置
                        CPLeftComponent={['userMsg','file','repaymentList','withholdList']}  //cooperation portal-左侧页面需要显示的组件配置
                        CPRightComponent={['collection']}  //cooperation portal-右侧页面需要显示的组件配置
                    />
                </div>
                {/*改派弹窗*/}
                <div className="dispatch-pop hidden tanc">
                    <div className="tanc_bg"></div>
                    <div className="dispatch-box clearfix">
                        <div className="left search-box clearfix mr10 dispathToName" id='dispathToName'>
                            {/* <SimpleSelect
                                placeholder = "请输入"
                                onValueChange = {function(obj){
                                    if(obj && typeof(obj)!="undefined"){
                                        $(".dispathToName").attr("data-selected",obj.value);
                                    }
                                }}
                            >
                            {
                                (adminNameMaps && adminNameMaps.length>0) ? adminNameMaps.map((repy,i)=>{
                                    return <option value = {repy.code} key={i}>{repy.name}</option>
                                }):<option value = "">没有数据</option>
                            }
                            </SimpleSelect> */}
                        </div>
                        <a className="btn-deep-yellow left mr10 btn_yello_h30" id='sureDispath' onClick={this.sureDispath.bind(this)}>改派</a>
                        <i className="close right mt8 pointer" onClick={this.closetanc.bind(this)} id='sureDispathClose'></i>
                    </div>
                </div>
                {/*委外*/}
                <div className="outcouce-pop hidden tanc">
                    <div className="tanc_bg"></div>
                    <div className="dispatch-box clearfix">
                        <select name="" id="couseCompany" className="select-gray mr10 couseCompany" style={{"width":"200px"}}>
                            <option value="" hidden>请选择委外公司</option>
                            {
                                (bindNumberData.outsourcingCompanyList && bindNumberData.outsourcingCompanyList.length>0)?bindNumberData.outsourcingCompanyList.map((repy,i)=>{
                                    return <option key={i} data-companycode={commonJs.is_obj_exist(repy.companyCode)}>{commonJs.is_obj_exist(repy.companyName)}</option>
                                }):<option value="" ></option>
                            }
                        </select>
                        <a className="btn-deep-yellow left mr10 btn_yello_h30" id='sureDispath' onClick={this.sureDispath.bind(this)}>委外</a>
                        <i className="close right mt8 pointer" onClick={this.closetanc.bind(this)} id='sureDispathClose'></i>
                    </div>
                </div>
                <Modal
                    title="宣布贷款提前到期"
                    visible={this.state.loanstotalingVisible}
                    onOk={this.handleOk}
                    onCancel={()=>{this.setState({loanstotalingVisible:false})}}
                    >
                    到期时间：<DatePicker value={this.state.dueDate} onChange={(e)=>{
                        this.setState({
                            dueDate:e
                        })
                    }} />
                </Modal>
            </div>
        )
    }
};

export default CollectionIndex;  //ES6语法，导出模块