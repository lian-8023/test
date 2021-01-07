// 回访放款
import React from 'react';
import $ from 'jquery';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;

class Avisit extends React.Component {
    
    render() {
        return (
            <div  className="content" id="content">
                <div className="bar return-visit-condition clearfix pb5">
                    <dl className="left mt10">
                        <dt>回访类型</dt>
                        <dd>
                            <select className="select-gray avisitType" id='avisitTypePage' onChange={cpCommonJs.avisitTypeFn.bind(this)}>
                                <option value="/avisit" hidden>请选择</option>
                                <option value="/avisitLoan">放款</option>
                                <option value="/avisitRepayment">还款</option>
                                <option value="/avisitNotRepayment">未还款</option>
                                <option value="/specialAvist">特殊回访</option>
                            </select>
                        </dd>
                    </dl>
                </div>
            </div>
        );
    }
};

export default Avisit;