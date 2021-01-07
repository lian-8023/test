// 产品方案信息--小雨花
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";

@inject('allStore') @observer
class ProductCaseInfo extends React.Component {
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore; 
    }
    render() {
        let checkData=cpCommonJs.opinitionObj(this.commonStore.checkData);
        let merchantExamineInfo=cpCommonJs.opinitionObj(checkData.merchantExamineInfo);
        let installmentConfigInfo=cpCommonJs.opinitionObj(merchantExamineInfo.installmentConfigInfo);
        let loanRate=cpCommonJs.opinitionArray(installmentConfigInfo.loanRate);
        let repaymentMethod=commonJs.is_obj_exist(installmentConfigInfo.repaymentMethod);
        let repaymentMethodDesc=commonJs.is_obj_exist(installmentConfigInfo.repaymentMethodDesc);
        let tableNo=0;
        if(repaymentMethod=='AVG_CAPITAL_INTEREST'){
            tableNo=1
        }else if(repaymentMethod=='DISCOUNT_INTEREST'){
            tableNo=2
        }else if(repaymentMethod=='X_Y'){
            tableNo=3
        }
        let _tem=[
            {keyWord:'installmentConfigName',des:'方案名称'},
            {keyWord:'installmentConfigNo',des:'产品方案ID'},
            {keyWord:'repaymentMethodDesc',des:'还款方式'},
            {keyWord:'minPerLoanAmount',des:'单笔订单贷款最小限额（元）'},
            {keyWord:'maxPerLoanAmount',des:'单笔订单贷款最大限额（元）'},
            {keyWord:'refundHesitateDay',des:'退货犹豫期(天)'},
            {keyWord:'interestFreeDay',des:'免息期(天)'},
            {keyWord:'overdueRate',des:'罚息费率(%)'},
            {keyWord:'advanceRepaymentRate',des:'提前还款费率(%)'},
            {keyWord:'confirmMakeLoans',des:'是否需要确认放款',cell:function(keyword){
                switch(keyword){
                    case true:
                        return '是';
                    case false:
                        return '否';
                }
            }},
            {keyWord:'rateLevelDesc',des:'利率水平描述'},
            {keyWord:'undertakeLevelDesc',des:'兜底强弱'},
        ]
        return (
            <div className="auto-box pr5 relative">
                <div className="toggle-box" data-btn-rule="">
                    <ul className="cp-info-ul bar pb20 pr20 mt3"> 
                        {
                            _tem.map((repy,i)=>{
                                let keyWord=repy.keyWord;
                                let _val=installmentConfigInfo[keyWord];
                                let _cell=repy.cell;
                                if(_cell){
                                    _val=repy.cell(_val);
                                }
                                return <li key={i}>
                                            <p className="msg-tit">{repy.des}</p>
                                            <b className="msg-cont" title={commonJs.is_obj_exist(_val)}>{commonJs.is_obj_exist(_val)}</b>
                                        </li>
                            })
                        }
                        <li className="height-auto" style={{width:"100%"}}>
                            <p className="msg-tit">借款费率：</p>
                            <b className="msg-cont" style={{width:"100%"}}>
                                {
                                    tableNo==1?
                                    <table className="pt-table boder-table bar mt3 mr5 left" style={{width:"20%"}}>
                                        <tbody>
                                            <tr>
                                                <th>期数</th>
                                                <th>APR</th>
                                            </tr>
                                            {
                                                loanRate.map((repy,i)=>{
                                                    return <tr key={i}>
                                                                <td>{commonJs.is_obj_exist(repy.period)}</td>
                                                                <td>{commonJs.is_obj_exist(repy.apr)}%</td>
                                                            </tr>
                                                })
                                            }
                                        </tbody>
                                    </table>:''
                                }
                                {
                                    tableNo==2? 
                                    <table className="pt-table boder-table bar mt3 mr5 left" style={{width:"30%"}}>
                                        <tbody>
                                            <tr>
                                                <th>期数</th>
                                                <th>贴息费率</th>
                                            </tr>
                                            {
                                                loanRate.map((repy,i)=>{
                                                    return <tr key={i}>
                                                                <td>{commonJs.is_obj_exist(repy.period)}</td>
                                                                <td>{commonJs.is_obj_exist(repy.apr)}%</td>
                                                            </tr>
                                                })
                                            }
                                        </tbody>
                                    </table>:''
                                }
                                {
                                    tableNo==3? 
                                    <table className="pt-table boder-table bar mt3 left" style={{width:"40%"}}>
                                        <tbody>
                                            <tr>
                                                <th>期数（X+Y）</th>
                                                <th>月利率（X）</th>
                                                <th>APR（Y）</th>
                                            </tr>
                                            {
                                                loanRate.map((repy,i)=>{
                                                    return <tr key={i}>
                                                                <td>{commonJs.is_obj_exist(repy.period)}</td>
                                                                <td>{commonJs.is_obj_exist(repy.xrate)}%</td>
                                                                <td>{commonJs.is_obj_exist(repy.apr)}%</td>
                                                            </tr>
                                                })
                                            }
                                        </tbody>
                                    </table>:''
                                }
                                
                            </b>
                        </li>
                        <li>
                        </li>
                    </ul>
                </div>
            </div>
    );
    }
};


export default ProductCaseInfo;