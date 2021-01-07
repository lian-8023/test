// 借款详情
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import { Modal,Icon } from 'antd';
@inject('allStore') @observer
class LoanDetails extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;
        this.state={
            pageHtmlList:[],
        }
    }
    // 获取用户名
    getAdminMaps (index,loanNumber){
        // loanNumber = 'LOANNUMBER2020062316033C1';
        let _that=this;
        let html =[];
        $.ajax({
            type:"post",
            url:"/node/collection/repayment/plan",
            async:true,
            dataType: "JSON",
            data:{loanNumber:loanNumber},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data.data;
                if(_getData.length>0){
                    for (let i = 0; i < _getData.length; i++) {
                        const ele = _getData[i];
                        html.push(
                            <div key={i} className="map" style={{paddingBottom: '8px',marginBottom:'8px',borderBottom: '1px solid #eee'}}>
                                <p style={{display: 'flex',justifyContent: 'space-between',width: '55%'}}>
                                    <span><font>期数：</font><span>{ele.installmentNumber}</span></span>
                                    <span><font>本金利息总额：</font><span>{ele.amount}</span></span>
                                    <span><font>起息日：</font><span>{ele.interestStartDate}</span></span>
                                </p>
                                <p style={{display: 'flex',justifyContent: 'space-between',width: '55%'}}>
                                    <span><font>还款日：</font><span>{ele.dueDate}</span></span>
                                    <span><font>是否结清：</font><span>{ele.clearanceDate=='1'?'结清':'未结清'}</span></span>
                                    <span><font>结清日：</font><span>{ele.clearanceDate}</span></span>
                                </p>
                                <p style={{display: 'flex',justifyContent: 'space-between',width: '55%'}}>
                                    <span><font>逾期天数：</font><span>{ele.overDays}</span></span>
                                </p>
                            </div>
                        )
                    }
                }else{
                    html = (
                        <div>没有查到数据</div>
                    )
                }
                let pageHtmlList = _that.state.pageHtmlList;
                pageHtmlList[index] = html;
                _that.setState({
                    pageHtmlList:pageHtmlList,
                })
            }
        })
        // return html;
    }
    unfold = (index,e)=>{
        if($('.bar.mt5.list'+index).hasClass('hidden')){
            $('.bar.mt5.list'+index).removeClass('hidden');
            $('.bar-tit-toggle.icon'+index).addClass('bar-tit-toggle-down');
            $('.bar-tit-toggle.icon'+index).removeClass('bar-tit-toggle-up');
            this.getAdminMaps(index,e.loanNumber);
        }else{
            $('.bar.mt5.list'+index).addClass('hidden');
            $('.bar-tit-toggle.icon'+index).addClass('bar-tit-toggle-up');
            $('.bar-tit-toggle.icon'+index).removeClass('bar-tit-toggle-down');
        };
    }
    render() {
        let childrenLoanNumbers = this.userinfoStore.XYH_IdentityInfo.childrenLoanNumbers?this.userinfoStore.XYH_IdentityInfo.childrenLoanNumbers:[];
        let pageHtmlList = this.state.pageHtmlList;
        return (
            <div className="auto-box pr5">
                <ul>
                    {
                        childrenLoanNumbers.map((e,i)=>{
                            return(
                                <li key={i} style={{marginTop: '10px'}} >
                                    <div className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" style={{lineHeight: '28px',fontSize: '13px',padding: '8px'}} onClick={()=>{this.unfold(i,e)}} >
                                        <p><span>合同号：</span>{e.loanNumber}</p>
                                        <p><span>借款金额：{e.approvalAmount}</span><span style={{marginLeft: '30px'}} >放款日：{e.giveFundTime}</span></p>
                                        <i style={{marginTop: '-30px'}} className={"right bar-tit-toggle bar-tit-toggle-up icon"+i}></i>
                                    </div>
                                    <div className={"hidden bar mt5 list"+i} style={{padding: '10px'}} >
                                        {pageHtmlList[i]?pageHtmlList[i]:''}
                                    </div>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        );
    }
};
export default LoanDetails;