
//门店信息  cp-portal 小雨花
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";

@inject('allStore') @observer
class ShopBaseInfo extends React.Component {
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore; 
    }
    render() {
        let checkData=cpCommonJs.opinitionObj(this.commonStore.checkData);
        let merchantInfo=cpCommonJs.opinitionObj(checkData.merchantInfo);
        let merchantExamineInfo=cpCommonJs.opinitionObj(checkData.merchantExamineInfo);
        let shopBaseInfoList=cpCommonJs.opinitionArray(merchantExamineInfo.shopBaseInfoList);
        return (
            <div className="auto-box">
                <table className="pt-table commu-tab bar">
                    <thead>
                        <tr className="th-bg">
                            <th width='5%'>序号</th>
                            <th width='15%'>门店名称</th>
                            <th width='10%'>门店简称</th>
                            <th width='20%'>营业执照号</th>
                            <th width='30%'>门店地址</th>
                            <th width='10%'>门店状态</th>
                            <th width='10%'>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        (shopBaseInfoList&&shopBaseInfoList.length>0)?shopBaseInfoList.map((repy,i)=>{
                            let status=commonJs.is_obj_exist(repy.status);
                            let dom='';
                            if(status=='OPERATION_PENDING'){  //运营审核中 不跳转 查看详情取消掉
                                dom='';
                            }else if(status=='OFFLINE_PENDING'){  //线下审核中  跳转至 小雨花线下门店审核
                                dom=<a target='_bland' href={`/cp-portal#/offlineShopCheck/0?storeName=${repy.name}&businessType=${commonJs.is_obj_exist(merchantInfo.businessType)}`} id={'check'+i}>查看详情</a>
                            }else{  //其余的  跳转 至门店审核
                                dom=<a target='_bland' href={`/cp-portal#/XYH_shopCheck/1?storeName=${repy.name}&businessType=${commonJs.is_obj_exist(merchantInfo.businessType)}`} id={'check'+i}>查看详情</a>
                            }
                            return <tr key={i}>
                                    <td>{i}</td>
                                    <td className='word-break' title={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.name)}</td>
                                    <td className='word-break' title={commonJs.is_obj_exist(repy.shortName)}>{commonJs.is_obj_exist(repy.shortName)}</td>
                                    <td className='word-break' title={commonJs.is_obj_exist(repy.licenseNo)}>{commonJs.is_obj_exist(repy.licenseNo)}</td>
                                    <td className='word-break' style={{'lineHeight':'20px'}} title={commonJs.is_obj_exist(repy.address)}>{commonJs.is_obj_exist(repy.address)}</td>
                                    <td className='word-break' title={commonJs.is_obj_exist(repy.statusDesc)}>{commonJs.is_obj_exist(repy.statusDesc)}</td>
                                    <td>
                                        {dom}
                                    </td>
                                </tr>
                        }):<tr><td colSpan="7" className="gray-tip-font">暂未查到相关数据...</td></tr>
                    }
                    </tbody>
                </table>
            </div>
            
    );
    }
};


export default ShopBaseInfo;