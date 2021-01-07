// 商户审核-审核queue - 小雨花
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import axios from '../../axios';
// 左侧页面
import CheckMsg from '../cp-module/checkMsg';  //=>用户详情-小雨花
import ProductCaseInfo from '../cp-search/productCaseInfo';  //=>产品方案信息-小雨花
import ShopBaseInfo from '../cp-search/shopBaseInfo';  //=>门店信息-小雨花 
import GoodsInfo from '../cp-search/GoodsInfo';  //=>商品信息-小雨花   
import OperateList from '../cp-search/operateList';  //=>操作记录-小雨花

import {observer,inject} from "mobx-react"; 
import { observable, action, computed ,configure,runInAction} from "mobx";
import { Modal,Tabs,Select } from 'antd';
const { Option } = Select;
const { TabPane } = Tabs;

@inject('allStore') @observer
class XYH_businessCheck extends React.Component{
    constructor(props){
        super(props);
        this.cooperationCountStore=this.props.allStore.CooperationCountStore;
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            lef_page:"",  //左边页面组件
            condition:{},  //存放搜索条件
            showOpraRecord:false,  //是否展示record操作框 ture展示，false隐藏 4 8 11 12
            withdrawReasonEnums:[],
            resetFuzzyVal:false,  //是否清空模糊查询框的值
            merchantStatusEnum:'LOAN_INPUT_EDU',
            showFileHistory:false,  //其他文件查看历史弹窗
            speciallyApproved:'false',//是否发起特批
            speciallyApprovedPassed:'false',//是否特批通过
            cooperated:'false',//已合作
        }
    }
    showModal = () => {
        this.setState({
            showFileHistory: true,
        });
    };
    handleCancel = e => {
        this.setState({
            showFileHistory: false,
        });
      };
    @action componentDidMount(){
        this.commonStore.modifyIng=false;
        this.commonStore.checkData={};
        this.changeLeftCP(0);
        commonJs.reloadRules();
        this.getCount();  //处理条数
    }
    
    /**
     *
     * 切换左侧组件，并根据需求决定是否切换右侧组件
     * @param index
     */
    changeLeftCP(index){
        var leftHtml = this.getLeftHtml(parseInt(index));
        this.setState({
            lef_page:leftHtml,
            leftPageNo:index
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
        switch (index){
            case 0:
                left_page=<CheckMsg tempType='businessCheck' searchHandle={this.searchHandle} />;
                break;
            case 1:
                left_page=<ProductCaseInfo />;
                break;
            case 2:
                left_page=<ShopBaseInfo />;
                break;
            case 3:
                left_page=<GoodsInfo />;
                break;
            case 4:
                left_page=<OperateList tempType='businessCheck' />;
                break;
                
        }
        return left_page;
    }
    cancleSaveRecord(isChangeLeft){
        cpCommonJs.cancleSaveRecord();
        this.commonStore.modifyIng=false;
        this.setState({
            mistakeFileSelected:null,
            errorModel:null
        });
        if(isChangeLeft){
            this.changeLeftCP(0);
        }
    }
    // 搜索 queueReloadEnum 传 SEARCH; isOldCondition为true则从state中获取搜索时的条件
    @action searchHandle=(queueReloadEnum,isOldCondition)=>{
        this.changeLeftCP(0);
        let _parem={};  //请求参数
        this.cancleSaveRecord();
        if(isOldCondition){  //保存recore时重新调取搜索接口
            _parem=this.state.condition;
        }else{
            let _chenel=this.state.cooperationFlag;
            if(!_chenel){
                _chenel='2C';
            }
            let _businessType=this.state.businessType;
            let _merchantName=$(".check-search .merchantName").val();  
            _parem.cooperationFlag=_chenel;
            if(_businessType)_parem.channelFrom=_businessType;
            if(_merchantName && _merchantName.replace(/\s/g,"")){
                _parem.merchantName=_merchantName.replace(/\s/g,"");
            }
            if(!_businessType && !_merchantName){
                alert("请输入任一搜索条件！");
                return;
            }

            _parem.merchantStatusEnum=this.state.merchantStatusEnum;
            this.setState({
                condition:_parem
            });
        }
        _parem.queueReloadEnum=queueReloadEnum;
        this.searchCommonFn(_parem,queueReloadEnum);
    }
    //获取绑定条数
    @action getCount(){
            let that=this;
            let cooperationFlag=this.state.cooperationFlag;
            if(!cooperationFlag){
                cooperationFlag='2C';
            }
            let _data={
                cooperationFlag:cooperationFlag
            };
            let _channelText=this.state.businessType;
            if(_channelText){
                _data.businessType=_channelText;
            }
            $.ajax({
                type:"get", 
                url:"/node/merchant/count", 
                async:true,
                dataType: "JSON", 
                // data:_data,
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
        this.commonStore.modifyIng=false;
        axios({
            method: 'POST',
            url:'/node/merchant/search',
            data:{josnParam:JSON.stringify(_parem)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.commonStore.checkData={};
                that.setState({
                    checkData:{}
                })
                that.changeLeftCP(0);
                return;
            }
            that.commonStore.checkData=data;
            that.setState({
                checkData:data
            })
            let bindStatus=commonJs.is_obj_exist(data.bindStatus);
            let bindBy=commonJs.is_obj_exist(data.bindBy);
            let merchantInfo=cpCommonJs.opinitionObj(data.merchantInfo);
            let queueStatusId=commonJs.is_obj_exist(merchantInfo.queueStatusId);
            if(bindStatus=='bind'){
                alert(`当前数据已被${bindBy}绑定！`)
            };
            that.setState({
                bindStatus:bindStatus,
                queueStatusId:queueStatusId
            });
            that.getCount();  //处理条数
            that.changeLeftCP(0);
        })
    }
    //搜索下一条
    @action searchNext(){
        this.commonStore.modifyIng=false;
        let that=this;
        this.cancleSaveRecord();
        cpCommonJs.clearCondition();
        let _parem={};  //请求参数
        let _businessType=this.state.businessType; 
        if(_businessType)_parem.channelFrom=_businessType;
        _parem.merchantStatusEnum=this.state.merchantStatusEnum;
        axios({
            method: 'POST',
            url:'/node/merchant/next',
            data:{josnParam:JSON.stringify(_parem)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let _data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.commonStore.checkData={};
                that.setState({
                    checkData:{}
                })
                that.changeLeftCP(0);
                return;
            }
            that.commonStore.checkData=_data;

            let bindStatus=commonJs.is_obj_exist(_data.bindStatus);
            let bindBy=commonJs.is_obj_exist(_data.bindBy);
            let merchantInfo=cpCommonJs.opinitionObj(_data.merchantInfo);
            let queueStatusId=commonJs.is_obj_exist(merchantInfo.queueStatusId);
            that.setState({
                checkData:_data,
                queueStatusId:queueStatusId,
                bindStatus:bindStatus,
                condition:{
                    merchantName:merchantInfo.merchantName,
                    queueReloadEnum:'RELOAD',
                    merchantStatusEnum:that.state.merchantStatusEnum,
                    cooperationFlag:'2C'
                }
            })
            that.getCount();  //处理条数
            if(bindStatus=='bind'){
                alert(`当前数据已被${bindBy}绑定！`)
            };
            that.changeLeftCP(0);
        })
    }
    //保存案件记录
    saveRecord(){
        let that=this;
        let _parem={};
        let checkData=cpCommonJs.opinitionObj(this.commonStore.checkData);
        let merchantInfo=cpCommonJs.opinitionObj(checkData.merchantInfo);
        let _caseContent=$(".caseRcord .caseContent").val();
        if(!_caseContent){
            alert('请填写详情！')
            return;
        }
        _parem.content=_caseContent;
        _parem.merchantNo=merchantInfo.merchantNo;
        _parem.businessLicense=merchantInfo.businessLicense;
        _parem.versionNo=merchantInfo.versionNo;

        $.ajax({
            type:"post", 
            url:"/node/merchant/case/save", 
            async:false,
            dataType: "JSON", 
            data:{josnParam:JSON.stringify(_parem)},
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _data=res.data;
                alert(_data.message);
                that.searchHandle('RELOAD',true);  //重载页面数据
                that.cancleSaveRecord();
           }
       })
    }
    // 保存审核reored
    saveCheck(){
        let that=this;
        let _parem={};
        let beforModifyData=cpCommonJs.opinitionObj(this.commonStore.beforModifyData);
        let afterModifyData=cpCommonJs.opinitionObj(this.commonStore.afterModifyData);
        let provinceCityIdAreaId_obj=cpCommonJs.opinitionObj(this.commonStore.provinceCityIdAreaId_obj);
        console.log('beforModifyData',beforModifyData,'afterModifyData',afterModifyData,'provinceCityIdAreaId_obj',provinceCityIdAreaId_obj);
        let _afterQueueStatusId=$(".QrecordInfo .queueContactResultEnums option:selected").attr('data-value');
        _parem=Object.assign(_parem,afterModifyData);
        if(Object.keys(provinceCityIdAreaId_obj).length>0){
            for(let key in provinceCityIdAreaId_obj){
                _parem[key]=provinceCityIdAreaId_obj[key];
            }
        }

        let _beforeQueueStatusId=cpCommonJs.opinitionObj(this.commonStore.checkData.merchantInfo).queueStatusId;
        if(!_beforeQueueStatusId){
            alert("未获取到操作之前的状态！");
            return;
        }
        _parem.beforeQueueStatusId=_beforeQueueStatusId;
        if(!_afterQueueStatusId){
            alert("请选择处理结果！");
            return;
        }
        _parem.afterQueueStatusId=_afterQueueStatusId;
        let _wrongDetail=this.state.errorModel; //有误信息
        if(_afterQueueStatusId==12 && !_wrongDetail){
            alert("请选择有误信息！");
            return;
        }
        if(_afterQueueStatusId==12 && _wrongDetail){
            _parem.errorModel=_wrongDetail;
        }

        let _caseContent=$(".checkRecord .caseContent").val();
        if(_afterQueueStatusId && (_afterQueueStatusId==12 || _afterQueueStatusId==11) && !_caseContent){  //信息有误 取消 案例记录必填
            alert("请填写备注信息！");
            return;
        }
        _parem.content=_caseContent;
        _parem.merchantStatusEnum=this.state.merchantStatusEnum;
        _parem.speciallyApproved = this.state.speciallyApproved=='true'?true:false;
        _parem.speciallyApprovedPassed = this.state.speciallyApprovedPassed=='true'?true:false;
        _parem.cooperated = this.state.cooperated=='true'?true:false;
        if(_afterQueueStatusId==4 && $('.warnBg').length>0){
            alert('请先完善左侧详细信息!');
            return;
        }
        axios({
            method: 'post',
            url:'/node/merchant/save',
            data:{josnParam:JSON.stringify(_parem)},
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.searchHandle('RELOAD',true);  //冲载页面数据
            that.cancleSaveRecord();
        })
    }
    //处理状态选拒绝时显示拒绝原因选项
    rejectSelect(event){
        $(".mistakeFile-td").addClass('hidden');
        let _value=$(event.target).find("option:selected").attr("data-value");
        if(_value=="12"){  //信息有误
            $(".mistakeFile-td").removeClass("hidden");
        }
        this.commonStore.modifyIng=true;
        this.changeLeftCP(0);
    }
    /**
     * 根据infoDTO里whetherFraud字段展示record处理状态-queueContactResultEnums
     * @param {*} whetherFraud infoDTO里whetherFraud字段
     * @param {*} oldStates 处理状态
     * @param {*} cooperationFlag 合作方标识 17C。。。。
     */
    dealStates(oldStates){
        let newStates=[];
        if(!oldStates || oldStates.length<=0){
            return;
        }
        for(let i=0;i<oldStates.length;i++){
            let oldStates_i=oldStates[i];
            if(oldStates_i.value==4||oldStates_i.value==12||oldStates_i.value==8||oldStates_i.value==11){ //展示 取消、跟进、完成（通过）、拒绝
                newStates.push(oldStates_i);
            }
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
    channelChange(event){
        let _thisVal=$(event.target).val();
        this.setState({
            businessType:_thisVal
        })
    }
    //有误文件	
    mistakeFileHandle=(mistakeFileSelected)=>{
        this.setState({
            errorModel:mistakeFileSelected
        })
    }
    //商户课程存疑
    standby2 = e => {
        this.setState({
            standby2: e.target.checked,
        });
      };
      //分期信息栏切换
      @action stagesInfoChange=(activeKey)=>{
        this.commonStore.currentStages=activeKey;
        if(activeKey=='teach'){
            this.setState({
                merchantStatusEnum:'LOAN_INPUT_EDU',
                cooperationFlag:'2C'
            })
        }else if(activeKey=='operator'){
            this.setState({
                merchantStatusEnum:'LOAN_INPUT_OPERATOR',
                cooperationFlag:'2C'
            })
        }else if(activeKey=='cosmetology'){
            this.setState({
                merchantStatusEnum:'LOAN_INPUT_COSMETOLOGY',
                cooperationFlag:'2C1'
            })
        }else if(activeKey=='hairdressing'){
            this.setState({
                merchantStatusEnum:'LOAN_INPUT_LIFE_COSMETOLOGY',
                cooperationFlag:'2C2'
            })
        }
        this.changeLeftCP(0);
      }
    render() {
        let checkData=cpCommonJs.opinitionObj(this.state.checkData);
        let caseRecordResponseDTOS=cpCommonJs.opinitionArray(checkData.caseRecordResponseDTOS);  //案件记录
        let merchantEnums=cpCommonJs.opinitionArray(checkData.merchantEnums);  //处理结果
        let count=this.cooperationCountStore.cooperationCount;
        let currentStages=this.commonStore.currentStages;  //商户审核页面 分期信息栏当前选中项  teach 教育分期 || operator 运营商3C分期
        let licenseImg=cpCommonJs.opinitionObj(checkData.licenseImg);
        let doorPhotoImg=cpCommonJs.opinitionObj(checkData.doorPhotoImg);
        let certFrontImg=cpCommonJs.opinitionObj(checkData.certFrontImg);
        let certBackImg=cpCommonJs.opinitionObj(checkData.certBackImg);
        let otherImg=cpCommonJs.opinitionArray(checkData.otherImg);

        let historyLicenseImg=cpCommonJs.opinitionObj(checkData.historyLicenseImg);
        let historyDoorPhotoImg=cpCommonJs.opinitionObj(checkData.historyDoorPhotoImg);
        let historyCertFrontImg=cpCommonJs.opinitionObj(checkData.historyCertFrontImg);
        let historyCertBackImg=cpCommonJs.opinitionObj(checkData.historyCertBackImg);
        let historyOtherImg=cpCommonJs.opinitionArray(checkData.historyOtherImg);

        return (
            <div className="content" id="content">
                {/* 处理条数 */}
                <div className="topBundleCounts gray-bar">
                    <b className="left ml40">累计准入商户数（家）<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.totalCompleteCount)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">待审核任务<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.unCheckCount)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">绑定中任务<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.bindCount)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">今日已完成任务<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.todayCompletedCount)}</span><span className="gray-font">条</span></b>
                </div>  
                <div className='bar mt10 stagesInfo'>
                    <Tabs defaultActiveKey="1" onChange={this.stagesInfoChange}>
                        <TabPane
                            tab={
                                <b>教育分期:( <span className="red">{commonJs.is_obj_exist(count.eduTotal)}</span> )</b>
                            }
                        key="teach"
                        >
                        </TabPane>
                        <TabPane
                            tab={
                                <b>运营商3C分期:( <span className="red">{commonJs.is_obj_exist(count.operationTotal)}</span> )</b>
                            }
                        key="operator"
                        >
                        </TabPane>
                        <TabPane
                            tab={
                                <b>医疗美容分期:( <span className="red">{commonJs.is_obj_exist(count.cosmetologyTotal)}</span> )</b>
                            }
                        key="cosmetology"
                        >
                        </TabPane>
                        <TabPane
                            tab={
                                <b>生活美容分期:( <span className="red">{commonJs.is_obj_exist(count.lifeCosmetologyTotal)}</span> )</b>
                            }
                        key="hairdressing"
                        >
                        </TabPane>
                    </Tabs>
                </div>
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar check-search clearfix mt10 overflow-auto" data-resetstate='businessType'>
                    {
                        <select name="" id="withOutReset" className="select-gray left mr10 chaenel withOutReset" onChange={this.channelChange.bind(this)}>
                            <option value="" data-optionId="0" hidden>请选择渠道来源</option>
                            <option value="" data-optionId="">全部</option>
                            {
                                (count.channelFroms&&count.channelFroms.length>0)?count.channelFroms.map((repy,i)=>{
                                    return <option value={commonJs.is_obj_exist(repy)} key={i}>{commonJs.is_obj_exist(repy)}</option>
                                }):<option value=""></option>
                            }
                        </select>
                    }
                    <input type="text" name="" placeholder="商户名称" className="input left mr20 merchantName" id='merchantName' />
                    <button className="left reset" onClick={commonJs.resetCondition.bind(this,this)} id='reset'>重置</button>
                    <button className="right mr15 search-next-btn" onClick={this.searchNext.bind(this)} id='searchNext'>搜索下一条</button>
                    <button className="right mr15 search-btn" onClick={this.searchHandle.bind(this,"SEARCH",false)} id='searchBtn'>搜索</button>
                </div>
                {/* 搜索条件 end */}
                <div className="mt20 clearfix">
                    <div className="left cont-left content-toggle  relative">
                        {/* tit-shadow */}
                        <div className="bar title-box Csearch-left-page clearfix">
                            <ul className="left ml10 mt5 nav">
                                <li className="on" data-id="0" onClick={this.changeLeftCP.bind(this,0,null)} id='custorInfo'>客户信息</li>
                                {/* <li data-id="1" onClick={this.changeLeftCP.bind(this,'1',null)} id='productInfo'>产品方案信息</li> */}
                                <li data-id="2" onClick={this.changeLeftCP.bind(this,'2',null)} id='shopInfo'>门店信息</li>
                                {/* <li data-id="3" onClick={this.changeLeftCP.bind(this,'3',null)} id='goodsInfo'>{currentStages=='operator'?'套餐信息':'商品信息'}</li>*/}
                                {(currentStages=='operator' || currentStages=='hairdressing')&&<li data-id="3" onClick={this.changeLeftCP.bind(this,'3',null)} id='goodsInfo'>套餐信息</li>}
                                <li data-id="4" onClick={this.changeLeftCP.bind(this,'4',null)} id='xyhOprateRecord'>操作记录</li>
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={cpCommonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        <div className="mt10">
                            {this.state.lef_page}
                            {
                                this.state.leftPageNo==0?
                                <div className="toggle-box mt5">
                                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" id='infomationTit' onClick={cpCommonJs.toggleUl.bind(this)}>
                                    资料信息
                                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                                    </h2>
                                    <ul className="file-list bar mt5 pl20"> 
                                    {
                                        Object.keys(licenseImg).length>0 ?
                                        <li>
                                            <b className="left file-tit">营业执照:
                                                <a target='_blank' id={'licenseImg'+licenseImg.id} href={`/node/view/file?fileId=${licenseImg.id}&filename=${licenseImg.fileName}`} className="left file-link blue-font elli" style={style.W60}>
                                                    {commonJs.is_obj_exist(licenseImg.fileName)}
                                                </a>
                                            </b>
                                            {
                                                historyLicenseImg.fileDownloadPath?
                                                <a target='_blank' id={'historyLicenseImg'+historyLicenseImg.id} href={`/node/view/file?fileId=${historyLicenseImg.id}&filename=${historyLicenseImg.fileName}`} className="left file-link blue-font">查看历史</a>:''
                                            }
                                        </li>:''
                                    }
                                    {
                                        Object.keys(doorPhotoImg).length>0?
                                        <li>
                                            <b className="left file-tit">门头照:
                                                <a target='_blank' id={'doorPhotoImg'+doorPhotoImg.id} href={`/node/view/file?fileId=${doorPhotoImg.id}&filename=${doorPhotoImg.fileName}`} className="left file-link blue-font elli" style={style.W60}>
                                                    {commonJs.is_obj_exist(doorPhotoImg.fileName)}
                                                </a>
                                            </b>
                                            {
                                                historyDoorPhotoImg.fileDownloadPath?
                                                <a target='_blank' id={'historyDoorPhotoImg'+historyDoorPhotoImg.id} href={`/node/view/file?fileId=${historyDoorPhotoImg.id}&filename=${historyDoorPhotoImg.fileName}`} className="left file-link blue-font">查看历史</a>:''
                                            }
                                        </li>:''
                                    }
                                    {
                                        Object.keys(certFrontImg).length>0?
                                        <li>
                                            <b className="left file-tit">身份证正面照:
                                                <a target='_blank' id={'certFrontImg'+certFrontImg.id} href={`/node/view/file?fileId=${certFrontImg.id}&filename=${certFrontImg.fileName}`} className="left file-link blue-font elli" style={style.W60}>
                                                    {commonJs.is_obj_exist(certFrontImg.fileName)}
                                                </a>
                                            </b>
                                            {
                                                historyCertFrontImg.fileDownloadPath?
                                                <a target='_blank' id={'historyCertFrontImg'+historyCertFrontImg.id} href={`/node/view/file?fileId=${historyCertFrontImg.id}&filename=${historyCertFrontImg.fileName}`} className="left file-link blue-font">查看历史</a>:''
                                            }
                                        </li>:''
                                    }
                                    {
                                        Object.keys(certBackImg).length>0?
                                        <li>
                                            <b className="left file-tit">身份证反面照:
                                                <a target='_blank' id={'certBackImg'+certBackImg.id} href={`/node/view/file?fileId=${certBackImg.id}&filename=${certBackImg.fileName}`} className="left file-link blue-font elli" style={style.W60}>
                                                    {commonJs.is_obj_exist(certBackImg.fileName)}
                                                </a>
                                            </b>
                                            {
                                                historyCertBackImg.fileDownloadPath?
                                                <a target='_blank' id={'historyCertBackImg'+historyCertBackImg.id} href={`/node/view/file?fileId=${historyCertBackImg.id}&filename=${historyCertBackImg.fileName}`} className="left file-link blue-font">查看历史</a>:''
                                            }
                                        </li>:''
                                    }
                                    {
                                        otherImg.length>0?
                                        otherImg.map((repy,i)=>{
                                            return <li key={i}>
                                                        <b className="left file-tit">{commonJs.is_obj_exist(repy.originalFileName)}
                                                            <a target='_blank' id={'otherImg'+i} href={`/node/view/file?fileId=${repy.id}&filename=${repy.fileName}`} className="left file-link blue-font elli" style={style.W60}>
                                                                {commonJs.is_obj_exist(repy.fileName)}
                                                            </a>
                                                        </b>
                                                        {
                                                            historyOtherImg.length>0?
                                                            <a id={'historyOtherImg'+i} onClick={this.showModal} className="left file-link blue-font">查看历史</a>:''
                                                        }
                                                    </li>
                                        }):''
                                    }
                                    </ul>
                                </div>:''
                            }
                            
                        </div>
                    </div>
                    <div className="right cont-right content-toggle">
                        {/* record list */}
                        <div className="toggle-box">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={commonJs.content_toggle.bind(this)}>
                            案件记录
                                <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                            </h2>
                            <div className='bar mt3'>
                                <table className="pt-table commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                    <tbody>
                                        {
                                        caseRecordResponseDTOS.length>0 ? caseRecordResponseDTOS.map((repy,index)=>{
                                            return <tr key={index}>
                                                <td className="no-padding-left">
                                                    <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                        <tbody>
                                                            <tr>
                                                                <td width="10%">{index}</td>
                                                                <td width="45%" title={commonJs.is_obj_exist(repy.createdBy)}>{commonJs.is_obj_exist(repy.createdBy)}</td>
                                                                <td width="45%" title={commonJs.is_obj_exist(repy.createdAt)}>{commonJs.is_obj_exist(repy.createdAt)}</td>
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
                                        <td>
                                            <span className="detail-t">详情</span>
                                        </td>
                                    </tr>
                                    <tr className="recordDetail">
                                        <td>
                                            <textarea name="" id="" cols="30" rows="10" className="commu-area textarea caseContent" style={{"width":"95%","height":"80px"}}></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <button className="left block btn-blue" onClick={this.saveRecord.bind(this)}>保存</button>
                                            <button className="btn-white left block ml20" onClick={this.cancleSaveRecord.bind(this)}>取消</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {
                            (this.state.bindStatus=='bind' || this.state.queueStatusId==4 ||this.state.queueStatusId==8 ||this.state.queueStatusId==11 ||this.state.queueStatusId==12)?'':
                            <div className="mt10">
                                <div className="bar clearfix bar-tit pl20 pr20 toggle-tit">审核</div>
                                <table className="radius-tab mt3 CPS-edit-div QrecordInfo checkRecord flow-auto" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <span className='mr10'>是否发起特批:</span>
                                                <select className="select-gray queueContactResultEnums" name="" id="queueContactResultEnums" style={{"width":"200px"}} onChange={this.rejectSelect.bind(this)}>
                                                    <option value="" data-show="no" hidden>请选择处理结果</option>
                                                    {
                                                        (merchantEnums && merchantEnums.length>0)?merchantEnums.map((repy,i)=>{
                                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                            <td>
                                                <div className="mistakeFile-td hidden" data-hide='yes' id='mistakeFile'>
                                                    <Select
                                                        // value={this.state.errorModel}
                                                        onChange={this.mistakeFileHandle}
                                                        placeholder="请选择有误信息"
                                                        style={{ width: 200 }}
                                                    >
                                                        <Option value="商户基本信息">商户基本信息</Option>
                                                        <Option value="法定代表/负责人信息">法定代表/负责人信息</Option>
                                                        <Option value="联系人信息">联系人信息</Option>
                                                        <Option value="资料信息">资料信息</Option>
                                                    </Select>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className='mr10'>是否发起特批:</span>
                                                <Select 
                                                    value={this.state.speciallyApproved}
                                                    style={{ width: 150 }}
                                                    onChange={(v)=>{
                                                        this.setState({
                                                            speciallyApproved:v
                                                        })
                                                    }}
                                                >
                                                    <Option value='true' >是</Option>
                                                    <Option value='false'>否</Option>
                                                </Select>
                                            </td>
                                            <td>
                                                <span className='mr10'>是否特批通过:</span>
                                                <Select 
                                                    value={this.state.speciallyApprovedPassed}
                                                    style={{ width: 150 }}
                                                    onChange={(v)=>{
                                                        this.setState({
                                                            speciallyApprovedPassed:v
                                                        })
                                                    }}
                                                >
                                                    <Option value='true' >是</Option>
                                                    <Option value='false'>否</Option>
                                                </Select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className='mr10'>已合作:</span>
                                                <Select 
                                                    value={this.state.cooperated}
                                                    style={{ width: 150 }}
                                                    onChange={(v)=>{
                                                        this.setState({
                                                            cooperated:v
                                                        })
                                                    }}
                                                >
                                                    <Option value='true' >是</Option>
                                                    <Option value='false'>否</Option>
                                                </Select>
                                            </td>
                                        </tr>
                                        <tr className="recordDetail">
                                            <td colSpan="2">
                                                <span className='mr10'>备注:</span>
                                                <textarea name="" id="caseContent" cols="30" rows="10" className="commu-area textarea caseContent" style={{"width":"95%","height":"80px"}}></textarea>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2">
                                                <button className="left block btn-blue" id='saveCheck' onClick={this.saveCheck.bind(this)}>保存</button>
                                                <button className="btn-white left block ml20" id='saveCheckCancle' onClick={this.cancleSaveRecord.bind(this,true)}>取消</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        }
                    </div>
                </div>
                <Modal
                    title="查看历史文件"
                    visible={this.state.showFileHistory}
                    onCancel={this.handleCancel}
                    footer={null}
                    >
                    <ul className="file-list bar mt5 pl20"> 
                    {
                        historyOtherImg.length>0?historyOtherImg.map((repy,i)=>{
                            return <li key={i}>
                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.originalFileName)}
                                        <a id={'historyOtherImgPop'+i} className="left file-link blue-font elli" style={style.W60}>
                                            {commonJs.is_obj_exist(repy.fileName)}
                                        </a>
                                    </b>
                                    <a target='_blank' id={'historyOtherImgPopShow'+i} href={`/node/view/file?fileId=${repy.id}&filename=${repy.fileName}`} className="left file-link blue-font">查看</a>
                                </li>
                        }):<li>历史数据为空！</li>
                    }
                    </ul>
                </Modal>
            </div>
        )
    }
};

const style={
    W60:{width:'60%'}
}
export default XYH_businessCheck;  //ES6语法，导出模块