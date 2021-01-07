// 门店审核  -   cp-portal
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import DealAmount from '../cp-module/dealAmount';  //处理条数 
import RecordList from '../cp-module/recordList';  //record展示\
import ShopMsg from '../cp-module/shopMsg';  //门店审核详情
import ShopMsgHistory from '../cp-module/shopMsgHistory';  //门店审核-历史修改记录

import {observer,inject} from "mobx-react"; 
import { observable, action, computed ,configure,runInAction} from "mobx";

@inject('allStore') @observer
class ShopCheck extends React.Component{
    constructor(props){
        super(props);
        this.store=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.state={
            storeIdentityInfoDTO:{}, //详情
            storeQueueInfoDTO:{},  //queue信息
            recordInfoDTOS:[],  //门店审核案例记录信息
            rejectCauseDictionaryInfoDTOS:[], //拒绝原因
            queueContactResultEnums:[],  //处理状态
            condition:{},  //存放搜索条件
            showOpraRecord:false  //是否展示record操作框 ture展示，false隐藏
        }
    }

    @action UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps.location.action=='POP'){
            this.changeLeftCP(0);
            this.store.restoreUserInfo();
            commonJs.reloadRules();
            this.props.allStore.CooperationCountStore.getCooperationCount("/node/store/storeCount");  //处理条数
        }
    }

    // 搜索 queueReloadEnum 传 SEARCH; isOldCondition为true则从state中获取搜索时的条件
    @action searchHandle(queueReloadEnum,isOldCondition){
        let that=this;
        let _parem={};  //请求参数
        cpCommonJs.cancleSaveRecord();
        if(isOldCondition){  //保存recore时重新调取搜索接口
            _parem=this.state.condition;
        }else{
            let _chenel=$(".check-search .chaenel option:selected").val();
            if(!_chenel){
                alert("请先选择合作方！");
                return;
            }
            let _storeName=$(".check-search .StoreName").val();  // storeName
            let _storeId=$(".check-search .StordID").val();  // StordID
            if(!_storeName && !_storeId){
                alert("请输入任一搜索条件！");
                return;
            }
            _parem.productNo=_chenel;
            if(_storeName){
                _storeName=_storeName.replace(/\s/g,"");
                _parem.storeName=_storeName;
            }
            if(_storeId){
                _storeId=_storeId.replace(/\s/g,"");
                _parem.storeId=_storeId;
            }
            this.setState({
                condition:_parem
            });
        }
        _parem.queueReloadEnum=queueReloadEnum;
        $.ajax({
             type:"post", 
             url:"/node/store/searchStore", 
             async:true,
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
                        storeIdentityInfoDTO:{}, //详情
                        storeQueueInfoDTO:{},  //queue信息
                        recordInfoDTOS:[],  //门店审核案例记录信息
                        rejectCauseDictionaryInfoDTOS:[], //拒绝原因
                        queueContactResultEnums:[],  //处理状态
                        searchResult:{}
                    })
                     return;
                }
                let _data=res.data;
                if(_data.bindStatus&&_data.bindStatus=="bind"){
                    alert("当前queue已被"+_data.bindBy+"绑定！");
                    that.setState({
                        showOpraRecord:false
                    })
                }else if(_data.storeQueueInfoDTO.queueStatusId==4 || _data.storeQueueInfoDTO.queueStatusId==11){
                    that.setState({
                        showOpraRecord:false
                    })
                }else{
                    that.setState({
                        showOpraRecord:true
                    })
                }
                let _storeIdentityInfoDTO=_data.storeIdentityInfoDTO?_data.storeIdentityInfoDTO:{}; //详情
                //判断文件数据，并放到storeIdentityInfoDTO对象
                if(_data.storeContractId){
                    _storeIdentityInfoDTO.storeContractId=_data.storeContractId
                }
                if(_data.businessLicenseFileId){
                    _storeIdentityInfoDTO.businessLicenseFileId=_data.businessLicenseFileId
                }
                if(_data.leaseagreementId){
                    _storeIdentityInfoDTO.leaseagreementId=_data.leaseagreementId
                }
                if(_data.sitephotosId){
                    _storeIdentityInfoDTO.sitephotosId=_data.sitephotosId
                }
                let new_storeFiles=[];
                if(_data.storeFiles && _data.storeFiles.length>0){
                    new_storeFiles=(_data.storeFiles);  //门店信息文件
                }
                if(_data.complianceManageDeclaration && Object.keys(_data.complianceManageDeclaration).length>0){
                    new_storeFiles.push(_data.complianceManageDeclaration);  //合规经营声明书（后端数据类型是对象）
                }
                if(_data.mechanismInnerNameList && Object.keys(_data.mechanismInnerNameList).length>0){
                    new_storeFiles.push(_data.mechanismInnerNameList);  //机构内部名单 （后端数据类型是对象）
                }
                if(_data.otherImages && _data.otherImages.length>0){
                    new_storeFiles=new_storeFiles.concat(_data.otherImages);  //其它图片 （后端数据类型是数组）
                }
                _storeIdentityInfoDTO.storeFiles=new_storeFiles;  //门店信息文件
                that.setState({
                    searchResult:_data,  //整个搜索结果
                    storeIdentityInfoDTO:_storeIdentityInfoDTO, //详情
                    storeQueueInfoDTO:_data.storeQueueInfoDTO?_data.storeQueueInfoDTO:{},  //queue信息
                    recordInfoDTOS:_data.recordInfoDTOS?_data.recordInfoDTOS:[],  //门店审核案例记录信息
                    rejectCauseDictionaryInfoDTOS:_data.rejectCauseDictionaryInfoDTOS?_data.rejectCauseDictionaryInfoDTOS:[], //拒绝原因
                    queueContactResultEnums:_data.queueContactResultEnums?_data.queueContactResultEnums:[]  //处理状态
                },()=>{
                    that.props.allStore.CooperationCountStore.getCooperationCount("/node/store/storeCount");  //处理条数
                    that.changeLeftCP(0);
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
    searchNext(){
        let that=this;
        let _chenel=$(".check-search .chaenel option:selected").val();
        cpCommonJs.cancleSaveRecord();
        cpCommonJs.clearCondition();
        if(!_chenel){
            alert("请先选择合作方！");
            return;
        }
        
        $.ajax({
            type:"post", 
            url:"/node/store/nextStoreInfo", 
            async:true,
            dataType: "JSON", 
            timeout : 60000, //超时时间设置，单位毫秒
            data:{
                productNo:_chenel,
                queueReloadEnum:"NEXT",
            }, 
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
                        storeIdentityInfoDTO:{}, //详情
                        storeQueueInfoDTO:{},  //queue信息
                        recordInfoDTOS:[],  //门店审核案例记录信息
                        rejectCauseDictionaryInfoDTOS:[], //拒绝原因
                        queueContactResultEnums:[],  //处理状态
                        searchResult:{}
                    })
                     return;
                }
                let _data=res.data;
                if(_data.bindStatus&&_data.bindStatus=="bind"){
                    alert("当前queue已被"+_data.bindBy+"绑定！");
                    that.setState({
                        showOpraRecord:false
                    })
                }else if(_data.storeQueueInfoDTO.queueStatusId==4 || _data.storeQueueInfoDTO.queueStatusId==11){
                    that.setState({
                        showOpraRecord:false
                    })
                }else{
                    that.setState({
                        showOpraRecord:true
                    })
                }
                let _storeQueueInfoDTO=_data.storeQueueInfoDTO?_data.storeQueueInfoDTO:{};
                let _storeIdentityInfoDTO=_data.storeIdentityInfoDTO?_data.storeIdentityInfoDTO:{}; //详情
                //判断文件数据，并放到storeIdentityInfoDTO对象
                if(_data.storeContractId){
                    _storeIdentityInfoDTO.storeContractId=_data.storeContractId
                }
                if(_data.businessLicenseFileId){
                    _storeIdentityInfoDTO.businessLicenseFileId=_data.businessLicenseFileId
                }
                if(_data.leaseagreementId){
                    _storeIdentityInfoDTO.leaseagreementId=_data.leaseagreementId
                }
                if(_data.sitephotosId){
                    _storeIdentityInfoDTO.sitephotosId=_data.sitephotosId
                }
                let new_storeFiles=[];
                if(_data.storeFiles && _data.storeFiles.length>0){
                    new_storeFiles=(_data.storeFiles);  //门店信息文件
                }
                if(_data.complianceManageDeclaration && Object.keys(_data.complianceManageDeclaration).length>0){
                    new_storeFiles.push(_data.complianceManageDeclaration);  //合规经营声明书（后端数据类型是对象）
                }
                if(_data.mechanismInnerNameList && Object.keys(_data.mechanismInnerNameList).length>0){
                    new_storeFiles.push(_data.mechanismInnerNameList);  //机构内部名单 （后端数据类型是对象）
                }
                if(_data.otherImages && _data.otherImages.length>0){
                    new_storeFiles=new_storeFiles.concat(_data.otherImages);  //其它图片 （后端数据类型是数组）
                }
                _storeIdentityInfoDTO.storeFiles=new_storeFiles;  //门店信息文件
                that.setState({
                    searchResult:_data,
                    storeIdentityInfoDTO:_storeIdentityInfoDTO, //详情
                    storeQueueInfoDTO:_storeQueueInfoDTO,  //queue信息
                    recordInfoDTOS:_data.recordInfoDTOS?_data.recordInfoDTOS:[],  //门店审核案例记录信息
                    rejectCauseDictionaryInfoDTOS:_data.rejectCauseDictionaryInfoDTOS?_data.rejectCauseDictionaryInfoDTOS:[], //拒绝原因
                    queueContactResultEnums:_data.queueContactResultEnums?_data.queueContactResultEnums:[],  //处理状态
                    condition:{
                        productNo:_storeQueueInfoDTO.productNo,
                        storeId:_storeQueueInfoDTO.storeId,
                        storeName:_storeQueueInfoDTO.storeName,
                    }
                },()=>{
                    that.props.allStore.CooperationCountStore.getCooperationCount("/node/store/storeCount");  //处理条数
                    that.changeLeftCP(0);
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
        let storeQueueInfoDTO=this.state.storeQueueInfoDTO?this.state.storeQueueInfoDTO:{};
        let _storeId=storeQueueInfoDTO.storeId;
        if(_storeId){
            _parem.storeId=_storeId;
        }
        let _storeName=storeQueueInfoDTO.storeName;
        if(_storeName){
            _parem.storeName=_storeName;
        }
        
        let _productNo=storeQueueInfoDTO.productNo;
        if(_productNo){
            _parem.productNo=_productNo;
        }
        if(_productNo=='3C1'){
            let storeGrade=$('.QrecordInfo .storeGrade option:selected').attr('data-value');
            if(!storeGrade){
                alert("请选择门店等级！");
                return;
            }
            _parem.storeGrade=storeGrade;
            let area=$('.QrecordInfo .area').val();
            if(!area){
                alert("请填写正确的经营面积！");
                return;
            }
            if(isNaN(area) || parseInt(area)!=area){
                alert("经营面积必须是整数数字！");
                return;
            }
            _parem.area=area;
            let registeredCapital=$('.QrecordInfo .registeredCapital').val();
            if(!registeredCapital||isNaN(registeredCapital)){
                alert("请填写正确的注册资本！");
                return;
            }
            _parem.registeredCapital=registeredCapital;
        }
        let _beforeQueueStatusId=storeQueueInfoDTO.queueStatusId;
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
        let _caseContent=$(".QrecordInfo .commu-area").val();
        if(_afterQueueStatusId && _afterQueueStatusId!=2 && _afterQueueStatusId!=4 && !_caseContent){
            alert("请填写案列详情！");
            return;
        }
        _parem.caseContent=_caseContent;
        let _contactResultId=$(".QrecordInfo .rejectCauseDictionaryInfoDTOS option:selected").attr('data-id'); //拒绝原因-id
        if(_afterQueueStatusId==11 && !_contactResultId){
            alert("请选择拒绝原因！");
            return;
        }
        if(_afterQueueStatusId==11&&_contactResultId){
            _parem.contactResultId=_contactResultId;
        }
        let _message=$(".QrecordInfo .rejectCauseDictionaryInfoDTOS option:selected").text(); //拒绝原因-中文
        if(_afterQueueStatusId==11&&_message&&_message!='请选择拒绝原因'){
            _parem.message=_message;
        }
        $.ajax({
            type:"post", 
            url:"/node/store/saveStoreInfo", 
            async:false,
            dataType: "JSON", 
            data:_parem, 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _data=res.data;
                alert(_data.message);
                that.searchHandle("RELOAD",true);
                cpCommonJs.cancleSaveRecord();
           }
       })
    }
    //处理状态选拒绝时显示拒绝原因选项
    rejectSelect(event){
        let _value=$(event.target).find("option:selected").attr("data-value");
        if(_value=="11"){
            $(".QrecordInfo .rejectCauseDictionaryInfoDTOS-td").removeClass("hidden");
        }else{
            $(".QrecordInfo .rejectCauseDictionaryInfoDTOS-td").addClass("hidden");
        }
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
            left_page:leftHtml
        },()=>{
            $(".Csearch-left-page li").removeClass("on");
            $(".Csearch-left-page li[data-id='"+index+"']").addClass("on");
        })
    }
    // 获取左侧组件内容
    getLeftHtml(index){
        let left_page="";
        switch (index){
            case 0:
                left_page=<ShopMsg data={this.state.searchResult} />
                break;
            case 1:
                left_page=<ShopMsgHistory data={this.state.searchResult} />
                break;
        }
        return left_page;
    }
    render() {
        let {searchResult,storeQueueInfoDTO={},recordInfoDTOS,rejectCauseDictionaryInfoDTOS,queueContactResultEnums,storeIdentityInfoDTO}=this.state;
        return (
            <div className="content" id="content">
                <div className="mt20">
                    <DealAmount />   {/* 处理条数 */}
                </div>
                {/* 搜索条件 */}
                <div data-isresetdiv="yes" className="bar check-search clearfix mt20">
                    <select name="" id="chaenel" className="select-gray left mr10 chaenel">
                        <option value="" hidden>请选择合作方</option>
                        <option value="10C">学成创享-10C</option>
                        <option value="22C">中天嘉华-22C</option>
                        <option value="23C">给米-23C</option>
                        <option value="3C">爱尚-3C</option>
                        <option value="3C1">爱尚-医美-3C1</option>
                        <option value="6C1">分啦医美-6C1</option>
                    </select>
                    <input type="text" name="" placeholder="StordID" id='StordID' className="input left mr10 StordID" />
                    <input type="text" name="" placeholder="StoreName" id='StoreName' className="input left mr10 StoreName" />
                    <button className="left mr15 reset" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                    <button className="left mr15 search-btn" id='searchBtn' onClick={this.searchHandle.bind(this,"SEARCH",false)}>搜索</button>
                    <button className="left search-next-btn" id='searchNext' onClick={this.searchNext.bind(this)}>搜索下一条</button>
                </div>
                {/* 搜索条件 end */}
                <div className="mt20 clearfix">
                    <div className="left cont-left content-toggle  relative">
                        {/* tit-shadow */}
                        <div className="bar title-box Csearch-left-page clearfix">
                            <ul className="left ml10 mt5 nav">
                                <li className="on" data-id="0" onClick={this.changeLeftCP.bind(this,0,null)}>详情</li>
                                <li data-id="1" onClick={this.changeLeftCP.bind(this,1,null)}>历史修改记录</li>
                            </ul>
                            {/* <i className="right mr20 taggle-cion taggle-cion-up" onClick={cpCommonJs.all_content_toggle.bind(this)}></i> */}
                        </div>
                        <div className="mt10">
                            {this.state.left_page}
                        </div>
                    </div>
                    <div className="right cont-right content-toggle">
                        {/*用户信息条展示-蓝色条*/}
                        <div className="blue-bar relative">
                            <i className="triangle_left absolute"></i>
                            <div className="base-msg clearfix">
                                <dl style={{"maxWidth":"105px"}}>
                                    <dt>store_id</dt>
                                    <dd title={commonJs.is_obj_exist(storeQueueInfoDTO.storeId)}>{commonJs.is_obj_exist(storeQueueInfoDTO.storeId)}</dd>
                                </dl>
                                <dl style={{"maxWidth":"500px"}}>
                                    <dt>store_name</dt>
                                    <dd title={commonJs.is_obj_exist(storeQueueInfoDTO.storeName)}>{commonJs.is_obj_exist(storeQueueInfoDTO.storeName)}</dd>
                                </dl>
                            </div>
                        </div>
                        {/* Record */}
                        <div className={(this.state.showOpraRecord)?"mt20":"hidden"}>
                            <div className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit on">Record</div>
                            <table className="radius-tab mt10 CPS-edit-div QrecordInfo flow-auto" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                <tbody>
                                    <tr>
                                        <th className="no-border" width="20%">处理状态</th>
                                        <th className="no-border rejectCauseDictionaryInfoDTOS-td hidden" data-hide="yes" width="20%">拒绝原因</th>
                                        {storeQueueInfoDTO.productNo=='3C1'?<th className="no-border" width="20%">门店等级</th>:<th className="no-border" width='0'></th>}
                                        {storeQueueInfoDTO.productNo=='3C1'?<th className="no-border" width="20%">经营面积</th>:<th className="no-border" width='0'></th>}
                                        {storeQueueInfoDTO.productNo=='3C1'?<th className="no-border" width="17%">注册资本</th>:<th className="no-border" width='0'></th>}
                                        <th className="no-border"></th>
                                    </tr>
                                    <tr>
                                        <td>
                                            <select className="select-gray queueContactResultEnums" name="" id="queueContactResultEnums" style={{"width":"95%"}} onChange={this.rejectSelect.bind(this)}>
                                                <option value="" data-show="no" hidden>请选择处理状态</option>
                                                {
                                                    (queueContactResultEnums && queueContactResultEnums.length>0)?queueContactResultEnums.map((repy,i)=>{
                                                        if(repy.value!=6 && repy.value!=8 && repy.value!=12&& repy.value!=5&& repy.value!=7){
                                                            return <option key={i} data-value={commonJs.is_obj_exist(repy.value)} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                        }
                                                    }):<option></option>
                                                }
                                            </select>
                                        </td>
                                        <td className='rejectCauseDictionaryInfoDTOS-td hidden' data-hide="yes">
                                            <select className="select-gray rejectCauseDictionaryInfoDTOS" name="" id="rejectCauseDictionaryInfoDTOS" style={{"width":"95%"}}>
                                                <option value="" data-show="no" hidden>请选择</option>
                                                {
                                                    (rejectCauseDictionaryInfoDTOS && rejectCauseDictionaryInfoDTOS.length>0)?rejectCauseDictionaryInfoDTOS.map((repy,i)=>{
                                                        return <option key={i} data-type={commonJs.is_obj_exist(repy.type)} data-id={commonJs.is_obj_exist(repy.id)}>{commonJs.is_obj_exist(repy.rejectReason)}</option>
                                                    }):<option></option>
                                                }
                                            </select>
                                        </td>
                                        {storeQueueInfoDTO.productNo=='3C1'?
                                            <td>
                                                <select className="select-gray storeGrade" name="" id="storeGrade" style={{"width":"95%"}}>
                                                    <option data-value="" data-show="no" hidden>请选择</option>
                                                    <option data-value="门诊">门诊</option>
                                                    <option data-value="医院">医院</option>
                                                    <option data-value="诊所">诊所</option>
                                                </select>
                                            </td>:<td width='0'></td>}
                                            
                                        {storeQueueInfoDTO.productNo=='3C1'?<td><input type="number" className='area input' id='area' onKeyPress={commonJs.handleKeyPress.bind(this,['.'])} style={{"width":"55%"}}/>平方米</td>:<td width='0'></td>}
                                        {storeQueueInfoDTO.productNo=='3C1'?<td><input type="number" className='registeredCapital input' id='registeredCapital' onKeyPress={commonJs.handleKeyPress.bind(this,null)} style={{"width":"55%"}}/>万</td>:<td width='0'></td>}
                                    </tr>
                                    <tr>
                                        <td colSpan="6">
                                            <span className="detail-t">详情</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="6">
                                            <textarea name="" id="recordDetail" cols="30" rows="10" className="commu-area textarea" style={{"width":"95%","height":"80px"}}></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="6">
                                            <button className="left block btn-blue" id='saveRecord' onClick={this.saveRecord.bind(this)}>保存</button>
                                            <button className="btn-white left block ml20" id='saveRecordCancle' onClick={cpCommonJs.cancleSaveRecord.bind(this)}>取消</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/* Record end  */}
                        <div className="mt10">
                            <RecordList data={recordInfoDTOS} type={storeQueueInfoDTO.productNo} updatedTime={'createdAt'} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
};

export default ShopCheck;  //ES6语法，导出模块