// 门店信息-供应链
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import ProductConfig from '../../template/poductConfig';  //详情模板
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction} from "mobx";
import { Modal } from 'antd';
import axios from '../../axios';

@inject('allStore') @observer
class ShopMsgGYL extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            visible:false
        }
    }
    //新开页面查看文件
    openPage(sign,type){
        if(type){
            window.open(sign,'_blank');
        }else{
            if(!sign){
                sign="";
                alert('未获取到文件id！')
                return;
            }
            if(sign){
                sign=sign.toString();
                sign=md5(sign);
            }
            let data=this.state.data;
            let storeQueueInfoDTO=cpCommonJs.opinitionObj(data.storeQueueInfoDTO);
            let productNo=commonJs.is_obj_exist(storeQueueInfoDTO.productNo);
            let storeId=commonJs.is_obj_exist(storeQueueInfoDTO.storeId);
            let storeName=commonJs.is_obj_exist(storeQueueInfoDTO.storeName);
            let barseUrl="/cp-fileView?productNo="+productNo+"&storeId="+storeId+"&storeName="+storeName+"&key="+sign+"&JSsource=shopInfoFile";
            window.open(barseUrl);
        }
    }
    render() {
        let userinfoStore=cpCommonJs.opinitionObj(this.props.allStore.UserinfoStore);
        let identityInfo=cpCommonJs.opinitionObj(userinfoStore.XYH_IdentityInfo);
        let cdt={};
        if(window.location.hash=='#/Reminder/reminder' || window.location.hash=='#/Collection/collection'){  //collection 详情银行卡号脱敏展示
            cdt={
                '身份证号码':true
            }
        }
        let productConfigs=cpCommonJs.opinitionObj(ProductConfig['supplyChain']);
        let productConfigMsgList=cpCommonJs.opinitionArray(productConfigs.msg);  //详情模板list
        let productConfigFileList=cpCommonJs.opinitionArray(productConfigs.files);  //文件模板list
        return (
            <div className="auto-box pr5 relative">
                {
                    (productConfigMsgList&&productConfigMsgList.length>0)?productConfigMsgList.map((reps,j)=>{
                    let templateList=reps.templateKey;
                    let javaKey=reps.javaKey;
                        return <div className="toggle-box mt5" key={j}>
                                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                                    {reps.name}
                                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                                    </h2>
                                    <ul className="cp-info-ul mt5 bar pb20 pr20"> 
                                        {/* {this.createHtml(javaKey,templateList)} */}
                                        {
                                            javaKey !== 'contactInfos'?templateList&&templateList.map((repy,i)=>{
                                                let keyword=repy.keyword;
                                                let displayName=cpCommonJs.opinitionObj(identityInfo[javaKey])[keyword];
                                                if(repy.cell){
                                                    displayName=repy.cell(displayName,cdt[repy.desc]);
                                                }
                                                let isbutton=repy.isbutton;
                                                return <li key={i}>
                                                            <p className="msg-tit">
                                                                {repy.desc}
                                                                {
                                                                    isbutton?
                                                                    <a onClick={this.showOtherShop} className="button-blue" id='showOtherShop'>{isbutton}</a>:''
                                                                }
                                                            </p>
                                                            <b className="msg-cont" title={commonJs.is_obj_exist(displayName)}>{commonJs.is_obj_exist(displayName)}</b>
                                                        </li>
                                            }):identityInfo[javaKey]&&identityInfo[javaKey].map((e,k)=>{
                                                return <div key={k}>
                                                    { 
                                                        templateList&&templateList.map((repy,p)=>{
                                                            let keyword=repy.keyword;
                                                            let displayName=cpCommonJs.opinitionObj(e)[keyword];
                                                            if(repy.cell){
                                                                displayName=repy.cell(displayName,cdt[repy.desc]);
                                                            }
                                                            return repy.keyword == 'type'?<p key={p} style={{paddingLeft: '20px',paddingTop: '11px',fontSize: '15px'}} ><b className="msg-cont" title={commonJs.is_obj_exist(displayName)}>{commonJs.is_obj_exist(displayName)}</b></p>:<li key={p}>
                                                                                                <p className="msg-tit">
                                                                                                    {repy.desc}
                                                                                                </p>
                                                                                                <b className="msg-cont" title={commonJs.is_obj_exist(displayName)}>{commonJs.is_obj_exist(displayName)}</b>
                                                                                            </li>
                                                             })
                                                    }
                                                </div>
                                            })
                                        }
                                    </ul>
                                </div>
                    }):<div className="gray-tip-font bar pt5">暂未查到相关数据...</div>
                }
            </div>
    );
    }
};


export default ShopMsgGYL;