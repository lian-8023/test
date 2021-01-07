// 诉讼页面
import React from 'react';
import $ from 'jquery';
import moment from 'moment';
import { Pagination,DatePicker ,Modal ,Table,Input,Row, Col } from 'antd';  //页码
import FileUpload from 'react-fileupload';
// 页面
import CommonJs from '../../source/common/common';
let commonJs=new CommonJs;
import ChangeLabel2A from '../../source/common/changeLabel2A';
let changeLabel2A=new ChangeLabel2A;
import ChangeLabelCP from '../../source/common/changeLabelCP';
let changeLabelCP=new ChangeLabelCP;
import AccountBar from '../A2-module/AccountBar'  // 横向的信息栏
import SortTimeJs from '../../source/common/sortTime';
let sortTimeJs=new SortTimeJs;
import LabelBody from '../common/labelBody';
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
@inject('allStore') @observer
class Lawsuit extends React.Component{
    constructor(props){
        super(props);
        this.userInfoCP=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.topBindNumberStore=this.props.allStore.TopBindNumberStore;  //顶部绑定（完成）数显示-通用 2A portal
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息  
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2A PORTAL用户详情-UserMsg组件信息 
        this.state={
            pageType:'2Fseach',//用来判断2F是否用授信号来查询详情,
            _oper_type:"search",//操作类型，search=搜索按钮、next=下一条、bar导航
            params_rigPage:this.props.params.rigPage,  //右侧页面对应的路由值
            rowData:{},//给labelBody.jsx组件的数据
            _labelBody_reload:"reload", //labelBody.jsx组件是否刷新
            barsNum:10,  //每页显示多少条
            current:1,  //当前页码
            outsourceTimeS: null,  //提交诉讼日期
            settleTimeS: null, //诉状生成日期
            settleTimeE: null,
            settleTimeO: false,
            externalInfoDTOList:[],
            conditions:{},
            visible:false,
            materialTypes:[],
            exportCodeList:[],
            LawsuitVisible:false,
            Lawsuit:{
                extractNumber:'',
                overdueDayMax:'',
                poolEnterTimeBegin:'',
                poolEnterTimeEnd:'',
                productNo:'',
                totalPastDuePrincipalStart:'',
                totalPastDuePrincipalEnd:'',
            }
        }
    }
    @action UNSAFE_componentWillMount(){
        this.labelBoxStore.lef_page="";
        this.labelBoxStore.rig_page="";
        this.topBindNumberStore.initCount("/RemColt/initial");
    }
    @action componentDidMount(){
        let that=this;
        commonJs.reloadRules();
        this.init();

        let h = document.documentElement.clientHeight;
        if(this.props._params_rigPage!="outsource"){
            $("#content").height(h-40);
        }
        // 列表单选事件
        $(".cdt-list").on('click','.myCheckbox',function(event){
            let self=$(event.target);
            let _state=self.hasClass("myCheckbox-normal");
            let trLength=$(".cdt-result .cdt-list tr").length;
            let checkBoxLength=$(".cdt-result .cdt-list .myCheckbox-visited").length;
            $(".cdt-result .cdt-th .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            if(_state){
                self.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
                if(checkBoxLength==trLength-1){$(".cdt-result .cdt-th .selectedCurrentList").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");}
            }else {
                self.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                if(checkBoxLength<trLength){$(".cdt-result .cdt-th .selectedCurrentList").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");}
            }
            event.stopPropagation();
        })
        //修改state
        $(".cdt-list").on('click','tr',function(){
            $(".cdt-list tr").removeClass("tr-on");
            $(this).addClass("tr-on");
            let n=$(this).index();
            let _rowData=that.state.externalInfoDTOList[n];
            that.setState({
                _labelBody_reload:"reload",
                productNo:_rowData.productNo, //合作方，3C.4A...
                rowData:_rowData,
                isRight2ADetail:{isChange:true,changeNo:9},  //当右侧组件为case、file....时，isChange是否切换，changeNo需要切换的板块对应的label data-id
                isRightCPDetail:{isChange:true,changeNo:1}
            },()=>{
                //刷新labelBox组件
                commonJs.changeLabelBoxFn(that,_rowData,changeLabel2A,changeLabelCP,{isChange:true,changeNo:9},{isChange:true,changeNo:1},{pageType:'Collection',nationalId:_rowData.nationalId});
                $(".labelBodyDiv").removeClass("hidden");
            })
        })
    }
    
    init(){
        let that=this;
        $.ajax({
            type:"get",
            url:"/node/lawsuit/getLawsuitInitEnum",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                that.setState({
                    lawsuitStatusEnums:_getData.lawsuitStatusEnums?_getData.lawsuitStatusEnums:[],  //诉讼状态枚举值    
                    lawsuitCaseEnums:_getData.lawsuitCaseEnums?_getData.lawsuitCaseEnums:[],  //诉讼结案子枚举值 
                    productNoEnums:_getData.productNoEnums, //合作方列表
                    materialTypes:_getData.materialTypes
                })
            }
        })
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
    onShowSizeChange(current, pageSize) {
        this.setState({
            current:1
        },()=>{
            this.setState({
                barsNum:pageSize
            },()=>{
                //判断是否全选，如果全选被勾上则选中列表
                if($(".cdt-result .cdt-th .slectedAllList").hasClass("myCheckbox-visited")){
                    $(".cdt-result .cdt-list .myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
                }else{
                    $(".cdt-result .cdt-list .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                }
            })
        })
    }
    //快速跳转到某一页。
    gotoPageNum(pageNumber) {
        this.setState({
            current:pageNumber
        },()=>{
            //判断是否全选，如果全选被勾上则选中列表
            if($(".cdt-result .cdt-th .slectedAllList").hasClass("myCheckbox-visited")){
                $(".cdt-result .cdt-list .myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            }else{
                $(".cdt-result .cdt-list .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            }
        })
    }
    //获取搜索条件
    getConditions(){
        let data={};
        let loanNumber=$(".top .loanNumber").val().replace(/\s/g,"");   //用户合同号
        let phone=$(".top .phoneNo").val().replace(/\s/g,"");   //手机号
        let userName=$(".top .name").val().replace(/\s/g,"");  //姓名
        let accountId=$(".top .acount").val().replace(/\s/g,"");   //用户账号
        let lawsuitStatus=$(".top .lawsuitStatus option:selected").attr("data-value");  //诉讼状态
        let caseStatus=$(".top .caseStatus option:selected").attr("data-value");  //结案子状态
        let submitLawsuitStartTime=commonJs.dateToString2(this.state.outsourceTimeS);   //提交诉讼日期起
        let createLawsuitStartTime=commonJs.dateToString2(this.state.settleTimeS);   //诉状生成日期起
        let createLawsuitEndTime=commonJs.dateToString2(this.state.settleTimeE);   //诉状生成日期止
        let createLawsuit=$(".top .createLawsuit option:selected").attr("data-value");  //诉讼生成状态
        let isDownLoaded=$(".top .isDownLoaded option:selected").attr("data-value");  //是否已经下载
        let _productNo=$(".top .productNoEnums option:selected").attr("value");//合作方
        if(_productNo)data.productNo=_productNo;
        if(isDownLoaded) data.isDownLoaded=isDownLoaded;

        if(loanNumber) data.loanNumber=loanNumber;
        if(phone) data.primaryPhone=phone;
        if(userName) data.userName=userName;
        if(accountId) data.accountId=accountId;
        if(lawsuitStatus) data.lawsuitStatus=lawsuitStatus;
        if(caseStatus) data.caseStatus=caseStatus;
        if(submitLawsuitStartTime!="1970-01-01" && submitLawsuitStartTime!='NaN-aN-aN') data.submitLawsuitStartTime=submitLawsuitStartTime;
        if(createLawsuitStartTime!="1970-01-01" && createLawsuitStartTime!='NaN-aN-aN') data.createLawsuitStartTime=createLawsuitStartTime;
        if(createLawsuitEndTime!="1970-01-01" && createLawsuitEndTime!='NaN-aN-aN') data.createLawsuitEndTime=createLawsuitEndTime;
        if(createLawsuit){
            if(createLawsuit==1){
                data.createLawsuit=1;
            }else if(createLawsuit==2){
                data.createLawsuit=0;
            }
        }
        return data;
    }
    //搜索
    RmdSearch(fromBtn,refreshCase){
        $(".cdt-result .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        let _that=this;
        let _data={};
        if(fromBtn){
            _data=this.getConditions();
        }else{
            _data=this.state.conditions;
        }
        let _productNo=$(".top .productNoEnums option:selected").attr("value");//合作方
        if(!_productNo){
            alert("请选择合作方！");
            return;
        }else{
            _data.productNo=_productNo;
        }
        $(".labelBodyDiv").addClass("hidden");
        $(".pt-table tr").removeClass("tr-on");
        $.ajax({
            type:"post",
            url:"/node/lawsuit/getLawsuitList?time="+new Date().getTime(),
            async:true,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    _that.setState({
                        externalInfoDTOList:[],
                        current:1,  //当前页码
                    })
                    $(".editBtnList").addClass("hidden");
                    return;
                }
                $(".editBtnList").removeClass("hidden");
                let _getData = res.data;
                if(!_getData){
                    _that.setState({
                        externalInfoDTOList: [],
                        current:1,  //当前页码
                    });
                    return;
                }
                if(fromBtn){
                    _that.setState({
                        conditions:_data,
                        materialTypes:_getData.materialTypes,
                        externalInfoDTOList:_getData.lawsuitInfoList ? _getData.lawsuitInfoList : [],
                        current:1,  //当前页码
                    });
                    $(".labelBodyDiv").addClass("hidden");
                }else{
                    _that.setState({
                        externalInfoDTOList:_getData.lawsuitInfoList ? _getData.lawsuitInfoList : [],
                    })
                }
                if(_getData.lawsuitInfoList && _getData.lawsuitInfoList.length<7){
                    $(".cdt-list").css("padding-right","18px");
                }else{
                    $(".cdt-list").css("padding-right","0");
                }
                // if(refreshCase){
                //     changeLabel2A.changeRight2A(0,"",_that);
                // }
            }
        })
    }
    //关闭弹窗
    closetanc(event){
        let $this=$(event.target);
        $this.closest(".tanc").addClass("hidden");
    }

    //提交诉讼日期
    onChange(field, value){
        this.setState({
            [field]: value,
        });
    }
    
    outsourceTimeSchange(value){
        this.onChange('outsourceTimeS', value);
    }
    outsourceTimeEchange(value){
        this.onChange('outsourceTimeE', value);
    }
    //弹窗诉状日期
    editLawsuitTchange(value, dateString){
        this.onChange('plaintTime', value);
    }
    //时间
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
    // 详情--select框切换合同号
    changeDetLoanNo(NO){
        let n=$(".Csearch-left-page .on").attr("data-id");
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
    //弹窗
    showSettlePop(event){
        if($(".cdt-result .cdt-list .myCheckbox-visited").length<=0){
            alert("请选择要操作的数据！");
            return;
        }
        let $this=$(event.target);
        let thisType=$this.attr("data-type");
        //清空
        $(".settle-pop .editLawsuitT,.settle-pop .caseSettle").addClass("hidden");
        $(".settle-pop .caseSettle option").removeProp("slected");
        $(".settle-pop .caseSettle option[id='0']").prop("selected","selected");
        $(".settle-pop .editLawsuitTextarea").val("");
        this.setState({
            plaintTime:null,   //还原诉状日期
            editResult:""   //弹窗编辑类型
        })
        if(thisType=="editIndictmentDate"){
            $(".editLawsuitT").removeClass("hidden");  //显示日期插件
            this.setState({
                editResult:"editIndictmentDate"
            })
        }else if(thisType=="editLawsuitState"){
            $(".lawsuitStatusEnumsDiv").removeClass("hidden");  //显示select
            this.setState({
                editResult:"editLawsuitState"
            })
        }else if(thisType=="editSettleState"){
            $(".lawsuitCaseEnumsDiv").removeClass("hidden");  //显示select
            this.setState({
                editResult:"editSettleState"
            })
        }
        $(".settle-pop").removeClass("hidden");
    }
    //转入cellection
    lawsuit2Collection=()=>{
        let that=this;
        if($(".cdt-result .cdt-list .myCheckbox-visited").length<=0){
            alert("请选择要操作的数据！");
            return;
        }
        let _parems=[];
        if($(".cdt-result .slectedAllList").hasClass("myCheckbox-normal")&& $(".cdt-result .cdt-list .myCheckbox-visited").length>0){  //当页全选
            $(".cdt-result .cdt-list tr").each(function(){
                if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                    let _loanNumber=$(this).find(".r_loanNumber").text();
                    _parems.push(_loanNumber);
                }
            })
        }else if($(".cdt-result .slectedAllList").hasClass("myCheckbox-visited")){ //全选
            let externalInfoDTOList=this.state.externalInfoDTOList
            for(let i=0;i<externalInfoDTOList.length;i++){
                let _loanNumber=externalInfoDTOList[i].loanNumber;
                _parems.push(_loanNumber)
            }
        }
        $.ajax({
            type:"post",
            url:'/node/lawsuit/assign/lawsuit2Collection',
            async:true,
            dataType: "JSON",
            timeout : 60000, //超时时间设置，单位毫秒
            data:{josnParam:JSON.stringify(_parems)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);       
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                };
                let _getData = res.data;
                alert(_getData.message);
                that.RmdSearch(false);
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
    //导出客户合同&还款明细
    showExportContract = ()=>{
        if($(".cdt-result .cdt-list .myCheckbox-visited").length<=0){
            alert("请选择要操作的数据！");
            return;
        }
        this.setState({
            visible:true,
        })
    }
    loadPackDetail(_url,type){
        let that = this;
        if($(".cdt-result .cdt-list .myCheckbox-visited").length<=0){
            alert("请选择要操作的数据！");
            return;
        }
        let _parems=[];
        if($(".cdt-result .slectedAllList").hasClass("myCheckbox-normal")&& $(".cdt-result .cdt-list .myCheckbox-visited").length>0){  //当页全选
            $(".cdt-result .cdt-list tr").each(function(){
                if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                    let _accountId=$(this).find(".r_accountId").text();
                    let _userName=$(this).find(".r_name").text();
                    let _loanNumber=$(this).find(".r_loanNumber").text();
                    let _createLawsuitTime=$(this).find(".r_createLawsuitTime").text();
                    _parems.push({
                        accountId:(_accountId!="-")?parseInt(_accountId):"",
                        userName:(_userName!="-")?_userName:"",
                        loanNumber:(_loanNumber!="-")?_loanNumber:"",
                        createLawsuitTime:(_createLawsuitTime!="-")?_createLawsuitTime:""
                    });
                }
            })
        }else if($(".cdt-result .slectedAllList").hasClass("myCheckbox-visited")){ //全选
            _parems=this.state.externalInfoDTOList
        }
        let saveData = {
            dataList:_parems,
        }
        if(type == 'ExportContract'){
            if(this.state.exportCodeList.length== 0){
                alert("请选择导出文件类型");
                return
            }
            saveData.materialTypes = this.state.exportCodeList;
        }
        $.ajax({
            type:"post",
            url:_url,
            async:true,
            dataType: "JSON",
            timeout : 60000, //超时时间设置，单位毫秒
            data:{josnParam:JSON.stringify(saveData)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);       
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                alert("文件生成中，请稍后到诉讼文件夹中下载！");
                if(type == 'ExportContract'){
                    that.setState({
                        visible:false,
                    })
                }
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
    //弹窗确定按钮
    sureEdit(){
        let editType=this.state.editResult;
        let _parems={};  //请求参数
        let _url="";  //请求地址
        let _loanNumbers=[];
        let _accountIds=[];
        let _productNos=[];
        let details=$(".lawsuit-settle .editLawsuitTextarea").val();  //详情
        if(details){
            _parems.details=details;  
        }
        let externalInfoDTOList=this.state.externalInfoDTOList;  //总数据
        if($(".cdt-result .slectedAllList").hasClass("myCheckbox-normal") && $(".cdt-result .cdt-list .myCheckbox-visited").length>0){  //当页全选
            $(".cdt-result .cdt-list tr").each(function(){
                if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                    let _loanNumber=$(this).find(".r_loanNumber").attr("data-loanNumber");
                    let _accountId=$(this).find(".r_accountId").attr("data-accountId");
                    let _productNo=$(this).find(".r_productNo").text();
                    if(_loanNumber!="-"){
                        _loanNumbers.push(_loanNumber);
                    }
                    if(_accountId!="-"){
                        _accountIds.push(_accountId);
                    }
                    if(_productNos!="-"){
                        _productNos.push(_productNo);
                    }
                }
            })
        }else if($(".cdt-result .slectedAllList").hasClass("myCheckbox-visited")){ //全选
            for(let i=0;i<externalInfoDTOList.length;i++){
                let _loanNumber=externalInfoDTOList[i].loanNumber;
                let _accountId=externalInfoDTOList[i].accountId;
                let _productNo=externalInfoDTOList[i].productNo;
                if(_loanNumber){
                    _loanNumbers.push(_loanNumber);
                }
                if(_accountId){
                    _accountIds.push(_accountId);
                }
                if(_productNo){
                    _productNos.push(_productNo);
                }
            }
        }
        _parems.accountIds=_accountIds;
        _parems.loanNumbers=_loanNumbers;
        _parems.productNo=externalInfoDTOList[0]?externalInfoDTOList[0].productNo:"";
        if(editType=="editIndictmentDate"){  //生成诉状日期
            _url="/node/lawsuit/batchUpdateSubmitLawsuitTime"; 
            let _editLawsuitT=commonJs.dateToString(this.state.plaintTime);
            if(!_editLawsuitT || _editLawsuitT=="1970-1-1 8:0:0"){
                alert("请选择诉状日期！")
                return;
            }
            _parems.createLawsuitTime=_editLawsuitT;   //诉状日期
        }else if(editType=="editLawsuitState"){  //编辑诉讼状态
            _url="/node/lawsuit/batchUpdateLawsuitStatus";
            let lawsuitStatus=$(".lawsuitStatusEnumsDiv option:selected").attr("data-value");
            if(!lawsuitStatus){
                alert("请选择诉讼状态！")
                return;
            }
            _parems.lawsuitStatus=lawsuitStatus;
        }else if(editType=="editSettleState"){  //编辑结案状态
            _url="/node/lawsuit/batchUpdateCaseStatus";
            let caseStatus=$(".lawsuitCaseEnumsDiv option:selected").attr("data-value");
            if(!caseStatus){
                alert("请选择结案状态！")
                return;
            }
            _parems.caseStatus=caseStatus;
        }
        let that=this;
        $.ajax({
            type:"post",
            url:_url,
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_parems)},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                $(".settle-pop").addClass("hidden");
                alert(_getData.message);
                // let isRefreshCase=false;  //当操作选中的tr时，操作成功后刷新已经加载的详情以及案列组件
                // let selectedCb=$(".cdt-result .cdt-list .myCheckbox-visited").length==1;
                // let hasOn=$(".cdt-result .cdt-list .myCheckbox-visited").closest("tr").hasClass("tr-on");
                // if(selectedCb&&hasOn){
                    // isRefreshCase=true;
                // }
                $(".cdt-result .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                // that.RmdSearch(false,isRefreshCase);
                that.RmdSearch(false);
            }
        })
    }
    //选择事件
    selectedResult(event){
        let self=$(event.target);
        self.parent().siblings().find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        let _state=self.hasClass("myCheckbox-normal");
        if(_state){
            self.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            $(".cdt-result .cdt-list .myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }else {
            self.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            $(".cdt-result .cdt-list .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }
    }
    //导出清单
    loadDetaiList(){
        if($(".cdt-result .cdt-list .myCheckbox-visited").length<=0){
            alert("请选择要操作的数据！");
            return;
        }
        let ids=[];
        let externalInfoDTOList=this.state.externalInfoDTOList;  //总数据
        if($(".cdt-result .slectedAllList").hasClass("myCheckbox-normal")&& $(".cdt-result .cdt-list .myCheckbox-visited").length>0){  //当页全选
            $(".cdt-result .cdt-list tr").each(function(){
                if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                    let _id=$(this).attr("id");
                    if(_id!="-"){
                        ids.push(_id);
                    }
                }
            })
        }else if($(".cdt-result .slectedAllList").hasClass("myCheckbox-visited")){ //全选
            for(let i=0;i<externalInfoDTOList.length;i++){
                let _id=externalInfoDTOList[i].id;
                if(_id){
                    ids.push(_id);
                }
            }
        }
        window.open("/node/lawsuit/exportLawsuitList?ids="+ids)
    }
    //拉取诉讼池数据
    Lawsuit=()=>{
        let that = this;
        let josnParam = Object.assign({},this.state.Lawsuit);
        var pattern = new RegExp("[0-9]+");
        if(josnParam.totalPastDuePrincipalStart){
            if(josnParam.totalPastDuePrincipalEnd){
                if(parseFloat(josnParam.totalPastDuePrincipalEnd) <parseFloat(josnParam.totalPastDuePrincipalStart)){
                    alert('最小逾期本金不能大于最大逾期本金');
                    return;
                }
            }else{
                alert('请输入最大逾期本金');
                return;
            }
        }
        if(josnParam.totalPastDuePrincipalEnd){
            if(josnParam.totalPastDuePrincipalStart){
                if(parseFloat(josnParam.totalPastDuePrincipalEnd)<parseFloat(josnParam.totalPastDuePrincipalStart)){
                    alert('最小逾期本金不能大于最大逾期本金');
                    return;
                }
            }else{
                alert('请输入最小逾期本金');
                return;
            }
        }
        if(josnParam.extractNumber == ''){
            alert('请输入拉取数量');
            return
        }
        if(!pattern.test(josnParam.extractNumber)){
            alert('拉取数量必须为数字');
            return
        }
        if(josnParam.overdueDayMax!==""&&!pattern.test(josnParam.overdueDayMax)){
            alert('最大逾期天数必须为数字');
            return
        }
        josnParam.extractNumber = josnParam.extractNumber?josnParam.extractNumber:null;
        josnParam.overdueDayMax = josnParam.overdueDayMax?josnParam.overdueDayMax:null;
        josnParam.poolEnterTimeBegin = josnParam.poolEnterTimeBegin?josnParam.poolEnterTimeBegin:null;
        josnParam.poolEnterTimeEnd = josnParam.poolEnterTimeEnd?josnParam.poolEnterTimeEnd:null;
        josnParam.productNo = josnParam.productNo?josnParam.productNo:null;
        josnParam.totalPastDuePrincipalStart = josnParam.totalPastDuePrincipalStart?josnParam.totalPastDuePrincipalStart:null;
        josnParam.totalPastDuePrincipalEnd = josnParam.totalPastDuePrincipalEnd?josnParam.totalPastDuePrincipalEnd:null;
        let str = '/node/lawsuit/extract?';
        for (const key in josnParam) {
            if(josnParam[key]) {
                str += "&" +key+'='+josnParam[key];
            }
        }
        window.open(str);
        that.setState({
            LawsuitVisible:false,
            Lawsuit:{
                extractNumber:'',
                overdueDayMax:'',
                poolEnterTimeBegin:'',
                poolEnterTimeEnd:'',
                productNo:'',
            }
        })
        /* $.ajax({
            type:"post",
            url:'/node/lawsuit/extract',
            async:true,
            dataType: "JSON",
            timeout : 60000, //超时时间设置，单位毫秒
            data:josnParam,
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);       
            },
            success:function(result) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(result)) {
                    return;
                }
                
                if(result&&result.code == 1){
                    // alert(res.data.errorCode.descr+':'+res.data.message);
                    alert('成功');
                    var blob = new Blob([result.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"}),
                    Temp = document.createElement("a");
                    // console.log(result);
                    Temp.href = window.URL.createObjectURL(blob);
                    Temp.download =new Date().getTime();
                    $('body').append(Temp);
                    Temp.click();
                    that.setState({
                        LawsuitVisible:false,
                        Lawsuit:{
                            extractNumber:'',
                            overdueDayMax:'',
                            poolEnterTimeBegin:'',
                            poolEnterTimeEnd:'',
                            productNo:'',
                        }
                    })
                }else{
                    alert(result.data.errorCode.descr);
                }
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
        }) */
    }
    /**
     * 2A PORTAL切换左侧组件
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
    _handleUploadSuccess(res){
        console.log(res)
        if(res.data.code == "FAILED"){
            alert(res.data.message);
        }else{
            alert(res.data.errorCode.descr);
        }
    }
    _handleUploadFailed(res){
        console.log('失败')
    }

    _handleUploadFailed(res){
        console.log('失败')
    }
    render() {
        const { outsourceTimeS} = this.state;
        const { settleTimeS, settleTimeE, settleTimeO } = this.state;
        let {lawsuitCaseEnums ,lawsuitStatusEnums,productNoEnums }=this.state;
        const columns = [
                            {
                                title: '导出文件类型',
                                dataIndex: 'describe',
                                key: 'describe',
                                render: text => <a>{text}</a>,
                            }
                        ];
        const data = this.state.materialTypes;
        // rowSelection object indicates the need for row selection
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                let exportCodeList = []
                selectedRows.forEach(e => {
                    exportCodeList.push(e.code)
                });
                this.setState({
                    exportCodeList:exportCodeList
                })
                console.log(exportCodeList);
            },
            getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
            }),
        };
        let fileOption={
            uploadOptions:{
                baseUrl: '/Qport/collection/bulkImportLawsuit',
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
                uploadSuccess: this._handleUploadSuccess.bind(this),  //上传成功后执行的回调（针对AJAX而言）
                uploadFail: this._handleUploadFailed.bind(this),  //上传失败后执行的回调（针对AJAX而言）
                uploadError: this._handleUploadFailed.bind(this)  //上传错误后执行的回调（针对AJAX而言）
            }
        };
        return (
            <div className="content" id="content">
                <div className="top" data-isresetdiv="yes" data-resetstate="outsourceTimeS,settleTimeS,settleTimeE">
                    <div className="clearfix">
                        <select name="" id="productNoEnums" className="select-gray productNoEnums mr15 mt10" style={{"width":"160px"}}>
                            <option value="" hidden>合作方</option>
                            {
                                (productNoEnums&&productNoEnums.length>0)?productNoEnums.map((rpy,i)=>{
                                    return rpy&&<option value={commonJs.is_obj_exist(rpy.value)} key={i}>{commonJs.is_obj_exist(rpy.displayName)+'-'+commonJs.is_obj_exist(rpy.value)}</option>
                                }):<option value="">全部</option>
                            }
                        </select>
                        <input type="text" name="" placeholder="手机号" className="input left mr10 mt10 phoneNo" id='phoneNo' />
                        <input type="text" name="" placeholder="姓名" className="input left mr10 mt10 name input_w" id='name' />
                        <input type="text" name="" placeholder="账号" className="input left mr10 mt10 acount" id='acount' />
                        <input type="text" name="" placeholder="合同号" className="input left mr10 mt10 loanNumber" id='loanNumber' />
                        <dl className="left outsouceTime mt10" style={{"width":"205px","height":"32px"}}>
                            <dt>诉讼状态</dt>
                            <dd>
                                <select name="" id="lawsuitStatus" className="select-gray lawsuitStatus" style={{"width":"140px"}}>
                                    <option value="" hidden>请输入</option>
                                    <option value="">全部</option>
                                    {
                                        (lawsuitStatusEnums&&lawsuitStatusEnums.length>0)?lawsuitStatusEnums.map((repy,i)=>{
                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>
                                                {commonJs.is_obj_exist(repy.displayName)}
                                            </option>
                                        }):<option value=""></option>
                                    }
                                </select>
                            </dd>
                        </dl>
                        <dl className="left outsouceTime mt10" style={{"width":"205px","height":"32px"}}>
                            <dt>结案状态</dt>
                            <dd>
                                <select name="" id="caseStatus" className="select-gray caseStatus" style={{"width":"140px"}}>
                                    <option value="" hidden>请输入</option>
                                    <option value="">全部</option>
                                    {
                                        (lawsuitCaseEnums&&lawsuitCaseEnums.length>0)?lawsuitCaseEnums.map((repy,i)=>{
                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>
                                                {commonJs.is_obj_exist(repy.displayName)}
                                            </option>
                                        }):<option value=""></option>
                                    }
                                </select>
                            </dd>
                        </dl>
                        <dl className="left outsouceTime mt10" style={{"width":"290px"}}>
                            <dt>提交诉讼日期：</dt>
                            <dd id='outsouceTime'>
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    value={outsourceTimeS}
                                    placeholder="Start"
                                    onChange={this.outsourceTimeSchange.bind(this)}
                                />
                            </dd>
                        </dl>
                        <dl className="left outsouceTime mt10" style={{"width":"475px"}}>
                            <dt>诉状生成日期：</dt>
                            <dd id='settleTime'>
                                <DatePicker
                                    disabledDate={this.settleTimeSdis.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={settleTimeS}
                                    placeholder="Start"
                                    onChange={this.settleTimeSchange.bind(this)}
                                    onOpenChange={this.settleTimeSOC.bind(this)}
                                />
                                <span> - </span>
                                <DatePicker
                                    disabledDate={this.settleTimeEdis.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={settleTimeE}
                                    placeholder="End"
                                    onChange={this.settleTimeEchange.bind(this)}
                                    open={settleTimeO}
                                    onOpenChange={this.settleTimeEOC.bind(this)}
                                />
                            </dd>
                        </dl>
                        <dl className="left outsouceTime mt10" style={{"width":"160px","height":"32px"}}>
                            <dt>诉状生成状态：</dt>
                            <dd>
                                <select name="" id="createLawsuit" className="select-gray createLawsuit">
                                    <option data-value="" hidden>是/否</option>
                                    <option data-value="">全部</option>
                                    <option data-value="1">是</option>
                                    <option data-value="2">否</option>
                                </select>
                            </dd>
                        </dl>
                        <dl className="left outsouceTime mt10" style={{"width":"160px","height":"32px"}}>
                            <dt>下载状态：</dt>
                            <dd>
                                <select name="" id="isDownLoaded" className="select-gray isDownLoaded">
                                    <option data-value="" hidden>请选择</option>
                                    <option data-value="">全部</option>
                                    <option data-value="1">已下载</option>
                                    <option data-value="0">未下载</option>
                                </select>
                            </dd>
                        </dl>
                        <button className="left mr15 mt10 btn-blue getCQ-btn" id='searchBtn' onClick={this.RmdSearch.bind(this,"fromBtn")}>搜索</button>
                        <button className="left mt10 btn-white" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                        <FileUpload className="left" options={fileOption.uploadOptions}  ref="fileUpload">
                            <button ref="chooseAndUpload" style={{marginLeft: '15px'}} className="left mt10 btn-white">批量导入</button>
                        </FileUpload>
                        <button className="left mr15 mt10 btn-blue" style={{marginLeft: '20px'}} onClick={()=>{
                            this.setState({
                                LawsuitVisible:true,
                            })
                        }}>拉取诉讼池数据</button>
                    </div>
                </div>
                <div className="cdt-result bar mt20 relative">
                    <div className="editBtnList pt5 pb5 border-bottom clearfix hidden">
                        <button className="btn-deep-yellow right mr10" id='lawsuit2Collection' onClick={this.lawsuit2Collection}>转入Collection</button>
                        <button className="btn-deep-yellow right mr10" id='loadPackDetail' onClick={this.loadPackDetail.bind(this,"/node/lawsuit/export/verdictList")}>导出判决书</button>
                        <button className="btn-deep-yellow right mr10" id='litigateDown' onClick={()=>{this.showExportContract()}}>导出客户合同&还款明细</button>
                        <button className="btn-deep-yellow right mr10" id='loadDetaiList' onClick={this.loadDetaiList.bind(this)}>导出清单</button>
                        <button className="btn-deep-yellow right mr10" id='editIndictmentDate' data-type="editIndictmentDate" onClick={this.showSettlePop.bind(this)}>生成诉状日期</button>
                        <button className="btn-deep-yellow right mr10" id='editLawsuitState' data-type="editLawsuitState" onClick={this.showSettlePop.bind(this)}>批量编辑诉讼状态</button>
                        <button className="btn-deep-yellow right mr10" id='editSettleState' data-type="editSettleState" onClick={this.showSettlePop.bind(this)}>批量编辑结案状态</button>
                    </div>
                    <div>
                        <table className="pt-table">
                            <thead>
                                <tr className='th-bg'>
                                    <th width="7%">账号</th>
                                    <th width="10%">贷款号码</th>
                                    <th width="5%">姓名</th>
                                    <th width="10%">手机号</th>
                                    <th width="5%">下载状态</th>
                                    <th width="10%" className="pointer" data-sort="invert" id='submitLawsuitTimeSort' onClick={sortTimeJs.sortTime.bind(this,this.state.externalInfoDTOList,"submitLawsuitTime","externalInfoDTOList",event,this)}>
                                        <span className="left mr5">提交诉讼日期</span>
                                        <i className="sort-icon sort-normal mt19"></i>
                                    </th>
                                    <th width="10%" className="pointer" data-sort="invert" id='createLawsuitTimeSort' onClick={sortTimeJs.sortTime.bind(this,this.state.externalInfoDTOList,"createLawsuitTime","externalInfoDTOList",event,this)}>
                                        <span className="left mr5">诉状生成日期</span>
                                        <i className="sort-icon sort-normal mt19"></i>
                                    </th>
                                    <th width="5%">诉讼罚息</th>
                                    <th width="7%">诉讼金额</th>
                                    <th width="7%">诉讼状态</th>
                                    <th width="7%">结案状态</th>
                                    <th width="5%">
                                        <i className="myCheckbox myCheckbox-normal slectedAllList" id='slectedAllList' onClick={this.selectedResult.bind(this)}></i>
                                        全选
                                    </th>
                                    <th width="10%">
                                        <i className="myCheckbox myCheckbox-normal selectedCurrentList" id='selectedCurrentList' onClick={this.selectedResult.bind(this)}></i>
                                        当页全选
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='cdt-list'>
                            {
                                (this.state.externalInfoDTOList && this.state.externalInfoDTOList.length>0) ? this.state.externalInfoDTOList.map((repy,i)=>{
                                    let barsNums=this.state.barsNum;  //每一页显示条数
                                    let currentPage=this.state.current;  //当前页码
                                    let isDownLoaded=commonJs.is_obj_exist(repy.isDownLoaded).toString();
                                    let isDownLoadedesc='';
                                    if(isDownLoaded==1){
                                        isDownLoadedesc='已下载';
                                    }else if(isDownLoaded==0){
                                        isDownLoadedesc='未下载';
                                    }
                                    if(i>=barsNums*(currentPage-1) && i<=(barsNums*currentPage-1)){
                                        return <tr key={i} id={commonJs.is_obj_exist(repy.id)}>
                                                <td className="r_productNo hidden">
                                                    {commonJs.is_obj_exist(repy.productNo)}{/*  */}
                                                </td>
                                                <td className="r_accountId" title={commonJs.is_obj_exist(repy.accountId)} data-accountId={commonJs.is_obj_exist(repy.accountId)}>
                                                    {commonJs.is_obj_exist(repy.accountId)}{/* 账号 */}
                                                </td>
                                                <td className="r_loanNumber"  title={commonJs.is_obj_exist(repy.loanNumber)} data-loanNumber={commonJs.is_obj_exist(repy.loanNumber)}>
                                                    {commonJs.is_obj_exist(repy.loanNumber)}{/* 贷款号码 */}
                                                </td>
                                                <td className="r_name" title={commonJs.is_obj_exist(repy.userName)}>
                                                    {commonJs.is_obj_exist(repy.userName)}{/* 姓名 */}
                                                </td>
                                                <td className="r_telPhone"  title={commonJs.is_obj_exist(repy.primaryPhone)}>
                                                    {commonJs.is_obj_exist(repy.primaryPhone)}{/* 手机号 */}
                                                </td>
                                                <td className="r_telPhone"  title={commonJs.is_obj_exist(isDownLoadedesc)}>
                                                    {commonJs.is_obj_exist(isDownLoadedesc)}{/* 下载状态 */}
                                                </td>
                                                <td  title={commonJs.is_obj_exist(repy.submitLawsuitTime )}>
                                                    {commonJs.is_obj_exist(repy.submitLawsuitTime )}{/* 提交诉讼日期 */}
                                                </td>
                                                <td className="r_createLawsuitTime"  title={commonJs.is_obj_exist(repy.createLawsuitTime)}>
                                                    {commonJs.is_obj_exist(repy.createLawsuitTime)}{/* 诉状生成日期 */}
                                                </td>
                                                <td title={commonJs.is_obj_exist(repy.lawsuitInterest )}>
                                                    {commonJs.is_obj_exist(repy.lawsuitInterest )}{/* 诉讼罚息 */}
                                                </td>
                                                <td title={commonJs.is_obj_exist(repy.lawsuitAmount)}>
                                                    {commonJs.is_obj_exist(repy.lawsuitAmount)}{/* 诉讼金额 */}
                                                </td>
                                                <td title={commonJs.is_obj_exist(repy.lawsuitStatus)}>
                                                    {commonJs.is_obj_exist(repy.lawsuitStatus)}{/* 诉讼状态 */}
                                                </td>
                                                <td title={commonJs.is_obj_exist(repy.caseStatus)}>
                                                    {commonJs.is_obj_exist(repy.caseStatus)}{/* 结案状态 */}
                                                </td>
                                                <td  colSpan="2">
                                                    <i className="myCheckbox myCheckbox-normal" id={'trCheck'+i}></i>
                                                </td>
                                            </tr>
                                    }
                                }):<tr><td colSpan="12" className="gray-tip-font">暂未查到相关数据...</td></tr>
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
                                current={this.state.current}
                                total={this.state.externalInfoDTOList?this.state.externalInfoDTOList.length : 0}
                                onChange={this.gotoPageNum.bind(this)}
                                pageSizeOptions={['10','50','100','200','500']}
                            />
                        </div>
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
                        _labelBody_reload="reload"
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
                    <div className="settle-cont lawsuit-settle clearfix">
                        {/* 诉讼结案子枚举值 */}
                        <select name="" id="lawsuitCaseEnumsDiv" className="select-gray mr10 caseSettle lawsuitCaseEnumsDiv hidden" style={{"width":"200px"}}>
                            <option value="" id="0" hidden>请选择结案状态</option>
                            {
                                (lawsuitCaseEnums && lawsuitCaseEnums.length>0)?lawsuitCaseEnums.map((repy,i)=>{
                                    return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                }):<option value=""></option>
                            }
                        </select>
                        {/* 诉讼状态枚举值 */}
                        <select name="" id="lawsuitStatusEnumsDiv" className="select-gray mr10 caseSettle lawsuitStatusEnumsDiv hidden" style={{"width":"200px"}}>
                            <option value="" id="0" hidden>请选择诉讼状态</option>
                            {
                                (lawsuitStatusEnums && lawsuitStatusEnums.length>0)?lawsuitStatusEnums.map((repy,i)=>{
                                    return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                }):<option value=""></option>
                            }
                        </select>
                        <div className="editLawsuitT hidden" id='editLawsuitT'>
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="请选择诉状日期"
                                value={this.state.plaintTime}
                                onChange={this.editLawsuitTchange.bind(this)}
                            />
                        </div>
                        <div className="clear"></div>
                        <p className="mt5 left">备注：</p>
                        <textarea name="" id="" className="textarea editLawsuitTextarea" id='editLawsuitTextarea' style={{"width":"100%","height":"50px"}}></textarea>
                        <button className="btn-deep-yellow mr10 left btn_yello_h30" id='sureEdit' onClick={this.sureEdit.bind(this)}>确定</button>
                        <button className="btn-white left" id='sureEditCancle' onClick={this.closetanc.bind(this)}>取消</button>
                    </div>
                </div>
                <Modal
                    title="选择导出文件"
                    visible={this.state.visible}
                    destroyOnClose={true}
                    onOk={()=>{this.loadPackDetail('/node/lawsuit/litigate/download','ExportContract')}}
                    onCancel={()=>this.setState({visible:false,exportCodeList:[]})}
                    >
                    <Table rowKey='code' rowSelection={{
                        type: 'checkbox',
                        ...rowSelection,
                    }} columns={columns} dataSource={data} />
                </Modal>
                <Modal
                    title="拉取诉讼池数据"
                    visible={this.state.LawsuitVisible}
                    destroyOnClose={true}
                    onOk={()=>{
                        this.Lawsuit();
                    }}
                    onCancel={()=>{
                        this.setState({
                            LawsuitVisible:false,
                            Lawsuit:{
                                extractNumber:'',
                                overdueDayMax:'',
                                poolEnterTimeBegin:'',
                                poolEnterTimeEnd:'',
                                productNo:'',
                            }
                        })
                    }}
                    >
                        <Row style={{height:' 50px'}}  gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <div>产品号</div>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <div><Input  value={this.state.Lawsuit.productNo} maxLength={20} onChange={(v)=>{
                                    let Lawsuit = this.state.Lawsuit;
                                    Lawsuit.productNo = v.currentTarget.value;
                                    this.setState({
                                        Lawsuit:Lawsuit
                                    })
                                }}  placeholder="请输入产品号" /></div>
                            </Col>
                        </Row>
                        <Row style={{height:' 50px'}} gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <div>最小逾期天数</div>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <div><Input  type='Number' value={this.state.Lawsuit.overdueDayMax} maxLength={5} onChange={(v)=>{
                                    let Lawsuit = this.state.Lawsuit;
                                    Lawsuit.overdueDayMax = v.currentTarget.value;
                                    this.setState({
                                        Lawsuit:Lawsuit
                                    })
                                }}  placeholder="请输入最小逾期天数" /></div>
                            </Col>
                        </Row>
                        <Row style={{height:' 50px'}}  gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <div>进入诉讼池时间</div>
                            </Col>
                            <Col className="gutter-row" span={14}>
                            <RangePicker
                                //defaultValue={[moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]}
                                format={dateFormat}
                                onChange={(v)=>{
                                    console.log(v);
                                    let Lawsuit = this.state.Lawsuit;
                                    const  poolEnterTimeBegin = v.length>0?moment(v[0],'YYYY-MM-DD').format('YYYY-MM-DD'):'';
                                    const  poolEnterTimeEnd = v.length>0?moment(v[1],'YYYY-MM-DD').format('YYYY-MM-DD'):'';
                                    Lawsuit.poolEnterTimeBegin= poolEnterTimeBegin;
                                    Lawsuit.poolEnterTimeEnd= poolEnterTimeEnd;
                                    console.log(Lawsuit);
                                    this.setState({
                                        Lawsuit:Lawsuit,
                                    })
                                }}
                            />
                            </Col>
                        </Row>
                        <Row style={{height:' 50px'}} gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <div>逾期本金</div>
                            </Col>
                            <Col className="gutter-row" span={7}>
                                <div><Input type='Number' value={this.state.Lawsuit.totalPastDuePrincipalStart} maxLength={5} onChange={(v)=>{
                                    let Lawsuit = this.state.Lawsuit;
                                    Lawsuit.totalPastDuePrincipalStart = v.currentTarget.value;
                                    this.setState({
                                        Lawsuit:Lawsuit
                                    })
                                }}  placeholder="请输入最小逾期本金" /></div>
                            </Col>
                            <Col className="gutter-row" span={7}>
                                <div><Input type='Number' value={this.state.Lawsuit.totalPastDuePrincipalEnd} maxLength={5} onChange={(v)=>{
                                    let Lawsuit = this.state.Lawsuit;
                                    Lawsuit.totalPastDuePrincipalEnd = v.currentTarget.value;
                                    this.setState({
                                        Lawsuit:Lawsuit
                                    })
                                }}  placeholder="请输入最大逾期本金" /></div>
                            </Col>
                        </Row>
                        <Row style={{height:' 50px'}}  gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <div><span style={{color:'red'}} >*</span>提取数量</div>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <div><Input  type='Number' value={this.state.Lawsuit.extractNumber} maxLength={5} onChange={(v)=>{
                                    let Lawsuit = this.state.Lawsuit;
                                    Lawsuit.extractNumber = v.currentTarget.value;
                                    this.setState({
                                        Lawsuit:Lawsuit
                                    })
                                }}  placeholder="请输入提取数量" /></div>
                            </Col>
                        </Row>
                </Modal>
            </div>
        )
    }
};

export default Lawsuit;  //ES6语法，导出模块