// 门店审核-历史修改记录
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import ProductConfig from '../../template/poductConfig';  //详情模板
import md5 from 'md5';
import axios from '../../axios';

import qs from 'Qs';
@inject('allStore') @observer
export default class ShopMsgHistory extends React.Component {
    constructor(props){
        super(props);
        this.state={
            data:this.props.data?this.props.data:{},
        }
    }
    componentDidMount(){
        this.getHistoryMsg();
    }
    //新开页面查看文件
    openPage(sign,fileName){
        if(!sign){
            sign="";
            alert('未获取到文件id！')
            return;
        }
        let data=this.state.data;
        let storeQueueInfoDTO=cpCommonJs.opinitionObj(data.storeQueueInfoDTO);
        let productNo=commonJs.is_obj_exist(storeQueueInfoDTO.productNo);
        let storeId=commonJs.is_obj_exist(storeQueueInfoDTO.storeId);
        let storeName=commonJs.is_obj_exist(storeQueueInfoDTO.storeName);
        let barseUrl="/node/file/down?isDown=NO&fileId="+sign+'&fileName='+fileName;
        window.open(barseUrl);
    }
    //查询商户门店历史修改信息
    getHistoryMsg=()=>{
        let that=this;
        let queueInfo=cpCommonJs.opinitionObj(this.state.data.storeQueueInfoDTO);
        let parem={
            storeId:queueInfo.storeId,
            storeName:queueInfo.storeName,
            productNo:queueInfo.productNo,
            platformFlag:queueInfo.platformFlag,
            queueReloadEnum:'SEARCH',
        }
        axios({
            method: 'POST',
            url:'/node/store/searchStore/history',
            data:{josnParam:JSON.stringify(parem)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    responseDTOS:[]
                })
                return;
            }
            let responseDTOS=cpCommonJs.opinitionArray(data.responseDTOS);
            that.setState({
                responseDTOS:responseDTOS
            })
        })
    }
    render() {
        let data=this.state.data;
        let storeQueueInfoDTO=cpCommonJs.opinitionObj(data.storeQueueInfoDTO);
        let productNo=commonJs.is_obj_exist(storeQueueInfoDTO.productNo);
        let platformFlag=commonJs.is_obj_exist(storeQueueInfoDTO.platformFlag);
        let templateJsName=platformFlag;  //加载模板js文件
        
        let productConfigs=cpCommonJs.opinitionObj(ProductConfig[templateJsName]);
        let productConfigMsgList=cpCommonJs.opinitionArray(productConfigs.msg);  //详情模板list
        let productConfigFileList=cpCommonJs.opinitionArray(productConfigs.files);  //文件模板list
        let {responseDTOS=[]}=this.state;  //接口数据
        return (
            <div className="auto-box pr5 relative">
            {
                responseDTOS.length>0 ? responseDTOS.map((resp,k)=>{
                    let identityInfo={};
                    let historyFileDatas=[];
                    if(platformFlag=='TH'){
                        identityInfo=cpCommonJs.opinitionObj(resp.storeIdentityInfoDTO);  //门店审核详情
                        historyFileDatas=cpCommonJs.opinitionArray(resp.historyFileDatas);  //历史文件数据list
                    }else{
                        identityInfo=cpCommonJs.opinitionObj(resp.storeInfoDTO);  //平台 门店详情
                        if(resp.locateFiles&&resp.locateFiles.length>0){
                            historyFileDatas=historyFileDatas.concat(resp.locateFiles);
                        }
                        if(resp.proveFiles&&resp.proveFiles.length>0){
                            historyFileDatas=historyFileDatas.concat(resp.proveFiles);
                        }
                        if(resp.contractPhoto&&resp.contractPhoto.length>0){
                            historyFileDatas=historyFileDatas.concat(resp.contractPhoto);
                        }
                        if(resp.storeConfirmation&&resp.storeConfirmation.length>0){
                            historyFileDatas=historyFileDatas.concat(resp.storeConfirmation);
                        }
                    }

                    return <div className='shopMsgHistory' key={k}>
                                <h2 className="clearfix bar-tit pl20 pr20 toggle-tit blueBarLine">记录{k+1}</h2>
                                {/* 内容循环开始 */}
                                {
                                    (productConfigMsgList&&productConfigMsgList.length>0)?productConfigMsgList.map((reps,j)=>{
                                    let templateList=reps.templateKey;
                                        return <div className="toggle-box mt5" key={j}>
                                                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                                                    {reps.name}
                                                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                                                    </h2>
                                                    <ul className="cp-info-ul mt5 bar pb20 pr20"> 
                                                        {
                                                            templateList?templateList.map((repy,i)=>{
                                                                let keyword=repy.keyword;
                                                                let displayName=identityInfo[keyword];
                                                                if(repy.cell){
                                                                    displayName=repy.cell(displayName);
                                                                }
                                                                if(displayName){
                                                                    return <li key={i}>
                                                                            <p className="msg-tit">{repy.desc}</p>
                                                                            <b className="msg-cont" title={commonJs.is_obj_exist(displayName)}>{commonJs.is_obj_exist(displayName)}</b>
                                                                        </li>
                                                                }
                                                            }):<li className="gray-tip-font bar pt5">暂未查到相关数据...</li>
                                                        }
                                                    </ul>
                                                </div>
                                    }):<div className="gray-tip-font bar pt5">暂未查到相关数据...</div>
                                }
                                <div className="toggle-box mt5" key={k}>
                                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>文件<i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                                    </h2>
                                    <ul className="file-list bar mt5 pl20">
                                        {
                                            historyFileDatas.length>0 ? historyFileDatas.map((files,q)=>{
                                                return <li key={q}>
                                                    <p className="left file-tit">{files.fileName}</p>
                                                    <b className="left file-link blue-font pointer" id={files.id} onClick={this.openPage.bind(this,files.id,files.fileName)}>查看</b>
                                                    
                                                </li>
                                            }):''
                                        }
                                    </ul>
                                </div>



                                {/* 内容循环结束 */}
                            </div>
                }):<div className="gray-tip-font bar pt5">暂未查到相关数据...</div>
            }
            
            </div>
    );
    }
};
