// 回访数据处理
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import RepayInfoBar from '../cp-module/repayInfoBar';  //贷款信息展示
import BaseUserInfoBar from '../cp-module/baseUserInfoBar';  //账号板块
import RecordList from '../cp-module/recordList';  //record展示
import PartnerList from '../cp-module/partnerList';  //合作方列表 
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import Channel from '../cp-module/channel'; //选择合作方select
import RepaymentMsg29A from '../cp-module/repaymentMsg29A'; //29A 增加还款信息表现
// 左侧页面
import UserMsgTerrace from '../cp-module/userMsgTerrace';//详情-平台
import UserMsgThird from '../cp-module/userMsgThird';//详情-第三方
import ShopMsgXYH from '../cp-module/shopMsgXYH';//详情-小雨花
import ShopMsgGYL from '../../view/cp-module/shopMsgGYL';//详情 - 供应链


import DealAvisitRecordList from '../cp-module/dealAvisitRecordList';//回访数据处理record记录
import FileTerrace from '../cp-search/fileTerrace';  //=>附件-平台
import FileThird from '../cp-search/fileThird';  //=>附件-第三方
import FileXYH from '../cp-search/fileXYH';  //=>附件-小雨花
import FileGYL from '../cp-search/fileGYL';  //=>附件-供应链
import FileReconsider from '../cp-search/fileReconsider';  //=>复议资料-小雨花

import OrderInfo from '../cp-search/orderInfo';  //=>订单信息-小雨花 
import RiskInfo from '../cp-search/riskInfo';  //=>风控信息-小雨花   
import OperateList from '../cp-search/operateList';  //=>操作记录-小雨花
import HistoryOrder from '../cp-search/historyOrder';  //=>历史订单-小雨花

import ShopMsgNY from '../../view/cp-module/shopMsgNY';
import FileNY from '../../view/cp-search/fileNY';  //=>附件-供应链

import {observer,inject} from "mobx-react";
import ClientSelect from '../cp-module/clientSelect';//回访前端页面
import { observable, action, computed ,configure,runInAction} from "mobx";

@inject('allStore') @observer
class DealAvisit extends React.Component{
    constructor(props){
        super(props);
        this.store=this.props.allStore.UserinfoStore;  //用户详情
        this.state={
            lef_page:"",  //左边页面组件
            counts:{},  //顶部统计条数
            channelSelectedObj:{},  //选中的合作方obj
            conditions:{},
            attrDefineInfoDTOS:[],
            attrInfoDTOS:[],
            caseRecordResponseDTOS:[],//案件记录
            ndSecond:[],
            ndTop:[],
        }
    }
    componentDidMount(){
        this.getCounts();
        this.store.restoreUserInfo();
        this.changeLeftCP(0,null);
        this.props.allStore.CooperationList.getAllCooperations("/node/reV/getAllRevCount");  //获取顶部合作方数据列表
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        //风控信息 关联数据合同号点击展示对应详情
        this.store.restoreUserInfo();
        let riskInfoCurrentLoanNo=nextProps.location.query.riskInfoCurrentLoanNo;
        if(riskInfoCurrentLoanNo){
            $(".check-search .loanNumber").val(riskInfoCurrentLoanNo);  //合同号
            this.searchHandle('SEARCH',false);
        }
    }
    // 获取顶部条数
    getCounts(){
        let that=this;
        $.ajax({
            type:"post", 
            url:"/node/reV/count", 
            async:true,
            dataType: "JSON", 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        counts:{}
                    })
                }
                let _data=res.data;
                that.setState({
                    counts:_data
                })
           }
       })
    }
    /**
     * 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     */
    changeLeftCP(index){
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
        let platformFlag=this.state.queueInfoDTO?this.state.queueInfoDTO.platformFlag:"";//接口返回的平台或第三方标识
        if(!platformFlag){
            platformFlag="default"
        }
        let pageParm={
            userPage:{
                "TH":<UserMsgThird />,
                "PF":<UserMsgTerrace />,
                "SUPPLY":<ShopMsgGYL />,
                "XYH":<ShopMsgXYH />,
                "default":<UserMsgTerrace />,
                "AG":<ShopMsgNY />,
            },
            filePage:{
                "TH":<FileThird />,
                "PF":<FileTerrace />,
                "SUPPLY":<FileGYL />,
                "XYH":<FileXYH />,
                "default":<FileTerrace />,
                "AG":<FileNY />,
            }
        };
        switch (index){
            case 0:
                left_page=pageParm.userPage[platformFlag];
                break;
            case 1:
                left_page=pageParm.filePage[platformFlag];
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
    //渠道切换事件
    channelChange(channelSelectedObj){
        commonJs.resetCondition(this,false);
        if(channelSelectedObj.value=='2C'){
            this.setState({
                showTenant:true
            })
            }else{
                this.setState({
                    showTenant:false
                })
        }
        this.setState({
            channelSelectedObj:channelSelectedObj
        })
    }
    //搜索 queueReloadEnum 搜索类型 oldCondition 是否获取已经存在的条件
    @action searchHandle(queueReloadEnum,oldCondition){
        let that=this;
        let _parem={};  //请求参数
        this.cancelSaveQ();
        // $(".attrDefine select option:selected").removeProp("selected")
        // $(".attrDefine select option[value='0']").prop("selected","selected");
        if(oldCondition){
            _parem=this.state.conditions
        }else{
            let _orderNumber=$(".check-search .orderNumber").val();  //订单号
            let _loanNumber=$(".check-search .loanNumber").val();  //合同号
            let _custName=$(".check-search .custName").val();  //客户名称
            let _fromWhere=this.state.fromWhereCheckBox;  //是否特殊回访
            if(_fromWhere)_parem.fromWhere="special";
            let _batchNumber=$(".check-search .batchNumber").val();  //批次号
            if(_fromWhere&&_batchNumber)_parem.batchNumber=_batchNumber.replace(/\s/g,"");
            let productNo=this.state.channelSelectedObj?this.state.channelSelectedObj.value:"";  //合作方
            if(!productNo&&!_orderNumber && !_loanNumber && !_custName && !this.state.fromWhereCheckBox && !_batchNumber){
                alert("请输入任一搜索条件！");
                return;
            }
            if(productNo)_parem.productNo=productNo;
            if(_orderNumber){
                _orderNumber=_orderNumber.replace(/\s/g,"");
                _parem.orderNo=_orderNumber;
            }
            if(_loanNumber){
                _loanNumber=_loanNumber.replace(/\s/g,"");
                _parem.loanNumber=_loanNumber;
            }
            if(_custName){
                _custName=_custName.replace(/\s/g,"");
                _parem.custName=_custName;
            }
            this.setState({
                conditions:_parem
            })
        }
        _parem.queueReloadEnum=queueReloadEnum;  //搜索类型
        $.ajax({
             type:"post", 
             url:"/node/reV/search", 
             async:true,
             dataType: "JSON", 
             data:_parem, 
             success:function(res){
                runInAction(() => {
                    if(!commonJs.ajaxGetCode(res)){
                        that.setState({
                            methodInfoDTOS:[],   //沟通方式/呼出结果
                            queueContactResultEnums:[],   //沟通结果/枚举
                            queueInfoDTO:{},  
                            queueRecordInfoDTOS: [],  //回访案例记录
                            sdSecond: [],  //闪贷二级选项
                            sdTop: [],  //闪贷一级选项
                            verifyResponseDTO: [],  //
                            xfdSecond: [],  //消费贷二级选项
                            xfdTop: [],  //消费贷一级选项
                            ndSecond:[],//农贷一级
                            ndTop:[],//农贷二级
                            attrDefineInfoDTOS:[],  //回访前端页面最新数据
                            attrHistoryInfoDTOS:[],  //回访前端页面历史数据
                            attrInfoDTOS:[],  //信息审核RECORD
                            caseRecordResponseDTOS:[],//案件记录
                        })
                        return;
                    }
                    let _data=res.data;
                    let queueInfoDTO=_data.queueInfoDTO?_data.queueInfoDTO:{};
                    //更新userinfo store  ---
                    that.store.orderNo=queueInfoDTO.orderNo;
                    that.store.loanNo=queueInfoDTO.loanNumber;
                    that.store.cooperationFlag=queueInfoDTO.productNo;
                    that.store.platformFlag=queueInfoDTO.platformFlag;
                    //---end
                    that.setState({
                        methodInfoDTOS:_data.methodInfoDTOS?_data.methodInfoDTOS:[],   //沟通方式/呼出结果
                        queueContactResultEnums:_data.queueContactResultEnums?_data.queueContactResultEnums:[],   //沟通结果/枚举
                        queueInfoDTO:queueInfoDTO,  
                        queueRecordInfoDTOS:_data.queueRecordInfoDTOS?_data.queueRecordInfoDTOS:[],  //回访案例记录
                        sdSecond:_data.sdSecond?_data.sdSecond:[],  //闪贷二级选项
                        sdTop:_data.sdTop?_data.sdTop:[],  //闪贷一级选项
                        xfdSecond:_data.xfdSecond?_data.xfdSecond:[],  //消费贷二级选项
                        xfdTop:_data.xfdTop?_data.xfdTop:[],  //消费贷一级选项
                        ndSecond:_data.ndSecond?_data.ndSecond:[],
                        ndTop:_data.ndTop?_data.ndTop:[],
                        attrDefineInfoDTOS:(_data.verifyResponseDTO&&_data.verifyResponseDTO.attrDefineInfoDTOS)?_data.verifyResponseDTO.attrDefineInfoDTOS:[],  //回访前端页面最新数据
                        attrHistoryInfoDTOS:(_data.verifyResponseDTO&&_data.verifyResponseDTO.attrHistoryInfoDTOS)?_data.verifyResponseDTO.attrHistoryInfoDTOS:[],  //回访前端页面历史数据
                        attrInfoDTOS:(_data.verifyResponseDTO&&_data.verifyResponseDTO.attrInfoDTOS)?_data.verifyResponseDTO.attrInfoDTOS:[]  //信息审核RECORD
                    },()=>{
                        queueReloadEnum=="SEARCH"?that.store.getIdentityInfo(that,true):"";
                        queueReloadEnum=="SEARCH"?that.getQueueCase():"";
                        queueReloadEnum=="SEARCH"?that.getQueuefraud():"";
                        that.props.allStore.CooperationList.getAllCooperations("/node/reV/getAllRevCount");  //获取顶部合作方数据列表
                        that.getCounts();
                    })
                    if(_data.bindStatus=="bind"){
                        alert("当前queue已被"+_data.bindBy+"绑定！");
                    }
                })
            }
        })
    }
    //搜索下一条
    @action searchNextHandle(){
        let that=this;
        this.cancelSaveQ();
        $(".check-search input").not(".batchNumber").val("");
        let productNo=this.state.channelSelectedObj?this.state.channelSelectedObj.value:"";  //合作方
        let _fromWhere=this.state.fromWhereCheckBox;  //是否特殊回访
        let _parems={};
        _parems.queueReloadEnum="NEXT";
        if(productNo)_parems.productNo=productNo;
        if(_fromWhere)_parems.fromWhere="special"; //是否特殊回访
        let _batchNumber=$(".check-search .batchNumber").val();  //批次号
        if(_fromWhere&&_batchNumber)_parems.batchNumber=_batchNumber.replace(/\s/g,"");
        $.ajax({
            type:"post", 
            url:"/node/reV/next", 
            async:true,
            data:_parems,
            dataType: "JSON", 
            success:function(res){
                runInAction(() => {
                    if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        methodInfoDTOS:[],   //沟通方式/呼出结果
                        queueContactResultEnums:[],   //沟通结果/枚举
                        queueInfoDTO:{},  
                        queueRecordInfoDTOS: [],  //回访案例记录
                        sdSecond: [],  //闪贷二级选项
                        sdTop: [],  //闪贷一级选项
                        verifyResponseDTO: [],  //
                        xfdSecond: [],  //消费贷二级选项
                        xfdTop: [],  //消费贷一级选项
                        ndSecond:[],//农贷一级
                        ndTop:[],//农贷二级
                        attrDefineInfoDTOS:[],  //回访前端页面
                        attrHistoryInfoDTOS:[],  //回访前端页面历史数据
                        attrInfoDTOS:[],  //信息审核RECORD
                        caseRecordResponseDTOS:[],
                        conditions:{
                                orderNo:"",
                                custName:"",
                                loanNumber:"",
                            }
                    })
                        return;
                    }
                    let _data=res.data;
                    let queueInfoDTO=_data.queueInfoDTO?_data.queueInfoDTO:{};
                    //更新userinfo store  ---
                    that.store.orderNo=queueInfoDTO.orderNo;
                    that.store.loanNo=queueInfoDTO.loanNumber;
                    that.store.cooperationFlag=queueInfoDTO.productNo;
                    that.store.platformFlag=queueInfoDTO.platformFlag;
                    //---end
                    that.setState({
                    methodInfoDTOS:_data.methodInfoDTOS?_data.methodInfoDTOS:[],   //沟通方式/呼出结果
                    queueContactResultEnums:_data.queueContactResultEnums?_data.queueContactResultEnums:[],   //沟通结果/枚举
                    queueInfoDTO:queueInfoDTO,  
                    queueRecordInfoDTOS:_data.queueRecordInfoDTOS?_data.queueRecordInfoDTOS:[],  //回访案例记录
                    sdSecond:_data.sdSecond?_data.sdSecond:[],  //闪贷二级选项
                    sdTop:_data.sdTop?_data.sdTop:[],  //闪贷一级选项
                    verifyResponseDTO: _data.verifyResponseDTO?_data.verifyResponseDTO:[],  //
                    xfdSecond:_data.xfdSecond?_data.xfdSecond:[],  //消费贷二级选项
                    xfdTop:_data.xfdTop?_data.xfdTop:[],  //消费贷一级选项
                    ndSecond:_data.ndSecond?_data.ndSecond:[],
                    ndTop:_data.ndTop?_data.ndTop:[],
                    attrDefineInfoDTOS:(_data.verifyResponseDTO&&_data.verifyResponseDTO.attrDefineInfoDTOS)?_data.verifyResponseDTO.attrDefineInfoDTOS:[],  //回访前端页面最新数据
                    attrHistoryInfoDTOS:(_data.verifyResponseDTO&&_data.verifyResponseDTO.attrHistoryInfoDTOS)?_data.verifyResponseDTO.attrHistoryInfoDTOS:[],  //回访前端页面历史数据
                    attrInfoDTOS:(_data.verifyResponseDTO&&_data.verifyResponseDTO.attrInfoDTOS)?_data.verifyResponseDTO.attrInfoDTOS:[],  //信息审核RECORD
                    conditions:{
                            channelSelectedObj:{value:queueInfoDTO.productNo},
                            orderNo:queueInfoDTO.orderNo,
                            custName:queueInfoDTO.custName,
                            loanNumber:queueInfoDTO.loanNumber
                    }
                    },()=>{
                    that.store.getIdentityInfo(that,true);
                    that.props.allStore.CooperationList.getAllCooperations("/node/reV/getAllRevCount");  //获取顶部合作方数据列表
                    that.getQueueCase();
                    that.getQueuefraud();
                    that.getCounts();
                    })
                })
            }
       })
    }
    //切换 消费贷一级选项 筛选出 消费贷二级选项
    xfdTopChange(event){
        let queueInfoDTO=cpCommonJs.opinitionObj(this.state.queueInfoDTO); 
        // console.log(this.state.queueInfoDTO)
        let platformFlag=queueInfoDTO.platformFlag;//接口返回的平台或第三方标识

        $(".newXfdSecond option").removeProp("selected");
        $(".newXfdSecond option[value='0']").prop("selected","selected");
        let _val=$(event.target).find("option:selected").attr("data-value");
        let xfdSecond = [];
        if(platformFlag == 'AG' || platformFlag == 'SUPPLY'){
            xfdSecond=this.state.ndSecond?this.state.ndSecond:[];  //接口获取的消费贷二级选项
        }else{
            xfdSecond=this.state.xfdSecond?this.state.xfdSecond:[];  //接口获取的消费贷二级选项
        }
        let newXfdSecond=[];
        if(xfdSecond){
            newXfdSecond=xfdSecond[_val]
        }
        this.setState({
            newXfdSecond:newXfdSecond
        })
    }
    //切换 闪贷一级选项 筛选出 闪贷二级选项
    sdTopChange(event){
        $(".newSdSecond option").removeProp("selected");
        $(".newSdSecond option[value='0']").prop("selected","selected");
        let _val=$(event.target).find("option:selected").attr("data-value");
        let sdSecond=this.state.sdSecond?this.state.sdSecond:[];  //接口获取的消费贷二级选项
        let newSdSecond=[];
        if(sdSecond){
            newSdSecond=sdSecond[_val]
        }
        this.setState({
            newSdSecond:newSdSecond
        })
    }
    // record保存
    saveRcord(){
        this.cancelSaveQ.bind();
        let parent=$(".QrecordInfo");
        let queueInfoDTO=cpCommonJs.opinitionObj(this.state.queueInfoDTO);
        let productNo=queueInfoDTO.productNo;
        let platformFlag=queueInfoDTO.platformFlag;
        let _parems={};
        if(cpCommonJs.judgeChannelRecord(productNo)){
            let _revisitGoal=parent.find(".revisitGoal option:selected").attr("data-value");
            if(!_revisitGoal){alert("请选择回访目的!"); return;}
            _parems.revisitGoal=_revisitGoal;
            let _highQuality=parent.find(".highQuality option:selected").attr("data-value");
            if(!_highQuality){alert("请选择是否优质!"); return;}
            _parems.highQuality=_highQuality;
            let _methodTypeId2=parent.find(".methodTypeId2 option:selected").attr("data-value");
            if(!_methodTypeId2){alert("请选择呼出结果!"); return;}
            _parems.methodTypeId=_methodTypeId2;
            let _sdReason=parent.find(".newSdSecond option:selected").attr("data-name");
            if(!_sdReason){alert("请选择原因分类!"); return;}
            _parems.sdReason=_sdReason;
            let _afterReVisitStatusId2=parent.find(".afterReVisitStatusId2 option:selected").attr("data-value");
            if(!_afterReVisitStatusId2){alert("请选择状态!"); return;}
            _parems.afterReVisitStatusId=_afterReVisitStatusId2;
        }else{
            let _searchType=parent.find(".searchType option:selected").attr("value");
            if(!_searchType){alert("请选择本人接听!"); return;}
            _parems.searchType=_searchType;
            let _methodTypeId=parent.find(".methodTypeId option:selected").attr("data-value");
            if(!_methodTypeId){alert("请选择沟通方式!"); return;}
            _parems.methodTypeId=_methodTypeId;
            let _afterReVisitStatusId=parent.find(".afterReVisitStatusId option:selected").attr("data-value");
            if(!_afterReVisitStatusId){alert("请选择状态!"); return;}
            _parems.afterReVisitStatusId=_afterReVisitStatusId;
            let _xfReason=parent.find(".newXfdSecond option:selected").attr("data-name");
            if(!_xfReason){alert("请选择原因分类!"); return;}
            if(platformFlag=="AG" || platformFlag=="SUPPLY"){
                _parems.ndReason=_xfReason;
            }else{
                _parems.xfReason=_xfReason;
            }
        }
        if(platformFlag=="TH"){
            let custPhone=cpCommonJs.opinitionObj(this.store.thirdIdentityResponseOldDTO.personMap)["联系电话"];
            if(custPhone)_parems.custPhone=custPhone;  //客户电话
        }

        let _orderNo=queueInfoDTO.orderNo;
        if(!_orderNo) {alert("未获取到订单号!"); return;}
        _parems.orderNo=_orderNo;  //订单号
        
        let _beforeReVisitStatusId=queueInfoDTO.reVisitStatusId;
        if(!_beforeReVisitStatusId) {alert("未获取到初始状态!"); return;}
        _parems.beforeReVisitStatusId=_beforeReVisitStatusId;  //初始状态
        
        let _loanNumber=queueInfoDTO.loanNumber;
        if(!_loanNumber) {alert("未获取到合同号!"); return;}
        _parems.loanNumber=_loanNumber;  //合同号

        if(!productNo) {alert("未获取到产品号!"); return;}
        _parems.productNo=productNo;  //产品号

        let customerId=queueInfoDTO.customerId;
        if(!customerId) {alert("未获取到customerId!"); return;}
        _parems.customerId=customerId;  //产品号

        let _custName=queueInfoDTO.custName;
        // if(!_custName) {alert("未获取到客户名称!"); return;}
        if(_custName) _parems.custName=_custName;  //客户名称

        let _fromWhere=queueInfoDTO.fromWhere;
        if(!_fromWhere) {alert("未获取到回访数据来源!"); return;}
        _parems.fromWhere=_fromWhere;  //回访数据来源
        
        let _content=parent.find(".commu-area").val();
        if(!_content){alert("请填写案列记录!"); return;}
        _parems.content=_content;
        let that=this;
        $.ajax({
            type:"post", 
            url:"/node/reV/saveRe", 
            async:true,
            data:_parems,
            dataType: "JSON", 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _data=res.data;
                alert(_data.message);
                that.searchHandle("RELOAD",true);
                that.props.allStore.CooperationList.getAllCooperations("/node/reV/getAllRevCount");  //获取顶部合作方数据列表
           }
       })
    }
    // 取消保存record
    cancelSaveQ(){
        let _parent=$(".QrecordInfo");
        _parent.find("select option").removeProp("selected");
        _parent.find("select option[value='0']").prop("selected","selected");
        _parent.find(".commu-area").val("");
    }
    //获取人工审核案列展示
    getQueueCase(){
        let that=this;
        let queueInfoDTO=cpCommonJs.opinitionObj(this.state.queueInfoDTO);
        $.ajax({
            type:"get", 
            url:'/node/record/manualQueueRecord', 
            async:true,
            dataType: "JSON", 
            data:{
                loanNumber:queueInfoDTO.loanNumber,
                orderNo:queueInfoDTO.orderNo,
                type:queueInfoDTO.productNo
            },
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        persenChecRecordkDTO:[],
                        caseRecordResponseDTOS:[]
                    })
                }
                var _data=res.data;
                that.setState({
                    persenChecRecordkDTO:_data.checkQueueRecordInfoDTOS?_data.checkQueueRecordInfoDTOS:[],
                    caseRecordResponseDTOS:_data.caseRecordResponseDTOS,//案件记录
                })
           }
       })
    }
    //fraud案列展示
    getQueuefraud(){
        let that=this;
        let queueInfoDTO=cpCommonJs.opinitionObj(this.state.queueInfoDTO);
        $.ajax({
            type:"get", 
            url:'/node/record/fraudQueueRecord', 
            async:true,
            dataType: "JSON", 
            data:{
                loanNumber:queueInfoDTO.loanNumber,
                orderNo:queueInfoDTO.orderNo,
                type:queueInfoDTO.productNo
            },
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        fraudRecordQueueInfoDTOS:[]
                    })
                }
                var _data=res.data;
                that.setState({
                    fraudRecordQueueInfoDTOS:_data.fraudRecordQueueInfoDTOS?_data.fraudRecordQueueInfoDTOS:[]
                })
           }
       })
    }
    //显示批次号
    showFromWhere(){
        let fromWhereCheckBox=this.state.fromWhereCheckBox;
        if(fromWhereCheckBox){
            this.setState({
                fromWhereCheckBox:""
            })
        }else {
            this.setState({
                fromWhereCheckBox:"selected"
            })
        }
    }
    showListPop(type){
        let infoDTO=cpCommonJs.opinitionObj(this.state.queueInfoDTO); 
        let loanNo=infoDTO.loanNumber;
        let orderNo=infoDTO.orderNo;
        let cooperationFlag=infoDTO.productNo;
        let fromFlag=infoDTO.platformFlag;
        window.open("/cp-"+type+"?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag);
    }
    render() {
        let queueInfoDTO=cpCommonJs.opinitionObj(this.state.queueInfoDTO); 
        let caseRecordResponseDTOS=cpCommonJs.opinitionArray(this.state.caseRecordResponseDTOS); 
        // console.log(this.state.queueInfoDTO)
        let platformFlag=queueInfoDTO.platformFlag;//接口返回的平台或第三方标识
        let cooperationFlag=queueInfoDTO.cooperationFlag;//接口合作方标识
        let persenChecRecordkDTO=cpCommonJs.opinitionArray(this.state.persenChecRecordkDTO);  //人工审核recored list
        let fraudRecordQueueInfoDTOS=cpCommonJs.opinitionArray(this.state.fraudRecordQueueInfoDTOS);  //fraud list
        let counts=this.state.counts;
        let recordDatas=cpCommonJs.opinitionArray(this.state.queueRecordInfoDTOS);
        let attrInfoDTOS=cpCommonJs.opinitionArray(this.state.attrInfoDTOS);  //信息审核最新数据-操作框显示
        let attrHistoryInfoDTOS=cpCommonJs.opinitionArray(this.state.attrHistoryInfoDTOS);  //信息审核历史纪录
        let isShowRroed=(queueInfoDTO.reVisitStatusId==1||queueInfoDTO.reVisitStatusId==3);   //record是否可操作-可操作

        let XYH_IdentityInfo=cpCommonJs.opinitionObj(this.store.XYH_IdentityInfo);
        let reconsideration=cpCommonJs.opinitionObj(XYH_IdentityInfo.reconsideration);
        return (
            <div className="content" id="content">
                <PartnerList />  {/* 合作方列表 */}
                <div className="topBundleCounts gray-bar mt10">
                    <b className="left ml40">总量<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(counts.totalData)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">当日完成量<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(counts.selfCompleted)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">需跟进<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(counts.selfNeedFollow)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">未处理量<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(counts.selfUnhandle)}</span><span className="gray-font">条</span></b>
                </div>
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar check-search clearfix mt10"data-resetstate="channelSelectedObj">
                    <Channel onChange={this.channelChange.bind(this)} />
                    <input type="text" name="" placeholder="订单号" className="input left mr10 orderNumber" id='orderNumber' />
                    <input type="text" name="" placeholder="合同号" className="input left mr10 loanNumber" id='loanNumber' />
                    <input type="text" name="" placeholder="客户名称" className="input left mr20 custName" id='custName' />
                    <div className="left pt5 mr10">
                        特殊&nbsp;&nbsp;
                        <i className={this.state.fromWhereCheckBox=="selected"?"myCheckbox myCheckbox-visited fromWhere":"myCheckbox myCheckbox-normal fromWhere"} id='fromWhere' onClick={this.showFromWhere.bind(this)}></i> </div>
                    {
                        this.state.fromWhereCheckBox=="selected"?
                        <input type="text" name="" placeholder="批次号" className="input left mr20 batchNumber" id='batchNumber' />:""
                    }
                    <button className="right mr10 search-next-btn" onClick={this.searchNextHandle.bind(this)} id='searchNext'>搜索下一条</button>
                    <button className="right mr10 search-btn" onClick={this.searchHandle.bind(this,"SEARCH",false)} id='searchBtn'>搜索</button>
                    <button className="right reset mr10" onClick={commonJs.resetCondition.bind(this,this)} id='reset'>重置</button>
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
                                <li className="on" data-id="0" onClick={this.changeLeftCP.bind(this,0,null)}>
                                    {platformFlag!='XYH'?'详情':'客户信息'}
                                </li>
                                {platformFlag!='XYH' ? <li data-id="1" onClick={this.changeLeftCP.bind(this,1,null)} id='CPFILE'>文件</li>:''}
                                {platformFlag!='XYH' ? <li data-id="2" onClick={this.showListPop.bind(this,'repaymentList')} id='CPREPAYMENTLIST'>还款列表</li>:''}
                                {platformFlag!='XYH' ? <li data-id="3" onClick={this.showListPop.bind(this,'withholdList')} data-btn-rule="identity:getDebitingInfo" id='CPWITHHOLDLIST'>扣款列表</li>:''}
                                {platformFlag!='XYH' ? <li data-id="4" onClick={this.showListPop.bind(this,'historyBorrow')} data-btn-rule="" id='CPHISTORYBOWN'>历史借款记录</li>:''}

                                {platformFlag=='XYH' ? <li data-id="XYH_1" onClick={this.changeLeftCP.bind(this,'XYH_1',null)} id='CPORDERINFO'>订单信息</li>:''}
                                {platformFlag=='XYH' ? <li data-id="XYH_2" onClick={this.changeLeftCP.bind(this,'XYH_2',null)} id='CPINFOMATION'>资料信息</li>:''}
                                {platformFlag=='XYH' ? <li data-id="XYH_3" onClick={this.changeLeftCP.bind(this,'XYH_3',null)} id='CPPNEUMATIC'>风控信息</li>:''}
                                {platformFlag=='XYH' ? <li data-id="XYH_4" onClick={this.changeLeftCP.bind(this,'XYH_4',null)} id='CPOPRATELIST'>操作记录</li>:''}
                                {platformFlag=='XYH' ? <li data-id="XYH_5" onClick={this.changeLeftCP.bind(this,'XYH_5',null)} id='CPHISTORYORDER'>历史订单</li>:''}
                                {(platformFlag=='XYH'&&reconsideration.reconsiderationReason) ? <li data-id="XYH_6" id='CPRECONSIDERINFO' onClick={this.changeLeftCP.bind(this,'XYH_6',null)}>复议资料</li>:''}
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={cpCommonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        <div className="mt10">
                            {this.state.lef_page}
                        </div>
                    </div>
                    <div className="right cont-right content-toggle">
                        <BaseUserInfoBar _customerId={queueInfoDTO.customerId} _orderNo={queueInfoDTO.orderNo}  _loanNo={queueInfoDTO.loanNumber} noStuCheck />  {/*用户信息条展示-蓝色条*/}
                        {/* 29A 增加还款信息表现 */}
                        {
                            queueInfoDTO.cooperationFlag=="29A"?
                            <div className="mt10"><RepaymentMsg29A /></div>:""
                        }
                        {/* 特殊回访基础信息 */}
                        {
                            queueInfoDTO.fromWhere=="special"?
                            <div className="toggle-box mt10">
                                <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                                    特殊回访信息
                                    <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                                </h2>
                                <ul className="cp-info-ul bar pb20 pr20 mt5">
                                    <li>
                                        <p className="msg-tit">产品号</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.productNo)}>{commonJs.is_obj_exist(queueInfoDTO.productNo)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">门店</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.store)}>{commonJs.is_obj_exist(queueInfoDTO.store)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">门店地址</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.storeAddress)}>{commonJs.is_obj_exist(queueInfoDTO.storeAddress)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">模型结果</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.fraudDecision)}>{commonJs.is_obj_exist(queueInfoDTO.fraudDecision)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">回访来源</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.fromWhere)}>{commonJs.is_obj_exist(queueInfoDTO.fromWhere)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">放款时间</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.fundingSuccessDate)}>{commonJs.is_obj_exist(queueInfoDTO.fundingSuccessDate)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">服务代理商</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.employee)}>{commonJs.is_obj_exist(queueInfoDTO.employee)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">客户名称</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.custName)}>{commonJs.is_obj_exist(queueInfoDTO.custName)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">批次号</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.batchNumber)}>{commonJs.is_obj_exist(queueInfoDTO.batchNumber)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">批次描述</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.batchDescribe)}>{commonJs.is_obj_exist(queueInfoDTO.batchDescribe)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">批次创建人</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.batchFounder)}>{commonJs.is_obj_exist(queueInfoDTO.batchFounder)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">风险点1</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.riskOne)}>{commonJs.is_obj_exist(queueInfoDTO.riskOne)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">风险点2</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.riskTwo)}>{commonJs.is_obj_exist(queueInfoDTO.riskTwo)}</b>
                                    </li>
                                    <li>
                                        <p className="msg-tit">风险点3</p>
                                        <b className="msg-cont" title={commonJs.is_obj_exist(queueInfoDTO.riskThree)}>{commonJs.is_obj_exist(queueInfoDTO.riskThree)}</b>
                                    </li>
                                </ul>
                            </div>:""
                        }
                        {/* 案件记录 start */}
                        {
                            caseRecordResponseDTOS.length>0&&<div className="toggle-box mt10">
                            <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                                案件记录
                                <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                            </h2>
                            <div style={{width: '100%',borderRadius: '4px'}}>
                               {
                                   caseRecordResponseDTOS.map((v,i)=>{
                                       return(
                                        <div style={{padding: '10px 20px',fontSize: '14px',color: '#445577',fontWeight: 'bold',background: '#fff',marginTop: '5px', lineHeight: '35px'}} key={i}>
                                                <span style={{display: 'inline-block',width:' 30%'}} >{v.caseType}</span>
                                                <span>{v.createdBy}</span>
                                                <span style={{float:'right',width: '35%'}} >{v.createdAt}</span>
                                                <div>{v.caseContent}</div>
                                        </div>
                                       )
                                   })
                               }
                            </div>
                        </div>
                        }
                        {/* 人工审核 start */}
                        <div className="toggle-box mt10">
                            <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                                人工审核
                                <span className="pl10">回访数据来源：{commonJs.is_obj_exist(queueInfoDTO.fromWhere)}</span>
                                <span className="pl10">还款方式：{commonJs.is_obj_exist(queueInfoDTO.debitingChannel)}</span>
                                <span className="pl10">逾期天数：{commonJs.is_obj_exist(queueInfoDTO.daysInDefault)}</span>
                                <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                            </h2>
                            <div className="hidden">
                                <RecordList data={persenChecRecordkDTO} />
                            </div>
                        </div>
                        {/* 人工审核 end */}
                        {/* Fraudqueue start */}
                        <div className="toggle-box">
                            <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                                Fraud
                                <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                            </h2>
                            <div className="hidden">
                                <RecordList data={fraudRecordQueueInfoDTOS} />
                            </div>
                        </div>
                        {/* Fraudqueue end */}

                        {/* 信息审核RECORD */}
                        <div className="toggle-box mt10">
                            <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                                信息审核RECORD
                                <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                            </h2>
                            <div className="bar mt3 clearfix hidden">
                                {
                                    (attrHistoryInfoDTOS&&attrHistoryInfoDTOS.length>0)?attrHistoryInfoDTOS.map((repy,i)=>{
                                        return <div className="border-bottom-division-2 clearfix" key={i}>
                                                    {
                                                        (repy&&repy.length>0)?repy.map((rps,j)=>{
                                                            return <dl className="visit-client" key={j}>
                                                                        <dt>{commonJs.is_obj_exist(rps.attrValue)}</dt>
                                                                        <dd>
                                                                            {commonJs.is_obj_exist(rps.descr)}
                                                                        </dd>
                                                                    </dl>
                                                        }):""
                                                    }
                                                </div>
                                    }):<span className="gray-tip-font pl20">暂未查到相关数据...</span>
                                }
                            </div>
                        </div>
                        {/* 信心审核RECORD end */}

                        {/* 回访前端页面 start */}
                        {
                            this.state.attrDefineInfoDTOS.length>0?
                            <div className="bar mt10 clearfix">
                                <h2 className="border-bottom-2 bar-tit pl20">回访前端页面</h2>
                                <div>
                                    <ClientSelect 
                                        cooperationFlag={queueInfoDTO.productNo} 
                                        loanNumber={queueInfoDTO.loanNumber} 
                                        orderNo={queueInfoDTO.orderNo} 
                                        data={this.state.attrDefineInfoDTOS} 
                                        newestData={attrInfoDTOS?attrInfoDTOS:[]}
                                        searchHandle={this.searchHandle.bind(this)}
                                    />
                                </div>
                            </div>:""
                        }
                        {/* 回访前端页面 end */}
                        {/* Record */}
                        {
                            isShowRroed?  //判断是否展示开始
                            // ======= start
                            cpCommonJs.judgeChannelRecord(queueInfoDTO.productNo)?
                                <table className="radius-tab mt5 CPS-edit-div QrecordInfo flow-auto" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                    <tbody>
                                        <tr>
                                            <th className="no-border" width="15%">回访目的</th>
                                            <th className="no-border" width="15%">是否优质</th>
                                            <th className="no-border" width="15%">呼出结果</th>
                                            <th className="no-border" width="15%">状态</th>
                                            <th className="no-border" width="15%">结论</th>
                                            <th className="no-border" width="15%">原因分类</th>
                                            <th className="no-border" width=""></th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <select className="select-gray revisitGoal" name="" id="revisitGoal" style={{"width":"95%"}}>
                                                    <option value="0" hidden>请选择回访目的</option>
                                                    <option data-value="营销">营销</option>
                                                    <option data-value="贷后">贷后</option>
                                                    <option data-value="其他">其他</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select className="select-gray highQuality" name="" id="highQuality" style={{"width":"95%"}}>
                                                    <option value="0" hidden>请选择是否优质</option>
                                                    <option data-value="优质">优质</option>
                                                    <option data-value="一般">一般</option>
                                                    <option data-value="差">差</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select className="select-gray methodTypeId2" name="" id="methodTypeId2" style={{"width":"95%"}}>
                                                    <option value="0" hidden>请选择呼出结果</option>
                                                    {
                                                        (this.state.methodInfoDTOS && this.state.methodInfoDTOS.length>0)?this.state.methodInfoDTOS.map((repy,i)=>{
                                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.id)} data-name={commonJs.is_obj_exist(repy.type)}>{commonJs.is_obj_exist(repy.result)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                            <td>
                                                <select className="select-gray afterReVisitStatusId2" name="" id="afterReVisitStatusId2" style={{"width":"95%"}}>
                                                    <option value="0" hidden>请选择状态</option> 
                                                    {
                                                        (this.state.queueContactResultEnums && this.state.queueContactResultEnums.length>0)?this.state.queueContactResultEnums.map((repy,i)=>{
                                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                            <td>
                                                <select className="select-gray" name="" id="sdTopChange" style={{"width":"95%"}} onChange={this.sdTopChange.bind(this)}>
                                                    <option value="0" hidden>请选择结论</option> 
                                                    {
                                                        (this.state.sdTop && this.state.sdTop.length>0)?this.state.sdTop.map((repy,i)=>{
                                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                            <td>
                                                <select className="select-gray newSdSecond" name="" id="newSdSecond" style={{"width":"95%"}}>
                                                    <option value="0" hidden>需先选择结论</option> 
                                                    {
                                                        (this.state.newSdSecond && this.state.newSdSecond.length>0)?this.state.newSdSecond.map((repy,i)=>{
                                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="7">
                                                <span className="detail-t">案列记录</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="7">
                                                <textarea name="" id="" cols="30" rows="10" id='avisitRecord' className="commu-area textarea" style={{"width":"95%","height":"80px"}}></textarea>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="7" className="border-top">
                                                <button className="left block btn-blue" id='saveRcord' onClick={this.saveRcord.bind(this)}>保存</button>
                                                <button className="btn-white left block ml20" id='saveRcordCancle'>取消</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                :
                                //3c record
                                <table className="radius-tab mt5 CPS-edit-div QrecordInfo flow-auto" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                    <tbody>
                                        <tr>
                                            <th className="no-border" width="15%">本人接听</th>
                                            <th className="no-border" width="15%">沟通方式</th>
                                            <th className="no-border" width="15%">状态</th>
                                            <th className="no-border" width="15%">结论</th>
                                            <th className="no-border" width="15%">原因分类</th>
                                            <th className="no-border" width=""></th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <select className="select-gray searchType" name="" id="searchType" style={{"width":"95%"}}>
                                                    <option value="0" hidden>请选择</option>
                                                    <option value="yes">是</option>
                                                    <option value="no">否</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select className="select-gray methodTypeId" name="" id="methodTypeId" style={{"width":"95%"}}>
                                                    <option value="0" hidden>请选择沟通方式</option>
                                                    {
                                                        (this.state.methodInfoDTOS && this.state.methodInfoDTOS.length>0)?this.state.methodInfoDTOS.map((repy,i)=>{
                                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.id)} data-name={commonJs.is_obj_exist(repy.type)}>{commonJs.is_obj_exist(repy.result)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                            <td>
                                                <select className="select-gray afterReVisitStatusId" name="" id="afterReVisitStatusId" style={{"width":"95%"}}>
                                                    <option value="0" hidden>请选择状态</option> 
                                                    {
                                                        (this.state.queueContactResultEnums && this.state.queueContactResultEnums.length>0)?this.state.queueContactResultEnums.map((repy,i)=>{
                                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                            <td>
                                                <select className="select-gray" name="" id="xfdTopChange" style={{"width":"95%"}} onChange={this.xfdTopChange.bind(this)}>
                                                    <option value="0" hidden>请选择结论</option>
                                                    {
                                                        (platformFlag == 'AG' || platformFlag == 'SUPPLY')?
                                                            (this.state.ndTop && this.state.ndTop.length>0)?this.state.ndTop.map((repy,i)=>{
                                                                return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                            }):<option></option>
                                                        :
                                                            (this.state.xfdTop && this.state.xfdTop.length>0)?this.state.xfdTop.map((repy,i)=>{
                                                                return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                            }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                            <td>
                                                <select className="select-gray newXfdSecond" name="" id="newXfdSecond" style={{"width":"95%"}}>
                                                    <option value="0" hidden>需先选择结论</option>
                                                    {
                                                        (this.state.newXfdSecond && this.state.newXfdSecond.length>0)?this.state.newXfdSecond.map((repy,i)=>{
                                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="7">
                                                <span className="detail-t">案列记录</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="7">
                                                <textarea name="" id="avisitRecordDetail" cols="30" rows="10" className="commu-area textarea" style={{"width":"95%","height":"80px"}}></textarea>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="7" className="border-top">
                                                <button className="left block btn-blue" id='saveRcord' onClick={this.saveRcord.bind(this)}>保存</button>
                                                <button className="btn-white left block ml20" id='saveRcordCancle' onClick={this.cancelSaveQ.bind(this)}>取消</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                // ===== end
                                :""  //--判断是否展示结束
                            }
                        {/* Record end  */}
                        {/* Record list show start */}
                        <DealAvisitRecordList productNo={commonJs.is_obj_exist(queueInfoDTO.productNo)} data={recordDatas} />
                        {/* Record list show end */}
                    </div>
                </div>
            </div>
        )
    }
};

export default DealAvisit;  //ES6语法，导出模块