// 附件-供应链
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";

@inject('allStore') @observer
class FileGYL extends React.Component {
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
        let idCardInfos = identityCardFileInfo.idCardInfos;
        let elsePicInfos = identityCardFileInfo.elsePicInfos;
        console.log(identityCardFileInfo);
        return (
            <div className="auto-box pr5">
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='identityCardFile'>
                    身份证图片
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            idCardInfos&&idCardInfos.length>0?idCardInfos.map((repy,i)=>{
                                return <li key={i}>
                                            {repy.fileType&&<b className="left">{commonJs.is_obj_exist(repy.fileType)}</b>}
                                            {repy.fileName&&<b className="left" style={{paddingLeft: '20px'}}>{commonJs.is_obj_exist(repy.fileName)}</b>}
                                            <a  id={'idCardInfos'+i} onClick={()=>{store.openPage(repy.fileId)}} className="left file-link blue-font">
                                                    查看
                                            </a>
                                        </li>
                            }):""
                        }
                    </ul>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)} id='identityCardFile'>
                    其他图片
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="file-list bar mt5 pl20 hidden">
                        {
                            elsePicInfos&&elsePicInfos.length>0?elsePicInfos.map((repy,i)=>{
                                return <li key={i}>
                                            {repy.fileType&&<b className="left">{commonJs.is_obj_exist(repy.fileType)}</b>}
                                            {repy.fileName&&<b style={{paddingLeft: '20px'}} className="left">{commonJs.is_obj_exist(repy.fileName)}</b>}
                                            <a  id={'elsePicInfos'+i} onClick={()=>{store.openPage(repy.fileId)}} className="left file-link blue-font">
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
export default FileGYL;