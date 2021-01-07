//29A 增加还款信息表现
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

@inject('allStore') @observer
class RepaymentMsg29A extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;
    }
    render() {
        let previousRepaymentResponseDTO=this.userinfoStore.previousRepaymentResponseDTO;
        let bills=cpCommonJs.opinitionArray(previousRepaymentResponseDTO.bills);  //历史还款数据详细
        let order=cpCommonJs.opinitionObj(previousRepaymentResponseDTO.order);  //
        return (
            <div className="aa">
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        历史借款数据
                        <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                    </h2>
                    <ul className="cp-info-ul pr20 bar mt3"> 
                        <li>
                            <p className="msg-tit">ID</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(order.id)}>{commonJs.is_obj_exist(order.id)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">借款金额</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(order.loanAmount)}>{commonJs.is_obj_exist(order.loanAmount)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">借款期数</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(order.loanInstallments)}>{commonJs.is_obj_exist(order.loanInstallments)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">借款状态</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(order.loanStatus)}>{commonJs.is_obj_exist(order.loanStatus)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">借款时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(order.loanTime)}>{commonJs.is_obj_exist(order.loanTime)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">订单号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(order.orderNumber)}>{commonJs.is_obj_exist(order.orderNumber)}</b>
                        </li>
                    </ul>
                </div>
                {/* 历史还款数据详细 */}
                <div className="repaymentHistory toggle-box m120">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                        历史还款数据
                        <i className="right bar-tit-toggle bar-tit-toggle-dowm"></i>
                    </h2>
                    <table className="pt-table layout-fixed mt3 hidden">
                        <tbody>
                            <tr>
                                <th>ID</th>
                                <th>即科现金贷ID</th>
                                <th>当期期数</th>
                                <th>当期还款日</th>
                                <th>当期应还金额</th>
                                <th>真实逾期天数</th>
                            </tr>
                            {
                                (bills&&bills.length>0)?bills.map((repy,i)=>{
                                    return <tr key={i}>
                                        <td title={commonJs.is_obj_exist(repy.id)}>{commonJs.is_obj_exist(repy.id)}</td>
                                        <td title={commonJs.is_obj_exist(repy.loanHistoryOrderId)}>{commonJs.is_obj_exist(repy.loanHistoryOrderId)}</td>
                                        <td title={commonJs.is_obj_exist(repy.installmentNo)}>{commonJs.is_obj_exist(repy.installmentNo)}</td>
                                        <td title={commonJs.is_obj_exist(repy.dueDate)}>{commonJs.is_obj_exist(repy.dueDate)}</td>
                                        <td title={commonJs.is_obj_exist(repy.dueAmount)}>{commonJs.is_obj_exist(repy.dueAmount)}</td>
                                        <td title={commonJs.is_obj_exist(repy.overdueDays)}>{commonJs.is_obj_exist(repy.overdueDays)}</td>
                                    </tr>
                                }):<tr className="gray-tip-font"><td colSpan='6'>暂未查到数据...</td></tr>
                            }
                            
                        </tbody>
                    </table>
                </div>
            </div>
    );
    }
};


export default RepaymentMsg29A;