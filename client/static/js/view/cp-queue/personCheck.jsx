// 人工审核-爱尚
import React from 'react';
import $ from 'jquery';

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Select } from 'antd';
const Option = Select.Option;
import PartnerList from '../cp-module/partnerList';  //合作方列表 
import DealAmount from '../cp-module/dealAmount';  //处理条数 
import BaseUserInfoBar from '../cp-module/baseUserInfoBar';  //
import RepayInfoBar from '../cp-module/repayInfoBar';  //贷款信息展示
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import Channel from '../cp-module/channel'; //选择合作方select
import RecordList from '../cp-module/recordList';  //record展示
import RepaymentMsg29A from '../cp-module/repaymentMsg29A'; //29A 增加还款信息表现
// 左侧页面
import UserMsgTerrace from '../cp-module/userMsgTerrace';
import UserMsgThird from '../cp-module/userMsgThird';   
import FileTerrace from '../cp-search/fileTerrace';  //=>附件-平台
import FileThird from '../cp-search/fileThird';  //=>附件-第三方  
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction} from "mobx";

import GuaranteeRapayList from '../../view/module/guaranteeRapayList'; //担保费还款计划table展示
import DeductionRecordsList from '../../view/module/deductionRecordsList'; //担保费还款计划table展示
@inject('allStore') @observer
class PersonCheck extends React.Component{
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.state={
            lef_page:"",  //左边页面组件
            condition:{},  //存放搜索条件
            showOpraRecord:false,  //是否展示record操作框 ture展示，false隐藏
            withdrawReasonEnums:[],
            resetFuzzyVal:false,  //是否清空模糊查询框的值
            deductionRecordsList:{}
        }
    }
    @action componentDidMount(){
        this.userinfoStore.restoreUserInfo();
        this.changeLeftCP(0);
        commonJs.reloadRules();
        this.props.allStore.CooperationList.getAllCooperations("/node/manual/getAllCooperationCount");  //获取顶部合作方数据列表
        this.props.allStore.CooperationCountStore.getCooperationCount("/node/manual/count");  //处理条数
    }
    
    /**
     *
     * 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     * @param right_index >0则切换右侧组件
     */
    changeLeftCP(index,right_index){
        var leftHtml = this.getLeftHtml(parseInt(index));
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
        let platformFlag=this.state.infoDTO?this.state.infoDTO.platformFlag:"";//接口返回的平台或第三方标识
        let loanNumber=this.state.infoDTO?this.state.infoDTO.loanNumber:"";//接口返回的合同号
        if(!platformFlag){
            platformFlag="default"
        }
        let pageParm={
            userPage:{
                "TH":<UserMsgThird />,
                "PF":<UserMsgTerrace />,
                "default":<UserMsgTerrace />
            },
            filePage:{
                "TH":<FileThird />,
                "PF":<FileTerrace loanNumber={loanNumber} />,
                "default":<FileTerrace />
            },
            Guarantee:{
                "PF":<div><GuaranteeRapayList that={this} pageFlag="CP2F" getGuranteeList={this.getGuranteeList}  guaranteeFeePayInfoList={this.state.guaranteeFeePayInfoList} /><DeductionRecordsList 
                            pageFlag="CP2F"
                            that={this} 
                    /></div>
            }
            // repayListPage:{
            //     "TH":<RepaymentList data={this.state.thirdDataRepaymentResponseDTO} />,
            //     "PF":<RepaymentList />,
            //     "default":<RepaymentList />
            // }
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
            // case 2:
            //     left_page=pageParm.repayListPage[platformFlag];
            //     break;
        }
        return left_page;
    }
    cancleSaveRecord(){
        cpCommonJs.cancleSaveRecord();
        $(".rejectCauseDictionaryInfoDTOS-td").addClass("hidden");
    }
    // 搜索 queueReloadEnum 传 SEARCH; isOldCondition为true则从state中获取搜索时的条件
    @action searchHandle(queueReloadEnum,isOldCondition){
        this.changeLeftCP(0);
        let that=this;
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
                _parem.orderNo=_orderNumber;
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
    //搜索公共方法
    @action searchCommonFn(_parem,queueReloadEnum){
        let that=this;
        this.userinfoStore.withdrawFileIds=[];  //需要重传的文件id
        this.userinfoStore.withdrawFileTypes=[];  //重传文件类型-中文
        $.ajax({
            type:"post", 
            url:"/node/manual/searchByCondition", 
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
                       withdrawReasonEnums:{},
                       queueContactResultEnums:{},
                       recordInfoDTOS:[]
                   },()=>{
                       that.userinfoStore.restoreUserInfo();
                   })
                    return;
               }
               let _data=res.data;
               let _infoDTO=_data.infoDTO?_data.infoDTO:{};
               //更新userinfo store  ---
               that.userinfoStore.orderNo=_infoDTO.orderNo;
               that.userinfoStore.loanNo=_infoDTO.loanNumber;
               that.userinfoStore.cooperationFlag=_infoDTO.cooperationFlag;
               that.userinfoStore.fromFlag=_infoDTO.fromFlag;
               that.userinfoStore.platformFlag=_infoDTO.platformFlag;
               that.userinfoStore.customerId=_infoDTO.customerId;
               //---end
               if(_data.bindStatus&&_data.bindStatus=="bind"){
                   alert("当前queue已被"+_data.bindBy+"绑定！");
                   that.setState({
                       showOpraRecord:false
                   })
               }else if(_infoDTO.queueStatusId==2 || _infoDTO.queueStatusId==4 || _infoDTO.queueStatusId==6 || _infoDTO.queueStatusId==8 || _infoDTO.queueStatusId==11 || _infoDTO.queueStatusId==12){
                   that.setState({
                       showOpraRecord:false
                   })
               }else{
                   that.setState({
                       showOpraRecord:true
                   })
               }
               if(_infoDTO.platformFlag=='PF'){ //是否显示重现放款按钮（最终状态显示）
                    that.setState({
                        showLoanAginBtn:true
                    }) 
               }
               that.setState({
                  infoDTO:_infoDTO,
                  rejectCauseDictionaryInfoDTOS:_data.rejectCauseDictionaryInfoDTOS?_data.rejectCauseDictionaryInfoDTOS:{}, //拒绝原因 
                  withdrawReasonEnums:_data.withdrawReasonEnums?_data.withdrawReasonEnums:{}, //撤回原因 
                  recordInfoDTOS:_data.recordInfoDTOS?_data.recordInfoDTOS:[],  //record记录
               },()=>{
                    queueReloadEnum=="SEARCH"?that.userinfoStore.getIdentityInfo(that,true):"";
                    that.props.allStore.CooperationCountStore.getCooperationCount("/node/manual/count");  //处理条数
                    that.props.allStore.CooperationList.getAllCooperations("/node/manual/getAllCooperationCount");  //获取顶部合作方数据列表
                    let oldQueueContactResultEnums=_data.queueContactResultEnums?_data.queueContactResultEnums:[];
                    let newQueueContactResultEnums=that.dealStates(_infoDTO.whetherFraud,_infoDTO.cooperationFlag,oldQueueContactResultEnums,_infoDTO.needWithDraw);
                    that.setState({
                        queueContactResultEnums:newQueueContactResultEnums, //处理状态 
                    })
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
    //搜索下一条
    @action searchNext(){
        this.userinfoStore.withdrawFileIds=[];  //需要重传的文件id
        this.userinfoStore.withdrawFileTypes=[];  //重传文件类型-中文
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
            url:"/node/manual/next", 
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
                       withdrawReasonEnums:[],
                       queueContactResultEnums:{},
                       recordInfoDTOS:[]
                   },()=>{
                    that.userinfoStore.restoreUserInfo();
                })
                    return;
                }
                let _data=res.data;
                let _infoDTO=_data.infoDTO?_data.infoDTO:{};
                //更新userinfo store  ---
                that.userinfoStore.orderNo=_infoDTO.orderNo;
                that.userinfoStore.loanNo=_infoDTO.loanNumber;
                that.userinfoStore.cooperationFlag=_infoDTO.cooperationFlag;
                that.userinfoStore.fromFlag=_infoDTO.fromFlag;
                that.userinfoStore.platformFlag=_infoDTO.platformFlag;
                that.userinfoStore.customerId=_infoDTO.customerId;
                //---end
                
                if(_infoDTO.bindStatus&&_infoDTO.bindStatus=="bind"){
                    alert("当前queue已被"+_infoDTO.bindBy+"绑定！");
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
                   withdrawReasonEnums:_data.withdrawReasonEnums?_data.withdrawReasonEnums:{}, //撤回原因 
                   recordInfoDTOS:_data.recordInfoDTOS?_data.recordInfoDTOS:[],  //record记录
                   condition:{
                        cooperationFlag:_chenel,
                        loanNumber:_data.infoDTO?_data.infoDTO.loanNumber:"",
                    }
                },()=>{
                   that.userinfoStore.getIdentityInfo(that,true);
                   that.props.allStore.CooperationCountStore.getCooperationCount("/node/manual/count");  //处理条数
                   that.props.allStore.CooperationList.getAllCooperations("/node/manual/getAllCooperationCount");  //获取顶部合作方数据列表
                   let oldQueueContactResultEnums=_data.queueContactResultEnums?_data.queueContactResultEnums:[];
                   let newQueueContactResultEnums=that.dealStates(_infoDTO.whetherFraud,_infoDTO.cooperationFlag,oldQueueContactResultEnums,_infoDTO.needWithDraw);
                   that.setState({
                        queueContactResultEnums:newQueueContactResultEnums, //处理状态 
                   })
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

    //担保费扣款记录查询-lyf
    deductionRecords=(pageData,index)=>{
        let that=this;
        that.getLeftHtml = this.getLeftHtml;
        let _loanNumber=this.userinfoStore.platforIdentityInfo.platformLoanInfoDTO?this.userinfoStore.platforIdentityInfo.platformLoanInfoDTO.acceptNo:"";
        let productNo=this.state.infoDTO.cooperationFlag;
        let params = {};
        let n=$(".search-rig-page .on").attr("id");
        params = pageData;
        params.loanNumber = _loanNumber;
        params.productNo = productNo;
        $.ajax({
            type:"post",
            url:"/node/upfrontFee/gurantee/pay",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(params)},
            success:function(res) {
                let response=res.data;  //from node response
                let data=response.data;  //from java response 
                if(!response.executed){
                    that.setState({
                        deductionRecordsList:{}
                    })
                }
                that.setState({
                    deductionRecordsList:cpCommonJs.opinitionArray(response)
                });

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
        let _beforeQueueStatusId=infoDTO.queueStatusId;
        if(!_beforeQueueStatusId){
            alert("未获取到操作之前的状态！");
            return;
        }
        _parem.beforeQueueStatusId=_beforeQueueStatusId;
        let _afterQueueStatusId=$(".QrecordInfo .queueContactResultEnums option:selected").attr('data-value');
        if(!_afterQueueStatusId){
            alert("请选择处理状态！");
            return;
        }
        _parem.afterQueueStatusId=_afterQueueStatusId;
        
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

        let select_withdrawReasonEnums=this.state.select_withdrawReasonEnums;
        if(_afterQueueStatusId==6 && !select_withdrawReasonEnums){
            alert("请选择撤回原因！");
            return;
        }
        let withdrawFileIds=this.userinfoStore.withdrawFileIds;
        let withdrawFileTypes=this.userinfoStore.withdrawFileTypes;
        if(withdrawFileIds.length<=0 && _afterQueueStatusId==12 && infoDTO.needWithDraw){
            alert("请勾选撤回文件！");
            return;
        }
        if(withdrawFileIds.length>0 && _afterQueueStatusId==12 && infoDTO.needWithDraw){
            _parem.withdrawFileIds=withdrawFileIds.join(',');
            _parem.withdrawFileTypes=withdrawFileTypes.join(',');
        }
        if(_afterQueueStatusId==6 && select_withdrawReasonEnums){
            _parem.caseContent=select_withdrawReasonEnums;
        }else{
            let _caseContent=$(".QrecordInfo .commu-area").val();
            if(_afterQueueStatusId && _afterQueueStatusId!=2 && _afterQueueStatusId!=4 && !_caseContent){
                alert("请填写案列详情！");
                return;
            }
            _parem.caseContent=_caseContent;
        }
        $.ajax({
            type:"post", 
            url:"/node/manual/save", 
            async:false,
            dataType: "JSON", 
            data:{josnParam:JSON.stringify(_parem)},
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
    //处理状态选拒绝时显示拒绝原因选项
    rejectSelect(event){
        let _value=$(event.target).find("option:selected").attr("data-value");
        $(".recordDetail").removeClass("hidden");
        if(_value=="11"){  //拒绝
            $(".rejectCauseDictionaryInfoDTOS-td").removeClass("hidden");
            $(".withdrawReasionInfoDTOS-td").addClass("hidden");
        }else if(_value=="6"){  //撤回
            $(".rejectCauseDictionaryInfoDTOS-td").addClass("hidden");
            $(".withdrawReasionInfoDTOS-td").removeClass("hidden");
            $(".recordDetail").addClass("hidden");
        }else{
            $(".rejectCauseDictionaryInfoDTOS-td,.withdrawReasionInfoDTOS-td").addClass("hidden");
        }
    }
    /**
     * 根据infoDTO里whetherFraud字段展示record处理状态-queueContactResultEnums
     * @param {*} whetherFraud infoDTO里whetherFraud字段
     * @param {*} oldStates 处理状态
     * @param {*} cooperationFlag 合作方标识 17C。。。。
     * @needWithDraw {*} needWithDraw判断是否有撤回状态
     */
    dealStates(whetherFraud,cooperationFlag,oldStates,needWithDraw){
        let newStates=[];
        if(!oldStates || oldStates.length<=0){
            return;
        }
        whetherFraud=whetherFraud?whetherFraud.toString():"";
        if(whetherFraud && whetherFraud==1){  //whetherFraud等于1展示完成（不展示放款）
            if(cooperationFlag=="23C"){  //23C显示取消
                for(let i=0;i<oldStates.length;i++){
                    let oldStates_i=oldStates[i];
                    if(oldStates_i.value==4||oldStates_i.value==3||oldStates_i.value==8||oldStates_i.value==11){ //展示 取消、跟进、完成、拒绝
                        newStates.push(oldStates_i);
                    }
                }
            }else if(cooperationFlag=="24A"||cooperationFlag=="9F1"||cooperationFlag=="28A"){  //24A显示撤回和取消
                for(let i=0;i<oldStates.length;i++){
                    let oldStates_i=oldStates[i];
                    if(oldStates_i.value==4||oldStates_i.value==3||oldStates_i.value==8||oldStates_i.value==11||oldStates_i.value==6){ //展示 取消、跟进、完成、拒绝、撤回
                        newStates.push(oldStates_i);
                    }
                }
            }else if(needWithDraw){
                for(let i=0;i<oldStates.length;i++){
                    let oldStates_i=oldStates[i];
                    if(oldStates_i.value!=2&&oldStates_i.value!=8&&oldStates_i.value!=6){
                        newStates.push(oldStates_i);
                    }
                }
            }else{
                for(let i=0;i<oldStates.length;i++){
                    let oldStates_i=oldStates[i];
                    if(oldStates_i.value!=2&&oldStates_i.value!=8&&oldStates_i.value!=6&&oldStates_i.value!=12){
                        newStates.push(oldStates_i);
                    }
                }
            }
        }

        if(whetherFraud==0){  //whetherFraud等于0展示放款（不展示完成）
            if(cooperationFlag=="23C"){  //23C显示取消
                for(let i=0;i<oldStates.length;i++){
                    let oldStates_i=oldStates[i];
                    if(oldStates_i.value==2 || oldStates_i.value==8 || oldStates_i.value==3 || oldStates_i.value==11){  //展示 跟进、取消、放款、拒绝
                        newStates.push(oldStates_i);
                    }
                }
            }else if(cooperationFlag=="24A"||cooperationFlag=="9F1"||cooperationFlag=="28A"){  //24A显示撤回、取消
                for(let i=0;i<oldStates.length;i++){
                    let oldStates_i=oldStates[i];
                    if(oldStates_i.value==2 || oldStates_i.value==3 || oldStates_i.value==8 || oldStates_i.value==11 || oldStates_i.value==6){  //展示 跟进、取消、放款、拒绝、撤回
                        newStates.push(oldStates_i);
                    }
                }
            }else if(needWithDraw){
                for(let i=0;i<oldStates.length;i++){
                    let oldStates_i=oldStates[i];
                    if(oldStates_i.value!=4&&oldStates_i.value!=8&&oldStates_i.value!=6){
                        newStates.push(oldStates_i);
                    }
                }
            }else{
                for(let i=0;i<oldStates.length;i++){
                    let oldStates_i=oldStates[i];
                    if(oldStates_i.value!=4&&oldStates_i.value!=8&&oldStates_i.value!=6&&oldStates_i.value!=12){
                        newStates.push(oldStates_i);
                    }
                }
            }
        }
        for(let j=0;j<newStates.length;j++){
            if(newStates[j].value==5 || newStates[j].value==7){
                newStates.splice(newStates.findIndex(item => item.value === 5), 1)
                newStates.splice(newStates.findIndex(item => item.value === 7), 1)
            }
        }
        return newStates;
    }
    //合作方切换
    channelChange(obj){
        let routerHash=this.props.location?this.props.location.pathname:"";
        if(routerHash=="/personCheck" || routerHash=="/opposeFraud"){  //打开人工审核queue和反欺诈queue时，切换合作方select重新加载处理条数组件
            this.props.allStore.CooperationCountStore.getCooperationCount("/node/manual/count",{cooperationFlag:obj.value});  //处理条数
        }
    }
    // 撤回原因多选框多选事件
    antSelectHandle(value,option){
        this.setState({
            select_withdrawReasonEnums:`${value}`
        })
    }

    //重新放款按钮loanAginloanAgin
    loanAgin(){
        let infoDTO=cpCommonJs.opinitionObj(this.state.infoDTO);
        let _parem={
            cooperationFlag:infoDTO.cooperationFlag,
            orderNo:infoDTO.orderNo
        };
        $.ajax({
            type:"post", 
            url:"/node/manual/reLoan", 
            async:true,
            dataType: "JSON", 
            data:{josnParam:JSON.stringify(_parem)},
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _data=res.data;
                alert(_data.message);
           }
       })
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
        let {FuzzyArray=[],infoDTO={}}=this.state;
        let recordInfoDTOS=this.state.recordInfoDTOS?this.state.recordInfoDTOS:[];
        // 撤回原因多选列表
        let withdrawReasonEnums=this.state.withdrawReasonEnums;  //撤回原因
        const withdrawReanList = [];
        for (let i = 0; i < withdrawReasonEnums.length; i++) {
            let withdrawReasonEnums_i=withdrawReasonEnums[i];
            withdrawReanList.push(<Option key={i} value={commonJs.is_obj_exist(withdrawReasonEnums_i.code)}>{commonJs.is_obj_exist(withdrawReasonEnums_i.desc)}</Option>);
        }
        return (
            <div className="content" id="content">
                <PartnerList />  {/* 合作方列表 */}
                <div className="mt20">
                    <DealAmount />   {/* 处理条数 */}
                </div>
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar check-search clearfix mt20 overflow-auto" data-resetstate='FuzzyLoanNo,FuzzyPhone'>
                    <Channel onChange={this.channelChange.bind(this)} />  {/* 合作方 */}
                    <input type="text" name="" placeholder="订单号" className="input left mr10 orderNumber" id='orderNumber' />
                    {/* <input type="text" name="" placeholder="合同号" className="input left mr10 loanNumber" /> */}
                    <div className="left fuzzyLoanNumber mr10" id='cdtLoanNo' style={{"width":"250px"}}>
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
                    <div className="left fuzzyPhone mr10" id='cdtPhoneNo' style={{"width":"185px"}}>
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
                    <input type="text" name="" id='name' placeholder="姓名" className="input left mr20 name" />
                    <button className="left reset" onClick={commonJs.resetCondition.bind(this,this)} id='reset'>重置</button>
                    <button className={this.state.showLoanAginBtn?"right mr15 search-next-btn":"hidden"} onClick={this.loanAgin.bind(this)} data-btn-rule='RULE:RELOAN:TREE' id='reLoan'>重新放款</button>
                    <button className="right mr15 search-next-btn" onClick={this.searchNext.bind(this)} id='searchNext'>搜索下一条</button>
                    <button className="right mr15 search-btn" onClick={this.searchHandle.bind(this,"SEARCH",false)} id='searchBtn'>搜索</button>
                </div>
                {/* 搜索条件 end */}
                <div className="mt20">
                    <RepayInfoBar platformFlag={infoDTO.platformFlag} cooperationFlag={infoDTO.cooperationFlag} />  {/* 贷款信息条展示 */}
                </div>
                <div className="mt20 clearfix">
                    <div className="left cont-left content-toggle  relative">
                        {/* tit-shadow */}
                        <div className="bar title-box Csearch-left-page clearfix">
                            <ul className="left ml10 mt5 nav">
                                <li className="on" data-id="0" onClick={this.changeLeftCP.bind(this,0,null)}>详情</li>
                                <li data-id="1" onClick={this.changeLeftCP.bind(this,1,null)}>文件</li>
                                <li data-id="2" onClick={cpCommonJs.showListPop.bind(this,this,'repaymentList')}>还款列表</li>
                                <li data-id="3" onClick={cpCommonJs.showListPop.bind(this,this,'withholdList')} data-btn-rule="identity:getDebitingInfo">扣款列表</li>
                                {infoDTO.cooperationFlag=='2F' ? <li data-id="5" onClick={this.changeLeftCP.bind(this,5,null)} id='CPFILE'>担保费</li>:''}
                                {
                                    infoDTO.cooperationFlag=="3F"?
                                    <li data-id="4" onClick={cpCommonJs.showListPop.bind(this,this,'historyBorrow')} data-btn-rule="">历史借款记录</li>
                                    :""
                                }
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={cpCommonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        <div className="mt10">
                            {this.state.lef_page}
                        </div>
                    </div>
                    <div className="right cont-right content-toggle">
                        <BaseUserInfoBar _customerId={infoDTO.customerId} _orderNo={infoDTO.orderNo}  _loanNo={infoDTO.loanNumber} _stuCheck={infoDTO.stuCheck} _lpCheckFlag={infoDTO.lpCheckFlag} _grade={infoDTO.grade} queue={this.props.location.pathname} />  {/*用户信息条展示-蓝色条*/}
                        {/* 29A 增加还款信息表现 */}
                        {
                            infoDTO.cooperationFlag=="29A"?
                            <div className="mt10"><RepaymentMsg29A /></div>:""
                        }
                        {/* Record */}
                        <div className={(this.state.showOpraRecord)?"mt10":"hidden"}>
                            <div className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit on">Record</div>
                            <table className="radius-tab mt10 CPS-edit-div QrecordInfo flow-auto" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                <tbody>
                                    <tr>
                                        <th className="no-border" width="33%">处理状态</th>
                                        <th className="no-border rejectCauseDictionaryInfoDTOS-td hidden" width="33%">拒绝原因</th>
                                        <th className="no-border withdrawReasionInfoDTOS-td hidden" width="33%">撤回原因</th>
                                        <th className="no-border"></th>
                                    </tr>
                                    <tr>
                                        <td>
                                            <select className="select-gray queueContactResultEnums" name="" id="rejectSelect" style={{"width":"95%"}} onChange={this.rejectSelect.bind(this)}>
                                                <option value="" data-show="no" hidden>请选择处理状态</option>
                                                {
                                                    (this.state.queueContactResultEnums && this.state.queueContactResultEnums.length>0)?this.state.queueContactResultEnums.map((repy,i)=>{
                                                        return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                    }):<option></option>
                                                }
                                            </select>
                                        </td>
                                        <td className="rejectCauseDictionaryInfoDTOS-td hidden">
                                            <select className="select-gray rejectCauseDictionaryInfoDTOS" name="" id="rejectCauseDictionary" style={{"width":"95%"}}>
                                                <option value="" data-show="no" hidden>请选择拒绝原因</option>
                                                {
                                                    (this.state.rejectCauseDictionaryInfoDTOS && this.state.rejectCauseDictionaryInfoDTOS.length>0)?this.state.rejectCauseDictionaryInfoDTOS.map((repy,i)=>{
                                                        return <option key={i} data-type={commonJs.is_obj_exist(repy.type)} data-id={commonJs.is_obj_exist(repy.id)}>{commonJs.is_obj_exist(repy.rejectReason)}</option>
                                                    }):<option></option>
                                                }
                                            </select>
                                        </td>
                                        <td className="withdrawReasionInfoDTOS-td hidden" id='withdrawReasion'>
                                            <Select
                                                mode="multiple"
                                                style={{ width: '100%' }}
                                                placeholder="Please select"
                                                allowClear
                                                showArrow
                                                notFoundContent=" "
                                                onChange={this.antSelectHandle.bind(this)}
                                            >
                                            {withdrawReanList}
                                            </Select>
                                        </td>
                                    </tr>
                                    {
                                        (infoDTO.cooperationFlag!="24A"&&infoDTO.cooperationFlag!="9F1")?
                                        <tr>
                                            <td colSpan="3">
                                                <span className="detail-t">详情</span>
                                            </td>
                                        </tr>:<tr><td style={{"height":"0"}}></td></tr>
                                    }
                                    <tr className="recordDetail">
                                        <td colSpan="3">
                                            <textarea name="" id="recordDetail" cols="30" rows="10" className="commu-area textarea" style={{"width":"95%","height":"80px"}}></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3">
                                            <button className="left block btn-blue" id='saveRecord' onClick={this.saveRecord.bind(this)}>保存</button>
                                            <button className="btn-white left block ml20" id='saveRecordCancle' onClick={this.cancleSaveRecord.bind(this)}>取消</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/* Record end  */}
                        <div className="mt10">
                            <RecordList data={recordInfoDTOS} showReloadFile />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
};

export default PersonCheck;  //ES6语法，导出模块