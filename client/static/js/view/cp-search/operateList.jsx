//操作记录  cp-portal 小雨花
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;

import OperateListTemp from  '../../template/operateList';  //小雨花 订单审核 操作记录数据模板
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction} from "mobx";

@inject('allStore') @observer
class OperateList extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;
        this.commonStore=this.props.allStore.CommonStore; 
    }
    render() {
        let XYH_IdentityInfo=this.userinfoStore.XYH_IdentityInfo;
        let search_recordInfoDTOS=this.commonStore.search_recordInfoDTOS;
        let recordInfoDTOS=[],userOperateHistoryList=[],operationHisAll=[],modifyInfos=[];
        let tempType=this.props.tempType; //标示 template 模板
        let tempData=cpCommonJs.opinitionObj(OperateListTemp[tempType]);
        let checkData=cpCommonJs.opinitionObj(this.commonStore.checkData);
        if(tempType=='checkQueue'){
            userOperateHistoryList=cpCommonJs.opinitionArray(XYH_IdentityInfo.userOperateHistoryList);  //用户操作记录
            recordInfoDTOS=cpCommonJs.opinitionArray(search_recordInfoDTOS);  //审核记录
        }else if(tempType=='businessCheck'){
            let merchantExamineInfo=cpCommonJs.opinitionObj(checkData.merchantExamineInfo);
            operationHisAll=cpCommonJs.opinitionObj(merchantExamineInfo.operationHisAll); 
            modifyInfos=cpCommonJs.opinitionArray(operationHisAll.modifyInfos); //变更内容
            userOperateHistoryList=cpCommonJs.opinitionArray(operationHisAll.operationInfos);  //用户操作记录
            recordInfoDTOS=cpCommonJs.opinitionArray(checkData.recordInfos);  //审核记录
        }else if(tempType=='shopcheck'){
            let shopExamineInfo=cpCommonJs.opinitionObj(checkData.shopExamineInfo);
            modifyInfos=cpCommonJs.opinitionArray(shopExamineInfo.modifyRecords); //变更内容
            userOperateHistoryList=cpCommonJs.opinitionArray(shopExamineInfo.operationRecords);  //用户操作记录
            recordInfoDTOS=cpCommonJs.opinitionArray(checkData.checkRecords);  //审核记录
        }
        return (
            <div className="auto-box pr5 relative">
                <div className="toggle-box" data-btn-rule="">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={commonJs.content_toggle.bind(this)}>
                    审核记录
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <div className='bar mt3'>
                        <table className="pt-table commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                            <thead>
                                <tr>
                                    <th width="10%">序号</th>
                                {
                                    tempData.checkTableData?tempData.checkTableData.map((repy,i)=>{
                                        return <th key={i} width={repy.width}>{repy.title}</th>
                                    }):<th></th>
                                }
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    recordInfoDTOS.length>0 ? recordInfoDTOS.map((repy,index)=>{
                                    let content='';
                                    if(tempType=='checkQueue'){
                                        content='caseContent'
                                    }else{
                                        content='content';
                                    }
                                    return <tr key={index}>
                                        <td colSpan="6" className="no-padding-left">
                                            <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                <tbody>
                                                    <tr>
                                                        <td width="10%" title={index}>{index}</td>
                                                        {
                                                            tempData.checkTableData?tempData.checkTableData.map((rsp,j)=>{
                                                                return <td key={j} width={rsp.width} title={commonJs.is_obj_exist(repy[rsp.key])}>{commonJs.is_obj_exist(repy[rsp.key])}</td>
                                                            }):<tr><td></td></tr>
                                                        }
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="5" className="short-border-td">
                                                            <div className="short-border"></div>
                                                            {
                                    console.log('repy:',recordInfoDTOS)}
                                                            <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(repy[content])}>{commonJs.is_obj_exist(repy[content])}</p>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                            </tbody>
                        </table>
                    </div>

                    <div className="toggle-box mt5" data-btn-rule="">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={commonJs.content_toggle.bind(this)}>
                        用户操作记录
                            <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                        </h2>
                        <div className='bar mt3'>
                            <table className="pt-table commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                <tbody>
                                    {
                                    userOperateHistoryList.length>0 ? userOperateHistoryList.map((repy,index)=>{
                                        return <tr key={index}>
                                            <td className="no-padding-left">
                                                <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                    <tbody>
                                                        <tr>
                                                            <td width="5%">{index}</td>
                                                            {
                                                                tempData.oprateTableData.map((rsp,j)=>{
                                                                    return <td key={j} width={rsp.width} title={commonJs.is_obj_exist(repy[rsp.key])}>{commonJs.is_obj_exist(repy[rsp.key])}</td>
                                                                })
                                                            }
                                                        </tr>
                                                        {
                                                            tempType=='checkQueue'?
                                                            <tr>
                                                                <td colSpan="3" className="short-border-td">
                                                                    <div className="short-border"></div>
                                                                    <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(repy[tempData.oprateTableData.operateRemark])}>{commonJs.is_obj_exist(repy[tempData.oprateTableData.operateRemark])}</p>
                                                                </td>
                                                            </tr>:<tr style={{display:'none'}}><td colSpan="3" className="gray-tip-font"></td></tr>
                                                        }
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        }):<tr><td className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {
                    tempType!='checkQueue'?
                    <div className="toggle-box mt5" data-btn-rule="">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={commonJs.content_toggle.bind(this)}>
                        变更内容
                            <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                        </h2>
                        <div className='bar mt3'>
                        <table className="pt-table commu-tab bar">
                            <thead>
                                <tr className="th-bg">
                                    <th width='5%'>序号</th>
                                    <th width='15%'>所属模块</th>
                                    <th width='20%'>修改内容</th>
                                    <th width='20%'>变更前</th>
                                    <th width='20%'>变更后</th>
                                    <th width='20%'>变更时间</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                (modifyInfos&&modifyInfos.length>0)?modifyInfos.map((repy,i)=>{
                                    return <tr key={i}>
                                            <td>{i}</td>
                                            <td className='word-break' title={commonJs.is_obj_exist(repy.module)}>{commonJs.is_obj_exist(repy.module)}</td>
                                            <td className='word-break' title={commonJs.is_obj_exist(repy.field)}>{commonJs.is_obj_exist(repy.field)}</td>
                                            <td className='word-break' title={commonJs.is_obj_exist(repy.beforeValue)}>{commonJs.is_obj_exist(repy.beforeValue)}</td>
                                            <td className='word-break' title={commonJs.is_obj_exist(repy.afterValue)}>{commonJs.is_obj_exist(repy.afterValue)}</td>
                                            <td className='word-break' title={commonJs.is_obj_exist(repy.updateTime)}>{commonJs.is_obj_exist(repy.updateTime)}</td>
                                        </tr>
                                }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                                
                            </tbody>
                        </table>
                    </div>
                </div>:''
                }
            </div>
            
    );
    }
};


export default OperateList;