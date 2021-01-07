// 附件-合作方
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import {checkAll,checkBoxHandle} from '../../source/file';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";

@inject('allStore') @observer
class FileTerrace extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        $('.Csearch-left-page .myCheckbox').removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
    }

    render() {
        console.log(this.props.allStore.UserinfoStore);
        let fileStore=this.props.allStore.UserinfoStore.platforFileInfo;
        let { cooperationFlag } = this.props.allStore.UserinfoStore;
        let pactFileInfo=cpCommonJs.opinitionObj(fileStore.platformContractFilesInfoDTO);  //合同文件
        let loanNumber=cpCommonJs.opinitionObj(fileStore.loanNumber);  //合同号
        let childrenLoanNumbers=cpCommonJs.opinitionObj(fileStore.childrenLoanNumbers);  //合同文件
        let identityCardFileInfo=cpCommonJs.opinitionObj(fileStore.platformIdentityCardFilesInfoDTO);  //身份证文件
        let proveFileInfo=cpCommonJs.opinitionObj(fileStore.platformProveFilesInfoDTO);  //证明文件
        let operateReportFileInfoDTO=cpCommonJs.opinitionObj(fileStore.operateReportFileInfoDTO);  //运营商报告
        let faceRecogniseFilesInfoDTO=cpCommonJs.opinitionObj(fileStore.faceRecogniseFilesInfoDTO);  //人脸识别
        let userinfoStore=this.props.allStore.UserinfoStore;
        return (
            <div style={{marginTop: '10px'}} className="auto-box pr5">
                <div className="toggle-box">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='pactFileInfo'>
                    合同文件
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            (pactFileInfo&&pactFileInfo.length>0)?pactFileInfo.map((repy,i)=>{
                                return <li key={i}>
                                            <b className="left file-tit" title={commonJs.is_obj_exist(repy.fileName)}>{commonJs.is_obj_exist(repy.fileName)}</b>
                                            <a onClick={userinfoStore.openPage.bind(this,repy.id)} className="file-link blue-font" id={'pactFileInfo'+i}>查看</a>
                                        </li>
                            }):""
                        }
                        {/* 通过合同号下载合同文件2，另外的接口 */}
                        {
                            userinfoStore.showLoanFile&&cooperationFlag!=='2F'?
                            <li>
                                <b className="left file-tit" title={commonJs.is_obj_exist(userinfoStore.loanNo)}>{commonJs.is_obj_exist(userinfoStore.loanNo)}</b>
                                <a target="_bank" href={"/node/file/loan/down?loanNumber="+userinfoStore.loanNo} id='showLoanFileDown' className="left file-link blue-font">下载</a>
                            </li>:""
                        }
                        {
                            userinfoStore.showLoanFile&&cooperationFlag =='2F'?
                            <li>
                                <b className="left file-tit" title={commonJs.is_obj_exist(loanNumber)}>{commonJs.is_obj_exist(loanNumber)}</b>
                                <a target="_bank" href={"/node/file/loan/down?loanNumber="+loanNumber} id='showLoanFileDown' className="left file-link blue-font">下载</a>
                            </li>:""
                        }
                        {
                            userinfoStore.showLoanFile&&childrenLoanNumbers.length>0?childrenLoanNumbers.map((repy,i)=>{
                                return(<li  key={i}>
                                        <b className="left file-tit" title={commonJs.is_obj_exist(repy.loanNumber)}>{commonJs.is_obj_exist(repy.loanNumber)}</b>
                                        <a target="_bank" href={"/node/file/loan/down?loanNumber="+repy.loanNumber} id='showLoanFileDown' className="left file-link blue-font">下载</a>
                                    </li>)
                            }):''
                        }
                    </ul>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='identityCardFileInfo'>
                    身份证文件
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                                (identityCardFileInfo&&identityCardFileInfo.length>0)?identityCardFileInfo.map((repy,i)=>{
                                return <li key={i}>
                                            <b className="left file-tit" title={commonJs.is_obj_exist(repy.fileName)}>{commonJs.is_obj_exist(repy.fileName)}</b>
                                            {
                                                userinfoStore.needWithDraw?
                                                <i className="myCheckbox myCheckbox-normal right mt10 mr5" data-id={commonJs.is_obj_exist(repy.id)} onClick={checkBoxHandle.bind(this)}></i>
                                                :''
                                            }
                                            <a onClick={userinfoStore.openPage.bind(this,repy.id)} id={'identityCardFileInfo'+i} className="left file-link blue-font">查看</a>
                                        </li>
                            }):<li className="gray-tip-font">暂未查到相关数据...</li>
                        }
                    </ul>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='faceRecogniseFilesInfo'>
                    人脸识别
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            (faceRecogniseFilesInfoDTO&&faceRecogniseFilesInfoDTO.length>0)?faceRecogniseFilesInfoDTO.map((repy,i)=>{
                                return <li key={i}>
                                            <b className="left file-tit" title={commonJs.is_obj_exist(repy.fileName)}>{commonJs.is_obj_exist(repy.fileName)}</b>
                                            {
                                                userinfoStore.needWithDraw?
                                                <i className="myCheckbox myCheckbox-normal right mt10 mr5" data-id={commonJs.is_obj_exist(repy.id)} onClick={checkBoxHandle.bind(this)}></i>
                                                :''
                                            }
                                            <a onClick={userinfoStore.openPage.bind(this,repy.id)} className="left file-link blue-font" id={'faceRecogniseFilesInfo'+i}>查看</a>
                                        </li>
                            }):<li className="gray-tip-font">暂未查到相关数据...</li>
                        }
                    </ul>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='proveFileInfo'>
                    证明文件
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            (proveFileInfo&&proveFileInfo.length>0)?proveFileInfo.map((repy,i)=>{
                                return <li key={i}>
                                            <b className="left file-tit" title={commonJs.is_obj_exist(repy.fileName)}>{commonJs.is_obj_exist(repy.fileName)}</b>
                                            {
                                                userinfoStore.needWithDraw?
                                                <i className="myCheckbox myCheckbox-normal right mt10 mr5" data-id={commonJs.is_obj_exist(repy.id)} onClick={checkBoxHandle.bind(this)}></i>
                                                :''
                                            }
                                            <a onClick={userinfoStore.openPage.bind(this,repy.id)} className="left file-link blue-font" id={'proveFileInfo'+i}>查看</a>
                                        </li>
                            }):<li className="gray-tip-font">暂未查到相关数据...</li>
                        }
                    </ul>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='operateReportFileInfo'>
                    运营商报告
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            (operateReportFileInfoDTO&&operateReportFileInfoDTO.length>0)?operateReportFileInfoDTO.map((repy,i)=>{
                                return <li key={i}>
                                            <b className="left file-tit">运营商报告</b>
                                            {
                                                userinfoStore.needWithDraw?
                                                <i className="myCheckbox myCheckbox-normal right mt10 mr5" data-id={commonJs.is_obj_exist(repy.id)} onClick={checkBoxHandle.bind(this)}></i>
                                                :''
                                            }
                                            <a onClick={userinfoStore.openPage.bind(this,repy.id)} className="left file-link blue-font" i={'operateReportFileInfo'+i}>查看</a>
                                        </li>
                            }):<li className="gray-tip-font">暂未查到相关数据...</li>
                        }
                    </ul>
                </div>
                {
                    userinfoStore.needWithDraw?
                    <div className="file-list bar mt5 pl20 retransmission-box">
                        <span className="right mr20 mt7">全选</span>
                        <i className="myCheckbox myCheckbox-normal right mt10 mr5 retransmissionCK" id='selectAll' onClick={checkAll.bind(this)}></i>
                    </div>:""
                }
            </div>
        );
    }
};
export default FileTerrace;