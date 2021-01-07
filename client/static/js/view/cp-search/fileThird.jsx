// 附件-合作方
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";

@inject('allStore') @observer
class FileThird extends React.Component {
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
        let store=this.props.allStore.UserinfoStore;
        let loanStatus=cpCommonJs.opinitionObj(store.thirdIdentityResponseOldDTO).loanStatus;
        let thirdFilesResponseOldDTO=cpCommonJs.opinitionObj(store.thirdFilesResponseOldDTO);
        let thirdIdentityResponseOldDTO=store.thirdIdentityResponseOldDTO;
        let pactFileInfo=cpCommonJs.opinitionObj(thirdFilesResponseOldDTO.contractsFileMap);
        let identityCardFileInfo=cpCommonJs.opinitionObj(thirdIdentityResponseOldDTO.identityDocumentsMap);
        let proveFileInfo=cpCommonJs.opinitionObj(thirdIdentityResponseOldDTO.proveDocumentsMap);
        let audioUrl=cpCommonJs.opinitionObj(thirdIdentityResponseOldDTO.audioUrl);
        console.log(store.thirdIdentityResponseOldDTO)
        return (
            <div className="auto-box pr5">
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='proveFileInfo'>
                    证明文件
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                    {
                        Object.keys(proveFileInfo).map((repy,i)=>{
                            if(proveFileInfo[repy]){
                                let fileId=proveFileInfo[repy];
                                return <li key={i}>
                                            <b className="left file-tit" title={commonJs.is_obj_exist(repy)}>{commonJs.is_obj_exist(repy)}</b>
                                            <a id={'proveFileInfo'+i} onClick={store.openPage.bind(this,proveFileInfo[repy])} className="left file-link blue-font">
                                            查看
                                            </a>
                                        </li>
                            }
                            
                        })
                    }
                    {
                        Object.keys(audioUrl).map((repy,i)=>{
                            if(audioUrl[repy]){
                                let _url=audioUrl[repy];
                                return <li key={i}>
                                            <b className="left file-tit" title={commonJs.is_obj_exist(repy)}>{commonJs.is_obj_exist(repy)}</b>
                                            <a target="bank" href={_url} id={'proveFileInfo2'+i} className="left file-link blue-font">
                                            查看
                                            </a>
                                        </li>
                            }
                            
                        })
                    }
                    </ul>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='identityCardFile'>
                    身份证文件
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                    {
                        Object.keys(identityCardFileInfo).map((repy,i)=>{
                            if(identityCardFileInfo[repy]){
                                return <li key={i}>
                                            <b className="left file-tit" title={commonJs.is_obj_exist(repy)}>{commonJs.is_obj_exist(repy)}</b>
                                            <a id={'identityCardFileInfo'+i} onClick={store.openPage.bind(this,identityCardFileInfo[repy])} className="left file-link blue-font">
                                                查看
                                            </a>
                                        </li>
                            }
                        })
                    }
                    </ul>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='loanFileTit'>
                    合同文件
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        {
                            (loanStatus&&loanStatus=="paid_off")?
                            <a id='loanFile' href={"/node/file/settle/proof?isDown=YES&productNo="+store.cooperationFlag+"&loanNumber="+store.loanNo+"&phone="+(thirdIdentityResponseOldDTO.personMap?thirdIdentityResponseOldDTO.personMap['联系电话']:"")} className="right file-link blue-font mr10">
                                结清
                            </a>:""
                        }
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                    {
                        Object.keys(pactFileInfo).map((repy,i)=>{
                            if(pactFileInfo[repy]){
                                return <li key={i}>
                                            <b className="left file-tit" title={commonJs.is_obj_exist(repy)}>{commonJs.is_obj_exist(repy)}</b>
                                            <a id={'pactFileInfo'+i} onClick={store.openPage.bind(this,repy)} className="left file-link blue-font">
                                                查看
                                            </a>
                                        </li>
                            }
                        })
                    }
                    </ul>
                </div>
            </div>
        );
    }
};
export default FileThird;