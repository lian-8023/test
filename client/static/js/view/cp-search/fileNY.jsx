// 附件-农业
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";

@inject('allStore') @observer
class FileNY extends React.Component {
    constructor(props){
        super(props);
        this.store=this.props.allStore.UserinfoStore.thirdFilesResponseOldDTO;
        this.state={
            pactFileInfo:cpCommonJs.opinitionObj(this.store.contractsFileMap),
            identityCardFileInfo:cpCommonJs.opinitionObj(this.store.identityDocumentsMap),
            proveFileInfo:cpCommonJs.opinitionObj(this.store.proveDocumentsMap),
            fileCheckAll:false
        }
    }
    render() {
        let store=this.props.allStore.UserinfoStore;;
        let identityCardFileInfo=store.XYH_IdentityInfo;
        let creditContractList = identityCardFileInfo.creditContractList;
        let loanContractList = identityCardFileInfo.loanContractList;
        let files = identityCardFileInfo.userInfo?identityCardFileInfo.userInfo.files:[];//用户文件信息
        return (
            <div className="auto-box pr5">
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='identityCardFile'>
                        用户文件信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            files&&files.length>0?files.map((repy,i)=>{
                                return <li key={i}>
                                            {/* {repy.identification&&<b className="left" style={{paddingLeft: '20px'}}>{commonJs.is_obj_exist(repy.identification)}</b>} */}
                                            {repy.fileType&&<b className="left">{commonJs.is_obj_exist(repy.fileType)}</b>}
                                            <a  id={'files'+i} onClick={()=>{store.openPage(repy.fileId)}} className="left file-link blue-font">
                                                    查看
                                            </a>
                                        </li>
                            }):""
                        }
                    </ul>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='identityCardFile'>
                        授信合同列表
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            creditContractList&&creditContractList.length>0?creditContractList.map((repy,i)=>{
                                return <li key={i}>
                                            {/* {repy.fileName&&<b className="left" style={{paddingLeft: '20px'}}>{commonJs.is_obj_exist(repy.identification)}</b>} */}
                                            {repy.fileType&&<b className="left">{commonJs.is_obj_exist(repy.fileType)}</b>}
                                            <a  id={'creditContractList'+i} onClick={()=>{store.openPage(repy.fileId)}} className="left file-link blue-font">
                                                    查看
                                            </a>
                                        </li>
                            }):""
                        }
                    </ul>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='identityCardFile'>
                    提现合同列表
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            loanContractList&&loanContractList.length>0?loanContractList.map((repy,i)=>{
                                return <li key={i}>
                                            {repy.fileType&&<b className="left">{commonJs.is_obj_exist(repy.fileType)}</b>}
                                            <a  id={'loanContractList'+i} onClick={()=>{store.openPage(repy.fileId)}} className="left file-link blue-font">
                                                    查看
                                            </a>
                                        </li>
                            }):""
                        }
                    </ul>
                </div>
            </div>
        );
    }
};
export default FileNY;