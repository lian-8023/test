// lp && approve 右侧还款列表板块
import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class RepaymentList extends React.Component {

    constructor(props){
        super(props);
        this.state={
            PactList:[]
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps.type){
            this.setState({
                accountId:nextProps.accountId,
                loanNumber:nextProps.loanNumber
            },()=>{
                this.getRefoundList();
            })
        }
    }
    // 获取还款列表
    getRefoundList(){
        let _that=this;
        var _accountId=this.state.accountId;
        var _loanNumber=this.state.loanNumber;
        if( (typeof(_accountId)=="undefined" || _accountId=="") || (typeof(_loanNumber)=="undefined"|| _loanNumber=="")){
            return;
        }
        $.ajax({
            type:"get",
            url:"/companySearch/getAmortizations",
            async:true,
            dataType: "JSON",
            data:{
                accountId:_accountId,
                loannumber:_loanNumber
            },
            success:function(res) {
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _getData = res.data;
                _that.setState({
                    PactList:_getData.amortizations
                })
            }
        })
    }
    render() {
        return (
            <div className="toggle-box">
                <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                    还款列表
                    <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                </h2>
                <table className="radius-tab mt5 hidden replay-list" cellPadding={0} cellSpacing={0} frameBorder={0}>
                    <tbody>
                    <tr className="border-bottom">
                        <th>期数</th>
                        <th>设置日期</th>
                        <th>还款日</th>
                        <th>金额</th>
                        <th>本金</th>
                        <th>利息</th>
                    </tr>
                    {
                        (this.state.PactList && this.state.PactList.length>0)?this.state.PactList.map((repy,i)=>{
                            return <tr className="border-bottom" key={i}>
                                        <td>{commonJs.is_obj_exist(repy.installmentNumber)}</td>
                                        <td>{commonJs.is_obj_exist(repy.createdAt)}</td>
                                        <td>{commonJs.is_obj_exist(repy.dueDate)}</td>
                                        <td>{commonJs.is_obj_exist(repy.amount)}</td>
                                        <td>{commonJs.is_obj_exist(repy.principal)}</td>
                                        <td>{commonJs.is_obj_exist(repy.interest)}</td>
                                    </tr>
                            }): <tr><td colSpan="6" className="gray-tip-font">暂未查到相关数据...</td></tr>
                    }
                    </tbody>
                </table>
            </div>
        );
    }
};

export default RepaymentList;
