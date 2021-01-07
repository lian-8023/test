
//商品信息 || 套餐信息  cp-portal 小雨花
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";

@inject('allStore') @observer
class GoodsInfo extends React.Component {
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore; 
    }
    render() {
        let checkData=cpCommonJs.opinitionObj(this.commonStore.checkData);
        let merchantExamineInfo=cpCommonJs.opinitionObj(checkData.merchantExamineInfo);
        let goodsOrGood3CInfoList=cpCommonJs.opinitionArray(merchantExamineInfo.goodsOrGood3CInfoList);
        let currentStages=this.commonStore.currentStages;  //商户审核页面 分期信息栏当前选中项  teach 教育分期 || operator 运营商3C分期
        return (
            <div className="auto-box">
            {
                (currentStages=='operator' || currentStages=='hairdressing')?
                <table className="pt-table commu-tab bar">
                    <thead>
                        <tr className="th-bg">
                            <th width='10%'>合约编号</th>
                            <th width='20%'>套餐名称</th>
                            <th width='10%'>所属运营商</th>
                            <th width='20%'>套餐资费</th>
                            <th width='10%'>返费比例</th>
                            <th width='10%'>合约期</th>
                            <th width='10%'>贷款金额</th>
                            <th width='10%'>每月还款额</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        (goodsOrGood3CInfoList&&goodsOrGood3CInfoList.length>0)?goodsOrGood3CInfoList.map((repy,i)=>{
                            let goods3Cmodels=cpCommonJs.opinitionArray(repy.goods3Cmodels);  //合约期明细（套餐相关）
                            return <tr key={i}>
                                    <td title={commonJs.is_obj_exist(repy.contractNo)} className='break-all'>{commonJs.is_obj_exist(repy.contractNo)}</td>
                                    <td title={commonJs.is_obj_exist(repy.mealName)} className='break-all'>{commonJs.is_obj_exist(repy.mealName)}</td>
                                    <td title={commonJs.is_obj_exist(repy.operator)} className='break-all'>{commonJs.is_obj_exist(repy.operator)}</td>
                                    <td title={commonJs.is_obj_exist(repy.mealPrice)} className='break-all'>{commonJs.is_obj_exist(repy.mealPrice)}</td>
                                    <td title={commonJs.is_obj_exist(repy.returnFee)} className='break-all'>{commonJs.is_obj_exist(repy.returnFee)}</td>
                                    <td title={commonJs.is_obj_exist(repy.address)} colSpan='3'>
                                        <table width='100%'>
                                            <tbody>
                                            {
                                                goods3Cmodels.map((repy,i)=>{
                                                    return <tr key={i}>
                                                                <td width='30%' className='break-all'>{commonJs.is_obj_exist(repy.contractPeriod)}</td>
                                                                <td width='30%' style={{paddingLeft:'20px'}} className='break-all'>{commonJs.is_obj_exist(repy.loanApplyAmount)}</td>
                                                                <td width='40%' style={{paddingLeft:'20px'}} className='break-all'>{commonJs.is_obj_exist(repy.monthlyPayment)}</td>
                                                            </tr>
                                                })
                                            }
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                        }):<tr><td colSpan="6" className="gray-tip-font">暂未查到相关数据...</td></tr>
                    }
                    </tbody>
                </table>
                :
                <table className="pt-table commu-tab bar">
                    <thead>
                        <tr className="th-bg">
                            <th width='10%'>序号</th>
                            <th width='20%'>商品名称</th>
                            <th width='10%'>品牌</th>
                            <th width='10%'>规格</th>
                            <th width='20%'>价格（元）</th>
                            <th width='30%'>商品描述</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        (goodsOrGood3CInfoList&&goodsOrGood3CInfoList.length>0)?goodsOrGood3CInfoList.map((repy,i)=>{
                            let models=cpCommonJs.opinitionArray(repy.models);  //产品型号（商品相关）
                            return <tr key={i}>
                                    <td>{i}</td>
                                    <td title={commonJs.is_obj_exist(repy.name)} className='break-all'>{commonJs.is_obj_exist(repy.name)}</td>
                                    <td title={commonJs.is_obj_exist(repy.brand)} className='break-all'>{commonJs.is_obj_exist(repy.brand)}</td>
                                    <td colSpan='2'>
                                        <table width='100%'>
                                            <tbody>
                                            {
                                                models.map((repy,i)=>{
                                                    return <tr key={i}>
                                                                <td width='50%' className='break-all'>{commonJs.is_obj_exist(repy.name)}</td>
                                                                <td width='50%' className='break-all'>{commonJs.is_obj_exist(repy.price)}</td>
                                                            </tr>
                                                })
                                            }
                                            </tbody>
                                        </table>
                                    </td>
                                    <td title={commonJs.is_obj_exist(repy.descr)} className='word-break'>{commonJs.is_obj_exist(repy.descr)}</td>
                                </tr>
                        }):<tr><td colSpan="6" className="gray-tip-font">暂未查到相关数据...</td></tr>
                    }
                    </tbody>
                </table>
            }
                
            </div>
            
    );
    }
};


export default GoodsInfo;