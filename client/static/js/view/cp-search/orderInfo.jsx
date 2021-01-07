// 订单信息--小雨花
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction} from "mobx";

@inject('allStore') @observer
class ShopMsgXYH extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;
    }

    render() {
        let XYH_IdentityInfo=this.userinfoStore.XYH_IdentityInfo;
        if(this.props.fromXYHmodal){ //小雨花弹窗（历史文件、历史订单-查看详情）
            XYH_IdentityInfo=this.props.data;
        }
        let goodsInfoList=cpCommonJs.opinitionArray(XYH_IdentityInfo.goodsInfoList);  //商品信息
        let operatorPlanDTO=cpCommonJs.opinitionObj(XYH_IdentityInfo.operatorPlanDTO);  //合约套餐信息
        let loanInfo=cpCommonJs.opinitionObj(XYH_IdentityInfo.loanInfo);  //贷款信息
        let otherInfo=cpCommonJs.opinitionObj(XYH_IdentityInfo.otherInfo);  //其他信息
        let paymentPlanDetailDTOList=cpCommonJs.opinitionArray(XYH_IdentityInfo.paymentPlanDetailDTOList);  //还款计划信息
        return (
            <div className="auto-box pr5 relative">
                <div className="toggle-box mt5" data-btn-rule="">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    贷款信息
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <ul className="cp-info-ul bar pb20 pr20 mt3"> 
                        <li>
                            <p className="msg-tit">场景类型</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.eduTypeDesc)}>{commonJs.is_obj_exist(otherInfo.eduTypeDesc)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">交易场景</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.isOnlineDesc)}>{commonJs.is_obj_exist(otherInfo.isOnlineDesc)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">贷款金额</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.applyAmount)}>{commonJs.is_obj_exist(loanInfo.applyAmount)}</b>
                        </li> 
                        <li>
                            <p className="msg-tit">订单类型</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.businessTypes)}>{commonJs.is_obj_exist(loanInfo.businessTypes)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">年利率</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.apr)}>{commonJs.is_obj_exist(loanInfo.apr)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">还款方式</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.repaymentMethod)}>{commonJs.is_obj_exist(loanInfo.repaymentMethod)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">借贷利率</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanRate)}>{commonJs.is_obj_exist(loanInfo.loanRate)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">每月还款总金额</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(paymentPlanDetailDTOList[0]?paymentPlanDetailDTOList[0].amount:"")}>{commonJs.is_obj_exist(paymentPlanDetailDTOList[0]?paymentPlanDetailDTOList[0].amount:'')}</b>
                        </li>
                        <li>
                            <p className="msg-tit">资料重传次数</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.resubmitCounts)}>{commonJs.is_obj_exist(loanInfo.resubmitCounts)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">首付</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanAprCommision)}>{commonJs.is_obj_exist(loanInfo.loanAprCommision)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">申请点纬度</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.latitude)}>{commonJs.is_obj_exist(loanInfo.latitude)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">申请时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanApplyDate)}>{commonJs.is_obj_exist(loanInfo.loanApplyDate)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">合同编号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanNo)}>{commonJs.is_obj_exist(loanInfo.loanNo)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">申请地点经度</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.longitude)}>{commonJs.is_obj_exist(loanInfo.longitude)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">贷款期数</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.period)}>{commonJs.is_obj_exist(loanInfo.period)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">贷款类型</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.repaymentMethod)}>{commonJs.is_obj_exist(loanInfo.repaymentMethod)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">实际成交金额</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.actualTradeAmount)}>{commonJs.is_obj_exist(loanInfo.actualTradeAmount)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">优惠金额</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.discountAmount)}>{commonJs.is_obj_exist(loanInfo.discountAmount)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">首付金额</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.paymentAmount)}>{commonJs.is_obj_exist(loanInfo.paymentAmount)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">订单来源</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.orderOrigin)}>
                                {commonJs.is_obj_exist(loanInfo.orderOrigin)}
                            </b>
                        </li>
                        <li>
                            <p className="msg-tit">网签成功后跳转url</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.url)}>{commonJs.is_obj_exist(loanInfo.url)}</b>
                        </li>
                    </ul>
                </div>
                <div className="toggle-box mt5" data-btn-rule="">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={commonJs.content_toggle.bind(this)}>
                    商品信息
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <div>
                        <table className="pt-table bar mt3">
                            <tbody>
                                <tr>
                                    <td colSpan="1">商品总金额：¥<span className="goodsAmout">{commonJs.is_obj_exist(loanInfo.goodsTotalAmount)}</span></td>
                                    <td colSpan="2">手续费总金额：¥<span className="goodsAmout">{commonJs.is_obj_exist(loanInfo.feeAmount)}</span></td>
                                    <td colSpan="3">商品IMEI串码：<span className="goodsAmout">{commonJs.is_obj_exist(XYH_IdentityInfo.goodImei)}</span></td>
                                </tr>
                                <tr>
                                    <th>商品名称</th>
                                    <th>品牌</th>
                                    <th>规格型号</th>
                                    <th>数量</th>
                                    <th>价格（元）</th>
                                    <th>项目类别</th>
                                </tr>
                                {
                                    (goodsInfoList && goodsInfoList.length>0)?goodsInfoList.map((repy,i)=>{
                                        return <tr key={i}>
                                            <td>{commonJs.is_obj_exist(repy.goodsName)}</td>
                                            <td>{commonJs.is_obj_exist(repy.brand)}</td>
                                            <td>{commonJs.is_obj_exist(repy.name)}</td>
                                            <td>{commonJs.is_obj_exist(repy.count)}</td>
                                            <td>{commonJs.is_obj_exist(repy.price)}</td>
                                            <td>{commonJs.is_obj_exist(repy.projectCategory)}</td>
                                        </tr>
                                    }):<tr><td colSpan='5' className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                                
                                <tr>
                                    <th colSpan="5">备注：<div className="goodsTopic">{commonJs.is_obj_exist(loanInfo.wishRemarks)}</div></th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div><div className="toggle-box mt5" data-btn-rule="">
                <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={commonJs.content_toggle.bind(this)}>
                合约套餐信息
                    <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                </h2>
                <div>
                    <table className="pt-table bar mt3">
                        <tbody>
                            <tr>
                                <th>套餐名称</th>
                                <th>所属运营商</th>
                                <th>套餐资费</th>
                                <th>合约期</th>
                                <th>返费比例</th>
                                <th>可贷款金额</th>
                            </tr>
                                    <tr>
                                        <td>{commonJs.is_obj_exist(operatorPlanDTO.mealName)}</td>
                                        <td>{commonJs.is_obj_exist(operatorPlanDTO.operator)}</td>
                                        <td>{commonJs.is_obj_exist(operatorPlanDTO.mealPrice)}</td>
                                        <td>{commonJs.is_obj_exist(operatorPlanDTO.contractPeriod)}</td>
                                        <td>{commonJs.is_obj_exist(operatorPlanDTO.returnFee)}</td>
                                        <td>{commonJs.is_obj_exist(operatorPlanDTO.loanApplyAmount)}</td>
                                    </tr>
                            <tr>
                                <th colSpan="6">备注：<div className="goodsTopic">{commonJs.is_obj_exist(loanInfo.wishRemarks)}</div></th>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
                <div className="toggle-box mt5" data-btn-rule="">
                <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={commonJs.content_toggle.bind(this)}>
                还款信息
                    <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                </h2>
                <div>
                    <table className="pt-table bar mt3">
                        <tbody>
                            <tr>
                                <td colSpan="5">首次还款日：<span className="repayDate">{commonJs.is_obj_exist(loanInfo.firstDueDate)}</span></td>
                            </tr>
                            <tr>
                                <th>期数</th>
                                <th>月还款总金额</th>
                                <th>本金</th>
                                <th>利息</th>
                                <th>应还款日</th>
                            </tr>
                            {
                                (paymentPlanDetailDTOList && paymentPlanDetailDTOList.length>0)?paymentPlanDetailDTOList.map((repy,i)=>{
                                    return <tr key={i}>
                                        <td>{commonJs.is_obj_exist(repy.installmentNumber)}</td>
                                        <td>{commonJs.is_obj_exist(repy.amount)}</td>
                                        <td>{commonJs.is_obj_exist(repy.principal)}</td>
                                        <td>{commonJs.is_obj_exist(repy.revealLnterest)}</td>
                                        <td>{commonJs.is_obj_exist(repy.dueDate)}</td>
                                    </tr>
                                }):<tr><td colSpan='5' className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
    }
};


export default ShopMsgXYH;