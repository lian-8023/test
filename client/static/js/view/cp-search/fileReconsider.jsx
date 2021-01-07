// 复议资料-小雨花
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";

@inject('allStore') @observer
class FileReconsider extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;
    }
    render() {
        let store=this.props.allStore.UserinfoStore;
        let XYH_IdentityInfo=store.XYH_IdentityInfo;
        let reconsideration=cpCommonJs.opinitionObj(XYH_IdentityInfo.reconsideration);
        let reconsiderationOtherInfoFiles=cpCommonJs.opinitionArray(reconsideration.reconsiderationOtherInfoFiles);  //复议其它资料–文件信息
        let reconsiderationEduProofFile=cpCommonJs.opinitionObj(reconsideration.reconsiderationEduProofFile);  //复议学历凭证  --图片
        let sesameVideoFile=cpCommonJs.opinitionObj(reconsideration.sesameVideoFile);  //芝麻分视 --视频
        let reconsiderationReason=commonJs.is_obj_exist(reconsideration.reconsiderationReason);  //申请复议原因
        return (
            <div className="auto-box pr5">
                <div className="bar pt5">
                    <span className="left mr10 pl20">申请复议原因:</span>
                    <b className="left content-font blue-font">{reconsiderationReason}</b>
                </div>
                {
                    Object.keys(sesameVideoFile).length>0?
                    <div className="toggle-box mt10">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        芝麻分查询视频
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            <li>
                                <b className="left file-tit" title={commonJs.is_obj_exist(sesameVideoFile.fileName)}>{commonJs.is_obj_exist(sesameVideoFile.fileName)}</b>
                                <a target="_bank" id={sesameVideoFile.id} href={`/node/view/file?fileId=${sesameVideoFile.id}&filename=${sesameVideoFile.fileName}`} className="left file-link blue-font">查看</a>
                            </li>
                        </ul>
                    </div>:''
                }
                {
                    Object.keys(reconsiderationEduProofFile).length>0?
                    <div className="toggle-box mt10">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        复议学历凭证
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            <li>
                                <b className="left file-tit" title={commonJs.is_obj_exist(reconsiderationEduProofFile.fileName)}>{commonJs.is_obj_exist(reconsiderationEduProofFile.fileName)}</b>
                                <a target="_bank" id={reconsiderationEduProofFile.id} href={`/node/view/file?fileId=${reconsiderationEduProofFile.id}&filename=${reconsiderationEduProofFile.fileName}`} className="left file-link blue-font">查看</a>
                            </li>
                        </ul>
                    </div>:''
                }
                {
                    reconsiderationOtherInfoFiles.length>0?
                    <div className="toggle-box mt10">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        复议其它资料
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        <ul className="file-list bar mt5 pl20 hidden">
                            {
                                reconsiderationOtherInfoFiles.map((repy,i)=>{
                                    return <li key={i}>
                                                <b className="left file-tit">{commonJs.is_obj_exist(repy.fileName)}</b>
                                                <a target="_bank" id={repy.id} href={`/node/view/file?fileId=${repy.id}&filename=${repy.fileName}`} className="left file-link blue-font">查看</a>
                                            </li>
                                })
                            }
                        </ul>
                    </div>
                    :''
                }
            </div>
        );
    }
};
export default FileReconsider;