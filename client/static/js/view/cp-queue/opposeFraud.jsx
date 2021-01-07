// 反欺诈  cp-portal
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
import axios from '../../axios';
var commonJs=new CommonJs;
import DealAmount from '../cp-module/dealAmount';  //处理条数 
import BaseUserInfoBar from '../cp-module/baseUserInfoBar';  //处理条数 
import RepayInfoBar from '../cp-module/repayInfoBar';  //贷款信息展示
import FraudDes from '../cp-module/fraudDes';  //反欺诈描述
import PartnerList from '../cp-module/partnerList';  //合作方列表 
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import Channel from '../cp-module/channel'; //选择合作方select
import RecordList from '../cp-module/recordList';  //record展示
import RepaymentMsg29A from '../cp-module/repaymentMsg29A'; //29A 增加还款信息表现
// 左侧页面
import UserMsgTerrace from '../cp-module/userMsgTerrace';  //详情-平台
import FileTerrace from '../cp-search/fileTerrace';  //=>附件-平台

import UserMsgThird from '../cp-module/userMsgThird';   //详情-第三方
import FileThird from '../cp-search/fileThird';  //=>附件-第三方

import ShopMsgXYH from '../cp-module/shopMsgXYH';//详情-小雨花
import FileXYH from '../cp-search/fileXYH';  //=>附件-小雨花
import FileReconsider from '../cp-search/fileReconsider';  //=>复议资料-小雨花
import OrderInfo from '../cp-search/orderInfo';  //=>订单信息-小雨花 
import RiskInfo from '../cp-search/riskInfo';  //=>风控信息-小雨花   
import OperateList from '../cp-search/operateList';  //=>操作记录-小雨花
import HistoryOrder from '../cp-search/historyOrder';  //=>历史订单-小雨花

import GuaranteeRapayList from '../../view/module/guaranteeRapayList'; //担保费还款计划table展示
import DeductionRecordsList from '../../view/module/deductionRecordsList'; //担保费还款计划table展示

import ModelVisualization from '../cp-module/modelVisualization';//反欺诈模型可视化

import {observer,inject} from "mobx-react"; 
import { observable, action, computed ,configure,runInAction} from "mobx";
import { Checkbox,Select,Button,Modal } from 'antd';
const { Option } = Select;

@inject('allStore') @observer
class OpposeFraud extends React.Component{
    constructor(props){
        super(props);
        this.store=this.props.allStore.UserinfoStore;  //第三方用户详情
        this.state={
            lef_page:"",  //左边页面组件
            condition:{},  //存放搜索条件
            showOpraRecord:false,  //是否展示record操作框 ture展示，false隐藏
            resetFuzzyVal:false,  //是否清空模糊查询框的值
            visible:false,
            deductionRecordsList:{},
        }
    }
    @action componentDidMount(){
        this.store.restoreUserInfo();
        this.changeLeftCP(0);
        commonJs.reloadRules();
        this.props.allStore.CooperationList.getAllCooperations("/node/fraud/getAllCooperationCount");  //获取顶部合作方数据列表
        this.props.allStore.CooperationCountStore.getCooperationCount("/node/fraud/count");  //处理条数
    }
    @action UNSAFE_componentWillReceiveProps(nextProps){
        //风控信息 关联数据合同号点击展示对应详情
        this.store.restoreUserInfo();
        let riskInfoCurrentLoanNo=nextProps.location.query.riskInfoCurrentLoanNo;
        if(riskInfoCurrentLoanNo){
            this.setState({
                FuzzyLoanNo:riskInfoCurrentLoanNo
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
        var left_page="";
        let platformFlag=this.state.infoDTO?this.state.infoDTO.platformFlag:"";//接口返回的平台或第三方标识
        let loanNumber=this.state.infoDTO?this.state.infoDTO.loanNumber:"";//接口返回的合同号
        this.userinfoStore = this.store;
        if(!platformFlag){
            platformFlag="default"
        }
        let pageParm={
            userPage:{
                "TH":<UserMsgThird />,
                "PF":<UserMsgTerrace />,
                "XYH":<ShopMsgXYH />,
                "default":<UserMsgTerrace />
            },
            filePage:{
                "TH":<FileThird />,
                "PF":<FileTerrace loanNumber={loanNumber} />,
                "XYH":<FileXYH />,
                "default":<FileTerrace />
            },
            Guarantee:{
                "PF":<div><GuaranteeRapayList that={this} pageFlag="CP2F" getGuranteeList={this.getGuranteeList}  guaranteeFeePayInfoList={this.state.guaranteeFeePayInfoList} /><DeductionRecordsList 
                            pageFlag="CP2F"
                            that={this} 
                    /></div>
            }
            
        };
        switch (index){
            case 0:
                left_page=pageParm.userPage[platformFlag];
                break;
            case 1:
                left_page=pageParm.filePage[platformFlag];
                break;
            case 5:
                left_page=pageParm.Guarantee[platformFlag];
                break;
            case 'XYH_1':
                left_page=<OrderInfo/>;
                break;
            case 'XYH_2':
                left_page=<FileXYH />;
                break;
            case 'XYH_3':
                left_page=<RiskInfo />;
                break;
            case 'operateList':
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
    // 搜索
    @action searchHandle(queueReloadEnum,isOldCondition){
        this.changeLeftCP(0);
        let _parem={};  //请求参数
        this.cancleSaveRecord();
        if(isOldCondition){  //保存recore时重新调取搜索接口
            _parem=this.state.condition;
        }else{
            let _chenel=$(".check-search .chaenel option:selected").val();
            let _orderNumber=$(".check-search .orderNumber").val();  //订单号
            let _loanNumber=this.state.FuzzyLoanNo;  //合同号
            let _phoneNo=this.state.FuzzyPhone;  //手机号
            let _name=$(".check-search .name").val();  //姓名
            if(!_orderNumber && !_loanNumber && !_phoneNo && !_name){
                alert("请输入任一搜索条件！");
                return;
            }
            if(_chenel)_parem.cooperationFlag=_chenel;
            if(_orderNumber){
                _orderNumber=_orderNumber.replace(/\s/g,"");
                _parem.orderNumber=_orderNumber;  //跟人工审核queue接受参数不一样
            }
            if(_loanNumber){
                _loanNumber=_loanNumber.replace(/\s/g,"");
                _parem.loanNumber=_loanNumber;
            }
            if(_phoneNo && !(/^1\d{10}$/.test(_phoneNo))){
                alert("请输入正确的手机号码！");
                return;
            }
            if(_phoneNo){
                _phoneNo=_phoneNo.replace(/\s/g,"");
                _parem.phone=_phoneNo;
            }
            if(_name){
                _name=_name.replace(/\s/g,"");
                _parem.name=_name;
            }
            this.setState({
                condition:_parem
            });
        }
        _parem.queueReloadEnum=queueReloadEnum;
        this.searchCommonFn(_parem,queueReloadEnum);
    }
    // 搜索公共方法  _parem 请求参数
    @action searchCommonFn(_parem,queueReloadEnum){
        let that=this;
        $.ajax({
            type:"get", 
            url:"/node/fraud/search", 
            async:false,
            dataType: "JSON", 
            timeout : 60000, //超时时间设置，单位毫秒
            data:_parem, 
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
                       infoDTO:{},
                       rejectCauseDictionaryInfoDTOS:{},
                       queueContactResultEnums:{},
                       cancelReason:{},
                       recordInfoDTOS:[],
                       fraudMsg:{}, //反欺诈描述
                       persenChecRecordkDTO:[],  //人工审核案列
                   },()=>{
                       that.store.restoreUserInfo();
                   })
                    return;
                }
                let _data=res.data;
               let _infoDTO=_data.infoDTO?_data.infoDTO:{};
               let recordInfoDTOS=cpCommonJs.opinitionArray(_data.recordInfoDTOS);
               //更新userinfo store  ---
               that.store.orderNo=_infoDTO.orderNo;
               that.store.loanNo=_infoDTO.loanNumber;
               that.store.cooperationFlag=_infoDTO.cooperationFlag;
               that.store.fromFlag=_infoDTO.fromFlag;
               that.store.platformFlag=_infoDTO.platformFlag;
               that.store.customerId=_infoDTO.customerId;
               //---end
               if(_data.bindStatus&&_data.bindStatus=="bind"){
                   alert("当前queue已被"+_data.bindBy+"绑定！");
                   that.setState({
                       showOpraRecord:false
                   })
               }else if(_infoDTO.queueStatusId==1){
                   that.setState({
                       showOpraRecord:true
                   })
               }else{
                   that.setState({
                       showOpraRecord:false
                   })
               }
               let oldQueueContactResultEnums=_data.queueContactResultEnums?_data.queueContactResultEnums:[];
               let newQueueContactResultEnums=that.dealStates(oldQueueContactResultEnums,_infoDTO.platformFlag);
               that.setState({
                  infoDTO:_infoDTO,
                  rejectCauseDictionaryInfoDTOS:_data.rejectCauseDictionaryInfoDTOS?_data.rejectCauseDictionaryInfoDTOS:{}, //拒绝原因 
                  queueContactResultEnums:newQueueContactResultEnums, //处理状态 
                  cancelReason:_data.cancelReason?_data.cancelReason:[], //取消原因 
                  recordInfoDTOS:recordInfoDTOS,  //record记录
               },()=>{
                   queueReloadEnum=="SEARCH"?that.store.getIdentityInfo(that,true):"";
                   queueReloadEnum=="SEARCH"?that.getQueueCase():"";
                   queueReloadEnum=="SEARCH"?that.getFraudMsg():"";
                   that.props.allStore.CooperationList.getAllCooperations("/node/fraud/getAllCooperationCount");  //获取顶部合作方数据列表
                   that.props.allStore.CooperationCountStore.getCooperationCount("/node/fraud/count");  //处理条数
                   that.props.allStore.CommonStore.search_recordInfoDTOS=recordInfoDTOS;
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
    //保存record
    saveRecord(){
        let that=this;
        let _parem={};
        let infoDTO=this.state.infoDTO?this.state.infoDTO:{};
        let _loanNumber=infoDTO.loanNumber;
        _parem.loanNumber=_loanNumber;
        let _queueStatusId=$(".QrecordInfo .queueContactResultEnums option:selected").attr('data-value');
        if(!_queueStatusId){
            alert("请选择处理状态！");
            return;
        }
        _parem.queueStatusId=_queueStatusId;
        let rejectCause=this.state.rejectCause;
        let platformFlag=infoDTO.platformFlag;
        let withdrawOrCancelReasonId=$('.QrecordInfo .rejectCauseDictionaryInfoDTOS option:selected').attr('data-id');
        let withdrawOrCancelReason=$('.QrecordInfo .rejectCauseDictionaryInfoDTOS option:selected').attr('data-rejectReason');
        if(platformFlag=='XYH' && rejectCause && !withdrawOrCancelReasonId){
            alert("请选择拒绝原因！");
            return;
        }
        if(platformFlag=='XYH' && rejectCause && withdrawOrCancelReasonId)_parem.withdrawOrCancelReasonId=withdrawOrCancelReasonId;
        if(platformFlag=='XYH' && rejectCause && withdrawOrCancelReason)_parem.withdrawOrCancelReason=withdrawOrCancelReason;
        if(platformFlag=='XYH'){
            let _cancelReasonId=$(".QrecordInfo .cancelReason option:selected").attr('data-id'); //取消原因-ID
            let _cancelReason=$(".QrecordInfo .cancelReason option:selected").text(); //取消原因-中文
            if(_queueStatusId==8 && !_cancelReasonId){
                alert("请选择取消原因！");
                return;
            }
            if(_queueStatusId==8 && _cancelReasonId){
                _parem.withdrawOrCancelReasonId=_cancelReasonId;
            }
            if(_queueStatusId==8 && _cancelReason && _cancelReason!="请选择取消原因"){
                _parem.withdrawOrCancelReason=_cancelReason;
            }

            let _wrongDetail=this.state.mistakeFileSelected; //有误文件
            if(_queueStatusId==12 && (!_wrongDetail || _wrongDetail.length<=0)){
                alert("请选择有误文件！");
                return;
            }
            if(_queueStatusId==12 && _wrongDetail){
                let _wrongDetail_array=[];
                for(let i=0;i<_wrongDetail.length;i++){
                    _wrongDetail_array.push(_wrongDetail[i]);
                }
                _parem.wrongDetail=_wrongDetail_array.join(',');
            }
            let standby2=this.state.standby2;
            if(standby2){
                _parem.standby2='是';
            }else{
                _parem.standby2='否';
            }
        }
        let _caseContent=$(".QrecordInfo .commu-area").val();
        if(!_caseContent){
            alert("请填写案列详情！");
            return;
        }
        _parem.caseContent=_caseContent;
        console.log(_parem);
        $.ajax({
            type:"post", 
            url:"/node/fraud/saveRecord", 
            async:true,
            dataType: "JSON", 
            data:_parem, 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _data=res.data;
                alert(_data.message);
                that.searchHandle("RELOAD",true);
                that.cancleSaveRecord();
           }
       })
    }
    //搜索下一条
    @action searchNext(){
        this.changeLeftCP(0);
        let that=this;
        let _chenel=$(".check-search .chaenel option:selected").val();
        this.cancleSaveRecord();
        cpCommonJs.clearCondition();
        if(_chenel==0||!_chenel){
            alert("请先选择合作方！");
            return;
        }
        $.ajax({
            type:"get", 
            url:"/node/fraud/next", 
            async:false,
            dataType: "JSON", 
            timeout : 60000, //超时时间设置，单位毫秒
            data:{cooperationFlag:_chenel}, 
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
                       infoDTO:{},
                       rejectCauseDictionaryInfoDTOS:{},
                       queueContactResultEnums:{},
                       cancelReason:{},
                       recordInfoDTOS:[],
                       fraudMsg:{}, //反欺诈描述
                        persenChecRecordkDTO:[],  //人工审核案列
                    },()=>{
                        that.store.restoreUserInfo();
                    })
                    return;
                }
                let _data=res.data;
                let _infoDTO=_data.infoDTO?_data.infoDTO:{};
                //更新userinfo store  ---
                that.store.orderNo=_infoDTO.orderNo;
                that.store.loanNo=_infoDTO.loanNumber;
                that.store.cooperationFlag=_infoDTO.cooperationFlag;
                that.store.fromFlag=_infoDTO.fromFlag;
                that.store.platformFlag=_infoDTO.platformFlag;
                that.store.customerId=_infoDTO.customerId;
                //---end
                if(_infoDTO.bindStatus&&_infoDTO.bindStatus=="bind"){
                    alert("当前queue已被"+_infoDTO.bindBy+"绑定！");
                    that.setState({
                        showOpraRecord:false
                    })
                }else if(_infoDTO.queueStatusId==1){
                    that.setState({
                        showOpraRecord:true
                    })
                }else{
                    that.setState({
                        showOpraRecord:false
                    })
                }
                let oldQueueContactResultEnums=_data.queueContactResultEnums?_data.queueContactResultEnums:[];
                let newQueueContactResultEnums=that.dealStates(oldQueueContactResultEnums,_infoDTO.platformFlag);
                let recordInfoDTOS=cpCommonJs.opinitionArray(_data.recordInfoDTOS);
                that.setState({
                   infoDTO:_infoDTO,
                   rejectCauseDictionaryInfoDTOS:_data.rejectCauseDictionaryInfoDTOS?_data.rejectCauseDictionaryInfoDTOS:{}, //拒绝原因 
                   queueContactResultEnums:newQueueContactResultEnums, //处理状态 
                   cancelReason:_data.cancelReason?_data.cancelReason:[], //取消原因
                   recordInfoDTOS:recordInfoDTOS,  //record记录
                   condition:{
                        cooperationFlag:_chenel,
                        loanNumber:_data.infoDTO?_data.infoDTO.loanNumber:"",
                    }
                },()=>{
                   that.store.getIdentityInfo(that,true);
                   that.getQueueCase();
                   that.getFraudMsg();
                   that.props.allStore.CooperationList.getAllCooperations("/node/fraud/getAllCooperationCount");  //获取顶部合作方数据列表
                   that.props.allStore.CooperationCountStore.getCooperationCount("/node/fraud/count");  //处理条数
                   that.props.allStore.CommonStore.search_recordInfoDTOS=recordInfoDTOS;
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
    
    //获取人工审核案列展示
    getQueueCase(){
        let that=this;
        let infoDTO=this.state.infoDTO;
        $.ajax({
            type:"get", 
            url:'/node/record/manualQueueRecord', 
            async:true,
            dataType: "JSON", 
            data:{
                loanNumber:infoDTO.loanNumber,
                orderNo:infoDTO.orderNo,
                type:infoDTO.cooperationFlag
            },
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        persenChecRecordkDTO:[]
                    })
                }
                var _data=res.data;
                that.setState({
                    persenChecRecordkDTO:_data.checkQueueRecordInfoDTOS?_data.checkQueueRecordInfoDTOS:[]
                })
           }
       })
    }
    //反欺诈信息加载
    getFraudMsg(){
        let that=this;
        let infoDTO=this.state.infoDTO;
        $.ajax({
            type:"get", 
            url:'/node/manual/loadFraudInfo', 
            async:true,
            dataType: "JSON", 
            data:{
                loanNumber:infoDTO.loanNumber
            },
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        fraudMsg:{}
                    })
                }
                var _data=res.data;
                that.setState({
                    fraudMsg:_data.fraudAssociateInfoDTO?_data.fraudAssociateInfoDTO:{}
                })
           }
       })
    }
    
    //合作方切换
    channelChange(obj){
        let routerHash=this.props.location?this.props.location.pathname:"";
        if(routerHash=="/personCheck" || routerHash=="/opposeFraud"){  //打开人工审核queue和反欺诈queue时，切换合作方select重新加载处理条数组件
            this.props.allStore.CooperationCountStore.getCooperationCount("/node/fraud/count",{cooperationFlag:obj.value});  //处理条数
        }
    }
    contactResultChange=(e)=>{
        $(".rejectCauseDictionaryInfoDTOS-td,.mistakeFile-td,.cancelReason-td").addClass('hidden');
        $(".rejectCauseDictionaryInfoDTOS-td,.mistakeFile-td,.cancelReason-td").find('option').removeProp('selected');
        $(".rejectCauseDictionaryInfoDTOS-td,.mistakeFile-td,.cancelReason-td").find('option[value=0]').prop('selected',true);
        this.setState({
            rejectCause:false,
            mistakeFileSelected:[],
        })
        let _val=$(e.target).find('option:selected').attr('data-value');
        if(_val==11){
            this.setState({
                rejectCause:true
            })
        }else if(_val=="11"){  //拒绝
            $(".rejectCauseDictionaryInfoDTOS-td").removeClass("hidden");
        }else if(_val=="12"){  //信息有误
            $(".mistakeFile-td").removeClass("hidden");
        }else if(_val=="8"){  //取消
            $(".cancelReason-td").removeClass("hidden");
        }
    }
    cancleSaveRecord=()=>{
        cpCommonJs.cancleSaveRecord();
        this.setState({
            rejectCause:false,
            mistakeFileSelected:[],
        })
    }
    //商户课程存疑
    standby2 = e => {
        this.setState({
            standby2: e.target.checked,
        });
      };
      //有误文件	
      mistakeFileHandle=(value)=>{
          this.setState({
              mistakeFileSelected:value
          })
      }
      /**
     * 根据infoDTO里whetherFraud字段展示record处理状态-queueContactResultEnums
     * @param {*} whetherFraud infoDTO里whetherFraud字段
     * @param {*} oldStates 处理状态
     * @param {*} cooperationFlag 合作方标识 17C。。。。
     */
    dealStates(oldStates,platformFlag){
        let newStates=[];
        if(!oldStates || oldStates.length<=0){
            return;
        }
        if(platformFlag=='XYH'){
            for(let i=0;i<oldStates.length;i++){
                let oldStates_i=oldStates[i];
                if(oldStates_i.value==4){
                    oldStates_i.displayName='通过';
                }
                if(oldStates_i.value==12){
                    oldStates_i.displayName='退回补件';
                }
                newStates.push(oldStates_i);
            }
        }else{
            for(let i=0;i<oldStates.length;i++){
                let oldStates_i=oldStates[i];
                if(oldStates_i.value!=8 && oldStates_i.value!=12){
                    newStates.push(oldStates_i);
                }
            }
        }
        return newStates;
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
        let FuzzyArray=cpCommonJs.getfuzzyData({queryLoan:val},"/node/fraud/blurry");
        this.setState({
            FuzzyArray:FuzzyArray
        })
    }
    //电话号码模糊搜索
    fuzzySearchPhone=(val)=>{
        if(!val.replace(/\s/g,'')){
            return;
        }
        let FuzzyArray=cpCommonJs.getfuzzyData({queryPhone:val},"/node/fraud/blurry");
        this.setState({
            FuzzyArray:FuzzyArray
        })
    }
    render() {
        let {FuzzyArray=[]}=this.state;
        let infoDTO=this.state.infoDTO?this.state.infoDTO:{};
        let recordInfoDTOS=this.state.recordInfoDTOS?this.state.recordInfoDTOS:[];
        let persenChecRecordkDTO=this.state.persenChecRecordkDTO?this.state.persenChecRecordkDTO:[];
        let fraudMsg=this.state.fraudMsg?this.state.fraudMsg:{};
        let XYH_IdentityInfo=cpCommonJs.opinitionObj(this.store.XYH_IdentityInfo);
        let reconsideration=cpCommonJs.opinitionObj(XYH_IdentityInfo.reconsideration);
        let caseRecordResponseDTO=cpCommonJs.opinitionArray(XYH_IdentityInfo.caseRecordResponseDTO);
        let platformFlag=infoDTO.platformFlag;
        let cooperationFlag=infoDTO.cooperationFlag;
        let options=[];
        let _businessType=infoDTO.businessType;
        
        if(_businessType){
            if(_businessType=='运营商3C分期'){
                options = [
                    { value: 'protocolFile,furtherFile,contractPhoneNo', label: '套餐协议/合约手机号' },
                ];
            }else if(_businessType=='教育分期'){
                options = [
                    { value: 'contractDocFileId', label: '合同文件' },
                    { value: 'groupPhotoFileId', label: '合照' },
                    { value: 'probativeFileId', label: '学历/工作' },
                    { value: 'parentalProofFileId', label: '亲子证明照' },
                    { value: 'otherFileId', label: '其他文件' }
                ];
            }else if(_businessType=='医疗美容分期' || _businessType=='生活美容分期'){    //2C1 & 2C2
                options = [
                    // { value: 'productConfirmFileId', label: '商品交付确认书' },
                    { value: 'siteProveFileId', label: '现场照片' },
                    { value: 'surgeryConsentFileId', label: '手术项目同意书' },
                    // { value: 'paymentVoucherFileId', label: '首付凭证' },
                    { value: 'repaymentVoucherFileId', label: '还款来源凭证' },
                    { value: 'otherFileId', label: '其它文件' },
                ];
            }
        }
        return (
            <div className="content" id="content">
                <PartnerList />  {/* 合作方列表 */}
                <div className="mt10">
                    <DealAmount noPending />   {/* 处理条数 */}
                </div>
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar check-search clearfix mt20 overflow-auto" data-resetstate='FuzzyLoanNo,FuzzyPhone'>
                    <Channel onChange={this.channelChange.bind(this)} />  {/* 合作方 */}
                    <input type="text" name="" placeholder="订单号" className="input left mr10 orderNumber" id='orderNumber' />
                    {/* <input type="text" name="" placeholder="合同号" className="input left mr10 loanNumber" /> */}
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
                    <input type="text" name="" placeholder="姓名" className="input left mr20 name" id='name' />
                    <button className="left reset" onClick={commonJs.resetCondition.bind(this,this)} id='reset'>重置</button>
                    <button className="right mr15 search-next-btn" onClick={this.searchNext.bind(this)} id='searchNext'>搜索下一条</button>
                    <button className="right mr15 search-btn" onClick={this.searchHandle.bind(this,"SEARCH",false)} id='searchBtn'>搜索</button>
                </div>
                {/* 搜索条件 end */}
                <div className="mt20">
                    <RepayInfoBar platformFlag={platformFlag} cooperationFlag={infoDTO.cooperationFlag} />  {/* 贷款信息条展示 */}
                </div>
                <div className="mt20 clearfix">
                    <div className="left cont-left content-toggle  relative">
                        {/* tit-shadow */}
                        <div className="bar title-box Csearch-left-page clearfix">
                            <ul className="left ml10 mt5 nav">
                                <li className="on" data-id="0" onClick={this.changeLeftCP.bind(this,0,null)}>
                                    {platformFlag!='XYH'?'详情':'客户信息'}
                                </li>
                                {platformFlag!='XYH' ? <li data-id="1" onClick={this.changeLeftCP.bind(this,1,null)} id='CPFILE'>文件</li>:''}
                                {platformFlag!='XYH' ? <li data-id="2" onClick={cpCommonJs.showListPop.bind(this,this,'repaymentList')} id='CPREPAYMENTLIST'>还款列表</li>:''}
                                {platformFlag!='XYH' ? <li data-id="3" onClick={cpCommonJs.showListPop.bind(this,this,'withholdList')} data-btn-rule="identity:getDebitingInfo" id='CPWITHHOLDLIST'>扣款列表</li>:''}
                                {platformFlag!='XYH' ? <li data-id="4" onClick={cpCommonJs.showListPop.bind(this,this,'historyBorrow')} data-btn-rule="" id='CPHISTORYBOWN'>历史借款记录</li>:''}
                                {platformFlag!=='XYH'&&cooperationFlag=='2F' ? <li data-id="5" onClick={this.changeLeftCP.bind(this,5,null)} id='CPFILE'>担保费</li>:''}

                                {platformFlag=='XYH' ? <li data-id="XYH_1" onClick={this.changeLeftCP.bind(this,'XYH_1',null)} id='CPORDERINFO'>订单信息</li>:''}
                                {platformFlag=='XYH' ? <li data-id="XYH_2" onClick={this.changeLeftCP.bind(this,'XYH_2',null)} id='CPINFOMATION'>资料信息</li>:''}
                                {platformFlag=='XYH' ? <li data-id="XYH_3" onClick={this.changeLeftCP.bind(this,'XYH_3',null)} id='CPPNEUMATIC'>风控信息</li>:''}
                                <li data-id="operateList" onClick={this.changeLeftCP.bind(this,'operateList',null)} id='CPOPRATELIST'>操作记录</li>
                                {platformFlag=='XYH' ? <li data-id="XYH_5" onClick={this.changeLeftCP.bind(this,'XYH_5',null)} id='CPHISTORYORDER'>历史订单</li>:''}
                                {(platformFlag=='XYH'&&reconsideration.reconsiderationReason) ? <li data-id="XYH_6" id='CPCASERECORD' onClick={this.changeLeftCP.bind(this,'XYH_6',null)}>复议资料</li>:''}
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={cpCommonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        <div className="mt10">
                            {this.state.lef_page}
                        </div>
                    </div>
                    <div className="right cont-right content-toggle">
                        <BaseUserInfoBar _customerId={infoDTO.customerId} _orderNo={infoDTO.orderNo}  _loanNo={infoDTO.loanNumber} _stuCheck={infoDTO.stuCheck} />  {/*用户信息条展示-蓝色条*/}
                        {/* 29A 增加还款信息表现 */}
                        {
                            infoDTO.cooperationFlag=="29A"?
                            <div className="mt10"><RepaymentMsg29A /></div>:""
                        }
                        <div className="mt10">
                            <FraudDes data={fraudMsg} />   {/*反欺诈描述*/}
                        </div>
                        <div className="mt10" >
                            <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit">
                                反欺诈图形可视化
                                {

                                    infoDTO.orderNo&&<Button style={{float: 'right',marginTop:'8px'}} type="primary" onClick={()=>this.setState({visible:true})} >查看</Button>
                                }
                            </h2>
                        </div>
                        {/* 人工审核 start */}
                        <div className="toggle-box mt10">
                            <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                                人工审核
                                <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                            </h2>
                            <div className="hidden">
                                <RecordList data={persenChecRecordkDTO} />
                            </div>
                        </div>
                        {/* 人工审核 end */}
                        {
                            (infoDTO.cooperationFlag=='2C'|| infoDTO.cooperationFlag=='2C1'|| infoDTO.cooperationFlag=='2C2')?
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
                            </div>:''
                        }
                        {/* Record */}
                        <div className="mt10">
                            {/* Record */}
                            <table className={this.state.showOpraRecord?"radius-tab mt5 CPS-edit-div QrecordInfo flow-auto":"radius-tab mt5 CPS-edit-div QrecordInfo flow-auto hidden"} cellPadding={0} cellSpacing={0} frameBorder={0}>
                                <tbody>
                                    <tr>
                                        <th className="no-border" width="20%">处理状态</th>
                                        {
                                            (platformFlag=='XYH' && this.state.rejectCause)?
                                            <th className="no-border" width="20%">拒绝原因</th>:<th className="no-border" style={{height:0}}></th>
                                        }
                                        {
                                            platformFlag=='XYH' ?
                                            <th className="no-border cancelReason-td hidden" data-hide='yes' width="20%">取消原因</th>:<th className="no-border" style={{height:0}}></th>
                                        }
                                        {
                                            platformFlag=='XYH' ?
                                            <th className="no-border mistakeFile-td hidden" data-hide='yes' width="20%">有误文件</th>:<th className="no-border" style={{height:0}}></th>
                                        }
                                        <th className="no-border"></th>
                                    </tr>
                                    <tr>
                                        <td>
                                            <select className="select-gray queueContactResultEnums" name="" id="queueContactResultEnums" style={{"width":"95%"}} onChange={this.contactResultChange}>
                                                <option value="0" data-show='no' hidden>请选择</option>  {/* 处理状态 */}
                                                {
                                                    (this.state.queueContactResultEnums && this.state.queueContactResultEnums.length>0)?this.state.queueContactResultEnums.map((repy,i)=>{
                                                        return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                    }):<option></option>
                                                }
                                            </select>
                                        </td>
                                        {
                                            (platformFlag=='XYH' && this.state.rejectCause)?
                                            <td>
                                                <select className="select-gray rejectCauseDictionaryInfoDTOS" name="" id="rejectCauseDictionaryInfoDTOS" style={{"width":"95%"}}>
                                                    <option value="0" data-show='no' hidden>请选择</option> {/* 拒绝原因 */}
                                                    {
                                                        (this.state.rejectCauseDictionaryInfoDTOS && this.state.rejectCauseDictionaryInfoDTOS.length>0)?this.state.rejectCauseDictionaryInfoDTOS.map((repy,i)=>{
                                                            return <option key={i} data-id={commonJs.is_obj_exist(repy.id)} data-rejectReason={commonJs.is_obj_exist(repy.rejectReason)}>{commonJs.is_obj_exist(repy.rejectReason)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>:<td style={{height:0}}></td>
                                        }
                                        {
                                            platformFlag=='XYH'?
                                            <td className="cancelReason-td hidden" data-hide='yes'>
                                                <select className="select-gray cancelReason" name="" id="" style={{"width":"95%"}}>
                                                    <option value="0" data-show="no" hidden>请选择</option>  {/* 取消原因 */}
                                                    {
                                                        (this.state.cancelReason && this.state.cancelReason.length>0)?this.state.cancelReason.map((repy,i)=>{
                                                            return <option key={i} data-type={commonJs.is_obj_exist(repy.type)} data-id={commonJs.is_obj_exist(repy.id)}>{commonJs.is_obj_exist(repy.rejectReason)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>:<td style={{height:0}}></td>
                                        }
                                        {
                                            platformFlag=='XYH'?
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
                                            </td>:<td style={{height:0}}></td>
                                        }
                                        {
                                            platformFlag=='XYH'?
                                            <td>
                                                <Checkbox onChange={this.standby2}>商户课程存疑</Checkbox>
                                            </td>:<td style={{height:0}}></td>
                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan="5">
                                            <span className="detail-t">案列记录</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5">
                                            <textarea name="" id="recordDetail" cols="30" rows="10" className="commu-area textarea" style={{"width":"95%","height":"80px"}}></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5">
                                            <button className="left block btn-blue" id='saveRecord' onClick={this.saveRecord.bind(this)}>保存</button>
                                            <button className="btn-white left block ml20" id='saveRecordCancle' onClick={this.cancleSaveRecord.bind(this)}>取消</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            {/* Record end  */}
                            <Modal
                                title="反欺诈图形可视化"
                                width="1000px"
                                destroyOnClose = {true}
                                // height="1000px"
                                visible={this.state.visible}
                                onOk={()=>this.setState({visible:false})}
                                onCancel={()=>this.setState({visible:false})}
                                >
                                 <ModelVisualization parms={{cooperationFlag:infoDTO.cooperationFlag,orderNo:infoDTO.orderNo}} />
                            </Modal>
                            {/* Record list end */}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
};

export default OpposeFraud;  //ES6语法，导出模块