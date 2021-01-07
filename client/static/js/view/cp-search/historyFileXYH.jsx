// 历史文件-小雨花
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import md5 from 'md5';

@inject('allStore') @observer
class HistoryFileXYH extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;
    }
    /**
     * 文件-新开页面预览文件
     * sign  标记，用于新开的页面获取对应下标
     */
    // openPage = (sign) => {
    //     let store=this.userinfoStore;
    //     let XYH_IdentityInfo=store.XYH_IdentityInfo;
    //     if(this.props.fromXYHmodal){
    //         XYH_IdentityInfo=this.props.updateData
    //     }
    //     let infoDTO=cpCommonJs.opinitionObj(XYH_IdentityInfo.infoDTO);
    //     let platformFlag=infoDTO.platformFlag;  //教育分期||运营商3c
    //     let loanNo=infoDTO.loanNumber;  
    //     let orderNo=infoDTO.orderNo;  
    //     if (!sign) {
    //         sign = "";
    //         alert('未获取到文件id！')
    //         return;
    //     }
    //     if (sign) {
    //         // sign = encodeURI(encodeURI(sign));
    //         sign=sign.toString();
    //         sign=md5(sign);
    //     }
    //     let barseUrl = "/cp-fileView?loanNo=" + loanNo + "&orderNo=" + orderNo + "&cooperationFlag=2C&platformFlag=" + platformFlag + "&key=" + sign + "&JSsource=historyInfoFile";
    //     window.open(barseUrl);
        
    // }
    render() {
        let store=this.userinfoStore;
        let XYH_IdentityInfo=store.XYH_IdentityInfo;
        if(this.props.fromXYHmodal){
            XYH_IdentityInfo=this.props.updateData
        }
        let filesInfos=cpCommonJs.opinitionObj(XYH_IdentityInfo.filesInfos);
        let file=cpCommonJs.opinitionObj(XYH_IdentityInfo.file);//
        
        let historyContractFile=cpCommonJs.opinitionArray(filesInfos.historyContractFile);  //历史。合同文件 (共有)  array
        let historyContractPhoneNo=commonJs.is_obj_exist(file.historyContractPhoneNo); //历史。合约手机号（运营商3c）string
        let historyGroupPhotoFile=cpCommonJs.opinitionArray(filesInfos.historyGroupPhotoFile);  //历史  合照图片(教育分期) array
        let historyProofPhoto=cpCommonJs.opinitionArray(filesInfos.historyProofPhoto);  //历史  学历/工作(教育分期) array
        let historyParentalProofPhoto=cpCommonJs.opinitionArray(filesInfos.historyParentalProofPhoto);  //历史  亲子证明照(教育分期) array
        let historyOtherFile=cpCommonJs.opinitionArray(filesInfos.historyOtherFile);  //历史  其他文件(教育分期) array

        let historyProductConfirm=cpCommonJs.opinitionArray(filesInfos.historyProductConfirm);  //服务-商品交付确认书
        let historySurgeryConsent=cpCommonJs.opinitionArray(filesInfos.historySurgeryConsent);  //手术项目同意书
        let historyPaymentVoucher=cpCommonJs.opinitionArray(filesInfos.historyPaymentVoucher);  //首付凭证-医疗美容分期
        let historyRepaymentVoucher=cpCommonJs.opinitionArray(filesInfos.historyRepaymentVoucher);  //还款来源凭证-医疗美容分期
        let infoDTO=cpCommonJs.opinitionObj(XYH_IdentityInfo.infoDTO);
        let businessType=infoDTO.businessType;  //教育分期||运营商3c
        return (
            <div className="auto-box pr5">
                {
                    historyContractFile.length>0?
                    <div className="toggle-box">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='historyContractFile'>
                        合同文件
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            {
                                historyContractFile.length>0?historyContractFile.map((repy,i)=>{
                                    return <li key={i}>
                                                <b className="left file-tit">合同/收据/套餐协议:{commonJs.is_obj_exist(repy.fileName)}</b>
                                                <a target="_bank" id={'historyContractFile'+i} onClick={store.openPage.bind(this,repy.id,infoDTO.loanNumber,infoDTO.orderNo,'2C',infoDTO.platformFlag,'historyInfoFile',true)} className="left file-link blue-font">查看</a>
                                            </li>
                                }):""
                            }
                            {
                                (historyContractPhoneNo && businessType=='运营商3C分期')?
                                <li>
                                    <b className="left file-tit">合约手机号</b>
                                    <b className="left" title={HistoryFileXYH}>{HistoryFileXYH}</b>
                                </li>:''
                            }
                        </ul>
                    </div>
                    :''
                }
                
                {
                    (historyGroupPhotoFile.length>0 || historyProofPhoto.length>0 || historyParentalProofPhoto.length>0)?
                    <div className="toggle-box mt10">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='historyGroupPhotoFile'>
                        证明文件
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            {
                                (businessType=='教育分期' && historyGroupPhotoFile.length>0)?historyGroupPhotoFile.map((repy,i)=>{
                                    return <li key={i}>
                                                <b className="left file-tit">合照:{commonJs.is_obj_exist(repy.fileName)}</b>
                                                <a target="_bank" id={'historyGroupPhotoFile'+i} onClick={store.openPage.bind(this,repy.id,infoDTO.loanNumber,infoDTO.orderNo,'2C',infoDTO.platformFlag,'historyInfoFile',true)} className="left file-link blue-font">查看</a>
                                            </li>
                                }):''
                            }
                            {
                                (businessType=='教育分期' && historyProofPhoto.length>0)?historyProofPhoto.map((repy,i)=>{
                                    return  <li key={i}>
                                                <b className="left file-tit">学历/工作:{commonJs.is_obj_exist(repy.fileName)}</b>
                                                <a target="_bank" id={'historyProofPhoto'+i} onClick={store.openPage.bind(this,repy.id,infoDTO.loanNumber,infoDTO.orderNo,'2C',infoDTO.platformFlag,'historyInfoFile',true)} className="left file-link blue-font">查看</a>
                                            </li>
                                }):''
                                
                            }
                            {
                                (businessType=='教育分期' && historyParentalProofPhoto.length>0)?historyParentalProofPhoto.map((repy,i)=>{
                                    return  <li key={i}>
                                                <b className="left file-tit">亲子证明照:{commonJs.is_obj_exist(repy.fileName)}</b>
                                                <a target="_bank" id={'historyParentalProofPhoto'+i} onClick={store.openPage.bind(this,repy.id,infoDTO.loanNumber,infoDTO.orderNo,'2C',infoDTO.platformFlag,'historyInfoFile',true)} className="left file-link blue-font">查看</a>
                                            </li>
                                }):''
                                
                            }
                        </ul>
                    </div>:''
                }

                {/* -----------------------------医疗美容分期 文件展示 start----------------------------- */}
                {
                    (businessType=='医疗美容分期' || businessType=='生活美容分期') ? 
                    <div>
                    {
                        historyProductConfirm.length>0?
                        <div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                                商品交付确认书
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    historyProductConfirm.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    <a target="_bank" id={'historyProductConfirm'+i}  onClick={store.openPage.bind(this,repy.id,infoDTO.loanNumber,infoDTO.orderNo,'2C',infoDTO.platformFlag,'historyInfoFile',true)} className="left file-link blue-font">查看</a>
                                                </li>
                                    })
                                }
                            </ul>
                        </div>:''
                    }
                    {
                        historySurgeryConsent.length>0?
                        <div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                                手术项目同意书
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    historySurgeryConsent.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    <a target="_bank" id={'historySurgeryConsent'+i}  onClick={store.openPage.bind(this,repy.id,infoDTO.loanNumber,infoDTO.orderNo,'2C',infoDTO.platformFlag,'historyInfoFile',true)} className="left file-link blue-font">查看</a>
                                                </li>
                                    })
                                }
                            </ul>
                        </div>:''
                    }    
                    {
                        historyPaymentVoucher.length>0?
                        <div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                            首付凭证
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    historyPaymentVoucher.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    <a target="_bank" id={'historyPaymentVoucher'+i}  onClick={store.openPage.bind(this,repy.id,infoDTO.loanNumber,infoDTO.orderNo,'2C',infoDTO.platformFlag,'historyInfoFile',true)} className="left file-link blue-font">查看</a>
                                                </li>
                                    })
                                }
                            </ul>
                        </div>:''
                    }    
                    {
                        historyRepaymentVoucher.length>0?
                        <div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                            还款来源凭证
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    historyRepaymentVoucher.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    <a target="_bank" id={'historyRepaymentVoucher'+i}  onClick={store.openPage.bind(this,repy.id,infoDTO.loanNumber,infoDTO.orderNo,'2C',infoDTO.platformFlag,'historyInfoFile',true)} className="left file-link blue-font">查看</a>
                                                </li>
                                    })
                                }
                            </ul>
                        </div>:''
                    }    
                        
                    </div>:''
                }
                {/* -----------------------------医疗美容分期 文件展示 end----------------------------- */}
                {
                    ((businessType=='教育分期' || businessType=='医疗美容分期' || businessType=='生活美容分期') && historyOtherFile.length>0)?
                    <div className="toggle-box mt10">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='historyOtherFile'>
                        其他文件
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            {
                                historyOtherFile.map((repy,i)=>{
                                    return <li key={i}>
                                                <b className="left file-tit" title={commonJs.is_obj_exist(repy.fileName)}>{commonJs.is_obj_exist(repy.fileName)}</b>
                                                <a target="_bank" id={'historyOtherFile'+i} onClick={store.openPage.bind(this,repy.id,infoDTO.loanNumber,infoDTO.orderNo,'2C',infoDTO.platformFlag,'historyInfoFile',true)} className="left file-link blue-font">查看</a>
                                            </li>
                                })
                            }
                        </ul>
                    </div>:''
                }
                
            </div>
        );
    }
};
export default HistoryFileXYH;