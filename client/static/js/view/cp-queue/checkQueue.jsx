// 订单审核-审核queue - 小雨花
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import PartnerList from '../cp-module/partnerList';  //合作方列表 
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import RepayInfoBar from '../cp-module/repayInfoBar';  //贷款信息展示
// 左侧页面
import ShopMsgXYH from '../cp-module/shopMsgXYH';  //=>用户详情-小雨花
import FileXYH from '../cp-search/fileXYH';  //=>资料信息=附件-小雨花
import FileReconsider from '../cp-search/fileReconsider';  //=>复议资料-小雨花
import OrderInfo from '../cp-search/orderInfo';  //=>订单信息-小雨花 
import RiskInfo from '../cp-search/riskInfo';  //=>风控信息-小雨花   
import OperateList from '../cp-search/operateList';  //=>操作记录-小雨花
import HistoryOrder from '../cp-search/historyOrder';  //=>历史订单-小雨花

import {observer,inject} from "mobx-react"; 
import { observable, action, computed ,configure,runInAction} from "mobx";
import { Checkbox,Select } from 'antd';
const { Option } = Select;
import axios from '../../axios';
import qs from 'Qs';

@inject('allStore') @observer
class CheckQueue extends React.Component{
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.cooperationListStore=this.props.allStore.CooperationList;
        this.cooperationCountStore=this.props.allStore.CooperationCountStore;
        this.state={
            lef_page:"",  //左边页面组件
            condition:{},  //存放搜索条件
            showOpraRecord:false,  //是否展示record操作框 ture展示，false隐藏
            withdrawReasonEnums:[],
            frDesc:'',
            newReconsiderReasonId:[],
            withdrawOrCancelReason:'',
        }
    }
    UNSAFE_componentWillMount(){
        let _location=this.props.location;
        let xyhRecheck=_location.query.xyhRecheck;
        this.setState({
            xyhRecheck:xyhRecheck
        })
    }
    @action componentDidMount(){
        commonJs.resetCondition(this);
        this.changeLeftCP(0);
        commonJs.reloadRules();
        this.cooperationListStore.getAllCooperations("/node/manual/xyh/getXyhAllCount",{xyhRecheck:this.state.xyhRecheck});  //获取顶部合作方数据列表
        this.getCount();  //处理条数
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        let _location=nextProps.location;
        let _action=_location.action;
        this.userinfoStore.restoreUserInfo();
        if(_action=='POP'){
            // commonJs.resetCondition(this);//======暂不清楚是哪里用的====
            this.changeLeftCP(0);
            let xyhRecheck=_location.query.xyhRecheck;
            this.setState({
                xyhRecheck:xyhRecheck
            },()=>{
                this.cooperationListStore.getAllCooperations("/node/manual/xyh/getXyhAllCount",{xyhRecheck:this.state.xyhRecheck});  //获取顶部合作方数据列表
                this.getCount();  //处理条数
            })
        }
        //风控信息 关联数据合同号点击展示对应详情（小雨花详情接口仅用 loanNo 和 fromFlag:XYH）
        let riskInfoCurrentLoanNo=_location.query.riskInfoCurrentLoanNo;
        if(riskInfoCurrentLoanNo){
            this.setState({
                FuzzyLoanNo: riskInfoCurrentLoanNo
            },()=>{
                this.searchHandle('SEARCH',false);
            })
        }
      }
    /**
     *
     * 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    changeLeftCP(index,right_index){
        var leftHtml = this.getLeftHtml(index);
        this.setState({
            lef_page:leftHtml
        },()=>{
            $(".Csearch-left-page li").removeClass("on");
            $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
        })
    }

    /**
     * 获取左侧组件内容
     * @param index
     * @returns {string}
     */
    getLeftHtml(index){
        let left_page="";
        let infoDTO=cpCommonJs.opinitionObj(this.state.infoDTO);
        let platformFlag=infoDTO.platformFlag;//接口返回的平台或第三方标识
        let loanNumber=infoDTO.loanNumber;//接口返回的合同号
        if(!platformFlag){
            platformFlag="default"
        }
        switch (index){
            case 0:
                left_page=<ShopMsgXYH />;
                break;
            case 'XYH_1':
                left_page=<OrderInfo />;
                break;
            case 'XYH_2':
                left_page=<FileXYH />;
                break;
            case 'XYH_3':
                left_page=<RiskInfo />;
                break;
            case 'XYH_4':
                left_page=<OperateList tempType='checkQueue' />;
                break;
            case 'XYH_5':
                left_page=<HistoryOrder />;
                break;
            case 'XYH_6':
                left_page=<FileReconsider />;
                break;
        }
        return left_page;
    }
    cancleSaveRecord(){
        cpCommonJs.cancleSaveRecord();
        this.setState({
            reconsiderReasonId:null,
            RejectReason:null,
            select_withdrawReasonEnums:null,
            mistakeFileSelected:[],
            newReconsiderReasonId:[],
        })
    }
    // 搜索 queueReloadEnum 传 SEARCH; isOldCondition为true则从state中获取搜索时的条件
    @action searchHandle(queueReloadEnum,isOldCondition){
        this.changeLeftCP(0);
        let that=this;
        let _parem={};  //请求参数
        this.cancleSaveRecord();
        if(isOldCondition){  //保存recore时重新调取搜索接口
            let _chenel=this.state.cooperationFlag;
             if(_chenel){
                _parem.cooperationFlag=_chenel;
            }
            _parem=this.state.condition;
        }else{
            let _chenel=this.state.cooperationFlag;
            let _businessType=this.state.businessType;
            let _loanNumber=this.state.FuzzyLoanNo;  //合同号
            let _phoneNo=this.state.FuzzyPhone;  //手机号
            let _name=$(".check-search .name").val();  //姓名
            if(_name && _name.replace(/\s/g,"")){
                _parem.name=_name.replace(/\s/g,"");
            }
            if(_chenel){
                _parem.cooperationFlag=_chenel;
            }
            if(_businessType)_parem.businessType=_businessType;
            if(_loanNumber && _loanNumber.replace(/\s/g,"")){
                _parem.loanNumber=_loanNumber.replace(/\s/g,"");
            }
            if(_phoneNo && _phoneNo.replace(/\s/g,"") && !(/^1\d{10}$/.test(_phoneNo))){
                alert("请输入正确的手机号码！");
                return;
            }
            if(_phoneNo&&_phoneNo.replace(/\s/g,"")){
                _parem.phone=_phoneNo.replace(/\s/g,"");
            }
            if(!_chenel && !_businessType && !_loanNumber && !_phoneNo && !_name){
                alert("请输入任一搜索条件！");
                return;
            }
            // if(!_chenel){
            //     alert("请选择产品号！");
            //     return;
            // }
            this.setState({
                condition:_parem
            });
        }
        _parem.queueReloadEnum=queueReloadEnum;
        _parem.xyhRecheck=this.state.xyhRecheck;
        this.searchCommonFn(_parem,queueReloadEnum);
    }
    //获取绑定条数
    @action getCount(){
        let that=this;
        let _data={
            cooperationFlag:this.state.cooperationFlag,
            xyhRecheck:this.state.xyhRecheck,
        };
        let _channelText=this.state.businessType;
        if(_channelText){
            _data.businessType=_channelText;
        }
        $.ajax({
            type:"get", 
            url:"/node/manual/xyh/count", 
            async:true,
            dataType: "JSON", 
            data:_data,
            success:function(res){
                runInAction(() => {
                    if(!commonJs.ajaxGetCode(res)){
                        that.props.allStore.CooperationCountStore.cooperationCount={}
                        return;
                    }
                    var _data=res.data;
                    that.props.allStore.CooperationCountStore.cooperationCount=_data;
                })
            }
       })
    }
    //搜索公共方法
    @action searchCommonFn(_parem,queueReloadEnum){
        let that=this;
        axios({
            method: 'POST',
            url:'/node/manual/xyh/searchByCondition',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(_parem),
        })
        .then(function (res) {
            let response=res.data;  //from node response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    infoDTO:{},
                    rejectCauseDictionaryInfoDTOS:[],
                    cancelReason:[],
                    withdrawReasonEnums:{},
                    queueContactResultEnums:{},
                    recordInfoDTOS:[],
                    fraudReason:[]
                },()=>{
                    that.userinfoStore.restoreUserInfo();
                })
                return;
            }
            let _data=response.data;  //from java response
            let _infoDTO=_data.infoDTO?_data.infoDTO:{};
            //更新userinfo store  ---
            that.userinfoStore.orderNo=_infoDTO.orderNo;
            that.userinfoStore.loanNo=_infoDTO.loanNumber;
            // that.userinfoStore.cooperationFlag=_infoDTO.cooperationFlag;
            that.userinfoStore.fromFlag=_infoDTO.fromFlag;
            that.userinfoStore.platformFlag=_infoDTO.platformFlag;
            that.userinfoStore.customerId=_infoDTO.customerId;
            that.userinfoStore.xyhRecheck=that.state.xyhRecheck;
            //---end
            let oldQueueContactResultEnums=_data.queueContactResultEnums?_data.queueContactResultEnums:[];
            let newQueueContactResultEnums=that.dealStates(oldQueueContactResultEnums);
            if(_data.bindStatus&&_data.bindStatus=="bind"){
                alert("当前queue已被"+_data.bindBy+"绑定！");
                that.setState({
                    showOpraRecord:false
                })
            }else if(_infoDTO.queueStatusId!=1){
                that.setState({
                    showOpraRecord:false
                })
            }else{
                that.setState({
                    showOpraRecord:true
                })
            }
            let recordInfoDTOS=cpCommonJs.opinitionArray(_data.recordInfoDTOS);
            that.setState({
               infoDTO:_infoDTO,
               rejectCauseDictionaryInfoDTOS:cpCommonJs.opinitionArray(_data.rejectCauseDictionaryInfoDTOS), //拒绝原因 
               cancelReason:cpCommonJs.opinitionArray(_data.cancelReason), //取消原因 
               withdrawReasonEnums:_data.withdrawReasonEnums?_data.withdrawReasonEnums:{}, //撤回原因 
               queueContactResultEnums:newQueueContactResultEnums, //处理状态 
               recordInfoDTOS:recordInfoDTOS,  //record记录
               searchResult:_data,
               businessType:_infoDTO.businessType?_infoDTO.businessType:that.state.businessType,
               fraudReason:cpCommonJs.opinitionArray(_data.fraudReason),   //反欺诈原因
            },()=>{
                that.userinfoStore.getIdentityInfo(that,true);
                that.getCount();  //处理条数
                that.cooperationListStore.getAllCooperations("/node/manual/xyh/getXyhAllCount",{xyhRecheck:that.state.xyhRecheck});  //获取顶部合作方数据列表
                that.props.allStore.CommonStore.search_recordInfoDTOS=recordInfoDTOS;
           })
        //    console.log(_data.fraudReason);
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    //搜索下一条
    @action searchNext(){
        this.changeLeftCP(0);
        let that=this;
        let _chenel=this.state.cooperationFlag;
        let _businessType=this.state.businessType;
        this.cancleSaveRecord();
        cpCommonJs.clearCondition();
        if(_businessType==0||!_businessType){
            alert("请先选择合作方！");
            return;
        }
        axios({
            method: 'get',
            url:'/node/manual/xyh/next',
            params:{
                cooperationFlag:_chenel,
                businessType:_businessType,
                xyhRecheck:this.state.xyhRecheck,
            }, 
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let _data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    infoDTO:{},
                    rejectCauseDictionaryInfoDTOS:[],
                    cancelReason:[], //取消原因 
                    withdrawReasonEnums:[],
                    queueContactResultEnums:{},
                    recordInfoDTOS:[],
                     fraudReason:[]
                },()=>{
                    that.userinfoStore.restoreUserInfo();
                })
                return;
            }
            let _infoDTO=_data.infoDTO?_data.infoDTO:{};
            //更新userinfo store  ---
            that.userinfoStore.orderNo=_infoDTO.orderNo;
            that.userinfoStore.loanNo=_infoDTO.loanNumber;
            // that.userinfoStore.cooperationFlag=_infoDTO.cooperationFlag;
            that.userinfoStore.fromFlag=_infoDTO.fromFlag;
            that.userinfoStore.platformFlag=_infoDTO.platformFlag;
            that.userinfoStore.customerId=_infoDTO.customerId;
            that.userinfoStore.xyhRecheck=that.state.xyhRecheck;
            //---end
            let oldQueueContactResultEnums=_data.queueContactResultEnums?_data.queueContactResultEnums:[];
            let newQueueContactResultEnums=that.dealStates(oldQueueContactResultEnums);
            let recordInfoDTOS=cpCommonJs.opinitionArray(_data.recordInfoDTOS);
            if(_infoDTO.bindStatus&&_infoDTO.bindStatus=="bind"){
                alert("当前queue已被"+_infoDTO.bindBy+"绑定！");
                that.setState({
                    showOpraRecord:false
                })
            }else if(_infoDTO.queueStatusId!=1){
                that.setState({
                    showOpraRecord:false
                })
            }else{
                that.setState({
                    showOpraRecord:true
                })
            }
            that.setState({
                infoDTO:_infoDTO,
                rejectCauseDictionaryInfoDTOS:_data.rejectCauseDictionaryInfoDTOS?_data.rejectCauseDictionaryInfoDTOS:{}, //拒绝原因 
                cancelReason:cpCommonJs.opinitionArray(_data.cancelReason), //取消原因 
                withdrawReasonEnums:_data.withdrawReasonEnums?_data.withdrawReasonEnums:{}, //撤回原因 
                queueContactResultEnums:newQueueContactResultEnums, //处理状态 
                recordInfoDTOS:recordInfoDTOS,  //record记录
                searchResult:_data,
                businessType:_infoDTO.businessType?_infoDTO.businessType:that.state.businessType,
                fraudReason:cpCommonJs.opinitionArray(_data.fraudReason),   //反欺诈原因
                // frDesc:_data.riskControlInfo.frDesc,
                condition:{
                    cooperationFlag:_chenel,
                    loanNumber:_data.infoDTO?_data.infoDTO.loanNumber:"",
                }
            },()=>{
                that.userinfoStore.getIdentityInfo(that,true);
                that.getCount();  //处理条数
                that.cooperationListStore.getAllCooperations("/node/manual/xyh/getXyhAllCount",{xyhRecheck:that.state.xyhRecheck});  //获取顶部合作方数据列表
                that.props.allStore.CommonStore.search_recordInfoDTOS=recordInfoDTOS;
            })
        })
    }
    //保存案件记录
    saveRecord(){
        let that=this;
        let _parem={};
        _parem.xyhRecheck=this.state.xyhRecheck;
        let infoDTO=this.state.infoDTO?this.state.infoDTO:{};
        let _loanNumber=infoDTO.loanNumber;
        if(!_loanNumber){
            alert('未获取到合同号！')
            return;
        }
        _parem.loanNumber=_loanNumber;
        let _caseType=$(".caseType option:selected").attr('value');
        if(!_caseType){
            alert('请选择案件类别！')
            return;
        }
        _parem.caseType=_caseType;
        let _caseContent=$(".caseRcord .caseContent").val();
        if(!_caseContent){
            alert('请填写详情！')
            return;
        }
        _parem.caseContent=_caseContent;
        axios({
            method: 'POST',
            url:'/node/manual/xyh/saveCaseRecord',
            data:{josnParam:JSON.stringify(_parem)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let _data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(_data.message);
            that.searchHandle('RELOAD',true);  //冲载页面数据
            that.cancleSaveRecord();
        })
    }
    // 保存审核reored
    saveCheck(){
        let that=this;
        let _parem={};
        _parem.xyhRecheck=this.state.xyhRecheck;
        let infoDTO=this.state.infoDTO?this.state.infoDTO:{};
        let _loanNumber=infoDTO.loanNumber;
        if(!_loanNumber){
            alert("未获取到合同号！");
            return;
        }
        _parem.loanNumber=_loanNumber;
        let _productNo=infoDTO.cooperationFlag;
        let _beforeQueueStatusId=infoDTO.queueStatusId;
        if(!_beforeQueueStatusId){
            alert("未获取到操作之前的状态！");
            return;
        }
        _parem.beforeQueueStatusId=_beforeQueueStatusId;
        let _afterQueueStatusId=$(".QrecordInfo .queueContactResultEnums option:selected").attr('data-value');
        if(!_afterQueueStatusId){
            alert("请选择处理结果！");
            return;
        }
        _parem.afterQueueStatusId=_afterQueueStatusId;

        let _cancelReasonId=$(".QrecordInfo .cancelReason option:selected").attr('data-id'); //取消原因-ID
        let _cancelReason=$(".QrecordInfo .cancelReason option:selected").text(); //取消原因-中文
        if(_afterQueueStatusId==8 && !_cancelReasonId){
            alert("请选择取消原因！");
            return;
        }
        if(_afterQueueStatusId==8 && _cancelReasonId){
            _parem.withdrawOrCancelReasonId=_cancelReasonId;
        }
        if(_afterQueueStatusId==8 && _cancelReason && _cancelReason!="请选择取消原因"){
            _parem.withdrawOrCancelReason=_cancelReason;
        }

        let _withdrawOrCancelReasonId=$(".QrecordInfo .rejectCauseDictionaryInfoDTOS option:selected").attr('data-id'); //拒绝原因-ID
        if(_afterQueueStatusId==11 && !_withdrawOrCancelReasonId){
            alert("请选择拒绝原因！");
            return;
        }
        if(_afterQueueStatusId==11 && _withdrawOrCancelReasonId){
            _parem.withdrawOrCancelReasonId=_withdrawOrCancelReasonId;
        }
        let _withdrawOrCancelReason=$(".QrecordInfo .rejectCauseDictionaryInfoDTOS option:selected").text(); //拒绝原因-中文
        if(_afterQueueStatusId==11 && (!_withdrawOrCancelReason || _withdrawOrCancelReason=="请选择拒绝原因")){
            alert("请选择拒绝原因！");
            return;
        }
        if(_afterQueueStatusId==11 && _withdrawOrCancelReason && _withdrawOrCancelReason!="请选择拒绝原因"){
            _parem.withdrawOrCancelReason=_withdrawOrCancelReason;
        }

        let reconsiderReasonId=this.state.reconsiderReasonId; //转反欺诈审核原因-id
        let RejectReason=this.state.RejectReason; //转反欺诈审核原因-中文
        let withdrawOrCancelReason=this.state.withdrawOrCancelReason; //转反欺诈审核原因-中文
        if(_afterQueueStatusId==5&&!RejectReason){
            alert("请选择转反欺诈原因!");
            return;
        }
        if(_afterQueueStatusId==5 &&RejectReason){
            if(reconsiderReasonId){
                _parem.withdrawOrCancelReasonId=reconsiderReasonId;
            }
            _parem.withdrawOrCancelReason=RejectReason;
            // _parem.withdrawOrCancelReason = withdrawOrCancelReason
        }
        let _wrongDetail=this.state.mistakeFileSelected; //有误文件
        if(_afterQueueStatusId==12 && (!_wrongDetail || _wrongDetail.length<=0)){
            alert("请选择有误文件！");
            return;
        }
        if(_afterQueueStatusId==12 && _wrongDetail){
            let _wrongDetail_array=[];
            for(let i=0;i<_wrongDetail.length;i++){
                _wrongDetail_array.push(_wrongDetail[i]);
            }
            _parem.wrongDetail=_wrongDetail_array.join(',');
        }

        let _caseContent=$(".checkRecord .caseContent").val();
        if((_afterQueueStatusId==12 || _afterQueueStatusId==8 || (_afterQueueStatusId==5 && RejectReason=='其他')) && !_caseContent){  //审核详情必填
            alert("请填写审核详情！");
            return;
        }
        if(_caseContent){
            _parem.caseContent=_caseContent;
        }
        let standby2=this.state.standby2;
        if(standby2){
            _parem.standby2='是';
        }else{
            _parem.standby2='否';
        }
        console.log(_parem)
        axios({
            method: 'POST',
            url:'/node/manual/xyh/save',
            data:{josnParam:JSON.stringify(_parem)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let _data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(_data.message);
            that.searchHandle('RELOAD',true);  //冲载页面数据
            that.cancleSaveRecord();
        })
    }
    //处理状态选拒绝时显示拒绝原因选项
    rejectSelect(event){
        $(".rejectCauseDictionaryInfoDTOS-td,.mistakeFile-td,.cancelReason-td,.reconsiderReason-td").addClass('hidden');
        let _value=$(event.target).find("option:selected").attr("data-value");
        this.setState({
            reconsiderReasonId:null,
            RejectReason:null,
            select_withdrawReasonEnums:null,
            mistakeFileSelected:[],
        })
        if(_value=="11"){  //拒绝
            $(".rejectCauseDictionaryInfoDTOS-td").removeClass("hidden");
        }else if(_value=="12"){  //信息有误
            $(".mistakeFile-td").removeClass("hidden");
        }else if(_value=="8"){  //取消
            $(".cancelReason-td").removeClass("hidden");
        }else if(_value=="5"){  //反欺诈
            $(".reconsiderReason-td").removeClass("hidden");
        } 
    }
    /**
     * 根据infoDTO里whetherFraud字段展示record处理状态-queueContactResultEnums
     * @param {*} whetherFraud infoDTO里whetherFraud字段
     * @param {*} oldStates 处理状态
     * @param {*} cooperationFlag 合作方标识 17C。。。。
     */
    dealStates(oldStates){
        // console.log(oldStates)
        let newStates=[];
        if(!oldStates || oldStates.length<=0){
            return;
        }
        for(let i=0;i<oldStates.length;i++){
            let oldStates_i=oldStates[i];
            /* if(oldStates_i.value==4||oldStates_i.value==12||oldStates_i.value==8||oldStates_i.value==11||oldStates_i.value==5||oldStates_i.value==7||oldStates_i.value==9){ //展示 取消、跟进、完成（通过）、拒绝,可疑  ||oldStates_i.value==5||oldStates_i.value==7
            } */
            newStates.push(oldStates_i);
            if(oldStates_i.value==4){
                oldStates_i.displayName='通过';
            }
            if(oldStates_i.value==12){
                oldStates_i.displayName='退回补件';
            }
        }
        return newStates;
    }
    //合作方切换
    @action channelChange(event){
        let _thisVal=$(event.target).val();
        this.setState({
            businessType:_thisVal
        },()=>{
            this.getCount();  //处理条数
        })
    }
    // 撤回原因多选框多选事件
    antSelectHandle(value,option){
        this.setState({
            select_withdrawReasonEnums:`${value}`
        })
    }
    //有误文件	
    mistakeFileHandle=(value)=>{
        console.log(`${value}`,value)
        this.setState({
            mistakeFileSelected:value
        })
    }
    //原因
    reconsiderReasonHandle=(val,option)=>{
        let _props=option.props;
        let id=_props.data_id;
        let rejectReason=_props.data_rejectReason;
        console.log(rejectReason)
        this.setState({
            reconsiderReasonId:id,
            RejectReason:rejectReason
        })
    }
    //商户课程存疑
    standby2 = e => {
        this.setState({
            standby2: e.target.checked,
        });
      };
    // 产品号切换
    cooperationFlagChange=(e)=>{
        let _selected=$(e.target).find('option:selected').attr('value');
        let AllCooperation=this.cooperationListStore.AllCooperation;
        let newAllCooperation=[];
        let AllCooperation_arr=Object.keys(AllCooperation);
        if(AllCooperation_arr.length<=0){
            console.log('获取所有合作方列表为空！');
            return;
        }
        if(_selected=='2C'){
            for (let i = 0; i < AllCooperation_arr.length; i++) {
                const element = AllCooperation_arr[i];
                if(element=='运营商3C分期' || element=='教育分期'){
                    newAllCooperation.push(element)
                }
            }
        }else if(_selected=='2C1'){
            for (let i = 0; i < AllCooperation_arr.length; i++) {
                const element = AllCooperation_arr[i];
                if(element=='医疗美容分期'){
                    newAllCooperation.push(element);
                }
            }
        }else if(_selected=='2C2'){
            for (let i = 0; i < AllCooperation_arr.length; i++) {
                const element = AllCooperation_arr[i];
                if(element=='生活美容分期'){
                    newAllCooperation.push(element);
                }
            }
        }
        this.setState({
            newAllCooperation:newAllCooperation,
            cooperationFlag:_selected
        },()=>{
            this.getCount();  //处理条数
        })
    }
    //数组去重
    unique = (arr) => {            
        for(var i=0; i<arr.length; i++){
            for(var j=i+1; j<arr.length; j++){
                if(arr[i].id==arr[j].id){         //第一个等同于第二个，splice方法删除第二个
                    arr.splice(j,1);
                    j--;
                }
            }
        }
        return arr;
    }

    fuzzyChangeLoanNo=(value)=>{
        this.setState({
            FuzzyLoanNo:value
        })
    }
    fuzzyChangePhone=(value)=>{
        this.setState({
            FuzzyPhone:value
        })
    }
    //合同号模糊搜索
    fuzzySearchLoanNo=(val)=>{
        if(!val.replace(/\s/g,'')){
            return;
        }
        let FuzzyArray=cpCommonJs.getfuzzyData({queryLoan:val},"/node/manual/blurry");
        this.setState({
            FuzzyArray:FuzzyArray
        })
    }
    //电话号码模糊搜索
    fuzzySearchPhone=(val)=>{
        if(!val.replace(/\s/g,'')){
            return;
        }
        let FuzzyArray=cpCommonJs.getfuzzyData({queryPhone:val},"/node/manual/blurry");
        this.setState({
            FuzzyArray:FuzzyArray
        })
    }
    render() {
        let {FuzzyArray=[]}=this.state;
        const infoDTO=cpCommonJs.opinitionObj(this.state.infoDTO);
        let platformFlag=infoDTO.platformFlag;//接口返回的平台或第三方标识
        let cooperationFlag=infoDTO.cooperationFlag;//接口合作方标识
        let count=this.cooperationCountStore.cooperationCount;
        let XYH_IdentityInfo=cpCommonJs.opinitionObj(this.userinfoStore.XYH_IdentityInfo);
        let contractDocFile=cpCommonJs.opinitionArray(XYH_IdentityInfo.contractDocFile);//合同文件
        let riskControlInfo=cpCommonJs.opinitionObj(XYH_IdentityInfo.riskControlInfo);  //反欺诈信息
        let loanInfo=cpCommonJs.opinitionObj(XYH_IdentityInfo.loanInfo);  //贷款信息
        let showPhotos=commonJs.is_obj_exist(loanInfo.showPhotos);  //showPhotos=true就表示老订单展示照片，showPhotos=false就是新订单，不展示手术前后照了
        let searchResult = {};
        Object.assign(searchResult,this.state.searchResult);//小雨花的详情接口总数据
        let fraudReason=searchResult.fraudReason?searchResult.fraudReason:[];
        let NewfrDescArr = [];
        if(riskControlInfo.frDesc){
            let frDescArr = riskControlInfo.frDesc.split(',');
            frDescArr.forEach(e => {
                if(e.indexOf('需转反欺诈') != -1){
                    const ele = e.split('(需转反欺诈)')[0];
                    fraudReason.push({
                        rejectReason:ele,
                        type:'MANUAL-FRAUD',
                        id:ele
                    })
                    NewfrDescArr.push(ele);
                } 
            });
        }
        //去重
        fraudReason = this.unique(fraudReason);
        let caseRecordResponseDTO=cpCommonJs.opinitionArray(searchResult.caseRecordResponseDTO); //案件记录
        // let recordInfoDTOS=cpCommonJs.opinitionArray(searchResult.infoDTO); //审核记录
        let userInfo=cpCommonJs.opinitionObj(XYH_IdentityInfo.userInfo);  //用户信息
        let options=[];
        let _businessType=infoDTO.businessType;
        let showGoodsModify=XYH_IdentityInfo.showGoodsModify;  //showGoodsModify 为true代表此单由渠道引流过来，退回补件时显示 商品信息修改；false不显示 商品信息修改
        if(_businessType){
            if(_businessType=='运营商3C分期'){  //2C
                options = [
                    { value: 'protocolFile,furtherFile,contractPhoneNo', label: '套餐协议/合约手机号' },
                ];
            }else if(_businessType=='教育分期'){  //2C
                options = [
                    { value: 'contractDocFileId', label: '合同文件' },
                    { value: 'groupPhotoFileId', label: '合照' },
                    { value: 'probativeFileId', label: '学历/工作' },
                    { value: 'parentalProofFileId', label: '亲子证明照' },
                    { value: 'otherFileId', label: '其他文件' }
                ];
            }else if(_businessType=='医疗美容分期' || _businessType=='生活美容分期'){  //2C1 & 2C2
                if(infoDTO.step ==2){   //复审
                    if(showPhotos){
                        options = [
                            { value: 'photosBeforeSurgery', label: '手术前照片' },
                            { value: 'photosAfterSurgery', label: '手术后照片' },
                            { value: 'photosBeforeBodySurgery', label: '术前手术部位照' },
                            { value: 'photosAfterBodySurgery', label: '术后手术部位照' },
                            { value: 'surgicalSheet', label: '手术单' },
                        ];
                    }else{
                        options = [
                            { value: 'surgicalSheet', label: '手术单' },
                        ];
                    }
                }else{
                    options = [
                        // { value: 'productConfirmFileId', label: '商品交付确认书' },
                        // { value: 'paymentVoucherFileId', label: '首付凭证' },
                        { value: 'siteProveFileId', label: '现场照片' },
                        { value: 'surgeryConsentFileId', label: '手术项目同意书' },
                        { value: 'repaymentVoucherFileId', label: '还款来源凭证' },
                        { value: 'otherFileId', label: '其它文件' },
                    ];
                    if(showGoodsModify){
                        options.push({ value: 'goodsModify', label: '商品信息修改' });
                    }
                }
            }
        }
        
        let {showOpraRecord,newAllCooperation=[]}=this.state;
        let reconsideration=cpCommonJs.opinitionObj(XYH_IdentityInfo.reconsideration);
        return (
            <div className="content" id="content">
            {/* 合作方列表 */}
                <PartnerList />  
                {/* 处理条数 */}
                <div className="topBundleCounts gray-bar mt20">
                    <b className="left ml40">累计进件<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.totalIn)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">累计处理完成<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.totalComplete)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">未处理<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.totalUncomplete)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">绑定中<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.totalBind)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">今日已完成<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.todayCompleteTotal)}</span><span className="gray-font">条</span></b>
                </div>  
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar check-search clearfix mt20 overflow-auto" data-resetstate='businessType,FuzzyLoanNo,FuzzyPhone'>
                    <select name="" id="" className="select-gray left mr10 cooperationFlag" onChange={this.cooperationFlagChange.bind(this)}>
                        <option value="" data-optionId="0" hidden>请选择产品号</option>
                        <option value="2C" data-optionId="">2C</option>
                        <option value="2C1" data-optionId="">2C1</option>
                        <option value="2C2" data-optionId="">2C2</option>
                    </select>
                    <select name="" id="" className="select-gray left mr10 chaenel" onChange={this.channelChange.bind(this)}>
                        <option value="" data-optionId="0" hidden>请选择合作方</option>
                        <option value="" data-optionId="">全部</option>
                        {
                            newAllCooperation.length>0 ? newAllCooperation.map((repy,i)=>{
                                return <option value={commonJs.is_obj_exist(repy)} key={i}>{commonJs.is_obj_exist(repy)}</option>
                            }):<option value=""></option>
                        }
                    </select>
                    <div className="left fuzzyLoanNumber mr10" style={{"width":"250px"}}>
                        <Select
                            showSearch
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="合同号"
                            onChange={this.fuzzyChangeLoanNo}
                            onSearch={this.fuzzySearchLoanNo}
                            value={this.state.FuzzyLoanNo}
                        >
                            {
                                FuzzyArray.map((rpy,i)=>{
                                    return <Option value={rpy.loanNumber} key={i}>{rpy.loanNumber}</Option>
                                })
                            }
                        </Select>
                    </div>
                    {/* <input type="text" name="" placeholder="手机号码" className="input left mr10 phoneNo" /> */}
                    <div className="left fuzzyPhone mr10" style={{"width":"185px"}}>
                        <Select
                            showSearch
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="电话号码"
                            value={this.state.FuzzyPhone}
                            onChange={this.fuzzyChangePhone}
                            onSearch={this.fuzzySearchPhone}
                        >
                            {
                                FuzzyArray.map((rpy,i)=>{
                                    return <Option value={rpy.phone} key={i}>{rpy.phone}</Option>
                                })
                            }
                        </Select>
                    </div>
                    <input type="text" name="" placeholder="姓名" className="input left mr20 name" />
                    <button className="left reset" onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                    <button className="right mr15 search-next-btn" onClick={this.searchNext.bind(this)}>搜索下一条</button>
                    <button className="right mr15 search-btn" onClick={this.searchHandle.bind(this,"SEARCH",false)}>搜索</button>
                </div>
                {/* 搜索条件 end */}
                <div className="mt10">
                    <RepayInfoBar platformFlag={platformFlag} cooperationFlag={cooperationFlag} />  {/* 贷款信息条展示 */}
                </div>
                <div className="mt20 clearfix">
                    <div className="left cont-left content-toggle  relative">
                        {/* tit-shadow */}
                        <div className="bar title-box Csearch-left-page clearfix">
                            <ul className="left ml10 mt5 nav">
                                <li className="on" data-id="0" onClick={this.changeLeftCP.bind(this,0,null)}>客户信息</li>
                                <li data-id="XYH_1" onClick={this.changeLeftCP.bind(this,'XYH_1',null)}>订单信息</li>
                                <li data-id="XYH_2" onClick={this.changeLeftCP.bind(this,'XYH_2',null)}>资料信息</li>
                                <li data-id="XYH_3" onClick={this.changeLeftCP.bind(this,'XYH_3',null)}>风控信息</li>
                                <li data-id="XYH_4" onClick={this.changeLeftCP.bind(this,'XYH_4',null)}>操作记录</li>
                                <li data-id="XYH_5" onClick={this.changeLeftCP.bind(this,'XYH_5',null)}>历史订单</li>
                                {
                                    reconsideration.reconsiderationReason?
                                    <li data-id="XYH_6" onClick={this.changeLeftCP.bind(this,'XYH_6',null)}>复议资料</li>:''
                                }
                            </ul>
                        </div>
                        <div className="mt10">
                            {this.state.lef_page}
                        </div>
                    </div>
                    <div className="right cont-right content-toggle">
                        {/* 基本信息 */}
                        <div className="blue-bar relative">
                            <i className="triangle_left absolute"></i>
                            <div className="base-msg clearfix">
                                <dl>
                                    <dt>姓名：</dt>
                                    <dd title={commonJs.is_obj_exist(userInfo.realName)}>{commonJs.is_obj_exist(userInfo.realName)}</dd>
                                </dl>
                                <dl>
                                    <dt>性别：</dt>
                                    <dd title={commonJs.is_obj_exist(userInfo.sexChinese)}>{commonJs.is_obj_exist(userInfo.sexChinese)}</dd>
                                </dl>
                                <dl>
                                    <dt>身份证号码：</dt>
                                    <dd title={commonJs.is_obj_exist(userInfo.certNo)}>{commonJs.is_obj_exist(userInfo.certNo)}</dd>
                                </dl>
                                <dl>
                                    <dt>手机号码：</dt>
                                    <dd title={commonJs.is_obj_exist(userInfo.mobileNo)}>{commonJs.is_obj_exist(userInfo.mobileNo)}</dd>
                                </dl>
                                <dl>
                                    <dt>信用评级：</dt>
                                    <dd title={commonJs.is_obj_exist(riskControlInfo.creditRating)}>{commonJs.is_obj_exist(riskControlInfo.creditRating)}</dd>
                                </dl>
                            </div>
                        </div>
                        {/* record list */}
                        <div className="toggle-box mt5">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={commonJs.content_toggle.bind(this)}>
                            案件记录
                                <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                            </h2>
                            <div className='bar mt3'>
                                <table className="pt-table commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                    <tbody>
                                        {
                                        caseRecordResponseDTO.length>0 ? caseRecordResponseDTO.map((repy,index)=>{
                                            return <tr key={index}>
                                                <td className="no-padding-left">
                                                    <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                        <tbody>
                                                            <tr>
                                                                <td width="20%" title={commonJs.is_obj_exist(repy.caseType)}>{commonJs.is_obj_exist(repy.caseType)}</td>
                                                                <td width="40%" title={commonJs.is_obj_exist(repy.createdBy)}>{commonJs.is_obj_exist(repy.createdBy)}</td>
                                                                <td width="40%" title={commonJs.is_obj_exist(repy.createdAt)}>{commonJs.is_obj_exist(repy.createdAt)}</td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="3" className="short-border-td">
                                                                    <div className="short-border"></div>
                                                                    <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            }):<tr><td className="gray-tip-font">暂未查到相关数据...</td></tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Record */}
                        <div className="mt10">
                            <div className="bar clearfix bar-tit pl20 pr20 toggle-tit">案件记录</div>
                            <table className="radius-tab mt3 CPS-edit-div QrecordInfo caseRcord flow-auto" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                <tbody>
                                    <tr>
                                        <th className="no-border" width="50%">案件类别</th>
                                        <th className="no-border"></th>
                                    </tr>
                                    <tr>
                                        <td>
                                            <select className="select-gray caseType" name="" id="" style={{"width":"95%"}}>
                                                <option value="" data-show="no" hidden>请选择案件类别</option>
                                                <option value="影像资料核查">影像资料核查</option>
                                                <option value="网查负面信息">网查负面信息</option>
                                                <option value="电话核查">电话核查</option>
                                            </select>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2">
                                            <span className="detail-t">详情</span>
                                        </td>
                                    </tr>
                                    <tr className="recordDetail">
                                        <td colSpan="2">
                                            <textarea name="" id="" cols="30" rows="10" className="commu-area textarea caseContent" style={{"width":"95%","height":"80px"}}></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2">
                                            <button className="left block btn-blue" onClick={this.saveRecord.bind(this)}>保存</button>
                                            <button className="btn-white left block ml20" onClick={this.cancleSaveRecord.bind(this)}>取消</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {
                            showOpraRecord?
                            <div className="mt10">
                                <div className="bar clearfix bar-tit pl20 pr20 toggle-tit">审核</div>
                                <table className="radius-tab mt3 CPS-edit-div QrecordInfo checkRecord flow-auto" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                    <tbody>
                                        <tr>
                                            <th className="no-border" width="20%">处理结果</th>
                                            <th className="no-border rejectCauseDictionaryInfoDTOS-td hidden" data-hide='yes' width="20%">拒绝原因</th>
                                            <th className="no-border cancelReason-td hidden" data-hide='yes' width="20%">取消原因</th>
                                            <th className="no-border mistakeFile-td hidden" data-hide='yes' width="40%">有误文件</th>
                                            <th className="no-border reconsiderReason-td" data-hide='yes' width="30%">原因</th>
                                            <th className="no-border"></th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <select className="select-gray queueContactResultEnums" name="" id="" style={{"width":"95%"}} onChange={this.rejectSelect.bind(this)}>
                                                    <option value="" data-show="no" hidden>请选择处理结果</option>
                                                    {
                                                        (this.state.queueContactResultEnums && this.state.queueContactResultEnums.length>0)?this.state.queueContactResultEnums.map((repy,i)=>{
                                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                            <td className="rejectCauseDictionaryInfoDTOS-td hidden" data-hide='yes'>
                                                <select className="select-gray rejectCauseDictionaryInfoDTOS" name="" id="" style={{"width":"95%"}}>
                                                    <option value="" data-show="no" hidden>请选择拒绝原因</option>
                                                    {
                                                        (this.state.rejectCauseDictionaryInfoDTOS && this.state.rejectCauseDictionaryInfoDTOS.length>0)?this.state.rejectCauseDictionaryInfoDTOS.map((repy,i)=>{
                                                            return <option key={i} data-type={commonJs.is_obj_exist(repy.type)} data-id={commonJs.is_obj_exist(repy.id)}>{commonJs.is_obj_exist(repy.rejectReason)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                            <td className="cancelReason-td hidden" data-hide='yes'>
                                                <select className="select-gray cancelReason" name="" id="" style={{"width":"95%"}}>
                                                    <option value="" data-show="no" hidden>请选择取消原因</option>
                                                    {
                                                        (this.state.cancelReason && this.state.cancelReason.length>0)?this.state.cancelReason.map((repy,i)=>{
                                                            return <option key={i} data-type={commonJs.is_obj_exist(repy.type)} data-id={commonJs.is_obj_exist(repy.id)}>{commonJs.is_obj_exist(repy.rejectReason)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                            <td className="mistakeFile-td hidden" data-hide='yes'>
                                                <Select
                                                    value={this.state.mistakeFileSelected}
                                                    onChange={this.mistakeFileHandle}
                                                    defaultValue="请选择有误文件"
                                                    style={{ width: '100%' }}
                                                    mode="multiple"
                                                >
                                                {
                                                    options.map((repy,i)=>{
                                                        return <Option value={repy.value} key={i}>{repy.label}</Option>
                                                    })
                                                }
                                                </Select>
                                            </td>
                                            {
                                                riskControlInfo.frDesc?<td className="reconsiderReason-td hidden" data-hide='yes'>
                                                <Select
                                                        value={this.state.newReconsiderReasonId}
                                                        // onSelect={this.reconsiderReasonHandle}
                                                        // defaultValue="请选择原因"
                                                        onChange={(v,e)=>{
                                                            console.log(NewfrDescArr)
                                                            let reconsiderReasonId = [];
                                                            let RejectReason = [];
                                                            let newReconsiderReasonId = [];
                                                            let withdrawOrCancelReason = [];
                                                            e.forEach(ele=>{
                                                                RejectReason.push(ele.props.children);
                                                                newReconsiderReasonId.push(ele.props.value);
                                                                if(typeof ele.props.value == 'number'){
                                                                    reconsiderReasonId.push(ele.props.value);
                                                                }
                                                            })
                                                            //console.log(newReconsiderReasonId,reconsiderReasonId);
                                                            this.setState({
                                                                newReconsiderReasonId:newReconsiderReasonId,
                                                                reconsiderReasonId:reconsiderReasonId.join(','),
                                                                RejectReason:RejectReason.join(','),
                                                                withdrawOrCancelReason:withdrawOrCancelReason.join(',')
                                                            })
                                                        }}
                                                        style={{ width: '100%' }}
                                                        mode="multiple"
                                                        // isMulti
                                                    >
                                                    {
                                                        fraudReason.map((repy,i)=>{
                                                            // console.log(repy)
                                                            return <Option data_id={repy.id} value={repy.id} data_rejectReason={repy.rejectReason} key={i}>{repy.rejectReason}</Option>
                                                        })
                                                    }
                                                </Select>
                                                </td>:<td className="reconsiderReason-td hidden" data-hide='yes'>
                                                    <Select
                                                        value={this.state.RejectReason}
                                                        onSelect={this.reconsiderReasonHandle}
                                                        defaultValue="请选择原因"
                                                        style={{ width: '100%' }}
                                                        // isMulti
                                                    >
                                                    {
                                                        fraudReason.map((repy,i)=>{
                                                            // console.log(repy)
                                                            return <Option data_id={repy.id} value={repy.id} data_rejectReason={repy.rejectReason} key={i}>{repy.rejectReason}</Option>
                                                        })
                                                    }
                                                    </Select>
                                                </td>
                                            }
                                            <td>
                                                <Checkbox onChange={this.standby2}>商户课程存疑</Checkbox>
                                            </td>
                                        </tr>
                                        {
                                            (infoDTO.cooperationFlag!="24A"&&infoDTO.cooperationFlag!="9F1")?
                                            <tr>
                                                <td colSpan="6">
                                                    <span className="detail-t">详情</span>
                                                </td>
                                            </tr>:<tr><td style={{"height":"0"}}></td></tr>
                                        }
                                        <tr className="recordDetail">
                                            <td colSpan="6">
                                                <textarea name="" id="" cols="30" rows="10" className="commu-area textarea caseContent" style={{"width":"96%","height":"80px"}}></textarea>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="6">
                                                <button className="left block btn-blue" onClick={this.saveCheck.bind(this)}>保存</button>
                                                <button className="btn-white left block ml20" onClick={this.cancleSaveRecord.bind(this)}>取消</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>:''
                        }
                    </div>
                </div>
            </div>
        )
    }
};

export default CheckQueue;  //ES6语法，导出模块