// 附件-小雨花
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import { Modal } from 'antd';
import HistoryFileXYH from './historyFileXYH';

@inject('allStore') @observer
class FileXYH extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;
        this.state={
            historyFile: false
        }
    }
    showHistoryFile = () => {
        this.setState({
            historyFile: true,
        });
    };
    hideHistoryFile = e => {
        this.setState({
            historyFile: false,
        });
    };
    render() {
        let store=this.props.allStore.UserinfoStore;
        let XYH_IdentityInfo=store.XYH_IdentityInfo;
        let fromXYHmodal=this.props.fromXYHmodal;
        let his_loanNo='',
            his_orderNo='',
            his_cooperationFlag='',
            his_platformFlag='';
        if(fromXYHmodal){ //小雨花弹窗（历史文件、历史订单-查看详情）
            XYH_IdentityInfo=this.props.data;
            let infoDTO=cpCommonJs.opinitionObj(XYH_IdentityInfo.infoDTO);
            his_loanNo=infoDTO.loanNumber;
            his_orderNo=infoDTO.orderNo;
            his_cooperationFlag=infoDTO.cooperationFlag;
            his_platformFlag=infoDTO.platformFlag;
        }
        let contractDocFile=cpCommonJs.opinitionArray(XYH_IdentityInfo.contractDocFile);//合同文件
        let faceFile=cpCommonJs.opinitionArray(XYH_IdentityInfo.faceFile);//人脸识别图片
        let groupPhotoFile=cpCommonJs.opinitionArray(XYH_IdentityInfo.groupPhotoFile);//合照图片
        let idCardFile=cpCommonJs.opinitionArray(XYH_IdentityInfo.idCardFile);//身份证图片
        let otherFile=cpCommonJs.opinitionArray(XYH_IdentityInfo.otherFile);//附加文件

        let filesInfos=cpCommonJs.opinitionObj(XYH_IdentityInfo.filesInfos);//
        let file=cpCommonJs.opinitionObj(XYH_IdentityInfo.file);//
        let contractOnlineFile=cpCommonJs.opinitionArray(filesInfos.contractOnlineFile); //在线签署文件
        let notificationLetterPhoto=cpCommonJs.opinitionArray(filesInfos.notificationLetterPhoto);//告知函照：
        let proofPhoto=cpCommonJs.opinitionArray(filesInfos.proofPhoto);//学历/工作
        let parentalProofPhoto=cpCommonJs.opinitionArray(filesInfos.parentalProofPhoto);//亲子证明照
        let mobilePhoneBoxPhoto=cpCommonJs.opinitionObj(filesInfos.mobilePhoneBoxPhoto);//手机盒串码照：
        let notificationLetterGroupPhoto=cpCommonJs.opinitionObj(filesInfos.notificationLetterGroupPhoto);//告知函合照
        let businessType=cpCommonJs.opinitionObj(XYH_IdentityInfo.infoDTO).businessType;  //教育分期||运营商3c
        // let productConfirm=cpCommonJs.opinitionObj(filesInfos.productConfirm);//服务-商品交付确认书-医疗美容分期
        let surgeryConsent=cpCommonJs.opinitionObj(filesInfos.surgeryConsent);//手术项目同意书-医疗美容分期
        let paymentVoucher=cpCommonJs.opinitionObj(filesInfos.paymentVoucher);//首付凭证-医疗美容分期
        let repaymentVoucher=cpCommonJs.opinitionObj(filesInfos.repaymentVoucher);//还款来源凭证-医疗美容分期

        let historyContractFile=cpCommonJs.opinitionArray(filesInfos.historyContractFile);  //历史。合同文件 (共有)  array
        let historyContractPhoneNo=commonJs.is_obj_exist(file.historyContractPhoneNo); //历史。合约手机号（运营商3c）string
        let historyGroupPhotoFile=cpCommonJs.opinitionArray(filesInfos.historyGroupPhotoFile);  //历史  合照图片(教育分期) array
        let historyProofPhoto=cpCommonJs.opinitionArray(filesInfos.historyProofPhoto);  //历史  学历/工作/(教育分期) array
        let historyParentalProofPhoto=cpCommonJs.opinitionArray(filesInfos.historyParentalProofPhoto);  //历史  亲子证明照(教育分期) array
        let historyOtherFile=cpCommonJs.opinitionArray(filesInfos.historyOtherFile);  //历史  其他文件(教育分期) array
        let historyProductConfirm=cpCommonJs.opinitionArray(filesInfos.historyProductConfirm);  //服务-商品交付确认书-医疗美容分期
        let historySurgeryConsent=cpCommonJs.opinitionArray(filesInfos.historySurgeryConsent);  //手术项目同意书-医疗美容分期
        let historyPaymentVoucher=cpCommonJs.opinitionArray(filesInfos.historyPaymentVoucher);  //首付凭证-医疗美容分期
        let historyRepaymentVoucher=cpCommonJs.opinitionArray(filesInfos.historyRepaymentVoucher);  //还款来源凭证-医疗美容分期
        let photosBeforeSurgery=cpCommonJs.opinitionArray(filesInfos.photosBeforeSurgery);  //手术前照片
        let photosAfterSurgery=cpCommonJs.opinitionArray(filesInfos.photosAfterSurgery);  //手术后照片
        let surgicalSheet=cpCommonJs.opinitionArray(filesInfos.surgicalSheet);  //手术单
        let siteProve=cpCommonJs.opinitionArray(filesInfos.siteProve);  //现场证明资料
        let historySiteProve=cpCommonJs.opinitionArray(filesInfos.historySiteProve);  //历史现场证明资料
        let historyPhotosBeforeSurgery=cpCommonJs.opinitionArray(filesInfos.historyPhotosBeforeSurgery);  //历史手术前照片
        let historyPhotosAfterSurgery=cpCommonJs.opinitionArray(filesInfos.historyPhotosAfterSurgery);  //历史手术后照片
        let historySurgicalSheet=cpCommonJs.opinitionArray(filesInfos.historySurgicalSheet);  //历史手术单
        let photosBeforeBodySurgery=cpCommonJs.opinitionArray(filesInfos.photosBeforeBodySurgery);  //术前手术部位照
        let photosAfterBodySurgery=cpCommonJs.opinitionArray(filesInfos.photosAfterBodySurgery);  //术后手术部位照
        let historyPhotosBeforeBodySurgery=cpCommonJs.opinitionArray(filesInfos.historyPhotosBeforeBodySurgery);  //历史手术前部位照片
        let historyPhotosAfterBodySurgery=cpCommonJs.opinitionArray(filesInfos.historyPhotosAfterBodySurgery);  //历史手术后部位照片
        return (
            <div className="auto-box pr5">
                {
                    (contractDocFile.length>0 || file.contractPhoneNo)?
                    <div className="toggle-box">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='contractDocFile'>
                        合同文件
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            {
                                contractDocFile.length>0?contractDocFile.map((repy,i)=>{
                                    return <li key={i}>
                                                <b className="left file-tit">合同/收据/套餐协议:{commonJs.is_obj_exist(repy.fileName)}</b>
                                                {historyContractFile.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''}
                                                <a id={'contractDocFile'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                            </li>
                                }):""
                            }
                            {
                                file.contractPhoneNo?
                                <li>
                                    <b className="left file-tit">合约手机号</b>
                                    {historyContractPhoneNo.length>0?<a className='left' id='contractPhoneNoHis' onClick={this.showHistoryFile}>查看历史</a>:''}
                                    <b className="left" title={commonJs.is_obj_exist(file.contractPhoneNo)}>{commonJs.is_obj_exist(file.contractPhoneNo)}</b>
                                </li>:''
                            }
                        </ul>
                    </div>
                    :''
                }
                {
                    idCardFile.length>0?
                    <div className="toggle-box mt10">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='idCardFile'>
                        身份证文件
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            {
                                idCardFile.map((repy,i)=>{
                                    return <li key={i}>
                                                <b className="left file-tit" title={commonJs.is_obj_exist(repy.fileName)}>{commonJs.is_obj_exist(repy.fileName)}</b>
                                                <a id={'idCardFile'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                            </li>
                                })
                            }
                        </ul>
                    </div>:''
                }
                {
                    faceFile.length>0?
                    <div className="toggle-box mt10">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='faceFile'>
                        人脸识别
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            {
                                faceFile.map((repy,i)=>{
                                    return <li key={i}>
                                                <b className="left file-tit" title={commonJs.is_obj_exist(repy.fileName)}>{commonJs.is_obj_exist(repy.fileName)}</b>
                                                <a id={'faceFile'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                            </li>
                                })
                            }
                        </ul>
                    </div>:''
                }
                {
                    contractOnlineFile.length>0?
                    <div className="toggle-box mt10">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='contractOnlineFile'>
                        在线签署文件
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            {
                                contractOnlineFile.map((repy,i)=>{
                                    return <li key={i}>
                                                <b className="left file-tit" title={commonJs.is_obj_exist(repy.fileName)}>{commonJs.is_obj_exist(repy.fileName)}</b>
                                                <a id={'contractOnlineFile'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                            </li>
                                })
                            }
                        </ul>
                    </div>:''
                }
                
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                    证明文件
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            (businessType=='教育分期' && groupPhotoFile.length>0)?groupPhotoFile.map((repy,i)=>{
                                return <li key={i}>
                                            <b className="left file-tit">合照/手持告知函:{commonJs.is_obj_exist(repy.fileName)}</b>
                                            {historyGroupPhotoFile.length>0?<a className='left' onClick={this.showHistoryFile}>查看历史</a>:''}
                                            <a id={'groupPhotoFile'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                        </li>
                            }):''
                        }
                        {
                            (businessType=='教育分期'&&proofPhoto.length>0)?proofPhoto.map((repy,i)=>{
                                return  <li key={i}>
                                            <b className="left file-tit">学历/工作:{commonJs.is_obj_exist(repy.fileName)}</b>
                                            {historyProofPhoto.length>0?<a className='left' onClick={this.showHistoryFile}>查看历史</a>:''}
                                            <a id={'proofPhoto'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                        </li>
                            }):''
                            
                        }
                        {
                            (businessType=='教育分期'&&notificationLetterPhoto.length>0)?notificationLetterPhoto.map((repy,i)=>{
                                return <li key={i}>
                                            <b className="left file-tit">告知函照:{commonJs.is_obj_exist(repy.fileName)}</b>
                                            <a id={'notificationLetterPhoto'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                        </li>
                            }):''
                        }
                        {
                            (businessType=='教育分期'&&parentalProofPhoto.length>0)?parentalProofPhoto.map((repy,i)=>{
                                return <li key={i}>
                                            <b className="left file-tit">亲子证明照:{commonJs.is_obj_exist(repy.fileName)}</b>
                                            {historyParentalProofPhoto.length>0?<a className='left' onClick={this.showHistoryFile}>查看历史</a>:''}
                                            <a id={'parentalProofPhoto'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                        </li>
                            }):''
                        }
                        {
                            mobilePhoneBoxPhoto.id?
                            <li>
                                <b className="left file-tit">手机盒串码照</b>
                                <a id='mobilePhoneBoxPhoto' onClick={store.openPage.bind(this,mobilePhoneBoxPhoto.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                            </li>:''
                        }
                        {
                            
                        }
                    </ul>
                </div>
                {
                    siteProve.length>0&&<div className="togglesiteProve-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                        现场证明资料 
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            siteProve.length>0?siteProve.map((repy,i)=>{
                                return <li key={i}>
                                            <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                            {/* {photosBeforeSurgery.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                            <a id={'siteProve'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                        </li>
                            }):""
                        }
                    </ul>
                </div>
                }
                {
                    historySiteProve.length>0&&<div className="togglesiteProve-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                        历史现场证明资料
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            historySiteProve.length>0?historySiteProve.map((repy,i)=>{
                                return <li key={i}>
                                            <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                            {/* {photosBeforeSurgery.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                            <a id={'historySiteProve'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                        </li>
                            }):""
                        }
                    </ul>
                    </div>
                }
                {/* -----------------------------医疗美容分期 文件展示 start----------------------------- */}
                {
                    (businessType=='医疗美容分期'|| businessType=='生活美容分期') ?
                    <div>
                        <div className="toggle-box mt10">
                        {
                            historyProductConfirm.length>0 ?
                            <ul className="file-list bar pl20">
                                <li className='no-border'>
                                    <b className="left file-tit">商品交付确认书</b>
                                    <a className='left' onClick={this.showHistoryFile}>查看历史</a>
                                </li>
                            </ul>:''
                        }
                        </div>
                        <div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                                手术项目同意书
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    surgeryConsent.length>0?surgeryConsent.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    {historySurgeryConsent.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''}
                                                    <a id={'surgeryConsent'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                                </li>
                                    }):""
                                }
                            </ul>
                        </div>
                        <div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                                首付凭证
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    paymentVoucher.length>0?paymentVoucher.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    {historyPaymentVoucher.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''}
                                                    <a id={'paymentVoucher'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                                </li>
                                    }):""
                                }
                            </ul>
                        </div>
                        <div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                            还款来源凭证
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    repaymentVoucher.length>0?repaymentVoucher.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    {historyRepaymentVoucher.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''}
                                                    <a id={'repaymentVoucher'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                                </li>
                                    }):""
                                }
                            </ul>
                        </div>
                        {
                            photosBeforeSurgery.length>0&&<div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                                手术前照片
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    photosBeforeSurgery.length>0?photosBeforeSurgery.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    {/* {photosBeforeSurgery.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                                    <a id={'photosBeforeSurgery'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                                </li>
                                    }):""
                                }
                            </ul>
                        </div>
                        }
                        {
                            photosAfterSurgery.length>0&&<div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                                手术后照片
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    photosAfterSurgery.length>0?photosAfterSurgery.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    {/* {photosBeforeSurgery.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                                    <a id={'photosAfterSurgery'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                                </li>
                                    }):""
                                }
                            </ul>
                        </div>
                        }
                        {
                            surgicalSheet.length>0&&<div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                                手术单
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    surgicalSheet.length>0?surgicalSheet.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    {/* {photosBeforeSurgery.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                                    <a id={'surgicalSheet'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                                </li>
                                    }):""
                                }
                            </ul>
                        </div>
                        }
{
                            historyPhotosBeforeSurgery.length>0&&<div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                                历史手术前照片
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    historyPhotosBeforeSurgery.length>0?historyPhotosBeforeSurgery.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    {/* {historyPhotosBeforeSurgery.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                                    <a id={'historyPhotosBeforeSurgery'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                                </li>
                                    }):""
                                }
                            </ul>
                        </div>
                        }{
                            historyPhotosAfterSurgery.length>0&&<div className="toggle-box mt10">
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                                历史手术后照片
                                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                            </h2>
                            <ul className="file-list bar mt5 pl20 hidden">
                                {
                                    historyPhotosAfterSurgery.length>0?historyPhotosAfterSurgery.map((repy,i)=>{
                                        return <li key={i}>
                                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                    {/* {photosBeforeSurgery.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                                    <a id={'historyPhotosAfterSurgery'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                                </li>
                                    }):""
                                }
                            </ul>
                        </div>
                        }{
                            historySurgicalSheet.length>0&&<div className="toggle-box mt10">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                            历史手术单
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            {
                                historySurgicalSheet.length>0?historySurgicalSheet.map((repy,i)=>{
                                    return <li key={i}>
                                                <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                {/* {historySurgicalSheet.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                                <a id={'historySurgicalSheet'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                            </li>
                                }):""
                            }
                        </ul>
                    </div>
                    }{
                        photosBeforeBodySurgery.length>0&&<div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                        术前手术部位照
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            photosBeforeBodySurgery.length>0?photosBeforeBodySurgery.map((repy,i)=>{
                                return <li key={i}>
                                            <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                            {/* {photosBeforeBodySurgery.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                            <a id={'photosBeforeBodySurgery'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                        </li>
                            }):""
                        }
                    </ul>
                </div>
                }{
                    photosAfterBodySurgery.length>0&&<div className="toggle-box mt10">
                <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                    术后手术部位照
                    <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                </h2>
                <ul className="file-list bar mt5 pl20 hidden">
                    {
                        photosAfterBodySurgery.length>0?photosAfterBodySurgery.map((repy,i)=>{
                            return <li key={i}>
                                        <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                        {/* {photosAfterBodySurgery.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                        <a id={'photosAfterBodySurgery'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                    </li>
                        }):""
                    }
                </ul>
            </div>
            }{
                historyPhotosBeforeBodySurgery.length>0&&<div className="toggle-box mt10">
            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                历史手术前部位照片
                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
            </h2>
            <ul className="file-list bar mt5 pl20 hidden">
                {
                    historyPhotosBeforeBodySurgery.length>0?historyPhotosBeforeBodySurgery.map((repy,i)=>{
                        return <li key={i}>
                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                    {/* {historyPhotosBeforeBodySurgery.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                    <a id={'historyPhotosBeforeBodySurgery'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                </li>
                    }):""
                }
            </ul>
        </div>
        }{
                historyPhotosAfterBodySurgery.length>0&&<div className="toggle-box mt10">
            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='groupPhotoFile'>
                历史手术后部位照片
                <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
            </h2>
            <ul className="file-list bar mt5 pl20 hidden">
                {
                    historyPhotosAfterBodySurgery.length>0?historyPhotosAfterBodySurgery.map((repy,i)=>{
                        return <li key={i}>
                                    <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                    {/* {historyPhotosAfterBodySurgery.length>0 ? <a className='left' onClick={this.showHistoryFile}>查看历史</a>:''} */}
                                    <a id={'historyPhotosAfterBodySurgery'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                </li>
                    }):""
                }
            </ul>
        </div>
        }
                    </div>:''
                }
                {/* -----------------------------医疗美容分期 文件展示 end----------------------------- */}
                {
                    ((businessType=='教育分期' || businessType=='医疗美容分期') && otherFile.length>0)?
                    <div className="toggle-box mt10">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='otherFile'>
                        其他文件
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            {
                                otherFile.map((repy,i)=>{
                                    return <li key={i}>
                                                <b className="left file-tit" title={commonJs.is_obj_exist(repy.fileName)}>{commonJs.is_obj_exist(repy.fileName)}</b>
                                                {historyOtherFile.length>0?<a className='left' onClick={this.showHistoryFile}>查看历史</a>:''}
                                                <a id={'otherFile'+i} onClick={store.openPage.bind(this,repy.id,his_loanNo,his_orderNo,his_cooperationFlag,his_platformFlag,'userInfoFile',fromXYHmodal)} className="left file-link blue-font">查看</a>
                                            </li>
                                })
                            }
                        </ul>
                    </div>:''
                }
                <Modal
                    visible={this.state.historyFile}
                    onCancel={this.hideHistoryFile}
                    footer={null}
                    width={'60%'}
                    >
                    <HistoryFileXYH fromXYHmodal={this.props.fromXYHmodal} updateData={this.props.data} />
                </Modal>  
            </div>
        );
    }
};
export default FileXYH;