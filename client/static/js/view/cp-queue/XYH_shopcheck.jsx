// 门店审核-审核queue - 小雨花
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import axios from '../../axios';
// 左侧页面
import CheckMsg from '../cp-module/checkMsg';  //=>用户详情-小雨花
import OperateList from '../cp-search/operateList';  //=>操作记录-小雨花

import {observer,inject} from "mobx-react"; 
import { observable, action, computed ,configure,runInAction} from "mobx";
import { Tabs,Modal } from 'antd';
const { TabPane } = Tabs;

@inject('allStore') @observer
class XYH_shopcheck extends React.Component{
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
            activeKey:1
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
        let query=cpCommonJs.opinitionObj(this.props.location.query);
        let _storeName=query.storeName;
        let _businessType=query.businessType;
        let pathname=this.props.location.pathname;
        let checkStep=pathname.substr(pathname.length-1,1);
        this.setState({
            checkStep,
        },()=>{
            this.getCount();  //处理条数
            this.commonStore.modifyIng=false;
            this.commonStore.checkData={};
            this.changeLeftCP(0);
            commonJs.reloadRules();
            if(_storeName){
                $(".check-search .storeName").val(_storeName);
                this.searchCommonFn({storeName:_storeName},'',_businessType);
            }else{
                $(".check-search .storeName").val('');
            }
        })
        
    }
    @action UNSAFE_componentWillReceiveProps(nextProps){
        let pathname=nextProps.location.pathname;
        let checkStep=pathname.substr(pathname.length-1,1);
        this.setState({
            checkStep
        },()=>{
            if(nextProps.location.action=='PUSH'){
                this.commonStore.modifyIng=false;
                this.commonStore.checkData={};
                this.changeLeftCP(0);
                commonJs.reloadRules();
                this.getCount();  //处理条数
                let query=cpCommonJs.opinitionObj(this.props.location.query);
                let _storeName=query.storeName;
                let _businessType=query.businessType;
                if(_storeName){
                    $(".check-search .storeName").val(_storeName);
                    this.searchCommonFn({storeName:_storeName},'',_businessType);
                }else{
                    $(".check-search .storeName").val('');
                }
            }
        })
        
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
                left_page=<CheckMsg tempType='shopcheck' searchHandle={this.searchHandle} />;
                break;
            case 1:
                left_page=<OperateList tempType='shopcheck' />;
                break;
        }
        return left_page;
    }
    cancleSaveRecord(isChangeleft){
        cpCommonJs.cancleSaveRecord();
        this.commonStore.modifyIng=false;
        this.setState({
            wrongInfo:null
        })
        if(isChangeleft){
            this.changeLeftCP(0);
        }
    }
    /**
     * 搜索
     * @param {*} queueReloadEnum 传 SEARCH
     * @param {*} isOldCondition isOldCondition为true则从state中获取搜索时的条件
     * @param {*} type 搜索 或者 搜索下一条 按钮。 下一条传 next
     */
    @action searchHandle=(queueReloadEnum,isOldCondition,type)=>{
        this.changeLeftCP(0);
        let _parem={};  //请求参数
        this.cancleSaveRecord();
        if(isOldCondition){  //保存recore时重新调取搜索接口
            _parem=this.state.condition;
        }else{
            let _businessType=this.state.businessType;
            let _merchantName=$(".check-search .storeName").val(); 
            if(_businessType)_parem.merchantName=_businessType;
            if(_merchantName && _merchantName.replace(/\s/g,"")){
                _parem.storeName=_merchantName.replace(/\s/g,"");
            }
            _parem.businessType=this.state.merchantStatusEnum;
            this.setState({
                condition:_parem
            });
        }
        _parem.searchEnum=queueReloadEnum;
        this.searchCommonFn(_parem,type);
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
            _data.checkStep=this.state.checkStep;
            $.ajax({
                type:"get", 
                url:"/node/merchant/store/getCount", 
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
    /**
     * 搜索公共方法
     * @param {*} _parem  搜索条件
     * @param {*} type 搜索 或者 搜索下一条 按钮 下一条传 next
     * @param {*} businessType 从商户审核跳转过来时，参数从链接中获取。
     */
    @action searchCommonFn(_parem,type,businessType){
        let that=this;
        _parem.checkStep=this.state.checkStep;
        if(businessType){
            _parem.businessType=businessType; 
            let _obj={
                'LOAN_INPUT_EDU':'teach',
                'LOAN_INPUT_OPERATOR':'operator',
                'LOAN_INPUT_COSMETOLOGY':'cosmetology',
                'LOAN_INPUT_LIFE_COSMETOLOGY':'hairdressing'
            };
            this.stagesInfoChange(_obj[businessType]); //tabs 对应切换，并存储相关配置
        }
        
        axios({
            method: 'get',
            url:'/node/merchant/store/getNext',
            params:_parem,
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.commonStore.checkData={};
                that.changeLeftCP(0);
                return;
            }
            that.commonStore.checkData=data;
            let merchantStoreCheck=cpCommonJs.opinitionObj(data.merchantStoreCheck);
            let bindStatus=commonJs.is_obj_exist(merchantStoreCheck.isValid);
            let bindBy=commonJs.is_obj_exist(merchantStoreCheck.bindBy);
            let queueStatusId=commonJs.is_obj_exist(merchantStoreCheck.queueStatusId);
            if(bindStatus==0 && bindBy!=that.commonStore.loginname_cn){
                alert(`当前数据已被${bindBy}绑定！`)
            }
            let shopExamineInfo=cpCommonJs.opinitionObj(data.shopExamineInfo);
            let shopPortalDetail=cpCommonJs.opinitionObj(shopExamineInfo.shopPortalDetail);
            that.setState({
                bindStatus:bindStatus,
                bindBy:bindBy,
                queueStatusId:queueStatusId,
            })
            
            if(type=='next'){
                that.setState({
                    condition:{
                        storeNo:merchantStoreCheck.storeNo,
                        versionNo:merchantStoreCheck.versionNo
                    }
                })
            }
            that.commonStore.modifyIng=false;
            that.getCount();  //处理条数
            that.changeLeftCP(0);
        })
    }
    //保存案件记录
    saveRecord(){
        let that=this;
        let _parem={};
        let checkData=cpCommonJs.opinitionObj(this.commonStore.checkData);
        let merchantStoreCheck=cpCommonJs.opinitionObj(checkData.merchantStoreCheck);
        let _caseContent=$(".caseRcord .caseContent").val();
        if(!_caseContent){
            alert('请填写详情！')
            return;
        }
        _parem.content=_caseContent;
        _parem.storeNo=merchantStoreCheck.storeNo;
        _parem.versionNo=merchantStoreCheck.versionNo;
        _parem.merchantName=merchantStoreCheck.belongMerchant;
        _parem.submitTime=merchantStoreCheck.submitTime;
        _parem.storeName=merchantStoreCheck.storeName;
        _parem.checkStep=this.state.checkStep;
        $.ajax({
            type:"post", 
            url:"/node/merchant/store/saveCase", 
            async:false,
            dataType: "JSON", 
            data:{josnParam:JSON.stringify(_parem)},
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _data=res.data;
                alert(_data.message);
                that.searchHandle('RELOAD',true);  //冲载页面数据
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
        let checkData=cpCommonJs.opinitionObj(this.commonStore.checkData);
        let merchantStoreCheck=cpCommonJs.opinitionObj(checkData.merchantStoreCheck);
        _parem.storeNo=merchantStoreCheck.storeNo;
        _parem.versionNo=merchantStoreCheck.versionNo;
        _parem.merchantName=merchantStoreCheck.belongMerchant;
        _parem.submitTime=merchantStoreCheck.submitTime;
        _parem.storeName=merchantStoreCheck.storeName;
        console.log('beforModifyData',beforModifyData,'afterModifyData',afterModifyData,'provinceCityIdAreaId_obj',provinceCityIdAreaId_obj);
        let _afterQueueStatusId=$(".QrecordInfo .queueContactResultEnums option:selected").attr('data-value');
        _parem.shopDetail=afterModifyData;
        if(Object.keys(provinceCityIdAreaId_obj).length>0){
            for(let key in provinceCityIdAreaId_obj){
                _parem.shopDetail[key]=provinceCityIdAreaId_obj[key];
            }
        }

        _parem.shopDetail.shopNo=merchantStoreCheck.storeNo;
        if(!_afterQueueStatusId){
            alert("请选择处理结果！");
            return;
        }
        _parem.afterQueueStatusId=_afterQueueStatusId;
        let _beforeQueueStatusId=merchantStoreCheck.queueStatusId;
        if(!_beforeQueueStatusId){
            alert("未获取到操作之前的状态！");
            return;
        }
        _parem.beforeQueueStatusId=_beforeQueueStatusId;
        let _wrongDetail=this.state.wrongInfo; //有误信息
        if(_afterQueueStatusId==12 && !_wrongDetail){
            alert("请选择有误信息！");
            return;
        }
        if(_afterQueueStatusId==12 && _wrongDetail){
            _parem.wrongInfo=_wrongDetail;
        }

        let _caseContent=$(".checkRecord .caseContent").val();
        if((_afterQueueStatusId==11 || _afterQueueStatusId==12) && !_caseContent.replace(/\s/g,'')){
            alert('请填写备注信息!');
            return;
        }
        _parem.content=_caseContent;
        _parem.businessType=this.state.merchantStatusEnum;
        _parem.checkStep=this.state.checkStep;
        if(_afterQueueStatusId==4 && $('.warnBg').length>0){
            alert('请先完善左侧详细信息!');
            return;
        }
        axios({
            method: 'post',
            url:'/node/merchant/store/saveCheck',
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
    mistakeFileHandle=(e)=>{
        this.setState({
            wrongInfo:$(e.target).find("option:selected").attr("value")
        })
    }
      //分期信息栏切换
      @action stagesInfoChange=(activeKey)=>{
        this.commonStore.currentStages=activeKey;
        if(activeKey=='teach'){  
            this.setState({
                merchantStatusEnum:'LOAN_INPUT_EDU',
                cooperationFlag:'2C',
                activeKey:activeKey
            })
        }else if(activeKey=='operator'){
            this.setState({
                merchantStatusEnum:'LOAN_INPUT_OPERATOR',
                cooperationFlag:'2C',
                activeKey:activeKey
            })
        }else if(activeKey=='cosmetology'){
            this.setState({
                merchantStatusEnum:'LOAN_INPUT_COSMETOLOGY',
                cooperationFlag:'2C1',
                activeKey:activeKey
            })
        }else if(activeKey=='hairdressing'){
            this.setState({
                merchantStatusEnum:'LOAN_INPUT_LIFE_COSMETOLOGY',
                cooperationFlag:'2C2',
                activeKey:activeKey
            })
        }
        this.changeLeftCP(0);
      }
    render() {
        let checkData=cpCommonJs.opinitionObj(this.commonStore.checkData);
        let caseRecords=cpCommonJs.opinitionArray(checkData.caseRecords);  //案件记录
        const infoDTO=cpCommonJs.opinitionObj(this.state.infoDTO);
        let cooperationCount=cpCommonJs.opinitionObj(this.cooperationCountStore.cooperationCount);
        let count=cpCommonJs.opinitionObj(cooperationCount.count);
        let queueStatusEnum=cpCommonJs.opinitionArray(cooperationCount.queueStatusEnum);  //处理结果
        let currentStages=this.commonStore.currentStages;  //商户审核页面 分期信息栏当前选中项  teach 教育分期 || operator 运营商3C分期
        let merchantList=cpCommonJs.opinitionArray(cooperationCount.merchantList);  //商户列表
        let shopFiles=cpCommonJs.opinitionObj(checkData.shopFiles);  //文件信息
        let licenseImg=cpCommonJs.opinitionArray(shopFiles.licenseImg);
        let doorPhotoImg=cpCommonJs.opinitionArray(shopFiles.doorPhotoImg);
        let certFrontImg=cpCommonJs.opinitionArray(shopFiles.certFrontImg);
        let certBackImg=cpCommonJs.opinitionArray(shopFiles.certBackImg);

        let historyLicenseImg=cpCommonJs.opinitionArray(shopFiles.historyLicenseImg);
        let historyDoorPhotoImg=cpCommonJs.opinitionArray(shopFiles.historyDoorPhotoImg);
        let historyCertFrontImg=cpCommonJs.opinitionArray(shopFiles.historyCertFrontImg);
        let historyCertBackImg=cpCommonJs.opinitionArray(shopFiles.historyCertBackImg);
        let historyOtherImg=cpCommonJs.opinitionArray(shopFiles.historyOtherImg);

        return (
            <div className="content" id="content">
                {/* 处理条数 */}
                <div className="topBundleCounts gray-bar">
                    <b className="left ml40">累计准入门店数（家）<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.totalCompleteCount)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">待审核任务<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.unCheckCount)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">绑定中任务<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.bindCount)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">今日已完成任务<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.todayCompletedCount)}</span><span className="gray-font">条</span></b>
                </div>  
                <div className='bar mt10 stagesInfo'>
                    <Tabs defaultActiveKey='1' activeKey={this.state.activeKey} onChange={this.stagesInfoChange}>
                        <TabPane
                            tab={
                                <b>教育分期:( <span className="red">{commonJs.is_obj_exist(count.teachCount)}</span> )</b>
                            }
                        key="teach"
                        >
                        </TabPane>
                        <TabPane
                            tab={
                                <b>运营商3C分期:( <span className="red">{commonJs.is_obj_exist(count.operatorCount)}</span> )</b>
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
                            <option value="" data-optionId="0" hidden>请选择所属商户</option>
                            <option value="" data-optionId="">全部</option>
                            {
                                merchantList.length>0?merchantList.map((repy,i)=>{
                                    return <option value={commonJs.is_obj_exist(repy)} key={i}>{commonJs.is_obj_exist(repy)}</option>
                                }):<option value=""></option>
                            }
                        </select>
                    }
                    <input type="text" name="" placeholder="门店名称" className="input left mr20 storeName" id='storeName' />
                    <button className="left reset" onClick={commonJs.resetCondition.bind(this,this)} id='reset'>重置</button>
                    <button className="right mr15 search-next-btn" onClick={this.searchHandle.bind(this,"NEXT",false,'next')} id='searchNext'>搜索下一条</button>
                    <button className="right mr15 search-btn" onClick={this.searchHandle.bind(this,"SEARCH",false,'search')} id='searchNext'>搜索</button>
                </div>
                {/* 搜索条件 end */}
                <div className="mt20 clearfix">
                    <div className="left cont-left content-toggle  relative">
                        {/* tit-shadow */}
                        <div className="bar title-box Csearch-left-page clearfix">
                            <ul className="left ml10 mt5 nav">
                                <li className="on" data-id="0" onClick={this.changeLeftCP.bind(this,0,null)}>客户信息</li>
                                <li data-id="1" onClick={this.changeLeftCP.bind(this,'1',null)}>操作记录</li>
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={cpCommonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        <div className="mt10">
                            {this.state.lef_page}
                            {
                                this.state.leftPageNo==0?
                                <div className="toggle-box mt5">
                                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                                    资料信息
                                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                                    </h2>
                                    <ul className="file-list bar mt5 pl20"> 
                                    {
                                        licenseImg.length>0?
                                        <li>
                                            <b className="left file-tit">营业执照:
                                            {
                                                licenseImg[0]?
                                                <a target='_blank' id={'licenseImg'+licenseImg[0].id} href={`/node/view/file?fileId=${licenseImg[0].id}&filename=${licenseImg[0].fileName}`} className="left file-link blue-font elli" style={style.W60}>
                                                    {commonJs.is_obj_exist(licenseImg[0].fileName?licenseImg[0].fileName:'')}
                                                </a>:''
                                            }
                                            </b>
                                            {
                                                historyLicenseImg[0]?
                                                <a target='_blank' id={'historyLicenseImg'+historyLicenseImg[0].id} href={`/node/view/file?fileId=${historyLicenseImg[0].id}&filename=${historyLicenseImg[0].fileName}`} className="left file-link blue-font">查看历史</a>:''
                                            }
                                            
                                        </li>:''
                                    }
                                    {
                                        doorPhotoImg.length>0?
                                        <li>
                                            <b className="left file-tit">门头照:
                                            {
                                                doorPhotoImg[0]?
                                                <a target='_blank' id={'doorPhotoImg'+doorPhotoImg[0].id} href={`/node/view/file?fileId=${doorPhotoImg[0].id}&filename=${doorPhotoImg[0].fileName}`} className="left file-link blue-font elli" style={style.W60}>
                                                    {commonJs.is_obj_exist(doorPhotoImg[0].fileName?doorPhotoImg[0].fileName:'')}
                                                </a>:''
                                            }
                                            </b>
                                            {
                                                historyDoorPhotoImg[0]?
                                                <a target='_blank' id={'historyDoorPhotoImg'+historyDoorPhotoImg[0].id} href={`/node/view/file?fileId=${historyDoorPhotoImg[0].id}&filename=${historyDoorPhotoImg[0].fileName}`} className="left file-link blue-font">查看历史</a>:''
                                            }
                                        </li>:''
                                    }
                                    {
                                        certFrontImg.length>0?
                                        <li>
                                            <b className="left file-tit">身份证正面照:
                                            {
                                                certFrontImg[0]?
                                                <a target='_blank' id={'certFrontImg'+certFrontImg[0].id} href={`/node/view/file?fileId=${certFrontImg[0].id}&filename=${certFrontImg[0].fileName}`} className="left file-link blue-font elli" style={style.W60}>
                                                    {commonJs.is_obj_exist(certFrontImg[0].fileName?certFrontImg[0].fileName:'')}
                                                </a>:''
                                            }
                                            </b>
                                            {
                                                historyCertFrontImg[0]?
                                                <a target='_blank' id={'historyCertFrontImg'+historyCertFrontImg[0].id} href={`/node/view/file?fileId=${historyCertFrontImg[0].id}&filename=${historyCertFrontImg[0].fileName}`} className="left file-link blue-font">查看历史</a>:''
                                            }
                                        </li>:''
                                    }

                                    {
                                        certBackImg.length>0?
                                        <li>
                                            <b className="left file-tit">身份证反面照:
                                            {
                                                certBackImg[0]?
                                                <a target='_blank' id={'certBackImg'+certBackImg[0].id} href={`/node/view/file?fileId=${certBackImg[0].id}&filename=${certBackImg[0].fileName}`} className="left file-link blue-font elli" style={style.W60}>
                                                    {commonJs.is_obj_exist(certBackImg[0].fileName?certBackImg[0].fileName:'')}
                                                </a>:''
                                            }
                                            </b>
                                            {
                                                historyCertBackImg[0]?
                                                <a target='_blank' id={'historyCertBackImg'+historyCertBackImg[0].id} href={`/node/view/file?fileId=${historyCertBackImg[0].id}&filename=${historyCertBackImg[0].fileName}`} className="left file-link blue-font">查看历史</a>:''
                                            }
                                        </li>:''
                                    }
                                    {
                                        cpCommonJs.opinitionArray(shopFiles.otherImg).length>0?
                                        shopFiles.otherImg.map((repy,i)=>{
                                            return <li key={i}>
                                                        <b className="left file-tit">其他资料:
                                                            <a target='_blank' id={'otherImg'+repy.id} href={`/node/view/file?fileId=${repy.id}&filename=${repy.fileName}`} className="left file-link blue-font elli" style={style.W60}>
                                                                {commonJs.is_obj_exist(repy.fileName)}
                                                            </a>
                                                        </b>
                                                        {
                                                            historyOtherImg.length>0?
                                                            <a id='historyOtherImg' onClick={this.showModal} className="left file-link blue-font">查看历史</a>:''
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
                                        caseRecords.length>0 ? caseRecords.map((repy,index)=>{
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
                                                                    <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(repy.content)}>{commonJs.is_obj_exist(repy.content)}</p>
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
                            ((this.state.bindStatus==0 && this.state.bindBy!=this.commonStore.loginname_cn) || this.state.queueStatusId!=1)?'':
                            <div className="mt10">
                                <div className="bar clearfix bar-tit pl20 pr20 toggle-tit">审核</div>
                                <table className="radius-tab mt3 CPS-edit-div QrecordInfo checkRecord flow-auto" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                    <tbody>
                                        <tr>
                                            <th className="no-border" width="20%">处理结果</th>
                                            <th className="no-border mistakeFile-td hidden" data-hide='yes' width="20%"></th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <select className="select-gray queueContactResultEnums" name="" id="queueContactResultEnums" style={{"width":"95%"}} onChange={this.rejectSelect.bind(this)}>
                                                    <option value="" data-show="no" hidden>请选择处理结果</option>
                                                    {
                                                        (queueStatusEnum && queueStatusEnum.length>0)?queueStatusEnum.map((repy,i)=>{
                                                            let displayName=commonJs.is_obj_exist(repy.displayName);
                                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{displayName=='放款'?'通过':displayName}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                            <td className="mistakeFile-td hidden" data-hide='yes'>
                                                <select className="select-gray" name="" id="mistakeFile" style={{"width":"95%"}} onChange={this.mistakeFileHandle.bind(this)}>
                                                    <option value="" data-show="no" hidden>请选择有误信息</option>
                                                    {
                                                        (checkData.wrongList && checkData.wrongList.length>0)?checkData.wrongList.map((repy,i)=>{
                                                            return <option key={i} value={repy}>{repy}</option>
                                                        }):<option></option>
                                                    }
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2">
                                                <span className="detail-t">备注</span>
                                            </td>
                                        </tr>
                                        <tr className="recordDetail">
                                            <td colSpan="2">
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
                                    <b className="left file-tit">其他资料：
                                        <a target='_blank' id={'historyOtherImgPop'+i} className="left file-link blue-font elli" style={style.W60}>
                                            {commonJs.is_obj_exist(repy.fileName)}
                                        </a>
                                    </b>
                                    <a target='_blank' id={'historyOtherImgPopShow'+repy.id} href={`/node/view/file?fileId=${repy.id}&filename=${repy.fileName}`} className="left file-link blue-font">查看</a>
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
export default XYH_shopcheck;  //ES6语法，导出模块